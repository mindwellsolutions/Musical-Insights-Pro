import { NOTES, SCALE_INTERVALS, getScaleNotes } from './musicTheory';
import { SCALE_KEY_RELATIONSHIPS, type ScaleKeyRelationship } from './scaleCompatibilityDatabase';

// Extended scale/mode intervals including more modes and exotic scales
export const EXTENDED_SCALE_INTERVALS: Record<string, number[]> = {
  // Major scale modes (with both display names and database keys)
  'Ionian (Major)': [0, 2, 4, 5, 7, 9, 11],
  'Ionian': [0, 2, 4, 5, 7, 9, 11], // Database key
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Phrygian': [0, 1, 3, 5, 7, 8, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Aeolian (Natural Minor)': [0, 2, 3, 5, 7, 8, 10],
  'Aeolian': [0, 2, 3, 5, 7, 8, 10], // Database key - DO NOT SHOW IN UI
  'Locrian': [0, 1, 3, 5, 6, 8, 10],

  // Minor scale variations (with both display names and database keys)
  'Harmonic Minor': [0, 2, 3, 5, 7, 8, 11],
  'HarmonicMinor': [0, 2, 3, 5, 7, 8, 11], // Database key
  'Melodic Minor': [0, 2, 3, 5, 7, 9, 11],
  'MelodicMinor': [0, 2, 3, 5, 7, 9, 11], // Database key

  // Harmonic minor modes
  'Locrian ♮6': [0, 1, 3, 5, 6, 9, 10],
  'Ionian ♯5': [0, 2, 4, 5, 8, 9, 11],
  'Dorian ♯4': [0, 2, 3, 6, 7, 9, 10],
  'Phrygian Dominant': [0, 1, 4, 5, 7, 8, 10],
  'Lydian ♯2': [0, 3, 4, 6, 7, 9, 11],
  'Mixolydian ♭9 ♭13': [0, 1, 4, 5, 7, 8, 10],

  // Melodic minor modes
  'Dorian ♭2': [0, 1, 3, 5, 7, 9, 10],
  'Lydian Augmented': [0, 2, 4, 6, 8, 9, 11],
  'Lydian Dominant': [0, 2, 4, 6, 7, 9, 10],
  'Mixolydian ♭6': [0, 2, 4, 5, 7, 8, 10],
  'Aeolian ♭5': [0, 2, 3, 5, 6, 8, 10],
  'Super Locrian': [0, 1, 3, 4, 6, 8, 10],

  // Pentatonic scales (with both display names and database keys)
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'MajorPentatonic': [0, 2, 4, 7, 9], // Database key
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'MinorPentatonic': [0, 3, 5, 7, 10], // Database key
  'Extended Pentatonic Major': [0, 2, 4, 7, 9, 11], // Major pentatonic + major 7th (1, 2, 3, 5, 6, 7)
  'Extended Pentatonic Minor': [0, 2, 3, 5, 7, 10], // Minor pentatonic + major 2nd (1, 2, b3, 4, 5, b7)
  'Blues': [0, 3, 5, 6, 7, 10],
  'Japanese Pentatonic': [0, 1, 5, 7, 8],
  'Egyptian Pentatonic': [0, 2, 5, 7, 10],

  // Symmetrical scales
  'Chromatic': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  'Whole Tone': [0, 2, 4, 6, 8, 10],
  'Diminished (Half-Whole)': [0, 1, 3, 4, 6, 7, 9, 10],
  'Diminished (Whole-Half)': [0, 2, 3, 5, 6, 8, 9, 11],
  'Augmented': [0, 3, 4, 7, 8, 11],
};

/**
 * Database keys that should not be shown in the UI dropdown
 * These are kept for backward compatibility but have display name equivalents
 */
const DATABASE_ONLY_KEYS = ['Ionian', 'Aeolian', 'HarmonicMinor', 'MelodicMinor', 'MajorPentatonic', 'MinorPentatonic'];

/**
 * Basic/Standard modes - the most commonly used scales
 */
const BASIC_MODES = [
  'Ionian (Major)',
  'Dorian',
  'Phrygian',
  'Lydian',
  'Mixolydian',
  'Aeolian (Natural Minor)',
  'Locrian',
  'Harmonic Minor',
  'Melodic Minor',
  'Pentatonic Major',
  'Pentatonic Minor',
  'Extended Pentatonic Major',
  'Extended Pentatonic Minor',
  'Blues',
];

/**
 * Get scale names for UI display (excludes database-only keys)
 * Returns sorted array of scale names suitable for dropdowns
 * @param basicOnly - If true, returns only basic/standard modes
 */
