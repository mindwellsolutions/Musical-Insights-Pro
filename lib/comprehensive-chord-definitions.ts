/**
 * Comprehensive Chord Quality Definitions
 * Complete music theory accurate definitions for all chord types
 */

export interface ChordQualityDefinition {
  quality: string;
  displayName: string;
  suffix: string;
  category: 'Triads' | '7th Chords' | 'Extended' | 'Altered' | 'Suspended' | 'Add';
  intervals: number[]; // Semitones from root
  description: string;
}

export const COMPREHENSIVE_CHORD_QUALITIES: ChordQualityDefinition[] = [
  // ===== TRIADS =====
  {
    quality: 'major',
    displayName: 'Major',
    suffix: '',
    category: 'Triads',
    intervals: [0, 4, 7],
    description: 'Bright, happy, and stable. The foundation of Western harmony.',
  },
  {
    quality: 'minor',
    displayName: 'Minor',
    suffix: 'm',
    category: 'Triads',
    intervals: [0, 3, 7],
    description: 'Melancholic, introspective, and emotionally rich.',
  },
  {
    quality: 'diminished',
    displayName: 'Diminished',
    suffix: 'dim',
    category: 'Triads',
    intervals: [0, 3, 6],
    description: 'Tense, unstable, and mysterious. Creates strong pull to resolution.',
  },
  {
    quality: 'augmented',
    displayName: 'Augmented',
    suffix: 'aug',
    category: 'Triads',
    intervals: [0, 4, 8],
    description: 'Dreamy, floating, and ambiguous. Evokes uncertainty and wonder.',
  },

  // ===== 7TH CHORDS =====
  {
    quality: 'major7',
    displayName: 'Major 7',
    suffix: 'maj7',
    category: '7th Chords',
    intervals: [0, 4, 7, 11],
    description: 'Lush, sophisticated, and jazzy. Warm with a touch of elegance.',
  },
  {
    quality: 'minor7',
    displayName: 'Minor 7',
    suffix: 'm7',
    category: '7th Chords',
    intervals: [0, 3, 7, 10],
    description: 'Smooth, mellow, and contemplative. Perfect for jazz and soul.',
  },
  {
    quality: 'dominant7',
    displayName: 'Dominant 7',
    suffix: '7',
    category: '7th Chords',
    intervals: [0, 4, 7, 10],
    description: 'Bluesy, driving, and resolute. Creates strong forward motion.',
  },
  {
    quality: 'diminished7',
    displayName: 'Diminished 7',
    suffix: 'dim7',
    category: '7th Chords',
    intervals: [0, 3, 6, 9],
    description: 'Dramatic, suspenseful, and symmetrical. Classic tension builder.',
  },
  {
    quality: 'halfDiminished7',
    displayName: 'Half-Diminished 7',
    suffix: 'm7b5',
    category: '7th Chords',
    intervals: [0, 3, 6, 10],
    description: 'Dark, complex, and jazzy. The Locrian mode\'s signature sound.',
  },

  // ===== EXTENDED CHORDS =====
  {
    quality: 'dominant9',
    displayName: 'Dominant 9',
    suffix: '9',
    category: 'Extended',
    intervals: [0, 4, 7, 10, 14],
    description: 'Rich, colorful, and funky. Adds sparkle to dominant harmony.',
  },
  {
    quality: 'major9',
    displayName: 'Major 9',
    suffix: 'maj9',
    category: 'Extended',
    intervals: [0, 4, 7, 11, 14],
    description: 'Ethereal, spacious, and beautiful. Modern jazz sophistication.',
  },
  {
    quality: 'minor9',
    displayName: 'Minor 9',
    suffix: 'm9',
    category: 'Extended',
    intervals: [0, 3, 7, 10, 14],
    description: 'Lush, emotional, and deep. Adds warmth to minor harmony.',
  },
  {
    quality: 'dominant11',
    displayName: 'Dominant 11',
    suffix: '11',
    category: 'Extended',
    intervals: [0, 4, 7, 10, 14, 17],
    description: 'Suspended, open, and modal. Creates floating, unresolved feeling.',
  },
  {
    quality: 'major11',
    displayName: 'Major 11',
    suffix: 'maj11',
    category: 'Extended',
    intervals: [0, 4, 7, 11, 14, 17],
    description: 'Dreamy, complex, and sophisticated. Lydian mode character.',
  },
  {
    quality: 'minor11',
    displayName: 'Minor 11',
    suffix: 'm11',
    category: 'Extended',
    intervals: [0, 3, 7, 10, 14, 17],
    description: 'Dark, rich, and atmospheric. Perfect for moody soundscapes.',
  },
  {
    quality: 'dominant13',
    displayName: 'Dominant 13',
    suffix: '13',
    category: 'Extended',
    intervals: [0, 4, 7, 10, 14, 21],
    description: 'Full, jazzy, and sophisticated. The ultimate dominant extension.',
  },
  {
    quality: 'major13',
    displayName: 'Major 13',
    suffix: 'maj13',
    category: 'Extended',
    intervals: [0, 4, 7, 11, 14, 21],
    description: 'Lush, complete, and harmonically rich. Maximum major color.',
  },
  {
    quality: 'minor13',
    displayName: 'Minor 13',
    suffix: 'm13',
    category: 'Extended',
    intervals: [0, 3, 7, 10, 14, 21],
    description: 'Complex, dark, and beautiful. Sophisticated minor harmony.',
  },

  // ===== ALTERED CHORDS =====
  {
    quality: '7b5',
    displayName: '7 Flat 5',
    suffix: '7b5',
    category: 'Altered',
    intervals: [0, 4, 6, 10],
    description: 'Tense, dissonant, and bluesy. Adds edge to dominant chords.',
  },
  {
    quality: '7#5',
    displayName: '7 Sharp 5',
    suffix: '7#5',
    category: 'Altered',
    intervals: [0, 4, 8, 10],
    description: 'Augmented, unstable, and jazzy. Creates upward tension.',
  },
  {
    quality: '7b9',
    displayName: '7 Flat 9',
    suffix: '7b9',
    category: 'Altered',
    intervals: [0, 4, 7, 10, 13],
    description: 'Dark, Spanish, and dramatic. Phrygian dominant flavor.',
  },
  {
    quality: '7#9',
    displayName: '7 Sharp 9',
    suffix: '7#9',
    category: 'Altered',
    intervals: [0, 4, 7, 10, 15],
    description: 'Hendrix chord. Bluesy, psychedelic, and powerful.',
  },
  {
    quality: '7#11',
    displayName: '7 Sharp 11',
    suffix: '7#11',
    category: 'Altered',
    intervals: [0, 4, 7, 10, 18],
    description: 'Lydian dominant. Bright, modern, and sophisticated.',
  },
  {
    quality: '7alt',
    displayName: '7 Altered',
    suffix: '7alt',
    category: 'Altered',
    intervals: [0, 4, 6, 10, 13, 15],
    description: 'Maximum tension. Jazz fusion and bebop essential.',
  },

  // ===== SUSPENDED CHORDS =====
  {
    quality: 'sus2',
    displayName: 'Suspended 2',
    suffix: 'sus2',
    category: 'Suspended',
    intervals: [0, 2, 7],
    description: 'Open, airy, and ambiguous. Neither major nor minor.',
  },
  {
    quality: 'sus4',
    displayName: 'Suspended 4',
    suffix: 'sus4',
    category: 'Suspended',
    intervals: [0, 5, 7],
    description: 'Anticipatory, unresolved, and powerful. Wants to resolve.',
  },
  {
    quality: '7sus4',
    displayName: '7 Suspended 4',
    suffix: '7sus4',
    category: 'Suspended',
    intervals: [0, 5, 7, 10],
    description: 'Modal, funky, and groovy. Rock and funk staple.',
  },

  // ===== ADD CHORDS =====
  {
    quality: 'add9',
    displayName: 'Add 9',
    suffix: 'add9',
    category: 'Add',
    intervals: [0, 4, 7, 14],
    description: 'Bright, shimmering, and modern. Adds color without 7th.',
  },
  {
    quality: 'add11',
    displayName: 'Add 11',
    suffix: 'add11',
    category: 'Add',
    intervals: [0, 4, 7, 17],
    description: 'Suspended feel with major character. Unique and interesting.',
  },
  {
    quality: 'minoradd9',
    displayName: 'Minor Add 9',
    suffix: 'madd9',
    category: 'Add',
    intervals: [0, 3, 7, 14],
    description: 'Melancholic yet hopeful. Adds brightness to minor chords.',
  },
];

export const ALL_ROOT_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

