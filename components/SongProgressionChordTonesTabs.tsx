'use client';

import React, { useState, useRef, useLayoutEffect, useCallback } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { Info, ChevronRight, ChevronDown, Music } from 'lucide-react';
import { SliderResetButton } from '@/components/shared/SliderResetButton';
import ManualSelectionList, { ManualSelection } from './ManualSelectionList';
import ColorPicker from './ColorPicker';
import { NOTES, NOTE_COLORS, CHORD_TONE_COLORS, HIGHLIGHT_COLORS, ALL_INTERVAL_COLORS, INTERVAL_NAMES, getScaleNotes } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface SongProgressionChordTonesTabsProps {
  theme: ThemeConfig;
  // Song Progression props
  manualSelections: ManualSelection[];
  currentSelectionIndex: number;
  onSelectFromList?: (index: number) => void;
  onRemoveFromList?: (index: number) => void;
  onMoveSelectionUp?: (index: number) => void;
  onMoveSelectionDown?: (index: number) => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  onClearAllSelections?: () => void;
  // Chord Tones props
  rootNote: string;
  scaleName: string;
  selectedChordNotes: string[] | null;
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
  onShowWhiteBorderChange?: (enabled: boolean) => void;
  glowOpacity: number;
  onGlowOpacityChange?: (opacity: number) => void;
  colorGuideEnabled: boolean;
  onColorGuideEnabledChange: (enabled: boolean) => void;
  onlyChordTones: boolean;
  onOnlyChordTonesChange?: (enabled: boolean) => void;
  onShowChordToneInfo: () => void;
  getTonicChordTones: (rootNote: string, scaleName: string) => string[];
  // Individual chord tone selection
  selectedChordToneTypes?: ('root' | 'third' | 'fifth' | 'seventh')[];
  onSelectedChordToneTypesChange?: (types: ('root' | 'third' | 'fifth' | 'seventh')[]) => void;
  // All Intervals mode
  allIntervalsMode?: boolean;
  onAllIntervalsModeChange?: (enabled: boolean) => void;
  selectedIntervalDegrees?: number[];
  onSelectedIntervalDegreesChange?: (degrees: number[]) => void;
  // Recommended Progressions (external state lifted to page level)
  progressionsOpen?: boolean;
  onProgressionsOpenChange?: (open: boolean) => void;
}

// Guide data for chord tone usage tips
const CHORD_TONE_GUIDE = [
  {
    label: 'Root',
    degree: '1',
    color: CHORD_TONE_COLORS.root,
    tip: 'Home base. Open or close a riff here — landing on the root feels conclusive. Hit it on beat 1 or at phrase ends to anchor the listener. Great for resolving tension, but avoid camping here mid-phrase or your line sounds static.',
    best: ['Opens/ends riff', 'Beat 1 anchor', 'After tension', 'Resolves phrase', 'Return home'],
  },
  {
    label: '3rd',
    degree: '3',
    color: CHORD_TONE_COLORS.third,
    tip: 'The emotion tone. Bend into it for expressive peaks — the major 3rd feels bright and triumphant, the minor 3rd dark and soulful. Use as a sustained melody target or the highest note of a lick to lock in the chord\'s feel.',
    best: ['Bend into for feel', 'Melody peak target', 'Sustain for mood', 'Solo high point', 'Major/minor color'],
  },
  {
    label: '5th',
    degree: '5',
    color: CHORD_TONE_COLORS.fifth,
    tip: 'Neutral and stable — almost never wrong. Pair with the root for driving power riffs. Use as a safe bridge between root and 3rd when navigating a line. Great neutral landing when you\'re between targets in a fast run.',
    best: ['Root+5th riff base', 'Safe neutral fill', 'Bridge in fast run', 'Rhythm chord base', 'Between targets'],
  },
  {
    label: '7th',
    degree: '7',
    color: CHORD_TONE_COLORS.seventh,
    tip: 'Creates tension that demands resolution. Use before a chord change to build anticipation, or at a phrase peak. Lead from the 7th down into the root or 3rd for a powerful resolution — this push-pull is the core of jazz and blues phrasing.',
    best: ['Pre-change tension', '→ Root/3rd resolve', 'Jazz phrase peak', 'Blues b7 color', 'Phrase climax'],
  },
];

