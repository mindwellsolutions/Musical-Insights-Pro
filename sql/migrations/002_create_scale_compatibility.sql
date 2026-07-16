-- Migration: Create scale_mode_compatibility table
-- Description: Maps musical keys to compatible scales/modes with AI-generated compatibility ratings
-- Created: 2025-11-05

CREATE TABLE IF NOT EXISTS scale_mode_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musical_key_id UUID REFERENCES musical_keys(id) ON DELETE CASCADE,
  scale_mode_name TEXT NOT NULL, -- e.g., "Dorian", "Mixolydian", "Pentatonic Minor"
  root_note TEXT NOT NULL, -- Root note of the scale/mode
  compatibility_rating INTEGER NOT NULL CHECK (compatibility_rating >= 1 AND compatibility_rating <= 10),
  is_primary BOOLEAN DEFAULT FALSE, -- True for the most compatible scale (highest rating)
  chord_tones TEXT[] NOT NULL, -- Array of note names that are chord tones
  guide_tones TEXT[], -- Array of note names (3rd and optionally 7th)
  musical_context TEXT, -- Description of when/how to use this scale
  scale_intervals INTEGER[], -- Array of semitone intervals for this scale
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(musical_key_id, scale_mode_name, root_note)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_scale_compat_musical_key ON scale_mode_compatibility(musical_key_id);
CREATE INDEX IF NOT EXISTS idx_scale_compat_rating ON scale_mode_compatibility(compatibility_rating DESC);
CREATE INDEX IF NOT EXISTS idx_scale_compat_primary ON scale_mode_compatibility(is_primary) WHERE is_primary = TRUE;
CREATE INDEX IF NOT EXISTS idx_scale_compat_scale_name ON scale_mode_compatibility(scale_mode_name);

-- Add comments to table
COMMENT ON TABLE scale_mode_compatibility IS 'Maps musical keys to compatible scales/modes with compatibility ratings (1-10)';
COMMENT ON COLUMN scale_mode_compatibility.musical_key_id IS 'Foreign key reference to musical_keys table';
COMMENT ON COLUMN scale_mode_compatibility.scale_mode_name IS 'Name of the scale or mode (e.g., Dorian, Mixolydian)';
COMMENT ON COLUMN scale_mode_compatibility.compatibility_rating IS 'AI-generated rating from 1-10 indicating how well this scale fits the key';
COMMENT ON COLUMN scale_mode_compatibility.is_primary IS 'True if this is the primary/best scale for this key';
COMMENT ON COLUMN scale_mode_compatibility.chord_tones IS 'Array of notes that are chord tones for this scale in this key';
COMMENT ON COLUMN scale_mode_compatibility.guide_tones IS 'Array of guide tones (typically 3rd and 7th)';
COMMENT ON COLUMN scale_mode_compatibility.musical_context IS 'Description of musical context for using this scale';

