'use client';

/**
 * Inversion Filter Component
 * Allows filtering voicings by inversion
 */

import React from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import type { ThemeConfig } from '@/lib/themes';
import type { Inversion } from '@/lib/music-theory/types';

interface InversionFilterProps {
  theme: ThemeConfig;
}

export function InversionFilter({ theme }: InversionFilterProps) {
  const { state, setSelectedInversions } = useTriadSystem();

  const toggleInversion = (inversion: Inversion) => {
    const current = state.selectedInversions;
    
    if (current.includes(inversion)) {
      // Remove if already selected (but keep at least one)
      if (current.length > 1) {
        setSelectedInversions(current.filter(i => i !== inversion));
      }
    } else {
      // Add if not selected
      setSelectedInversions([...current, inversion]);
    }
  };

  const selectAll = () => {
    setSelectedInversions(['root', 'first', 'second']);
  };

  const inversionLabels: Record<Inversion, string> = {
    'root': 'Root Position',
    'first': '1st Inversion',
    'second': '2nd Inversion'
  };

  const inversionDescriptions: Record<Inversion, string> = {
    'root': 'Root in bass',
    'first': '3rd in bass',
    'second': '5th in bass'
  };

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-sm font-semibold"
          style={{ color: theme.textPrimary }}
        >
          Inversions
        </h3>
        <button
          onClick={selectAll}
          className="text-xs px-2 py-1 rounded transition-all"
          style={{
            background: theme.bgSecondary,
            color: theme.textSecondary,
            border: `1px solid ${theme.border}`
          }}
        >
          All
        </button>
      </div>

      <div className="space-y-2">
        {(['root', 'first', 'second'] as Inversion[]).map(inversion => {
          const isSelected = state.selectedInversions.includes(inversion);
          
          return (
            <button
              key={inversion}
              onClick={() => toggleInversion(inversion)}
              className="w-full flex items-center gap-3 p-2 rounded transition-all"
              style={{
                background: isSelected ? theme.bgSecondary : 'transparent',
                border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`,
                opacity: isSelected ? 1 : 0.6
              }}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="w-4 h-4 cursor-pointer pointer-events-none"
                style={{ accentColor: theme.accentPrimary }}
              />
              <div className="flex-1 text-left">
                <div 
                  className="text-sm font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  {inversionLabels[inversion]}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  {inversionDescriptions[inversion]}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

