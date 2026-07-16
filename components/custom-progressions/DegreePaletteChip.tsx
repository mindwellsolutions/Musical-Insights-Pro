'use client';

import React, { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';

const QUALITY_ABBREV: Record<string, string> = {
  major: 'maj',
  minor: 'min',
  diminished: 'dim',
  augmented: 'aug',
};

interface DegreePaletteChipProps {
  theme: ThemeConfig;
  degree: DiatonicTriad;
  onClick: (degree: DiatonicTriad) => void;
  isSelected?: boolean;
}

export function DegreePaletteChip({ theme, degree, onClick, isSelected }: DegreePaletteChipProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const color = degree.color;

  const bg = isHovered ? `${color}33` : `${color}22`;
  const border = isHovered
    ? `1.5px solid ${color}`
    : isSelected
    ? `2px solid white`
    : `1.5px solid ${color}66`;
  const shadow = isHovered ? `0 4px 12px ${color}44` : 'none';
  const transform = isPressed
    ? 'translateY(0px) scale(0.96)'
    : isHovered
    ? 'translateY(-2px)'
    : 'translateY(0px)';

  return (
    <button
      onClick={() => onClick(degree)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false); }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      style={{
        width: 72,
        height: 52,
        borderRadius: 10,
        background: bg,
        border,
        boxShadow: shadow,
        transform,
        transition: 'all 120ms ease-out',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '6px 8px',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0,
        outline: isSelected ? '2px solid white' : 'none',
        outlineOffset: isSelected ? 2 : 0,
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 600, color: 'white', lineHeight: 1 }}>
        {degree.degree}
      </span>
      <span style={{
        fontSize: 17, fontWeight: 700, color: 'white', lineHeight: 1,
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
      }}>
        {degree.rootNote}
      </span>
      <span style={{
        fontSize: 9, color: 'rgba(255,255,255,0.55)', lineHeight: 1,
        alignSelf: 'center', marginTop: 'auto',
      }}>
        {QUALITY_ABBREV[degree.quality] || degree.quality}
      </span>
    </button>
  );
}
