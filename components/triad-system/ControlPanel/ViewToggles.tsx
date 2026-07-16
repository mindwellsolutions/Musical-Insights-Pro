'use client';

/**
 * View Toggles Component
 * Controls visibility of different overlay layers
 */

import React from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import type { ThemeConfig } from '@/lib/themes';

interface ViewTogglesProps {
  theme: ThemeConfig;
}

export function ViewToggles({ theme }: ViewTogglesProps) {
  const { state, setViewToggles } = useTriadSystem();

  const toggles = [
    {
      key: 'showPentatonic' as const,
      label: 'Pentatonic Overlay',
      description: 'Show pentatonic scale box'
    },
    {
      key: 'showCAGEDShapes' as const,
      label: 'CAGED Shapes',
      description: 'Show CAGED shape overlays and filtering'
    },
    {
      key: 'showBarChord' as const,
      label: 'Bar Chord Reference',
      description: 'Show full bar chord shape'
    },
    {
      key: 'showEmbellishments' as const,
      label: 'Embellishments',
      description: 'Show slides, hammer-ons, pull-offs'
    },
    {
      key: 'showVoiceLeading' as const,
      label: 'Voice Leading',
      description: 'Show connections between chords'
    },
    {
      key: 'showNeighborhood' as const,
      label: 'Chord Neighborhood',
      description: 'Show nearby compatible chords'
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
        View Options
      </h3>

      <div className="space-y-2">
        {toggles.map(toggle => {
          const isEnabled = state.viewToggles[toggle.key];
          
          return (
            <button
              key={toggle.key}
              onClick={() => setViewToggles({ [toggle.key]: !isEnabled })}
              className="w-full flex items-center gap-3 p-2 rounded transition-all"
              style={{
                background: isEnabled ? theme.bgSecondary : 'transparent',
                border: `1px solid ${isEnabled ? theme.accentPrimary : theme.border}`,
                opacity: isEnabled ? 1 : 0.6
              }}
            >
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => {}}
                className="w-4 h-4 cursor-pointer pointer-events-none"
                style={{ accentColor: theme.accentPrimary }}
              />
              <div className="flex-1 text-left">
                <div 
                  className="text-sm font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {toggle.label}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  {toggle.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

