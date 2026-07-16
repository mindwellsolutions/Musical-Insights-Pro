/**
 * Mode Selector Component
 * Toggle between CAGED and Scale modes
 */

'use client';

import { ThemeConfig } from '@/lib/themes';

interface ModeSelectorProps {
  theme: ThemeConfig;
  mode: 'caged' | 'scale';
  onModeChange: (mode: 'caged' | 'scale') => void;
}

export default function ModeSelector({
  theme,
  mode,
  onModeChange,
}: ModeSelectorProps) {
  return (
    <div className="mb-4">
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: theme.textSecondary }}
      >
        Find Chords In
      </label>

      <div className="flex gap-2">
        <button
          onClick={() => onModeChange('caged')}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            background: mode === 'caged' ? theme.buttonPrimary : theme.bgTertiary,
            color: mode === 'caged' ? '#ffffff' : theme.textPrimary,
            border: `1px solid ${mode === 'caged' ? theme.buttonPrimary : theme.border}`,
          }}
        >
          CAGED Areas
        </button>
        <button
          onClick={() => onModeChange('scale')}
          className="px-4 py-2 rounded-md text-sm font-medium transition-colors"
          style={{
            background: mode === 'scale' ? theme.buttonPrimary : theme.bgTertiary,
            color: mode === 'scale' ? '#ffffff' : theme.textPrimary,
            border: `1px solid ${mode === 'scale' ? theme.buttonPrimary : theme.border}`,
          }}
        >
          Scale Notes
        </button>
      </div>
    </div>
  );
}

