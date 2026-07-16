'use client';

import { TriadMembershipEntry } from '@/lib/music-theory/triad-membership/types';

interface TriadArcBandSegmentsProps {
  /** Sorted by degreeIndex ASC — produced by computeTriadMembership */
  membership: TriadMembershipEntry[];
  /** Circle diameter in px (32 default, 36 for focus root) */
  circleDiameter: number;
}

const MAX_VISIBLE_SEGMENTS = 4;

/**
 * Renders the bottom arc band inside a note circle.
 * Must be placed inside a `position: relative; overflow: hidden` parent.
 *
 * Each segment = one diatonic triad that contains this note.
 * Dividers: 1px solid rgba(0,0,0,0.85) between segments for clear visual separation.
 */
export function TriadArcBandSegments({ membership, circleDiameter }: TriadArcBandSegmentsProps) {
  if (!membership || membership.length === 0) return null;

  const bandHeight = Math.round(circleDiameter * 0.28); // 28% rule
  const N = membership.length;
  const minSegmentWidth = circleDiameter / N;
  const hasOverflow = minSegmentWidth < 4 && N > MAX_VISIBLE_SEGMENTS;
  const visible = hasOverflow ? membership.slice(0, MAX_VISIBLE_SEGMENTS) : membership;
  const visibleCount = visible.length;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${bandHeight}px`,
        display: 'flex',
        pointerEvents: 'none',
        // Subtle separator line between note fill and triad band
        borderTop: '1px solid rgba(0,0,0,0.45)',
      }}
      role="img"
      aria-label={`Triad membership: ${membership.map(m => m.degree).join(', ')}`}
      title={membership.map(m => m.degree).join(' · ')}
    >
      {visible.map((entry, i) => (
        <div
          key={entry.degree}
          style={{
            flex: 1,
            backgroundColor: entry.color,
            borderRight:
              i < visibleCount - 1
                ? '1px solid rgba(0,0,0,0.85)'
                : hasOverflow && i === visibleCount - 1
                ? '2px dotted rgba(255,255,255,0.5)'
                : 'none',
          }}
          title={`${entry.degree} triad`}
        />
      ))}
    </div>
  );
}
