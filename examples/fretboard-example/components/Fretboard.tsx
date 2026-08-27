'use client';

import { useMemo } from 'react';
import {
  NotePosition, DiatonicTriad, TriadMembershipEntry,
  NOTE_COLORS, normalizeNoteToSharp,
} from './musicTheory';
import { TriadArcBandSegments } from './TriadArcBandSegments';

// ── Constants ────────────────────────────────────────────────────────────────

const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24];
const DOUBLE_MARKERS = [12, 24];
const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

const STRING_COLORS = [
  '#ef4444', '#eab308', '#3b82f6', '#f97316', '#22c55e', '#9333ea',
];

const THEME = {
  fretboardBg: '#1e1e1e',
  fretboardFret: '#4a4a4a',
  fretboardString: '#666666',
  fretMarker: '#888888',
  textPrimary: '#ffffff',
  textSecondary: '#a0a0a0',
};

// Interval colors for chord tone border (root/3rd/5th)
const INTERVAL_COLS = ['#E85555', '#F5BC3C', '#4caf50', '#A07ED4'];

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ── Props ────────────────────────────────────────────────────────────────────

export interface FretboardProps {
  tuning: string[];                     // e.g. ['E','A','D','G','B','E']
  notePositions: NotePosition[];        // all scale notes (with triadMembership attached)
  fretCount?: number;
  fretWidth?: number;                   // 20–100, default 50 (= 70px)

  /** Triads in Scale — Arc Band mode: colour bands at note-circle bottom */
  showTriadArcBands?: boolean;

  /** Triads in Scale — Focus mode: spotlight one triad, dim others */
  triadFocusOn?: boolean;
  focusTriad?: DiatonicTriad | null;
  nonTriadOpacity?: number;             // 0–100, default 30

  showTopFretNumbers?: boolean;
  showBottomFretNumbers?: boolean;
  showTopFretDots?: boolean;
  showBottomFretDots?: boolean;
}

// ── Component ────────────────────────────────────────────────────────────────

