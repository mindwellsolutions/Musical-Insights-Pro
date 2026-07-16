'use client';

/**
 * CAGED Shape Selector Component
 * Allows users to select/deselect specific CAGED shapes for filtering
 */

import React from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import type { ThemeConfig } from '@/lib/themes';
import type { CAGEDShape } from '@/lib/music-theory/types';

interface CAGEDShapeSelectorProps {
  theme: ThemeConfig;
}

// CAGED shape colors matching the blueprint
const CAGED_COLORS: Record<CAGEDShape, string> = {
  C: '#ef4444',  // Red
  A: '#f97316',  // Orange
  G: '#eab308',  // Yellow
  E: '#22c55e',  // Green
  D: '#3b82f6',  // Blue
};

const CAGED_DESCRIPTIONS: Record<CAGEDShape, string> = {
  C: 'C-shape bar chord pattern',
  A: 'A-shape bar chord pattern',
  G: 'G-shape bar chord pattern',
  E: 'E-shape bar chord pattern',
  D: 'D-shape bar chord pattern',
};

export function CAGEDShapeSelector({ theme }: CAGEDShapeSelectorProps) {
  const { state, setSelectedCAGEDShapes } = useTriadSystem();

  const handleShapeToggle = (shape: CAGEDShape) => {
    const currentShapes = state.selectedCAGEDShapes;
    
    if (currentShapes.includes(shape)) {
      // Don't allow deselecting if it's the last one
      if (currentShapes.length === 1) {
        return;
      }
      setSelectedCAGEDShapes(currentShapes.filter(s => s !== shape));
    } else {
      setSelectedCAGEDShapes([...currentShapes, shape]);
    }
  };

  const handleSelectAll = () => {
    setSelectedCAGEDShapes(['C', 'A', 'G', 'E', 'D']);
  };

  const handleClearAll = () => {
    // Keep at least one selected
    setSelectedCAGEDShapes(['C']);
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
          CAGED Shapes
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
            style={{
              background: theme.bgSecondary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`
            }}
          >
            All
          </button>
          <button
            onClick={handleClearAll}
            className="text-xs px-2 py-1 rounded transition-all hover:opacity-80"
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

      <div className="grid grid-cols-5 gap-2">
        {(['C', 'A', 'G', 'E', 'D'] as const).map((shape) => {
          const isSelected = state.selectedCAGEDShapes.includes(shape);
          const color = CAGED_COLORS[shape];
          
          return (
            <button
              key={shape}
              onClick={() => handleShapeToggle(shape)}
              className="flex flex-col items-center gap-1 p-3 rounded-lg transition-all hover:scale-105"
              style={{
                background: isSelected ? color : theme.bgSecondary,
                border: `2px solid ${color}`,
                opacity: isSelected ? 1 : 0.4,
                cursor: 'pointer'
              }}
              title={CAGED_DESCRIPTIONS[shape]}
            >
              <span 
                className="text-lg font-bold"
                style={{ 
                  color: isSelected ? '#ffffff' : theme.textPrimary 
                }}
              >
                {shape}
              </span>
              <div
                className="w-full h-1 rounded-full"
                style={{
                  background: isSelected ? '#ffffff' : color,
                  opacity: isSelected ? 0.5 : 0.3
                }}
              />
            </button>
          );
        })}
      </div>

      <p 
        className="text-xs mt-3"
        style={{ color: theme.textSecondary }}
      >
        Select CAGED shapes to filter triad positions. At least one shape must be selected.
      </p>
    </div>
  );
}

