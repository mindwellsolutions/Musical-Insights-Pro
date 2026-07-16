-- Migration: Create detected_key_history table (optional)
-- Description: Tracks detected keys for analytics and debugging
-- Created: 2025-11-05

CREATE TABLE IF NOT EXISTS detected_key_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_key TEXT NOT NULL, -- The key that was detected (e.g., "C", "Dm")
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1), -- Confidence level (0-1)
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT, -- Optional session identifier for grouping detections
  audio_source TEXT, -- Type of audio source (e.g., "microphone", "system_audio")
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_detected_key_history_key ON detected_key_history(detected_key);
CREATE INDEX IF NOT EXISTS idx_detected_key_history_detected_at ON detected_key_history(detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_detected_key_history_session ON detected_key_history(session_id);
CREATE INDEX IF NOT EXISTS idx_detected_key_history_confidence ON detected_key_history(confidence_score DESC);

-- Add comments
COMMENT ON TABLE detected_key_history IS 'Tracks all detected musical keys for analytics and debugging purposes';
COMMENT ON COLUMN detected_key_history.detected_key IS 'The musical key that was detected';
COMMENT ON COLUMN detected_key_history.confidence_score IS 'Confidence score from 0-1 indicating detection certainty';
COMMENT ON COLUMN detected_key_history.session_id IS 'Session identifier for grouping related detections';
COMMENT ON COLUMN detected_key_history.audio_source IS 'Source of the audio (microphone, system audio, etc.)';

