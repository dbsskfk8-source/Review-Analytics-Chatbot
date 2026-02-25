import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

export async function POST() {
    try {
        console.log("Starting debug-enabled ingestion process...");

        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });

        const indexName = "review-chatbot";
        const host = process.env.PINECONE_HOST;

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!
        );

        // 1. Load and Parse CSV
        const csvFilePath = path.join(process.cwd(), "samples", "review.csv");
        let fileContent = fs.readFileSync(csvFilePath, "utf-8");

        if (fileContent.charCodeAt(0) === 0xFEFF) {
            fileContent = fileContent.slice(1);
        }

        const rawRecords = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // 2. Validate Data
        const validatedData = rawRecords.map((r: any, index: number) => {
            const idKey = Object.keys(r).find(k => k.toLowerCase().trim() === 'id') || 'id';
            const idVal = r[idKey];
            const id = parseInt(idVal);

            if (isNaN(id)) return null;

            return {
                id: id,
                rating: parseInt(r.rating) || 0,
                title: r.title || "",
                content: r.content || "",
                author: r.author || "Unknown",
                date: r.date || new Date().toISOString().split('T')[0],
                helpful_votes: parseInt(r.helpful_votes) || 0,
                verified_purchase: String(r.verified_purchase).toLowerCase() === "true",
            };
        }).filter((r: any) => r !== null);

        if (validatedData.length === 0) {
            throw new Error("No valid records found in CSV.");
        }

        // 3. Supabase Ingestion (Upsert)
        console.log("Ingesting into Supabase...");
        const { error: sbError } = await supabase.from("reviews").upsert(validatedData);
        if (sbError) {
            console.error("Supabase Error:", sbError);
            throw new Error(`Supabase Error: ${sbError.message}. Check RLS policies (INSERT and UPDATE are required for upsert).`);
        }

        // 4. Pinecone Ingestion
        const model = "llama-text-embed-v2";
        const index = pc.index(indexName, host);

        const batchSize = 25;
        for (let i = 0; i < validatedData.length; i += batchSize) {
            const batch = validatedData.slice(i, i + batchSize);
            const texts = batch.map((r: any) => `${r.title}\n${r.content}`);

            console.log(`Requesting embeddings for batch ${Math.floor(i / batchSize) + 1}...`);
            const embeddingResponse = await pc.inference.embed({
                model,
                inputs: texts,
                parameters: { inputType: "passage", truncate: "END" }
            });

            // Handle different Pinecone SDK response structures robustly
            let embeddings: any[] = [];
            if (Array.isArray(embeddingResponse)) {
                embeddings = embeddingResponse;
            } else if ((embeddingResponse as any).data && Array.isArray((embeddingResponse as any).data)) {
                embeddings = (embeddingResponse as any).data;
            } else {
                console.error("Unexpected embedding response structure:", embeddingResponse);
                throw new Error("Unexpected embedding response structure from Pinecone.");
            }

            const vectors = batch.map((r: any, idx: number) => {
                const embItem = embeddings[idx];
                if (!embItem) throw new Error(`No embedding for item at index ${idx}`);

                // Support both { values: [] } and [ ] structures
                const values = Array.isArray(embItem) ? embItem : embItem.values;
                if (!Array.isArray(values)) {
                    console.error("Invalid embedding values structure:", embItem);
                    throw new Error(`Invalid values structure at index ${idx}`);
                }

                return {
                    id: `review-${r.id}`,
                    values: values,
                    metadata: {
                        id: r.id,
                        title: r.title,
                        content: r.content,
                        rating: r.rating,
                        author: r.author,
                    },
                };
            });

            // V7 requires { records: vectors }
            await (index as any).upsert({ records: vectors });
            console.log(`Uploaded Pinecone batch ${Math.floor(i / batchSize) + 1}`);
        }

        return NextResponse.json({ success: true, count: validatedData.length });
    } catch (error: any) {
        console.error("Ingestion error:", error);
        return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 });
    }
}
