/**
 * Shared cross-track selection state for the timeline.
 * Manages selectedChordIds and selectedScaleModeIds together so Shift+click
 * can add blocks from both tracks to a single unified selection.
 */

import { useState, useCallback } from 'react';

export function useTimelineSelection() {
  const [selectedChordIds, setSelectedChordIds] = useState<Set<string>>(new Set());
  const [selectedScaleModeIds, setSelectedScaleModeIds] = useState<Set<string>>(new Set());

  /**
   * Select a chord. Multi-select (Shift/Ctrl/Cmd) adds to existing selection
   * across both tracks. Single click clears scale selections first.
   */
  const handleChordSelect = useCallback((chordId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      setSelectedChordIds(prev => {
        const next = new Set(prev);
        if (next.has(chordId)) next.delete(chordId);
        else next.add(chordId);
        return next;
      });
      // Keep scale mode selections intact in cross-track multi-select
    } else {
      setSelectedChordIds(new Set([chordId]));
      setSelectedScaleModeIds(new Set());
    }
  }, []);

  /**
   * Select a scale mode. Multi-select adds to existing selection across both tracks.
   * Single click clears chord selections first.
   */
  const handleScaleModeSelect = useCallback((scaleModeId: string, isMultiSelect: boolean) => {
    if (isMultiSelect) {
      setSelectedScaleModeIds(prev => {
        const next = new Set(prev);
        if (next.has(scaleModeId)) next.delete(scaleModeId);
        else next.add(scaleModeId);
        return next;
      });
      // Keep chord selections intact in cross-track multi-select
    } else {
      setSelectedScaleModeIds(new Set([scaleModeId]));
      setSelectedChordIds(new Set());
    }
  }, []);

  /** Clear all selections across both tracks */
  const clearAll = useCallback(() => {
    setSelectedChordIds(new Set());
    setSelectedScaleModeIds(new Set());
  }, []);

  return {
    selectedChordIds,
    selectedScaleModeIds,
    /** Direct setter — used by selection-box drag in ChordProgressionTrack */
    setSelectedChordIds,
    /** Direct setter — used by selection-box drag in ScaleModeTrack */
    setSelectedScaleModeIds,
    handleChordSelect,
    handleScaleModeSelect,
    clearAll,
  };
}
