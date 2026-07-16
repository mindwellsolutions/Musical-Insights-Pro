'use client';

import { NOTES, SCALE_INTERVALS, NOTE_COLORS, normalizeNoteFromDisplay } from '@/lib/musicTheory';
import { ThemeConfig } from '@/lib/themes';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface ControlPanelProps {
  rootNote: string;
  scaleName: string;
  stringCount: 6 | 7;
  tuningName: string;
  onRootNoteChange: (note: string) => void;
  onScaleChange: (scale: string) => void;
  onStringCountChange: (count: 6 | 7) => void;
  onTuningChange: (tuning: string) => void;
  theme: ThemeConfig;
}

export default function ControlPanel({
  rootNote,
  scaleName,
  stringCount,
  tuningName,
  onRootNoteChange,
  onScaleChange,
  onStringCountChange,
  onTuningChange,
  theme,
}: ControlPanelProps) {
  const scaleNames = Object.keys(SCALE_INTERVALS);
  const { getNotesDisplay } = useNoteDisplay();

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>
            Root Note
          </label>
          <div className="grid grid-cols-12 gap-2 max-w-4xl">
            {getNotesDisplay().map((displayNote) => {
              const internalNote = normalizeNoteFromDisplay(displayNote);
              return (
                <button
                  key={displayNote}
                  onClick={() => onRootNoteChange(internalNote)}
                  className="px-3 py-1.5 rounded-lg font-semibold text-sm transition-all transform hover:scale-110 active:scale-95"
                  style={{
                    backgroundColor: NOTE_COLORS[displayNote],
                    color: '#ffffff',
                    boxShadow: rootNote === internalNote
                      ? '0 0 0 3px rgba(59, 130, 246, 0.5), 0 2px 4px rgba(0,0,0,0.2)'
                      : '0 2px 4px rgba(0,0,0,0.2)',
                    border: 'none',
                  }}
                  title={displayNote}
                >
                  {displayNote}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3" style={{ color: theme.textPrimary }}>
            Scale Type
          </label>
          <div className="flex flex-wrap gap-2">
            {scaleNames.map((scale) => (
              <button
                key={scale}
                onClick={() => onScaleChange(scale)}
                className="py-2 px-4 rounded-lg text-sm font-medium transition-all hover:shadow-md"
                style={{
                  background: scaleName === scale ? theme.buttonPrimary : theme.bgTertiary,
                  color: scaleName === scale ? '#ffffff' : theme.textPrimary,
                  border: `1px solid ${scaleName === scale ? theme.buttonPrimary : theme.border}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {scale}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
