/**
 * Compatible Scales Database
 * Comprehensive database of all scales compatible with each triad type
 * Each scale is rated 1-10 based on compatibility with the triad
 */

import { TriadType } from './triad-theory';
import { transposeNote } from './parent-key-calculator';

export interface CompatibleScale {
  scaleName: string;           // "Ionian", "Lydian", "MajorPentatonic", etc.
  displayName: string;         // "Ionian (Major Scale)", "Lydian", etc.
  rootNote: string;            // Root note of this scale (e.g., "C", "G", "A")
  fullDisplayName: string;     // "C Ionian (Major Scale)"
  intervals: number[];         // Semitone intervals from root
  compatibilityRating: number; // 1-10, how well it works with the triad
  description: string;         // Musical context and usage
  category: 'primary' | 'related' | 'extended' | 'exotic';
  isPrimary: boolean;          // The most recommended scale
}

/**
 * Get all compatible scales for a triad
 * Returns scales that contain the triad notes and work musically
 */
export function getCompatibleScalesForTriad(
  triadRoot: string,
  triadType: TriadType
): CompatibleScale[] {
  switch (triadType) {
    case 'major':
      return getMajorTriadScales(triadRoot);
    case 'minor':
      return getMinorTriadScales(triadRoot);
    case 'diminished':
      return getDiminishedTriadScales(triadRoot);
    case 'augmented':
      return getAugmentedTriadScales(triadRoot);
    default:
      // Fallback to major if unknown type
      console.warn(`Unknown triad type: ${triadType}, defaulting to major`);
      return getMajorTriadScales(triadRoot);
  }
}

/**
 * Compatible scales for Major Triads
 * Triad notes: Root, Major 3rd (4 semitones), Perfect 5th (7 semitones)
 */
function getMajorTriadScales(root: string): CompatibleScale[] {
  return [
    // PENTATONIC - Simple and always works (TOP OF LIST)
    {
      scaleName: 'MajorPentatonic',
      displayName: 'Major Pentatonic',
      rootNote: root,
      fullDisplayName: `${root} Major Pentatonic`,
      intervals: [0, 2, 4, 7, 9],
      compatibilityRating: 10,
      description: 'Simple 5-note scale. Safe, melodic, and always sounds good over major chords.',
      category: 'primary',
      isPrimary: false
    },

    // PRIMARY - Same root, major quality
    {
      scaleName: 'Ionian',
      displayName: 'Ionian (Major Scale)',
      rootNote: root,
      fullDisplayName: `${root} Ionian (Major Scale)`,
      intervals: [0, 2, 4, 5, 7, 9, 11],
      compatibilityRating: 10,
      description: 'The major scale - bright, happy, stable. Perfect match for major triads.',
      category: 'primary',
      isPrimary: true
    },
    {
      scaleName: 'Lydian',
      displayName: 'Lydian',
      rootNote: root,
      fullDisplayName: `${root} Lydian`,
      intervals: [0, 2, 4, 6, 7, 9, 11],
      compatibilityRating: 9,
      description: 'Bright and dreamy with raised 4th (#4). Creates floating, ethereal sound. Jazz favorite.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'Mixolydian',
      displayName: 'Mixolydian',
      rootNote: root,
      fullDisplayName: `${root} Mixolydian`,
      intervals: [0, 2, 4, 5, 7, 9, 10],
      compatibilityRating: 8,
      description: 'Bluesy major sound with flat 7th (b7). Common in rock, blues, and funk.',
      category: 'primary',
      isPrimary: false
    },
    
    // RELATED - Relative minor and its variations
    {
      scaleName: 'Aeolian',
      displayName: 'Relative Minor (Aeolian)',
      rootNote: transposeNote(root, 9), // 6th degree = relative minor
      fullDisplayName: `${transposeNote(root, 9)} Aeolian (Natural Minor)`,
      intervals: [0, 2, 3, 5, 7, 8, 10],
      compatibilityRating: 8,
      description: 'Relative minor scale. Shares all notes with the major scale. Creates bittersweet sound.',
      category: 'related',
      isPrimary: false
    },
    {
      scaleName: 'MinorPentatonic',
      displayName: 'Relative Minor Pentatonic',
      rootNote: transposeNote(root, 9),
      fullDisplayName: `${transposeNote(root, 9)} Minor Pentatonic`,
      intervals: [0, 3, 5, 7, 10],
      compatibilityRating: 9,
      description: 'Classic blues/rock scale. Works beautifully over major chords for bluesy feel.',
      category: 'related',
      isPrimary: false
    },
    {
      scaleName: 'Dorian',
      displayName: 'Relative Dorian',
      rootNote: transposeNote(root, 2), // 2nd degree
      fullDisplayName: `${transposeNote(root, 2)} Dorian`,
      intervals: [0, 2, 3, 5, 7, 9, 10],
      compatibilityRating: 7,
      description: 'Jazzy minor mode from the 2nd degree. Brighter than natural minor.',
      category: 'related',
      isPrimary: false
    },
    
    // EXTENDED - Other modes and variations
    {
      scaleName: 'Phrygian',
      displayName: 'Phrygian (3rd degree)',
      rootNote: transposeNote(root, 4),
      fullDisplayName: `${transposeNote(root, 4)} Phrygian`,
      intervals: [0, 1, 3, 5, 7, 8, 10],
      compatibilityRating: 6,
      description: 'Spanish/exotic minor with flat 2nd. Dark and mysterious. Use sparingly.',
      category: 'extended',
      isPrimary: false
    },
    {
      scaleName: 'Locrian',
      displayName: 'Locrian (7th degree)',
      rootNote: transposeNote(root, 11),
      fullDisplayName: `${transposeNote(root, 11)} Locrian`,
      intervals: [0, 1, 3, 5, 6, 8, 10],
      compatibilityRating: 5,
      description: 'Unstable and tense. Use for tension and resolution. Advanced technique.',
      category: 'extended',
      isPrimary: false
    },
    {
      scaleName: 'Blues',
      displayName: 'Blues Scale',
      rootNote: root,
      fullDisplayName: `${root} Blues Scale`,
      intervals: [0, 3, 5, 6, 7, 10],
      compatibilityRating: 8,
      description: 'Classic blues scale with blue notes. Perfect for blues, rock, and jazz.',
      category: 'extended',
      isPrimary: false
    }
  ];
}

