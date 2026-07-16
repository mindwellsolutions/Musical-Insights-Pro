/**
 * Scale Name Mapping
 * Maps UI scale names to database scale keys and vice versa
 */

/**
 * Map UI scale names (from dropdown) to database scale keys
 * The UI uses EXTENDED_SCALE_INTERVALS which has names like "Aeolian (Natural Minor)"
 * The database uses keys like "Aeolian"
 */
export const SCALE_NAME_TO_DB_KEY: Record<string, string> = {
  // Key Center - Sharp keys
  'Key of A': 'Key_of_A',
  'Key of A#': 'Key_of_A#',
  'Key of B': 'Key_of_B',
  'Key of C': 'Key_of_C',
  'Key of C#': 'Key_of_C#',
  'Key of D': 'Key_of_D',
  'Key of D#': 'Key_of_D#',
  'Key of E': 'Key_of_E',
  'Key of F': 'Key_of_F',
  'Key of F#': 'Key_of_F#',
  'Key of G': 'Key_of_G',
  'Key of G#': 'Key_of_G#',

  // Key Center - Flat keys (map to sharp key databases)
  'Key of Bb': 'Key_of_A#',
  'Key of Db': 'Key_of_C#',
  'Key of Eb': 'Key_of_D#',
  'Key of Gb': 'Key_of_F#',
  'Key of Ab': 'Key_of_G#',

  // Major Modes (Diatonic) - with and without parenthetical descriptions
  'Major': 'Ionian',
  'Ionian': 'Ionian',
  'Ionian (Major)': 'Ionian',
  'Dorian': 'Dorian',
  'Phrygian': 'Phrygian',
  'Lydian': 'Lydian',
  'Mixolydian': 'Mixolydian',
  'Minor': 'Aeolian',
  'Aeolian': 'Aeolian',
  'Aeolian (Natural Minor)': 'Aeolian',
  'Natural Minor': 'Aeolian',
  'Locrian': 'Locrian',
  
  // Minor Variants
  'Harmonic Minor': 'HarmonicMinor',
  'Melodic Minor': 'MelodicMinor',
  
  // Harmonic Minor Modes
  'Locrian Natural 6': 'LocrianNatural6',
  'Locrian ♮6': 'LocrianNatural6',
  'Ionian #5': 'IonianSharp5',
  'Ionian ♯5': 'IonianSharp5',
  'Dorian #4': 'DorianSharp4',
  'Dorian ♯4': 'DorianSharp4',
  'Phrygian Dominant': 'PhrygianDominant',
  'Lydian #2': 'LydianSharp2',
  'Lydian ♯2': 'LydianSharp2',
  'Mixolydian b9 b13': 'MixolydianFlat9Flat13',
  'Mixolydian ♭9 ♭13': 'MixolydianFlat9Flat13',
  
  // Melodic Minor Modes
  'Dorian b2': 'DorianFlat2',
  'Dorian ♭2': 'DorianFlat2',
  'Lydian Augmented': 'LydianAugmented',
  'Lydian Dominant': 'LydianDominant',
  'Mixolydian b6': 'MixolydianFlat6',
  'Mixolydian ♭6': 'MixolydianFlat6',
  'Aeolian b5': 'AeolianFlat5',
  'Aeolian ♭5': 'AeolianFlat5',
  'Locrian #2': 'AeolianFlat5',
  'Locrian ♯2': 'AeolianFlat5',
  'Super Locrian': 'SuperLocrian',
  'Altered': 'SuperLocrian',
  
  // Pentatonic Scales
  'Major Pentatonic': 'MajorPentatonic',
  'Pentatonic Major': 'MajorPentatonic',
  'Minor Pentatonic': 'MinorPentatonic',
  'Pentatonic Minor': 'MinorPentatonic',
  'Extended Pentatonic Major': 'ExtendedPentatonicMajor',
  'Extended Pentatonic Minor': 'ExtendedPentatonicMinor',
  'Blues': 'BluesScale',
  'Blues Scale': 'BluesScale',
  'Japanese Pentatonic': 'JapanesePentatonic',
  'In Sen': 'JapanesePentatonic',
  'Egyptian Pentatonic': 'EgyptianPentatonic',
  
  // Symmetrical Scales
  'Chromatic': 'Chromatic',
  'Whole Tone': 'WholeTone',
  'Diminished (Half-Whole)': 'DiminishedHalfWhole',
  'Diminished Half-Whole': 'DiminishedHalfWhole',
  'Diminished (Whole-Half)': 'DiminishedWholeHalf',
  'Diminished Whole-Half': 'DiminishedWholeHalf',
  'Augmented': 'Augmented',
};

