'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { ChevronRight, ChevronLeft, ChevronDown, Music, Palette, HelpCircle, Guitar, FlipVertical, Settings, Hash, X } from 'lucide-react';
import KeyDetectionPanel from './audio/KeyDetectionPanel';
import MIDIPedalStatus from './midi/MIDIPedalStatus';
import { NoteDetectorSidebar } from './audio/NoteDetectorSidebar';
import { ThemeConfig, Theme, themes, FretboardTheme, fretboardThemes } from '@/lib/themes';
import { ScaleCompatibilityRating } from '@/lib/musicalCompatibility';
import SkillLevelSelector, { SkillLevel } from '@/components/shared/SkillLevelSelector';
import { useSharedSkillLevel } from '@/hooks/useSharedSkillLevel';
import { TUNINGS } from '@/lib/musicTheory';
import { useNoteNotation } from '@/contexts/NoteNotationContext';

interface AudioSidebarProps {
  theme: ThemeConfig;
  currentTheme: 'dark' | 'light' | 'midnight';
  onThemeChange: (theme: Theme) => void;
  autoRecommendation?: boolean;
  autoSwitchFretboard?: boolean;
  onScaleChange?: (rootNote: string, scaleName: string, chordTones: string[], guideTones: string[]) => void;
  onDetectedKeyChange?: (key: string | null, confidence: number, isListening: boolean) => void;
  onCompatibleScalesChange?: (scales: ScaleCompatibilityRating[]) => void;
  onSelectedScaleChange?: (scale: ScaleCompatibilityRating | null) => void;
  onDetectionStateChange?: (isDetecting: boolean) => void;
  onStartDetectionReady?: (startFn: () => Promise<void>) => void;
  onStopDetectionReady?: (stopFn: () => Promise<void>) => void;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  showGuideAtStart?: boolean;
  onShowGuideAtStartChange?: (show: boolean) => void;
  onShowGuide?: () => void;
  circleOf5thsPosition?: 'left' | 'right' | 'below';
  onCircleOf5thsPositionChange?: (position: 'left' | 'right' | 'below') => void;
  fretboardTheme?: FretboardTheme;
  onFretboardThemeChange?: (theme: FretboardTheme) => void;
  noteDetectorEnabled?: boolean;
  onDetectedNoteChange?: (note: string | null, frequency: number | null) => void;
  liveNotesGlowEnabled?: boolean;
  onLiveNotesGlowChange?: (enabled: boolean) => void;
  liveNotesGlowDuration?: number;
  onLiveNotesGlowDurationChange?: (duration: number) => void;
  circleOf5thsGlowDuration?: number;
  onCircleOf5thsGlowDurationChange?: (duration: number) => void;
  // Fretboard settings props
  stringCount?: 6 | 7;
  onStringCountChange?: (count: 6 | 7) => void;
  tuningName?: string;
  onTuningChange?: (tuning: string) => void;
  isInverted?: boolean;
  onInvertToggle?: () => void;
  fretDotColor?: string;
  onFretDotColorChange?: (color: string) => void;
  showMiddleDots?: boolean;
  onShowMiddleDotsChange?: (show: boolean) => void;
  fretCount?: number;
  onFretCountChange?: (count: number) => void;
  showColorfulStrings?: boolean;
  onShowColorfulStringsChange?: (show: boolean) => void;
  stringBrightness?: number;
  onStringBrightnessChange?: (brightness: number) => void;
  hideToggleButton?: boolean;
}