/**
 * Compatible scales for Minor Triads
 * Triad notes: Root, Minor 3rd (3 semitones), Perfect 5th (7 semitones)
 */
function getMinorTriadScales(root: string): CompatibleScale[] {
  return [
    // PENTATONIC - Simple and always works (TOP OF LIST)
    {
      scaleName: 'MinorPentatonic',
      displayName: 'Minor Pentatonic',
      rootNote: root,
      fullDisplayName: `${root} Minor Pentatonic`,
      intervals: [0, 3, 5, 7, 10],
      compatibilityRating: 10,
      description: 'Classic 5-note minor scale. Perfect for blues, rock, and always sounds good.',
      category: 'primary',
      isPrimary: false
    },

    // PRIMARY - Same root, minor quality
    {
      scaleName: 'Aeolian',
      displayName: 'Aeolian (Natural Minor)',
      rootNote: root,
      fullDisplayName: `${root} Aeolian (Natural Minor)`,
      intervals: [0, 2, 3, 5, 7, 8, 10],
      compatibilityRating: 10,
      description: 'The natural minor scale - dark, melancholic, emotional. Perfect for minor triads.',
      category: 'primary',
      isPrimary: true
    },
    {
      scaleName: 'Dorian',
      displayName: 'Dorian',
      rootNote: root,
      fullDisplayName: `${root} Dorian`,
      intervals: [0, 2, 3, 5, 7, 9, 10],
      compatibilityRating: 9,
      description: 'Jazzy minor with natural 6th. Brighter than natural minor. Jazz and funk favorite.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'HarmonicMinor',
      displayName: 'Harmonic Minor',
      rootNote: root,
      fullDisplayName: `${root} Harmonic Minor`,
      intervals: [0, 2, 3, 5, 7, 8, 11],
      compatibilityRating: 9,
      description: 'Minor with raised 7th. Classical and exotic sound. Creates strong resolution.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'MelodicMinor',
      displayName: 'Melodic Minor',
      rootNote: root,
      fullDisplayName: `${root} Melodic Minor`,
      intervals: [0, 2, 3, 5, 7, 9, 11],
      compatibilityRating: 8,
      description: 'Minor with raised 6th and 7th. Smooth and jazzy. Modern jazz standard.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'Phrygian',
      displayName: 'Phrygian',
      rootNote: root,
      fullDisplayName: `${root} Phrygian`,
      intervals: [0, 1, 3, 5, 7, 8, 10],
      compatibilityRating: 8,
      description: 'Spanish/exotic minor with flat 2nd. Dark, mysterious, and dramatic.',
      category: 'primary',
      isPrimary: false
    },

    // RELATED - Relative major and its variations
    {
      scaleName: 'Ionian',
      displayName: 'Relative Major (Ionian)',
      rootNote: transposeNote(root, 3), // Minor 3rd up = relative major
      fullDisplayName: `${transposeNote(root, 3)} Ionian (Major Scale)`,
      intervals: [0, 2, 4, 5, 7, 9, 11],
      compatibilityRating: 8,
      description: 'Relative major scale. Shares all notes. Creates bright contrast over minor chord.',
      category: 'related',
      isPrimary: false
    },
    {
      scaleName: 'MajorPentatonic',
      displayName: 'Relative Major Pentatonic',
      rootNote: transposeNote(root, 3),
      fullDisplayName: `${transposeNote(root, 3)} Major Pentatonic`,
      intervals: [0, 2, 4, 7, 9],
      compatibilityRating: 7,
      description: 'Relative major pentatonic. Creates interesting major/minor blend.',
      category: 'related',
      isPrimary: false
    },

    // EXTENDED - Blues and exotic
    {
      scaleName: 'Blues',
      displayName: 'Blues Scale',
      rootNote: root,
      fullDisplayName: `${root} Blues Scale`,
      intervals: [0, 3, 5, 6, 7, 10],
      compatibilityRating: 9,
      description: 'Classic blues scale with blue notes. Essential for blues and rock.',
      category: 'extended',
      isPrimary: false
    },
    {
      scaleName: 'PhrygianDominant',
      displayName: 'Phrygian Dominant',
      rootNote: root,
      fullDisplayName: `${root} Phrygian Dominant`,
      intervals: [0, 1, 4, 5, 7, 8, 10],
      compatibilityRating: 7,
      description: 'Exotic scale from harmonic minor. Spanish, Middle Eastern flavor.',
      category: 'extended',
      isPrimary: false
    }
  ];
}