/**
 * Reverse mapping: database keys to UI display names
 */
export const DB_KEY_TO_SCALE_NAME: Record<string, string> = {
  // Key Center
  'Key_of_A': 'Key of A',
  'Key_of_A#': 'Key of A#',
  'Key_of_B': 'Key of B',
  'Key_of_C': 'Key of C',
  'Key_of_C#': 'Key of C#',
  'Key_of_D': 'Key of D',
  'Key_of_D#': 'Key of D#',
  'Key_of_E': 'Key of E',
  'Key_of_F': 'Key of F',
  'Key_of_F#': 'Key of F#',
  'Key_of_G': 'Key of G',
  'Key_of_G#': 'Key of G#',
  
  // Major Modes
  'Ionian': 'Major',
  'Dorian': 'Dorian',
  'Phrygian': 'Phrygian',
  'Lydian': 'Lydian',
  'Mixolydian': 'Mixolydian',
  'Aeolian': 'Minor',
  'Locrian': 'Locrian',
  
  // Minor Variants
  'HarmonicMinor': 'Harmonic Minor',
  'MelodicMinor': 'Melodic Minor',
  
  // Harmonic Minor Modes
  'LocrianNatural6': 'Locrian Natural 6',
  'IonianSharp5': 'Ionian #5',
  'DorianSharp4': 'Dorian #4',
  'PhrygianDominant': 'Phrygian Dominant',
  'LydianSharp2': 'Lydian #2',
  'MixolydianFlat9Flat13': 'Mixolydian b9 b13',
  
  // Melodic Minor Modes
  'DorianFlat2': 'Dorian b2',
  'LydianAugmented': 'Lydian Augmented',
  'LydianDominant': 'Lydian Dominant',
  'MixolydianFlat6': 'Mixolydian b6',
  'AeolianFlat5': 'Aeolian b5',
  'SuperLocrian': 'Super Locrian',
  
  // Pentatonic
  'MajorPentatonic': 'Major Pentatonic',
  'MinorPentatonic': 'Minor Pentatonic',
  'ExtendedPentatonicMajor': 'Extended Pentatonic Major',
  'ExtendedPentatonicMinor': 'Extended Pentatonic Minor',
  'BluesScale': 'Blues Scale',
  'JapanesePentatonic': 'Japanese Pentatonic',
  'EgyptianPentatonic': 'Egyptian Pentatonic',
  
  // Symmetrical
  'Chromatic': 'Chromatic',
  'WholeTone': 'Whole Tone',
  'DiminishedHalfWhole': 'Diminished (Half-Whole)',
  'DiminishedWholeHalf': 'Diminished (Whole-Half)',
  'Augmented': 'Augmented',
};

/**
 * Convert UI scale name to database key
 * CRITICAL: This normalizes display names like "Aeolian (Natural Minor)" to "Aeolian"
 */
export function scaleNameToDbKey(scaleName: string): string {
  return SCALE_NAME_TO_DB_KEY[scaleName] || scaleName;
}

/**
 * Convert database key to UI scale name
 */
export function dbKeyToScaleName(dbKey: string): string {
  return DB_KEY_TO_SCALE_NAME[dbKey] || dbKey;
}

/**
 * Check if a scale name exists in the mapping
 */
export function isValidScaleName(scaleName: string): boolean {
  return scaleName in SCALE_NAME_TO_DB_KEY;
}

