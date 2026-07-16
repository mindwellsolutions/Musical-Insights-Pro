'use client';

/**
 * String Set Filter Component
 * Allows filtering voicings by string set
 */

import React from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import { STRING_SET_INFO } from '@/lib/music-theory';
import type { ThemeConfig } from '@/lib/themes';
import type { StringSet } from '@/lib/music-theory/types';

interface StringSetFilterProps {
  theme: ThemeConfig;
}

export function StringSetFilter({ theme }: StringSetFilterProps) {
  const { state, setSelectedStringSets } = useTriadSystem();

  const toggleStringSet = (stringSet: StringSet) => {
    const current = state.selectedStringSets;
    
    if (current.includes(stringSet)) {
      // Remove if already selected (but keep at least one)
      if (current.length > 1) {
        setSelectedStringSets(current.filter(s => s !== stringSet));
      }
    } else {
      // Add if not selected
      setSelectedStringSets([...current, stringSet]);
    }
  };

  const selectAll = () => {
    setSelectedStringSets(['123', '234', '345', '456']);
  };

  const selectNone = () => {
    setSelectedStringSets(['123']); // Keep at least one
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
          String Sets
        </h3>
        <div className="flex gap-2">
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
          <button
            onClick={selectNone}
            className="text-xs px-2 py-1 rounded transition-all"
            style={{
              background: theme.bgSecondary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {(['123', '234', '345', '456'] as StringSet[]).map(stringSet => {
          const isSelected = state.selectedStringSets.includes(stringSet);
          const info = STRING_SET_INFO[stringSet];

          return (
            <button
              key={stringSet}
              onClick={() => toggleStringSet(stringSet)}
              className="flex items-center gap-2 p-2 rounded transition-all"
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
                className="w-4 h-4 cursor-pointer pointer-events-none flex-shrink-0"
                style={{ accentColor: theme.accentPrimary }}
              />
              <div className="flex-1 text-left min-w-0">
                <div
                  className="text-sm font-semibold truncate"
                  style={{ color: theme.textPrimary }}
                >
                  {info.name}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: theme.textSecondary }}
                >
                  Strings {info.strings.join('-')}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div 
        className="mt-3 p-2 rounded text-xs"
        style={{
          background: theme.bgSecondary,
          color: theme.textSecondary
        }}
      >
        {state.selectedStringSets.length} of 4 string sets selected
      </div>
    </div>
  );
}

