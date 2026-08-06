/**
 * lib/music-theory/non-heptatonic-triads-db.ts
 *
 * Precomputed diatonic triad database for all non-heptatonic scales.
 *
 * WHY THIS EXISTS
 * The generic "stack thirds by scale degree" algorithm assumes 7 notes per
 * octave. For pentatonic, hexatonic, octatonic, and chromatic scales, degree
 * arithmetic (degree + 2, degree + 4, mod scale length) lands on notes that
 * are not actual 3rds and 5ths, so the results here are precomputed by
 * inspecting real semitone content instead.
 *
 * HOW THE APP SHOULD USE THIS
 * 1. At runtime, look up NON_HEPTATONIC_TRIADS[scaleName].
 * 2. For each PrecomputedTriad, transpose `notes_from_c` by the chosen root's
 *    semitone offset from C to get the actual triad notes in any key.
 *    Equivalently, compute pitch classes directly:
 *      rootPc  = (keyPc + scaleIntervals[degreeIndex]) % 12
 *      thirdPc = (rootPc + intervalFromRoot[0]) % 12
 *      fifthPc = (rootPc + intervalFromRoot[1]) % 12
 * 3. `intervalFromRoot` is always authoritative for fretboard placement;
 *    `notes_from_c` uses practical (sometimes enharmonically simplified)
 *    spellings intended for display, e.g. "C" instead of "B#" in symmetric
 *    scales, so prefer pitch-class math when mapping to frets.
 *
 * CONSTRUCTION RULES (applied uniformly)
 * - Only notes actually present in the scale are used, never chromatic
 *   neighbors from outside the scale.
 * - Preference order for the chord built on each degree:
 *     (4,7) major  >  (3,7) minor  >  (3,6) diminished  >  (4,8) augmented
 * - If a 3rd exists but no standard 5th (7, or 6 with m3, or 8 with M3), the
 *   scale note closest to 7 semitones above the root fills the 5th slot and
 *   the chord is labeled quality 'no5th' (isStandard: false).
 * - If no 3rd exists at all, the 4th replaces it: 'suspended4' when a perfect
 *   5th is present, otherwise 'no5th' with the nearest available upper note.
 * - Roman numerals are positional within the scale (I..V for 5-note scales,
 *   I..VI for 6-note, I..VIII for 8-note, I..XII for chromatic). Uppercase
 *   for major/aug/sus, lowercase for minor/dim, with ° and + and sus4 and
 *   (no5) suffixes as appropriate.
 */

export interface PrecomputedTriad {
  degreeIndex: number;            // 0-based
  romanNumeral: string;           // e.g. "I", "ii", "iii°", "IV+", "v"
  quality: 'major' | 'minor' | 'diminished' | 'augmented' | 'suspended4' | 'power' | 'no5th';
  intervalFromRoot: [number, number]; // [semitones to 3rd slot, semitones to 5th slot] from the degree root
  notes_from_c: [string, string, string]; // triad notes when the scale is rooted on C
  isStandard: boolean;            // true only for clean major/minor/dim/aug triads
}