export default function Fretboard({
  tuning,
  notePositions,
  fretCount = 24,
  fretWidth = 50,
  showTriadArcBands = false,
  triadFocusOn = false,
  focusTriad = null,
  nonTriadOpacity = 30,
  showTopFretNumbers = true,
  showBottomFretNumbers = true,
  showTopFretDots = true,
  showBottomFretDots = true,
}: FretboardProps) {
  const fretWidthPx = Math.round(70 * (fretWidth / 50));
  const fretHalfPx = Math.round(fretWidthPx / 2);

  const noteMap = useMemo(() => {
    const map = new Map<string, NotePosition[]>();
    notePositions.forEach(pos => {
      if (pos.fretNumber > fretCount) return;
      const key = `${pos.stringIndex}-${pos.fretNumber}`;
      const existing = map.get(key) ?? [];
      map.set(key, [...existing, pos]);
    });
    return map;
  }, [notePositions, fretCount]);

  return (
    <div className="relative w-full overflow-x-auto pb-8">
      <div className="inline-block mx-auto">
        <div className="relative" style={{ background: THEME.fretboardBg, borderRadius: 12, padding: '40px 20px' }}>

          {/* Top fret numbers + dots */}
          <div className="absolute top-2 left-0 right-0" style={{ paddingLeft: 30, paddingRight: 30, color: THEME.textSecondary }}>
            {showTopFretDots && (
              <div className="flex mb-2">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div key={i} className="flex items-center justify-center"
                    style={{ width: i === 0 ? 40 : fretWidthPx, minWidth: i === 0 ? 40 : fretWidthPx, transform: i === 0 ? 'none' : `translateX(${fretHalfPx}px)`, height: 32 }}>
                    {FRET_MARKERS.includes(i) && (
                      <div className="flex flex-col gap-2 items-center">
                        <div style={{ width: DOUBLE_MARKERS.includes(i) ? 12 : 16, height: DOUBLE_MARKERS.includes(i) ? 12 : 16, borderRadius: '50%', background: THEME.fretMarker }} />
                        {DOUBLE_MARKERS.includes(i) && <div style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.fretMarker }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showTopFretNumbers && (
              <div className="flex">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div key={i} className="flex items-center justify-center text-xl font-medium"
                    style={{ width: i === 0 ? 40 : fretWidthPx, minWidth: i === 0 ? 40 : fretWidthPx, transform: i === 0 ? 'none' : `translateX(${fretHalfPx}px)` }}>
                    {i}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Strings */}
          <div className="relative mt-6">
            {tuning.map((openNote, stringIndex) => (
              <div key={stringIndex} className="flex items-center mb-3 last:mb-0">
                {/* String label */}
                <div className="w-8 text-center font-semibold text-sm mr-2" style={{ color: THEME.textPrimary }}>
                  {openNote}
                </div>
                <div className="relative flex-1 flex items-center">
                  {/* Physical string line */}
                  <div className="absolute left-0 right-0"
                    style={{ height: Math.max(1, 4 - stringIndex * 0.3), background: STRING_COLORS[stringIndex] ?? THEME.fretboardString, top: '50%', transform: 'translateY(-50%)' }} />

                  {/* Fret cells */}
                  {Array.from({ length: fretCount + 1 }, (_, fretIndex) => {
                    const key = `${stringIndex}-${fretIndex}`;
                    const notesHere = noteMap.get(key) ?? [];
                    return (
                      <div key={fretIndex} className="relative flex items-center justify-center"
                        style={{ width: fretIndex === 0 ? 40 : fretWidthPx, minWidth: fretIndex === 0 ? 40 : fretWidthPx, height: 44 }}>
                        {notesHere.length > 0 && (() => {
                          const notePos = notesHere[0];
                          return <NoteCircle notePos={notePos} triadFocusOn={triadFocusOn} focusTriad={focusTriad} nonTriadOpacity={nonTriadOpacity} showTriadArcBands={showTriadArcBands} />;
                        })()}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Vertical fret lines */}
            <div className="absolute left-0 top-0 bottom-0 pointer-events-none" style={{ paddingLeft: 30 }}>
              {Array.from({ length: fretCount + 1 }, (_, i) => {
                if (i === 0) return null;
                return <div key={i} className="absolute top-0 bottom-0"
                  style={{ left: 40 + (i - 1) * fretWidthPx + fretHalfPx, width: 2, background: THEME.fretboardFret }} />;
              })}
            </div>
          </div>

          {/* Bottom dots + numbers */}
          <div className="absolute left-0 right-0" style={{ paddingLeft: 30, paddingRight: 30, bottom: -32 }}>
            {showBottomFretDots && (
              <div className="flex mb-2">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div key={i} className="flex items-center justify-center"
                    style={{ width: i === 0 ? 40 : fretWidthPx, minWidth: i === 0 ? 40 : fretWidthPx, transform: i === 0 ? 'none' : `translateX(${fretHalfPx}px)`, height: 32 }}>
                    {FRET_MARKERS.includes(i) && (
                      <div className="flex flex-col gap-2 items-center">
                        <div style={{ width: DOUBLE_MARKERS.includes(i) ? 12 : 16, height: DOUBLE_MARKERS.includes(i) ? 12 : 16, borderRadius: '50%', background: THEME.fretMarker }} />
                        {DOUBLE_MARKERS.includes(i) && <div style={{ width: 12, height: 12, borderRadius: '50%', background: THEME.fretMarker }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {showBottomFretNumbers && (
              <div className="flex">
                {Array.from({ length: fretCount + 1 }, (_, i) => (
                  <div key={i} className="flex items-center justify-center"
                    style={{ width: i === 0 ? 40 : fretWidthPx, minWidth: i === 0 ? 40 : fretWidthPx, transform: i === 0 ? 'none' : `translateX(${fretHalfPx}px)` }}>
                    <div className="text-xl font-medium" style={{ color: THEME.textSecondary }}>{i}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── NoteCircle sub-component ─────────────────────────────────────────────────

interface NoteCircleProps {
  notePos: NotePosition;
  triadFocusOn: boolean;
  focusTriad: DiatonicTriad | null;
  nonTriadOpacity: number;
  showTriadArcBands: boolean;
}

function NoteCircle({ notePos, triadFocusOn, focusTriad, nonTriadOpacity, showTriadArcBands }: NoteCircleProps) {
  const normalized = normalizeNoteToSharp(notePos.note);
  const circleFill = NOTE_COLORS[notePos.note] ?? '#6b7280';
  let circleDiameter = notePos.isRoot ? 32 : 28;
  let circleOpacity = 1;
  let borderColor = 'none';
  let boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
  let overflow: 'hidden' | 'visible' = 'visible';
  let letterNudge = false;

  if (triadFocusOn && focusTriad) {
    const inTriad = focusTriad.notes.includes(normalized);
    if (inTriad) {
      // Foreground note: interval-coloured border + glow
      const triIdx = focusTriad.notes.indexOf(normalized);
      const col = INTERVAL_COLS[triIdx] ?? INTERVAL_COLS[0];
      borderColor = `3px solid ${col}`;
      boxShadow = `0 0 0 4px ${hexToRgba(col, 0.55)}, 0 0 12px ${hexToRgba(col, 0.35)}`;
      if (notePos.isRoot) circleDiameter = 36;
    } else {
      // Background note: dimmed
      circleOpacity = nonTriadOpacity / 100;
    }
  } else if (showTriadArcBands && (notePos.triadMembership?.length ?? 0) > 0) {
    overflow = 'hidden';
    letterNudge = true;
  } else if (notePos.isRoot) {
    borderColor = '2px solid #ffffff';
    boxShadow = '0 0 0 3px rgba(255,255,255,0.3), 0 4px 12px rgba(0,0,0,0.4)';
  }

  const size = `${circleDiameter}px`;

  return (
    <div
      className="relative z-10 flex items-center justify-center font-semibold text-xs"
      style={{
        width: size, height: size,
        borderRadius: '50%',
        backgroundColor: circleFill,
        color: '#ffffff',
        border: borderColor,
        boxShadow,
        opacity: circleOpacity,
        overflow,
        position: 'relative',
        transition: 'all 150ms ease-out',
      }}
    >
      <span style={{ transform: letterNudge ? 'translateY(-3px)' : 'none', display: 'block' }}>
        {notePos.note}
      </span>
      {showTriadArcBands && !triadFocusOn && (notePos.triadMembership?.length ?? 0) > 0 && (
        <TriadArcBandSegments membership={notePos.triadMembership!} circleDiameter={circleDiameter} />
      )}
    </div>
  );
}
