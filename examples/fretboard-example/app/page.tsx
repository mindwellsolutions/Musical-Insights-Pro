/**
 * A Aeolian — Triads in Scale (Position I = i minor triad)
 * Fully self-contained: no external deps beyond Next.js + React + Tailwind.
 *
 * HOW TO UPGRADE THE FRETBOARD GRAPHICS:
 *   1. Edit components/Fretboard.tsx — the NoteCircle sub-component controls
 *      every note dot's visual appearance (shape, color, glow, arc bands).
 *   2. Edit components/TriadArcBandSegments.tsx for the color-band rendering.
 *   3. The music-theory data (note positions, triad membership) flows in as plain
 *      arrays from this page — no changes needed here for purely graphical upgrades.
 *   4. After upgrading, copy the updated files back to the main project's:
 *        components/Fretboard.tsx
 *        components/scale-triads/TriadArcBandSegments.tsx
 */
'use client';

import { useMemo } from 'react';
import Fretboard from '../components/Fretboard';
import {
  calculateScalePositions,
  computeDiatonicTriads,
  computeTriadMembership,
  normalizeNoteToSharp,
  NotePosition,
} from '../components/musicTheory';

// ── Hardcoded config: A Aeolian, Standard 6-string, Triads in Scale, Position I ──

const ROOT_NOTE = 'A';
const SCALE_NAME = 'Aeolian';
const TUNING = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard 6-string guitar
const FRET_COUNT = 24;
const FOCUS_DEGREE = 'i'; // Position I of A Aeolian = Am (i minor)

export default function Page() {
  // 1. All scale note positions across the fretboard
  const basePositions = useMemo(
    () => calculateScalePositions(ROOT_NOTE, SCALE_NAME, TUNING, FRET_COUNT),
    []
  );

  // 2. Diatonic triads for A Aeolian
  const diatonicTriads = useMemo(
    () => computeDiatonicTriads(ROOT_NOTE, SCALE_NAME),
    []
  );

  // 3. Triad membership map — which triads contain each note
  const membershipMap = useMemo(
    () => computeTriadMembership(diatonicTriads),
    [diatonicTriads]
  );

  // 4. Attach membership to every note position
  const notePositions: NotePosition[] = useMemo(
    () => basePositions.map(p => ({
      ...p,
      triadMembership: membershipMap[normalizeNoteToSharp(p.note)] ?? [],
    })),
    [basePositions, membershipMap]
  );

  // 5. The focused triad: Position I of A Aeolian = "i" (Am)
  const focusTriad = useMemo(
    () => diatonicTriads.find(t => t.degree === FOCUS_DEGREE) ?? diatonicTriads[0] ?? null,
    [diatonicTriads]
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8"
      style={{ background: '#0a0a0a' }}>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          A Aeolian — Triads in Scale
        </h1>
        <p className="text-gray-400 text-sm">
          Position {focusTriad?.degree ?? 'I'} &nbsp;·&nbsp; {focusTriad?.rootNote ?? 'A'} {focusTriad?.quality ?? 'minor'} triad highlighted
        </p>
        {/* Triad legend */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {diatonicTriads.map(t => (
            <span key={t.degree}
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{
                background: t.degree === focusTriad?.degree ? t.color : `${t.color}55`,
                border: `1.5px solid ${t.color}`,
                opacity: t.degree === focusTriad?.degree ? 1 : 0.6,
              }}>
              {t.degree} — {t.rootNote}{t.quality === 'minor' ? 'm' : t.quality === 'diminished' ? '°' : ''}
            </span>
          ))}
        </div>
      </div>

      {/* Fretboard */}
      <div className="w-full max-w-7xl">
        <Fretboard
          tuning={TUNING}
          notePositions={notePositions}
          fretCount={FRET_COUNT}
          fretWidth={50}
          triadFocusOn={true}
          focusTriad={focusTriad}
          nonTriadOpacity={30}
          showTriadArcBands={false}
          showTopFretNumbers={true}
          showBottomFretNumbers={true}
          showTopFretDots={true}
          showBottomFretDots={true}
        />
      </div>

      {/* Arc Band view (alternative mode — shows all triad memberships at once) */}
      <div className="w-full max-w-7xl mt-16">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-white">All Triads — Arc Band View</h2>
          <p className="text-gray-400 text-sm">Colour bands at circle bottom show which diatonic triads each note belongs to</p>
        </div>
        <Fretboard
          tuning={TUNING}
          notePositions={notePositions}
          fretCount={FRET_COUNT}
          fretWidth={50}
          triadFocusOn={false}
          focusTriad={null}
          nonTriadOpacity={100}
          showTriadArcBands={true}
          showTopFretNumbers={true}
          showBottomFretNumbers={true}
          showTopFretDots={true}
          showBottomFretDots={true}
        />
      </div>

      {/* Data export block for upgrader reference */}
      <details className="mt-16 w-full max-w-3xl">
        <summary className="text-gray-500 text-xs cursor-pointer hover:text-gray-300 transition-colors">
          Show raw data (for graphical upgrade reference)
        </summary>
        <pre className="mt-4 p-4 bg-gray-900 rounded-lg text-xs text-gray-300 overflow-auto max-h-64">
          {JSON.stringify({ rootNote: ROOT_NOTE, scale: SCALE_NAME, tuning: TUNING, diatonicTriads, focusDegree: FOCUS_DEGREE, sampleNotePositions: notePositions.slice(0, 10) }, null, 2)}
        </pre>
      </details>
    </main>
  );
}
