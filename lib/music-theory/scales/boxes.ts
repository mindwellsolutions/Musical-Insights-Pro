/**
 * Pentatonic Box Position System
 * Based on blueprint: .blueprints/triad-anchor-sys/05-algorithms-logic.md
 */

import { findAllPositions } from '../core/notes';
import type { 
  PentatonicScale, 
  PentatonicBox, 
  BoxPosition, 
  FretboardNote,
  FretPosition,
  FretNumber
} from '../types';

// ============================================================================
// Box Position Calculation
// ============================================================================

/**
 * Calculate all five box positions for a pentatonic scale
 * @param scale Pentatonic scale
 * @param maxFret Maximum fret to consider (default 15)
 * @returns Array of five pentatonic boxes
 */
export function calculatePentatonicBoxes(
  scale: PentatonicScale,
  maxFret: FretNumber = 15
): PentatonicBox[] {
  const boxes: PentatonicBox[] = [];
  
  // Each box starts on a different scale degree
  for (let i = 0; i < 5; i++) {
    const boxRoot = scale.notes[i];
    const position = (i + 1) as BoxPosition;
    
    // Find root positions for this box
    const rootPositions = findAllPositions(boxRoot.pitchClass, 0, maxFret);
    
    // For each root position, create a box
    for (const rootPos of rootPositions) {
      const box = createBoxAtPosition(scale, position, rootPos.fret, maxFret);
      if (box) {
        boxes.push(box);
      }
    }
  }
  
  return boxes;
}

/**
 * Create a pentatonic box at a specific fret position
 * @param scale Pentatonic scale
 * @param position Box position number (1-5)
 * @param startFret Starting fret for the box
 * @param maxFret Maximum fret
 * @returns Pentatonic box or null if invalid
 */
function createBoxAtPosition(
  scale: PentatonicScale,
  position: BoxPosition,
  startFret: FretNumber,
  maxFret: FretNumber
): PentatonicBox | null {
  // Box typically spans 4-5 frets
  const endFret = Math.min(startFret + 4, maxFret);
  
  if (endFret > maxFret) return null;
  
  // Find all scale notes within this fret range
  const notes: FretboardNote[] = [];
  const rootPositions: FretPosition[] = [];
  
  for (const scaleNote of scale.notes) {
    const positions = findAllPositions(scaleNote.pitchClass, startFret, endFret);
    
    for (const pos of positions) {
      notes.push({
        ...pos,
        note: scaleNote,
        isPentatonic: true,
        isRoot: scaleNote.pitchClass === scale.root.pitchClass
      });
      
      if (scaleNote.pitchClass === scale.root.pitchClass) {
        rootPositions.push(pos);
      }
    }
  }
  
  return {
    position,
    scale,
    startFret,
    endFret,
    notes,
    rootPositions
  };
}

// ============================================================================
// Box Position Analysis
// ============================================================================

/**
 * Find which box position a fret is in
 * @param fret Fret number
 * @param boxes Array of pentatonic boxes
 * @returns Box position or null if not in any box
 */
export function findBoxForFret(
  fret: FretNumber,
  boxes: PentatonicBox[]
): PentatonicBox | null {
  return boxes.find(box => fret >= box.startFret && fret <= box.endFret) || null;
}

/**
 * Get the primary box for a zone (closest to zone center)
 * @param zoneCenterFret Zone center fret
 * @param boxes Array of pentatonic boxes
 * @returns Primary box for the zone
 */
export function getPrimaryBoxForZone(
  zoneCenterFret: FretNumber,
  boxes: PentatonicBox[]
): PentatonicBox | null {
  if (boxes.length === 0) return null;
  
  // Find box with center closest to zone center
  let closestBox = boxes[0];
  let closestDistance = Math.abs(getBoxCenter(boxes[0]) - zoneCenterFret);
  
  for (const box of boxes.slice(1)) {
    const boxCenter = getBoxCenter(box);
    const distance = Math.abs(boxCenter - zoneCenterFret);
    
    if (distance < closestDistance) {
      closestDistance = distance;
      closestBox = box;
    }
  }
  
  return closestBox;
}

/**
 * Get the center fret of a box
 * @param box Pentatonic box
 * @returns Center fret
 */
function getBoxCenter(box: PentatonicBox): FretNumber {
  return Math.round((box.startFret + box.endFret) / 2);
}

/**
 * Check if a fretboard position is within a pentatonic box
 * @param position Fretboard position
 * @param box Pentatonic box
 * @returns True if position is in the box
 */
export function isPositionInBox(
  position: FretPosition,
  box: PentatonicBox
): boolean {
  return position.fret >= box.startFret && position.fret <= box.endFret;
}

/**
 * Get all notes in a box on a specific string
 * @param box Pentatonic box
 * @param string String number
 * @returns Array of fretboard notes on that string
 */
export function getBoxNotesOnString(
  box: PentatonicBox,
  string: number
): FretboardNote[] {
  return box.notes.filter(note => note.string === string);
}

