/**
 * Undo/Redo Manager using Command Pattern
 * Industry-standard approach for managing state history
 */

import { VerseData } from './types';

export interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

export interface HistoryEntry {
  command: Command;
  timestamp: number;
  description: string;
}

export class UndoRedoManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private maxHistorySize: number;
  private listeners: Set<() => void> = new Set();

  constructor(maxHistorySize: number = 50) {
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Execute a command and add it to the undo stack
   */
  execute(command: Command): void {
    command.execute();
    
    const entry: HistoryEntry = {
      command,
      timestamp: Date.now(),
      description: command.description,
    };

    this.undoStack.push(entry);
    
    // Clear redo stack when new command is executed
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }

    this.notifyListeners();
  }

  /**
   * Undo the last command
   */
  undo(): boolean {
    const entry = this.undoStack.pop();
    if (!entry) return false;

    entry.command.undo();
    this.redoStack.push(entry);
    this.notifyListeners();
    return true;
  }

  /**
   * Redo the last undone command
   */
  redo(): boolean {
    const entry = this.redoStack.pop();
    if (!entry) return false;

    entry.command.execute();
    this.undoStack.push(entry);
    this.notifyListeners();
    return true;
  }

  /**
   * Check if undo is available
   */
  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  /**
   * Get undo history
   */
  getUndoHistory(): HistoryEntry[] {
    return [...this.undoStack];
  }

  /**
   * Get redo history
   */
  getRedoHistory(): HistoryEntry[] {
    return [...this.redoStack];
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to history changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of history changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Get the last undo description
   */
  getLastUndoDescription(): string | null {
    const last = this.undoStack[this.undoStack.length - 1];
    return last ? last.description : null;
  }

  /**
   * Get the last redo description
   */
  getLastRedoDescription(): string | null {
    const last = this.redoStack[this.redoStack.length - 1];
    return last ? last.description : null;
  }

  /**
   * Restore to a specific state in the undo history
   * @param index - The index in the undo stack to restore to (0 = oldest, length-1 = newest)
   */
  restoreToUndoState(index: number): boolean {
    if (index < 0 || index >= this.undoStack.length) return false;

    // Calculate how many undos we need to perform
    const undosNeeded = this.undoStack.length - 1 - index;

    // Perform the undos
    for (let i = 0; i < undosNeeded; i++) {
      const entry = this.undoStack.pop();
      if (!entry) return false;
      entry.command.undo();
      this.redoStack.push(entry);
    }

    this.notifyListeners();
    return true;
  }

  /**
   * Restore to a specific state in the redo history
   * @param index - The index in the redo stack to restore to (0 = oldest, length-1 = newest)
   */
  restoreToRedoState(index: number): boolean {
    if (index < 0 || index >= this.redoStack.length) return false;

    // Calculate how many redos we need to perform
    const redosNeeded = this.redoStack.length - 1 - index;

    // Perform the redos
    for (let i = 0; i < redosNeeded; i++) {
      const entry = this.redoStack.pop();
      if (!entry) return false;
      entry.command.execute();
      this.undoStack.push(entry);
    }

    this.notifyListeners();
    return true;
  }
}

