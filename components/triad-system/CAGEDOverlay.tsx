'use client';

/**
 * CAGED Overlay Display Component
 * Shows CAGED shape zones on a visual fretboard representation
 */

import React from 'react';
import type { ThemeConfig } from '@/lib/themes';
import type { CAGEDOverlayZone } from '@/lib/music-theory';

interface CAGEDOverlayProps {
  theme: ThemeConfig;
  overlayZones: CAGEDOverlayZone[];
}

export function CAGEDOverlay({ theme, overlayZones }: CAGEDOverlayProps) {
  if (overlayZones.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`
      }}
    >
      <h3 
        className="text-sm font-semibold mb-3"
        style={{ color: theme.textPrimary }}
      >
        CAGED Zones Active
      </h3>

      {/* Fretboard visualization */}
      <div className="relative">
        {/* Fret numbers */}
        <div className="flex mb-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className="flex-1 text-center text-xs"
              style={{ 
                color: theme.textSecondary,
                minWidth: '24px'
              }}
            >
              {i}
            </div>
          ))}
        </div>

        {/* Zone bars */}
        <div className="relative h-12 rounded" style={{ background: theme.bgSecondary }}>
          {overlayZones.map((zone, index) => {
            const startPercent = (zone.startFret / 15) * 100;
            const widthPercent = ((zone.endFret - zone.startFret + 1) / 15) * 100;

            return (
              <div
                key={`${zone.shape}-${index}`}
                className="absolute top-0 bottom-0 flex items-center justify-center transition-all"
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  background: `linear-gradient(135deg, ${zone.color}40, ${zone.color}60)`,
                  border: `2px solid ${zone.color}`,
                  borderRadius: '4px'
                }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ 
                    color: zone.color,
                    textShadow: '0 0 4px rgba(0,0,0,0.5)'
                  }}
                >
                  {zone.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Zone details */}
        <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
          {overlayZones.map((zone, index) => (
            <div
              key={`detail-${zone.shape}-${index}`}
              className="flex items-center gap-2 p-2 rounded"
              style={{
                background: theme.bgSecondary,
                border: `1px solid ${zone.color}`
              }}
            >
              <div
                className="w-8 h-8 rounded flex items-center justify-center font-bold"
                style={{
                  background: zone.color,
                  color: '#ffffff'
                }}
              >
                {zone.shape}
              </div>
              <div className="flex-1">
                <div 
                  className="text-xs font-semibold"
                  style={{ color: theme.textPrimary }}
                >
                  Zone {zone.zone.zoneNumber}
                </div>
                <div 
                  className="text-xs"
                  style={{ color: theme.textSecondary }}
                >
                  Frets {zone.startFret}-{zone.endFret}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p 
        className="text-xs mt-3"
        style={{ color: theme.textSecondary }}
      >
        Triad positions are filtered to show only those within the selected CAGED shape zones.
      </p>
    </div>
  );
}

