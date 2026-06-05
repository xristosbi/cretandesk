-- Drop the old CHECK constraint on excursions.category that only allowed 7 parent values.
-- The category column now stores subcategory values (e.g. 'quad_safari', 'daily_cruise').
ALTER TABLE excursions DROP CONSTRAINT IF EXISTS excursions_category_check;
