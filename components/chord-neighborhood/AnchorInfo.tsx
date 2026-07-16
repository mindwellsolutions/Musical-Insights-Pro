'use client';

/**
 * Anchor Info Component
 * Displays information about the selected anchor voicing
 */

import React from 'react';
import { ThemeConfig } from '@/lib/themes';
import { AnchorVoicing } from '@/lib/music-theory/neighborhood';
import { Anchor } from 'lucide-react';

interface AnchorInfoProps {
  theme: ThemeConfig;
  anchorVoicing: AnchorVoicing;
  anchorSymbol: string;
}

export default function AnchorInfo({
  theme,
  anchorVoicing,
  anchorSymbol,
}: AnchorInfoProps) {
  // Convert string set to guitar string notation (1 = high E, 6 = low E)
  const stringSetDisplay = anchorVoicing.stringSet
    .map(idx => 6 - idx)
    .sort((a, b) => a - b)
    .join('-');

  // Format inversion display
  const inversionDisplay = anchorVoicing.inversion === 'root'
    ? 'Root'
    : anchorVoicing.inversion === 'first'
    ? '1st'
    : anchorVoicing.inversion === 'second'
    ? '2nd'
    : anchorVoicing.inversion;

  return (
    <div
      className="p-3 rounded-lg"
      style={{
        background: `linear-gradient(135deg, ${theme.accentPrimary}20, ${theme.accentPrimary}10)`,
        border: `1px solid ${theme.accentPrimary}`,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Anchor className="w-4 h-4" style={{ color: theme.accentPrimary }} />
        <span className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
          Anchor Voicing
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: theme.textSecondary }}>Chord:</span>
          <span className="font-bold" style={{ color: theme.textPrimary }}>{anchorSymbol}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: theme.textSecondary }}>Strings:</span>
          <span className="font-bold" style={{ color: theme.textPrimary }}>{stringSetDisplay}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: theme.textSecondary }}>Inversion:</span>
          <span className="font-bold" style={{ color: theme.textPrimary }}>{inversionDisplay}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: theme.textSecondary }}>Fret:</span>
          <span className="font-bold" style={{ color: theme.textPrimary }}>{anchorVoicing.fretPosition}</span>
        </div>
      </div>
    </div>
  );
}

