/**
 * CAGED Shape Definitions
 * Defines the 5 CAGED shapes for all chord qualities
 * Based on reference: .blueprints/CAGED-music-theory-ref/caged-data.ts
 */

import type { ChordQuality, CAGEDShapeName, CAGEDShape } from './types';

// ============================================================================
// E SHAPE - Root on 6th string (and 1st string)
// ============================================================================

const E_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 2, interval: '5' },
      { string: 3, fretOffset: 2, interval: 'R' },
      { string: 2, fretOffset: 1, interval: '3' },
      { string: 1, fretOffset: 0, interval: '5' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  minor: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 2, interval: '5' },
      { string: 3, fretOffset: 2, interval: 'R' },
      { string: 2, fretOffset: 0, interval: 'b3' },
      { string: 1, fretOffset: 0, interval: '5' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  diminished: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 1, interval: 'b5' },
      { string: 3, fretOffset: 2, interval: 'R' },
      { string: 2, fretOffset: 0, interval: 'b3' },
      { string: 1, fretOffset: 0, interval: 'b5' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  augmented: {
    name: 'E',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 3, interval: '#5' },
      { string: 3, fretOffset: 2, interval: 'R' },
      { string: 2, fretOffset: 1, interval: '3' },
      { string: 1, fretOffset: 1, interval: '#5' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
};

// ============================================================================
// D SHAPE - Root on 4th string
// ============================================================================

const D_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },
      { string: 2, fretOffset: 2, interval: '3' },
      { string: 1, fretOffset: 3, interval: '5' },
      { string: 0, fretOffset: 2, interval: 'R' },
    ],
  },
  minor: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },
      { string: 2, fretOffset: 2, interval: 'b3' },
      { string: 1, fretOffset: 3, interval: '5' },
      { string: 0, fretOffset: 1, interval: 'R' },
    ],
  },
  diminished: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },
      { string: 2, fretOffset: 2, interval: 'b3' },
      { string: 1, fretOffset: 2, interval: 'b5' },
      { string: 0, fretOffset: 1, interval: 'R' },
    ],
  },
  augmented: {
    name: 'D',
    anchorString: 3,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 3, fretOffset: 0, interval: 'R' },
      { string: 2, fretOffset: 2, interval: '3' },
      { string: 1, fretOffset: 3, interval: '#5' },
      { string: 0, fretOffset: 2, interval: 'R' },
    ],
  },
};

// ============================================================================
// C SHAPE - Root on 5th string
// ============================================================================

const C_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 2, interval: '3' },
      { string: 2, fretOffset: 0, interval: '5' },
      { string: 1, fretOffset: 1, interval: 'R' },
      { string: 0, fretOffset: 0, interval: '3' },
    ],
  },
  minor: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 1, interval: 'b3' },
      { string: 2, fretOffset: 0, interval: '5' },
      { string: 1, fretOffset: 1, interval: 'R' },
      { string: 0, fretOffset: 0, interval: 'b3' },
    ],
  },
  diminished: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: -1,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 1, interval: 'b3' },
      { string: 2, fretOffset: -1, interval: 'b5' },
      { string: 1, fretOffset: 1, interval: 'R' },
    ],
  },
  augmented: {
    name: 'C',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 2, interval: '3' },
      { string: 2, fretOffset: 1, interval: '#5' },
      { string: 1, fretOffset: 1, interval: 'R' },
      { string: 0, fretOffset: 0, interval: '3' },
    ],
  },
};

// ============================================================================
// A SHAPE - Root on 5th string
// ============================================================================

const A_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 2, interval: '5' },
      { string: 2, fretOffset: 2, interval: 'R' },
      { string: 1, fretOffset: 2, interval: '3' },
      { string: 0, fretOffset: 0, interval: '5' },
    ],
  },
  minor: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 2, interval: '5' },
      { string: 2, fretOffset: 2, interval: 'R' },
      { string: 1, fretOffset: 1, interval: 'b3' },
      { string: 0, fretOffset: 0, interval: '5' },
    ],
  },
  diminished: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 2,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 1, interval: 'b5' },
      { string: 2, fretOffset: 2, interval: 'R' },
      { string: 1, fretOffset: 1, interval: 'b3' },
      { string: 0, fretOffset: 0, interval: 'b5' },
    ],
  },
  augmented: {
    name: 'A',
    anchorString: 4,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 4, fretOffset: 0, interval: 'R' },
      { string: 3, fretOffset: 3, interval: '#5' },
      { string: 2, fretOffset: 2, interval: 'R' },
      { string: 1, fretOffset: 2, interval: '3' },
      { string: 0, fretOffset: 1, interval: '#5' },
    ],
  },
};

// ============================================================================
// G SHAPE - Root on 6th string
// ============================================================================

const G_SHAPES: Record<ChordQuality, CAGEDShape> = {
  major: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 4,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 2, interval: '3' },
      { string: 3, fretOffset: 0, interval: '5' },
      { string: 2, fretOffset: 0, interval: 'R' },
      { string: 1, fretOffset: 0, interval: '3' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  minor: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 3,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 1, interval: 'b3' },
      { string: 3, fretOffset: 0, interval: '5' },
      { string: 2, fretOffset: 0, interval: 'R' },
      { string: 1, fretOffset: 0, interval: 'b3' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  diminished: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: -1,
    maxFretOffset: 2,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 1, interval: 'b3' },
      { string: 3, fretOffset: -1, interval: 'b5' },
      { string: 2, fretOffset: 0, interval: 'R' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
  augmented: {
    name: 'G',
    anchorString: 5,
    anchorFretOffset: 0,
    minFretOffset: 0,
    maxFretOffset: 4,
    notes: [
      { string: 5, fretOffset: 0, interval: 'R' },
      { string: 4, fretOffset: 2, interval: '3' },
      { string: 3, fretOffset: 1, interval: '#5' },
      { string: 2, fretOffset: 0, interval: 'R' },
      { string: 1, fretOffset: 0, interval: '3' },
      { string: 0, fretOffset: 0, interval: 'R' },
    ],
  },
};

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * All CAGED shapes organized by shape name
 */
export const CAGED_SHAPES: Record<CAGEDShapeName, Record<ChordQuality, CAGEDShape>> = {
  'C': C_SHAPES,
  'A': A_SHAPES,
  'G': G_SHAPES,
  'E': E_SHAPES,
  'D': D_SHAPES,
};

