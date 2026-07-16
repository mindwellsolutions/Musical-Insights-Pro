/**
 * Voicing Descriptions Database
 * AI-generated descriptions for different voicing positions and characteristics
 */

export interface VoicingDescription {
  positionType: string;
  description: string;
  emotionalQuality: string;
}

/**
 * Descriptions based on fretboard position
 */
export const POSITION_DESCRIPTIONS: Record<string, VoicingDescription> = {
  'open': {
    positionType: 'Open Position',
    description: 'Resonant and full-bodied with ringing open strings. Classic acoustic guitar sound with natural sustain and harmonic richness.',
    emotionalQuality: 'Warm, familiar, and grounded',
  },
  'low': {
    positionType: 'Low Position (Frets 1-4)',
    description: 'Thick, punchy, and powerful. Strong fundamental tones with clear note definition and easy playability.',
    emotionalQuality: 'Bold, confident, and assertive',
  },
  'mid': {
    positionType: 'Mid Position (Frets 5-9)',
    description: 'Balanced and versatile. Sweet spot for both rhythm and lead playing with excellent clarity and projection.',
    emotionalQuality: 'Smooth, professional, and polished',
  },
  'high': {
    positionType: 'High Position (Frets 10-15)',
    description: 'Bright, singing, and articulate. Upper register voicings with shimmering harmonics and vocal-like quality.',
    emotionalQuality: 'Soaring, expressive, and ethereal',
  },
  'very-high': {
    positionType: 'Very High Position (Frets 16+)',
    description: 'Crystalline and delicate. Extreme upper register with bell-like tones and intimate character.',
    emotionalQuality: 'Delicate, refined, and sophisticated',
  },
};

/**
 * Descriptions based on voicing structure
 */
export const STRUCTURE_DESCRIPTIONS: Record<string, VoicingDescription> = {
  'barre': {
    positionType: 'Barre Chord',
    description: 'Movable and powerful. Full-bodied sound with consistent voicing across the fretboard, perfect for rhythm playing.',
    emotionalQuality: 'Strong, reliable, and commanding',
  },
  'partial-barre': {
    positionType: 'Partial Barre',
    description: 'Hybrid voicing combining barred and individual notes. Offers unique tonal colors and comfortable hand positions.',
    emotionalQuality: 'Versatile, nuanced, and expressive',
  },
  'fingerstyle': {
    positionType: 'Fingerstyle Voicing',
    description: 'Optimized for individual note clarity. Each voice rings clearly, perfect for arpeggios and fingerpicking patterns.',
    emotionalQuality: 'Delicate, intricate, and detailed',
  },
  'compact': {
    positionType: 'Compact Voicing',
    description: 'Tight cluster of notes within 2-3 frets. Dense harmonic content with easy transitions and minimal hand movement.',
    emotionalQuality: 'Focused, intense, and concentrated',
  },
  'spread': {
    positionType: 'Spread Voicing',
    description: 'Wide interval spacing across 4+ frets. Open, airy sound with distinct voice separation and harmonic clarity.',
    emotionalQuality: 'Spacious, expansive, and atmospheric',
  },
  'drop-2': {
    positionType: 'Drop-2 Voicing',
    description: 'Jazz standard voicing with second voice dropped an octave. Smooth voice leading and professional sound.',
    emotionalQuality: 'Sophisticated, jazzy, and elegant',
  },
  'drop-3': {
    positionType: 'Drop-3 Voicing',
    description: 'Third voice dropped an octave for wider spread. Creates lush, open harmony with excellent bass support.',
    emotionalQuality: 'Rich, full, and harmonically complex',
  },
};

/**
 * Descriptions based on CAGED shape
 */
export const CAGED_DESCRIPTIONS: Record<string, VoicingDescription> = {
  'C': {
    positionType: 'C Shape',
    description: 'Based on open C chord form. Root on 5th string with characteristic voicing pattern, versatile across the neck.',
    emotionalQuality: 'Familiar, comfortable, and accessible',
  },
  'A': {
    positionType: 'A Shape',
    description: 'Based on open A chord form. Root on 5th string, compact and powerful with strong bass presence.',
    emotionalQuality: 'Punchy, direct, and energetic',
  },
  'G': {
    positionType: 'G Shape',
    description: 'Based on open G chord form. Root on 6th string with wide spread, creates full and resonant sound.',
    emotionalQuality: 'Open, ringing, and majestic',
  },
  'E': {
    positionType: 'E Shape',
    description: 'Based on open E chord form. Root on 6th string, most common barre chord shape with balanced voicing.',
    emotionalQuality: 'Classic, powerful, and versatile',
  },
  'D': {
    positionType: 'D Shape',
    description: 'Based on open D chord form. Root on 4th string, bright and focused with upper register emphasis.',
    emotionalQuality: 'Bright, clear, and articulate',
  },
};

/**
 * Get description for a voicing based on its characteristics
 */
export function getVoicingDescription(
  startFret: number,
  cagedShape?: string,
  hasOpenStrings?: boolean,
  fretSpan?: number
): VoicingDescription {
  // Determine position type
  if (hasOpenStrings) {
    return POSITION_DESCRIPTIONS['open'];
  } else if (startFret <= 4) {
    return POSITION_DESCRIPTIONS['low'];
  } else if (startFret <= 9) {
    return POSITION_DESCRIPTIONS['mid'];
  } else if (startFret <= 15) {
    return POSITION_DESCRIPTIONS['high'];
  } else {
    return POSITION_DESCRIPTIONS['very-high'];
  }
}

/**
 * Get CAGED shape description
 */
export function getCAGEDDescription(shapeName: string): VoicingDescription {
  return CAGED_DESCRIPTIONS[shapeName] || CAGED_DESCRIPTIONS['E'];
}

/**
 * Get structure description based on voicing characteristics
 */
export function getStructureDescription(
  fretSpan: number,
  hasBarre: boolean
): VoicingDescription {
  if (hasBarre) {
    return STRUCTURE_DESCRIPTIONS['barre'];
  } else if (fretSpan <= 2) {
    return STRUCTURE_DESCRIPTIONS['compact'];
  } else if (fretSpan >= 4) {
    return STRUCTURE_DESCRIPTIONS['spread'];
  } else {
    return STRUCTURE_DESCRIPTIONS['fingerstyle'];
  }
}

/**
 * Combine multiple descriptions into a comprehensive voicing description
 */
export function getCombinedVoicingDescription(
  chordQuality: string,
  startFret: number,
  cagedShape?: string,
  hasOpenStrings?: boolean,
  fretSpan?: number,
  hasBarre?: boolean
): string {
  const positionDesc = getVoicingDescription(startFret, cagedShape, hasOpenStrings, fretSpan);
  const structureDesc = fretSpan !== undefined && hasBarre !== undefined
    ? getStructureDescription(fretSpan, hasBarre)
    : null;

  if (structureDesc) {
    return `${positionDesc.description} ${structureDesc.emotionalQuality}.`;
  }
  
  return positionDesc.description;
}

