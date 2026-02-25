-- Add UPDATE policy to reviews table for upsert support
CREATE POLICY "Allow public update on reviews" ON reviews FOR UPDATE USING (true);
