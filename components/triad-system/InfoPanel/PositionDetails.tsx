'use client';

/**
 * Position Details Component
 * Displays information about selected voicing and voicing count
 */

import React from 'react';
import { getTriadDisplayName } from '@/lib/music-theory';
import type { ThemeConfig } from '@/lib/themes';
import type { TriadVoicing } from '@/lib/music-theory/types';

interface PositionDetailsProps {
  theme: ThemeConfig;
  voicingCount: number;
  selectedVoicing: TriadVoicing | null;
}

export function PositionDetails({ theme, voicingCount, selectedVoicing }: PositionDetailsProps) {
  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`
      }}
    >
      <h3 
        className="text-sm font-semibold mb-3"
        style={{ color: theme.textPrimary }}
      >
        Position Information
      </h3>

      {/* Voicing Count */}
      <div 
        className="mb-3 p-3 rounded"
        style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`
        }}
      >
        <div 
          className="text-xs font-medium mb-1"
          style={{ color: theme.textSecondary }}
        >
          Available Voicings
        </div>
        <div
          className="text-2xl font-bold"
          style={{ color: theme.accentPrimary }}
        >
          {voicingCount}
        </div>
      </div>

      {/* Selected Voicing Details */}
      {selectedVoicing ? (
        <div
          className="p-3 rounded"
          style={{
            background: theme.bgSecondary,
            border: `1px solid ${theme.accentPrimary}`
          }}
        >
          <div 
            className="text-xs font-medium mb-2"
            style={{ color: theme.textSecondary }}
          >
            Selected Voicing
          </div>
          
          <div className="space-y-2">
            <div>
              <div 
                className="text-sm font-semibold"
                style={{ color: theme.textPrimary }}
              >
                {getTriadDisplayName(selectedVoicing.root, selectedVoicing.quality)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div style={{ color: theme.textSecondary }}>String Set</div>
                <div 
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {selectedVoicing.stringSet}
                </div>
              </div>

              <div>
                <div style={{ color: theme.textSecondary }}>Inversion</div>
                <div 
                  className="font-semibold capitalize"
                  style={{ color: theme.textPrimary }}
                >
                  {selectedVoicing.inversion}
                </div>
              </div>

              <div>
                <div style={{ color: theme.textSecondary }}>Center Fret</div>
                <div 
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {selectedVoicing.centerFret}
                </div>
              </div>

              <div>
                <div style={{ color: theme.textSecondary }}>Fret Span</div>
                <div 
                  className="font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {selectedVoicing.fingering.span}
                </div>
              </div>
            </div>

            {/* Fingering */}
            {selectedVoicing.fingering && (
              <div>
                <div 
                  className="text-xs mb-1"
                  style={{ color: theme.textSecondary }}
                >
                  Suggested Fingering
                </div>
                <div 
                  className="flex gap-2 text-sm font-mono font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {selectedVoicing.fingering.fingers.map((finger, idx) => (
                    <span key={idx}>{finger}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            <div>
              <div 
                className="text-xs mb-1"
                style={{ color: theme.textSecondary }}
              >
                Notes
              </div>
              <div 
                className="flex gap-2 text-sm font-semibold"
                style={{ color: theme.textPrimary }}
              >
                {selectedVoicing.notes.map((note, idx) => (
                  <span key={idx}>{note.name}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div 
          className="p-3 rounded text-center text-sm"
          style={{
            background: theme.bgSecondary,
            color: theme.textSecondary
          }}
        >
          Click a voicing on the fretboard to see details
        </div>
      )}
    </div>
  );
}