export function AudioSidebar({
  theme,
  currentTheme,
  onThemeChange,
  autoRecommendation,
  autoSwitchFretboard,
  onScaleChange,
  onDetectedKeyChange,
  onCompatibleScalesChange,
  onSelectedScaleChange,
  onDetectionStateChange,
  onStartDetectionReady,
  onStopDetectionReady,
  isExpanded: externalIsExpanded,
  onToggleExpanded,
  showGuideAtStart,
  onShowGuideAtStartChange,
  onShowGuide,
  circleOf5thsPosition = 'left',
  onCircleOf5thsPositionChange,
  fretboardTheme = 'classic',
  onFretboardThemeChange,
  noteDetectorEnabled = false,
  onDetectedNoteChange,
  liveNotesGlowEnabled = false,
  onLiveNotesGlowChange,
  liveNotesGlowDuration = 1000,
  onLiveNotesGlowDurationChange,
  circleOf5thsGlowDuration = 1000,
  onCircleOf5thsGlowDurationChange,
  stringCount = 6,
  onStringCountChange,
  tuningName = 'Standard',
  onTuningChange,
  isInverted = false,
  onInvertToggle,
  fretDotColor,
  onFretDotColorChange,
  showMiddleDots = false,
  onShowMiddleDotsChange,
  fretCount = 24,
  onFretCountChange,
  showColorfulStrings = false,
  onShowColorfulStringsChange,
  stringBrightness = 100,
  onStringBrightnessChange,
  hideToggleButton = false,
}: AudioSidebarProps) {
  // Shared skill level state - synced with AI Assistant and Compatible Scales
  const [skillLevel, setSkillLevel] = useSharedSkillLevel();
  const [internalIsExpanded, setInternalIsExpanded] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [isFretboardThemeDropdownOpen, setIsFretboardThemeDropdownOpen] = useState(false);
  const [isFretDotsOpen, setIsFretDotsOpen] = useState(false);
  const [isBrightnessExpanded, setIsBrightnessExpanded] = useState(false);
  const fretDotsRef = useRef<HTMLDivElement>(null);
  const themeKeys = Object.keys(themes) as Theme[];
  const fretboardThemeKeys = Object.keys(fretboardThemes) as FretboardTheme[];
  const { notation, toggleNotation } = useNoteNotation();

  // Get available tunings based on string count
  const availableTunings = stringCount ? Object.keys(TUNINGS[stringCount]) : [];

  // Fret dot color options
  const fretDotColors = [
    { name: 'Default', value: theme.fretMarker },
    { name: 'White', value: '#ffffff' },
    { name: 'Yellow', value: '#fbbf24' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Hot Pink', value: '#ec4899' },
    { name: 'Lime', value: '#84cc16' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Emerald', value: '#10b981' },
  ];

  // Close fret dots dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fretDotsRef.current && !fretDotsRef.current.contains(event.target as Node)) {
        setIsFretDotsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Use external state if provided, otherwise use internal state
  const isExpanded = externalIsExpanded !== undefined ? externalIsExpanded : internalIsExpanded;
  const toggleExpanded = onToggleExpanded || (() => setInternalIsExpanded(!internalIsExpanded));

  return (
    <>
      {/* Overlay when sidebar is open */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30"
          style={{ zIndex: 38 }}
          onClick={toggleExpanded}
        />
      )}

      {/* Floating Pill Toggle Button — hidden when hideToggleButton is true */}
      {!hideToggleButton && (
        <button
          onClick={toggleExpanded}
          aria-label={isExpanded ? 'Close settings' : 'Open app settings'}
          style={{
            position: 'fixed',
            bottom: 24,
            left: isExpanded ? 384 + 16 : 64,
            transition: 'left var(--mi-transition-slide)',
            zIndex: 45,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '0 16px',
            height: 36,
            borderRadius: 'var(--mi-radius-full)',
            background: isExpanded
              ? 'var(--mi-bg-elevated)'
              : 'linear-gradient(135deg, var(--mi-accent-blue), #2563eb)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            border: '1px solid var(--mi-border-medium)',
            boxShadow: 'var(--mi-shadow-elevated)',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {isExpanded ? <X size={14} /> : <Settings size={14} />}
          {isExpanded ? 'Close' : 'App Settings'}
        </button>
      )}

      {/* Sidebar Container */}
      <div
        className="AudioSidebar fixed left-0 top-0 h-full transition-all duration-300 flex"
        style={{
          width: isExpanded ? 384 : 0,
          background: isExpanded ? 'var(--mi-bg-surface)' : 'transparent',
          borderRight: isExpanded ? '1px solid var(--mi-border-medium)' : 'none',
          boxShadow: isExpanded ? '4px 0 24px rgba(0,0,0,0.4)' : 'none',
          zIndex: 40,
          pointerEvents: isExpanded ? 'auto' : 'none',
          isolation: 'isolate',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar Content - Always mounted to keep audio detection running */}
        <div
          className="AudioSidebar-content flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            width: 384,
            pointerEvents: isExpanded ? 'auto' : 'none',
            visibility: isExpanded ? 'visible' : 'hidden',
            isolation: 'isolate',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Logo at top of sidebar */}
          <div className="mb-4 flex justify-center">
            <Image
              src="/images/logo-whitetext.png"
              alt="Modern Guitar Scales"
              width={200}
              height={45}
              priority
              style={{ objectFit: 'contain' }}
            />
          </div>

          {/* Skill Level Selector at Top */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <SkillLevelSelector
              skillLevel={skillLevel}
              onSkillLevelChange={setSkillLevel}
              theme={theme}
              showLabel={true}
              showDescription={true}
            />
          </div>

          {/* Settings Section */}
          <div
            className="rounded-lg p-4 mb-4"
            style={{
              background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Settings className="h-5 w-5" style={{ color: theme.textPrimary }} />
              <h3 className="text-sm font-bold" style={{ color: theme.textPrimary }}>
                Settings
              </h3>
            </div>

            {/* Strings Selection */}
            {onStringCountChange && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <Guitar className="w-4 h-4" style={{ color: theme.textSecondary }} />
                  <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                    Strings:
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onStringCountChange(6)}
                    className="flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all"
                    style={{
                      background: stringCount === 6 ? theme.buttonPrimary : theme.bgSecondary,
                      color: stringCount === 6 ? '#ffffff' : theme.textPrimary,
                      border: `1px solid ${stringCount === 6 ? theme.buttonPrimary : theme.border}`,
                    }}
                  >
                    6
                  </button>
                  <button
                    onClick={() => onStringCountChange(7)}
                    className="flex-1 py-1.5 px-3 rounded text-xs font-medium transition-all"
                    style={{
                      background: stringCount === 7 ? theme.buttonPrimary : theme.bgSecondary,
                      color: stringCount === 7 ? '#ffffff' : theme.textPrimary,
                      border: `1px solid ${stringCount === 7 ? theme.buttonPrimary : theme.border}`,
                    }}
                  >
                    7
                  </button>
                </div>
              </div>
            )}

            {/* Colorful Strings */}
            {onShowColorfulStringsChange && (
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" style={{ color: theme.textSecondary }} />
                    <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                      Colorful Strings:
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !showColorfulStrings;
                      onShowColorfulStringsChange(newValue);
                      // If enabling for the first time and brightness is at 100% (default), set to 50%
                      if (newValue && stringBrightness === 100 && onStringBrightnessChange) {
                        onStringBrightnessChange(50);
                      }
                    }}
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: showColorfulStrings ? '#22c55e' : theme.bgTertiary,
                      border: `1px solid ${showColorfulStrings ? '#22c55e' : theme.border}`,
                    }}
                    aria-label="Toggle colorful strings"
                  >
                    <span
                      className="inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out"
                      style={{
                        backgroundColor: '#ffffff',
                        transform: showColorfulStrings ? 'translateX(24px)' : 'translateX(4px)',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                      }}
                    />
                  </button>
                </div>

                {/* Brightness Slider - Only show when colorful strings is enabled */}
                {showColorfulStrings && onStringBrightnessChange && (
                  <div>
                    <button
                      onClick={() => setIsBrightnessExpanded(!isBrightnessExpanded)}
                      className="w-full flex items-center justify-between py-1.5 px-3 rounded text-xs font-medium transition-all border mb-2"
                      style={{
                        background: theme.bgSecondary,
                        color: theme.textSecondary,
                        borderColor: theme.border,
                      }}
                    >
                      <span>Brightness</span>
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ color: '#22c55e' }}>
                          {stringBrightness}%
                        </span>
                        <ChevronDown
                          className="w-3 h-3 transition-transform"
                          style={{
                            transform: isBrightnessExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          }}
                        />
                      </div>
                    </button>
                    {isBrightnessExpanded && (
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={stringBrightness}
                        onChange={(e) => onStringBrightnessChange(Number(e.target.value))}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #22c55e 0%, #22c55e ${stringBrightness}%, ${theme.border} ${stringBrightness}%, ${theme.border} 100%)`,
                        }}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Note Display Toggle (Sharp/Flat) */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-4 h-4" style={{ color: theme.textSecondary }} />
                <span className="text-xs font-medium" style={{ color: theme.textSecondary }}>
                  Note Display:
                </span>
              </div>
              <div className="flex items-center justify-between px-3 py-2 rounded" style={{ background: theme.bgSecondary, width: '240px' }}>
                {/* Sharp Label */}
                <span
                  className="text-xs font-semibold transition-opacity flex items-center gap-1"
                  style={{
                    color: notation === 'sharp' ? theme.accentPrimary : theme.textSecondary,
                    opacity: notation === 'sharp' ? 1 : 0.5,
                  }}
                >
                  <span className="text-sm">#</span>
                  <span>Sharp</span>
                </span>

                {/* Toggle Switch */}
                <button
                  onClick={toggleNotation}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: notation === 'flat' ? theme.accentPrimary : '#4b5563',
                    border: `2px solid ${notation === 'flat' ? theme.accentPrimary : '#6b7280'}`,
                  }}
                  aria-label="Toggle note notation"
                >
                  {/* Switch Knob */}
                  <span
                    className="inline-block h-5 w-5 transform rounded-full transition-transform duration-200 ease-in-out shadow-md"
                    style={{
                      backgroundColor: '#ffffff',
                      transform: notation === 'flat' ? 'translateX(20px)' : 'translateX(2px)',
                    }}
                  />
                </button>

                {/* Flat Label */}
                <span
                  className="text-xs font-semibold transition-opacity flex items-center gap-1"
                  style={{
                    color: notation === 'flat' ? theme.accentPrimary : theme.textSecondary,
                    opacity: notation === 'flat' ? 1 : 0.5,
                  }}
                >
                  <span className="text-sm">♭</span>
                  <span>Flat</span>
                </span>
              </div>
            </div>

            {/* Tuning Selection */}
            {onTuningChange && availableTunings.length > 0 && (
              <div className="mb-3">
                <span className="text-xs font-medium block mb-2" style={{ color: theme.textSecondary }}>
                  Tuning:
                </span>
                <select
                  value={tuningName}
                  onChange={(e) => onTuningChange(e.target.value)}
                  className="w-full py-1.5 px-3 rounded text-xs font-medium transition-all border cursor-pointer"
                  style={{
                    background: theme.bgSecondary,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  }}
                >
                  {availableTunings.map((tuning) => (
                    <option key={tuning} value={tuning} style={{ background: theme.bgSecondary, color: theme.textPrimary }}>
                      {tuning}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fret Dots Selection */}
            {onFretDotColorChange && (
              <div className="mb-3">
                <span className="text-xs font-medium block mb-2" style={{ color: theme.textSecondary }}>
                  Fret Dots:
                </span>
                <div className="relative" ref={fretDotsRef}>
                  <button
                    onClick={() => setIsFretDotsOpen(!isFretDotsOpen)}
                    className="w-full py-1.5 px-3 rounded text-xs font-medium transition-all border cursor-pointer flex items-center justify-between"
                    style={{
                      background: theme.bgSecondary,
                      color: theme.textPrimary,
                      borderColor: theme.border,
                    }}
                  >
                    <span>{fretDotColors.find(c => c.value === fretDotColor)?.name || 'Select'}</span>
                    <ChevronDown
                      className="w-3 h-3 transition-transform"
                      style={{
                        transform: isFretDotsOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </button>
                  {isFretDotsOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded shadow-lg border z-50"
                      style={{
                        background: theme.bgSecondary,
                        borderColor: theme.border,
                      }}
                    >
                      {/* Show Middle Dots Checkbox */}
                      {onShowMiddleDotsChange && (
                        <div
                          className="px-3 py-2 border-b"
                          style={{ borderColor: theme.border }}
                        >
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={showMiddleDots}
                              onChange={(e) => {
                                onShowMiddleDotsChange(e.target.checked);
                              }}
                              className="w-3.5 h-3.5 cursor-pointer"
                              style={{ accentColor: theme.buttonPrimary }}
                            />
                            <span className="text-xs font-medium" style={{ color: theme.textPrimary }}>
                              Show Middle Dots
                            </span>
                          </label>
                        </div>
                      )}
                      {/* Color Options */}
                      <div className="max-h-[200px] overflow-y-auto">
                        {fretDotColors.map((color) => (
                          <button
                            key={color.value}
                            onClick={() => {
                              onFretDotColorChange(color.value);
                            }}
                            className="w-full px-3 py-1.5 text-xs text-left hover:opacity-80 transition-all flex items-center gap-2"
                            style={{
                              background: fretDotColor === color.value ? theme.bgTertiary : 'transparent',
                              color: theme.textPrimary,
                            }}
                          >
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{
                                background: color.value,
                                borderColor: theme.border,
                              }}
                            />
                            {color.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Fret Count Input */}
            {onFretCountChange && (
              <div className="mb-3">
                <span className="text-xs font-medium block mb-2" style={{ color: theme.textSecondary }}>
                  Number of Frets:
                </span>
                <input
                  type="number"
                  min="12"
                  max="24"
                  value={fretCount}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value >= 12 && value <= 24) {
                      onFretCountChange(value);
                    }
                  }}
                  className="w-full py-1.5 px-3 rounded text-xs font-medium transition-all border"
                  style={{
                    background: theme.bgSecondary,
                    color: theme.textPrimary,
                    borderColor: theme.border,
                  }}
                />
              </div>
            )}

            {/* Invert Fretboard Button */}
            {onInvertToggle && (
              <div>
                <button
                  onClick={onInvertToggle}
                  className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded text-xs font-medium transition-all"
                  style={{
                    background: isInverted ? theme.buttonPrimary : theme.bgSecondary,
                    color: isInverted ? '#ffffff' : theme.textPrimary,
                    border: `1px solid ${isInverted ? theme.buttonPrimary : theme.border}`,
                  }}
                >
                  <FlipVertical className="w-3.5 h-3.5" />
                  Invert Fretboard
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Music className="h-6 w-6" style={{ color: theme.textPrimary }} />
            <h2 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
              Audio Input
            </h2>
          </div>

          <KeyDetectionPanel
            theme={currentTheme}
            autoRecommendation={autoRecommendation}
            autoSwitchFretboard={autoSwitchFretboard}
            onScaleChange={onScaleChange}
            onDetectedKeyChange={onDetectedKeyChange}
            onCompatibleScalesChange={onCompatibleScalesChange}
            onSelectedScaleChange={onSelectedScaleChange}
            onDetectionStateChange={onDetectionStateChange}
            onStartDetectionReady={onStartDetectionReady}
            onStopDetectionReady={onStopDetectionReady}
          />

          {/* MIDI Pedal Section */}
          <MIDIPedalStatus theme={theme} />

            {/* Theme and Fretboard Theme Section - Side by Side */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* Theme Section */}
              <div
                className="rounded-lg p-3"
                style={{
                  background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Palette className="h-4 w-4" style={{ color: theme.textSecondary }} />
                  <h3 className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                    Theme
                  </h3>
                </div>
                <div className="relative">
                  <button
                    onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
                    className="w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between"
                    style={{
                      background: theme.bgSecondary,
                      color: theme.textPrimary,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <span className="truncate">{currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}</span>
                    <ChevronDown
                      className="w-3 h-3 transition-transform flex-shrink-0"
                      style={{
                        transform: isThemeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </button>
                  {isThemeDropdownOpen && (
                    <div
                      className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
                      style={{
                        background: theme.bgSecondary,
                        border: `1px solid ${theme.border}`,
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {themeKeys.map((themeKey) => (
                        <button
                          key={themeKey}
                          onClick={() => {
                            onThemeChange(themeKey);
                            setIsThemeDropdownOpen(false);
                          }}
                          className="w-full py-1.5 px-3 text-xs font-medium transition-all text-left flex items-center justify-between"
                          style={{
                            background: currentTheme === themeKey ? theme.buttonPrimary : 'transparent',
                            color: currentTheme === themeKey ? '#ffffff' : theme.textPrimary,
                            borderBottom: `1px solid ${theme.border}`,
                          }}
                          onMouseEnter={(e) => {
                            if (currentTheme !== themeKey) {
                              e.currentTarget.style.background = theme.bgTertiary;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentTheme !== themeKey) {
                              e.currentTarget.style.background = 'transparent';
                            }
                          }}
                        >
                          <span className="truncate">{themeKey.charAt(0).toUpperCase() + themeKey.slice(1)}</span>
                          {currentTheme === themeKey && <span className="text-xs font-bold">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Fretboard Theme Section */}
              {onFretboardThemeChange && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Palette className="h-4 w-4" style={{ color: theme.textSecondary }} />
                    <h3 className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                      Fretboard
                    </h3>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setIsFretboardThemeDropdownOpen(!isFretboardThemeDropdownOpen)}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all text-left flex items-center justify-between"
                      style={{
                        background: theme.bgSecondary,
                        color: theme.textPrimary,
                        border: `1px solid ${theme.border}`,
                      }}
                    >
                      <span className="truncate">{fretboardThemes[fretboardTheme].name}</span>
                      <ChevronDown
                        className="w-3 h-3 transition-transform flex-shrink-0"
                        style={{
                          transform: isFretboardThemeDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    </button>
                    {isFretboardThemeDropdownOpen && (
                      <div
                        className="absolute top-full left-0 right-0 mt-1 rounded-lg overflow-hidden z-50"
                        style={{
                          background: theme.bgSecondary,
                          border: `1px solid ${theme.border}`,
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        {fretboardThemeKeys.map((themeKey) => (
                          <button
                            key={themeKey}
                            onClick={() => {
                              onFretboardThemeChange(themeKey);
                              setIsFretboardThemeDropdownOpen(false);
                            }}
                            className="w-full py-1.5 px-3 text-xs font-medium transition-all text-left flex items-center justify-between"
                            style={{
                              background: fretboardTheme === themeKey ? theme.buttonPrimary : 'transparent',
                              color: fretboardTheme === themeKey ? '#ffffff' : theme.textPrimary,
                              borderBottom: themeKey !== fretboardThemeKeys[fretboardThemeKeys.length - 1] ? `1px solid ${theme.border}` : 'none',
                            }}
                            onMouseEnter={(e) => {
                              if (fretboardTheme !== themeKey) {
                                e.currentTarget.style.background = theme.bgTertiary;
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (fretboardTheme !== themeKey) {
                                e.currentTarget.style.background = 'transparent';
                              }
                            }}
                          >
                            <span className="truncate">{fretboardThemes[themeKey].name}</span>
                            {fretboardTheme === themeKey && <span className="text-xs font-bold">✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Note Detector Section */}
            <NoteDetectorSidebar
              theme={theme}
              enabled={noteDetectorEnabled}
              onDetectedNoteChange={onDetectedNoteChange}
              liveNotesGlowEnabled={liveNotesGlowEnabled}
              onLiveNotesGlowChange={onLiveNotesGlowChange}
              liveNotesGlowDuration={liveNotesGlowDuration}
              onLiveNotesGlowDurationChange={onLiveNotesGlowDurationChange}
              circleOf5thsGlowDuration={circleOf5thsGlowDuration}
              onCircleOf5thsGlowDurationChange={onCircleOf5thsGlowDurationChange}
            />

            {/* Guide Settings Section */}
            <div
              className="rounded-lg p-3 mt-4"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-4 w-4" style={{ color: theme.textSecondary }} />
                <h3 className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                  Help & Guide
                </h3>
              </div>

              {/* Show Guide Button */}
              {onShowGuide && (
                <button
                  onClick={onShowGuide}
                  className="w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-all mb-2"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    color: '#ffffff',
                    border: 'none',
                  }}
                >
                  Show Interactive Guide
                </button>
              )}

              {/* Show Guide at Start Checkbox */}
              {onShowGuideAtStartChange && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showGuideAtStart ?? true}
                    onChange={(e) => onShowGuideAtStartChange(e.target.checked)}
                    className="w-3.5 h-3.5 rounded"
                    style={{ accentColor: '#3b82f6' }}
                  />
                  <span className="text-xs" style={{ color: theme.textSecondary }}>
                    Show guide at startup
                  </span>
                </label>
              )}
            </div>
          </div>
      </div>

      {/* CSS for pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
}

