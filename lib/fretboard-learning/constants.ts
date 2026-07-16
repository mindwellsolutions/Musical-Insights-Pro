/**
 * Fretboard Learning System - Constants and Data
 * Based on the Fretboard Learning Development Blueprint
 */

// Note Color Map - Consistent colors for each chromatic note
export const NOTE_COLORS: Record<string, string> = {
  'C': '#E74C3C',
  'C#': '#E67E22',
  'Db': '#E67E22',
  'D': '#F1C40F',
  'D#': '#2ECC71',
  'Eb': '#2ECC71',
  'E': '#1ABC9C',
  'F': '#3498DB',
  'F#': '#2980B9',
  'Gb': '#2980B9',
  'G': '#27AE60',
  'G#': '#16A085',
  'Ab': '#16A085',
  'A': '#8E44AD',
  'A#': '#9B59B6',
  'Bb': '#9B59B6',
  'B': '#E91E63',
};

// Chromatic Scale
export const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Natural Notes
export const NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Sharp Notes
export const SHARP_NOTES = ['C#', 'D#', 'F#', 'G#', 'A#'];

// Open Strings (from string 6 to string 1)
export const OPEN_STRINGS = ['E', 'A', 'D', 'G', 'B', 'E'];

// Landmark Frets (frets with dot markers)
export const LANDMARK_FRETS = [0, 3, 5, 7, 9, 12, 15, 17, 19];

// Octave Shapes - string pairs and fret offsets
export const OCTAVE_SHAPES = [
  { id: 1, strings: [6, 4] as [number, number], fretOffset: 2, name: 'Shape 1: 6→4' },
  { id: 2, strings: [6, 3] as [number, number], fretOffset: 3, name: 'Shape 2: 6→3 (crosses B)' },
  { id: 3, strings: [5, 3] as [number, number], fretOffset: 2, name: 'Shape 3: 5→3' },
  { id: 4, strings: [5, 2] as [number, number], fretOffset: 3, name: 'Shape 4: 5→2 (crosses B)' },
  { id: 5, strings: [4, 2] as [number, number], fretOffset: 2, name: 'Shape 5: 4→2' },
];

// Intervals (semitones from root)
export const INTERVALS = {
  'P1': 0,   // Perfect Unison
  'm2': 1,   // Minor 2nd
  'M2': 2,   // Major 2nd
  'm3': 3,   // Minor 3rd
  'M3': 4,   // Major 3rd
  'P4': 5,   // Perfect 4th
  'TT': 6,   // Tritone
  'P5': 7,   // Perfect 5th
  'm6': 8,   // Minor 6th
  'M6': 9,   // Major 6th
  'm7': 10,  // Minor 7th
  'M7': 11,  // Major 7th
  'P8': 12,  // Perfect Octave
};

// Training Method Metadata
export const TRAINING_METHODS = [
  {
    id: 'note-a-day',
    name: 'Note-a-Day',
    slug: 'note-a-day',
    difficulty: 'Beginner',
    effectiveness: 9,
    description: 'Focus on one note at a time across the entire fretboard',
    sessions: '12-day cycle',
  },
  {
    id: 'octave-shapes',
    name: 'Octave Shapes',
    slug: 'octave-shapes',
    difficulty: 'Beginner-Intermediate',
    effectiveness: 8.5,
    description: 'Learn geometric octave patterns across string pairs',
    sessions: 'Ongoing practice',
  },
  {
    id: 'caged-system',
    name: 'CAGED System',
    slug: 'caged-system',
    difficulty: 'Intermediate',
    effectiveness: 8,
    description: 'Map the fretboard using 5 interconnected chord shapes',
    sessions: 'Progressive mastery',
  },
  {
    id: 'fretboard-logic',
    name: 'Fretboard Logic',
    slug: 'fretboard-logic',
    difficulty: 'Intermediate',
    effectiveness: 8,
    description: 'Use landmark notes and intervals to navigate',
    sessions: 'Skill building',
  },
  {
    id: 'quiz-drills',
    name: 'Quiz Drills',
    slug: 'quiz-drills',
    difficulty: 'All Levels',
    effectiveness: 7.5,
    description: 'Active recall with spaced repetition',
    sessions: 'Daily practice',
  },
  {
    id: 'interval-training',
    name: 'Interval Training',
    slug: 'interval-training',
    difficulty: 'Advanced',
    effectiveness: 7,
    description: 'Learn interval shapes and relationships',
    sessions: 'Advanced study',
  },
  {
    id: 'single-string',
    name: 'Single-String Chromatic',
    slug: 'single-string',
    difficulty: 'Beginner',
    effectiveness: 7,
    description: 'Master notes on one string at a time',
    sessions: 'Foundation building',
  },
];

// Difficulty Levels
export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'] as const;
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];

// Note-a-Day Cycle (12 days)
export const NOTE_A_DAY_CYCLE = CHROMATIC_SCALE;

