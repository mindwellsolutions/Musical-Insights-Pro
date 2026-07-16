'use client';

/**
 * Scale/Mode Recommendations Panel
 * Shows Compatible Scales & Modes based on current key
 */

import { useState, useEffect } from 'react';
import { ScaleCompatibilityRating } from '@/lib/musicalCompatibility';
import { getCompatibleScalesFromDatabase } from '@/lib/music-theory-database/compatibility-service';
import CompatibleScalesSection from '@/components/audio/CompatibleScalesSection';
import { Loader2, Sparkles, List } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChordInstance, VerseData } from '@/lib/chord-progression/types';
import AIScaleModeRecommendations from './AIScaleModeRecommendations';

interface ScaleModeRecommendationsProps {
  currentKey: string;
  onAddScaleToTimeline?: (scaleName: string, rootNote: string) => void;
  currentProgression?: ChordInstance[];
  activeVerse?: VerseData;
  onVerseUpdate?: (verseId: string, updates: Partial<VerseData>) => void;
}

export default function ScaleModeRecommendations({
  currentKey,
  onAddScaleToTimeline,
  currentProgression = [],
  activeVerse,
  onVerseUpdate,
}: ScaleModeRecommendationsProps) {
  const [compatibleScales, setCompatibleScales] = useState<ScaleCompatibilityRating[]>([]);
  const [selectedScale, setSelectedScale] = useState<ScaleCompatibilityRating | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skillLevel, setSkillLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [activeTab, setActiveTab] = useState<'compatible' | 'recommended'>('compatible');

  // Load compatible scales when key changes
  useEffect(() => {
    const loadScales = async () => {
      setIsLoading(true);
      try {
        // Default to Major scale for the key
        const scales = await getCompatibleScalesFromDatabase(currentKey, 'Ionian', 12, 4);
        setCompatibleScales(scales);
      } catch (error) {
        console.error('Error loading compatible scales:', error);
        setCompatibleScales([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadScales();
  }, [currentKey]);

  const handleScaleSelect = (scale: ScaleCompatibilityRating) => {
    setSelectedScale(scale);
    // You can add additional functionality here, like playing the scale
  };

  const handleAddToTimeline = (scale: ScaleCompatibilityRating) => {
    if (onAddScaleToTimeline) {
      onAddScaleToTimeline(scale.scaleName, scale.rootNote);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#8b5cf6]" />
          <p className="text-[#a0a0a0]">Loading scale recommendations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-[#1a1a1a] to-[#141414]">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'compatible' | 'recommended')} className="w-full h-full flex flex-col">
        <div className="px-4 pt-3 pb-2 border-b border-[#2a2a2a]">
          <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-[#1a1a1a] p-1 text-[#a0a0a0]">
            <TabsTrigger
              value="compatible"
              className="gap-2 rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white transition-all"
            >
              <List className="w-3.5 h-3.5" />
              Compatible
            </TabsTrigger>
            <TabsTrigger
              value="recommended"
              className="gap-2 rounded-md px-3 py-1.5 text-sm data-[state=active]:bg-[#8b5cf6] data-[state=active]:text-white transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Recommended
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Compatible Tab - Current Display */}
        <TabsContent value="compatible" className="mt-0 flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto p-6">
            <CompatibleScalesSection
              detectedKey={currentKey}
              compatibleScales={compatibleScales}
              selectedScale={selectedScale}
              onScaleSelect={handleScaleSelect}
              theme="dark"
              confidence={1}
              isManualMode={true}
              skillLevel={skillLevel}
              onSkillLevelChange={setSkillLevel}
              showAddButton={!!onAddScaleToTimeline}
              onAddToTimeline={handleAddToTimeline}
            />
          </div>
        </TabsContent>

        {/* Recommended Tab - AI-Powered Recommendations */}
        <TabsContent value="recommended" className="mt-0 flex-1 overflow-hidden">
          <AIScaleModeRecommendations
            currentKey={currentKey}
            currentProgression={currentProgression}
            onAddScaleToTimeline={onAddScaleToTimeline}
            activeVerse={activeVerse}
            onVerseUpdate={onVerseUpdate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

