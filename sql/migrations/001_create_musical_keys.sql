-- Migration: Create musical_keys table
-- Description: Stores all possible musical keys and their properties
-- Created: 2025-11-05

CREATE TABLE IF NOT EXISTS musical_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE, -- e.g., "C", "C#", "Dm", "F#m"
  root_note TEXT NOT NULL, -- e.g., "C", "C#", "D"
  quality TEXT NOT NULL CHECK (quality IN ('major', 'minor')), -- "major" or "minor"
  scale_degrees INTEGER[], -- Array of semitone intervals from root
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_musical_keys_key_name ON musical_keys(key_name);
CREATE INDEX IF NOT EXISTS idx_musical_keys_root_note ON musical_keys(root_note);
CREATE INDEX IF NOT EXISTS idx_musical_keys_quality ON musical_keys(quality);

-- Add comment to table
COMMENT ON TABLE musical_keys IS 'Stores all 24 musical keys (12 major + 12 minor) with their properties';
COMMENT ON COLUMN musical_keys.key_name IS 'Full key name including quality (e.g., C, Dm, F#m)';
COMMENT ON COLUMN musical_keys.root_note IS 'Root note of the key (e.g., C, C#, D)';
COMMENT ON COLUMN musical_keys.quality IS 'Major or minor quality of the key';
COMMENT ON COLUMN musical_keys.scale_degrees IS 'Array of semitone intervals from root note';

