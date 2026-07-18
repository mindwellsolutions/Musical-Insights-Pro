/**
 * Target Notes System — Type Definitions
 *
 * Types for AI-generated and manually selected target note highlights on the fretboard.
 */

export interface TargetNoteSet {
  id: string;             // e.g. "ai-rec-0"
  label: string;          // e.g. "Lydian Shimmer"
  notes: string[];        // subset of current scale notes, e.g. ["C", "E", "B"]
  rationale: string;      // 2-4 sentence music theory explanation
  moodKeywords: string[]; // e.g. ["ethereal", "floating", "cinematic"]
  theoryBasis: string;    // e.g. "Scale degrees 1, 3, 7 — the tonic triad + leading tone"
  color: string;          // accent color for the card, e.g. "#7F77DD"
  source: 'ai' | 'manual';
}

/** Slim version returned by AI (tokens minimized), enriched client-side */
export interface TargetNoteSetSlim {
  label: string;
  notes: string[];        // note names only, must be valid scale notes
  rationale: string;
  moodKeywords: string[];
  theoryBasis: string;
}

/** AI assistant message attachment */
export interface AITargetNoteRecommendation extends TargetNoteSetSlim {
  id: string;
  color?: string;
}

/** State shape for the active target note highlight */
export interface TargetNoteHighlight {
  notes: string[];
  label: string;
  color: string;
  source: 'ai' | 'manual';
}

/** 5 fixed accent colors for recommendation cards */
export const CARD_COLORS = ['#7F77DD', '#1D9E75', '#EF9F27', '#D4537E', '#4FB3C4'] as const;
