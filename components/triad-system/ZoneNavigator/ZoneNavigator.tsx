'use client';

/**
 * Zone Navigator Component
 * Allows navigation between fretboard zones
 */

import React from 'react';
import { useTriadSystem } from '../TriadSystemContext';
import { getAllZones, getNextZone, getPreviousZone } from '@/lib/music-theory';
import type { ThemeConfig } from '@/lib/themes';

interface ZoneNavigatorProps {
  theme: ThemeConfig;
}

export function ZoneNavigator({ theme }: ZoneNavigatorProps) {
  const { state, setCurrentZone } = useTriadSystem();
  const zones = getAllZones();

  // CAGED shape colors for visual distinction
  const cagedColors: Record<string, string> = {
    'C': '#E53935', // Red
    'A': '#1E88E5', // Blue
    'G': '#43A047', // Green
    'E': '#FB8C00', // Orange
    'D': '#8E24AA'  // Purple
  };

  const handleZoneSelect = (zoneNumber: number) => {
    const zone = zones.find(z => z.zoneNumber === zoneNumber);
    setCurrentZone(zone || null);
  };

  const handlePrevious = () => {
    if (state.currentZone) {
      const prev = getPreviousZone(state.currentZone);
      setCurrentZone(prev);
    }
  };

  const handleNext = () => {
    if (state.currentZone) {
      const next = getNextZone(state.currentZone);
      setCurrentZone(next);
    }
  };

  const clearZone = () => {
    setCurrentZone(null);
  };

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
        CAGED Fretboard Zones
      </h3>

      {/* Zone Selection Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {zones.map(zone => {
          const isSelected = state.currentZone?.zoneNumber === zone.zoneNumber;
          const shapeColor = cagedColors[zone.cagedShape];

          return (
            <button
              key={zone.zoneNumber}
              onClick={() => handleZoneSelect(zone.zoneNumber)}
              className="p-2 rounded transition-all"
              style={{
                background: isSelected ? theme.accentPrimary : theme.bgSecondary,
                color: isSelected ? '#FFFFFF' : theme.textPrimary,
                border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`,
                opacity: isSelected ? 1 : 0.7
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-semibold">Zone {zone.zoneNumber}</div>
                <div
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: shapeColor,
                    color: '#FFFFFF'
                  }}
                >
                  {zone.cagedShape}
                </div>
              </div>
              <div className="text-xs opacity-75">
                Frets {zone.startFret}-{zone.endFret}
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={handlePrevious}
          disabled={!state.currentZone || state.currentZone.zoneNumber === 1}
          className="flex-1 px-3 py-2 rounded text-sm font-semibold transition-all disabled:opacity-30"
          style={{
            background: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`
          }}
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={!state.currentZone || state.currentZone.zoneNumber === 6}
          className="flex-1 px-3 py-2 rounded text-sm font-semibold transition-all disabled:opacity-30"
          style={{
            background: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`
          }}
        >
          Next →
        </button>
      </div>

      {/* Clear Zone Button */}
      <button
        onClick={clearZone}
        className="w-full px-3 py-2 rounded text-sm font-semibold transition-all"
        style={{
          background: theme.bgSecondary,
          color: theme.textSecondary,
          border: `1px solid ${theme.border}`
        }}
      >
        Show All Zones
      </button>

      {/* Current Zone Info */}
      {state.currentZone && (
        <div 
          className="mt-3 p-2 rounded text-xs"
          style={{
            background: theme.bgSecondary,
            color: theme.textSecondary
          }}
        >
          <div className="font-semibold" style={{ color: theme.textPrimary }}>
            Zone {state.currentZone.zoneNumber} ({state.currentZone.cagedShape} Shape)
          </div>
          <div className="mt-1">
            CAGED Shape: {state.currentZone.cagedShape}
          </div>
          <div>
            Fret Range: {state.currentZone.startFret}-{state.currentZone.endFret}
          </div>
        </div>
      )}
    </div>
  );
}

