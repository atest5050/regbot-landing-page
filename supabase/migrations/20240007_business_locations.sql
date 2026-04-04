-- Migration: Multi-location support per business.
--
-- Each business can now have multiple locations (different cities, counties, or states).
-- Each location gets its own checklist, completed forms, chat history, health score,
-- and renewal dates — all stored in a single JSONB column on the businesses row.
--
-- BACKWARD COMPATIBLE: existing rows have locations = NULL, which means the app
-- falls back to the existing top-level checklist / completed_forms / chat_history
-- fields exactly as before.
--
-- Shape of each element in the locations array (mirrors BusinessLocation in regbot-types.ts):
-- {
--   id:                  string,          -- unique ID (timestamp-random)
--   name:                string,          -- user-given label, e.g. "Downtown Route"
--   location:            string,          -- "Miami, FL 33101"
--   checklist:           ChecklistItem[], -- same shape as businesses.checklist
--   completedForms:      CompletedFormEntry[] | null,
--   chatHistory:         SavedMessage[] | null,
--   healthScore:         number | null,
--   totalForms:          number | null,
--   completedFormsCount: number | null,
--   lastChecked:         string | null,   -- ISO timestamp
--   notificationPrefs:   NotificationPrefs | null
-- }

ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS locations JSONB DEFAULT NULL;

COMMENT ON COLUMN public.businesses.locations IS
  'Optional array of BusinessLocation objects for multi-location businesses. '
  'NULL = single-location (backward-compatible). '
  'Each element mirrors the top-level checklist/completedForms/chatHistory fields '
  'but scoped to one physical location.';