/**
 * Normalize scale name from display format to internal format
 * This is the scale equivalent of normalizeNoteFromDisplay()
 *
 * Examples:
 * - "Aeolian (Natural Minor)" → "Aeolian"
 * - "Ionian (Major)" → "Ionian"
 * - "Major" → "Ionian"
 * - "Minor" → "Aeolian"
 *
 * This ensures the internal system always uses database keys (Aeolian, Ionian, etc.)
 * while the UI can display friendly names (Aeolian (Natural Minor), Major, etc.)
 */
export function normalizeScaleNameFromDisplay(displayName: string): string {
  // Try direct mapping first
  const dbKey = SCALE_NAME_TO_DB_KEY[displayName];
  if (dbKey) {
    return dbKey;
  }

  // If no mapping found, return as-is
  // This handles cases where the scale name is already in database format
  return displayName;
}

/**
 * Get all available scale names for UI dropdown
 */
export function getAllScaleNames(): string[] {
  return Object.keys(SCALE_NAME_TO_DB_KEY);
}

/**
 * Get all database keys
 */
export function getAllDbKeys(): string[] {
  return Object.keys(DB_KEY_TO_SCALE_NAME);
}

/**
 * Map database scale names (from compatible scales) to EXTENDED_SCALE_INTERVALS keys
 * Database returns names like "Minor Pentatonic", "Major (Ionian)", "Natural Minor (Aeolian)"
 * EXTENDED_SCALE_INTERVALS has keys like "Pentatonic Minor", "Ionian (Major)", "Aeolian (Natural Minor)"
 */
export const DB_SCALE_NAME_TO_INTERVALS_KEY: Record<string, string> = {
  // Pentatonic - database uses "Minor Pentatonic", intervals use "Pentatonic Minor"
  'Minor Pentatonic': 'Pentatonic Minor',
  'Major Pentatonic': 'Pentatonic Major',
  'Extended Pentatonic Major': 'Extended Pentatonic Major',
  'Extended Pentatonic Minor': 'Extended Pentatonic Minor',
  'Blues Scale': 'Blues',
  'Japanese Pentatonic': 'Japanese Pentatonic',
  'Egyptian Pentatonic': 'Egyptian Pentatonic',

  // Major modes - database uses "Major (Ionian)", intervals use "Ionian (Major)"
  'Major (Ionian)': 'Ionian (Major)',
  'Major (Parent Scale)': 'Ionian (Major)',
  'Major (Relative Major)': 'Ionian (Major)',
  'Major': 'Ionian (Major)',
  'Ionian': 'Ionian (Major)',

  // Natural Minor - database uses "Natural Minor (Aeolian)", intervals use "Aeolian (Natural Minor)"
  'Natural Minor (Aeolian)': 'Aeolian (Natural Minor)',
  'Natural Minor': 'Aeolian (Natural Minor)',
  'Aeolian (Natural Minor)': 'Aeolian (Natural Minor)',
  'Minor (Aeolian)': 'Aeolian (Natural Minor)',
  'Minor (Natural Minor)': 'Aeolian (Natural Minor)',
  'Aeolian': 'Aeolian (Natural Minor)',
  'Minor': 'Aeolian (Natural Minor)',

  // Other modes - these match directly
  'Dorian': 'Dorian',
  'Phrygian': 'Phrygian',
  'Lydian': 'Lydian',
  'Mixolydian': 'Mixolydian',
  'Locrian': 'Locrian',

  // Minor variants
  'Harmonic Minor': 'Harmonic Minor',
  'Harmonic Minor (Parent)': 'Harmonic Minor',
  'Melodic Minor': 'Melodic Minor',
  'Melodic Minor (Ascending)': 'Melodic Minor',
  'Melodic Minor (Parent)': 'Melodic Minor',

  // Harmonic Minor Modes
  'Locrian Natural 6': 'Locrian ♮6',
  'Locrian Natural 2': 'Locrian ♮6',
  'Locrian Natural 2 (Locrian Natural 6)': 'Locrian ♮6',
  'Ionian #5': 'Ionian ♯5',
  'Dorian #4': 'Dorian ♯4',
  'Phrygian Dominant': 'Phrygian Dominant',
  'Lydian #2': 'Lydian ♯2',
  'Mixolydian b9 b13': 'Mixolydian ♭9 ♭13',
  '7 Mixolydian b9 b13': 'Mixolydian ♭9 ♭13',

  // Melodic Minor Modes
  'Dorian b2': 'Dorian ♭2',
  'Dorian b2 (Phrygian #6)': 'Dorian ♭2',
  'Lydian Augmented': 'Lydian Augmented',
  'Lydian Dominant': 'Lydian Dominant',
  'Lydian Dominant (Acoustic Scale)': 'Lydian Dominant',
  'Lydian Dominant (Overtone Scale)': 'Lydian Dominant',
  'Mixolydian b6': 'Mixolydian ♭6',
  'Aeolian b5': 'Aeolian ♭5',
  'Aeolian b5 (Half-Diminished)': 'Aeolian ♭5',
  'Super Locrian': 'Super Locrian',
  'Altered (Super Locrian)': 'Super Locrian',
  'Altered Dominant (b9, b13)': 'Super Locrian',
  'Altered': 'Super Locrian',

  // Symmetrical Scales
  'Chromatic': 'Chromatic',
  'Whole Tone': 'Whole Tone',
  'Diminished (Half-Whole)': 'Diminished (Half-Whole)',
  'Diminished (Whole-Half)': 'Diminished (Whole-Half)',
  'Augmented': 'Augmented',
};

