'use client';

/**
 * Common Tone Indicator
 * Visual indicator showing number of common tones between chords
 */

import React from 'react';
import { ThemeConfig } from '@/lib/themes';

interface CommonToneIndicatorProps {
  theme: ThemeConfig;
  commonTones: number;
  isSelected: boolean;
}

export default function CommonToneIndicator({
  theme,
  commonTones,
  isSelected,
}: CommonToneIndicatorProps) {
  return (
    <div className="flex items-center gap-1" title={`${commonTones} common tone${commonTones !== 1 ? 's' : ''}`}>
      {[1, 2, 3].map((index) => (
        <div
          key={index}
          className="w-2 h-2 rounded-full"
          style={{
            background: index <= commonTones
              ? isSelected
                ? '#ffffff'
                : theme.accentPrimary
              : isSelected
                ? 'rgba(255,255,255,0.3)'
                : theme.border,
          }}
        />
      ))}
    </div>
  );
}

