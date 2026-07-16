'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { DegreePaletteChip } from './DegreePaletteChip';

interface DegreePickerPopoverProps {
  theme: ThemeConfig;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLDivElement | null>;
  diatonicDegrees: DiatonicTriad[];
  currentDegreeIndex: number;
  onSelect: (degree: DiatonicTriad) => void;
  onClose: () => void;
}

export function DegreePickerPopover({
  theme,
  isOpen,
  anchorRef,
  diatonicDegrees,
  currentDegreeIndex,
  onSelect,
  onClose,
}: DegreePickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      left: rect.left,
    });
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        opacity: isOpen ? 1 : 0,
        transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
        transition: 'opacity 120ms ease-out, transform 120ms ease-out',
      }}
    >
      <span style={{
        fontSize: 10, color: theme.textSecondary,
        textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600,
      }}>
        Choose a degree
      </span>
      <div style={{ display: 'flex', flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        {diatonicDegrees.map(deg => (
          <div key={deg.degreeIndex} style={{ position: 'relative' }}>
            <DegreePaletteChip
              theme={theme}
              degree={deg}
              onClick={(d) => { onSelect(d); }}
              isSelected={deg.degreeIndex === currentDegreeIndex}
            />
            {deg.degreeIndex === currentDegreeIndex && (
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 10,
                border: '2px solid white', pointerEvents: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'white', fontSize: 14, fontWeight: 700 }}>✓</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
