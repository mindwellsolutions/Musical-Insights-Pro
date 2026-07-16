'use client';

/**
 * Generator panel for chord progression generation - Always visible
 */

import { ChordInstance, ScaleModeInstance, VerseData, InstrumentType } from '@/lib/chord-progression/types';
import ChordProgressionGenerator from './ChordProgressionGenerator';

interface GeneratorPanelProps {
  currentKey: string;
  pixelsPerBeat: number;
  onProgressionLoad: (chords: ChordInstance[]) => void;
  currentProgression?: ChordInstance[];
  currentScaleModes?: ScaleModeInstance[];
  onAddScaleToTimeline?: (scaleName: string, rootNote: string) => void;
  onKeyChangeClick?: () => void;
  verseId: string; // ID of the current verse/section
  selectedChord?: ChordInstance | null;
  isPlaying?: boolean;
  currentTime?: number;
  showColorfulStrings?: boolean;
  onShowColorfulStringsChange?: (enabled: boolean) => void;
  stringBrightness?: number;
  onStringBrightnessChange?: (brightness: number) => void;
  selectedInstrument?: InstrumentType;
  activeVerse?: VerseData;
  onVerseUpdate?: (verseId: string, updates: Partial<VerseData>) => void;
  onGeneratorRef?: (ref: {
    triggerUpdateRecommendations: (updates: any[]) => void;
    setGeneratingUpdates: (isGenerating: boolean) => void;
  } | null) => void;
}

export default function GeneratorPanel({
  currentKey,
  pixelsPerBeat,
  onProgressionLoad,
  currentProgression = [],
  currentScaleModes = [],
  onAddScaleToTimeline,
  onKeyChangeClick,
  verseId,
  selectedChord,
  isPlaying = false,
  currentTime = 0,
  showColorfulStrings = false,
  onShowColorfulStringsChange,
  stringBrightness = 100,
  onStringBrightnessChange,
  selectedInstrument = 'piano',
  activeVerse,
  onVerseUpdate,
  onGeneratorRef,
}: GeneratorPanelProps) {
  return (
    <div className="flex-1 w-full bg-gradient-to-b from-[#141414] to-[#0f0f0f] border-t-2 border-[#2a2a2a] overflow-hidden">
      <ChordProgressionGenerator
        currentKey={currentKey}
        pixelsPerBeat={pixelsPerBeat}
        onProgressionLoad={onProgressionLoad}
        currentProgression={currentProgression}
        currentScaleModes={currentScaleModes}
        onAddScaleToTimeline={onAddScaleToTimeline}
        onKeyChangeClick={onKeyChangeClick}
        verseId={verseId}
        selectedChord={selectedChord}
        isPlaying={isPlaying}
        currentTime={currentTime}
        showColorfulStrings={showColorfulStrings}
        onShowColorfulStringsChange={onShowColorfulStringsChange}
        stringBrightness={stringBrightness}
        onStringBrightnessChange={onStringBrightnessChange}
        selectedInstrument={selectedInstrument}
        activeVerse={activeVerse}
        onVerseUpdate={onVerseUpdate}
        onGeneratorRef={onGeneratorRef}
      />
    </div>
  );
}

