'use client';

import { useState } from 'react';
import { AIChordRecommendation } from '@/lib/ai-assistant/types';
import { ThemeConfig } from '@/lib/themes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ChordRecommendationCard from './ChordRecommendationCard';

interface ChordRecommendationCarouselProps {
  chords: AIChordRecommendation[];
  theme: ThemeConfig;
  tuning: string[];
  stringCount: number;
}

export default function ChordRecommendationCarousel({
  chords,
  theme,
  tuning,
  stringCount,
}: ChordRecommendationCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (chords.length === 0) {
    return null;
  }

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? chords.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === chords.length - 1 ? 0 : prev + 1));
  };

  const currentChord = chords[currentIndex];

  return (
    <div className="relative">
      {/* Navigation - Moved to top */}
      {chords.length > 1 && (
        <div className="mb-4">
          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-3">
            <button
              onClick={handlePrevious}
              className="p-1.5 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all flex-shrink-0"
              aria-label="Previous chord"
              style={{ background: `${theme.accentPrimary}10` }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: theme.accentPrimary }} />
            </button>

            {/* Counter Text - Left of dots */}
            <div
              className="flex items-center gap-2 px-3 py-1 rounded-full font-medium text-sm flex-shrink-0"
              style={{
                background: `${theme.accentPrimary}15`,
                color: theme.accentPrimary,
                border: `1px solid ${theme.accentPrimary}30`
              }}
            >
              <span className="font-bold">{currentIndex + 1}</span>
              <span className="opacity-60">/</span>
              <span>{chords.length}</span>
            </div>

            {/* Dots Indicator */}
            <div className="flex gap-1.5 flex-1 justify-center">
              {chords.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="transition-all rounded-full"
                  style={{
                    width: index === currentIndex ? '24px' : '8px',
                    height: '8px',
                    background: index === currentIndex ? theme.accentPrimary : theme.textSecondary,
                    opacity: index === currentIndex ? 1 : 0.3,
                  }}
                  aria-label={`Go to chord ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg hover:bg-opacity-10 hover:bg-white transition-all flex-shrink-0"
              aria-label="Next chord"
              style={{ background: `${theme.accentPrimary}10` }}
            >
              <ChevronRight className="w-5 h-5" style={{ color: theme.accentPrimary }} />
            </button>
          </div>
        </div>
      )}

      {/* Chord Card */}
      <ChordRecommendationCard
        chord={currentChord}
        theme={theme}
        tuning={tuning}
        stringCount={stringCount}
      />
    </div>
  );
}

