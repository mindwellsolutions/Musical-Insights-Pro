-- Migration: Seed musical_keys table with all 24 keys
-- Description: Inserts all 12 major and 12 minor keys
-- Created: 2025-11-05

-- Insert all 12 major keys
INSERT INTO musical_keys (key_name, root_note, quality, scale_degrees) VALUES
  ('C', 'C', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('C#', 'C#', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('D', 'D', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('D#', 'D#', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('E', 'E', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('F', 'F', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('F#', 'F#', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('G', 'G', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('G#', 'G#', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('A', 'A', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('A#', 'A#', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11]),
  ('B', 'B', 'major', ARRAY[0, 2, 4, 5, 7, 9, 11])
ON CONFLICT (key_name) DO NOTHING;

-- Insert all 12 minor keys
INSERT INTO musical_keys (key_name, root_note, quality, scale_degrees) VALUES
  ('Cm', 'C', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('C#m', 'C#', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('Dm', 'D', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('D#m', 'D#', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('Em', 'E', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('Fm', 'F', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('F#m', 'F#', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('Gm', 'G', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('G#m', 'G#', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('Am', 'A', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('A#m', 'A#', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10]),
  ('Bm', 'B', 'minor', ARRAY[0, 2, 3, 5, 7, 8, 10])
ON CONFLICT (key_name) DO NOTHING;

