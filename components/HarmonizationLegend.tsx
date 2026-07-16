'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { NOTE_COLORS, getScaleNotes, getHarmonyNoteForOriginal } from '@/lib/musicTheory';
import { ChevronUp } from 'lucide-react';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface HarmonizationLegendProps {
  theme: ThemeConfig;
  harmonizationType: 'original' | '3rds' | '5ths' | '6ths' | '7ths';
  rootNote: string;
  scaleName: string;
}

export default function HarmonizationLegend({
  theme,
  harmonizationType,
  rootNote,
  scaleName,
}: HarmonizationLegendProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (harmonizationType === 'original') {
    return null; // Don't show legend for original mode
  }

  const harmonizationLabels = {
    '3rds': 'Thirds',
    '5ths': 'Fifths',
    '6ths': 'Sixths',
    '7ths': 'Sevenths',
  };

  // Get the actual scale notes for the current key and scale
  const scaleNotes = getScaleNotes(rootNote, scaleName);

  // Create note pairs from the current scale
  const notePairs = scaleNotes.map((originalNote) => {
    const harmonyNote = getHarmonyNoteForOriginal(originalNote, rootNote, scaleName, harmonizationType);
    return {
      original: originalNote,
      harmony: harmonyNote,
      originalColor: NOTE_COLORS[originalNote] || '#ef4444',
      harmonyColor: NOTE_COLORS[harmonyNote] || '#3b82f6',
    };
  });

  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Harmonization Legend - {harmonizationLabels[harmonizationType]}
          </h3>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded transition-all hover:scale-110"
          style={{
            color: theme.textSecondary,
            background: 'transparent',
          }}
          title={isCollapsed ? 'Expand legend' : 'Collapse legend'}
        >
          <ChevronUp
            className="w-4 h-4 transition-transform"
            style={{
              transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </button>
      </div>

      {!isCollapsed && (
        <>
          {/* Note Pairs Grid */}
          <div className="flex flex-wrap gap-3 mb-3">
            {notePairs.map((pair, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-2 py-1.5 rounded"
                style={{
                  background: theme.bgTertiary,
                  width: 'fit-content',
                }}
              >
                {/* Original Note */}
                <div
                  className="flex items-center justify-center font-semibold text-xs"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: pair.originalColor,
                    color: '#ffffff',
                    border: '2px solid #ffffff',
                    boxShadow: `0 0 0 2px rgba(255,255,255,0.15)`,
                    flexShrink: 0,
                  }}
                >
                  {getNoteDisplayName(pair.original)}
                </div>

                {/* Arrow */}
                <svg className="w-3 h-3 flex-shrink-0" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>

                {/* Harmony Note */}
                <div
                  className="flex items-center justify-center font-semibold text-xs"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: pair.harmonyColor,
                    color: '#ffffff',
                    border: '2px solid #10b981',
                    boxShadow: `0 0 0 2px rgba(16,185,129,0.3)`,
                    flexShrink: 0,
                  }}
                >
                  {getNoteDisplayName(pair.harmony)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.border}` }}>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              <strong style={{ color: theme.textPrimary }}>How to use:</strong> Each original scale note (white border) has a corresponding harmony note (green border, larger).
              The colors show the relationship between notes in the {getNoteDisplayName(rootNote)} {scaleName} scale. Play harmony notes to harmonize with the original scale.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

