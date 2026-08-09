'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import { ThemeConfig } from '@/lib/themes';
import { X, Music2, ChevronRight } from 'lucide-react';

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
  { label: 'Open', fretLabel: '0–4',  minFret: 0,  maxFret: 4,  midFret: 2,  shape: 'E' },
  { label: 'Pos 2', fretLabel: '2–6',  minFret: 2,  maxFret: 6,  midFret: 4,  shape: 'D' },
  { label: 'Pos 5', fretLabel: '5–9',  minFret: 5,  maxFret: 9,  midFret: 7,  shape: 'C' },
  { label: 'Pos 7', fretLabel: '7–12', minFret: 7,  maxFret: 12, midFret: 9,  shape: 'A' },
  { label: 'Pos 9', fretLabel: '9–13', minFret: 9,  maxFret: 13, midFret: 11, shape: 'G' },
  { label: 'Pos 12', fretLabel: '12–16', minFret: 12, maxFret: 16, midFret: 14, shape: 'E' },
];

// Quality → short label mapping for chord display
const QUALITY_SHORT: Record<string, string> = {
  major: 'maj', minor: 'min', diminished: 'dim', augmented: 'aug',
  dominant7: 'dom7', major7: 'maj7', minor7: 'min7', halfDiminished: 'ø7',
};

