'use client';

import { useState } from 'react';
import { AIScaleRecommendation, AIChordRecommendation, AIChordProgressionRecommendation } from '@/lib/ai-assistant/types';
import { AITargetNoteRecommendation, TargetNoteHighlight } from '@/lib/target-notes/types';
import { ThemeConfig } from '@/lib/themes';
import RecommendationTabs, { RecommendationType } from './RecommendationTabs';
import ScaleRecommendationCarousel from './ScaleRecommendationCarousel';
import ChordRecommendationCarousel from './ChordRecommendationCarousel';
import ProgressionRecommendationCarousel from './ProgressionRecommendationCarousel';
import TargetNoteRecommendationCarousel from './TargetNoteRecommendationCarousel';

interface UnifiedRecommendationDisplayProps {
  scaleRecommendations?: AIScaleRecommendation[];
  chordRecommendations?: AIChordRecommendation[];
  progressionRecommendations?: AIChordProgressionRecommendation[];
  targetNoteRecommendations?: AITargetNoteRecommendation[];
  activeTargetNoteHighlight?: TargetNoteHighlight | null;
  onLoadTargetNotes?: (highlight: TargetNoteHighlight) => void;
  theme: ThemeConfig;
  loadedScales: Set<string>;
  onLoadScale: (scale: AIScaleRecommendation) => void;
  tuning: string[];
  stringCount: number;
}

export default function UnifiedRecommendationDisplay({
  scaleRecommendations = [],
  chordRecommendations = [],
  progressionRecommendations = [],
  targetNoteRecommendations = [],
  activeTargetNoteHighlight,
  onLoadTargetNotes,
  theme,
  loadedScales,
  onLoadScale,
  tuning,
  stringCount,
}: UnifiedRecommendationDisplayProps) {
  // Determine initial active tab based on what's available
  const getInitialTab = (): RecommendationType => {
    if (targetNoteRecommendations.length > 0) return 'targetNotes';
    if (scaleRecommendations.length > 0) return 'scales';
    if (chordRecommendations.length > 0) return 'chords';
    if (progressionRecommendations.length > 0) return 'progressions';
    return 'scales';
  };

  const [activeTab, setActiveTab] = useState<RecommendationType>(getInitialTab());

  const counts = {
    scales: scaleRecommendations.length,
    chords: chordRecommendations.length,
    progressions: progressionRecommendations.length,
    targetNotes: targetNoteRecommendations.length,
  };

  // If no recommendations at all, return null
  if (counts.scales === 0 && counts.chords === 0 && counts.progressions === 0 && counts.targetNotes === 0) {
    return null;
  }

  // Count how many types have recommendations
  const typesWithRecommendations = [
    counts.scales > 0,
    counts.chords > 0,
    counts.progressions > 0,
    counts.targetNotes > 0,
  ].filter(Boolean).length;

  return (
    <div>
      {/* Show tabs only if multiple types have recommendations */}
      {typesWithRecommendations > 1 && (
        <RecommendationTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          theme={theme}
          counts={counts}
        />
      )}

      {/* Display active carousel */}
      <div className="transition-opacity duration-200">
        {activeTab === 'scales' && scaleRecommendations.length > 0 && (
          <ScaleRecommendationCarousel
            scales={scaleRecommendations}
            theme={theme}
            loadedScales={loadedScales}
            onLoadScale={onLoadScale}
          />
        )}

        {activeTab === 'chords' && chordRecommendations.length > 0 && (
          <ChordRecommendationCarousel
            chords={chordRecommendations}
            theme={theme}
            tuning={tuning}
            stringCount={stringCount}
          />
        )}

        {activeTab === 'progressions' && progressionRecommendations.length > 0 && (
          <ProgressionRecommendationCarousel
            progressions={progressionRecommendations}
            theme={theme}
            tuning={tuning}
            stringCount={stringCount}
          />
        )}

        {activeTab === 'targetNotes' && targetNoteRecommendations.length > 0 && (
          <TargetNoteRecommendationCarousel
            recommendations={targetNoteRecommendations}
            activeHighlight={activeTargetNoteHighlight ?? null}
            onLoadTargetNotes={onLoadTargetNotes ?? (() => {})}
            theme={theme}
          />
        )}
      </div>
    </div>
  );
}

