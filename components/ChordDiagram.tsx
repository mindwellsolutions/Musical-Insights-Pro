'use client';

import { memo } from 'react';
import { ChordVoicing } from '@/lib/chord-voicings';
import { ThemeConfig } from '@/lib/themes';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface ChordDiagramProps {
  voicing: ChordVoicing;
  theme: ThemeConfig;
  stringCount: number;
  compact?: boolean;
}

const ChordDiagram = memo(function ChordDiagram({
  voicing,
  theme,
  stringCount,
  compact = false,
}: ChordDiagramProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const { positions, startFret, endFret, commonName } = voicing;

  // Calculate display parameters
  const displayFrets = Math.max(endFret - startFret + 1, 4);
  const fretHeight = compact ? 38 : 48;
  const stringSpacing = compact ? 22 : 26;
  const diagramWidth = (stringCount - 1) * stringSpacing + 80; // Increased for larger fret numbers
  const diagramHeight = displayFrets * fretHeight + 50;
  const leftMargin = 40;

  // Reverse positions for display (high E on right, low E on left)
  const displayPositions = [...positions].reverse();
  
  return (
    <div className="flex flex-col items-center">
      <svg
        width={diagramWidth}
        height={diagramHeight}
        className="chord-diagram"
      >
        {/* SVG Filters */}
        <defs>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
            <feOffset dx="0" dy="1" result="offsetblur"/>
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.3"/>
            </feComponentTransfer>
            <feMerge>
              <feMergeNode/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Fret position indicator on the left */}
        {startFret > 0 && (
          <g>
            <text
              x={10}
              y={fretHeight + 8}
              fontSize={compact ? 16 : 18}
              fill={theme.accentPrimary}
              fontWeight="bold"
            >
              {startFret}
            </text>
            <text
              x={10}
              y={fretHeight + (compact ? 22 : 24)}
              fontSize={compact ? 11 : 12}
              fill={theme.textSecondary}
              fontWeight="600"
            >
              fr
            </text>
          </g>
        )}
        
        {/* Draw strings (vertical lines) */}
        {displayPositions.map((_, idx) => {
          const x = leftMargin + idx * stringSpacing;
          return (
            <line
              key={`string-${idx}`}
              x1={x}
              y1={20}
              x2={x}
              y2={20 + displayFrets * fretHeight}
              stroke={theme.fretboardString}
              strokeWidth={idx === 0 || idx === stringCount - 1 ? 2.5 : 1.5}
            />
          );
        })}
        
        {/* Draw frets (horizontal lines) with fret numbers */}
        {Array.from({ length: displayFrets + 1 }).map((_, idx) => {
          const y = 20 + idx * fretHeight;
          const isNut = startFret === 0 && idx === 0;
          const fretNum = startFret + idx;

          return (
            <g key={`fret-${idx}`}>
              <line
                x1={leftMargin}
                y1={y}
                x2={leftMargin + (stringCount - 1) * stringSpacing}
                y2={y}
                stroke={theme.fretboardFret}
                strokeWidth={isNut ? 4 : 2}
              />
              {/* Fret number labels on the right side */}
              {idx > 0 && idx < displayFrets && (
                <text
                  x={leftMargin + (stringCount - 1) * stringSpacing + 16}
                  y={y + fretHeight / 2 + 5}
                  fontSize={compact ? 12 : 14}
                  fill={theme.textSecondary}
                  fontWeight="700"
                  opacity={0.75}
                >
                  {fretNum}
                </text>
              )}
            </g>
          );
        })}
        
        {/* Draw finger positions */}
        {displayPositions.map((pos, idx) => {
          const x = leftMargin + idx * stringSpacing;
          
          if (pos.fret === -1) {
            // Muted string - draw X above
            return (
              <text
                key={`mute-${idx}`}
                x={x}
                y={15}
                fontSize={compact ? 16 : 18}
                fill={theme.textSecondary}
                textAnchor="middle"
                fontWeight="bold"
              >
                ×
              </text>
            );
          }

          if (pos.fret === 0) {
            // Open string - draw O above
            return (
              <circle
                key={`open-${idx}`}
                cx={x}
                cy={10}
                r={compact ? 5 : 6}
                fill="none"
                stroke={theme.textPrimary}
                strokeWidth={2.5}
              />
            );
          }

          // Fretted note - draw filled circle with finger number
          const fretPosition = pos.fret - startFret;
          const y = 20 + fretPosition * fretHeight + fretHeight / 2;
          const noteColor = NOTE_COLORS[pos.note] || theme.accentPrimary;
          const radius = compact ? 10 : 12;

          return (
            <g key={`note-${idx}`}>
              {/* Glow effect for root notes */}
              {pos.isRoot && (
                <circle
                  cx={x}
                  cy={y}
                  r={radius + 3}
                  fill={noteColor}
                  opacity={0.3}
                />
              )}
              {/* Note circle */}
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill={noteColor}
                stroke={pos.isRoot ? '#ffffff' : noteColor}
                strokeWidth={pos.isRoot ? 2.5 : 0}
                filter={pos.isRoot ? 'url(#shadow)' : 'none'}
              />
              {/* Finger number */}
              {pos.finger && pos.finger > 0 && (
                <text
                  x={x}
                  y={y + (compact ? 4.5 : 5.5)}
                  fontSize={compact ? 13 : 15}
                  fill="#000000"
                  textAnchor="middle"
                  fontWeight="bold"
                >
                  {pos.finger}
                </text>
              )}
              {/* Fret number label below the note */}
              <text
                x={x}
                y={y + radius + (compact ? 16 : 18)}
                fontSize={compact ? 12 : 13}
                fill={theme.textSecondary}
                textAnchor="middle"
                fontWeight="700"
                opacity={0.85}
              >
                {pos.fret}
              </text>
            </g>
          );
        })}

        {/* String labels at bottom (optional, only if not compact) */}
        {!compact && displayPositions.map((pos, idx) => {
          const x = leftMargin + idx * stringSpacing;
          const y = 20 + displayFrets * fretHeight + 18;
          return (
            <text
              key={`label-${idx}`}
              x={x}
              y={y}
              fontSize={11}
              fill={theme.textSecondary}
              textAnchor="middle"
              fontWeight="600"
            >
              {pos.note || ''}
            </text>
          );
        })}
      </svg>

      {/* Difficulty indicator */}
      {!compact && (
        <div className="flex items-center gap-1 mt-2">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: idx < voicing.difficulty ? theme.accentPrimary : theme.border,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default ChordDiagram;

