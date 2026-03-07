
-- Add edited_at and is_deleted columns to messages
ALTER TABLE public.messages ADD COLUMN edited_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.messages ADD COLUMN is_deleted boolean NOT NULL DEFAULT false;

-- Allow senders to update their own messages (for editing)
CREATE POLICY "Senders can update their own messages"
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = sender_id);

-- Allow senders to delete their own messages
CREATE POLICY "Senders can delete their own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid() = sender_id);
