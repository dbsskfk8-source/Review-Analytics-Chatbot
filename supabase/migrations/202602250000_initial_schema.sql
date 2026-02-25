-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    rating INTEGER,
    title TEXT,
    content TEXT,
    author TEXT,
    date DATE,
    helpful_votes INTEGER,
    verified_purchase BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow anonymous select
CREATE POLICY "Allow anonymous select" ON reviews
    FOR SELECT
    USING (true);

-- Allow anonymous insert (for ingestion in this sample)
CREATE POLICY "Allow anonymous insert" ON reviews
    FOR INSERT
    WITH CHECK (true);
