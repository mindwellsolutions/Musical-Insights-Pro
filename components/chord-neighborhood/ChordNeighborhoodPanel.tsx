'use client';

/**
 * Chord Neighborhood Panel
 * Displays nearby diatonic chords relative to an anchor voicing
 */

import React, { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { AnchorVoicing, NearbyChord } from '@/lib/music-theory/neighborhood';
import { getChordSymbol } from '@/lib/music-theory/neighborhood/diatonic';
import { X } from 'lucide-react';
import NearbyChordButton from './NearbyChordButton';
import AnchorInfo from './AnchorInfo';

interface ChordNeighborhoodPanelProps {
  theme: ThemeConfig;
  anchorVoicing: AnchorVoicing | null;
  nearbyChords: NearbyChord[];
  anchorVoicings?: AnchorVoicing[]; // Multiple anchor voicings for shared notes
  activeAnchorIndex?: number; // Active tab index
  nearbyChordsByAnchor?: NearbyChord[][]; // Nearby chords for each anchor
  onActiveAnchorChange?: (index: number) => void; // Tab change handler
  onAnchorHover?: (anchor: AnchorVoicing | null) => void; // Hover handler for highlighting on fretboard
  selectedOverlay: NearbyChord | null;
  onNearbyChordClick: (chord: NearbyChord | null) => void;
  onClose: () => void;
  showAllChords: boolean;
  onShowAllChordsChange: (show: boolean) => void;
  chordColors?: string[]; // Color palette for nearby chords
  selectionMode?: 'triads' | 'chords'; // Mode: triads or full chords
  onSelectionModeChange?: (mode: 'triads' | 'chords') => void;
  onOpenChordSelector?: () => void; // Open the full chord selector modal
}

export default function ChordNeighborhoodPanel({
  theme,
  anchorVoicing,
  nearbyChords,
  anchorVoicings = [],
  activeAnchorIndex = 0,
  nearbyChordsByAnchor = [],
  onActiveAnchorChange,
  onAnchorHover,
  selectedOverlay,
  onNearbyChordClick,
  onClose,
  showAllChords,
  onShowAllChordsChange,
  chordColors = [],
  selectionMode = 'triads',
  onSelectionModeChange,
  onOpenChordSelector,
}: ChordNeighborhoodPanelProps) {
  if (!anchorVoicing) return null;

  // Determine if we have multiple anchors (tabs mode)
  const hasMultipleAnchors = anchorVoicings.length > 1;

  // Get the current anchor and nearby chords based on active tab
  const currentAnchor = hasMultipleAnchors ? anchorVoicings[activeAnchorIndex] : anchorVoicing;
  const currentNearbyChords = hasMultipleAnchors ? nearbyChordsByAnchor[activeAnchorIndex] || [] : nearbyChords;

  const anchorSymbol = getChordSymbol(currentAnchor.rootNote, currentAnchor.quality);

  return (
    <div
      className="rounded-lg p-4 shadow-lg"
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
        maxWidth: '400px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
          Chord Neighborhood
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded hover:opacity-70 transition-opacity"
          style={{ color: theme.textSecondary }}
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Mode Toggle: Triads ↔ Chords */}
      {onSelectionModeChange && (
        <div className="mb-4 flex items-center justify-center gap-2 p-2 rounded-lg" style={{ background: theme.bgTertiary }}>
          <button
            onClick={() => onSelectionModeChange('triads')}
            className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: selectionMode === 'triads' ? theme.accentPrimary : 'transparent',
              color: selectionMode === 'triads' ? '#ffffff' : theme.textSecondary,
              border: `1px solid ${selectionMode === 'triads' ? theme.accentPrimary : theme.border}`,
            }}
          >
            Triads
          </button>
          <button
            onClick={() => onSelectionModeChange('chords')}
            className="flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all"
            style={{
              background: selectionMode === 'chords' ? theme.accentPrimary : 'transparent',
              color: selectionMode === 'chords' ? '#ffffff' : theme.textSecondary,
              border: `1px solid ${selectionMode === 'chords' ? theme.accentPrimary : theme.border}`,
            }}
          >
            Chords
          </button>
        </div>
      )}

      {/* Tabs - Only show when multiple anchors are present */}
      {hasMultipleAnchors && (
        <div className="flex gap-2 mb-4 overflow-x-auto overflow-y-hidden pb-1">
          {anchorVoicings.map((anchor, index) => {
            const tabSymbol = getChordSymbol(anchor.rootNote, anchor.quality);
            const isActive = index === activeAnchorIndex;

            return (
              <button
                key={index}
                onClick={() => onActiveAnchorChange?.(index)}
                onMouseEnter={() => onAnchorHover?.(anchor)}
                onMouseLeave={() => onAnchorHover?.(null)}
                className="px-3.5 py-2.5 rounded-lg transition-all whitespace-nowrap font-semibold text-sm flex items-center gap-2 hover:scale-[1.02] flex-shrink-0"
                style={{
                  background: isActive
                    ? `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentPrimary}dd)`
                    : theme.bgTertiary,
                  color: isActive ? '#ffffff' : theme.textPrimary,
                  border: `2px solid ${isActive ? theme.accentPrimary : theme.border}`,
                  boxShadow: isActive
                    ? `0 0 12px ${theme.accentPrimary}66, 0 2px 6px rgba(0,0,0,0.2)`
                    : '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: isActive ? 'rgba(255,255,255,0.25)' : theme.bgSecondary,
                    color: isActive ? '#ffffff' : theme.textSecondary,
                  }}
                >
                  {index + 1}
                </span>
                <span>{tabSymbol}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Anchor Info */}
      <AnchorInfo
        theme={theme}
        anchorVoicing={currentAnchor}
        anchorSymbol={anchorSymbol}
      />

      {/* Open Chord Selector Button - Only show in Chords mode */}
      {selectionMode === 'chords' && onOpenChordSelector && (
        <div className="mt-3">
          <button
            onClick={onOpenChordSelector}
            className="w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all hover:opacity-90 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
            }}
          >
            + Add Chord from Library
          </button>
        </div>
      )}

      {/* Hide Nearby Chord Button - Only show when an overlay is selected */}
      {selectedOverlay && (
        <div className="mt-3">
          <button
            onClick={() => onNearbyChordClick(null)}
            className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-all hover:opacity-80"
            style={{
              background: theme.accentPrimary,
              color: '#ffffff',
              border: `1px solid ${theme.accentPrimary}`,
            }}
          >
            Hide Nearby Chord - Return to Triads
          </button>
        </div>
      )}

      {/* Nearby Chords */}
      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>
          Nearby Diatonic Chords
        </h4>

        {currentNearbyChords.length === 0 ? (
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            No nearby chords found in range
          </p>
        ) : (
          <div className="space-y-2">
            {currentNearbyChords.map((chord, index) => {
              const chordColor = chordColors.length > 0 ? chordColors[index % chordColors.length] : undefined;
              return (
                <NearbyChordButton
                  key={index}
                  theme={theme}
                  chord={chord}
                  isSelected={selectedOverlay?.degree === chord.degree}
                  onClick={() => onNearbyChordClick(chord)}
                  chordColor={chordColor}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div
        className="mt-4 p-3 rounded text-xs"
        style={{
          background: theme.bgTertiary,
          color: theme.textSecondary,
        }}
      >
        <p className="mb-1">
          <strong>Click a chord</strong> to overlay its nearest voicing on the fretboard
        </p>
        <p>
          <strong>Click again</strong> to remove the overlay
        </p>
      </div>
    </div>
  );
}

