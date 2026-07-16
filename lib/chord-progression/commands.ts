/**
 * Command implementations for undo/redo system
 */

import { Command } from './undo-redo-manager';
import { ChordInstance, ScaleModeInstance } from './types';

/**
 * Command for updating chords
 */
export class UpdateChordsCommand implements Command {
  description: string;
  private previousChords: ChordInstance[];
  private newChords: ChordInstance[];
  private updateCallback: (chords: ChordInstance[]) => void;

  constructor(
    previousChords: ChordInstance[],
    newChords: ChordInstance[],
    updateCallback: (chords: ChordInstance[]) => void,
    description: string = 'Update chords'
  ) {
    // Deep copy to prevent reference issues
    this.previousChords = JSON.parse(JSON.stringify(previousChords));
    this.newChords = JSON.parse(JSON.stringify(newChords));
    this.updateCallback = updateCallback;
    this.description = description;
  }

  execute(): void {
    this.updateCallback(this.newChords);
  }

  undo(): void {
    this.updateCallback(this.previousChords);
  }
}

/**
 * Command for updating scale modes
 */
export class UpdateScaleModesCommand implements Command {
  description: string;
  private previousScaleModes: ScaleModeInstance[];
  private newScaleModes: ScaleModeInstance[];
  private updateCallback: (scaleModes: ScaleModeInstance[]) => void;

  constructor(
    previousScaleModes: ScaleModeInstance[],
    newScaleModes: ScaleModeInstance[],
    updateCallback: (scaleModes: ScaleModeInstance[]) => void,
    description: string = 'Update scale modes'
  ) {
    // Deep copy to prevent reference issues
    this.previousScaleModes = JSON.parse(JSON.stringify(previousScaleModes));
    this.newScaleModes = JSON.parse(JSON.stringify(newScaleModes));
    this.updateCallback = updateCallback;
    this.description = description;
  }

  execute(): void {
    this.updateCallback(this.newScaleModes);
  }

  undo(): void {
    this.updateCallback(this.previousScaleModes);
  }
}

/**
 * Command for adding a chord
 */
export class AddChordCommand implements Command {
  description: string;
  private chord: ChordInstance;
  private currentChords: ChordInstance[];
  private updateCallback: (chords: ChordInstance[]) => void;

  constructor(
    chord: ChordInstance,
    currentChords: ChordInstance[],
    updateCallback: (chords: ChordInstance[]) => void
  ) {
    this.chord = JSON.parse(JSON.stringify(chord));
    this.currentChords = JSON.parse(JSON.stringify(currentChords));
    this.updateCallback = updateCallback;
    this.description = `Add chord ${chord.chordSymbol}`;
  }

  execute(): void {
    this.updateCallback([...this.currentChords, this.chord]);
  }

  undo(): void {
    this.updateCallback(this.currentChords);
  }
}

/**
 * Command for deleting a chord
 */
export class DeleteChordCommand implements Command {
  description: string;
  private chordId: string;
  private previousChords: ChordInstance[];
  private updateCallback: (chords: ChordInstance[]) => void;

  constructor(
    chordId: string,
    previousChords: ChordInstance[],
    updateCallback: (chords: ChordInstance[]) => void
  ) {
    this.chordId = chordId;
    this.previousChords = JSON.parse(JSON.stringify(previousChords));
    this.updateCallback = updateCallback;
    const chord = previousChords.find(c => c.id === chordId);
    this.description = `Delete chord ${chord?.chordSymbol || 'unknown'}`;
  }

  execute(): void {
    this.updateCallback(this.previousChords.filter(c => c.id !== this.chordId));
  }

  undo(): void {
    this.updateCallback(this.previousChords);
  }
}

/**
 * Command for editing a chord
 */
export class EditChordCommand implements Command {
  description: string;
  private previousChords: ChordInstance[];
  private newChords: ChordInstance[];
  private updateCallback: (chords: ChordInstance[]) => void;

  constructor(
    previousChords: ChordInstance[],
    newChords: ChordInstance[],
    updateCallback: (chords: ChordInstance[]) => void,
    chordSymbol: string
  ) {
    this.previousChords = JSON.parse(JSON.stringify(previousChords));
    this.newChords = JSON.parse(JSON.stringify(newChords));
    this.updateCallback = updateCallback;
    this.description = `Edit chord to ${chordSymbol}`;
  }

  execute(): void {
    this.updateCallback(this.newChords);
  }

  undo(): void {
    this.updateCallback(this.previousChords);
  }
}

