-- Add weekly schedule as JSONB to excursions
-- Shape: { "mon": { "enabled": true, "time": "09:00" }, "tue": { ... }, ... }
ALTER TABLE excursions ADD COLUMN IF NOT EXISTS schedule JSONB;
