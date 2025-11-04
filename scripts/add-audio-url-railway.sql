-- Add audio_url column to direct_messages table for voice message support
ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Add index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_direct_messages_audio_url ON direct_messages(audio_url) WHERE audio_url IS NOT NULL;
