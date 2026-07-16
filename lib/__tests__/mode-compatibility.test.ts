/**
 * Tests for Mode Compatibility Database
 * Verifies music theory accuracy and proper mode mappings
 */

import { 
  getCompatibleModesForTriad, 
  getPrimaryModeForTriad,
  getModeByName,
  getModeDisplayName
} from '../mode-compatibility-database';
import { TriadType } from '../triad-theory';

describe('Mode Compatibility Database', () => {
  describe('Major Triad Modes', () => {
    test('should have 4 compatible modes for major triads', () => {
      const modes = getCompatibleModesForTriad('major');
      expect(modes).toHaveLength(4);
    });

    test('should include Ionian, Lydian, Mixolydian, and Major Pentatonic', () => {
      const modes = getCompatibleModesForTriad('major');
      const modeNames = modes.map(m => m.modeName);
      expect(modeNames).toContain('Ionian');
      expect(modeNames).toContain('Lydian');
      expect(modeNames).toContain('Mixolydian');
      expect(modeNames).toContain('MajorPentatonic');
    });

    test('primary mode should be Ionian', () => {
      const primary = getPrimaryModeForTriad('major');
      expect(primary?.modeName).toBe('Ionian');
      expect(primary?.isPrimary).toBe(true);
    });

    test('all modes should have major 3rd (interval 4)', () => {
      const modes = getCompatibleModesForTriad('major');
      modes.forEach(mode => {
        expect(mode.intervals).toContain(4); // Major 3rd
      });
    });
  });

  describe('Minor Triad Modes', () => {
    test('should have 5 compatible modes for minor triads', () => {
      const modes = getCompatibleModesForTriad('minor');
      expect(modes).toHaveLength(5);
    });

    test('should include Aeolian, Dorian, Phrygian', () => {
      const modes = getCompatibleModesForTriad('minor');
      const modeNames = modes.map(m => m.modeName);
      expect(modeNames).toContain('Aeolian');
      expect(modeNames).toContain('Dorian');
      expect(modeNames).toContain('Phrygian');
    });

    test('primary mode should be Aeolian', () => {
      const primary = getPrimaryModeForTriad('minor');
      expect(primary?.modeName).toBe('Aeolian');
      expect(primary?.isPrimary).toBe(true);
    });

    test('all modes should have minor 3rd (interval 3)', () => {
      const modes = getCompatibleModesForTriad('minor');
      modes.forEach(mode => {
        expect(mode.intervals).toContain(3); // Minor 3rd
      });
    });
  });

  describe('Diminished Triad Modes', () => {
    test('should have 3 compatible modes for diminished triads', () => {
      const modes = getCompatibleModesForTriad('diminished');
      expect(modes).toHaveLength(3);
    });

    test('should include Locrian', () => {
      const modes = getCompatibleModesForTriad('diminished');
      const modeNames = modes.map(m => m.modeName);
      expect(modeNames).toContain('Locrian');
    });

    test('primary mode should be Locrian', () => {
      const primary = getPrimaryModeForTriad('diminished');
      expect(primary?.modeName).toBe('Locrian');
      expect(primary?.isPrimary).toBe(true);
    });

    test('Locrian should have minor 3rd and diminished 5th', () => {
      const locrian = getModeByName('diminished', 'Locrian');
      expect(locrian?.intervals).toContain(3); // Minor 3rd
      expect(locrian?.intervals).toContain(6); // Diminished 5th
    });
  });

  describe('Augmented Triad Modes', () => {
    test('should have 4 compatible modes for augmented triads', () => {
      const modes = getCompatibleModesForTriad('augmented');
      expect(modes).toHaveLength(4);
    });

    test('should include Whole Tone', () => {
      const modes = getCompatibleModesForTriad('augmented');
      const modeNames = modes.map(m => m.modeName);
      expect(modeNames).toContain('WholeTone');
    });

    test('primary mode should be Whole Tone', () => {
      const primary = getPrimaryModeForTriad('augmented');
      expect(primary?.modeName).toBe('WholeTone');
      expect(primary?.isPrimary).toBe(true);
    });

    test('Whole Tone should have major 3rd and augmented 5th', () => {
      const wholeTone = getModeByName('augmented', 'WholeTone');
      expect(wholeTone?.intervals).toContain(4); // Major 3rd
      expect(wholeTone?.intervals).toContain(8); // Augmented 5th
    });
  });

  describe('Helper Functions', () => {
    test('getModeByName should find mode by modeName', () => {
      const mode = getModeByName('major', 'Ionian');
      expect(mode).not.toBeNull();
      expect(mode?.modeName).toBe('Ionian');
    });

    test('getModeByName should find mode by scaleDbKey', () => {
      const mode = getModeByName('major', 'Lydian');
      expect(mode).not.toBeNull();
      expect(mode?.scaleDbKey).toBe('Lydian');
    });

    test('getModeDisplayName should format correctly', () => {
      const mode = getPrimaryModeForTriad('major');
      const displayName = getModeDisplayName('C', mode!);
      expect(displayName).toBe('C Ionian (Major)');
    });
  });

  describe('Music Theory Validation', () => {
    test('all modes should have valid intervals', () => {
      const triadTypes: TriadType[] = ['major', 'minor', 'diminished', 'augmented'];
      
      triadTypes.forEach(triadType => {
        const modes = getCompatibleModesForTriad(triadType);
        modes.forEach(mode => {
          expect(mode.intervals.length).toBeGreaterThan(0);
          mode.intervals.forEach(interval => {
            expect(interval).toBeGreaterThanOrEqual(0);
            expect(interval).toBeLessThanOrEqual(11);
          });
        });
      });
    });

    test('each triad type should have at least one primary mode', () => {
      const triadTypes: TriadType[] = ['major', 'minor', 'diminished', 'augmented'];
      
      triadTypes.forEach(triadType => {
        const primary = getPrimaryModeForTriad(triadType);
        expect(primary).not.toBeNull();
        expect(primary?.isPrimary).toBe(true);
      });
    });
  });
});