export function getDisplayScaleNames(basicOnly: boolean = false): string[] {
  const allScales = Object.keys(EXTENDED_SCALE_INTERVALS)
    .filter(key => !DATABASE_ONLY_KEYS.includes(key));

  if (basicOnly) {
    return allScales.filter(key => BASIC_MODES.includes(key)).sort();
  }

  return allScales.sort();
}

export interface ScaleCharacteristics {
  name: string;
  intervals: number[];
  characteristics: string[];
  mood: string;
  harmonicFunction: string;
  difficulty: number; // 1-10
  parentScale?: string;
  modes?: string[];
  commonUse: string[];
  notesToAvoid?: number[];
}

export const SCALE_CHARACTERISTICS: Record<string, ScaleCharacteristics> = {
  'Ionian (Major)': {
    name: 'Ionian (Major)',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    characteristics: ['Bright', 'Happy', 'Stable', 'Consonant'],
    mood: 'Joyful and uplifting',
    harmonicFunction: 'Tonic',
    difficulty: 1,
    modes: ['Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian (Natural Minor)', 'Locrian'],
    commonUse: ['Pop', 'Country', 'Classical', 'Folk'],
  },
  'Dorian': {
    name: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    characteristics: ['Sophisticated', 'Minor', 'Jazzy', 'Smooth'],
    mood: 'Contemplative and sophisticated',
    harmonicFunction: 'Subdominant',
    difficulty: 3,
    parentScale: 'Ionian (Major)',
    commonUse: ['Jazz', 'Blues', 'Rock', 'Celtic'],
  },
  'Phrygian': {
    name: 'Phrygian',
    intervals: [0, 1, 3, 5, 7, 8, 10],
    characteristics: ['Dark', 'Spanish', 'Exotic', 'Tense'],
    mood: 'Dark and mysterious',
    harmonicFunction: 'Phrygian Dominant',
    difficulty: 4,
    parentScale: 'Ionian (Major)',
    commonUse: ['Flamenco', 'Metal', 'Spanish Classical'],
  },
  'Lydian': {
    name: 'Lydian',
    intervals: [0, 2, 4, 6, 7, 9, 11],
    characteristics: ['Bright', 'Dreamy', 'Ethereal', 'Modern'],
    mood: 'Dreamy and floating',
    harmonicFunction: 'Lydian Dominant',
    difficulty: 3,
    parentScale: 'Ionian (Major)',
    commonUse: ['Film Scores', 'Jazz', 'Progressive Rock'],
  },
  'Mixolydian': {
    name: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    characteristics: ['Bluesy', 'Rock', 'Dominant', 'Open'],
    mood: 'Confident and driving',
    harmonicFunction: 'Dominant',
    difficulty: 2,
    parentScale: 'Ionian (Major)',
    commonUse: ['Rock', 'Blues', 'Celtic', 'Country'],
  },
  'Aeolian (Natural Minor)': {
    name: 'Aeolian (Natural Minor)',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    characteristics: ['Sad', 'Dark', 'Emotional', 'Classical'],
    mood: 'Melancholic and emotional',
    harmonicFunction: 'Tonic Minor',
    difficulty: 1,
    parentScale: 'Ionian (Major)',
    commonUse: ['Classical', 'Pop', 'Rock', 'Folk'],
  },
  'Locrian': {
    name: 'Locrian',
    intervals: [0, 1, 3, 5, 6, 8, 10],
    characteristics: ['Unstable', 'Diminished', 'Theoretical', 'Rare'],
    mood: 'Unstable and unresolved',
    harmonicFunction: 'Diminished',
    difficulty: 8,
    parentScale: 'Ionian (Major)',
    commonUse: ['Theoretical', 'Jazz', 'Experimental'],
  },
  'Harmonic Minor': {
    name: 'Harmonic Minor',
    intervals: [0, 2, 3, 5, 7, 8, 11],
    characteristics: ['Classical', 'Dramatic', 'Exotic', 'Tension'],
    mood: 'Dramatic and classical',
    harmonicFunction: 'Harmonic Minor',
    difficulty: 4,
    commonUse: ['Classical', 'Neo-Classical', 'Metal', 'Middle Eastern'],
  },
  'Melodic Minor': {
    name: 'Melodic Minor',
    intervals: [0, 2, 3, 5, 7, 9, 11],
    characteristics: ['Jazz', 'Sophisticated', 'Modern', 'Complex'],
    mood: 'Sophisticated and modern',
    harmonicFunction: 'Melodic Minor',
    difficulty: 6,
    commonUse: ['Jazz', 'Fusion', 'Classical', 'Progressive'],
  },
  'Pentatonic Major': {
    name: 'Pentatonic Major',
    intervals: [0, 2, 4, 7, 9],
    characteristics: ['Simple', 'Universal', 'Safe', 'Consonant'],
    mood: 'Universal and accessible',
    harmonicFunction: 'Pentatonic',
    difficulty: 1,
    commonUse: ['Rock', 'Blues', 'Country', 'World Music'],
  },
  'Pentatonic Minor': {
    name: 'Pentatonic Minor',
    intervals: [0, 3, 5, 7, 10],
    characteristics: ['Bluesy', 'Simple', 'Expressive', 'Versatile'],
    mood: 'Bluesy and expressive',
    harmonicFunction: 'Pentatonic Minor',
    difficulty: 1,
    commonUse: ['Blues', 'Rock', 'Jazz', 'World Music'],
  },
  'Extended Pentatonic Major': {
    name: 'Extended Pentatonic Major',
    intervals: [0, 2, 4, 7, 9, 11],
    characteristics: ['Bright', 'Melodic', 'Versatile', 'Modern'],
    mood: 'Bright and melodic with added color',
    harmonicFunction: 'Extended Pentatonic',
    difficulty: 2,
    commonUse: ['Jazz', 'Fusion', 'Contemporary', 'World Music'],
  },
  'Extended Pentatonic Minor': {
    name: 'Extended Pentatonic Minor',
    intervals: [0, 2, 3, 5, 7, 10],
    characteristics: ['Expressive', 'Melodic', 'Bluesy', 'Versatile'],
    mood: 'Expressive with added melodic possibilities',
    harmonicFunction: 'Extended Pentatonic Minor',
    difficulty: 2,
    commonUse: ['Blues', 'Rock', 'Jazz', 'Fusion'],
  },
  'Blues': {
    name: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    characteristics: ['Bluesy', 'Expressive', 'Emotional', 'Chromatic'],
    mood: 'Emotional and soulful',
    harmonicFunction: 'Blues',
    difficulty: 2,
    commonUse: ['Blues', 'Jazz', 'Rock', 'R&B'],
  },
};

