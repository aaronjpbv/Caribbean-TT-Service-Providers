-- Add message status column to track message delivery lifecycle
-- Migration: 2026-07-25

-- Add status column with enum type and default value
ALTER TABLE public.messages
ADD COLUMN status text DEFAULT 'sent' NOT NULL;

-- Add check constraint to enforce valid status values
ALTER TABLE public.messages
ADD CONSTRAINT messages_status_check CHECK (status IN ('pending', 'sent', 'read', 'failed'));

-- Create index on conversation_id and created_at for efficient pagination
CREATE INDEX idx_messages_conversation_created 
ON public.messages(conversation_id, created_at DESC);

-- Note: Existing messages will default to 'sent' status.
-- This is safe because they already exist in the database and are effectively "sent".
