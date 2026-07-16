'use client';

/**
 * CAGED Fretboard Overlay Component
 * Renders colored rectangular outlines showing CAGED shape regions on the fretboard
 */

import React from 'react';
import type { ShapeRegion } from '@/lib/caged';

interface CAGEDFretboardOverlayProps {
  regions: ShapeRegion[];
  stringCount: number;
  fretCount: number;
  isInverted?: boolean;
  brightness?: number;
}

export function CAGEDFretboardOverlay({
  regions,
  stringCount,
  fretCount,
  isInverted = false,
  brightness = 100,
}: CAGEDFretboardOverlayProps) {
  if (regions.length === 0) {
    return null;
  }

  // Calculate dimensions for each fret cell
  const fretWidth = 70; // pixels (matches Fretboard component)
  const openStringWidth = 40; // pixels for fret 0
  const stringHeight = 44; // pixels (matches Fretboard component)
  const stringSpacing = stringHeight + 12; // includes margin

  // Helper function to adjust color brightness
  const adjustColorBrightness = (color: string, brightness: number): string => {
    // Parse hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Adjust brightness (0-100 scale)
    const factor = brightness / 100;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);

    // Convert back to hex
    const toHex = (n: number) => {
      const hex = Math.min(255, Math.max(0, n)).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }}>
      {/* Render backgrounds first (lower z-index) */}
      {regions.map((region, index) => {
        // Calculate position and size
        const startFret = Math.max(0, region.startFret);
        const endFret = Math.min(fretCount, region.endFret);

        // Calculate left position (accounting for fret 0 being wider)
        let left = 0;
        if (startFret === 0) {
          left = openStringWidth;
        } else {
          left = openStringWidth + (startFret - 1) * fretWidth;
        }

        // Calculate width
        const fretSpan = endFret - startFret + 1;
        let width = 0;
        if (startFret === 0) {
          width = openStringWidth + (fretSpan - 1) * fretWidth;
        } else {
          width = fretSpan * fretWidth;
        }

        // Calculate top position and height based on strings
        // Account for inverted mode
        const topStringIndex = isInverted ? (stringCount - 1 - region.bottomString) : region.topString;
        const bottomStringIndex = isInverted ? (stringCount - 1 - region.topString) : region.bottomString;

        const top = topStringIndex * stringSpacing;
        const height = (bottomStringIndex - topStringIndex + 1) * stringSpacing;

        // Apply brightness adjustment to colors
        const adjustedStroke = adjustColorBrightness(region.color.stroke, brightness);
        const adjustedFill = region.color.fill; // Keep fill opacity-based, don't adjust

        return (
          <div
            key={`${region.shapeName}-bg-${index}`}
            className="absolute rounded-lg transition-all"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`,
              background: adjustedFill,
              boxShadow: `0 0 12px ${adjustedStroke}40`,
              zIndex: 1,
            }}
          >
            {/* Shape label */}
            <div
              className="absolute -top-6 left-2 px-2 py-0.5 rounded text-xs font-bold"
              style={{
                background: adjustedStroke,
                color: '#ffffff',
                boxShadow: `0 2px 4px rgba(0,0,0,0.2)`,
              }}
            >
              {region.shapeName} Shape
            </div>
          </div>
        );
      })}

      {/* Render borders second (higher z-index) so they're always visible */}
      {regions.map((region, index) => {
        // Calculate position and size (same as above)
        const startFret = Math.max(0, region.startFret);
        const endFret = Math.min(fretCount, region.endFret);

        let left = 0;
        if (startFret === 0) {
          left = openStringWidth;
        } else {
          left = openStringWidth + (startFret - 1) * fretWidth;
        }

        const fretSpan = endFret - startFret + 1;
        let width = 0;
        if (startFret === 0) {
          width = openStringWidth + (fretSpan - 1) * fretWidth;
        } else {
          width = fretSpan * fretWidth;
        }

        const topStringIndex = isInverted ? (stringCount - 1 - region.bottomString) : region.topString;
        const bottomStringIndex = isInverted ? (stringCount - 1 - region.topString) : region.bottomString;

        const top = topStringIndex * stringSpacing;
        const height = (bottomStringIndex - topStringIndex + 1) * stringSpacing;

        const adjustedStroke = adjustColorBrightness(region.color.stroke, brightness);

        return (
          <div
            key={`${region.shapeName}-border-${index}`}
            className="absolute rounded-lg transition-all"
            style={{
              left: `${left}px`,
              top: `${top}px`,
              width: `${width}px`,
              height: `${height}px`,
              border: `3px solid ${adjustedStroke}`,
              zIndex: 2,
            }}
          />
        );
      })}
    </div>
  );
}

export default CAGEDFretboardOverlay;

