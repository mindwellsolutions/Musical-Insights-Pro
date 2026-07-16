'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ThemeConfig } from '@/lib/themes';
import { X } from 'lucide-react';

interface ZoneChord {
  symbol: string;
  rootNote: string;
  quality: string;
  notes: string[];
}

interface ZoneChordGroups {
  triads: ZoneChord[];
  seventhChords: ZoneChord[];
  extendedChords: ZoneChord[];
}

const FRET_ZONES = [
  { label: 'Open', minFret: 0, maxFret: 4, midFret: 2 },
  { label: 'Pos 2', minFret: 2, maxFret: 6, midFret: 4 },
  { label: 'Pos 5', minFret: 5, maxFret: 9, midFret: 7 },
  { label: 'Pos 7', minFret: 7, maxFret: 12, midFret: 9 },
  { label: 'Pos 9', minFret: 9, maxFret: 13, midFret: 11 },
  { label: 'Pos 12', minFret: 12, maxFret: 16, midFret: 14 },
];

export interface FretZoneChordHUDProps {
  currentKey: string;
  currentScale: string;
  stringCount: 6 | 7;
  fretCount: number;
  theme: ThemeConfig;
  onChordHighlight: (notes: string[] | null) => void;
}

async function fetchZoneChords(
  key: string, scale: string, minFret: number, maxFret: number, stringCount: number
): Promise<ZoneChordGroups> {
  const params = new URLSearchParams({ key, scale, minFret: String(minFret), maxFret: String(maxFret), stringCount: String(stringCount) });
  const res = await fetch(`/api/fret-zone-chords?${params}`);
  if (!res.ok) throw new Error('Failed to fetch zone chords');
  return res.json();
}

export default function FretZoneChordHUD({
  currentKey, currentScale, stringCount, fretCount, theme, onChordHighlight,
}: FretZoneChordHUDProps) {
  const [activeZoneIdx, setActiveZoneIdx] = useState<number | null>(null);
  const [hoveredChord, setHoveredChord] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const activeZone = activeZoneIdx !== null ? FRET_ZONES[activeZoneIdx] : null;

  const { data: zoneData } = useQuery<ZoneChordGroups>({
    queryKey: ['zone-chords', currentKey, currentScale, activeZone?.minFret, activeZone?.maxFret],
    queryFn: () => fetchZoneChords(currentKey, currentScale, activeZone!.minFret, activeZone!.maxFret, stringCount),
    enabled: !!activeZone && !!currentKey && !!currentScale,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // Close popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActiveZoneIdx(null);
        onChordHighlight(null);
      }
    };
    if (activeZoneIdx !== null) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [activeZoneIdx, onChordHighlight]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') { setActiveZoneIdx(null); onChordHighlight(null); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onChordHighlight]);

  const handleChordClick = useCallback((chord: ZoneChord) => {
    onChordHighlight(chord.notes);
    setHoveredChord(chord.symbol);
  }, [onChordHighlight]);

  const handleChordHoverIn = useCallback((chord: ZoneChord) => {
    onChordHighlight(chord.notes);
  }, [onChordHighlight]);

  const handleChordHoverOut = useCallback(() => {
    onChordHighlight(null);
    setHoveredChord(null);
  }, [onChordHighlight]);

  const visibleZones = FRET_ZONES.filter(z => z.midFret <= fretCount);

  return (
    <div className="relative flex items-center gap-1 mb-1 px-2" style={{ minHeight: 24 }}>
      <span className="text-xs mr-1 font-semibold" style={{ color: theme.textSecondary, opacity: 0.7, whiteSpace: 'nowrap' }}>
        Zones:
      </span>
      {visibleZones.map((zone, idx) => {
        const isActive = activeZoneIdx === idx;
        return (
          <button
            key={zone.label}
            onClick={() => { setActiveZoneIdx(isActive ? null : idx); if (isActive) onChordHighlight(null); }}
            className="relative group transition-all"
            title={`${zone.label} (frets ${zone.minFret}–${zone.maxFret})`}
            style={{ background: 'none', border: 'none', padding: '2px 4px', cursor: 'pointer' }}
          >
            <span
              className="inline-block rounded transition-all"
              style={{
                width: isActive ? 'auto' : 10,
                height: 10,
                padding: isActive ? '2px 8px' : 0,
                background: isActive ? theme.accentPrimary : `${theme.accentPrimary}55`,
                fontSize: 10,
                color: '#fff',
                lineHeight: '10px',
                display: 'flex',
                alignItems: 'center',
                whiteSpace: 'nowrap',
                borderRadius: 4,
              }}
            >
              {isActive ? zone.label : ''}
            </span>
            {!isActive && (
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap transition-opacity"
                style={{ background: theme.bgTertiary, color: theme.textPrimary, border: `1px solid ${theme.border}` }}>
                {zone.label}
              </span>
            )}
          </button>
        );
      })}

      {/* Popover */}
      {activeZoneIdx !== null && activeZone && (
        <div
          ref={popoverRef}
          className="absolute top-full left-0 z-50 shadow-2xl rounded-xl mt-1"
          style={{ width: 280, background: theme.bgSecondary, border: `1px solid ${theme.border}` }}
        >
          <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: theme.border }}>
            <span className="text-sm font-bold" style={{ color: theme.textPrimary }}>
              Chords — Frets {activeZone.minFret}–{activeZone.maxFret} ({activeZone.label})
            </span>
            <button onClick={() => { setActiveZoneIdx(null); onChordHighlight(null); }}
              style={{ color: theme.textSecondary, background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <X size={14} />
            </button>
          </div>
          <div className="p-3 max-h-72 overflow-y-auto">
            {!zoneData ? (
              <div className="text-xs text-center py-4" style={{ color: theme.textSecondary }}>Loading…</div>
            ) : (
              [
                { label: 'Triads', chords: zoneData.triads },
                { label: '7th Chords', chords: zoneData.seventhChords },
                { label: 'Extended', chords: zoneData.extendedChords },
              ].map(group => group.chords.length > 0 && (
                <div key={group.label} className="mb-3">
                  <div className="text-xs font-semibold mb-1" style={{ color: theme.textSecondary }}>{group.label}:</div>
                  <div className="flex flex-wrap gap-1">
                    {group.chords.map(chord => (
                      <button
                        key={chord.symbol}
                        onClick={() => handleChordClick(chord)}
                        onMouseEnter={() => handleChordHoverIn(chord)}
                        onMouseLeave={handleChordHoverOut}
                        className="text-xs px-2 py-1 rounded transition-all"
                        style={{
                          background: hoveredChord === chord.symbol ? theme.accentPrimary : theme.bgTertiary,
                          color: hoveredChord === chord.symbol ? '#fff' : theme.textPrimary,
                          border: `1px solid ${hoveredChord === chord.symbol ? theme.accentPrimary : theme.border}`,
                          cursor: 'pointer',
                          height: 28,
                        }}
                      >
                        {chord.symbol}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
            {zoneData && zoneData.triads.length === 0 && zoneData.seventhChords.length === 0 && zoneData.extendedChords.length === 0 && (
              <div className="text-xs text-center py-4" style={{ color: theme.textSecondary }}>No diatonic chords found in this zone.</div>
            )}
          </div>
          <div className="px-3 pb-3">
            <button
              onClick={() => { setActiveZoneIdx(null); onChordHighlight(null); }}
              className="w-full text-xs py-1.5 rounded transition-all"
              style={{ background: theme.bgTertiary, color: theme.textSecondary, border: `1px solid ${theme.border}`, cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
