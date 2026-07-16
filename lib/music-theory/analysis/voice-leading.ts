/**
 * Voice Leading Analysis
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { VOICE_LEADING_THRESHOLDS } from '../constants';
import { getPitchClass } from '../core/notes';
import type { 
  TriadVoicing, 
  VoiceLeadingConnection 
} from '../types';

// ============================================================================
// Voice Leading Calculation
// ============================================================================

/**
 * Calculate voice leading between two voicings
 * @param from Source voicing
 * @param to Target voicing
 * @returns Voice leading connection
 */
export function calculateVoiceLeading(
  from: TriadVoicing,
  to: TriadVoicing
): VoiceLeadingConnection {
  // Calculate movement for each voice
  const movements: [number, number, number] = [
    calculateVoiceMovement(from.positions[0], to.positions[0]),
    calculateVoiceMovement(from.positions[1], to.positions[1]),
    calculateVoiceMovement(from.positions[2], to.positions[2])
  ];
  
  // Calculate total movement
  const totalMovement = movements.reduce((sum, m) => sum + Math.abs(m), 0);
  
  // Calculate quality rating
  const quality = calculateVoiceLeadingQuality(totalMovement, movements);
  
  return {
    from,
    to,
    totalMovement,
    movements,
    quality
  };
}

/**
 * Calculate movement for a single voice
 * @param fromPos Source position
 * @param toPos Target position
 * @returns Movement in semitones (positive = up, negative = down)
 */
function calculateVoiceMovement(
  fromPos: { string: number; fret: number },
  toPos: { string: number; fret: number }
): number {
  const fromPitch = getPitchClass(fromPos.string as any, fromPos.fret);
  const toPitch = getPitchClass(toPos.string as any, toPos.fret);
  
  // Calculate shortest path (considering octave wrapping)
  let movement = toPitch - fromPitch;
  
  if (movement > 6) {
    movement -= 12;
  } else if (movement < -6) {
    movement += 12;
  }
  
  return movement;
}

/**
 * Calculate quality rating for voice leading
 * @param totalMovement Total semitone movement
 * @param movements Individual voice movements
 * @returns Quality rating (lower is better, 0-100)
 */
function calculateVoiceLeadingQuality(
  totalMovement: number,
  movements: [number, number, number]
): number {
  let quality = totalMovement;
  
  // Penalty for large individual movements
  const maxMovement = Math.max(...movements.map(Math.abs));
  if (maxMovement > 5) {
    quality += (maxMovement - 5) * 2;
  }
  
  // Bonus for common tones (no movement)
  const commonTones = movements.filter(m => m === 0).length;
  quality -= commonTones * 2;
  
  // Bonus for contrary motion
  const hasContrary = hasContraryMotion(movements);
  if (hasContrary) {
    quality -= 1;
  }
  
  return Math.max(0, quality);
}

/**
 * Check if movements have contrary motion
 * @param movements Voice movements
 * @returns True if there's contrary motion
 */
function hasContraryMotion(movements: [number, number, number]): boolean {
  const hasUp = movements.some(m => m > 0);
  const hasDown = movements.some(m => m < 0);
  return hasUp && hasDown;
}

// ============================================================================
// Voice Leading Analysis
// ============================================================================

/**
 * Get voice leading quality description
 * @param connection Voice leading connection
 * @returns Quality description
 */
export function getVoiceLeadingQualityDescription(
  connection: VoiceLeadingConnection
): string {
  const { totalMovement } = connection;
  
  if (totalMovement <= VOICE_LEADING_THRESHOLDS.excellent) {
    return 'Excellent';
  } else if (totalMovement <= VOICE_LEADING_THRESHOLDS.good) {
    return 'Good';
  } else if (totalMovement <= VOICE_LEADING_THRESHOLDS.acceptable) {
    return 'Acceptable';
  } else {
    return 'Difficult';
  }
}

/**
 * Find best voice leading to a target chord
 * @param fromVoicing Source voicing
 * @param toVoicings Array of possible target voicings
 * @returns Best voice leading connection
 */
export function findBestVoiceLeading(
  fromVoicing: TriadVoicing,
  toVoicings: TriadVoicing[]
): VoiceLeadingConnection | null {
  if (toVoicings.length === 0) return null;
  
  let bestConnection = calculateVoiceLeading(fromVoicing, toVoicings[0]);
  
  for (const toVoicing of toVoicings.slice(1)) {
    const connection = calculateVoiceLeading(fromVoicing, toVoicing);
    if (connection.quality < bestConnection.quality) {
      bestConnection = connection;
    }
  }
  
  return bestConnection;
}

/**
 * Find all good voice leading options
 * @param fromVoicing Source voicing
 * @param toVoicings Array of possible target voicings
 * @param maxQuality Maximum quality rating to include
 * @returns Array of good voice leading connections
 */
export function findGoodVoiceLeadingOptions(
  fromVoicing: TriadVoicing,
  toVoicings: TriadVoicing[],
  maxQuality: number = VOICE_LEADING_THRESHOLDS.good
): VoiceLeadingConnection[] {
  const connections = toVoicings.map(toVoicing => 
    calculateVoiceLeading(fromVoicing, toVoicing)
  );
  
  return connections
    .filter(conn => conn.totalMovement <= maxQuality)
    .sort((a, b) => a.quality - b.quality);
}

/**
 * Check if voice leading is smooth
 * @param connection Voice leading connection
 * @returns True if smooth (total movement <= good threshold)
 */
export function isSmoothVoiceLeading(connection: VoiceLeadingConnection): boolean {
  return connection.totalMovement <= VOICE_LEADING_THRESHOLDS.good;
}

