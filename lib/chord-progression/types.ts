/**
 * Type definitions for Chord Progression Builder system
 */

/**
 * AI Scale/Mode Recommendation from GPT
 */
export interface AIScaleModeRecommendation {
  scaleName: string;
  rootNote: string;
  rationale: string;
  compatibilityScore: number;
  genreContext?: string;
}

/**
 * Main verse data structure
 * Each verse represents a song section (Verse 1, Chorus, Bridge, etc.)
 */
export interface VerseData {
  id: string;                           // Unique identifier (UUID)
  name: string;                         // "Verse 1", "Chorus", "Bridge", etc.
  key: string;                          // Root note: "C", "D#", "F#", etc.
  bpm: number;                          // Beats per minute (60-240)
  timeSignature: {
    numerator: number;                  // 4 (in 4/4)
    denominator: number;                // 4 (in 4/4)
  };
  chordProgression: ChordInstance[];    // Array of chord blocks
  scaleModeAssignments: ScaleModeInstance[]; // Scale/mode track data
  aiScaleVisionText?: string;           // User's vision for AI scale recommendations
  aiScaleRecommendations?: AIScaleModeRecommendation[]; // AI-generated scale recommendations
  createdAt: string;                    // ISO timestamp
  updatedAt: string;                    // ISO timestamp
}

/**
 * Individual chord instance in the timeline
 * Represents a single chord block (like a video clip)
 */
export interface ChordInstance {
  id: string;                           // Unique identifier
  chordSymbol: string;                  // "C", "Am7", "Gmaj7", etc.
  chordQuality: ChordQuality;           // "major", "minor7", etc.
  notes: string[];                      // ["C", "E", "G"]
  rootNote: string;                     // "C"
  startTime: number;                    // Start position in beats (0, 4, 8, etc.)
  duration: number;                     // Length in beats (1, 2, 4, 8, etc.)
  position: number;                     // Visual position in pixels (calculated)
  width: number;                        // Visual width in pixels (calculated)
  color: string;                        // Chord color (from NOTE_COLORS)
  voicingIndex: number;                 // Selected voicing (0-n)
}

/**
 * Scale/mode assignment for a chord
 * Links a scale/mode to a specific chord in the progression
 */
export interface ScaleModeInstance {
  id: string;                           // Unique identifier
  chordId: string;                      // Reference to ChordInstance.id
  scaleName: string;                    // "Dorian", "Mixolydian", etc.
  rootNote: string;                     // "D", "G", etc.
  compatibilityScore: number;           // 1-10 rating
  startTime: number;                    // Same as linked chord
  duration: number;                     // Same as linked chord
  position: number;                     // Visual position
  width: number;                        // Visual width
}

/**
 * Generated chord progression from genre database or AI
 */
export interface GeneratedProgression {
  id: string;
  name: string;                         // "I-V-vi-IV", "Jazz ii-V-I", etc.
  description: string;                  // "Pop progression (Axis progression)"
  chords: string[];                     // ["C", "G", "Am", "F"]
  romanNumerals: string[];              // ["I", "V", "vi", "IV"]
  genre: string[];                      // ["Pop", "Rock", "Indie"]
  difficulty: number;                   // 1-5
  musicalCharacter?: string;            // "Uplifting, optimistic"
  famousSongs?: string[];               // ["Let It Be", "Don't Stop Believin'"]
  scaleRecommendations?: Record<string, ScaleRecommendation[]>;
  rationale?: string;                   // AI-generated explanation
}

/**
 * Scale recommendation for a chord
 */
export interface ScaleRecommendation {
  scaleName: string;
  compatibilityScore: number;
  usage: string;
}

/**
 * Chord quality types
 * IMPORTANT: These must match the quality names expected by getChordTones() in musicTheory.ts
 */
export type ChordQuality =
  | 'maj' | 'min' | 'dim' | 'aug'
  | 'maj7' | 'min7' | 'dom7' | 'dim7' | 'min7b5'
  | 'maj9' | 'min9' | 'dom9'
  | 'maj11' | 'min11' | 'dom11'
  | 'maj13' | 'min13' | 'dom13'
  | 'sus2' | 'sus4' | '6' | 'min6' | 'add9' | 'minadd9';

/**
 * Timeline playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;                  // Current position in beats
  playbackPosition: number;             // Visual position in pixels
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
}

/**
 * Instrument types for Tone.js and smplr
 */
export type InstrumentType = 'piano' | 'guitar' | 'strings' | 'brass' | 'synth';

/**
 * Chord playback options
 */
export interface ChordPlaybackOptions {
  velocity?: number;      // 0-127, affects volume and timbre
  duration?: number;      // Duration in beats
  time?: number;          // Scheduled time in seconds
  detune?: number;        // Pitch adjustment in cents
}

/**
 * Timeline zoom level
 */
export interface ZoomLevel {
  pixelsPerBeat: number;                // 20, 40, 60, 80, 100
  label: string;                        // "25%", "50%", "100%", "150%", "200%"
}

/**
 * Drag operation state
 */
export interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize-left' | 'resize-right' | 'resize-left-push' | 'resize-right-push' | null;
  chordId: string | null;
  startX: number;
  startTime: number;
  startDuration: number;
}

/**
 * User saved chord progression (for Supabase)
 */
export interface UserChordProgression {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  verses: VerseData[];
  tags?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Genre progression database structure
 */
export interface GenreProgressionDatabase {
  version: string;
  lastUpdated: string;
  genres: Record<string, GenreData>;
}

export interface GenreData {
  description: string;
  progressions: GeneratedProgression[];
}

