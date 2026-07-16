'use client';

import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { ThemeConfig } from '@/lib/themes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';
import { MIDISectionToggle } from '@/components/midi/MIDISectionToggle';

interface TriadFocusSelectorProps {
  available: DiatonicTriad[];
  selectedDegree: string;
  onSelect: (degree: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  theme: ThemeConfig;
}

/**
 * Horizontal degree-chip strip for Triad Focus Mode.
 * Renders ◀ chips ▶ with color swatches, degree labels, and root note names.
 * Max width 780px; horizontally scrollable if needed.
 */
export function TriadFocusSelector({
  available,
  selectedDegree,
  onSelect,
  onPrevious,
  onNext,
  theme,
}: TriadFocusSelectorProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  if (!available || available.length === 0) return null;

  const arrowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    background: theme.bgTertiary,
    color: theme.textPrimary,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'background 120ms ease-out',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 8,
        padding: '6px 0',
        maxWidth: '100%',
      }}
    >
      {/* ◀ arrow */}
      <button
        onClick={onPrevious}
        style={arrowStyle}
        aria-label="Previous triad"
        title="Previous triad (←)"
      >
        <ChevronLeft size={16} />
      </button>

      {/* Chip strip — shrinks to content width so ▶ follows immediately after last chip */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          scrollbarWidth: 'none',
        }}
      >
        {available.map(triad => {
          const isSelected = triad.degree === selectedDegree;
          return (
            <button
              key={triad.degree}
              onClick={() => onSelect(triad.degree)}
              title={`${triad.degree} · ${triad.rootNote} (${triad.quality})`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                height: 32,
                minWidth: 64,
                padding: '0 10px',
                borderRadius: 8,
                border: `2px solid ${isSelected ? triad.color : theme.border}`,
                background: isSelected
                  ? `${triad.color}33`  // 20% opacity fill
                  : theme.bgTertiary,
                color: theme.textPrimary,
                cursor: 'pointer',
                fontWeight: isSelected ? 700 : 500,
                fontSize: 12,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 120ms ease-out',
              }}
            >
              {/* Color swatch */}
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  backgroundColor: triad.color,
                  flexShrink: 0,
                  border: '1px solid rgba(0,0,0,0.3)',
                }}
              />
              <span>{triad.degree}</span>
              <span style={{ opacity: 0.65 }}>·</span>
              <span style={{ opacity: 0.85 }}>{getNoteDisplayName(triad.rootNote)}</span>
            </button>
          );
        })}
      </div>

      {/* ▶ arrow */}
      <button
        onClick={onNext}
        style={arrowStyle}
        aria-label="Next triad"
        title="Next triad (→)"
      >
        <ChevronRight size={16} />
      </button>

      {/* MIDI Section Toggle */}
      <MIDISectionToggle
        sectionId="triads"
        label="Triads"
        onLeft={onPrevious}
        onRight={onNext}
        theme={theme}
      />
    </div>
  );
}
