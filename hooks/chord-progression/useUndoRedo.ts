/**
 * React hook for undo/redo functionality
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { UndoRedoManager, Command } from '@/lib/chord-progression/undo-redo-manager';

export function useUndoRedo(maxHistorySize: number = 50) {
  const managerRef = useRef<UndoRedoManager | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [lastUndoDescription, setLastUndoDescription] = useState<string | null>(null);
  const [lastRedoDescription, setLastRedoDescription] = useState<string | null>(null);

  // Initialize manager
  useEffect(() => {
    managerRef.current = new UndoRedoManager(maxHistorySize);

    // Subscribe to history changes
    const unsubscribe = managerRef.current.subscribe(() => {
      if (managerRef.current) {
        setCanUndo(managerRef.current.canUndo());
        setCanRedo(managerRef.current.canRedo());
        setLastUndoDescription(managerRef.current.getLastUndoDescription());
        setLastRedoDescription(managerRef.current.getLastRedoDescription());
      }
    });

    return unsubscribe;
  }, [maxHistorySize]);

  const execute = useCallback((command: Command) => {
    managerRef.current?.execute(command);
  }, []);

  const undo = useCallback(() => {
    return managerRef.current?.undo() || false;
  }, []);

  const redo = useCallback(() => {
    return managerRef.current?.redo() || false;
  }, []);

  const clear = useCallback(() => {
    managerRef.current?.clear();
  }, []);

  const getUndoHistory = useCallback(() => {
    return managerRef.current?.getUndoHistory() || [];
  }, []);

  const getRedoHistory = useCallback(() => {
    return managerRef.current?.getRedoHistory() || [];
  }, []);

  const restoreToUndoState = useCallback((index: number) => {
    return managerRef.current?.restoreToUndoState(index) || false;
  }, []);

  const restoreToRedoState = useCallback((index: number) => {
    return managerRef.current?.restoreToRedoState(index) || false;
  }, []);

  return {
    execute,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    lastUndoDescription,
    lastRedoDescription,
    getUndoHistory,
    getRedoHistory,
    restoreToUndoState,
    restoreToRedoState,
  };
}

