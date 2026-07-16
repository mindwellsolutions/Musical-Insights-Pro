'use client';

/**
 * Chord Progression Generator container - Always visible
 */

import { useState, useEffect } from 'react';
import { ChordInstance, ScaleModeInstance, VerseData, InstrumentType } from '@/lib/chord-progression/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Music, Scale, Guitar, Play } from 'lucide-react';
import GenreProgressionSelector from './GenreProgressionSelector';
import AIProgressionGenerator from './AIProgressionGenerator';
import ScaleModeRecommendations from './ScaleModeRecommendations';
import ChordDiagramsTab from './ChordDiagramsTab';
import PlaySongPanel from './PlaySongPanel';
import { themes } from '@/lib/themes';

interface ChordProgressionGeneratorProps {
  currentKey: string;
  pixelsPerBeat: number;
  onProgressionLoad: (chords: ChordInstance[]) => void;
  currentProgression?: ChordInstance[];
  currentScaleModes?: ScaleModeInstance[];
  onAddScaleToTimeline?: (scaleName: string, rootNote: string) => void;
  onKeyChangeClick?: () => void;
  verseId: string; // ID of the current verse/section
  selectedChord?: ChordInstance | null;
  tuning?: string[];
  stringCount?: number;
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
    switchToTab?: (tab: string) => void;
  } | null) => void;
}

export default function ChordProgressionGenerator({
  currentKey,
  pixelsPerBeat,
  onProgressionLoad,
  currentProgression = [],
  currentScaleModes = [],
  onAddScaleToTimeline,
  onKeyChangeClick,
  verseId,
  selectedChord = null,
  tuning = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount = 6,
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
}: ChordProgressionGeneratorProps) {
  // Active tab state
  const [activeTab, setActiveTab] = useState('play-song');
  const [aiSubTab, setAiSubTab] = useState('ai');
  const [updateRecommendations, setUpdateRecommendations] = useState<any[] | null>(null);
  const [isGeneratingUpdates, setIsGeneratingUpdates] = useState(false);


  // Handler to navigate to Chord Progressions tab
  const handleGenerateProgression = () => {
    setActiveTab('chords');
  };

  // Expose ref for triggering update recommendations
  useEffect(() => {
    if (onGeneratorRef) {
      onGeneratorRef({
        triggerUpdateRecommendations: (updates: any[]) => {
          setUpdateRecommendations(updates);
          setActiveTab('chords');
          setAiSubTab('ai');
          setIsGeneratingUpdates(false); // Stop generating when updates arrive
        },
        setGeneratingUpdates: (isGenerating: boolean) => {
          setIsGeneratingUpdates(isGenerating);
          if (isGenerating) {
            // Switch to the correct tab when starting to generate
            setActiveTab('chords');
            setAiSubTab('ai');
          }
        },
        switchToTab: (tab: string) => {
          setActiveTab(tab === 'genre' ? 'chords' : tab);
          if (tab === 'genre') setAiSubTab('genre');
          if (tab === 'chords') setAiSubTab('ai');
        },
      });
    }
    return () => {
      if (onGeneratorRef) {
        onGeneratorRef(null);
      }
    };
  }, [onGeneratorRef]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        <div className="px-4 pt-4 pb-2 border-b border-[#333333]">
          <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-[#2a2a2a] p-1 text-[#a0a0a0]">
            <TabsTrigger
              value="play-song"
              className="gap-2 rounded-md px-4 py-2 data-[state=active]:bg-[#f59e0b] data-[state=active]:text-white transition-all"
            >
              <Play className="w-4 h-4" />
              Play Song
            </TabsTrigger>
            <TabsTrigger
              value="chords"
              className="gap-2 rounded-md px-4 py-2 data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white transition-all"
            >
              <Music className="w-4 h-4" />
              Chord Progressions
            </TabsTrigger>
            <TabsTrigger
              value="diagrams"
              className="gap-2 rounded-md px-4 py-2 data-[state=active]:bg-[#10b981] data-[state=active]:text-white transition-all"
            >
              <Guitar className="w-4 h-4" />
              Chord Diagrams
            </TabsTrigger>
            <TabsTrigger
              value="scales"
              className="gap-2 rounded-md px-4 py-2 data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white transition-all"
            >
              <Scale className="w-4 h-4" />
              Scale/Mode Recommendations
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Play Song Tab */}
        <TabsContent value="play-song" className="mt-0 flex-1 overflow-auto">
          <PlaySongPanel
            currentChords={currentProgression}
            currentScales={currentScaleModes}
            currentKey={currentKey}
            isPlaying={isPlaying}
            currentTime={currentTime}
            tuning={tuning}
            stringCount={stringCount as 6 | 7}
            theme={themes.dark}
            showColorfulStrings={showColorfulStrings}
            onShowColorfulStringsChange={onShowColorfulStringsChange}
            stringBrightness={stringBrightness}
            onStringBrightnessChange={onStringBrightnessChange}
            onGenerateProgression={handleGenerateProgression}
          />
        </TabsContent>

        {/* Chord Progressions Tab - Contains AI-Assisted and Genre-Based sub-tabs */}
        <TabsContent value="chords" className="mt-0 flex-1 overflow-hidden">
          <Tabs value={aiSubTab} onValueChange={setAiSubTab} className="w-full h-full flex flex-col">
            <div className="px-4 pt-3 pb-2 border-b border-[#2a2a2a]">
              <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1a1a1a] p-1 text-[#a0a0a0]">
                <TabsTrigger
                  value="ai"
                  className="gap-2 rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Assisted
                </TabsTrigger>
                <TabsTrigger
                  value="genre"
                  className="gap-2 rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-[#3b82f6] data-[state=active]:text-white transition-all"
                >
                  <Music className="w-3.5 h-3.5" />
                  Genre-Based
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="ai" className="mt-0 flex-1 overflow-hidden">
              <AIProgressionGenerator
                currentKey={currentKey}
                pixelsPerBeat={pixelsPerBeat}
                onProgressionLoad={onProgressionLoad}
                currentProgression={currentProgression}
                currentScaleModes={currentScaleModes}
                onKeyChangeClick={onKeyChangeClick}
                verseId={verseId}
                selectedInstrument={selectedInstrument}
                theme={themes.dark}
                updateRecommendations={updateRecommendations}
                onUpdateRecommendationsConsumed={() => setUpdateRecommendations(null)}
                isGeneratingUpdates={isGeneratingUpdates}
              />
            </TabsContent>

            <TabsContent value="genre" className="mt-0 flex-1 overflow-hidden">
              <GenreProgressionSelector
                currentKey={currentKey}
                pixelsPerBeat={pixelsPerBeat}
                onProgressionLoad={onProgressionLoad}
              />
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Chord Diagrams Tab */}
        <TabsContent value="diagrams" className="mt-0 flex-1 overflow-hidden">
          <ChordDiagramsTab
            selectedChord={selectedChord}
            tuning={tuning}
            stringCount={stringCount}
          />
        </TabsContent>

        {/* Scale/Mode Recommendations Tab */}
        <TabsContent value="scales" className="mt-0 flex-1 overflow-hidden">
          <ScaleModeRecommendations
            currentKey={currentKey}
            onAddScaleToTimeline={onAddScaleToTimeline}
            currentProgression={currentProgression}
            activeVerse={activeVerse}
            onVerseUpdate={onVerseUpdate}
          />
        </TabsContent>

      </Tabs>
    </div>
  );
}

