/**
 * Chord color system for visual coding
 */

export interface ChordColor {
  base: string;
  glow: string;
  gradient: string;
}

export const CHORD_COLORS: Record<string, ChordColor> = {
  // Major chords - Warm, bright colors
  major: {
    base: '#3b82f6',
    glow: 'rgba(59, 130, 246, 0.4)',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  },
  // Minor chords - Cooler, subdued colors
  minor: {
    base: '#8b5cf6',
    glow: 'rgba(139, 92, 246, 0.4)',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  },
  // Dominant 7th - Energetic, tension
  dominant7: {
    base: '#f59e0b',
    glow: 'rgba(245, 158, 11, 0.4)',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  },
  // Major 7th - Sophisticated, jazzy
  major7: {
    base: '#06b6d4',
    glow: 'rgba(6, 182, 212, 0.4)',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  // Minor 7th - Smooth, mellow
  minor7: {
    base: '#a855f7',
    glow: 'rgba(168, 85, 247, 0.4)',
    gradient: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)',
  },
  // Diminished - Dark, tense
  diminished: {
    base: '#ef4444',
    glow: 'rgba(239, 68, 68, 0.4)',
    gradient: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  },
  // Augmented - Bright, unstable
  augmented: {
    base: '#f97316',
    glow: 'rgba(249, 115, 22, 0.4)',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
  },
  // Sus chords - Neutral, open
  sus: {
    base: '#22c55e',
    glow: 'rgba(34, 197, 94, 0.4)',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  },
  // Default fallback
  default: {
    base: '#6b7280',
    glow: 'rgba(107, 114, 128, 0.4)',
    gradient: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
  },
};

/**
 * Determine chord type from chord symbol
 */
export function getChordType(chordSymbol: string): string {
  const symbol = chordSymbol.toLowerCase();
  
  // Check for specific chord types
  if (symbol.includes('dim')) return 'diminished';
  if (symbol.includes('aug') || symbol.includes('+')) return 'augmented';
  if (symbol.includes('sus')) return 'sus';
  if (symbol.includes('maj7') || symbol.includes('ma7') || symbol.includes('M7')) return 'major7';
  if (symbol.includes('m7') || symbol.includes('min7') || symbol.includes('-7')) return 'minor7';
  if (symbol.includes('7') && !symbol.includes('maj') && !symbol.includes('m')) return 'dominant7';
  if (symbol.includes('m') || symbol.includes('min') || symbol.includes('-')) return 'minor';
  
  // Default to major
  return 'major';
}

/**
 * Get color scheme for a chord
 */
export function getChordColor(chordSymbol: string): ChordColor {
  const type = getChordType(chordSymbol);
  return CHORD_COLORS[type] || CHORD_COLORS.default;
}

