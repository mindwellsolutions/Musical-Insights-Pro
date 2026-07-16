/**
 * Keyboard shortcuts hook for chord progression builder
 */

import { useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onSave?: () => void;
  onLoad?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onDelete?: () => void;
  isPlaying?: boolean;
}

export function useKeyboardShortcuts(config: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // Spacebar - Play/Pause toggle
      if (event.code === 'Space') {
        event.preventDefault();
        if (config.isPlaying && config.onPause) {
          config.onPause();
        } else if (!config.isPlaying && config.onPlay) {
          config.onPlay();
        }
      }

      // Escape - Stop
      if (event.code === 'Escape') {
        event.preventDefault();
        if (config.onStop) {
          config.onStop();
        }
      }

      // Ctrl/Cmd + S - Save
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        if (config.onSave) {
          config.onSave();
        }
      }

      // Ctrl/Cmd + O - Load
      if ((event.ctrlKey || event.metaKey) && event.key === 'o') {
        event.preventDefault();
        if (config.onLoad) {
          config.onLoad();
        }
      }

      // Ctrl/Cmd + Z - Undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (config.onUndo) {
          config.onUndo();
        }
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y - Redo
      if (
        ((event.ctrlKey || event.metaKey) && event.key === 'z' && event.shiftKey) ||
        ((event.ctrlKey || event.metaKey) && event.key === 'y')
      ) {
        event.preventDefault();
        if (config.onRedo) {
          config.onRedo();
        }
      }

      // Delete or Backspace - Delete selected
      if (event.code === 'Delete' || event.code === 'Backspace') {
        event.preventDefault();
        if (config.onDelete) {
          config.onDelete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [config]);
}

