'use client';

import { TargetNoteSet } from '@/lib/target-notes/types';
import { ThemeConfig } from '@/lib/themes';
import { NOTE_COLORS } from '@/lib/musicTheory';

interface TargetNoteCardProps {
  noteSet: TargetNoteSet;
  isActive: boolean;
  onLoad: () => void;
  theme: ThemeConfig;
}

export default function TargetNoteCard({ noteSet, isActive, onLoad, theme }: TargetNoteCardProps) {
  return (
    <div
      style={{
        minWidth: 220,
        maxWidth: 260,
        borderRadius: 12,
        background: theme.bgPrimary,
        border: isActive
          ? `2px solid ${noteSet.color}`
          : `1px solid ${theme.border}`,
        boxShadow: isActive ? `0 0 16px ${noteSet.color}55` : 'none',
        flexShrink: 0,
        overflow: 'hidden',
        transition: 'all 150ms ease-out',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Colored top accent bar */}
      <div style={{ height: 3, background: noteSet.color, flexShrink: 0 }} />

      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        {/* Header: label + load button */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary, lineHeight: 1.3 }}>
            {noteSet.label}
          </span>
          <button
            onClick={onLoad}
            style={{
              flexShrink: 0,
              padding: '4px 10px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              background: isActive ? noteSet.color : `${noteSet.color}22`,
              color: isActive ? '#fff' : noteSet.color,
              border: `1px solid ${noteSet.color}60`,
              transition: 'all 150ms ease-out',
              whiteSpace: 'nowrap',
            }}
          >
            {isActive ? '✓ Active' : 'Load ▶'}
          </button>
        </div>

        {/* Note pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {noteSet.notes.map((note) => {
            const noteColor = (NOTE_COLORS as Record<string, string>)[note] || noteSet.color;
            return (
              <span
                key={note}
                style={{
                  borderRadius: 999,
                  padding: '2px 8px',
                  fontSize: 11,
                  fontWeight: 700,
                  background: `${noteColor}30`,
                  color: noteColor,
                  border: `1px solid ${noteColor}50`,
                }}
              >
                {note}
              </span>
            );
          })}
        </div>

        {/* Rationale */}
        <p style={{ fontSize: 11, color: theme.textSecondary, lineHeight: 1.5, margin: 0 }}>
          {noteSet.rationale}
        </p>

        {/* Theory basis */}
        <p style={{ fontSize: 10, color: noteSet.color, fontWeight: 600, margin: 0, opacity: 0.85 }}>
          {noteSet.theoryBasis}
        </p>

        {/* Mood tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {noteSet.moodKeywords.map((kw) => (
            <span
              key={kw}
              style={{
                fontSize: 10,
                color: theme.textSecondary,
                opacity: 0.7,
              }}
            >
              #{kw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
