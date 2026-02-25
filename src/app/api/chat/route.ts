import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        if (!prompt) {
            return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
        }

        const pc = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY!,
        });

        const indexName = "review-chatbot";
        const host = process.env.PINECONE_HOST;
        const embedModel = "llama-text-embed-v2";

        const index = pc.index(indexName, host);

        // 1. Embed query with robust handling
        console.log("Embedding chat prompt...");
        const embeddingResponse = await pc.inference.embed({
            model: embedModel,
            inputs: [prompt],
            parameters: { inputType: "query", truncate: "END" }
        });

        let queryVector: number[] = [];
        const embeddings = (embeddingResponse as any).data || embeddingResponse;
        const firstEmb = Array.isArray(embeddings) ? embeddings[0] : embeddings;

        if (Array.isArray(firstEmb)) {
            queryVector = firstEmb;
        } else if (firstEmb && Array.isArray(firstEmb.values)) {
            queryVector = firstEmb.values;
        }

        if (!queryVector || queryVector.length === 0) {
            throw new Error("Could not extract vector from Pinecone embedding response.");
        }

        // 2. Search Pinecone
        console.log(`Querying Pinecone with vector of length ${queryVector.length}...`);
        const queryResponse = await index.query({
            vector: queryVector,
            topK: 3,
            includeMetadata: true,
        });

        console.log(`Pinecone query returned ${queryResponse?.matches?.length || 0} matches.`);

        const results = queryResponse.matches ? queryResponse.matches.map(m => ({
            score: m.score,
            metadata: m.metadata
        })) : [];

        let aiResponse = "죄송합니다. 관련 리뷰를 찾지 못했습니다. 먼저 샘플 데이터 인덱싱을 진행해 주세요.";

        if (results.length > 0) {
            console.log(`First match score: ${results[0].score}`);
            const context = results
                .map((r, i) => `[리뷰 ${i + 1}] 제목: ${r.metadata?.title}\n내용: ${r.metadata?.content}\n평점: ${r.metadata?.rating}점`)
                .join("\n\n");

            const model = new ChatOpenAI({
                openAIApiKey: process.env.OPENAI_API_KEY,
                modelName: "gpt-5-nano",
            });

            const chatPrompt = ChatPromptTemplate.fromMessages([
                ["system", `당신은 친절하고 전문적인 쇼핑 리뷰 분석 AI 어시시턴트인 'ReviewBot'입니다.
제공된 [리뷰 컨텍스트]를 바탕으로 사용자의 질문에 답변하세요.
답변은 반드시 한국어로 작성하며, 컨텍스트에 없는 정보는 아는 척하지 마세요.
답변 시 참조한 구체적인 내용이 있다면 이를 언급하여 신뢰도를 높이세요.

[리뷰 컨텍스트]
{context}`],
                ["human", "{input}"],
            ]);

            const chain = chatPrompt.pipe(model).pipe(new StringOutputParser());

            aiResponse = await chain.invoke({
                context: context,
                input: prompt,
            });
        }

        return NextResponse.json({
            answer: aiResponse,
            results: results
        });
    } catch (error: any) {
        console.error("Chat error:", error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
