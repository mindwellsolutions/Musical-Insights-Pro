'use client';

/**
 * Scale Fretboard Component
 * Second fretboard showing scale notes filtered by CAGED regions
 */

import { useMemo } from 'react';
import { ScaleModeInstance } from '@/lib/chord-progression/types';
import { ThemeConfig } from '@/lib/themes';
import { ShapeRegion } from '@/lib/caged';
import { NotePosition, NOTE_COLORS } from '@/lib/musicTheory';
import { FilteredScaleNote, filterScaleNotesByCAGEDRegions } from '@/lib/chord-progression/song-progression-utils';
import { getScaleRecommendationsForTriad } from '@/lib/triad-scale-mapping';
import { TriadType } from '@/lib/triad-theory';
import Fretboard from '@/components/Fretboard';

interface ScaleFretboardProps {
  selectedScale: ScaleModeInstance | null;
  filteredScaleNotes: FilteredScaleNote[];
  cagedRegions: ShapeRegion[]; // For display overlay
  scaleFilterRegions: ShapeRegion[]; // For filtering scale notes
  theme: ThemeConfig;
  tuning: string[];
  stringCount: 6 | 7;
  showCAGEDGuide: boolean;
  cagedBrightness?: number;
  showColorfulStrings?: boolean;
  stringBrightness?: number;
  selectedChord?: { rootNote: string; chordQuality: string } | null; // For compatible scales dropdown
  selectedScaleIndex?: number; // From parent (DualFretboardDisplay)
  onScaleIndexChange?: (index: number) => void; // For changing scale in the dropdown
}

export default function ScaleFretboard({
  selectedScale,
  filteredScaleNotes,
  cagedRegions,
  scaleFilterRegions,
  theme,
  tuning,
  stringCount,
  showCAGEDGuide,
  cagedBrightness = 100,
  showColorfulStrings = false,
  stringBrightness = 100,
  selectedChord = null,
  selectedScaleIndex = 0,
  onScaleIndexChange,
}: ScaleFretboardProps) {
  // Get compatible scales for the selected chord
  const compatibleScales = useMemo(() => {
    if (!selectedChord) return [];

    // Map chord quality to TriadType
    const qualityMap: Record<string, TriadType> = {
      'major': 'major',
      'minor': 'minor',
      'diminished': 'diminished',
      'augmented': 'augmented',
      'dim': 'diminished',
      'aug': 'augmented',
      'm': 'minor',
      'M': 'major',
    };

    const triadType = qualityMap[selectedChord.chordQuality] || 'major';
    return getScaleRecommendationsForTriad(selectedChord.rootNote, triadType);
  }, [selectedChord]);

  // Get the currently selected scale from the dropdown
  const currentScale = useMemo(() => {
    if (compatibleScales.length === 0) return selectedScale;

    const selectedRecommendation = compatibleScales[selectedScaleIndex];
    if (!selectedRecommendation) return selectedScale;

    // Create a ScaleModeInstance from the recommendation
    return {
      rootNote: selectedRecommendation.rootNote,
      scaleName: selectedRecommendation.scaleName,
      startTime: selectedScale?.startTime || 0,
      duration: selectedScale?.duration || 4,
    } as ScaleModeInstance;
  }, [compatibleScales, selectedScaleIndex, selectedScale]);

  // Calculate scale notes based on the selected scale from dropdown
  // Filter by scaleFilterRegions (from triad positions) not cagedRegions (all shapes)
  const calculatedScaleNotes = useMemo(() => {
    if (!currentScale) return [];

    // Use scaleFilterRegions to only show notes in CAGED regions that have triad notes
    return filterScaleNotesByCAGEDRegions(currentScale, scaleFilterRegions, tuning);
  }, [currentScale, scaleFilterRegions, tuning]);

  // Convert filtered scale notes to note positions for fretboard
  const notePositions = useMemo((): NotePosition[] => {
    return calculatedScaleNotes.map((note) => ({
      stringIndex: note.stringIndex,
      fretNumber: note.fretNumber,
      note: note.note,
      isRoot: note.scaleDegree === 1,
      color: NOTE_COLORS[note.note] || '#ffffff',
      label: note.scaleDegree.toString(),
      size: note.scaleDegree === 1 ? 'large' : 'medium', // Root note larger
      opacity: note.isInCAGEDRegion ? 1 : 0.5,
    }));
  }, [calculatedScaleNotes]);

  return (
    <div className="w-full" role="region" aria-label="Scale Fretboard">
      {/* Fretboard with Title Inside Card */}
      {currentScale ? (
        <div
          className="rounded-lg p-4"
          style={{
            backgroundColor: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
          }}
        >
          {/* Card header: "Scales & Modes" title + Recommended Scales dropdown (same line) */}
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-bold flex-shrink-0" style={{ color: theme.textPrimary }}>
              Scales &amp; Modes
            </h3>

            {/* Recommended Scales dropdown — only when multiple options exist */}
            {compatibleScales.length > 1 && onScaleIndexChange && (
              <>
                <span className="text-sm font-semibold whitespace-nowrap" style={{ color: theme.textSecondary }}>
                  Recommended Scales:
                </span>
                <select
                  id="scale-fretboard-scale-selector"
                  value={selectedScaleIndex}
                  onChange={(e) => onScaleIndexChange(Number(e.target.value))}
                  className="px-2 py-1 rounded-md text-sm font-medium transition-all cursor-pointer hover:opacity-90"
                  style={{
                    background: theme.bgPrimary,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.accentPrimary}`,
                    minWidth: '240px',
                    maxWidth: '420px',
                  }}
                  title="Select recommended scale — each shows different notes on the fretboard"
                >
                  {compatibleScales.map((option, index) => (
                    <option key={index} value={index}>
                      {option.displayName} {option.isPrimary ? '★' : ''} ({option.compatibilityRating}/10)
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div className="relative">
            <Fretboard
              stringCount={stringCount}
              tuning={tuning}
              notePositions={notePositions}
              theme={theme}
              showCAGEDOverlay={showCAGEDGuide}
              cagedRegions={cagedRegions}
              cagedBrightness={cagedBrightness}
              fretCount={24}
              showColorfulStrings={showColorfulStrings}
              stringBrightness={stringBrightness}
              showTopFretDots={false}
              showTopFretNumbers={false}
              showBottomFretDots={false}
              showBottomFretNumbers={false}
            />
          </div>
        </div>
      ) : (
        /* Empty State */
        <div
          className="border-2 border-dashed rounded-lg p-12 text-center"
          style={{
            borderColor: theme.border,
            backgroundColor: theme.bgPrimary + '40'
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="text-4xl">🎵</div>
            <div>
              <p className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
                No scale assigned to current chord
              </p>
              <p className="text-sm" style={{ color: theme.textSecondary }}>
                Add a scale in the timeline to see scale notes here
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

