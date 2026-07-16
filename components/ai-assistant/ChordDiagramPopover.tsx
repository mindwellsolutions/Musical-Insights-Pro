'use client';

import { useEffect, useMemo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { X } from 'lucide-react';
import ChordDiagram from '@/components/ChordDiagram';
import { calculateChordVoicings } from '@/lib/chord-voicings';
import { parseChordName, calculateChordTones } from '@/lib/ai-assistant/chord-enrichment';

interface ChordDiagramPopoverProps {
  chordName: string;
  theme: ThemeConfig;
  tuning: string[];
  stringCount: number;
  onClose: () => void;
}

export default function ChordDiagramPopover({
  chordName,
  theme,
  tuning,
  stringCount,
  onClose,
}: ChordDiagramPopoverProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Parse chord and calculate voicings
  const chordData = useMemo(() => {
    const parsed = parseChordName(chordName);
    if (!parsed) {
      return null;
    }

    const { root, quality } = parsed;
    const notes = calculateChordTones(root, quality);
    const voicings = calculateChordVoicings(notes, root, tuning, 12);

    return { root, quality, notes, voicings };
  }, [chordName, tuning]);

  if (!chordData || chordData.voicings.length === 0) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        onClick={onClose}
      >
        <div
          className="rounded-lg p-6 max-w-md"
          style={{
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: theme.textPrimary }}>
              {chordName}
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-opacity-10 hover:bg-white transition-colors"
            >
              <X className="w-5 h-5" style={{ color: theme.textPrimary }} />
            </button>
          </div>
          <p className="text-sm" style={{ color: theme.textSecondary }}>
            No voicings available for this chord.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
              {chordName}
            </h3>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              {chordData.notes.join(' - ')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-10 hover:bg-white transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" style={{ color: theme.textPrimary }} />
          </button>
        </div>

        {/* Chord Diagrams */}
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: theme.textSecondary }}>
            Voicings ({chordData.voicings.length} available)
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {chordData.voicings.slice(0, 6).map((voicing, idx) => (
              <div
                key={idx}
                className="rounded-lg p-3"
                style={{
                  background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <ChordDiagram
                  voicing={voicing}
                  theme={theme}
                  stringCount={stringCount}
                  compact={false}
                />
                {voicing.commonName && (
                  <p className="text-xs text-center mt-2" style={{ color: theme.textSecondary }}>
                    {voicing.commonName}
                  </p>
                )}
              </div>
            ))}
          </div>
          {chordData.voicings.length > 6 && (
            <p className="text-xs text-center" style={{ color: theme.textSecondary }}>
              Showing 6 of {chordData.voicings.length} voicings
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

