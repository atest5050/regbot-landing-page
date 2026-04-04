-- Migration: add per-business chat history to the businesses table.
-- Stores the serialisable subset of chat messages (id, role, content) as JSONB.
-- Nullable so existing rows are unaffected; NULL means "no saved history".

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS chat_history JSONB DEFAULT NULL;

COMMENT ON COLUMN businesses.chat_history IS
  'Per-business chat message history. Array of {id, role, content} objects. '
  'Restored when the user switches back to this business.';
