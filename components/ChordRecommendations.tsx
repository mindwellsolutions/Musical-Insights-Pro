'use client';

import { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { ChevronDown, ChevronUp, Music2, Star } from 'lucide-react';
import { RecommendedChord } from '@/lib/chord-recommendations/types';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { calculateChordVoicings } from '@/lib/chord-voicings';
import ChordDiagram from './ChordDiagram';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface ChordRecommendationsProps {
  theme: ThemeConfig;
  currentKey: string; // e.g., "C", "D", "F#"
  currentScale: string; // e.g., "Ionian", "Dorian"
  selectedChordNotes: string[] | null;
  onChordSelect: (notes: string[] | null) => void;
  tuning: string[];
  stringCount: 6 | 7;
  hideContainer?: boolean; // Hide outer container when in tabbed view
}

const ChordRecommendations = memo(function ChordRecommendations({
  theme,
  currentKey,
  currentScale,
  selectedChordNotes,
  onChordSelect,
  tuning,
  stringCount,
  hideContainer = false,
}: ChordRecommendationsProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [isExpanded, setIsExpanded] = useState(true);
  const [diatonicChords, setDiatonicChords] = useState<RecommendedChord[]>([]);
  const [extendedChords, setExtendedChords] = useState<RecommendedChord[]>([]);
  const [modalInterchangeChords, setModalInterchangeChords] = useState<RecommendedChord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'diatonic' | 'extended' | 'modal'>('diatonic');

  useEffect(() => {
    if (!currentKey || !currentScale) {
      return;
    }

    const fetchChordRecommendations = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/chord-recommendations?key=${encodeURIComponent(currentKey)}&scale=${encodeURIComponent(currentScale)}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch chord recommendations');
        }

        const data = await response.json();
        setDiatonicChords(data.diatonicChords || []);
        setExtendedChords(data.extendedChords || []);
        setModalInterchangeChords(data.modalInterchangeChords || []);
      } catch (err) {
        console.error('Error fetching chord recommendations:', err);
        setError('Failed to load chord recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchChordRecommendations();
  }, [currentKey, currentScale]);

  const isChordSelected = useCallback((chordNotes: string[]) => {
    if (!selectedChordNotes) return false;
    return (
      chordNotes.length === selectedChordNotes.length &&
      chordNotes.every(note => selectedChordNotes.includes(note))
    );
  }, [selectedChordNotes]);

  const handleChordClick = useCallback((chord: RecommendedChord) => {
    if (isChordSelected(chord.notes)) {
      onChordSelect(null);
    } else {
      onChordSelect(chord.notes);
    }
  }, [isChordSelected, onChordSelect]);

  // Calculate voicings for all chords at component level to avoid hook issues
  const chordVoicingsMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateChordVoicings>>();

    const allChords = [...diatonicChords, ...extendedChords, ...modalInterchangeChords];
    allChords.forEach(chord => {
      const key = chord.symbol;
      if (!map.has(key)) {
        map.set(key, calculateChordVoicings(chord.notes, chord.notes[0], tuning, 15));
      }
    });

    return map;
  }, [diatonicChords, extendedChords, modalInterchangeChords, tuning]);

  const renderChordCard = (chord: RecommendedChord) => {
    // Get pre-calculated voicings from the map
    const voicings = chordVoicingsMap.get(chord.symbol) || [];

    return (
      <div
        key={chord.symbol}
        className="rounded-lg p-4 transition-all hover:scale-[1.01]"
        style={{
          background: theme.bgTertiary,
          border: `1px solid ${theme.border}`,
        }}
      >
        {/* Chord Symbol & Score */}
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
              {chord.symbol}
            </h3>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              {chord.degree}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Star
              size={14}
              style={{
                color: theme.accentPrimary,
                fill: theme.accentPrimary,
              }}
            />
            <span className="text-sm font-bold" style={{ color: theme.accentPrimary }}>
              {chord.compatibilityScore}
            </span>
          </div>
        </div>

        {/* Function */}
        <p className="text-sm mb-3" style={{ color: theme.textSecondary }}>
          {chord.function}
        </p>

        {/* Notes */}
        <div className="flex flex-wrap gap-2 mb-3">
          {chord.notes.map((note, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded text-xs font-bold"
              style={{
                background: NOTE_COLORS[note] || theme.border,
                color: '#000000',
              }}
            >
              {getNoteDisplayName(note)}
            </span>
          ))}
        </div>

        {/* Chord Diagrams */}
        {voicings.length > 0 && (
          <div
            className="mb-3 pt-3 px-2 -mx-2 rounded-lg"
            style={{
              borderTop: `1px solid ${theme.border}`,
              background: 'rgba(0,0,0,0.1)',
            }}
          >
            <div className="text-xs font-semibold mb-3 px-1" style={{ color: theme.textSecondary }}>
              Chord Positions
            </div>
            <div
              className="flex gap-4 overflow-x-auto pb-2 px-1"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: `${theme.border} transparent`,
              }}
            >
              {voicings.slice(0, 3).map((voicing, idx) => (
                <div key={idx} className="flex-shrink-0">
                  <ChordDiagram
                    voicing={voicing}
                    theme={theme}
                    stringCount={stringCount}
                    compact={true}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Use */}
        <p className="text-xs" style={{ color: theme.textSecondary }}>
          {chord.commonUse}
        </p>
      </div>
    );
  };



  const content = (
    <>
      {!hideContainer && (
        <div
          className="flex items-center justify-between cursor-pointer mb-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-3">
            <Music2 size={24} style={{ color: theme.accentPrimary }} />
            <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
              Recommended Chords - {currentKey} {currentScale}
            </h2>
          </div>
          {isExpanded ? (
            <ChevronUp size={24} style={{ color: theme.textSecondary }} />
          ) : (
            <ChevronDown size={24} style={{ color: theme.textSecondary }} />
          )}
        </div>
      )}

      {(hideContainer || isExpanded) && (
        <>
          {/* Tabs */}
          <div className="flex gap-2 mb-4">
            {[
              { id: 'diatonic', label: 'Diatonic', count: diatonicChords.length },
              { id: 'extended', label: 'Extended', count: extendedChords.length },
              { id: 'modal', label: 'Modal Interchange', count: modalInterchangeChords.length },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab(tab.id as any);
                }}
                className="px-4 py-2 rounded-lg transition-all"
                style={{
                  background: activeTab === tab.id ? theme.buttonPrimary : theme.bgTertiary,
                  color: activeTab === tab.id ? '#ffffff' : theme.textPrimary,
                  border: `1px solid ${activeTab === tab.id ? theme.buttonPrimary : theme.border}`,
                }}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, idx) => (
                <div
                  key={idx}
                  className="rounded-lg p-4 animate-pulse"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="h-6 rounded mb-2" style={{ background: theme.border, width: '60%' }} />
                  <div className="h-4 rounded mb-3" style={{ background: theme.border, width: '80%' }} />
                  <div className="flex gap-2 mb-2">
                    <div className="h-6 w-12 rounded" style={{ background: theme.border }} />
                    <div className="h-6 w-12 rounded" style={{ background: theme.border }} />
                    <div className="h-6 w-12 rounded" style={{ background: theme.border }} />
                  </div>
                  <div className="h-3 rounded" style={{ background: theme.border, width: '90%' }} />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8" style={{ color: theme.accentSecondary }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                style={{ display: activeTab === 'diatonic' ? 'grid' : 'none' }}
              >
                {diatonicChords.map(chord => renderChordCard(chord))}
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                style={{ display: activeTab === 'extended' ? 'grid' : 'none' }}
              >
                {extendedChords.map(chord => renderChordCard(chord))}
              </div>
              <div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                style={{ display: activeTab === 'modal' ? 'grid' : 'none' }}
              >
                {modalInterchangeChords.map(chord => renderChordCard(chord))}
              </div>
            </>
          )}
        </>
      )}
    </>
  );

  if (hideContainer) {
    return content;
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        background: theme.bgSecondary,
        border: `2px solid ${theme.border}`,
      }}
    >
      {content}
    </div>
  );
});

export default ChordRecommendations;

