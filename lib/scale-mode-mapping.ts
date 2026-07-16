/**
 * Scale/Mode Name Mapping System
 * Maps GPT-4o-mini scale/mode names and key names to internal format
 */

/**
 * All scale/mode names that GPT-4o-mini can output
 * These are the canonical names used in the AI prompt
 */
export const GPT_SCALE_NAMES = [
  'Ionian',
  'Dorian',
  'Phrygian',
  'Lydian',
  'Mixolydian',
  'Aeolian',
  'Locrian',
  'Melodic Minor',
  'Dorian b2',
  'Lydian Augmented',
  'Lydian Dominant',
  'Mixolydian b6',
  'Locrian Natural 2',
  'Altered',
  'Harmonic Minor',
  'Locrian Natural 6',
  'Ionian #5',
  'Dorian #4',
  'Phrygian Dominant',
  'Lydian #2',
  'Super Locrian bb7',
  'Major Pentatonic',
  'Minor Pentatonic',
  'Major Blues',
  'Minor Blues',
  'Whole Tone',
  'Diminished (Whole-Half)',
  'Diminished (Half-Whole)',
  'Chromatic',
] as const;

/**
 * All key root names that GPT-4o-mini can output
 * Includes all enharmonic equivalents
 */
export const GPT_KEY_NAMES = [
  'C',
  'C#',
  'Db',
  'D',
  'D#',
  'Eb',
  'E',
  'F',
  'F#',
  'Gb',
  'G',
  'G#',
  'Ab',
  'A',
  'A#',
  'Bb',
  'B',
  'Cb',
  'E#',
  'Fb',
  'B#',
] as const;

/**
 * Map GPT-4o-mini scale names to internal scale names used by the app
 * This handles any differences in naming conventions
 */
export function mapGPTScaleNameToInternal(gptScaleName: string): string {
  // Direct mapping - most names are already compatible
  const scaleMap: Record<string, string> = {
    'Ionian': 'Ionian',
    'Dorian': 'Dorian',
    'Phrygian': 'Phrygian',
    'Lydian': 'Lydian',
    'Mixolydian': 'Mixolydian',
    'Aeolian': 'Aeolian',
    'Locrian': 'Locrian',
    'Melodic Minor': 'Melodic Minor',
    'Dorian b2': 'Dorian ♭2',
    'Lydian Augmented': 'Lydian Augmented',
    'Lydian Dominant': 'Lydian Dominant',
    'Mixolydian b6': 'Mixolydian ♭6',
    'Locrian Natural 2': 'Locrian ♮2',
    'Altered': 'Altered',
    'Harmonic Minor': 'Harmonic Minor',
    'Locrian Natural 6': 'Locrian ♮6',
    'Ionian #5': 'Ionian ♯5',
    'Dorian #4': 'Dorian ♯4',
    'Phrygian Dominant': 'Phrygian Dominant',
    'Lydian #2': 'Lydian ♯2',
    'Super Locrian bb7': 'Super Locrian ♭♭7',
    'Major Pentatonic': 'Major Pentatonic',
    'Minor Pentatonic': 'Minor Pentatonic',
    'Major Blues': 'Major Blues',
    'Minor Blues': 'Minor Blues',
    'Whole Tone': 'Whole Tone',
    'Diminished (Whole-Half)': 'Diminished (Whole-Half)',
    'Diminished (Half-Whole)': 'Diminished (Half-Whole)',
    'Chromatic': 'Chromatic',
  };

  return scaleMap[gptScaleName] || gptScaleName;
}

/**
 * Map GPT-4o-mini key names to internal key names
 * Normalizes enharmonic equivalents to the app's preferred notation
 */
export function mapGPTKeyNameToInternal(gptKeyName: string): string {
  // Normalize to sharp notation (app's internal standard)
  const keyMap: Record<string, string> = {
    'C': 'C',
    'C#': 'C#',
    'Db': 'C#',  // Normalize to sharp
    'D': 'D',
    'D#': 'D#',
    'Eb': 'D#',  // Normalize to sharp
    'E': 'E',
    'F': 'F',
    'F#': 'F#',
    'Gb': 'F#',  // Normalize to sharp
    'G': 'G',
    'G#': 'G#',
    'Ab': 'G#',  // Normalize to sharp
    'A': 'A',
    'A#': 'A#',
    'Bb': 'A#',  // Normalize to sharp
    'B': 'B',
    'Cb': 'B',   // Normalize to B
    'E#': 'F',   // Normalize to F
    'Fb': 'E',   // Normalize to E
    'B#': 'C',   // Normalize to C
  };

  return keyMap[gptKeyName] || gptKeyName;
}

/**
 * Validate if a scale name is a valid GPT scale name
 */
export function isValidGPTScaleName(scaleName: string): boolean {
  return GPT_SCALE_NAMES.includes(scaleName as any);
}

/**
 * Validate if a key name is a valid GPT key name
 */
export function isValidGPTKeyName(keyName: string): boolean {
  return GPT_KEY_NAMES.includes(keyName as any);
}

