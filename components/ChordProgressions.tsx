'use client';

import { useState } from 'react';
import { getChordProgressions, ChordInfo, NOTE_COLORS } from '@/lib/musicTheory';
import { ThemeConfig } from '@/lib/themes';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface ChordProgressionsProps {
  rootNote: string;
  scaleName: string;
  theme: ThemeConfig;
  selectedChordNotes: string[] | null;
  onChordSelect: (notes: string[] | null) => void;
}

export default function ChordProgressions({ rootNote, scaleName, theme, selectedChordNotes, onChordSelect }: ChordProgressionsProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [isExpanded, setIsExpanded] = useState(true);
  const chords = getChordProgressions(rootNote, scaleName);

  if (chords.length === 0) return null;

  const isChordSelected = (chordNotes: string[]) => {
    if (!selectedChordNotes) return false;
    return chordNotes.length === selectedChordNotes.length &&
           chordNotes.every(note => selectedChordNotes.includes(note));
  };

  const handleChordClick = (chordInfo: ChordInfo) => {
    if (isChordSelected(chordInfo.notes)) {
      onChordSelect(null);
    } else {
      onChordSelect(chordInfo.notes);
    }
  };

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              Chord Progressions
            </h3>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              Harmonized chords for {rootNote.replace('#', '♯')} {scaleName} scale • Click a chord to highlight on fretboard
            </p>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg transition-all hover:scale-110"
            style={{
              background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
              color: theme.textPrimary
            }}
            aria-label={isExpanded ? "Collapse chord progressions" : "Expand chord progressions"}
          >
            {isExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </button>
        </div>

        {isExpanded && (
          <>
            <div className="overflow-x-auto">
          <div className="min-w-full inline-block align-middle">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {chords.map((chordInfo, index) => {
                const isSelected = isChordSelected(chordInfo.notes);
                return (
                  <div
                    key={index}
                    onClick={() => handleChordClick(chordInfo)}
                    className="rounded-xl p-5 transition-all hover:scale-[1.02] hover:shadow-lg cursor-pointer"
                    style={{
                      background: isSelected ? theme.buttonPrimary : theme.bgTertiary,
                      border: isSelected ? `2px solid ${theme.buttonPrimary}` : `2px solid ${theme.border}`,
                      boxShadow: isSelected ? '0 0 20px rgba(34, 197, 94, 0.3)' : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="text-sm font-bold px-3 py-1 rounded-full"
                        style={{
                          background: isSelected ? 'rgba(255,255,255,0.2)' : theme.border,
                          color: isSelected ? '#ffffff' : theme.textPrimary,
                        }}
                      >
                        {chordInfo.degree}
                      </div>
                      <div className="text-xs font-medium uppercase tracking-wide" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }}>
                        {chordInfo.quality}
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="text-2xl font-bold mb-1" style={{ color: isSelected ? '#ffffff' : theme.textPrimary }}>
                        {chordInfo.chord}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }}>
                        Chord Tones
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {chordInfo.notes.map((note, noteIndex) => (
                          <div
                            key={noteIndex}
                            className="px-3 py-1.5 rounded-lg font-semibold text-sm transition-transform hover:scale-110"
                            style={{
                              backgroundColor: NOTE_COLORS[note],
                              color: '#ffffff',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            }}
                          >
                            {getNoteDisplayName(note)}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl" style={{ background: theme.bgTertiary, border: `1px solid ${theme.border}` }}>
            <div className="text-sm font-semibold mb-2" style={{ color: theme.textPrimary }}>
              Common Major Progressions
            </div>
            <div className="text-sm space-y-1" style={{ color: theme.textSecondary }}>
              <div>I - IV - V - I</div>
              <div>I - V - vi - IV</div>
              <div>ii - V - I</div>
            </div>
          </div>

          <div className="p-5 rounded-xl" style={{ background: theme.bgTertiary, border: `1px solid ${theme.border}` }}>
            <div className="text-sm font-semibold mb-2" style={{ color: theme.textPrimary }}>
              Common Minor Progressions
            </div>
            <div className="text-sm space-y-1" style={{ color: theme.textSecondary }}>
              <div>i - iv - v - i</div>
              <div>i - VI - III - VII</div>
              <div>i - iv - VII - III</div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}