export interface KeyCompatibility {
  targetKey: string;
  compatibleScales: ScaleCompatibilityRating[];
  primaryScales: string[];
  secondaryScales: string[];
}

export interface ScaleCompatibilityRating {
  scaleName: string;
  rootNote: string;
  compatibilityScore: number; // 1-10 AI rating
  harmonicRelationship: string;
  recommendedUse: string;
  chordTones: string[];
  guideTones: string[];
  confidence?: number; // How confident we are in this rating
  // New fields from music theory database
  musicalContext?: string;
  genreRecommendations?: string;
  rationale?: string;
  difficultyLevel?: number;
  keyQuality?: string;
}

/**
 * Get scale notes with extended scale support
 */
function getExtendedScaleNotes(rootNote: string, scaleName: string): string[] {
  const intervals = EXTENDED_SCALE_INTERVALS[scaleName] || SCALE_INTERVALS[scaleName];
  if (!intervals) return [];

  const rootIndex = NOTES.indexOf(rootNote);
  if (rootIndex === -1) return [];
  
  return intervals.map(interval => NOTES[(rootIndex + interval) % 12]);
}

// AI-powered compatibility rating system with comprehensive database
export function calculateScaleCompatibility(
  targetKey: string,
  scaleName: string
): ScaleCompatibilityRating {
  // Parse the target key (e.g., "C Major" -> "C", "major")
  const keyParts = targetKey.split(' ');
  const rootNote = keyParts[0];
  const quality = keyParts[1]?.toLowerCase() as 'major' | 'minor';

  const keyScaleName = quality === 'major' ? 'Ionian (Major)' : 'Aeolian (Natural Minor)';
  const scaleNotes = getExtendedScaleNotes(rootNote, scaleName);
  const scaleIntervals = EXTENDED_SCALE_INTERVALS[scaleName] || SCALE_INTERVALS[scaleName];

  if (!scaleIntervals || scaleNotes.length === 0) {
    return {
      scaleName,
      rootNote,
      compatibilityScore: 1,
      harmonicRelationship: 'Unknown scale',
      recommendedUse: 'Scale not found in database',
      chordTones: [],
      guideTones: [],
      confidence: 0.1,
    };
  }

  // Check if we have a comprehensive relationship in our database
  const scaleRelationship = SCALE_KEY_RELATIONSHIPS[scaleName];

  if (scaleRelationship && quality) {
    const relationship = scaleRelationship[quality];

    // Get chord tones and guide tones
    const chordTones = [scaleNotes[0], scaleNotes[2], scaleNotes[4]].filter(Boolean); // 1, 3, 5
    const guideTones = [scaleNotes[2], scaleNotes[6]].filter(Boolean); // 3, 7

    return {
      scaleName,
      rootNote,
      compatibilityScore: relationship.compatibilityScore,
      harmonicRelationship: `${relationship.relationship} - ${relationship.rationale}`,
      recommendedUse: `💡 ${relationship.recommendedUse}`,
      chordTones,
      guideTones,
      confidence: 0.95, // High confidence for database entries
    };
  }

  // Fallback to algorithmic calculation for scales not in database
  const keyNotes = getExtendedScaleNotes(rootNote, keyScaleName);

  // Calculate shared tones (40% weight)
  const sharedTones = scaleNotes.filter(note => keyNotes.includes(note)).length;
  const sharedTonesScore = (sharedTones / Math.max(keyNotes.length, 1)) * 4; // Max 4 points

  // Calculate harmonic relationship (30% weight)
  let harmonicScore = 0;
  let harmonicRelationship = '';

  // Check if it's a mode of the major scale
  if (SCALE_CHARACTERISTICS[scaleName]?.parentScale === 'Ionian (Major)') {
    harmonicScore = 3;
    harmonicRelationship = 'Modal relationship';
  }
  // Check if it's the relative minor
  else if (scaleName === 'Aeolian (Natural Minor)') {
    harmonicScore = 2.5;
    harmonicRelationship = 'Relative minor';
  }
  // Check if it's a pentatonic subset
  else if (scaleName.includes('Pentatonic') || scaleName === 'Blues') {
    harmonicScore = 2.8;
    harmonicRelationship = 'Subset relationship';
  }
  // Exotic scales get lower scores
  else if (['Persian', 'Arabic', 'Byzantine', 'Enigmatic'].includes(scaleName)) {
    harmonicScore = 1.5;
    harmonicRelationship = 'Exotic relationship';
  }
  else {
    harmonicScore = 2;
    harmonicRelationship = 'Distant relationship';
  }

  // Musical context score (20% weight)
  const characteristics = SCALE_CHARACTERISTICS[scaleName]?.characteristics || [];
  let contextScore = 1.5; // Base score

  if (characteristics.includes('Consonant') || characteristics.includes('Stable')) {
    contextScore += 0.5;
  }
  if (characteristics.includes('Jazzy') || characteristics.includes('Sophisticated')) {
    contextScore += 0.3;
  }
  if (characteristics.includes('Bluesy')) {
    contextScore += 0.4;
  }

  // Practical playability (10% weight)
  const difficulty = SCALE_CHARACTERISTICS[scaleName]?.difficulty || 5;
  const playabilityScore = Math.max(0, (10 - difficulty) / 10); // Easier scales score higher

  // Calculate final score (out of 10)
  const finalScore = Math.min(10, Math.max(1,
    sharedTonesScore + harmonicScore + contextScore + playabilityScore
  ));

  // Calculate confidence based on how well-established the relationship is
  let confidence = 0.7;
  if (SCALE_CHARACTERISTICS[scaleName]?.parentScale === 'Ionian (Major)') {
    confidence = 0.85;
  } else if (['Pentatonic Major', 'Pentatonic Minor', 'Blues'].includes(scaleName)) {
    confidence = 0.8;
  } else if (characteristics.includes('Theoretical') || difficulty > 7) {
    confidence = 0.5;
  }

  // Determine recommended use
  let recommendedUse = 'General improvisation';
  if (finalScore >= 8) {
    recommendedUse = 'Primary choice for improvisation';
  } else if (finalScore >= 6) {
    recommendedUse = 'Good for melodic passages';
  } else if (finalScore >= 4) {
    recommendedUse = 'Use for color tones and tension';
  } else {
    recommendedUse = 'Advanced/experimental use only';
  }

  // Get chord tones and guide tones
  const chordTones = [scaleNotes[0], scaleNotes[2], scaleNotes[4]].filter(Boolean); // 1, 3, 5
  const guideTones = [scaleNotes[2], scaleNotes[6]].filter(Boolean); // 3, 7

  return {
    scaleName,
    rootNote,
    compatibilityScore: Math.round(finalScore * 10) / 10, // Round to 1 decimal
    harmonicRelationship,
    recommendedUse: `💡 ${recommendedUse}`,
    chordTones,
    guideTones,
    confidence,
  };
}

// Get the most compatible scales for a given key
export function getCompatibleScales(
  key: string, 
  limit: number = 8,
  minScore: number = 4
): ScaleCompatibilityRating[] {
  const allScales = Object.keys(EXTENDED_SCALE_INTERVALS);
  const compatibilityRatings = allScales.map(scale => 
    calculateScaleCompatibility(key, scale)
  );

  return compatibilityRatings
    .filter(rating => rating.compatibilityScore >= minScore)
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, limit);
}

