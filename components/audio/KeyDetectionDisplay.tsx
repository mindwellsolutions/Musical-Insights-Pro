'use client';

/**
 * Key Detection Display Component
 * Shows detected musical key and current scale with chord tones and guide tones
 * Matches the visual style from ChordLibrary cards
 */

import React from 'react';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface KeyDetectionDisplayProps {
  detectedKey: string | null;
  confidence: number;
  currentScale: string;
  currentScaleRoot: string;
  chordTones: string[];
  guideTones: string[];
  theme: 'dark' | 'light';
  isListening?: boolean;
  bufferDuration?: number;
  autoRecommendation?: boolean;
  autoSwitchFretboard?: boolean;
  onAutoRecommendationChange?: (enabled: boolean) => void;
  onAutoSwitchFretboardChange?: (enabled: boolean) => void;
}

export default function KeyDetectionDisplay({
  detectedKey,
  confidence,
  currentScale,
  currentScaleRoot,
  chordTones,
  guideTones,
  theme,
  isListening = false,
  bufferDuration = 15,
  autoRecommendation = false,
  autoSwitchFretboard = false,
  onAutoRecommendationChange,
  onAutoSwitchFretboardChange,
}: KeyDetectionDisplayProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const isDark = theme === 'dark';
  
  const containerStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    border: `2px solid ${isDark ? '#333' : '#e0e0e0'}`,
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  };
  
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '16px',
  };
  
  const detectedKeyStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  };
  
  const labelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: isDark ? '#888' : '#666',
  };
  
  const keyNameStyle: React.CSSProperties = {
    fontSize: '36px',
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#000000',
  };
  
  const confidenceStyle: React.CSSProperties = {
    fontSize: '14px',
    color: isDark ? '#aaa' : '#666',
  };
  
  const scaleInfoStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'right',
  };
  
  const scaleNameStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: isDark ? '#ffffff' : '#000000',
  };
  
  const tonesContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginTop: '20px',
  };
  
  const tonesSectionStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  };
  
  const tonesTitleStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: isDark ? '#888' : '#666',
  };
  
  const tonesGridStyle: React.CSSProperties = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  };
  
  const noteSquareStyle = (note: string): React.CSSProperties => ({
    padding: '12px 16px',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
    backgroundColor: NOTE_COLORS[note] || '#666',
    color: '#ffffff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    minWidth: '50px',
    textAlign: 'center',
  });

  const switchContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: `1px solid ${isDark ? '#333' : '#e0e0e0'}`,
  };

  const switchRowStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  };

  const switchLabelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '600',
    color: isDark ? '#ffffff' : '#000000',
  };

  const switchStyle: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: '50px',
    height: '24px',
  };

  const switchInputStyle: React.CSSProperties = {
    opacity: 0,
    width: 0,
    height: 0,
  };

  const sliderStyle = (checked: boolean): React.CSSProperties => ({
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: checked ? '#4CAF50' : (isDark ? '#555' : '#ccc'),
    transition: '0.4s',
    borderRadius: '24px',
  });

  const sliderButtonStyle = (checked: boolean): React.CSSProperties => ({
    position: 'absolute',
    content: '',
    height: '18px',
    width: '18px',
    left: checked ? '28px' : '3px',
    bottom: '3px',
    backgroundColor: 'white',
    transition: '0.4s',
    borderRadius: '50%',
  });
  
  const noDataStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px',
    color: isDark ? '#666' : '#999',
    fontSize: '16px',
  };
  
  // Format detected key to capitalize properly (e.g., "C major" -> "C Major")
  const formatDetectedKey = (key: string | null): string => {
    if (!key) return 'Analyzing...';

    // Split the key into parts (e.g., "C major" -> ["C", "major"])
    const parts = key.split(' ');
    if (parts.length >= 2) {
      // Capitalize the quality (major/minor)
      const note = parts[0];
      const quality = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${note} ${quality}`;
    }
    return key;
  };

  const displayKey = formatDetectedKey(detectedKey);
  const showAnalyzing = isListening && !detectedKey;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <div style={detectedKeyStyle}>
          <div style={labelStyle}>
            Detected Key
            {isListening && detectedKey && (
              <span style={{ marginLeft: '8px', fontSize: '10px', opacity: 0.7 }}>
                🎧 Listening...
              </span>
            )}
          </div>
          <div style={keyNameStyle}>
            {showAnalyzing ? (
              <span style={{ fontSize: '24px', opacity: 0.7 }}>Analyzing...</span>
            ) : (
              displayKey
            )}
          </div>
          {detectedKey && (
            <div style={confidenceStyle}>
              Confidence: {(confidence * 100).toFixed(0)}%
            </div>
          )}
        </div>
        
        <div style={scaleInfoStyle}>
          <div style={labelStyle}>Current Scale/Mode</div>
          <div style={scaleNameStyle}>
            {currentScaleRoot.replace('#', '♯')} {currentScale}
          </div>
        </div>
      </div>
      
      <div style={tonesContainerStyle}>
        <div style={tonesSectionStyle}>
          <div style={tonesTitleStyle}>Chord Tones</div>
          <div style={tonesGridStyle}>
            {chordTones.map((note, index) => (
              <div key={`chord-${index}`} style={noteSquareStyle(note)}>
                {getNoteDisplayName(note)}
              </div>
            ))}
          </div>
        </div>

        <div style={tonesSectionStyle}>
          <div style={tonesTitleStyle}>Guide Tones</div>
          <div style={tonesGridStyle}>
            {guideTones.map((note, index) => (
              <div key={`guide-${index}`} style={noteSquareStyle(note)}>
                {getNoteDisplayName(note)}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Auto Recommendation Switches */}
      {detectedKey && (
        <div style={switchContainerStyle}>
          <div style={switchRowStyle}>
            <div style={switchLabelStyle}>Auto Recommendation</div>
            <label style={switchStyle}>
              <input
                type="checkbox"
                checked={autoRecommendation}
                onChange={(e) => onAutoRecommendationChange?.(e.target.checked)}
                style={switchInputStyle}
              />
              <span style={sliderStyle(autoRecommendation)}>
                <span style={sliderButtonStyle(autoRecommendation)} />
              </span>
            </label>
          </div>

          <div style={switchRowStyle}>
            <div style={switchLabelStyle}>Auto Switch Fretboard</div>
            <label style={switchStyle}>
              <input
                type="checkbox"
                checked={autoSwitchFretboard}
                onChange={(e) => onAutoSwitchFretboardChange?.(e.target.checked)}
                disabled={!autoRecommendation}
                style={switchInputStyle}
              />
              <span style={sliderStyle(autoSwitchFretboard && autoRecommendation)}>
                <span style={sliderButtonStyle(autoSwitchFretboard && autoRecommendation)} />
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}

