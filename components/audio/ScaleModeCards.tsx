'use client';

/**
 * Scale/Mode Cards Component
 * Displays compatible scales/modes for detected key, sorted by compatibility rating
 */

import React from 'react';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { ScaleModeCompatibility } from '@/lib/supabase/client';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface ScaleModeCardsProps {
  compatibleScales: ScaleModeCompatibility[];
  selectedScale: ScaleModeCompatibility | null;
  onScaleSelect: (scale: ScaleModeCompatibility) => void;
  theme: 'dark' | 'light';
}

export default function ScaleModeCards({
  compatibleScales,
  selectedScale,
  onScaleSelect,
  theme,
}: ScaleModeCardsProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const isDark = theme === 'dark';
  
  const containerStyle: React.CSSProperties = {
    marginBottom: '20px',
  };
  
  const titleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#000000',
    marginBottom: '16px',
  };
  
  const cardsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  };
  
  const cardStyle = (isSelected: boolean, rating: number): React.CSSProperties => ({
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    border: `2px solid ${isSelected ? '#4CAF50' : (isDark ? '#333' : '#e0e0e0')}`,
    borderRadius: '12px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    position: 'relative',
    opacity: rating >= 8 ? 1 : rating >= 6 ? 0.9 : 0.8,
  });
  
  const cardHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  };
  
  const scaleNameStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#000000',
  };
  
  const ratingBadgeStyle = (rating: number): React.CSSProperties => ({
    backgroundColor: rating >= 9 ? '#4CAF50' : rating >= 7 ? '#2196F3' : '#FF9800',
    color: '#ffffff',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
  });
  
  const primaryBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#FFD700',
    color: '#000',
    padding: '4px 8px',
    borderRadius: '8px',
    fontSize: '10px',
    fontWeight: 'bold',
  };
  
  const contextStyle: React.CSSProperties = {
    fontSize: '12px',
    color: isDark ? '#aaa' : '#666',
    marginBottom: '12px',
    lineHeight: '1.4',
  };
  
  const tonesContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };
  
  const tonesTitleStyle: React.CSSProperties = {
    fontSize: '10px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: isDark ? '#888' : '#666',
  };
  
  const tonesGridStyle: React.CSSProperties = {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  };
  
  const noteSquareStyle = (note: string): React.CSSProperties => ({
    padding: '6px 10px',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '11px',
    backgroundColor: NOTE_COLORS[note] || '#666',
    color: '#ffffff',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  });
  
  const noDataStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: isDark ? '#666' : '#999',
    fontSize: '16px',
    backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
    borderRadius: '12px',
  };
  
  if (compatibleScales.length === 0) {
    return (
      <div style={containerStyle}>
        <div style={titleStyle}>Compatible Scales & Modes</div>
        <div style={noDataStyle}>
          No compatible scales available. Start audio detection to see recommendations.
        </div>
      </div>
    );
  }
  
  return (
    <div style={containerStyle}>
      <div style={titleStyle}>
        Compatible Scales & Modes ({compatibleScales.length})
      </div>
      
      <div style={cardsGridStyle}>
        {compatibleScales.map((scale) => {
          const isSelected = selectedScale?.id === scale.id;
          
          return (
            <div
              key={scale.id}
              style={cardStyle(isSelected, scale.compatibility_rating)}
              onClick={() => onScaleSelect(scale)}
            >
              {scale.is_primary && (
                <div style={primaryBadgeStyle}>★ PRIMARY</div>
              )}
              
              <div style={cardHeaderStyle}>
                <div style={scaleNameStyle}>
                  {scale.root_note} {scale.scale_mode_name}
                </div>
                <div style={ratingBadgeStyle(scale.compatibility_rating)}>
                  {scale.compatibility_rating}/10
                </div>
              </div>
              
              <div style={contextStyle}>
                {scale.musical_context}
              </div>
              
              <div style={tonesContainerStyle}>
                <div>
                  <div style={tonesTitleStyle}>Chord Tones</div>
                  <div style={tonesGridStyle}>
                    {scale.chord_tones.map((note, index) => (
                      <div key={`chord-${index}`} style={noteSquareStyle(note)}>
                        {getNoteDisplayName(note)}
                      </div>
                    ))}
                  </div>
                </div>

                {scale.guide_tones.length > 0 && (
                  <div>
                    <div style={tonesTitleStyle}>Guide Tones</div>
                    <div style={tonesGridStyle}>
                      {scale.guide_tones.map((note, index) => (
                        <div key={`guide-${index}`} style={noteSquareStyle(note)}>
                          {getNoteDisplayName(note)}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

