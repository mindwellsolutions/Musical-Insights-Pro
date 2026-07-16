'use client';

/**
 * Enhanced time ruler with beat markers and time display
 * Now supports clicking to seek to any position
 */

import { useRef } from 'react';
import { getBeatMarkers } from '@/lib/chord-progression/timeline-utils';
import { ChordInstance } from '@/lib/chord-progression/types';

interface TimeRulerProps {
  totalBeats: number;
  pixelsPerBeat: number;
  bpm: number;
  chords?: ChordInstance[];
  onSeek?: (beats: number) => void;
}

export default function TimeRuler({ totalBeats, pixelsPerBeat, bpm, chords = [], onSeek }: TimeRulerProps) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const markers = getBeatMarkers(totalBeats, 4);

  // Convert beat to time (minutes:seconds)
  const beatToTime = (beat: number) => {
    const seconds = (beat / bpm) * 60;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle click on ruler to seek
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !rulerRef.current) return;

    const rect = rulerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const beats = clickX / pixelsPerBeat;

    // Find if there's a chord at this position
    const chordAtPosition = chords.find(
      chord => beats >= chord.startTime && beats < chord.startTime + chord.duration
    );

    // If clicking on a chord, seek to the clicked position within that chord
    // This allows playing the chord from any point in its measure
    if (chordAtPosition) {
      const clampedBeats = Math.max(0, Math.min(beats, totalBeats));
      onSeek(clampedBeats);
    } else {
      // If not clicking on a chord, just seek to the position
      const clampedBeats = Math.max(0, Math.min(beats, totalBeats));
      onSeek(clampedBeats);
    }
  };

  return (
    <div
      ref={rulerRef}
      onClick={handleClick}
      className="h-6 bg-gradient-to-b from-[#0f0f0f] to-[#141414] border-b-2 border-[#2a2a2a] relative sticky top-0 cursor-pointer hover:bg-gradient-to-b hover:from-[#141414] hover:to-[#181818] transition-colors"
      style={{
        zIndex: 'var(--cpb-z-time-ruler)',
        boxShadow: 'var(--cpb-shadow-md)'
      }}
      title="Click to seek to position"
    >
      {markers.map(marker => (
        <div
          key={marker.beat}
          className="absolute top-0 h-full flex items-center"
          style={{ left: marker.beat * pixelsPerBeat }}
        >
          {/* Vertical grid line */}
          <div
            className={`absolute top-0 left-0 h-full ${
              marker.isBarStart
                ? 'w-[2px] bg-[#4a4a4a]'
                : 'w-[1px] bg-[#2a2a2a]'
            }`}
          />

          {/* Beat label — single line */}
          <span
            className={`select-none pl-1 leading-none ${
              marker.isBarStart
                ? 'text-[11px] font-semibold text-white'
                : 'text-[9px] font-medium text-[#b0b0b0]'
            }`}
          >
            {marker.label}
          </span>
        </div>
      ))}
    </div>
  );
}

