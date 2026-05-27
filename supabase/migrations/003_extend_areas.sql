-- ============================================================
-- CretanDesk — Extend area types to specific towns/villages
-- Run this AFTER 001_initial_schema.sql if already applied.
-- ============================================================

-- Heraklion towns
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'heraklion_city';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'malia';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'hersonissos';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'gouves';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'anissaras';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'anogia';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'arkadi';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'zaros';

-- Chania towns
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'chania_city';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'kolympari';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'paleochora';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'sfakia';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'sougia';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'georgioupoli';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'vamos';

-- Rethymno towns
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'rethymno_city';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'plakias';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'agia_galini';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'spili';

-- Lasithi towns
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'agios_nikolaos';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'elounda';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'siteia';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'ierapetra';
ALTER TYPE cretan_area ADD VALUE IF NOT EXISTS 'lasithi_plateau';