export const NON_HEPTATONIC_TRIADS: Record<string, PrecomputedTriad[]> = {

  /**
   * Pentatonic Major [0,2,4,7,9] = C D E G A.
   * 5 degrees. Only two full tertian triads live inside the scale (I major
   * and v minor, i.e. the relative-minor pair). Degrees 2 and 4 lack any 3rd
   * and become sus4 chords; degree 3 has a minor 3rd but no 5th (B is absent),
   * so the nearest scale note (C, 8 semitones) fills the 5th slot.
   */
  'Pentatonic Major': [
    { degreeIndex: 0, romanNumeral: 'I',        quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['C', 'E', 'G'],   isStandard: true  },
    { degreeIndex: 1, romanNumeral: 'IIsus4',   quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['D', 'G', 'A'],   isStandard: false },
    { degreeIndex: 2, romanNumeral: 'iii(no5)', quality: 'no5th',      intervalFromRoot: [3, 8], notes_from_c: ['E', 'G', 'C'],   isStandard: false },
    { degreeIndex: 3, romanNumeral: 'IVsus4',   quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['G', 'C', 'D'],   isStandard: false },
    { degreeIndex: 4, romanNumeral: 'v',        quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['A', 'C', 'E'],   isStandard: true  },
  ],

  /**
   * Pentatonic Minor [0,3,5,7,10] = C Eb F G Bb.
   * Mirror of the major pentatonic: i minor and II major are the two real
   * triads (relative-major pair). Degrees 3 and 5 have no 3rd (sus4), and
   * degree 4 (G) has a minor 3rd but no D in the scale, so Eb (8 semitones)
   * fills the 5th slot.
   */
  'Pentatonic Minor': [
    { degreeIndex: 0, romanNumeral: 'i',        quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['C', 'Eb', 'G'],  isStandard: true  },
    { degreeIndex: 1, romanNumeral: 'II',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Eb', 'G', 'Bb'], isStandard: true  },
    { degreeIndex: 2, romanNumeral: 'IIIsus4',  quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['F', 'Bb', 'C'],  isStandard: false },
    { degreeIndex: 3, romanNumeral: 'iv(no5)',  quality: 'no5th',      intervalFromRoot: [3, 8], notes_from_c: ['G', 'Bb', 'Eb'], isStandard: false },
    { degreeIndex: 4, romanNumeral: 'Vsus4',    quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['Bb', 'Eb', 'F'], isStandard: false },
  ],

  /**
   * Extended Pentatonic Major [0,2,4,7,9,11] = C D E G A B (major hexatonic,
   * a major scale without the 4th). 6 degrees. Adding B restores full triads
   * on degrees 3, 4, and 5 (iii, IV, v). Degree 2 still has no 3rd (sus4) and
   * degree 6 (B) lacks its 5th (F# absent), so G fills the 5th slot.
   */
  'Extended Pentatonic Major': [
    { degreeIndex: 0, romanNumeral: 'I',        quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['C', 'E', 'G'],   isStandard: true  },
    { degreeIndex: 1, romanNumeral: 'IIsus4',   quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['D', 'G', 'A'],   isStandard: false },
    { degreeIndex: 2, romanNumeral: 'iii',      quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['E', 'G', 'B'],   isStandard: true  },
    { degreeIndex: 3, romanNumeral: 'IV',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['G', 'B', 'D'],   isStandard: true  },
    { degreeIndex: 4, romanNumeral: 'v',        quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['A', 'C', 'E'],   isStandard: true  },
    { degreeIndex: 5, romanNumeral: 'vi(no5)',  quality: 'no5th',      intervalFromRoot: [3, 8], notes_from_c: ['B', 'D', 'G'],   isStandard: false },
  ],

  /**
   * Extended Pentatonic Minor [0,2,3,5,7,10] = C D Eb F G Bb (minor hexatonic,
   * natural minor without the b6). 6 degrees, four real triads: i, III, v, VI.
   * Degree 2 (D) has its minor 3rd but no 5th (A absent, Bb fills at 8), and
   * degree 4 (F) has no 3rd at all (sus4).
   */
  'Extended Pentatonic Minor': [
    { degreeIndex: 0, romanNumeral: 'i',        quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['C', 'Eb', 'G'],  isStandard: true  },
    { degreeIndex: 1, romanNumeral: 'ii(no5)',  quality: 'no5th',      intervalFromRoot: [3, 8], notes_from_c: ['D', 'F', 'Bb'],  isStandard: false },
    { degreeIndex: 2, romanNumeral: 'III',      quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Eb', 'G', 'Bb'], isStandard: true  },
    { degreeIndex: 3, romanNumeral: 'IVsus4',   quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['F', 'Bb', 'C'],  isStandard: false },
    { degreeIndex: 4, romanNumeral: 'v',        quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['G', 'Bb', 'D'],  isStandard: true  },
    { degreeIndex: 5, romanNumeral: 'VI',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Bb', 'D', 'F'],  isStandard: true  },
  ],

  /**
   * Blues [0,3,5,6,7,10] = C Eb F Gb G Bb.
   * 6 degrees. The tonic is minor from strict scale content (the major 3rd E
   * is a performance inflection, not a scale member), and the bIII (Eb) is a
   * full major triad, matching blues harmony convention. Degree 4 (Gb, the
   * blue note) yields a major 3rd (Bb) but no usable 5th, C fills at 6
   * semitones. Degree 5 (G) has a minor 3rd but no D, Eb fills at 8.
   */
  'Blues': [
    { degreeIndex: 0, romanNumeral: 'i',        quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['C', 'Eb', 'G'],  isStandard: true  },
    { degreeIndex: 1, romanNumeral: 'II',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Eb', 'G', 'Bb'], isStandard: true  },
    { degreeIndex: 2, romanNumeral: 'IIIsus4',  quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['F', 'Bb', 'C'],  isStandard: false },
    { degreeIndex: 3, romanNumeral: 'IV(no5)',  quality: 'no5th',      intervalFromRoot: [4, 6], notes_from_c: ['Gb', 'Bb', 'C'], isStandard: false },
    { degreeIndex: 4, romanNumeral: 'v(no5)',   quality: 'no5th',      intervalFromRoot: [3, 8], notes_from_c: ['G', 'Bb', 'Eb'], isStandard: false },
    { degreeIndex: 5, romanNumeral: 'VIsus4',   quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['Bb', 'Eb', 'F'], isStandard: false },
  ],

  /**
   * Japanese Pentatonic [0,1,5,7,8] = C Db F G Ab (the "in" / Miyako-bushi
   * type scale). 5 degrees. The tonic has no 3rd (sus4). Degrees 2 and 3
   * (Db major, F minor) are the two full triads. Degree 4 (G) has a 4th but
   * no 3rd and no 5th, Db fills at 6 semitones. Degree 5 (Ab) has a major 3rd
   * but no 5th; Db (5) and F (9) are equally distant from 7, F is chosen
   * because Ab C F sounds as an F minor inversion rather than a cluster.
   */
  'Japanese Pentatonic': [
    { degreeIndex: 0, romanNumeral: 'Isus4',    quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['C', 'F', 'G'],   isStandard: false },
    { degreeIndex: 1, romanNumeral: 'II',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Db', 'F', 'Ab'], isStandard: true  },
    { degreeIndex: 2, romanNumeral: 'iii',      quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['F', 'Ab', 'C'],  isStandard: true  },
    { degreeIndex: 3, romanNumeral: 'IVsus4(no5)', quality: 'no5th',   intervalFromRoot: [5, 6], notes_from_c: ['G', 'C', 'Db'],  isStandard: false },
    { degreeIndex: 4, romanNumeral: 'V(no5)',   quality: 'no5th',      intervalFromRoot: [4, 9], notes_from_c: ['Ab', 'C', 'F'],  isStandard: false },
  ],

  /**
   * Egyptian Pentatonic [0,2,5,7,10] = C D F G Bb (suspended pentatonic).
   * 5 degrees. The tonic itself is a sus4 chord, which is why this mode is
   * called the suspended pentatonic. Two full triads exist: iv (G minor) and
   * V (Bb major). Degree 2 (D) has a minor 3rd but no A, Bb fills at 8.
   */
  'Egyptian Pentatonic': [
    { degreeIndex: 0, romanNumeral: 'Isus4',    quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['C', 'F', 'G'],   isStandard: false },
    { degreeIndex: 1, romanNumeral: 'ii(no5)',  quality: 'no5th',      intervalFromRoot: [3, 8], notes_from_c: ['D', 'F', 'Bb'],  isStandard: false },
    { degreeIndex: 2, romanNumeral: 'IIIsus4',  quality: 'suspended4', intervalFromRoot: [5, 7], notes_from_c: ['F', 'Bb', 'C'],  isStandard: false },
    { degreeIndex: 3, romanNumeral: 'iv',       quality: 'minor',      intervalFromRoot: [3, 7], notes_from_c: ['G', 'Bb', 'D'],  isStandard: true  },
    { degreeIndex: 4, romanNumeral: 'V',        quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Bb', 'D', 'F'],  isStandard: true  },
  ],

  /**
   * Whole Tone [0,2,4,6,8,10] = C D E F# G# A#.
   * 6 degrees, fully symmetric. Every degree yields exactly one triad type:
   * augmented (4,8), since only major 3rds exist and no perfect 5th is
   * available anywhere. Some spellings are enharmonically simplified for
   * display (e.g. E G# C instead of E G# B#).
   */
  'Whole Tone': [
    { degreeIndex: 0, romanNumeral: 'I+',       quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['C', 'E', 'G#'],  isStandard: true  },
    { degreeIndex: 1, romanNumeral: 'II+',      quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['D', 'F#', 'A#'], isStandard: true  },
    { degreeIndex: 2, romanNumeral: 'III+',     quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['E', 'G#', 'C'],  isStandard: true  },
    { degreeIndex: 3, romanNumeral: 'IV+',      quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['F#', 'A#', 'D'], isStandard: true  },
    { degreeIndex: 4, romanNumeral: 'V+',       quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['G#', 'C', 'E'],  isStandard: true  },
    { degreeIndex: 5, romanNumeral: 'VI+',      quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['A#', 'D', 'F#'], isStandard: true  },
  ],

  /**
   * Diminished Half-Whole [0,1,3,4,6,7,9,10] = C Db Eb E F# G A Bb (the
   * "dominant diminished" scale). 8 degrees, strictly alternating pattern:
   * major triads on the half-step-entry degrees (I, III, V, VII) and
   * diminished triads on the others (ii°, iv°, vi°, viii°). All 8 are real
   * triads. Minor triads also exist on the major-triad roots; major is
   * preferred per the (4,7)-first rule and dominant-scale convention.
   */
  'Diminished (Half-Whole)': [
    { degreeIndex: 0, romanNumeral: 'I',        quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['C', 'E', 'G'],    isStandard: true },
    { degreeIndex: 1, romanNumeral: 'ii°',      quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['Db', 'E', 'G'],   isStandard: true },
    { degreeIndex: 2, romanNumeral: 'III',      quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Eb', 'G', 'Bb'],  isStandard: true },
    { degreeIndex: 3, romanNumeral: 'iv°',      quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['E', 'G', 'Bb'],   isStandard: true },
    { degreeIndex: 4, romanNumeral: 'V',        quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['F#', 'A#', 'C#'], isStandard: true },
    { degreeIndex: 5, romanNumeral: 'vi°',      quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['G', 'Bb', 'Db'],  isStandard: true },
    { degreeIndex: 6, romanNumeral: 'VII',      quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['A', 'C#', 'E'],   isStandard: true },
    { degreeIndex: 7, romanNumeral: 'viii°',    quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['Bb', 'Db', 'E'],  isStandard: true },
  ],

  /**
   * Diminished Whole-Half [0,2,3,5,6,8,9,11] = C D Eb F F# G# A B (the
   * "fully diminished" scale). 8 degrees, the mirror of Half-Whole:
   * diminished triads on the odd degrees (i°, iii°, v°, vii°) starting with
   * the tonic, major triads on the even degrees (II, IV, VI, VIII). Some
   * spellings enharmonically simplified for display (e.g. Eb Gb A for
   * Eb Gb Bbb).
   */
  'Diminished (Whole-Half)': [
    { degreeIndex: 0, romanNumeral: 'i°',       quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['C', 'Eb', 'Gb'],  isStandard: true },
    { degreeIndex: 1, romanNumeral: 'II',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['D', 'F#', 'A'],   isStandard: true },
    { degreeIndex: 2, romanNumeral: 'iii°',     quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['Eb', 'Gb', 'A'],  isStandard: true },
    { degreeIndex: 3, romanNumeral: 'IV',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['F', 'A', 'C'],    isStandard: true },
    { degreeIndex: 4, romanNumeral: 'v°',       quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['F#', 'A', 'C'],   isStandard: true },
    { degreeIndex: 5, romanNumeral: 'VI',       quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Ab', 'C', 'Eb'],  isStandard: true },
    { degreeIndex: 6, romanNumeral: 'vii°',     quality: 'diminished', intervalFromRoot: [3, 6], notes_from_c: ['A', 'C', 'Eb'],   isStandard: true },
    { degreeIndex: 7, romanNumeral: 'VIII',     quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['B', 'D#', 'F#'],  isStandard: true },
  ],

  /**
   * Augmented [0,3,4,7,8,11] = C Eb E G Ab B.
   * 6 degrees, symmetric in major 3rds. Alternating major and augmented
   * triads: major on degrees 1, 3, 5 and augmented on degrees 2, 4, 6.
   * The scale also contains three minor triads on the major-triad roots
   * (Cm, Em, Abm); major is preferred per the (4,7)-first rule. Spellings
   * enharmonically simplified for display (e.g. B D# G for B D# F##).
   */
  'Augmented': [
    { degreeIndex: 0, romanNumeral: 'I',        quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['C', 'E', 'G'],    isStandard: true },
    { degreeIndex: 1, romanNumeral: 'II+',      quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['Eb', 'G', 'B'],   isStandard: true },
    { degreeIndex: 2, romanNumeral: 'III',      quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['E', 'G#', 'B'],   isStandard: true },
    { degreeIndex: 3, romanNumeral: 'IV+',      quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['G', 'B', 'D#'],   isStandard: true },
    { degreeIndex: 4, romanNumeral: 'V',        quality: 'major',      intervalFromRoot: [4, 7], notes_from_c: ['Ab', 'C', 'Eb'],  isStandard: true },
    { degreeIndex: 5, romanNumeral: 'VI+',      quality: 'augmented',  intervalFromRoot: [4, 8], notes_from_c: ['B', 'D#', 'G'],   isStandard: true },
  ],

  /**
   * Chromatic [0..11] = all 12 pitch classes.
   * By convention (as specified for this app), every chromatic degree carries
   * a major triad built on it, since every pitch class supports a full major
   * triad from chromatic content. Uppercase numerals I through XII.
   */
  'Chromatic': [
    { degreeIndex: 0,  romanNumeral: 'I',    quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['C', 'E', 'G'],    isStandard: true },
    { degreeIndex: 1,  romanNumeral: 'II',   quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['Db', 'F', 'Ab'],  isStandard: true },
    { degreeIndex: 2,  romanNumeral: 'III',  quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['D', 'F#', 'A'],   isStandard: true },
    { degreeIndex: 3,  romanNumeral: 'IV',   quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['Eb', 'G', 'Bb'],  isStandard: true },
    { degreeIndex: 4,  romanNumeral: 'V',    quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['E', 'G#', 'B'],   isStandard: true },
    { degreeIndex: 5,  romanNumeral: 'VI',   quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['F', 'A', 'C'],    isStandard: true },
    { degreeIndex: 6,  romanNumeral: 'VII',  quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['F#', 'A#', 'C#'], isStandard: true },
    { degreeIndex: 7,  romanNumeral: 'VIII', quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['G', 'B', 'D'],    isStandard: true },
    { degreeIndex: 8,  romanNumeral: 'IX',   quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['Ab', 'C', 'Eb'],  isStandard: true },
    { degreeIndex: 9,  romanNumeral: 'X',    quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['A', 'C#', 'E'],   isStandard: true },
    { degreeIndex: 10, romanNumeral: 'XI',   quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['Bb', 'D', 'F'],   isStandard: true },
    { degreeIndex: 11, romanNumeral: 'XII',  quality: 'major', intervalFromRoot: [4, 7], notes_from_c: ['B', 'D#', 'F#'],  isStandard: true },
  ],
};
