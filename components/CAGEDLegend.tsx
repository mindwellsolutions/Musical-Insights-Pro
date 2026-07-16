'use client';

import React from 'react';
import { ThemeConfig } from '@/lib/themes';
import { CAGEDShape, CAGED_COLORS, getAllCAGEDShapes } from '@/lib/triad-theory';

interface CAGEDLegendProps {
  theme: ThemeConfig;
  selectedShapes?: CAGEDShape[];
  onShapeToggle?: (shape: CAGEDShape) => void;
  showToggle?: boolean;
}

export default function CAGEDLegend({
  theme,
  selectedShapes = ['C', 'A', 'G', 'E', 'D'],
  onShapeToggle,
  showToggle = true,
}: CAGEDLegendProps) {
  const shapes = getAllCAGEDShapes();

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`,
      }}
    >
      <h3
        className="text-sm font-semibold mb-3"
        style={{ color: theme.textPrimary }}
      >
        CAGED System
      </h3>

      {/* Compact grid layout - 2 columns */}
      <div className="grid grid-cols-2 gap-2">
        {shapes.map((shape) => {
          const isSelected = selectedShapes.includes(shape);
          const shapeColor = CAGED_COLORS[shape];

          return (
            <button
              key={shape}
              onClick={() => showToggle && onShapeToggle && onShapeToggle(shape)}
              disabled={!showToggle || !onShapeToggle}
              className="flex items-center gap-2 p-2 rounded transition-all hover:opacity-80"
              style={{
                background: isSelected ? theme.bgSecondary : 'transparent',
                opacity: isSelected ? 1 : 0.5,
                border: `1px solid ${isSelected ? shapeColor : theme.border}`,
                cursor: showToggle && onShapeToggle ? 'pointer' : 'default',
              }}
            >
              {/* Checkbox (if toggle enabled) */}
              {showToggle && onShapeToggle && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 cursor-pointer pointer-events-none"
                  style={{ accentColor: shapeColor }}
                />
              )}

              {/* Color indicator */}
              <div
                className="w-5 h-5 rounded"
                style={{
                  background: shapeColor,
                  boxShadow: isSelected ? `0 0 6px ${shapeColor}` : 'none',
                }}
              />

              {/* Shape name */}
              <div className="flex-1 text-left">
                <div
                  className="text-xs font-bold"
                  style={{ color: theme.textPrimary }}
                >
                  {shape}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Compact info text */}
      <div
        className="mt-3 p-2 rounded text-[10px] leading-tight"
        style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
          color: theme.textSecondary,
        }}
      >
        <p>
          Toggle CAGED shapes to focus on specific patterns
        </p>
      </div>
    </div>
  );
}

/**
 * Get description for each CAGED shape
 */
function getShapeDescription(shape: CAGEDShape): string {
  switch (shape) {
    case 'C':
      return 'Open C chord shape';
    case 'A':
      return 'Open A chord shape';
    case 'G':
      return 'Open G chord shape';
    case 'E':
      return 'Open E chord shape';
    case 'D':
      return 'Open D chord shape';
  }
}