/**
 * Compatible scales for Diminished Triads
 * Triad notes: Root, Minor 3rd (3 semitones), Diminished 5th (6 semitones)
 */
function getDiminishedTriadScales(root: string): CompatibleScale[] {
  return [
    // PENTATONIC - Simple and always works (TOP OF LIST)
    {
      scaleName: 'MinorPentatonic',
      displayName: 'Minor Pentatonic',
      rootNote: root,
      fullDisplayName: `${root} Minor Pentatonic`,
      intervals: [0, 3, 5, 7, 10],
      compatibilityRating: 10,
      description: 'Classic 5-note minor scale. Safe choice for diminished chords, avoids the b5 tension.',
      category: 'primary',
      isPrimary: false
    },

    // PRIMARY - Diminished quality
    {
      scaleName: 'Locrian',
      displayName: 'Locrian',
      rootNote: root,
      fullDisplayName: `${root} Locrian`,
      intervals: [0, 1, 3, 5, 6, 8, 10],
      compatibilityRating: 10,
      description: 'Unstable and tense with b2 and b5. Natural choice for diminished chords.',
      category: 'primary',
      isPrimary: true
    },
    {
      scaleName: 'DiminishedHalfWhole',
      displayName: 'Diminished (Half-Whole)',
      rootNote: root,
      fullDisplayName: `${root} Diminished (Half-Whole)`,
      intervals: [0, 1, 3, 4, 6, 7, 9, 10],
      compatibilityRating: 10,
      description: 'Symmetrical 8-note scale. Perfect for diminished chords and tension.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'DiminishedWholeHalf',
      displayName: 'Diminished (Whole-Half)',
      rootNote: root,
      fullDisplayName: `${root} Diminished (Whole-Half)`,
      intervals: [0, 2, 3, 5, 6, 8, 9, 11],
      compatibilityRating: 9,
      description: 'Symmetrical scale, opposite pattern. Creates different color over dim chords.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'LocrianNatural6',
      displayName: 'Locrian Natural 6',
      rootNote: root,
      fullDisplayName: `${root} Locrian Natural 6`,
      intervals: [0, 1, 3, 5, 6, 9, 10],
      compatibilityRating: 8,
      description: 'Locrian with natural 6th. From harmonic minor. Less tense than pure Locrian.',
      category: 'primary',
      isPrimary: false
    },

    // EXTENDED - Related scales
    {
      scaleName: 'Phrygian',
      displayName: 'Phrygian',
      rootNote: root,
      fullDisplayName: `${root} Phrygian`,
      intervals: [0, 1, 3, 5, 7, 8, 10],
      compatibilityRating: 7,
      description: 'Minor mode with b2. Works over dim chords but has perfect 5th instead of b5.',
      category: 'extended',
      isPrimary: false
    },
    {
      scaleName: 'Aeolian',
      displayName: 'Aeolian (Natural Minor)',
      rootNote: root,
      fullDisplayName: `${root} Aeolian (Natural Minor)`,
      intervals: [0, 2, 3, 5, 7, 8, 10],
      compatibilityRating: 6,
      description: 'Natural minor. Contains the b3 but has perfect 5th. Use carefully.',
      category: 'extended',
      isPrimary: false
    }
  ];
}

