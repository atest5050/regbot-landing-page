-- Migration: add business profile extension fields to the businesses table.
-- Adds industry/type, pre-existing flag, and existing permits list.
-- All columns are nullable so existing rows are unaffected.

ALTER TABLE businesses
  ADD COLUMN IF NOT EXISTS business_type      TEXT,
  ADD COLUMN IF NOT EXISTS is_pre_existing    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS existing_permits   TEXT[]  DEFAULT '{}';

COMMENT ON COLUMN businesses.business_type    IS 'Industry/type slug (e.g. food-truck, restaurant, retail)';
COMMENT ON COLUMN businesses.is_pre_existing  IS 'True when added via the "Add Pre-Existing Business" modal rather than created from the AI chat flow';
COMMENT ON COLUMN businesses.existing_permits IS 'Array of formIds the owner indicated this business already holds active permits for';