export interface FretZoneChordHUDProps {
  currentKey: string;
  currentScale: string;
  stringCount: 6 | 7;
  fretCount: number;
  theme: ThemeConfig;
  onChordHighlight: (notes: string[] | null) => void;
  onChordSelected?: (selected: boolean) => void; // fires true when a chord is locked in, false when cleared
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
  currentKey, currentScale, stringCount, fretCount, theme, onChordHighlight, onChordSelected,
}: FretZoneChordHUDProps) {
  const [activeZoneIdx, setActiveZoneIdx] = useState<number | null>(null);
  const [selectedChord, setSelectedChord] = useState<ZoneChord | null>(null);
  const [hoveredChordSymbol, setHoveredChordSymbol] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const activeZone = activeZoneIdx !== null ? FRET_ZONES[activeZoneIdx] : null;
  const sidebarOpen = activeZoneIdx !== null;

  const { data: zoneData, isLoading } = useQuery<ZoneChordGroups>({
    queryKey: ['zone-chords', currentKey, currentScale, activeZone?.minFret, activeZone?.maxFret],
    queryFn: () => fetchZoneChords(currentKey, currentScale, activeZone!.minFret, activeZone!.maxFret, stringCount),
    enabled: !!activeZone && !!currentKey && !!currentScale,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const closeSidebar = useCallback(() => {
    setActiveZoneIdx(null);
    setSelectedChord(null);
    setHoveredChordSymbol(null);
    onChordHighlight(null);
    onChordSelected?.(false);
  }, [onChordHighlight, onChordSelected]);

  // Close sidebar on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && sidebarOpen) closeSidebar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [sidebarOpen, closeSidebar]);

  // When zone changes, clear chord selection
  useEffect(() => {
    setSelectedChord(null);
    setHoveredChordSymbol(null);
    onChordHighlight(null);
    onChordSelected?.(false);
  }, [activeZoneIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleZoneClick = useCallback((idx: number) => {
    if (activeZoneIdx === idx) {
      closeSidebar();
    } else {
      setActiveZoneIdx(idx);
    }
  }, [activeZoneIdx, closeSidebar]);

  const handleChordClick = useCallback((chord: ZoneChord) => {
    const isSame = selectedChord?.symbol === chord.symbol;
    if (isSame) {
      // Toggle off
      setSelectedChord(null);
      setHoveredChordSymbol(null);
      onChordHighlight(null);
      onChordSelected?.(false);
    } else {
      setSelectedChord(chord);
      setHoveredChordSymbol(chord.symbol);
      onChordHighlight(chord.notes);
      onChordSelected?.(true);
    }
  }, [selectedChord, onChordHighlight, onChordSelected]);

  const handleChordHover = useCallback((chord: ZoneChord | null) => {
    if (chord) {
      // Always show hover preview — even when a chord is selected, hovering another shows that chord's notes
      onChordHighlight(chord.notes);
      onChordSelected?.(true); // Keep bg notes hidden during hover previews too
      setHoveredChordSymbol(chord.symbol);
    } else {
      // Mouse left: restore the selected chord (if any) or clear
      if (selectedChord) {
        onChordHighlight(selectedChord.notes);
        onChordSelected?.(true);
      } else {
        onChordHighlight(null);
        onChordSelected?.(false);
      }
      setHoveredChordSymbol(null);
    }
  }, [selectedChord, onChordHighlight, onChordSelected]);

  const visibleZones = FRET_ZONES.filter(z => z.midFret <= fretCount);

  // Chord groups for sidebar
  const chordGroups = zoneData ? [
    { label: 'Triads', icon: '△', chords: zoneData.triads },
    { label: '7th Chords', icon: '♩', chords: zoneData.seventhChords },
    { label: 'Extended', icon: '✦', chords: zoneData.extendedChords },
  ].filter(g => g.chords.length > 0) : [];

  // ── Sidebar via portal ──────────────────────────────────────────────────────
  const sidebar = mounted && typeof document !== 'undefined' ? createPortal(
    <>

      {/* Sidebar panel */}
      <div
        ref={sidebarRef}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 1100,
          width: 320,
          background: theme.bgSecondary,
          borderLeft: `1px solid ${theme.border}`,
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
          display: 'flex', flexDirection: 'column',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 280ms cubic-bezier(0.32, 0, 0.15, 1)',
          pointerEvents: sidebarOpen ? 'auto' : 'none',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${theme.border}`,
          background: `linear-gradient(135deg, ${theme.bgTertiary} 0%, ${theme.bgSecondary} 100%)`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentPrimary}bb)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 2px 8px ${theme.accentPrimary}55`,
              }}>
                <Music2 size={14} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary, lineHeight: 1.2 }}>
                  Zone Chords
                </div>
                {activeZone && (
                  <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 1 }}>
                    {currentKey} {currentScale} · Frets {activeZone.fretLabel}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={closeSidebar}
              style={{
                width: 28, height: 28, borderRadius: 8, border: `1px solid ${theme.border}`,
                background: theme.bgTertiary, color: theme.textSecondary,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = theme.accentPrimary; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = theme.bgTertiary; (e.currentTarget as HTMLElement).style.color = theme.textSecondary; }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Zone selector pills inside sidebar */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {visibleZones.map((zone, idx) => {
              const isActive = activeZoneIdx === idx;
              return (
                <button
                  key={zone.label}
                  onClick={() => handleZoneClick(idx)}
                  style={{
                    padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: isActive ? 700 : 500,
                    border: `1px solid ${isActive ? theme.accentPrimary : theme.border}`,
                    background: isActive ? theme.accentPrimary : 'transparent',
                    color: isActive ? '#fff' : theme.textSecondary,
                    cursor: 'pointer', transition: 'all 150ms', whiteSpace: 'nowrap',
                  }}
                >
                  {zone.label}
                  <span style={{ marginLeft: 4, opacity: 0.65, fontSize: 10 }}>{zone.fretLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Chord Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 24px' }}>
          {isLoading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 120, gap: 8 }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', border: `3px solid ${theme.border}`, borderTopColor: theme.accentPrimary, animation: 'spin 0.8s linear infinite' }} />
              <span style={{ fontSize: 11, color: theme.textSecondary }}>Loading chords…</span>
            </div>
          )}

          {!isLoading && chordGroups.length === 0 && zoneData && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: theme.textSecondary, fontSize: 12 }}>
              No diatonic chords found in this zone.
            </div>
          )}

          {!isLoading && chordGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 20 }}>
              {/* Group header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 10, color: theme.accentPrimary, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {group.label}
                </span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${theme.border}, transparent)` }} />
                <span style={{ fontSize: 10, color: theme.textSecondary, opacity: 0.6 }}>{group.chords.length}</span>
              </div>

              {/* Chord cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {group.chords.map(chord => {
                  const isSelected = selectedChord?.symbol === chord.symbol;
                  const isHovered = hoveredChordSymbol === chord.symbol && !selectedChord;
                  const isActive = isSelected || isHovered;
                  return (
                    <button
                      key={chord.symbol}
                      onClick={() => handleChordClick(chord)}
                      onMouseEnter={() => handleChordHover(chord)}
                      onMouseLeave={() => handleChordHover(null)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 10, cursor: 'pointer',
                        border: `1px solid ${isSelected ? theme.accentPrimary : isHovered ? `${theme.accentPrimary}66` : theme.border}`,
                        background: isSelected
                          ? `linear-gradient(135deg, ${theme.accentPrimary}22, ${theme.accentPrimary}11)`
                          : isHovered
                            ? `${theme.accentPrimary}0d`
                            : theme.bgTertiary,
                        transition: 'all 150ms ease',
                        boxShadow: isSelected ? `0 0 0 1px ${theme.accentPrimary}44, 0 4px 12px ${theme.accentPrimary}22` : 'none',
                        textAlign: 'left',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {/* Root note badge */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                          background: isActive
                            ? `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentPrimary}cc)`
                            : `${theme.accentPrimary}22`,
                          border: `1px solid ${isActive ? theme.accentPrimary : `${theme.accentPrimary}44`}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, color: isActive ? '#fff' : theme.accentPrimary,
                          transition: 'all 150ms',
                        }}>
                          {chord.rootNote}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isActive ? theme.textPrimary : theme.textPrimary, lineHeight: 1.2 }}>
                            {chord.symbol}
                          </div>
                          <div style={{ fontSize: 10, color: theme.textSecondary, marginTop: 2 }}>
                            {chord.notes.join(' · ')}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isSelected && (
                          <div style={{
                            fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                            color: theme.accentPrimary, textTransform: 'uppercase',
                            background: `${theme.accentPrimary}22`, borderRadius: 4,
                            padding: '2px 6px', border: `1px solid ${theme.accentPrimary}44`,
                          }}>
                            active
                          </div>
                        )}
                        <ChevronRight size={14} color={isActive ? theme.accentPrimary : theme.textSecondary} style={{ opacity: isActive ? 1 : 0.4, transition: 'all 150ms' }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        {selectedChord && (
          <div style={{
            padding: '12px 16px', borderTop: `1px solid ${theme.border}`,
            background: theme.bgTertiary, flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 2 }}>Selected chord</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: theme.accentPrimary }}>{selectedChord.symbol}</div>
              </div>
              <button
                onClick={() => { setSelectedChord(null); setHoveredChordSymbol(null); onChordHighlight(null); onChordSelected?.(false); }}
                style={{
                  padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 600,
                  border: `1px solid ${theme.border}`, background: theme.bgSecondary,
                  color: theme.textSecondary, cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>,
    document.body
  ) : null;

  return (
    <>
      {/* ── Zone pill strip (inline in the page) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '2px 0', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 600, color: theme.textSecondary, opacity: 0.7, whiteSpace: 'nowrap', letterSpacing: 0.3 }}>
          Zones
        </span>
        <div style={{ width: 1, height: 14, background: theme.border, flexShrink: 0 }} />
        {visibleZones.map((zone, idx) => {
          const isActive = activeZoneIdx === idx;
          return (
            <button
              key={zone.label}
              onClick={() => handleZoneClick(idx)}
              title={`${zone.label} — frets ${zone.fretLabel} (CAGED shape ${zone.shape})`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 20, fontSize: 11,
                fontWeight: isActive ? 700 : 500, cursor: 'pointer',
                border: `1px solid ${isActive ? theme.accentPrimary : theme.border}`,
                background: isActive
                  ? `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentPrimary}cc)`
                  : 'transparent',
                color: isActive ? '#fff' : theme.textSecondary,
                boxShadow: isActive ? `0 2px 8px ${theme.accentPrimary}44` : 'none',
                transition: 'all 180ms ease',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{zone.label}</span>
              <span style={{ opacity: isActive ? 0.75 : 0.5, fontSize: 10 }}>{zone.fretLabel}</span>
              {isActive && selectedChord && (
                <span style={{
                  marginLeft: 2, width: 6, height: 6, borderRadius: '50%',
                  background: '#fff', flexShrink: 0,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {sidebar}
    </>
  );
}