/**
 * Compatible scales for Augmented Triads
 * Triad notes: Root, Major 3rd (4 semitones), Augmented 5th (8 semitones)
 */
function getAugmentedTriadScales(root: string): CompatibleScale[] {
  return [
    // PENTATONIC - Simple and always works (TOP OF LIST)
    {
      scaleName: 'MajorPentatonic',
      displayName: 'Major Pentatonic',
      rootNote: root,
      fullDisplayName: `${root} Major Pentatonic`,
      intervals: [0, 2, 4, 7, 9],
      compatibilityRating: 10,
      description: 'Simple 5-note scale. Safe choice for augmented chords, avoids the #5 tension.',
      category: 'primary',
      isPrimary: false
    },

    // PRIMARY - Augmented quality
    {
      scaleName: 'WholeTone',
      displayName: 'Whole Tone',
      rootNote: root,
      fullDisplayName: `${root} Whole Tone`,
      intervals: [0, 2, 4, 6, 8, 10],
      compatibilityRating: 10,
      description: 'Dreamy and floating - all whole steps. Perfect for augmented chords.',
      category: 'primary',
      isPrimary: true
    },
    {
      scaleName: 'LydianAugmented',
      displayName: 'Lydian Augmented',
      rootNote: root,
      fullDisplayName: `${root} Lydian Augmented`,
      intervals: [0, 2, 4, 6, 8, 9, 11],
      compatibilityRating: 9,
      description: 'Lydian with raised 5th. From melodic minor. Bright and exotic.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'IonianSharp5',
      displayName: 'Ionian #5',
      rootNote: root,
      fullDisplayName: `${root} Ionian #5`,
      intervals: [0, 2, 4, 5, 8, 9, 11],
      compatibilityRating: 8,
      description: 'Major scale with augmented 5th. From harmonic minor.',
      category: 'primary',
      isPrimary: false
    },
    {
      scaleName: 'Augmented',
      displayName: 'Augmented Scale',
      rootNote: root,
      fullDisplayName: `${root} Augmented Scale`,
      intervals: [0, 3, 4, 7, 8, 11],
      compatibilityRating: 9,
      description: 'Symmetrical hexatonic scale. Creates tension and ambiguity.',
      category: 'primary',
      isPrimary: false
    },

    // EXTENDED - Related major scales
    {
      scaleName: 'Lydian',
      displayName: 'Lydian',
      rootNote: root,
      fullDisplayName: `${root} Lydian`,
      intervals: [0, 2, 4, 6, 7, 9, 11],
      compatibilityRating: 7,
      description: 'Bright major mode. Has major 3rd but perfect 5th instead of #5.',
      category: 'extended',
      isPrimary: false
    },
    {
      scaleName: 'Ionian',
      displayName: 'Ionian (Major Scale)',
      rootNote: root,
      fullDisplayName: `${root} Ionian (Major Scale)`,
      intervals: [0, 2, 4, 5, 7, 9, 11],
      compatibilityRating: 6,
      description: 'Major scale. Has major 3rd but perfect 5th. Use carefully over aug chords.',
      category: 'extended',
      isPrimary: false
    },
    {
      scaleName: 'HarmonicMajor',
      displayName: 'Harmonic Major',
      rootNote: root,
      fullDisplayName: `${root} Harmonic Major`,
      intervals: [0, 2, 4, 5, 7, 8, 11],
      compatibilityRating: 7,
      description: 'Major scale with b6. Exotic and colorful over augmented chords.',
      category: 'extended',
      isPrimary: false
    }
  ];
}

