'use client';

/**
 * Selected Key Card Component
 * Displays the currently selected key and scale/mode in a compact card format
 */

import React from 'react';
import { ThemeConfig } from '@/lib/themes';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface SelectedKeyCardProps {
  rootNote: string;
  scaleName: string;
  theme: ThemeConfig;
  isManualMode?: boolean;
  detectedKey?: string | null;
  confidence?: number;
  isListening?: boolean;
  autoRecommendation?: boolean;
  autoSwitchFretboard?: boolean;
  onAutoRecommendationChange?: (enabled: boolean) => void;
  onAutoSwitchFretboardChange?: (enabled: boolean) => void;
}

export default function SelectedKeyCard({
  rootNote,
  scaleName,
  theme,
  isManualMode = false,
  detectedKey = null,
  confidence = 0,
  isListening = false,
  autoRecommendation = false,
  autoSwitchFretboard = false,
  onAutoRecommendationChange,
  onAutoSwitchFretboardChange,
}: SelectedKeyCardProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const displayKey = isManualMode
    ? getNoteDisplayName(rootNote)
    : (detectedKey || getNoteDisplayName(rootNote));

  const showAnalyzing = isListening && !detectedKey && !isManualMode;

  return (
    <div
      className="rounded-lg px-3 py-1.5"
      style={{
        background: theme.bgTertiary,
        border: `2px solid ${theme.border}`,
        minWidth: '160px',
        maxWidth: '180px',
      }}
    >
      {/* Selected/Detected Key Section */}
      <div className="flex flex-col items-center text-center mb-1">
        <div
          className="text-[9px] font-bold uppercase tracking-wide mb-0.5"
          style={{ color: theme.textSecondary }}
        >
          {isManualMode ? 'Selected Key' : 'Detected Key'}
          {!isManualMode && isListening && (
            <span className="ml-1 text-[8px] opacity-70">🎧</span>
          )}
        </div>
        <div
          className="text-xl font-bold leading-tight"
          style={{ color: theme.textPrimary }}
        >
          {showAnalyzing ? (
            <span className="text-sm opacity-70">Analyzing...</span>
          ) : (
            displayKey
          )}
        </div>
        {!isManualMode && detectedKey && (
          <div className="text-[9px] leading-tight" style={{ color: theme.textSecondary }}>
            {(confidence * 100).toFixed(0)}%
          </div>
        )}
      </div>

      {/* Divider */}
      <div
        className="h-px mb-1"
        style={{ background: theme.border }}
      />

      {/* Current Scale/Mode Section */}
      <div className="flex flex-col items-center text-center">
        <div
          className="text-[9px] font-bold uppercase tracking-wide mb-0.5"
          style={{ color: theme.textSecondary }}
        >
          Current Scale/Mode
        </div>
        <div
          className="text-xs font-bold leading-tight"
          style={{ color: theme.textPrimary }}
        >
          {getNoteDisplayName(rootNote)} {scaleName}
        </div>
      </div>

      {/* Auto Recommendation Switches - Only show when not in manual mode */}
      {!isManualMode && onAutoRecommendationChange && onAutoSwitchFretboardChange && (
        <>
          {/* Divider */}
          <div
            className="h-px my-1"
            style={{ background: theme.border }}
          />

          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoRecommendation}
                onChange={(e) => onAutoRecommendationChange(e.target.checked)}
                className="w-2.5 h-2.5 cursor-pointer"
              />
              <span className="text-[9px] font-semibold leading-tight" style={{ color: theme.textPrimary }}>
                Auto Recommendation
              </span>
            </label>

            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSwitchFretboard}
                onChange={(e) => onAutoSwitchFretboardChange(e.target.checked)}
                disabled={!autoRecommendation}
                className="w-2.5 h-2.5 cursor-pointer disabled:opacity-50"
              />
              <span
                className="text-[9px] font-semibold leading-tight"
                style={{
                  color: theme.textPrimary,
                  opacity: autoRecommendation ? 1 : 0.5
                }}
              >
                Auto Switch Fretboard
              </span>
            </label>
          </div>
        </>
      )}
    </div>
  );
}