/**
 * Convert database scale name to EXTENDED_SCALE_INTERVALS key
 * This is used when clicking on a compatible scale card to update the fretboard
 */
export function dbScaleNameToIntervalsKey(dbScaleName: string): string {
  // Remove root note if present (e.g., "B Minor Pentatonic" → "Minor Pentatonic")
  const scaleNameWithoutRoot = dbScaleName.replace(/^[A-G][#b]?\s+/, '');

  // Try direct mapping first
  if (DB_SCALE_NAME_TO_INTERVALS_KEY[scaleNameWithoutRoot]) {
    return DB_SCALE_NAME_TO_INTERVALS_KEY[scaleNameWithoutRoot];
  }

  // Fallback patterns for unmapped scales
  // These are conceptual/theoretical scales that should map to their base scale

  // Chord tones → Use the chord's parent scale
  if (scaleNameWithoutRoot.includes('Chord Tones')) {
    if (scaleNameWithoutRoot.includes('7')) return 'Mixolydian'; // Dominant 7th
    return 'Ionian (Major)'; // Major chord
  }

  // Bebop scales → Use Mixolydian (dominant bebop) or Ionian (major bebop)
  if (scaleNameWithoutRoot.includes('Bebop')) {
    if (scaleNameWithoutRoot.includes('Dominant')) return 'Mixolydian';
    if (scaleNameWithoutRoot.includes('Blues')) return 'Blues';
    return 'Ionian (Major)';
  }

  // Composite/Hybrid scales → Use Blues as base
  if (scaleNameWithoutRoot.includes('Composite') || scaleNameWithoutRoot.includes('Hybrid')) {
    return 'Blues';
  }

  // Power chord / Root-Fifth → Use Pentatonic Minor
  if (scaleNameWithoutRoot.includes('Power Chord') || scaleNameWithoutRoot.includes('Root-Fifth')) {
    return 'Pentatonic Minor';
  }

  // Chord progressions → Use the primary scale
  if (scaleNameWithoutRoot.includes('Progression')) {
    return 'Blues';
  }

  // Suspended harmony → Use Mixolydian
  if (scaleNameWithoutRoot.includes('Suspended') || scaleNameWithoutRoot.includes('Sus')) {
    return 'Mixolydian';
  }

  // Hirajoshi → Use Japanese Pentatonic
  if (scaleNameWithoutRoot.includes('Hirajoshi')) {
    return 'Japanese Pentatonic';
  }

  // Triad → Use parent scale
  if (scaleNameWithoutRoot.includes('Triad')) {
    if (scaleNameWithoutRoot.includes('Augmented')) return 'Augmented';
    if (scaleNameWithoutRoot.includes('Diminished')) return 'Diminished (Half-Whole)';
    return 'Ionian (Major)';
  }

  // Diatonic → Use Ionian
  if (scaleNameWithoutRoot.includes('Diatonic')) {
    return 'Ionian (Major)';
  }

  // Modal ambiguity, quartal harmony, etc. → Use Dorian
  if (scaleNameWithoutRoot.includes('Modal') || scaleNameWithoutRoot.includes('Quartal')) {
    return 'Dorian';
  }

  // Half-Diminished → Use Locrian
  if (scaleNameWithoutRoot.includes('Half-Diminished')) {
    return 'Locrian';
  }

  // Diminished 7th → Use Diminished
  if (scaleNameWithoutRoot.includes('Diminished 7th')) {
    return 'Diminished (Half-Whole)';
  }

  // Blues variations → Use Blues
  if (scaleNameWithoutRoot.includes('Blues')) {
    return 'Blues';
  }

  // Rock/Metal → Use Pentatonic Minor
  if (scaleNameWithoutRoot.includes('Rock') || scaleNameWithoutRoot.includes('Metal')) {
    return 'Pentatonic Minor';
  }

  // Middle Eastern / Maqam → Use Phrygian Dominant
  if (scaleNameWithoutRoot.includes('Maqam') || scaleNameWithoutRoot.includes('Middle Eastern')) {
    return 'Phrygian Dominant';
  }

  // Film Score / Impressionist → Use Whole Tone
  if (scaleNameWithoutRoot.includes('Film Score') || scaleNameWithoutRoot.includes('Impressionist')) {
    return 'Whole Tone';
  }

  // Serialism / 12-Tone → Use Chromatic
  if (scaleNameWithoutRoot.includes('Serialism') || scaleNameWithoutRoot.includes('12-Tone')) {
    return 'Chromatic';
  }

  // Microtonal → Use Chromatic
  if (scaleNameWithoutRoot.includes('Microtonal')) {
    return 'Chromatic';
  }

  // Voice Leading / Stepwise Motion → Use Chromatic
  if (scaleNameWithoutRoot.includes('Voice Leading') || scaleNameWithoutRoot.includes('Stepwise')) {
    return 'Chromatic';
  }

  // Minimalist / Open Tuning / Drone → Use Pentatonic Minor
  if (scaleNameWithoutRoot.includes('Minimalist') || scaleNameWithoutRoot.includes('Drone') || scaleNameWithoutRoot.includes('Open Tuning')) {
    return 'Pentatonic Minor';
  }

  // Jazz / Modal Jazz → Use Dorian
  if (scaleNameWithoutRoot.includes('Modal Jazz') || scaleNameWithoutRoot.includes('Open Voicings')) {
    return 'Dorian';
  }

  // Barry Harris / Jazz concepts → Use Diminished
  if (scaleNameWithoutRoot.includes('Barry Harris')) {
    return 'Diminished (Half-Whole)';
  }

  // Coltrane Changes / Minor-Third Cycles → Use Augmented
  if (scaleNameWithoutRoot.includes('Coltrane') || scaleNameWithoutRoot.includes('Minor-Third Cycles')) {
    return 'Augmented';
  }

  // Chromatic Mediant / Chromatic Approach → Use Chromatic
  if (scaleNameWithoutRoot.includes('Chromatic')) {
    return 'Chromatic';
  }

  // Tritone Substitution → Use Super Locrian
  if (scaleNameWithoutRoot.includes('Tritone Substitution')) {
    return 'Super Locrian';
  }

  // Hexatonic → Use Augmented
  if (scaleNameWithoutRoot.includes('Hexatonic')) {
    return 'Augmented';
  }

  // Octatonic → Use Diminished
  if (scaleNameWithoutRoot.includes('Octatonic')) {
    return 'Diminished (Half-Whole)';
  }

  // Symmetrical Structure → Use Whole Tone
  if (scaleNameWithoutRoot.includes('Symmetrical')) {
    return 'Whole Tone';
  }

  // If no mapping found, return the scale name without root
  // This handles cases where the database name matches the intervals key exactly
  return scaleNameWithoutRoot;
}

