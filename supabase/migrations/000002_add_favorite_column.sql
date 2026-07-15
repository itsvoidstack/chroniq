-- Add favorite column to user_content
ALTER TABLE public.user_content ADD COLUMN IF NOT EXISTS favorite BOOLEAN DEFAULT false;
