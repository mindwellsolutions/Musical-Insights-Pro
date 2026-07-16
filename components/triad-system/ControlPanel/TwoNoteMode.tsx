'use client';

/**
 * Two-Note Mode Component
 * Controls the "breathing technique" - removing middle or bass note
 */

import React from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import type { ThemeConfig } from '@/lib/themes';
import type { TwoNoteMode as TwoNoteModeType } from '@/lib/music-theory/types';

interface TwoNoteModeProps {
  theme: ThemeConfig;
}

export function TwoNoteMode({ theme }: TwoNoteModeProps) {
  const { state, setTwoNoteMode } = useTriadSystem();

  const modes: Array<{ value: TwoNoteModeType; label: string; description: string }> = [
    {
      value: 'off',
      label: 'Off',
      description: 'Show all three notes'
    },
    {
      value: 'remove-middle',
      label: 'Remove Middle',
      description: 'Remove 3rd for open sound'
    },
    {
      value: 'remove-bass',
      label: 'Remove Bass',
      description: 'Remove root for upper structure'
    }
  ];

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
        Two-Note Mode
      </h3>

      <div className="grid grid-cols-2 gap-2">
        {modes.map(mode => {
          const isSelected = state.twoNoteMode === mode.value;

          return (
            <button
              key={mode.value}
              onClick={() => setTwoNoteMode(mode.value)}
              className="flex items-center gap-2 p-2 rounded transition-all"
              style={{
                background: isSelected ? theme.bgSecondary : 'transparent',
                border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`,
                opacity: isSelected ? 1 : 0.6
              }}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: isSelected ? theme.accentPrimary : theme.border
                }}
              >
                {isSelected && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: theme.accentPrimary }}
                  />
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div
                  className="text-sm font-semibold truncate"
                  style={{ color: theme.textPrimary }}
                >
                  {mode.label}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: theme.textSecondary }}
                >
                  {mode.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

