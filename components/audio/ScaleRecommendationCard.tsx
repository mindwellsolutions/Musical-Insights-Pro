'use client';

/**
 * Scale Recommendation Card Component
 * Modern, premium card for displaying scale/mode recommendations
 */

import React, { useState } from 'react';
import { ScaleCompatibilityRating, SCALE_CHARACTERISTICS } from '@/lib/musicalCompatibility';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { Theme } from '@/lib/themes';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface ScaleRecommendationCardProps {
  scale: ScaleCompatibilityRating;
  isSelected: boolean;
  onSelect: () => void;
  theme: Theme;
  onAddToTimeline?: () => void;
  showAddButton?: boolean;
}

export default function ScaleRecommendationCard({
  scale,
  isSelected,
  onSelect,
  theme,
  onAddToTimeline,
  showAddButton = false,
}: ScaleRecommendationCardProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const isDark = theme === 'dark';
  const [isExpanded, setIsExpanded] = useState(false);

  const getRatingColor = (score: number): string => {
    if (score >= 9) return '#22c55e';
    if (score >= 7) return '#3b82f6';
    if (score >= 5) return '#f97316';
    return '#6b7280';
  };

  const parseGenres = (genreString: string | undefined): string[] => {
    if (!genreString) return [];
    return genreString.split(',').map(g => g.trim()).filter(g => g.length > 0);
  };

  const genres = parseGenres(scale.genreRecommendations);
  const ratingColor = getRatingColor(scale.compatibilityScore);
  const hasDetails = !!(scale.rationale || scale.musicalContext || scale.recommendedUse);

  // Card container
  const cardBg = isDark ? '#1c1c1e' : '#ffffff';
  const cardBorder = isSelected
    ? `2px solid ${ratingColor}`
    : `1px solid ${isDark ? '#2e2e32' : '#e4e4e7'}`;
  const cardShadow = isSelected
    ? `0 0 0 1px ${ratingColor}33, 0 8px 24px rgba(0,0,0,0.32)`
    : `0 2px 10px rgba(0,0,0,${isDark ? '0.28' : '0.07'})`;

  return (
    <div
      style={{
        backgroundColor: cardBg,
        border: cardBorder,
        borderRadius: '14px',
        padding: '18px 18px 14px',
        cursor: 'pointer',
        transition: 'box-shadow 0.22s ease, transform 0.22s ease, border-color 0.22s ease',
        position: 'relative',
        boxShadow: cardShadow,
        transform: isSelected ? 'translateY(-3px)' : 'translateY(0)',
        overflow: 'hidden',
      }}
      onClick={onSelect}
      onMouseEnter={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `0 6px 20px rgba(0,0,0,${isDark ? '0.4' : '0.12'})`;
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = cardShadow;
        }
      }}
    >
      {/* Selected accent stripe */}
      {isSelected && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${ratingColor}, ${ratingColor}88)`,
          borderRadius: '14px 14px 0 0',
        }} />
      )}

      {/* ── Header row ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
          <div style={{
            fontSize: '17px',
            fontWeight: '700',
            color: isDark ? '#f4f4f5' : '#18181b',
            lineHeight: 1.2,
            marginBottom: '3px',
            letterSpacing: '-0.2px',
          }}>
            {scale.scaleName}
          </div>
          <div style={{
            fontSize: '12px',
            color: isDark ? '#71717a' : '#71717a',
            fontWeight: '500',
          }}>
            Root: {getNoteDisplayName(scale.rootNote)}
          </div>
        </div>

        {/* Score badge */}
        <div style={{
          backgroundColor: ratingColor,
          color: '#ffffff',
          padding: '5px 12px',
          borderRadius: '999px',
          fontSize: '13px',
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0,
          boxShadow: `0 2px 8px ${ratingColor}55`,
          letterSpacing: '0.1px',
        }}>
          <span style={{ fontSize: '12px' }}>★</span>
          {scale.compatibilityScore.toFixed(1)}
        </div>
      </div>

      {/* ── Relationship row ── */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '7px',
        marginBottom: '10px',
      }}>
        <span style={{ fontSize: '13px', marginTop: '1px', flexShrink: 0 }}>🎵</span>
        <span style={{
          fontSize: '12px',
          color: isDark ? '#a1a1aa' : '#52525b',
          lineHeight: 1.45,
        }}>
          {scale.harmonicRelationship}
        </span>
      </div>

      {/* ── Difficulty ── */}
      {scale.difficultyLevel && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          marginBottom: '12px',
        }}>
          <span style={{ fontSize: '11px', fontWeight: '600', color: isDark ? '#71717a' : '#a1a1aa', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            Difficulty:
          </span>
          <div style={{ display: 'flex', gap: '2px' }}>
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                style={{
                  color: i < (scale.difficultyLevel ?? 0) ? '#fbbf24' : isDark ? '#2e2e32' : '#e4e4e7',
                  fontSize: '13px',
                  lineHeight: 1,
                }}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Chord Tones ── */}
      {scale.chordTones.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            fontSize: '10px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.7px',
            color: isDark ? '#52525b' : '#a1a1aa',
            marginBottom: '7px',
          }}>
            Chord Tones
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {scale.chordTones.map((note, index) => (
              <div
                key={`chord-${index}`}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '12px',
                  backgroundColor: NOTE_COLORS[note] || '#52525b',
                  color: '#ffffff',
                  boxShadow: `0 2px 6px ${NOTE_COLORS[note] || '#52525b'}66`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  letterSpacing: '-0.3px',
                }}
              >
                {getNoteDisplayName(note)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Genre Tags ── */}
      {genres.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '12px' }}>
          {genres.map((genre, index) => (
            <span
              key={index}
              style={{
                fontSize: '10px',
                padding: '3px 9px',
                borderRadius: '999px',
                backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                color: isDark ? '#a1a1aa' : '#52525b',
                fontWeight: '500',
                border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
                letterSpacing: '0.1px',
              }}
            >
              {genre}
            </span>
          ))}
        </div>
      )}

      {/* ── Footer row: Add button + Details button ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: showAddButton && onAddToTimeline ? 'space-between' : 'flex-end',
        gap: '8px',
        marginTop: genres.length > 0 || scale.chordTones.length > 0 ? '2px' : '4px',
        paddingTop: '10px',
        borderTop: `1px solid ${isDark ? '#27272a' : '#f4f4f5'}`,
      }}>
        {/* Add to Timeline Button */}
        {showAddButton && onAddToTimeline && (
          <button
            style={{
              padding: '6px 14px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              letterSpacing: '0.1px',
            }}
            onClick={(e) => {
              e.stopPropagation();
              onAddToTimeline();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#7c3aed';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139,92,246,0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#8b5cf6';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
            <span>Add to Timeline</span>
          </button>
        )}

        {/* Details Toggle Button */}
        {hasDetails && (
          <button
            style={{
              padding: '5px 12px',
              backgroundColor: isDark ? '#27272a' : '#f4f4f5',
              border: `1px solid ${isDark ? '#3f3f46' : '#e4e4e7'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: '600',
              color: isDark ? '#a1a1aa' : '#52525b',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.18s ease',
              letterSpacing: '0.1px',
              flexShrink: 0,
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#3f3f46' : '#e4e4e7';
              e.currentTarget.style.color = isDark ? '#d4d4d8' : '#27272a';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? '#27272a' : '#f4f4f5';
              e.currentTarget.style.color = isDark ? '#a1a1aa' : '#52525b';
            }}
          >
            <span>Details</span>
            {isExpanded
              ? <ChevronUp size={12} strokeWidth={2.5} />
              : <ChevronDown size={12} strokeWidth={2.5} />
            }
          </button>
        )}
      </div>

      {/* ── Expanded Details Section ── */}
      {isExpanded && hasDetails && (
        <div style={{
          marginTop: '12px',
          padding: '12px 14px',
          backgroundColor: isDark ? '#18181b' : '#fafafa',
          borderRadius: '10px',
          border: `1px solid ${isDark ? '#27272a' : '#e4e4e7'}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          {scale.rationale && (
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: isDark ? '#52525b' : '#a1a1aa',
                marginBottom: '4px',
              }}>
                Rationale
              </div>
              <div style={{ fontSize: '12px', color: isDark ? '#a1a1aa' : '#52525b', lineHeight: 1.5 }}>
                {scale.rationale}
              </div>
            </div>
          )}
          {scale.musicalContext && (
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: isDark ? '#52525b' : '#a1a1aa',
                marginBottom: '4px',
              }}>
                Musical Context
              </div>
              <div style={{ fontSize: '12px', color: isDark ? '#a1a1aa' : '#52525b', lineHeight: 1.5 }}>
                {scale.musicalContext}
              </div>
            </div>
          )}
          {scale.recommendedUse && (
            <div>
              <div style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                color: isDark ? '#52525b' : '#a1a1aa',
                marginBottom: '4px',
              }}>
                Recommended Use
              </div>
              <div style={{ fontSize: '12px', color: isDark ? '#a1a1aa' : '#52525b', lineHeight: 1.5 }}>
                {scale.recommendedUse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

