'use client';

import { useState } from 'react';
import { Theme, ThemeConfig } from '@/lib/themes';
import CompatibleScalesSection from './audio/CompatibleScalesSection';
import ChordRecommendations from './ChordRecommendations';
import ChordProgressionRecommendations from './ChordProgressionRecommendations';
import { ScaleCompatibilityRating } from '@/lib/musicalCompatibility';
import { SkillLevel } from '@/components/shared/SkillLevelSelector';
import { useSharedSkillLevel } from '@/hooks/useSharedSkillLevel';
import { ChordProgression } from '@/lib/progression-analyzer/types';
import { ProgressionChordSelections } from '@/lib/music-theory/progression-interval-chords/types';

interface MusicTheoryTabsProps {
  // Compatible Scales props
  detectedKey: string;
  compatibleScales: ScaleCompatibilityRating[];
  selectedScale: ScaleCompatibilityRating | null;
  onScaleSelect: (scale: ScaleCompatibilityRating) => void;
  confidence: number;
  isManualMode: boolean;
  onMIDINavigateLeft?: (handler: () => void) => void;
  onMIDINavigateRight?: (handler: () => void) => void;

  // Chord Recommendations props
  currentKey: string;
  currentScale: string;
  selectedChordNotes: string[] | null;
  onChordSelect: (notes: string[] | null) => void;
  tuning: string[];
  stringCount: 6 | 7;

  // Progression selection (Features 0 + A)
  onProgressionSelect?: (progression: ChordProgression | null) => void;
  onChordSelectionsChange?: (selections: ProgressionChordSelections, viewMode: 'step' | 'all', currentSlot: number) => void;
  selectedProgressionId?: string | null;

  // Theme
  currentTheme: Theme;
  theme: ThemeConfig;
}

export default function MusicTheoryTabs({
  detectedKey,
  compatibleScales,
  selectedScale,
  onScaleSelect,
  confidence,
  isManualMode,
  onMIDINavigateLeft,
  onMIDINavigateRight,
  currentKey,
  currentScale,
  selectedChordNotes,
  onChordSelect,
  tuning,
  stringCount,
  onProgressionSelect,
  onChordSelectionsChange,
  selectedProgressionId,
  currentTheme,
  theme,
}: MusicTheoryTabsProps) {
  const [activeTab, setActiveTab] = useState<'scales' | 'chords' | 'progressions'>('scales');
  // Shared skill level state - synced with AI Assistant and AudioSidebar
  const [skillLevel, setSkillLevel] = useSharedSkillLevel();

  const tabs = [
    { id: 'scales' as const, label: 'Compatible Scales & Modes' },
    { id: 'chords' as const, label: 'Recommended Chords' },
    { id: 'progressions' as const, label: 'Common Progressions' },
  ];

  return (
    <div>
      {/* Tab Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(tab.id);
            }}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
            style={{
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                : theme.bgTertiary,
              color: activeTab === tab.id ? '#ffffff' : theme.textSecondary,
              border: `1px solid ${activeTab === tab.id ? '#2563eb' : theme.border}`,
              opacity: 1,
              visibility: 'visible',
              display: 'inline-block',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        <div style={{ display: activeTab === 'scales' ? 'block' : 'none' }}>
          <CompatibleScalesSection
            detectedKey={detectedKey}
            compatibleScales={compatibleScales}
            selectedScale={selectedScale}
            onScaleSelect={onScaleSelect}
            theme={currentTheme}
            confidence={confidence}
            isManualMode={isManualMode}
            onMIDINavigateLeft={onMIDINavigateLeft}
            onMIDINavigateRight={onMIDINavigateRight}
            skillLevel={skillLevel}
            onSkillLevelChange={setSkillLevel}
          />
        </div>

        <div style={{ display: activeTab === 'chords' ? 'block' : 'none' }}>
          <ChordRecommendations
            theme={theme}
            currentKey={currentKey}
            currentScale={currentScale}
            selectedChordNotes={selectedChordNotes}
            onChordSelect={onChordSelect}
            tuning={tuning}
            stringCount={stringCount}
            hideContainer={true}
          />
        </div>

        <div style={{ display: activeTab === 'progressions' ? 'block' : 'none' }}>
          <ChordProgressionRecommendations
            theme={theme}
            currentKey={currentKey}
            hideContainer={true}
            onProgressionSelect={onProgressionSelect}
            onChordSelectionsChange={onChordSelectionsChange}
            selectedProgressionId={selectedProgressionId}
          />
        </div>
      </div>
    </div>
  );
}

