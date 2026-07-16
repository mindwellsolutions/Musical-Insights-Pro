/**
 * Playback State Hook
 * Manages real-time playback state and provides current chord/scale information
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ChordInstance, ScaleModeInstance } from '@/lib/chord-progression/types';
import { getCurrentChord, getCurrentScale, getTotalDuration } from '@/lib/playback-context';

interface UsePlaybackStateProps {
  chords: ChordInstance[];
  scales: ScaleModeInstance[];
  isPlaying: boolean;
  currentTime: number;
  bpm?: number;
}

interface PlaybackState {
  currentChord: ChordInstance | null;
  currentScale: ScaleModeInstance | null;
  previousChord: ChordInstance | null;
  nextChord: ChordInstance | null;
  totalDuration: number;
  progress: number; // 0-1
}

export function usePlaybackState({
  chords,
  scales,
  isPlaying,
  currentTime,
  bpm = 120,
}: UsePlaybackStateProps): PlaybackState {
  const [state, setState] = useState<PlaybackState>({
    currentChord: null,
    currentScale: null,
    previousChord: null,
    nextChord: null,
    totalDuration: 0,
    progress: 0,
  });

  const prevChordRef = useRef<ChordInstance | null>(null);

  // Update state when time changes
  useEffect(() => {
    const currentChord = getCurrentChord(chords, currentTime);
    const currentScale = getCurrentScale(scales, currentTime);
    const totalDuration = getTotalDuration(chords, scales);
    const progress = totalDuration > 0 ? currentTime / totalDuration : 0;

    // Find previous and next chords
    const sortedChords = [...chords].sort((a, b) => a.startTime - b.startTime);
    const currentIndex = sortedChords.findIndex(c => c.id === currentChord?.id);
    
    const previousChord = currentIndex > 0 ? sortedChords[currentIndex - 1] : null;
    const nextChord = currentIndex >= 0 && currentIndex < sortedChords.length - 1 
      ? sortedChords[currentIndex + 1] 
      : null;

    setState({
      currentChord,
      currentScale,
      previousChord,
      nextChord,
      totalDuration,
      progress,
    });

    // Track chord changes for potential callbacks
    if (currentChord && currentChord.id !== prevChordRef.current?.id) {
      prevChordRef.current = currentChord;
    }
  }, [chords, scales, currentTime]);

  return state;
}

/**
 * Hook for managing playback timing
 */
export function usePlaybackTimer(
  isPlaying: boolean,
  onTimeUpdate: (time: number) => void,
  bpm: number = 120
) {
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(Date.now());
  const currentTimeRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const beatsPerSecond = bpm / 60;
    lastTimeRef.current = Date.now();

    const tick = () => {
      const now = Date.now();
      const deltaMs = now - lastTimeRef.current;
      lastTimeRef.current = now;

      // Convert milliseconds to beats
      const deltaBeats = (deltaMs / 1000) * beatsPerSecond;
      currentTimeRef.current += deltaBeats;

      onTimeUpdate(currentTimeRef.current);
      animationFrameRef.current = requestAnimationFrame(tick);
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, bpm, onTimeUpdate]);

  const seek = useCallback((time: number) => {
    currentTimeRef.current = time;
    onTimeUpdate(time);
  }, [onTimeUpdate]);

  const reset = useCallback(() => {
    currentTimeRef.current = 0;
    onTimeUpdate(0);
  }, [onTimeUpdate]);

  return { seek, reset };
}

