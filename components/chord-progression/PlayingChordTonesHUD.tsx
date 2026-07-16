'use client';

/**
 * Header HUD showing chord tones of the chord currently under the playback cursor.
 * Lives in the center of the Song Builder header.
 * Fades to a compact restore button when hidden by the user.
 */

import { useMemo } from 'react';
import { Eye, EyeOff, Music } from 'lucide-react';
import { ChordInstance } from '@/lib/chord-progression/types';
import { computeChordTones } from '@/lib/chord-progression/chord-tones-utils';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface PlayingChordTonesHUDProps {
  playingChord: ChordInstance | null;
  isPlaying: boolean;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export default function PlayingChordTonesHUD({
  playingChord,
  isPlaying,
  isVisible,
  onToggleVisibility,
}: PlayingChordTonesHUDProps) {
  const { getNoteDisplayName } = useNoteDisplay();

  const chordTones = useMemo(
    () => (playingChord ? computeChordTones(playingChord.chordSymbol) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [playingChord?.chordSymbol],
  );

  const rootColor = playingChord
    ? (NOTE_COLORS[playingChord.rootNote || playingChord.chordSymbol.replace(/[^A-G#b]/g, '')] ?? '#3b82f6')
    : '#3b82f6';

  /* ── Collapsed restore button ─────────────────────────────── */
  if (!isVisible) {
    return (
      <button
        onClick={onToggleVisibility}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#141414] hover:bg-[#222] hover:border-[#3b82f6]/50 transition-all text-[#555] hover:text-white text-xs font-medium"
        title="Show Live Chord Tones"
      >
        <Music className="w-3.5 h-3.5" />
        <span>Chord Tones</span>
        <Eye className="w-3 h-3 opacity-60" />
      </button>
    );
  }

  const isActive = isPlaying && playingChord != null;

  return (
    <div className="flex items-center gap-3">
      {/* Label / chord name column */}
      <div className="flex flex-col items-end gap-0.5 pr-3 border-r border-[#2a2a2a] min-w-[60px]">
        <div className="flex items-center gap-1.5">
          {/* Pulsing dot when active */}
          <span
            className={`w-2 h-2 rounded-full transition-all ${isActive ? 'animate-pulse' : 'opacity-20'}`}
            style={{ backgroundColor: isActive ? rootColor : '#555' }}
          />
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#666]">
            {isActive ? 'Playing' : 'Chord Tones'}
          </span>
        </div>
        <span
          className="text-[17px] font-bold leading-none transition-all duration-300"
          style={{ color: isActive ? rootColor : '#444' }}
        >
          {isActive ? playingChord!.chordSymbol : '—'}
        </span>
      </div>

      {/* Tone squares */}
      <div className="flex items-center gap-[6px]">
        {isActive ? (
          chordTones.map((tone, i) => (
            <div
              key={`${playingChord!.chordSymbol}-${i}`}
              className="flex flex-col items-center justify-center rounded-lg shrink-0 transition-all duration-300"
              style={{
                width: 46,
                height: 46,
                backgroundColor: tone.noteColor,
                border: `2px solid ${tone.intervalColor}`,
                boxShadow: `0 0 12px ${tone.intervalColor}70, 0 0 24px ${tone.intervalColor}30`,
              }}
              title={`${tone.note} — ${tone.intervalLabel}`}
            >
              <span className="text-white font-bold leading-none" style={{ fontSize: 15 }}>
                {getNoteDisplayName(tone.note)}
              </span>
              <span className="text-white/65 font-semibold leading-none mt-[3px]" style={{ fontSize: 9 }}>
                {tone.intervalLabel}
              </span>
            </div>
          ))
        ) : (
          /* Placeholder blocks when nothing is playing */
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded-lg shrink-0"
              style={{
                width: 46,
                height: 46,
                backgroundColor: '#161616',
                border: '2px solid #272727',
              }}
            >
              <span className="text-[#333] font-bold" style={{ fontSize: 18 }}>·</span>
            </div>
          ))
        )}
      </div>

      {/* Hide toggle */}
      <button
        onClick={onToggleVisibility}
        className="ml-1 p-1.5 rounded-md text-[#444] hover:text-white hover:bg-[#222] transition-all"
        title="Hide Chord Tones HUD"
      >
        <EyeOff className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
