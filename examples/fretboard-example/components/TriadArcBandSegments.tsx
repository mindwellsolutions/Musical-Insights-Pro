'use client';

import { TriadMembershipEntry } from './musicTheory';

interface Props {
  membership: TriadMembershipEntry[];
  circleDiameter: number;
}

const MAX_VISIBLE = 4;

/**
 * Colored band segments at the bottom of a note circle, one per diatonic triad
 * that contains this note. Must be inside a position:relative overflow:hidden parent.
 */
export function TriadArcBandSegments({ membership, circleDiameter }: Props) {
  if (!membership || membership.length === 0) return null;

  const bandHeight = Math.round(circleDiameter * 0.28);
  const N = membership.length;
  const hasOverflow = circleDiameter / N < 4 && N > MAX_VISIBLE;
  const visible = hasOverflow ? membership.slice(0, MAX_VISIBLE) : membership;
  const count = visible.length;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: `${bandHeight}px`,
        display: 'flex',
        pointerEvents: 'none',
        borderTop: '1px solid rgba(0,0,0,0.45)',
      }}
      role="img"
      aria-label={`Triads: ${membership.map(m => m.degree).join(', ')}`}
      title={membership.map(m => m.degree).join(' · ')}
    >
      {visible.map((entry, i) => (
        <div
          key={entry.degree}
          style={{
            flex: 1,
            backgroundColor: entry.color,
            borderRight: i < count - 1
              ? '1px solid rgba(0,0,0,0.85)'
              : hasOverflow && i === count - 1
              ? '2px dotted rgba(255,255,255,0.5)'
              : 'none',
          }}
          title={`${entry.degree} triad`}
        />
      ))}
    </div>
  );
}
