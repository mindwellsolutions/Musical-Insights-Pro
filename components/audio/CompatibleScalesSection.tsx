'use client';

/**
 * Compatible Scales Section Component
 * Displays compatible scales/modes for detected key with collapse/expand functionality
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScaleCompatibilityRating } from '@/lib/musicalCompatibility';
import ScaleRecommendationCard from './ScaleRecommendationCard';
import { Theme } from '@/lib/themes';
import SkillLevelSelector, { SkillLevel, isWithinSkillLevel } from '@/components/shared/SkillLevelSelector';
import { themes } from '@/lib/themes';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface CompatibleScalesSectionProps {
  detectedKey: string;
  compatibleScales: ScaleCompatibilityRating[];
  selectedScale: ScaleCompatibilityRating | null;
  onScaleSelect: (scale: ScaleCompatibilityRating) => void;
  theme: Theme;
  confidence?: number;
  isManualMode?: boolean;
  onMIDINavigateLeft?: (handler: () => void) => void;
  onMIDINavigateRight?: (handler: () => void) => void;
  skillLevel?: SkillLevel;
  onSkillLevelChange?: (level: SkillLevel) => void;
  onAddToTimeline?: (scale: ScaleCompatibilityRating) => void; // Optional callback for adding to timeline
  showAddButton?: boolean; // Whether to show the Add to Timeline button
}

export default function CompatibleScalesSection({
  detectedKey,
  compatibleScales,
  selectedScale,
  onScaleSelect,
  theme,
  confidence = 0,
  isManualMode = false,
  onMIDINavigateLeft,
  onMIDINavigateRight,
  skillLevel = 'intermediate',
  onSkillLevelChange,
  onAddToTimeline,
  showAddButton = false,
}: CompatibleScalesSectionProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [midiSelectedIndex, setMidiSelectedIndex] = useState<number>(-1);
  const isDark = theme === 'dark';
  const scaleRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Convert detected key to display format with notation preference
  const getDisplayKey = (key: string): string => {
    const parts = key.split(' ');
    if (parts.length >= 2) {
      const rootNote = parts[0];
      const scaleName = parts.slice(1).join(' ');
      return `${getNoteDisplayName(rootNote)} ${scaleName}`;
    }
    return key;
  };

  const displayDetectedKey = getDisplayKey(detectedKey);

  // Extract all unique genres from compatible scales
  const allGenres = React.useMemo(() => {
    const genreSet = new Set<string>();
    compatibleScales.forEach(scale => {
      if (scale.genreRecommendations) {
        const genres = scale.genreRecommendations.split(',').map(g => g.trim()).filter(g => g.length > 0);
        genres.forEach(genre => genreSet.add(genre));
      }
    });
    return Array.from(genreSet).sort();
  }, [compatibleScales]);

  // Filter scales based on selected genres AND skill level
  const filteredScales = React.useMemo(() => {
    let filtered = compatibleScales;

    // Filter by skill level (difficulty)
    filtered = filtered.filter(scale => {
      const difficulty = scale.difficultyLevel ?? 3; // Default to 3 if not specified
      return isWithinSkillLevel(difficulty, skillLevel);
    });

    // Filter by genre if any selected
    if (selectedGenres.length > 0) {
      filtered = filtered.filter(scale => {
        if (!scale.genreRecommendations) return false;
        const scaleGenres = scale.genreRecommendations.split(',').map(g => g.trim());
        return selectedGenres.some(selectedGenre => scaleGenres.includes(selectedGenre));
      });
    }

    return filtered;
  }, [compatibleScales, selectedGenres, skillLevel]);

  // Toggle genre selection
  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev => {
      if (prev.includes(genre)) {
        return prev.filter(g => g !== genre);
      } else {
        return [...prev, genre];
      }
    });
  };

  // Clear all genre filters
  const clearGenreFilters = () => {
    setSelectedGenres([]);
  };

  // Keyboard navigation for compatible scales (left/right arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys when there are compatible scales
      if (filteredScales.length === 0) return;

      // Check if user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return;
      }

      // Find current selected scale index
      const currentIndex = selectedScale
        ? filteredScales.findIndex(
            scale => scale.scaleName === selectedScale.scaleName && scale.rootNote === selectedScale.rootNote
          )
        : -1;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        // Navigate to previous scale (wrap around)
        const newIndex = currentIndex <= 0 ? filteredScales.length - 1 : currentIndex - 1;
        onScaleSelect(filteredScales[newIndex]);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        // Navigate to next scale (wrap around)
        const newIndex = currentIndex >= filteredScales.length - 1 ? 0 : currentIndex + 1;
        onScaleSelect(filteredScales[newIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredScales, selectedScale, onScaleSelect]);

  // MIDI Navigation Handlers
  const navigateLeft = useCallback(() => {
    if (filteredScales.length === 0) return;

    const currentIndex = selectedScale
      ? filteredScales.findIndex(
          scale => scale.scaleName === selectedScale.scaleName && scale.rootNote === selectedScale.rootNote
        )
      : -1;

    const newIndex = currentIndex <= 0 ? filteredScales.length - 1 : currentIndex - 1;
    onScaleSelect(filteredScales[newIndex]);
    setMidiSelectedIndex(newIndex);

    // Scroll to the selected card
    if (scaleRefs.current[newIndex]) {
      scaleRefs.current[newIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [filteredScales, selectedScale, onScaleSelect]);

  const navigateRight = useCallback(() => {
    if (filteredScales.length === 0) return;

    const currentIndex = selectedScale
      ? filteredScales.findIndex(
          scale => scale.scaleName === selectedScale.scaleName && scale.rootNote === selectedScale.rootNote
        )
      : -1;

    const newIndex = currentIndex >= filteredScales.length - 1 ? 0 : currentIndex + 1;
    onScaleSelect(filteredScales[newIndex]);
    setMidiSelectedIndex(newIndex);

    // Scroll to the selected card
    if (scaleRefs.current[newIndex]) {
      scaleRefs.current[newIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [filteredScales, selectedScale, onScaleSelect]);

  // Register MIDI navigation handlers with parent
  useEffect(() => {
    if (onMIDINavigateLeft) {
      onMIDINavigateLeft(navigateLeft);
    }
    if (onMIDINavigateRight) {
      onMIDINavigateRight(navigateRight);
    }
  }, [navigateLeft, navigateRight, onMIDINavigateLeft, onMIDINavigateRight]);

  const containerStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    border: `2px solid ${isDark ? '#333' : '#e0e0e0'}`,
    borderRadius: '12px',
    marginBottom: '20px',
    overflow: 'hidden',
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    backgroundColor: isDark ? '#222' : '#f8f8f8',
    borderBottom: isExpanded ? `1px solid ${isDark ? '#333' : '#e0e0e0'}` : 'none',
  };

  const titleContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#000000',
  };

  const detectedKeyStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isDark ? '#888' : '#666',
    fontWeight: 'normal',
  };

  const confidenceStyle: React.CSSProperties = {
    fontSize: '12px',
    color: isDark ? '#666' : '#999',
    marginLeft: '8px',
  };
  
  const arrowStyle: React.CSSProperties = {
    fontSize: '20px',
    transition: 'transform 0.3s ease',
    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
    color: isDark ? '#888' : '#666',
  };
  
  const contentStyle: React.CSSProperties = {
    padding: '24px',
    display: isExpanded ? 'block' : 'none',
  };
  
  const scalesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
  };
  
  const noScalesStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: isDark ? '#666' : '#999',
    fontSize: '16px',
  };

  const genreFilterContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    backgroundColor: isDark ? '#1e1e1e' : '#fafafa',
    borderBottom: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
    flexWrap: 'wrap',
  };

  const genreFilterLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: isDark ? '#888' : '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    whiteSpace: 'nowrap',
  };

  const genreTagsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
  };

  const genreTagStyle = (isSelected: boolean): React.CSSProperties => ({
    fontSize: '11px',
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: isSelected
      ? (isDark ? '#4CAF50' : '#4CAF50')
      : (isDark ? '#2a2a2a' : '#e8e8e8'),
    color: isSelected ? '#ffffff' : (isDark ? '#ccc' : '#555'),
    fontWeight: '500',
    border: `1px solid ${isSelected ? '#4CAF50' : (isDark ? '#444' : '#ccc')}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  });

  const clearFilterButtonStyle: React.CSSProperties = {
    fontSize: '11px',
    padding: '6px 12px',
    borderRadius: '16px',
    backgroundColor: isDark ? '#333' : '#ddd',
    color: isDark ? '#aaa' : '#666',
    fontWeight: '500',
    border: `1px solid ${isDark ? '#444' : '#ccc'}`,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  };
  
  if (compatibleScales.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div style={titleContainerStyle}>
            <div style={titleStyle}>Compatible Scales & Modes</div>
            <div style={detectedKeyStyle}>
              {isManualMode ? 'Selected Key' : 'Detected Key'}: <strong>{displayDetectedKey}</strong>
              {!isManualMode && <span style={confidenceStyle}>({(confidence * 100).toFixed(0)}% confidence)</span>}
            </div>
          </div>
          <div
            style={{...arrowStyle, cursor: 'pointer'}}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
        <div style={contentStyle}>
          <div style={noScalesStyle}>
            No compatible scales found for {displayDetectedKey}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={titleContainerStyle}>
          <div>
            <div style={titleStyle}>
              Compatible Scales & Modes ({filteredScales.length}{selectedGenres.length > 0 ? ` of ${compatibleScales.length}` : ''})
            </div>
            <div style={detectedKeyStyle}>
              {isManualMode ? 'Selected Key' : 'Detected Key'}: <strong>{displayDetectedKey}</strong>
              {!isManualMode && <span style={confidenceStyle}>({(confidence * 100).toFixed(0)}% confidence)</span>}
            </div>
          </div>
          {/* Skill Level Selector in Header */}
          {onSkillLevelChange && (
            <div style={{ minWidth: '280px' }}>
              <SkillLevelSelector
                skillLevel={skillLevel}
                onSkillLevelChange={onSkillLevelChange}
                theme={themes[theme]}
                compact={true}
                showLabel={false}
                showDescription={false}
              />
            </div>
          )}
        </div>
        <div
          style={{...arrowStyle, cursor: 'pointer'}}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '▲' : '▼'}
        </div>
      </div>

      {/* Genre Filter UI */}
      {isExpanded && allGenres.length > 0 && (
        <div style={genreFilterContainerStyle}>
          <div style={genreFilterLabelStyle}>Filter by Genre:</div>
          <div style={genreTagsContainerStyle}>
            {allGenres.map((genre) => (
              <div
                key={genre}
                style={genreTagStyle(selectedGenres.includes(genre))}
                onClick={() => toggleGenre(genre)}
                onMouseEnter={(e) => {
                  if (!selectedGenres.includes(genre)) {
                    e.currentTarget.style.backgroundColor = isDark ? '#333' : '#d8d8d8';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedGenres.includes(genre)) {
                    e.currentTarget.style.backgroundColor = isDark ? '#2a2a2a' : '#e8e8e8';
                  }
                }}
              >
                {genre}
              </div>
            ))}
          </div>
          {selectedGenres.length > 0 && (
            <div
              style={clearFilterButtonStyle}
              onClick={clearGenreFilters}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#3a3a3a' : '#ccc';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? '#333' : '#ddd';
              }}
            >
              Clear Filters
            </div>
          )}
        </div>
      )}

      <div style={contentStyle}>
        {filteredScales.length === 0 ? (
          <div style={noScalesStyle}>
            No scales found matching the selected genre{selectedGenres.length > 1 ? 's' : ''}: {selectedGenres.join(', ')}
          </div>
        ) : (
          <div style={scalesGridStyle}>
            {filteredScales.map((scale, index) => (
              <div
                key={`${scale.scaleName}-${index}`}
                ref={(el) => {
                  scaleRefs.current[index] = el;
                }}
              >
                <ScaleRecommendationCard
                  scale={scale}
                  isSelected={selectedScale?.scaleName === scale.scaleName && selectedScale?.rootNote === scale.rootNote}
                  onSelect={() => onScaleSelect(scale)}
                  theme={theme}
                  showAddButton={showAddButton}
                  onAddToTimeline={onAddToTimeline ? () => onAddToTimeline(scale) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

