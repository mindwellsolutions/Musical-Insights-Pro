'use client';

/**
 * Song Overlapping Chords Sidebar
 * Displays overlapping chords filtered by the current fretboard position
 * Shows chords that overlap with the scale from the 2nd fretboard
 */

import { useMemo, useState, useRef, useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { TriadPosition } from '@/lib/triad-positions';
import { OverlappingChord } from '@/lib/music-theory/overlapping-chords/types';
import { findOverlappingChordsFromVisibleNotes } from '@/lib/music-theory/overlapping-chords/song-builder-finder';
import OverlappingChordCard from './OverlappingChordCard';
import { X, Music, ChevronLeft } from 'lucide-react';

interface SongOverlappingChordsSidebarProps {
  theme: ThemeConfig;
  visibleScaleNotes: string[]; // Actual visible notes from 2nd fretboard
  allowedChords?: Array<{ rootNote: string; chordQuality: string }>; // Chords from progression
  selectedTriadPosition: TriadPosition | null;
  isVisible?: boolean;
  onClose?: () => void;
  tuning?: string[];
  stringCount?: number;
}

export default function SongOverlappingChordsSidebar({
  theme,
  visibleScaleNotes,
  allowedChords,
  selectedTriadPosition,
  isVisible = true,
  onClose,
  tuning = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount = 6,
}: SongOverlappingChordsSidebarProps) {
  // Drag and position state
  const [sidebarPosition, setSidebarPosition] = useState(0); // 0 = docked at right edge
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPosition.current = sidebarPosition;
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = dragStartX.current - e.clientX; // Reversed: dragging left increases position
      const newPosition = Math.max(0, dragStartPosition.current + deltaX); // Prevent negative values
      setSidebarPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, sidebarPosition]);

  // Redock to right edge
  const handleRedock = () => {
    setSidebarPosition(0);
  };

  // Calculate overlapping chords based on visible scale notes from 2nd fretboard
  const overlappingChords = useMemo(() => {
    if (!selectedTriadPosition || visibleScaleNotes.length === 0) {
      return [];
    }

    console.log('📊 SongOverlappingChordsSidebar - Calculating overlapping chords:');
    console.log('  - visibleScaleNotes:', visibleScaleNotes);
    console.log('  - allowedChords:', allowedChords);

    return findOverlappingChordsFromVisibleNotes(
      visibleScaleNotes,
      selectedTriadPosition,
      allowedChords, // Only show chords from the chord progression
      tuning,
      stringCount
    );
  }, [visibleScaleNotes, selectedTriadPosition, allowedChords, tuning, stringCount]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed flex flex-col shadow-2xl"
      style={{
        width: '420px',
        top: '64px', // Start immediately below header (h-16 = 64px)
        bottom: '48px', // End above playback controls (h-12 = 48px)
        height: 'auto',
        background: 'linear-gradient(to bottom, #1a1a1a, #0f0f0f)',
        borderLeft: `2px solid ${theme.border}`,
        right: `${sidebarPosition}px`,
        transition: isDragging ? 'none' : 'right 0.3s ease',
        zIndex: 'var(--cpb-z-right-sidebar)',
      }}
    >
      {/* Drag Handle and Redock Button - Left side */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full flex flex-col items-center gap-1"
        style={{
          background: theme.bgSecondary,
          borderLeft: `1px solid ${theme.border}`,
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          borderRadius: '8px 0 0 8px',
          padding: '8px 4px',
        }}
      >
        {/* 6-Dot Drag Handle */}
        <div
          onMouseDown={handleDragStart}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-opacity-80 transition-all"
          style={{
            color: theme.textPrimary,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3px',
          }}
          title="Drag to reposition sidebar"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: theme.textSecondary,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Redock Button */}
        <button
          onClick={handleRedock}
          className="p-1.5 rounded hover:bg-opacity-80 transition-all mt-1"
          style={{
            color: theme.textPrimary,
            background: sidebarPosition > 0 ? theme.bgTertiary : 'transparent',
          }}
          title="Redock sidebar to right edge"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div>
          <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
            Overlapping Chords
          </h3>
          <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
            {overlappingChords.length} chord{overlappingChords.length !== 1 ? 's' : ''} in position
          </p>
          {visibleScaleNotes.length > 0 && (
            <p className="text-xs mt-0.5" style={{ color: theme.accentPrimary }}>
              {visibleScaleNotes.length} visible scale notes
            </p>
          )}
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: theme.textSecondary }}
            title="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {overlappingChords.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Music className="w-12 h-12 mb-3" style={{ color: theme.textSecondary }} />
            <p className="text-sm text-center" style={{ color: theme.textSecondary }}>
              No overlapping chords found
            </p>
            <p className="text-xs text-center mt-2" style={{ color: theme.textSecondary }}>
              {!selectedTriadPosition
                ? 'Select a position to see overlapping chords'
                : 'Try a different position or scale'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {overlappingChords.map((chord, index) => (
              <OverlappingChordCard
                key={`${chord.chordSymbol}-${chord.fretRange[0]}-${index}`}
                theme={theme}
                chord={chord}
                tuning={tuning}
                stringCount={stringCount}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

