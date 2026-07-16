'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Layers, SplitSquareHorizontal } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { ChordProgression } from '@/lib/progression-analyzer/types';
import { CompatibleChordEntry, ProgressionChordSelections, IntervalChordDatabase } from '@/lib/music-theory/progression-interval-chords/types';

export interface ProgressionIntervalChordSelectorProps {
  progression: ChordProgression;
  currentKey: string;
  theme: ThemeConfig;
  onChordSelectionsChange: (selections: ProgressionChordSelections, viewMode: 'step' | 'all', currentSlot: number) => void;
}

async function fetchIntervalChords(key: string): Promise<IntervalChordDatabase> {
  const res = await fetch(`/api/progression-interval-chords?key=${encodeURIComponent(key)}`);
  if (!res.ok) throw new Error('Failed to fetch interval chords');
  return res.json();
}

const SUITABILITY_COLOR = (s: number) => s >= 9 ? '#22c55e' : s >= 7 ? '#f59e0b' : '#6b7280';

export default function ProgressionIntervalChordSelector({
  progression, currentKey, theme, onChordSelectionsChange,
}: ProgressionIntervalChordSelectorProps) {
  const [currentSlot, setCurrentSlot] = useState(0);
  const [viewMode, setViewMode] = useState<'step' | 'all'>('step');
  const [chordSelections, setChordSelections] = useState<ProgressionChordSelections>({});

  const { data: db, isLoading } = useQuery<IntervalChordDatabase>({
    queryKey: ['progression-interval-chords', currentKey],
    queryFn: () => fetchIntervalChords(currentKey),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const slots = useMemo(() =>
    progression.romanNumerals.map((rn, i) => ({ rn, chord: progression.chords[i], idx: i }))
      .filter(s => s.rn !== 'Other' && s.chord !== 'Other'),
    [progression]
  );

  const clampedSlot = Math.min(currentSlot, Math.max(0, slots.length - 1));
  const activeSlot = slots[clampedSlot];
  const compatibleChords: CompatibleChordEntry[] = useMemo(() => {
    if (!db || !activeSlot) return [];
    return db.scaleDegrees[activeSlot.rn]?.compatibleChords ?? [];
  }, [db, activeSlot]);

  const selectedForSlot = activeSlot ? chordSelections[activeSlot.idx] : undefined;

  const handleSelectChord = useCallback((entry: CompatibleChordEntry, slotIdx: number) => {
    const next = { ...chordSelections, [slotIdx]: entry };
    setChordSelections(next);
    onChordSelectionsChange(next, viewMode, currentSlot);
  }, [chordSelections, onChordSelectionsChange, viewMode, currentSlot]);

  const handleViewModeToggle = useCallback((mode: 'step' | 'all') => {
    setViewMode(mode);
    onChordSelectionsChange(chordSelections, mode, currentSlot);
  }, [chordSelections, onChordSelectionsChange, currentSlot]);

  const handleSlotNav = useCallback((dir: -1 | 1) => {
    const next = Math.max(0, Math.min(slots.length - 1, clampedSlot + dir));
    setCurrentSlot(next);
    onChordSelectionsChange(chordSelections, viewMode, next);
  }, [clampedSlot, slots.length, chordSelections, viewMode, onChordSelectionsChange]);

  if (slots.length === 0) return null;

  return (
    <div className="rounded-xl p-4 mt-3" style={{ width: 680, maxWidth: '100%', background: theme.bgTertiary, border: `1px solid ${theme.border}` }}>
      {/* Header: slot chips + view mode toggle */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        {/* Slot chips horizontal scroll */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 flex-1" style={{ scrollbarWidth: 'none' }}>
          {slots.map((slot, i) => {
            const sel = chordSelections[slot.idx];
            const label = sel ? `${slot.rn} · ${sel.symbol}` : slot.rn;
            return (
              <button
                key={slot.idx}
                onClick={() => { setCurrentSlot(i); onChordSelectionsChange(chordSelections, viewMode, i); }}
                className="text-xs px-3 py-1 rounded-full transition-all whitespace-nowrap font-semibold"
                style={{
                  background: i === clampedSlot ? theme.accentPrimary : theme.bgSecondary,
                  color: i === clampedSlot ? '#fff' : theme.textSecondary,
                  border: `1px solid ${i === clampedSlot ? theme.accentPrimary : theme.border}`,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-1 flex-shrink-0">
          <button onClick={() => handleViewModeToggle('step')}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all font-semibold"
            style={{ background: viewMode === 'step' ? theme.accentPrimary : theme.bgSecondary, color: viewMode === 'step' ? '#fff' : theme.textSecondary, border: `1px solid ${viewMode === 'step' ? theme.accentPrimary : theme.border}`, cursor: 'pointer' }}
            title="Step View — navigate one chord at a time">
            <SplitSquareHorizontal size={12} /> Step
          </button>
          <button onClick={() => handleViewModeToggle('all')}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all font-semibold"
            style={{ background: viewMode === 'all' ? theme.accentPrimary : theme.bgSecondary, color: viewMode === 'all' ? '#fff' : theme.textSecondary, border: `1px solid ${viewMode === 'all' ? theme.accentPrimary : theme.border}`, cursor: 'pointer' }}
            title="All Chords View — see all chords simultaneously with color rings">
            <Layers size={12} /> All
          </button>
        </div>
      </div>

      {/* Slot navigator */}
      {viewMode === 'step' && activeSlot && (
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => handleSlotNav(-1)} disabled={clampedSlot === 0}
            style={{ background: 'none', border: 'none', cursor: clampedSlot === 0 ? 'default' : 'pointer', color: clampedSlot === 0 ? theme.border : theme.textPrimary, padding: 2 }}>
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Slot {clampedSlot + 1} of {slots.length}: <span style={{ color: theme.accentPrimary }}>{activeSlot.rn}</span>
            {' '}({activeSlot.chord})
          </span>
          <button onClick={() => handleSlotNav(1)} disabled={clampedSlot === slots.length - 1}
            style={{ background: 'none', border: 'none', cursor: clampedSlot === slots.length - 1 ? 'default' : 'pointer', color: clampedSlot === slots.length - 1 ? theme.border : theme.textPrimary, padding: 2 }}>
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Selected chord suitability bar */}
      {selectedForSlot && (
        <div className="mb-3 px-3 py-2 rounded-lg" style={{ background: theme.bgSecondary }}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold" style={{ color: theme.textPrimary }}>Selected: {selectedForSlot.symbol}</span>
            <span className="text-xs" style={{ color: SUITABILITY_COLOR(selectedForSlot.suitability) }}>
              {selectedForSlot.suitability}/10
            </span>
          </div>
          <div className="w-full rounded-full h-1.5 mb-1" style={{ background: theme.border }}>
            <div className="h-1.5 rounded-full" style={{ width: `${selectedForSlot.suitability * 10}%`, background: SUITABILITY_COLOR(selectedForSlot.suitability) }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs italic" style={{ color: theme.textSecondary }}>{selectedForSlot.context}</span>
            <span className="text-xs" style={{ color: theme.textSecondary }}>{selectedForSlot.genres.slice(0, 3).join(' · ')}</span>
          </div>
        </div>
      )}

      {/* Chord alternatives */}
      {isLoading ? (
        <div className="text-xs text-center py-3" style={{ color: theme.textSecondary }}>Loading chord options…</div>
      ) : (
        <div>
          <div className="text-xs font-semibold mb-2" style={{ color: theme.textSecondary }}>
            {viewMode === 'step' ? 'Alternatives:' : 'Select chords for each slot:'}
          </div>
          {viewMode === 'all' ? (
            /* All-mode: show all slots' alternatives */
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {slots.map((slot, i) => {
                const slotChords = db?.scaleDegrees[slot.rn]?.compatibleChords ?? [];
                const selEntry = chordSelections[slot.idx];
                return (
                  <div key={slot.idx}>
                    <span className="text-xs font-semibold mr-2" style={{ color: theme.accentPrimary }}>{slot.rn}:</span>
                    <div className="inline-flex flex-wrap gap-1">
                      {slotChords.slice(0, 6).map(c => (
                        <button key={c.symbol} onClick={() => handleSelectChord(c, slot.idx)}
                          className="text-xs px-2 py-0.5 rounded transition-all"
                          style={{ background: selEntry?.symbol === c.symbol ? theme.accentPrimary : theme.bgSecondary, color: selEntry?.symbol === c.symbol ? '#fff' : theme.textPrimary, border: `1px solid ${selEntry?.symbol === c.symbol ? theme.accentPrimary : theme.border}`, cursor: 'pointer' }}>
                          {c.symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {compatibleChords.slice(0, 9).map(c => {
                const isSel = selectedForSlot?.symbol === c.symbol;
                return (
                  <button key={c.symbol}
                    onClick={() => activeSlot && handleSelectChord(c, activeSlot.idx)}
                    title={`${c.displayName} — ${c.context}`}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
                    style={{ background: isSel ? theme.accentPrimary : theme.bgSecondary, color: isSel ? '#fff' : theme.textPrimary, border: `2px solid ${isSel ? theme.accentPrimary : theme.border}`, cursor: 'pointer', position: 'relative' }}>
                    {c.symbol}
                    {isSel && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
              {compatibleChords.length === 0 && <span className="text-xs" style={{ color: theme.textSecondary }}>No alternatives for {activeSlot?.rn}</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
