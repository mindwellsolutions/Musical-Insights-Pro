'use client';

import { useState } from 'react';
import { NOTES, getChordTones, getGuideTones, NOTE_COLORS } from '@/lib/musicTheory';
import { ThemeConfig } from '@/lib/themes';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface ChordLibraryProps {
  theme: ThemeConfig;
  selectedChordNotes: string[] | null;
  selectedGuideTones: string[] | null;
  onChordSelect: (notes: string[] | null, guideTones: string[] | null) => void;
}

const CHORD_TYPES = [
  { name: 'Major', quality: 'maj', suffix: '' },
  { name: 'Minor', quality: 'min', suffix: 'm' },
  { name: 'Diminished', quality: 'dim', suffix: '°' },
  { name: 'Augmented', quality: 'aug', suffix: '+' },
  { name: 'Major 7th', quality: 'maj7', suffix: 'maj7' },
  { name: 'Minor 7th', quality: 'min7', suffix: 'm7' },
  { name: 'Dominant 7th', quality: 'dom7', suffix: '7' },
  { name: 'Diminished 7th', quality: 'dim7', suffix: '°7' },
  { name: 'Half-Diminished 7th', quality: 'min7b5', suffix: 'm7♭5' },
  { name: 'Major 9th', quality: 'maj9', suffix: 'maj9' },
  { name: 'Minor 9th', quality: 'min9', suffix: 'm9' },
  { name: 'Dominant 9th', quality: 'dom9', suffix: '9' },
  { name: 'Major 11th', quality: 'maj11', suffix: 'maj11' },
  { name: 'Minor 11th', quality: 'min11', suffix: 'm11' },
  { name: 'Dominant 11th', quality: 'dom11', suffix: '11' },
  { name: 'Major 13th', quality: 'maj13', suffix: 'maj13' },
  { name: 'Minor 13th', quality: 'min13', suffix: 'm13' },
  { name: 'Dominant 13th', quality: 'dom13', suffix: '13' },
  { name: 'Suspended 2nd', quality: 'sus2', suffix: 'sus2' },
  { name: 'Suspended 4th', quality: 'sus4', suffix: 'sus4' },
  { name: 'Major 6th', quality: '6', suffix: '6' },
  { name: 'Minor 6th', quality: 'min6', suffix: 'm6' },
  { name: 'Add 9', quality: 'add9', suffix: 'add9' },
  { name: 'Minor Add 9', quality: 'minadd9', suffix: 'madd9' },
];

interface ChordItem {
  name: string;
  notes: string[];
  guideTones: string[];
  quality: string;
}

export default function ChordLibrary({ theme, selectedChordNotes, selectedGuideTones, onChordSelect }: ChordLibraryProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [showAllChords, setShowAllChords] = useState(false);

  const allChords: ChordItem[] = NOTES.flatMap(note =>
    CHORD_TYPES.map(type => ({
      name: `${note}${type.suffix}`,
      notes: getChordTones(note, type.quality),
      guideTones: getGuideTones(note, type.quality),
      quality: type.quality,
    }))
  );

  const isChordSelected = (chordNotes: string[], guideTones: string[]) => {
    if (!selectedChordNotes) return false;
    const allNotesMatch = chordNotes.length === selectedChordNotes.length &&
                          chordNotes.every(n => selectedChordNotes.includes(n));
    if (!selectedGuideTones) return allNotesMatch;
    const guideTonesMatch = guideTones.length === selectedGuideTones.length &&
                            guideTones.every(g => selectedGuideTones.includes(g));
    return allNotesMatch && guideTonesMatch;
  };

  const handleChordClick = (chord: ChordItem) => {
    if (isChordSelected(chord.notes, chord.guideTones)) {
      onChordSelect(null, null);
    } else {
      onChordSelect(chord.notes, chord.guideTones);
    }
  };

  const filteredChords = selectedNote
    ? allChords.filter(chord => chord.name.startsWith(selectedNote))
    : allChords;

  // Calculate how many chords to show (3 rows based on grid layout)
  // Assuming 4 columns on xl screens, 3 on lg, 2 on md, 1 on sm
  const chordsPerRow = 4; // Using xl layout as default
  const initialRowsToShow = 3;
  const initialChordsToShow = chordsPerRow * initialRowsToShow;
  const displayedChords = showAllChords ? filteredChords : filteredChords.slice(0, initialChordsToShow);
  const hasMoreChords = filteredChords.length > initialChordsToShow;

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              Chord Library
            </h3>
            <p className="text-sm mt-1" style={{ color: theme.textSecondary }}>
              Browse all chords • Click to highlight on fretboard
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
            aria-label={isExpanded ? "Collapse chord library" : "Expand chord library"}
          >
            {isExpanded ? <ChevronDown size={24} /> : <ChevronUp size={24} />}
          </button>
        </div>

        {isExpanded && (
          <div className="flex gap-6">
            <div
              className="w-48 rounded-lg p-4 flex-shrink-0"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
                maxHeight: '600px',
                overflowY: 'auto',
              }}
            >
              <div className="text-sm font-semibold mb-3 uppercase tracking-wide" style={{ color: theme.textSecondary }}>
                Root Note
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedNote(null)}
                  className="w-full text-left px-3 py-2 rounded-lg transition-all"
                  style={{
                    background: selectedNote === null ? theme.buttonPrimary : 'transparent',
                    color: selectedNote === null ? '#ffffff' : theme.textPrimary,
                  }}
                >
                  All Notes
                </button>
                {NOTES.map(note => (
                  <button
                    key={note}
                    onClick={() => setSelectedNote(note)}
                    className="w-full text-left px-3 py-2 rounded-lg transition-all"
                    style={{
                      background: selectedNote === note ? theme.buttonPrimary : 'transparent',
                      color: selectedNote === note ? '#ffffff' : theme.textPrimary,
                    }}
                  >
                    {note}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {displayedChords.map((chord, index) => {
                  const isSelected = isChordSelected(chord.notes, chord.guideTones);
                  return (
                    <div
                      key={index}
                      onClick={() => handleChordClick(chord)}
                      className="rounded-lg p-4 transition-all hover:scale-[1.02] cursor-pointer"
                      style={{
                        background: isSelected ? theme.buttonPrimary : theme.bgTertiary,
                        border: isSelected ? `2px solid ${theme.buttonPrimary}` : `1px solid ${theme.border}`,
                        boxShadow: isSelected ? '0 0 15px rgba(34, 197, 94, 0.3)' : 'none',
                      }}
                    >
                      <div className="text-lg font-bold mb-3" style={{ color: isSelected ? '#ffffff' : theme.textPrimary }}>
                        {chord.name}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }}>
                            Chord Tones
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            {chord.notes.map((note, noteIndex) => (
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

                        {chord.guideTones.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold mb-2 uppercase tracking-wide" style={{ color: isSelected ? 'rgba(255,255,255,0.8)' : theme.textSecondary }}>
                              Guide Tones (3rd{chord.guideTones.length > 1 ? ' & 7th' : ''})
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {chord.guideTones.map((note, noteIndex) => (
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
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Show More / Show Less Button */}
              {hasMoreChords && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllChords(!showAllChords)}
                    className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all hover:scale-105"
                    style={{
                      background: theme.buttonPrimary,
                      color: '#ffffff',
                      border: 'none',
                    }}
                  >
                    {showAllChords ? (
                      <>
                        <ChevronUp size={20} />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown size={20} />
                        Show More ({filteredChords.length - initialChordsToShow} more chords)
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
