/**
 * Fretboard Learning System - Type Definitions
 */

import { DifficultyLevel } from './constants';

// Note Highlight Data Structure
export interface NoteHighlight {
  note: string;
  string: number; // 1-6, where 1 = high E
  fret: number; // 0-22
  color: string;
  borderColor?: string | null;
  borderWidth?: number;
  opacity?: number; // 0.0 to 1.0
  pulse?: boolean;
  glow?: boolean;
  label?: string | null; // Override label (e.g., 'P5' instead of note name)
  size?: 'normal' | 'large';
}

// SVG Overlay Shapes
export interface OverlayShape {
  id: string;
  type: 'line' | 'arrow' | 'rectangle' | 'polygon' | 'circle';
  points?: Array<{ x: number; y: number }>;
  color?: string;
  strokeWidth?: number;
  opacity?: number;
  dashed?: boolean;
  animated?: boolean;
}

// Animation Queue Item
export interface Animation {
  id: string;
  type: 'pulse' | 'sweep' | 'cascade' | 'flash' | 'shake' | 'scale';
  targetNotes?: NoteHighlight[];
  duration?: number; // milliseconds
  delay?: number;
}

// Training Method Interface
export interface TrainingMethod {
  id: string;
  name: string;
  slug: string;
  difficulty: string;
  effectiveness: number;
  description: string;
  sessions: string;
}

// User Progress Data
export interface UserProgress {
  methodId: string;
  completedSessions: number;
  totalAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string;
  noteScores: Record<string, number>; // note -> proficiency score (0-5)
  weakNotes: string[];
  totalTimeSpent: number; // minutes
}

// Session Statistics
export interface SessionStats {
  methodId: string;
  startTime: number;
  endTime?: number;
  questionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  hintsUsed: number;
  currentStreak: number;
  longestStreak: number;
  averageResponseTime: number; // milliseconds
  weakNotes: Array<{ note: string; missCount: number }>;
}

// Training Phase
export interface TrainingPhase {
  id: string;
  name: string;
  description: string;
  duration?: number; // seconds
  completed: boolean;
}

// Fretboard Display State
export interface FretboardDisplayState {
  highlightedNotes: NoteHighlight[];
  dimmedNotes: string[];
  hiddenNotes: string[];
  overlayShapes: OverlayShape[];
  animationQueue: Animation[];
  showNoteNames: boolean | 'target';
  activeFrets: [number, number];
  stringHighlight: number | null;
}

// Quiz Question
export interface QuizQuestion {
  id: string;
  type: 'name-to-location' | 'location-to-name';
  targetNote: string;
  targetString?: number;
  targetFret?: number;
  correctAnswer: string | { string: number; fret: number };
  difficulty: DifficultyLevel;
  timeLimit?: number; // seconds
}

// Spaced Repetition Item
export interface SpacedRepetitionItem {
  note: string;
  string: number;
  fret: number;
  proficiencyScore: number; // 0-5
  lastReviewed: number; // timestamp
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
}

// User Preferences
export interface UserPreferences {
  tuning: string;
  fretRange: [number, number];
  leftHandedMode: boolean;
  audioEnabled: boolean;
  volume: number; // 0-100
  showHints: boolean;
  difficulty: DifficultyLevel;
}

// Octave Shape
export interface OctaveShape {
  id: number;
  strings: [number, number];
  fretOffset: number;
  name: string;
  crossesB?: boolean;
}

// CAGED Shape Data
export interface CAGEDShapeData {
  shape: 'C' | 'A' | 'G' | 'E' | 'D';
  rootPositions: Array<{ string: number; fret: number }>;
  chordTones: Array<{ string: number; fret: number; degree: number }>;
  scalePattern: Array<{ string: number; fret: number; degree: number }>;
  fretRange: [number, number];
  color: string;
}

// Feedback Type
export type FeedbackType = 'correct' | 'incorrect' | 'hint' | 'success';

// Feedback Event
export interface FeedbackEvent {
  type: FeedbackType;
  message?: string;
  note?: string;
  position?: { string: number; fret: number };
  correctPosition?: { string: number; fret: number };
  timestamp?: number;
}

