/**
 * Overlapping Chords Toggle Component
 * Toggle switch to enable/disable the overlapping chords feature
 */

'use client';

import { ThemeConfig } from '@/lib/themes';

interface OverlappingChordsToggleProps {
  theme: ThemeConfig;
  enabled: boolean;
  onToggle: (fretboardState?: any) => void;
}

export default function OverlappingChordsToggle({
  theme,
  enabled,
  onToggle,
}: OverlappingChordsToggleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3
        className="text-lg font-semibold"
        style={{ color: theme.textPrimary }}
      >
        Overlapping Chords
      </h3>

      {/* Toggle Switch */}
      <button
        onClick={() => onToggle()}
        className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm"
        style={{
          backgroundColor: enabled ? theme.accentPrimary : '#4b5563',
          border: `2px solid ${enabled ? theme.accentPrimary : '#6b7280'}`,
        }}
        aria-label="Toggle Overlapping Chords"
      >
        <span
          className="inline-block h-5 w-5 transform rounded-full transition-transform duration-200 ease-in-out shadow-md"
          style={{
            backgroundColor: '#ffffff',
            transform: enabled ? 'translateX(20px)' : 'translateX(2px)',
          }}
        />
      </button>
    </div>
  );
}

