'use client';

/**
 * Chord Tones Tab - Replicates the chord tones UI from the frontpage
 * for use in the Song Progression Builder
 */

import React, { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { Info, ChevronDown } from 'lucide-react';
import ColorPicker from '@/components/ColorPicker';
import { NOTES, NOTE_COLORS, CHORD_TONE_COLORS, HIGHLIGHT_COLORS } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface ChordTonesTonesTabProps {
  theme: ThemeConfig;
  rootNote: string;
  scaleName: string;
  showChordTones: boolean;
  onShowChordTonesChange: (enabled: boolean) => void;
  chordHighlightColor: string;
  onChordHighlightColorChange: (color: string) => void;
  showGuideTones: boolean;
  guideTonesColor: string;
  onGuideTonesColorChange: (color: string) => void;
  showChordGlow: boolean;
  onShowChordGlowChange: (enabled: boolean) => void;
  showWhiteBorder: boolean;
  onShowWhiteBorderChange: (enabled: boolean) => void;
  glowOpacity: number;
  onGlowOpacityChange: (opacity: number) => void;
  colorGuideEnabled: boolean;
  onColorGuideEnabledChange: (enabled: boolean) => void;
  onlyChordTones: boolean;
  onOnlyChordTonesChange: (enabled: boolean) => void;
  getTonicChordTones: (rootNote: string, scaleName: string) => string[];
  selectedChordToneTypes?: ('root' | 'third' | 'fifth' | 'seventh')[];
  onSelectedChordToneTypesChange?: (types: ('root' | 'third' | 'fifth' | 'seventh')[]) => void;
}

export default function ChordTonesTab({
  theme,
  rootNote,
  scaleName,
  showChordTones,
  onShowChordTonesChange,
  chordHighlightColor,
  onChordHighlightColorChange,
  showGuideTones,
  guideTonesColor,
  onGuideTonesColorChange,
  showChordGlow,
  onShowChordGlowChange,
  showWhiteBorder,
  onShowWhiteBorderChange,
  glowOpacity,
  onGlowOpacityChange,
  colorGuideEnabled,
  onColorGuideEnabledChange,
  onlyChordTones,
  onOnlyChordTonesChange,
  getTonicChordTones,
  selectedChordToneTypes = ['root', 'third', 'fifth', 'seventh'],
  onSelectedChordToneTypesChange,
}: ChordTonesTonesTabProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Toggle individual chord tone type
  const toggleChordToneType = (type: 'root' | 'third' | 'fifth' | 'seventh') => {
    if (!onSelectedChordToneTypesChange) return;

    const isSelected = selectedChordToneTypes.includes(type);
    if (isSelected) {
      // Don't allow deselecting all tones
      if (selectedChordToneTypes.length === 1) return;
      onSelectedChordToneTypesChange(selectedChordToneTypes.filter(t => t !== type));
    } else {
      onSelectedChordToneTypesChange([...selectedChordToneTypes, type]);
    }
  };

  const displayChordNotes = getTonicChordTones(rootNote, scaleName);

  // Helper function to get chord tone color based on interval from root
  const getChordToneGlowColor = (note: string, index: number): string => {
    if (!colorGuideEnabled) return 'rgba(0,0,0,0.2)';

    const rootNoteValue = displayChordNotes[0];
    const rootIndex = NOTES.indexOf(rootNoteValue);
    const currentNoteIndex = NOTES.indexOf(note);

    if (rootIndex === -1 || currentNoteIndex === -1) {
      const colors = [CHORD_TONE_COLORS.root, CHORD_TONE_COLORS.third, CHORD_TONE_COLORS.fifth, CHORD_TONE_COLORS.seventh];
      return colors[index % 4];
    }

    const interval = (currentNoteIndex - rootIndex + 12) % 12;

    switch (interval) {
      case 0: return CHORD_TONE_COLORS.root;
      case 3:
      case 4: return CHORD_TONE_COLORS.third;
      case 6:
      case 7:
      case 8: return CHORD_TONE_COLORS.fifth;
      case 9:
      case 10:
      case 11: return CHORD_TONE_COLORS.seventh;
      default: {
        const colors = [CHORD_TONE_COLORS.root, CHORD_TONE_COLORS.third, CHORD_TONE_COLORS.fifth, CHORD_TONE_COLORS.seventh];
        return colors[index % 4];
      }
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6">
      <div
        className="px-4 py-3 rounded-lg"
        style={{
          background: theme.bgTertiary,
          border: `2px solid ${theme.border}`,
          width: 'fit-content',
          maxWidth: '400px',
        }}
      >
        {/* Header */}
        <div className="mb-3 pb-2 border-b flex items-center" style={{ borderColor: theme.border }}>
          <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
            Chord Tones
          </h3>

          {/* Controls next to title */}
          <div className="flex items-center gap-2 ml-2">
            <input
              type="checkbox"
              id="showChordTones"
              checked={showChordTones}
              onChange={(e) => onShowChordTonesChange(e.target.checked)}
              className="w-4 h-4 cursor-pointer"
            />

            {/* Only toggle */}
            <div className="flex items-center gap-1.5 ml-2 px-2 py-1 rounded-md" style={{ background: theme.bgSecondary }}>
              <input
                type="checkbox"
                id="onlyChordTones"
                checked={onlyChordTones}
                onChange={(e) => onOnlyChordTonesChange(e.target.checked)}
                className="w-3.5 h-3.5 cursor-pointer"
                disabled={!showChordTones}
              />
              <label
                htmlFor="onlyChordTones"
                className="text-xs font-medium cursor-pointer whitespace-nowrap"
                style={{ color: theme.textSecondary, opacity: showChordTones ? 1 : 0.5 }}
                title="Show only chord tones on the fretboard"
              >
                Only
              </label>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="min-w-[280px]">
          <div className="space-y-3">
            {/* Chord Tone Buttons */}
            <div>
              <div className="mb-3">
                <div className="flex gap-3 flex-wrap">
                  {displayChordNotes.map((note, idx) => {
                    const glowColor = getChordToneGlowColor(note, idx);
                    const labels = ['Root', '3rd', '5th', '7th'];
                    const label = labels[idx] || '';
                    const toneTypes: ('root' | 'third' | 'fifth' | 'seventh')[] = ['root', 'third', 'fifth', 'seventh'];
                    const toneType = toneTypes[idx];
                    const isSelected = selectedChordToneTypes.includes(toneType);

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <div
                          className="px-3 py-1.5 rounded-lg font-semibold text-sm transition-all cursor-pointer hover:scale-105"
                          onClick={() => toggleChordToneType(toneType)}
                          style={{
                            backgroundColor: NOTE_COLORS[note],
                            color: '#ffffff',
                            boxShadow: colorGuideEnabled
                              ? `0 0 0 3px ${glowColor}, 0 2px 4px rgba(0,0,0,0.2)`
                              : '0 2px 4px rgba(0,0,0,0.2)',
                            opacity: isSelected ? 1 : 0.4,
                            border: isSelected ? '2px solid rgba(255,255,255,0.5)' : '2px solid transparent',
                          }}
                          title={`Click to ${isSelected ? 'deselect' : 'select'} ${label}`}
                        >
                          {getNoteDisplayName(note)}
                        </div>
                        <div
                          className="text-xs font-medium"
                          style={{ color: theme.textSecondary }}
                        >
                          {label}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {showChordTones && (
                <>
                  {/* Collapsible Advanced Settings */}
                  <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.border }}>
                    <button
                      onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                      className="flex items-center gap-2 w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isAdvancedOpen ? 'rotate-180' : ''}`}
                        style={{ color: theme.textPrimary }}
                      />
                      <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                        Settings
                      </span>
                    </button>

                    {isAdvancedOpen && (
                      <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-medium whitespace-nowrap" style={{ color: theme.textSecondary }}>
                            Highlight Color:
                          </label>
                          <ColorPicker
                            colors={HIGHLIGHT_COLORS}
                            selectedColor={chordHighlightColor}
                            onColorChange={onChordHighlightColorChange}
                            disabledColor={showGuideTones ? guideTonesColor : undefined}
                            theme={theme}
                            disabled={colorGuideEnabled}
                            compact={true}
                          />
                        </div>

                        {/* Glow Checkbox */}
                        <div className="pt-3 border-t" style={{ borderColor: theme.border }}>
                          <div className="flex items-center gap-2 mb-2">
                            <label className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                              Show Glow:
                            </label>
                            <button
                              onClick={() => onShowChordGlowChange(!showChordGlow)}
                              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                              style={{
                                background: showChordGlow ? theme.buttonPrimary : theme.bgTertiary,
                                color: showChordGlow ? '#ffffff' : theme.textPrimary,
                                border: `2px solid ${showChordGlow ? theme.buttonPrimary : theme.border}`,
                              }}
                            >
                              {showChordGlow ? 'On' : 'Off'}
                            </button>

                            {/* White Border Checkbox */}
                            <label className="text-xs font-medium ml-2" style={{ color: theme.textPrimary }}>
                              White Border:
                            </label>
                            <button
                              onClick={() => onShowWhiteBorderChange(!showWhiteBorder)}
                              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                              style={{
                                background: showWhiteBorder ? theme.buttonPrimary : theme.bgTertiary,
                                color: showWhiteBorder ? '#ffffff' : theme.textPrimary,
                                border: `2px solid ${showWhiteBorder ? theme.buttonPrimary : theme.border}`,
                              }}
                            >
                              {showWhiteBorder ? 'On' : 'Off'}
                            </button>
                          </div>

                          {/* Glow Opacity Slider */}
                          {showChordGlow && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                                  Opacity:
                                </label>
                                <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                                  {glowOpacity}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={glowOpacity}
                                onChange={(e) => onGlowOpacityChange(parseInt(e.target.value))}
                                className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                                style={{
                                  background: `linear-gradient(to right, ${theme.buttonPrimary} 0%, ${theme.buttonPrimary} ${glowOpacity}%, ${theme.bgTertiary} ${glowOpacity}%, ${theme.bgTertiary} 100%)`,
                                }}
                              />
                            </div>
                          )}
                        </div>

                        {/* Color Guide Toggle */}
                        <div className="pt-3 border-t" style={{ borderColor: theme.border }}>
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                              Color Guide:
                            </label>
                            <button
                              onClick={() => onColorGuideEnabledChange(!colorGuideEnabled)}
                              className="px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                              style={{
                                background: colorGuideEnabled ? theme.buttonPrimary : theme.bgTertiary,
                                color: colorGuideEnabled ? '#ffffff' : theme.textPrimary,
                                border: `2px solid ${colorGuideEnabled ? theme.buttonPrimary : theme.border}`,
                              }}
                            >
                              {colorGuideEnabled ? 'On' : 'Off'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

