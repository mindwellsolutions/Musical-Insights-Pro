'use client';

import { AITargetNoteRecommendation, TargetNoteHighlight, TargetNoteSet, CARD_COLORS } from '@/lib/target-notes/types';
import { ThemeConfig } from '@/lib/themes';
import TargetNoteCard from '@/components/target-notes/TargetNoteCard';

interface TargetNoteRecommendationCarouselProps {
  recommendations: AITargetNoteRecommendation[];
  activeHighlight: TargetNoteHighlight | null;
  onLoadTargetNotes: (highlight: TargetNoteHighlight) => void;
  theme: ThemeConfig;
  scaleNotes?: string[];
}

export default function TargetNoteRecommendationCarousel({
  recommendations,
  activeHighlight,
  onLoadTargetNotes,
  theme,
}: TargetNoteRecommendationCarouselProps) {
  if (!recommendations || recommendations.length === 0) return null;

  const isActive = (rec: AITargetNoteRecommendation): boolean => {
    if (!activeHighlight) return false;
    return (
      activeHighlight.label === rec.label &&
      activeHighlight.notes.length === rec.notes.length &&
      rec.notes.every((n) => activeHighlight.notes.includes(n))
    );
  };

  const toNoteSet = (rec: AITargetNoteRecommendation, i: number): TargetNoteSet => ({
    id: rec.id || `tn-ai-${i}`,
    label: rec.label,
    notes: rec.notes,
    rationale: rec.rationale,
    moodKeywords: rec.moodKeywords,
    theoryBasis: rec.theoryBasis,
    color: rec.color || CARD_COLORS[i % CARD_COLORS.length],
    source: 'ai',
  });

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 6,
          scrollbarWidth: 'none',
        }}
      >
        {recommendations.map((rec, i) => {
          const noteSet = toNoteSet(rec, i);
          return (
            <TargetNoteCard
              key={rec.id || i}
              noteSet={noteSet}
              isActive={isActive(rec)}
              onLoad={() =>
                onLoadTargetNotes({
                  notes: rec.notes,
                  label: rec.label,
                  color: noteSet.color,
                  source: 'ai',
                })
              }
              theme={theme}
            />
          );
        })}
      </div>
    </div>
  );
}