export default function SongProgressionChordTonesTabs({
  theme,
  manualSelections,
  currentSelectionIndex,
  onSelectFromList,
  onRemoveFromList,
  onMoveSelectionUp,
  onMoveSelectionDown,
  onNavigatePrevious,
  onNavigateNext,
  onClearAllSelections,
  rootNote,
  scaleName,
  selectedChordNotes,
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
  onShowChordToneInfo,
  getTonicChordTones,
  selectedChordToneTypes = ['root', 'third', 'fifth', 'seventh'],
  onSelectedChordToneTypesChange,
  allIntervalsMode = false,
  onAllIntervalsModeChange,
  selectedIntervalDegrees = [0, 1, 2, 3, 4, 5, 6],
  onSelectedIntervalDegreesChange,
  progressionsOpen = false,
  onProgressionsOpenChange,
}: SongProgressionChordTonesTabsProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [guideOpen, setGuideOpen] = useState(false);
  const [glowSettingsOpen, setGlowSettingsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic guide panel positioning — uses fixed positioning to escape any parent overflow clip
  const [guideRect, setGuideRect] = useState<{ left: number; bottom: number; width: number; maxHeight: number } | null>(null);

  const computeGuideRect = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const panelLeft = rect.right + 8;

    // Align right edge with fretboard right edge so the panel never exceeds fretboard width
    let rightEdge = window.innerWidth - 24;
    const fretboardEl = document.querySelector('[data-guide="fretboard"]');
    if (fretboardEl) {
      const fr = fretboardEl.getBoundingClientRect();
      if (fr.right > panelLeft) rightEdge = fr.right;
    }

    const panelWidth = Math.max(400, rightEdge - panelLeft);
    // Bottom: distance from bottom of chord tones card to viewport bottom (aligns panel bottom with card bottom)
    const panelBottom = window.innerHeight - rect.bottom;
    // maxHeight: panel can grow upward to just below the viewport top (logo/header area)
    const maxHeight = Math.max(200, rect.bottom - 8);

    setGuideRect({ left: panelLeft, bottom: panelBottom, width: panelWidth, maxHeight });
  }, []);

  useLayoutEffect(() => {
    if (!guideOpen) { setGuideRect(null); return; }
    computeGuideRect();
    window.addEventListener('resize', computeGuideRect);
    window.addEventListener('scroll', computeGuideRect, true);
    return () => {
      window.removeEventListener('resize', computeGuideRect);
      window.removeEventListener('scroll', computeGuideRect, true);
    };
  }, [guideOpen, computeGuideRect]);

  // Toggle individual chord tone type
  const toggleChordToneType = (type: 'root' | 'third' | 'fifth' | 'seventh') => {
    if (!onSelectedChordToneTypesChange) return;
    const isSelected = selectedChordToneTypes.includes(type);
    if (isSelected) {
      if (selectedChordToneTypes.length === 1) return;
      onSelectedChordToneTypesChange(selectedChordToneTypes.filter(t => t !== type));
    } else {
      onSelectedChordToneTypesChange([...selectedChordToneTypes, type]);
    }
  };

  // Toggle individual interval degree
  const toggleIntervalDegree = (degree: number) => {
    if (!onSelectedIntervalDegreesChange) return;
    const isSelected = selectedIntervalDegrees.includes(degree);
    if (isSelected) {
      if (selectedIntervalDegrees.length === 1) return;
      onSelectedIntervalDegreesChange(selectedIntervalDegrees.filter(d => d !== degree));
    } else {
      onSelectedIntervalDegreesChange([...selectedIntervalDegrees, degree].sort((a, b) => a - b));
    }
  };

  return (
    <div ref={containerRef} className="relative" style={{ width: 'fit-content' }}>
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
      <div className="mb-3 pb-2 border-b flex items-center gap-2" style={{ borderColor: theme.border }}>
        {/* Mode Toggle: Chord Tones ↔ All Intervals */}
        <div
          className="flex rounded-md overflow-hidden"
          style={{ border: `1px solid ${theme.border}` }}
        >
          <button
            onClick={() => onAllIntervalsModeChange?.(false)}
            className="px-2 py-0.5 text-xs font-semibold transition-all whitespace-nowrap"
            style={{
              background: !allIntervalsMode ? theme.accentPrimary : 'transparent',
              color: !allIntervalsMode ? '#ffffff' : theme.textSecondary,
            }}
          >
            Chord Tones
          </button>
          <button
            onClick={() => onAllIntervalsModeChange?.(true)}
            className="px-2 py-0.5 text-xs font-semibold transition-all whitespace-nowrap"
            style={{
              background: allIntervalsMode ? theme.accentPrimary : 'transparent',
              color: allIntervalsMode ? '#ffffff' : theme.textSecondary,
            }}
          >
            All Intervals
          </button>
        </div>

        {/* Enable/Disable Checkbox */}
        <input
          type="checkbox"
          id="showChordTones"
          checked={showChordTones}
          onChange={(e) => onShowChordTonesChange(e.target.checked)}
          className="w-4 h-4 cursor-pointer flex-shrink-0"
          title="Enable/disable chord tones on fretboard"
        />

        {/* Only toggle (chord tones mode only) */}
        {!allIntervalsMode && (
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{ background: theme.bgSecondary }}>
            <input
              type="checkbox"
              id="onlyChordTones"
              checked={onlyChordTones}
              onChange={(e) => onOnlyChordTonesChange?.(e.target.checked)}
              className="w-3 h-3 cursor-pointer"
              disabled={!showChordTones}
            />
            <label
              htmlFor="onlyChordTones"
              className="text-xs cursor-pointer whitespace-nowrap"
              style={{ color: theme.textSecondary, opacity: showChordTones ? 1 : 0.5 }}
              title="Show only chord tones on the fretboard"
            >
              Only
            </label>
          </div>
        )}

        {/* (i) Info button — same toggle behaviour as the guide arrow */}
        {!allIntervalsMode && (
          <button
            onClick={() => {
              if (guideOpen) {
                setGuideOpen(false);
                onProgressionsOpenChange?.(false);
              } else {
                setGuideOpen(true);
              }
            }}
            className="p-0.5 rounded-full hover:scale-110 transition-all flex-shrink-0 ml-auto"
            style={{
              color: guideOpen ? theme.accentPrimary : theme.textSecondary,
              background: guideOpen ? `${theme.accentPrimary}20` : 'transparent',
            }}
            title={guideOpen ? 'Collapse chord tone guide' : 'Show chord tone usage guide'}
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Guide toggle arrow — collapses/expands when guide is visible */}
        <button
          onClick={() => {
            if (guideOpen) {
              setGuideOpen(false);
              onProgressionsOpenChange?.(false);
            } else {
              setGuideOpen(true);
            }
          }}
          className="p-0.5 rounded-full hover:scale-110 transition-all flex-shrink-0"
          style={{
            color: guideOpen ? theme.accentPrimary : theme.textSecondary,
            background: guideOpen ? `${theme.accentPrimary}20` : 'transparent',
            marginLeft: allIntervalsMode ? 'auto' : undefined,
          }}
          title={guideOpen ? 'Collapse chord tone guide' : 'Show chord tone usage guide'}
        >
          <ChevronRight className={`w-4 h-4 transition-transform ${guideOpen ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="min-w-[280px]">
        <div className="space-y-3" data-guide="chord-tones">
          {allIntervalsMode ? (
            /* ── ALL INTERVALS MODE ── */
            (() => {
              const scaleNotes = getScaleNotes(rootNote, scaleName);
              const rootIdx = NOTES.indexOf(scaleNotes[0]);

              return (
                <div>
                  {/* Interval chips + Settings toggle on the same row */}
                  <div className="flex items-end gap-2 flex-wrap">
                    <div className="flex gap-2 flex-wrap">
                      {scaleNotes.map((note, idx) => {
                        const noteIdx = NOTES.indexOf(note);
                        const semitone = rootIdx !== -1 && noteIdx !== -1
                          ? (noteIdx - rootIdx + 12) % 12
                          : idx;
                        const intervalColor = ALL_INTERVAL_COLORS[semitone] ?? '#6b7280';
                        const intervalLabel = INTERVAL_NAMES[semitone] ?? String(idx + 1);
                        const isSelected = selectedIntervalDegrees.includes(idx);

                        return (
                          <div key={idx} className="flex flex-col items-center gap-1">
                            <div
                              className="w-11 py-1 rounded-lg font-semibold text-xs transition-all cursor-pointer hover:scale-105 text-center"
                              onClick={() => toggleIntervalDegree(idx)}
                              style={{
                                backgroundColor: NOTE_COLORS[note] || intervalColor,
                                color: '#ffffff',
                                boxShadow: isSelected
                                  ? `0 0 0 3px ${intervalColor}, 0 2px 4px rgba(0,0,0,0.2)`
                                  : '0 2px 4px rgba(0,0,0,0.2)',
                                opacity: isSelected ? 1 : 0.35,
                                border: isSelected ? `2px solid ${intervalColor}` : '2px solid transparent',
                              }}
                              title={`Click to ${isSelected ? 'hide' : 'show'} ${intervalLabel} on fretboard`}
                            >
                              {getNoteDisplayName(note)}
                            </div>
                            <span className="text-xs font-bold" style={{ color: intervalColor }}>
                              {intervalLabel}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Settings toggle — inline with chips, right-aligned */}
                    <button
                      onClick={() => setGlowSettingsOpen((v) => !v)}
                      className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity ml-auto flex-shrink-0"
                      style={{
                        color: glowSettingsOpen ? theme.accentPrimary : theme.textSecondary,
                        paddingBottom: 4,
                      }}
                      title="Toggle visual settings"
                    >
                      <ChevronDown
                        className="w-3.5 h-3.5 transition-transform flex-shrink-0"
                        style={{ transform: glowSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                      Settings
                    </button>
                  </div>

                  <p className="text-xs mt-1" style={{ color: theme.textSecondary }}>
                    Click any interval to show/hide on fretboard
                  </p>

                  {/* Expanded settings panel */}
                  {glowSettingsOpen && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: theme.border }}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-xs font-medium whitespace-nowrap" style={{ color: theme.textSecondary }}>Glow:</label>
                        <button
                          onClick={() => onShowChordGlowChange(!showChordGlow)}
                          className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors"
                          style={{
                            background: showChordGlow ? theme.buttonPrimary : theme.bgSecondary,
                            color: showChordGlow ? '#ffffff' : theme.textPrimary,
                            border: `1px solid ${showChordGlow ? theme.buttonPrimary : theme.border}`,
                          }}
                        >
                          {showChordGlow ? 'On' : 'Off'}
                        </button>
                        <label className="text-xs font-medium whitespace-nowrap ml-1" style={{ color: theme.textSecondary }}>W.Border:</label>
                        <button
                          onClick={() => onShowWhiteBorderChange?.(!showWhiteBorder)}
                          className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors"
                          style={{
                            background: showWhiteBorder ? theme.buttonPrimary : theme.bgSecondary,
                            color: showWhiteBorder ? '#ffffff' : theme.textPrimary,
                            border: `1px solid ${showWhiteBorder ? theme.buttonPrimary : theme.border}`,
                          }}
                        >
                          {showWhiteBorder ? 'On' : 'Off'}
                        </button>
                      </div>
                      {showChordGlow && onGlowOpacityChange && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <label className="text-xs font-medium whitespace-nowrap" style={{ color: theme.textSecondary }}>
                              Opacity: <span style={{ color: theme.textPrimary }}>{glowOpacity}%</span>
                            </label>
                            <SliderResetButton onReset={() => onGlowOpacityChange(40)} theme={theme} label="Reset opacity to 40%" />
                          </div>
                          <input
                            type="range" min="0" max="100" value={glowOpacity}
                            onChange={(e) => onGlowOpacityChange(parseInt(e.target.value))}
                            className="h-2 rounded-lg appearance-none cursor-pointer flex-none"
                            style={{ width: '55%', background: `linear-gradient(to right, ${theme.buttonPrimary} 0%, ${theme.buttonPrimary} ${glowOpacity}%, ${theme.bgSecondary} ${glowOpacity}%, ${theme.bgSecondary} 100%)` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          ) : (
            /* ── CHORD TONES MODE ── */
            (() => {
              const displayChordNotes = getTonicChordTones(rootNote, scaleName);

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
                  case 3: case 4: return CHORD_TONE_COLORS.third;
                  case 6: case 7: case 8: return CHORD_TONE_COLORS.fifth;
                  case 9: case 10: case 11: return CHORD_TONE_COLORS.seventh;
                  default: {
                    const colors = [CHORD_TONE_COLORS.root, CHORD_TONE_COLORS.third, CHORD_TONE_COLORS.fifth, CHORD_TONE_COLORS.seventh];
                    return colors[index % 4];
                  }
                }
              };

              return (
                <div>
                  {/* Note squares + Visual Settings toggle on the same row */}
                  <div className="flex items-end gap-3 flex-wrap">
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
                            <div className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                              {label}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Visual Settings toggle — inline with note squares, right-aligned */}
                    <button
                      onClick={() => setGlowSettingsOpen((v) => !v)}
                      className="flex items-center gap-1 text-xs font-medium hover:opacity-80 transition-opacity ml-auto flex-shrink-0"
                      style={{
                        color: glowSettingsOpen ? theme.accentPrimary : theme.textSecondary,
                        paddingBottom: 4,
                      }}
                      title="Toggle visual settings"
                    >
                      <ChevronDown
                        className="w-3.5 h-3.5 transition-transform flex-shrink-0"
                        style={{ transform: glowSettingsOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      />
                      Settings
                    </button>
                  </div>

                  {/* Expanded settings panel — shown below the note squares row */}
                  {glowSettingsOpen && (
                    <div className="mt-2 pt-2 border-t" style={{ borderColor: theme.border }}>
                      {/* Row 1: Glow toggles + Color Guide + Highlight Color */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="text-xs font-medium whitespace-nowrap" style={{ color: theme.textSecondary }}>Glow:</label>
                        <button
                          onClick={() => onShowChordGlowChange(!showChordGlow)}
                          className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors"
                          style={{
                            background: showChordGlow ? theme.buttonPrimary : theme.bgSecondary,
                            color: showChordGlow ? '#ffffff' : theme.textPrimary,
                            border: `1px solid ${showChordGlow ? theme.buttonPrimary : theme.border}`,
                          }}
                        >
                          {showChordGlow ? 'On' : 'Off'}
                        </button>

                        <label className="text-xs font-medium whitespace-nowrap ml-1" style={{ color: theme.textSecondary }}>W.Border:</label>
                        <button
                          onClick={() => onShowWhiteBorderChange?.(!showWhiteBorder)}
                          className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors"
                          style={{
                            background: showWhiteBorder ? theme.buttonPrimary : theme.bgSecondary,
                            color: showWhiteBorder ? '#ffffff' : theme.textPrimary,
                            border: `1px solid ${showWhiteBorder ? theme.buttonPrimary : theme.border}`,
                          }}
                        >
                          {showWhiteBorder ? 'On' : 'Off'}
                        </button>

                        <label className="text-xs font-medium whitespace-nowrap ml-1" style={{ color: theme.textSecondary }}>Color:</label>
                        <button
                          onClick={() => onColorGuideEnabledChange(!colorGuideEnabled)}
                          className="px-2.5 py-0.5 rounded text-xs font-medium transition-colors"
                          style={{
                            background: colorGuideEnabled ? theme.buttonPrimary : theme.bgSecondary,
                            color: colorGuideEnabled ? '#ffffff' : theme.textPrimary,
                            border: `1px solid ${colorGuideEnabled ? theme.buttonPrimary : theme.border}`,
                          }}
                        >
                          {colorGuideEnabled ? 'On' : 'Off'}
                        </button>

                        {/* Highlight Color picker — disabled when color guide is on */}
                        <div className="ml-1">
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
                      </div>

                      {/* Row 2: Opacity slider (shown when glow is on) */}
                      {showChordGlow && onGlowOpacityChange && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1">
                            <label className="text-xs font-medium whitespace-nowrap" style={{ color: theme.textSecondary }}>
                              Opacity: <span style={{ color: theme.textPrimary }}>{glowOpacity}%</span>
                            </label>
                            <SliderResetButton onReset={() => onGlowOpacityChange(40)} theme={theme} label="Reset opacity to 40%" />
                          </div>
                          <input
                            type="range" min="0" max="100" value={glowOpacity}
                            onChange={(e) => onGlowOpacityChange(parseInt(e.target.value))}
                            className="h-2 rounded-lg appearance-none cursor-pointer flex-none"
                            style={{ width: '55%', background: `linear-gradient(to right, ${theme.buttonPrimary} 0%, ${theme.buttonPrimary} ${glowOpacity}%, ${theme.bgSecondary} ${glowOpacity}%, ${theme.bgSecondary} 100%)` }}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      </div>
      </div>

      {/* Guide Panel — fixed positioned to escape parent overflow, spans to fretboard right edge */}
      {guideOpen && guideRect && (
        <div
          className="z-50 shadow-xl flex flex-col"
          style={{
            position: 'fixed',
            left: `${guideRect.left}px`,
            bottom: `${guideRect.bottom}px`,
            width: `${guideRect.width}px`,
            maxHeight: `${guideRect.maxHeight}px`,
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          {/* Guide Header */}
          <div
            className="flex items-center justify-between px-3 pt-3 pb-2 border-b flex-shrink-0"
            style={{ borderColor: theme.border, borderRadius: '12px 12px 0 0', background: theme.bgSecondary }}
          >
            <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>
              When to Use Each Chord Tone
            </p>
            {/* Recommended Progressions toggle button — shows carousel below HarmonizationTabs */}
            <button
              onClick={() => onProgressionsOpenChange?.(!progressionsOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
              style={{
                background: progressionsOpen
                  ? `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentPrimary}cc)`
                  : theme.bgSecondary,
                color: progressionsOpen ? '#fff' : theme.textPrimary,
                border: `1px solid ${progressionsOpen ? theme.accentPrimary : theme.border}`,
              }}
              title={progressionsOpen ? 'Hide recommended progressions' : 'Show recommended progressions below harmonization section'}
            >
              <Music className="w-3 h-3" />
              Recommended Progressions
            </button>
          </div>

          {/* Chord Tone Cards - scrollable so content fits within maxHeight */}
          <div className="flex gap-2 p-3 overflow-y-auto flex-1">
            {CHORD_TONE_GUIDE.map((item) => (
              <div
                key={item.label}
                className="rounded-md p-2 flex-1"
                style={{ background: theme.bgTertiary, borderTop: `3px solid ${item.color}` }}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span
                    className="text-xs font-bold px-1.5 py-0.5 rounded"
                    style={{ background: item.color, color: '#fff' }}
                  >
                    {item.degree}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                    {item.label}
                  </span>
                </div>
                <p className="text-xs leading-snug mb-2" style={{ color: theme.textSecondary }}>
                  {item.tip}
                </p>
                {/* Best-use tags */}
                <div className="flex flex-wrap gap-1">
                  {item.best.map((b) => (
                    <span
                      key={b}
                      className="text-xs font-medium px-1.5 py-0.5 rounded"
                      style={{
                        background: `${item.color}20`,
                        color: item.color,
                        fontSize: '10px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

