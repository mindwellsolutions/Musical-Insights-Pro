'use client';

import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { ThemeConfig } from '@/lib/themes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface TriadFocusSelectorProps {
  available: DiatonicTriad[];
  selectedDegree: string;
  onSelect: (degree: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  theme: ThemeConfig;
  /** Set of degree strings included in MIDI cycle. Defaults to all if undefined. */
  enabledDegrees?: Set<string>;
  onToggleDegree?: (degree: string) => void;
}

/**
 * Horizontal degree-chip strip for Triad Focus Mode.
 * Renders ◀ chips ▶ with color swatches, degree labels, and root note names.
 * Each chip has a checkbox that controls whether it is included in MIDI left/right cycling.
 */
export function TriadFocusSelector({
  available,
  selectedDegree,
  onSelect,
  onPrevious,
  onNext,
  theme,
  enabledDegrees,
  onToggleDegree,
}: TriadFocusSelectorProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  if (!available || available.length === 0) return null;

  // If no enabledDegrees provided, treat all as enabled
  const getEnabled = (degree: string) =>
    !enabledDegrees || enabledDegrees.has(degree);

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

      {/* Chip strip — each chip has a checkbox on the left */}
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
          const isEnabled = getEnabled(triad.degree);
          return (
            <div
              key={triad.degree}
              style={{ display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}
            >
              {/* Checkbox — toggles MIDI cycle inclusion */}
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => onToggleDegree?.(triad.degree)}
                onClick={e => e.stopPropagation()}
                title={isEnabled ? `Remove ${triad.degree} from MIDI cycle` : `Add ${triad.degree} to MIDI cycle`}
                style={{
                  width: 13,
                  height: 13,
                  accentColor: triad.color,
                  cursor: 'pointer',
                  flexShrink: 0,
                  opacity: isEnabled ? 1 : 0.45,
                }}
              />
              {/* Chip button */}
              <button
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
                    ? `${triad.color}33`
                    : theme.bgTertiary,
                  color: theme.textPrimary,
                  cursor: 'pointer',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: 12,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 120ms ease-out',
                  opacity: isEnabled ? 1 : 0.4,
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
            </div>
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

    </div>
  );
}
