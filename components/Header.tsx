'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client-ssr';
import { Theme, themes } from '@/lib/themes';
import { ThemeConfig } from '@/lib/themes';
import { TUNINGS, NOTE_COLORS, NOTES, normalizeNoteFromDisplay, getTonicChordTones, CHORD_TONE_COLORS, HIGHLIGHT_COLORS } from '@/lib/musicTheory';
import { getDisplayScaleNames } from '@/lib/musicalCompatibility';
import { Palette, Info, User, LogOut, CreditCard, Music2, Circle } from 'lucide-react';
import ColorPicker from './ColorPicker';
import ManualSelectionList, { ManualSelection } from './ManualSelectionList';
import HamburgerMenu from './HamburgerMenu';
import ChordToneInfoModal from './ChordToneInfoModal';
import CircleOf5ths from './CircleOf5ths';
import SongProgressionChordTonesTabs from './SongProgressionChordTonesTabs';
import TriadTab from './TriadTab';
import TriadPositionsCard from './TriadPositionsCard';
import CAGEDShapesCard from './CAGEDShapesCard';
import TriadCAGEDToggleCard from './TriadCAGEDToggleCard';
import { TriadType, CAGEDShape, TriadInversion, TRIAD_DISPLAY_NAMES, getAllTriadTypes } from '@/lib/triad-theory';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface HeaderProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
  theme: ThemeConfig;
  rootNote: string;
  scaleName: string;
  stringCount: 6 | 7;
  tuningName: string;
  isInverted: boolean;
  fretDotColor: string;
  showMiddleDots: boolean;
  onStringCountChange: (count: 6 | 7) => void;
  onTuningChange: (tuning: string) => void;
  onInvertToggle: () => void;
  onFretDotColorChange: (color: string) => void;
  onShowMiddleDotsChange: (show: boolean) => void;
  // Key detection props
  detectedKey?: string | null;
  confidence?: number;
  isListening?: boolean;
  isDetecting?: boolean;
  autoRecommendation?: boolean;
  autoSwitchFretboard?: boolean;
  onAutoRecommendationChange?: (enabled: boolean) => void;
  onAutoSwitchFretboardChange?: (enabled: boolean) => void;
  onStartDetection?: () => void;
  onStopDetection?: () => void;
  chordTones?: string[];
  guideTones?: string[];
  // Manual key/scale selection props
  manualKey?: string | null;
  manualScaleName?: string | null;
  onManualKeyScaleChange?: (key: string | null, scale: string | null) => void;
  isManualMode?: boolean;
  // Manual selection list props
  manualSelections?: ManualSelection[];
  currentSelectionIndex?: number;
  onAddToList?: () => void;
  onRemoveFromList?: (index: number) => void;
  onMoveSelectionUp?: (index: number) => void;
  onMoveSelectionDown?: (index: number) => void;
  onSelectFromList?: (index: number) => void;
  onNavigatePrevious?: () => void;
  onNavigateNext?: () => void;
  onClearAllSelections?: () => void;
  // Chord/Guide tones display props
  selectedChordNotes?: string[] | null;
  selectedGuideTones?: string[] | null;
  chordHighlightColor?: string;
  guideTonesColor?: string;
  showChordTones?: boolean;
  showGuideTones?: boolean;
  showChordGlow?: boolean;
  colorGuideEnabled?: boolean;
  onChordHighlightColorChange?: (color: string) => void;
  onGuideTonesColorChange?: (color: string) => void;
  onShowChordTonesChange?: (show: boolean) => void;
  onShowGuideTonesChange?: (show: boolean) => void;
  onShowChordGlowChange?: (show: boolean) => void;
  onColorGuideEnabledChange?: (enabled: boolean) => void;
  glowOpacity?: number;
  onGlowOpacityChange?: (opacity: number) => void;
  showWhiteBorder?: boolean;
  onShowWhiteBorderChange?: (show: boolean) => void;
  onlyChordTones?: boolean;
  onOnlyChordTonesChange?: (enabled: boolean) => void;
  selectedChordToneTypes?: ('root' | 'third' | 'fifth' | 'seventh')[];
  onSelectedChordToneTypesChange?: (types: ('root' | 'third' | 'fifth' | 'seventh')[]) => void;
  // All Intervals mode props
  allIntervalsMode?: boolean;
  onAllIntervalsModeChange?: (enabled: boolean) => void;
  selectedIntervalDegrees?: number[];
  onSelectedIntervalDegreesChange?: (degrees: number[]) => void;
  // Focus mode props
  isFocusMode?: boolean;
  onFocusModeChange?: (enabled: boolean) => void;
  // Settings sidebar toggle
  onToggleSettings?: () => void;
  // Guide props
  onShowGuide?: () => void;
  showGuideAtStart?: boolean;
  onShowGuideAtStartChange?: (v: boolean) => void;
  // Circle of 5ths props
  showCircleOf5ths?: boolean;
  onShowCircleOf5thsChange?: (show: boolean) => void;
  circleOf5thsPosition?: 'left' | 'right' | 'below';
  onCircleOf5thsPositionChange?: (position: 'left' | 'right' | 'below') => void;
  detectedNote?: string | null;
  // Circle of 5ths fretboard glow props
  showCircleFretboardGlow?: boolean;
  onShowCircleFretboardGlowChange?: (show: boolean) => void;
  circleFretboardGlowColor?: string;
  onCircleFretboardGlowColorChange?: (color: string) => void;
  circleFretboardGlowOpacity?: number;
  onCircleFretboardGlowOpacityChange?: (opacity: number) => void;
  circleFretboardGlowWidth?: number;
  onCircleFretboardGlowWidthChange?: (width: number) => void;
  circleOf5thsGlowDuration?: number;
  // Colorful Strings props
  showColorfulStrings?: boolean;
  onShowColorfulStringsChange?: (show: boolean) => void;
  stringBrightness?: number;
  onStringBrightnessChange?: (brightness: number) => void;
  noteDetectorEnabled?: boolean;
  onNoteDetectorEnabledChange?: (enabled: boolean) => void;
  // Triad mode props
  showTriadMode?: boolean;
  onTriadModeChange?: (enabled: boolean) => void;
  onTriadDataChange?: (data: any) => void;
  onFretboardDataChange?: (data: any) => void;
  selectedTriadInversion?: TriadInversion;
  onTriadInversionChange?: (inversion: TriadInversion) => void;
  showCAGEDGuide?: boolean;
  onCAGEDGuideChange?: (enabled: boolean) => void;
  cagedBrightness?: number;
  onCAGEDBrightnessChange?: (brightness: number) => void;
  selectedTriadCAGEDShapes?: CAGEDShape[];
  onTriadCAGEDShapesChange?: (shapes: CAGEDShape[]) => void;
  positionCountsByInversion?: Record<TriadInversion, number>;
  positionCountsByShape?: Record<CAGEDShape, number>;
  // Triad type callback
  onTriadTypeChange?: (type: TriadType) => void;
  // Overlapping Chords props
  overlappingChordsEnabled?: boolean;
  onOverlappingChordsChange?: (enabled: boolean) => void;
  // Individual Notes mode props
  showIndividualNotes?: boolean;
  onIndividualNotesChange?: (enabled: boolean) => void;
  // Pentatonic mode props
  showPentatonicMode?: boolean;
  onPentatonicModeChange?: (enabled: boolean) => void;
  isPentatonicHeaderCollapsed?: boolean;
  onPentatonicHeaderCollapsedChange?: (collapsed: boolean) => void;
  // Fretboard order swap props
  fretboardOrder?: 'triads-top' | 'pentatonics-top';
  onFretboardOrderChange?: (order: 'triads-top' | 'pentatonics-top') => void;
  selectedTriadType?: TriadType;
  // Recommended Progressions (lifted state from SongProgressionChordTonesTabs)
  progressionsOpen?: boolean;
  onProgressionsOpenChange?: (open: boolean) => void;
}

export default function Header({
  currentTheme,
  onThemeChange,
  theme,
  rootNote,
  scaleName,
  stringCount,
  tuningName,
  isInverted,
  fretDotColor,
  showMiddleDots,
  onStringCountChange,
  onTuningChange,
  onInvertToggle,
  onFretDotColorChange,
  onShowMiddleDotsChange,
  detectedKey,
  confidence = 0,
  isListening = false,
  isDetecting = false,
  autoRecommendation = false,
  autoSwitchFretboard = false,
  onAutoRecommendationChange,
  onAutoSwitchFretboardChange,
  onStartDetection,
  onStopDetection,
  chordTones = [],
  guideTones = [],
  manualKey = null,
  manualScaleName = null,
  onManualKeyScaleChange,
  isManualMode = false,
  manualSelections = [],
  currentSelectionIndex = -1,
  onAddToList,
  onRemoveFromList,
  onMoveSelectionUp,
  onMoveSelectionDown,
  onSelectFromList,
  onNavigatePrevious,
  onNavigateNext,
  onClearAllSelections,
  selectedChordNotes = null,
  selectedGuideTones = null,
  chordHighlightColor = '#fbbf24',
  guideTonesColor = '#ec4899',
  showChordTones = true,
  showGuideTones = true,
  showChordGlow = true,
  colorGuideEnabled = false,
  onChordHighlightColorChange,
  onGuideTonesColorChange,
  onShowChordTonesChange,
  onShowGuideTonesChange,
  onShowChordGlowChange,
  onColorGuideEnabledChange,
  glowOpacity = 40,
  onGlowOpacityChange,
  showWhiteBorder = false,
  onShowWhiteBorderChange,
  isFocusMode = false,
  onFocusModeChange,
  onToggleSettings,
  onShowGuide,
  showGuideAtStart = true,
  onShowGuideAtStartChange,
  showCircleOf5ths = false,
  onShowCircleOf5thsChange,
  circleOf5thsPosition = 'left',
  onCircleOf5thsPositionChange,
  detectedNote = null,
  showCircleFretboardGlow = false,
  onShowCircleFretboardGlowChange,
  circleFretboardGlowColor = '#667eea',
  onCircleFretboardGlowColorChange,
  circleFretboardGlowOpacity = 60,
  onCircleFretboardGlowOpacityChange,
  circleFretboardGlowWidth = 20,
  onCircleFretboardGlowWidthChange,
  circleOf5thsGlowDuration = 1000,
  showColorfulStrings = false,
  onShowColorfulStringsChange,
  stringBrightness = 100,
  onStringBrightnessChange,
  noteDetectorEnabled = false,
  onNoteDetectorEnabledChange,
  onlyChordTones = false,
  onOnlyChordTonesChange,
  selectedChordToneTypes = ['root', 'third', 'fifth', 'seventh'],
  onSelectedChordToneTypesChange,
  allIntervalsMode = false,
  onAllIntervalsModeChange,
  selectedIntervalDegrees = [0, 1, 2, 3, 4, 5, 6],
  onSelectedIntervalDegreesChange,
  showTriadMode = false,
  onTriadModeChange,
  onTriadDataChange,
  onFretboardDataChange,
  selectedTriadInversion,
  onTriadInversionChange,
  showCAGEDGuide = false,
  onCAGEDGuideChange,
  cagedBrightness = 100,
  onCAGEDBrightnessChange,
  selectedTriadCAGEDShapes,
  onTriadCAGEDShapesChange,
  positionCountsByInversion,
  positionCountsByShape,
  onTriadTypeChange,
  overlappingChordsEnabled = false,
  onOverlappingChordsChange,
  showIndividualNotes = false,
  onIndividualNotesChange,
  showPentatonicMode = false,
  onPentatonicModeChange,
  isPentatonicHeaderCollapsed = false,
  onPentatonicHeaderCollapsedChange,
  fretboardOrder = 'triads-top',
  onFretboardOrderChange,
  selectedTriadType = 'major',
  progressionsOpen = false,
  onProgressionsOpenChange,
}: HeaderProps) {
  const themeKeys = Object.keys(themes) as Theme[];
  const availableTunings = Object.keys(TUNINGS[stringCount]);
  const tuning = TUNINGS[stringCount][tuningName as keyof typeof TUNINGS[typeof stringCount]];

  // Note display hook for sharp/flat preference
  const { getNoteDisplayName, getNotesDisplay } = useNoteDisplay();

  // Modal state
  const [isChordToneInfoModalOpen, setIsChordToneInfoModalOpen] = useState(false);

  // User avatar dropdown state
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  // Scale/Mode filter state - defaults to true (Basic mode) and persists in localStorage
  const [showBasicModesOnly, setShowBasicModesOnly] = useLocalStorage('guitar-app-scale-mode-basic-only', true);

  // Format detected key to capitalize properly
  const formatDetectedKey = (key: string | null | undefined): string => {
    if (!key) return 'Analyzing...';
    const parts = key.split(' ');
    if (parts.length >= 2) {
      const note = parts[0];
      const quality = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      return `${note} ${quality}`;
    }
    return key;
  };

  // Get the display key - in manual mode, show only the root note (flat notation)
  const getDisplayKey = (): string => {
    if (isManualMode) {
      // In manual mode, show only the root note using flat notation
      return getNoteDisplayName(manualKey || rootNote);
    } else {
      // In detection mode, show the full detected key
      return formatDetectedKey(detectedKey);
    }
  };

  const displayKey = getDisplayKey();
  const showAnalyzing = isListening && !detectedKey;

  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // Determine if we should show the collapsed view
  const shouldShowCollapsed = showTriadMode && showPentatonicMode && isPentatonicHeaderCollapsed;

  return (
    <div style={{ background: 'var(--mi-bg-surface)', borderBottom: '1px solid var(--mi-border-subtle)' }}>

      {/* ── Top Bar: 64px — Logo · HamburgerMenu · (key detection chip) · User Avatar ── */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', gap: 12 }}>
        {/* Left: Logo + Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <Link href="/" title="Go to Musical Insights Home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <Image src="/images/logo-whitetext.png" alt="Musical Insights" width={120} height={27} priority style={{ objectFit: 'contain', cursor: 'pointer' }} />
          </Link>
          <HamburgerMenu
            theme={theme}
            isFocusMode={isFocusMode}
            showCircleOf5ths={showCircleOf5ths}
            circleOf5thsPosition={circleOf5thsPosition}
            showColorfulStrings={showColorfulStrings}
            stringBrightness={stringBrightness}
            noteDetectorEnabled={noteDetectorEnabled}
            isDetecting={isDetecting}
            onToggleSettings={onToggleSettings}
            onFocusModeChange={onFocusModeChange}
            onShowGuide={onShowGuide}
            showGuideAtStart={showGuideAtStart}
            onShowGuideAtStartChange={onShowGuideAtStartChange}
            onShowCircleOf5thsChange={onShowCircleOf5thsChange}
            onCircleOf5thsPositionChange={onCircleOf5thsPositionChange}
            onShowColorfulStringsChange={onShowColorfulStringsChange}
            onStringBrightnessChange={onStringBrightnessChange}
            onNoteDetectorEnabledChange={onNoteDetectorEnabledChange}
            showTriadMode={showTriadMode}
            onTriadModeChange={onTriadModeChange}
            overlappingChordsEnabled={overlappingChordsEnabled}
            onOverlappingChordsChange={onOverlappingChordsChange}
            onStartDetection={onStartDetection}
            onStopDetection={onStopDetection}
            onLogout={handleLogout}
          />
        </div>

        {/* Center: current scale display (compact) */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
          {(detectedKey || isListening || (manualKey && manualScaleName)) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px', borderRadius: 'var(--mi-radius-full)', background: 'var(--mi-accent-blue-dim)', border: '1px solid var(--mi-border-accent)', fontSize: 13, fontWeight: 600, color: 'var(--mi-text-accent)', whiteSpace: 'nowrap' }}>
              {isListening && <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--mi-accent-green)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />}
              {getNoteDisplayName(manualKey || '') || displayKey}
              {(manualScaleName || scaleName) && <span style={{ color: 'var(--mi-text-secondary)', fontWeight: 400 }}> {manualScaleName || scaleName}</span>}
            </div>
          )}
        </div>

        {/* Right: User avatar */}
        <div ref={userMenuRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--mi-accent-blue), var(--mi-accent-violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', border: '2px solid var(--mi-border-medium)', cursor: 'pointer' }}
            title="Account menu"
          >
            <User size={16} />
          </button>
          {showUserMenu && (
            <div style={{ position: 'absolute', top: 44, right: 0, width: 200, background: 'var(--mi-bg-overlay)', border: '1px solid var(--mi-border-medium)', borderRadius: 'var(--mi-radius-md)', boxShadow: 'var(--mi-shadow-elevated)', zIndex: 70, overflow: 'hidden' }}>
              <Link href="/subscription/manage" onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', fontSize: 13, color: 'var(--mi-text-secondary)', textDecoration: 'none', borderBottom: '1px solid var(--mi-border-subtle)' }}>
                <CreditCard size={14} /> Manage Subscription
              </Link>
              <div style={{ height: 1, background: 'var(--mi-border-subtle)' }} />
              <button onClick={() => { setShowUserMenu(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', fontSize: 13, color: 'var(--mi-accent-red)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-header Tool Bar: 44px — Song Builder · Circle toggle · Focus ── */}
      {!isFocusMode && (
        <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', background: 'var(--mi-bg-base)', borderBottom: '1px solid var(--mi-border-subtle)', overflowX: 'auto', whiteSpace: 'nowrap', flexShrink: 0 }}>
          {/* Song Builder Button */}
          <button
            onClick={(e) => {
              if (e.ctrlKey || e.metaKey || e.button === 1) { window.open('/chord-progression-builder', '_blank'); }
              else { router.push('/chord-progression-builder'); }
            }}
            onMouseDown={(e) => { if (e.button === 1) { e.preventDefault(); window.open('/chord-progression-builder', '_blank'); } }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 30, borderRadius: 'var(--mi-radius-sm)', fontSize: 12, fontWeight: 600, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            title="Open Song Progression Builder (Ctrl+Click for new tab)"
          >
            <Music2 size={13} /> Song Builder
          </button>

          {/* Circle of 5ths Toggle */}
          <button
            onClick={() => onShowCircleOf5thsChange?.(!showCircleOf5ths)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 30, borderRadius: 'var(--mi-radius-sm)', fontSize: 12, fontWeight: 600, background: showCircleOf5ths ? 'var(--mi-accent-violet-dim)' : 'var(--mi-bg-elevated)', border: showCircleOf5ths ? '1px solid var(--mi-accent-violet)' : '1px solid var(--mi-border-medium)', color: showCircleOf5ths ? 'var(--mi-accent-violet)' : 'var(--mi-text-secondary)', cursor: 'pointer', flexShrink: 0 }}
            title={showCircleOf5ths ? 'Hide Circle of 5ths' : 'Show Circle of 5ths'}
          >
            <Circle size={13} /> Circle of 5ths
          </button>

          {/* Focus Mode Toggle - Hidden */}

          {/* Guide Button */}
          {onShowGuide && (
            <button
              onClick={onShowGuide}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 14px', height: 30, borderRadius: 'var(--mi-radius-sm)', fontSize: 12, fontWeight: 600, background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', color: 'var(--mi-text-secondary)', cursor: 'pointer', flexShrink: 0 }}
            >
              ? Guide
            </button>
          )}
        </div>
      )}

      {/* ── Existing controls (key selector, chord tones, CAGED, etc.) ── */}
      <div className="px-6 py-4">
      <div>
        {/* Collapsed Header View for Pentatonic Mode */}
        {shouldShowCollapsed ? (
          <div className="flex items-center justify-between">
            {/* Left: compact collapse indicator */}
            <div className="flex items-center gap-4">
              <div />
            </div>

            {/* Center: Premium Title Display */}
            <div
              className="px-4 py-2 rounded-lg"
              style={{
                background: `linear-gradient(135deg, ${theme.bgTertiary} 0%, ${theme.bgSecondary} 100%)`,
                border: `1px solid ${theme.border}`,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="text-xs font-semibold uppercase tracking-wider opacity-70"
                  style={{ color: theme.textSecondary }}
                >
                  Current Scale
                </div>
                <div
                  className="text-2xl font-bold"
                  style={{
                    color: theme.textPrimary,
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {getNoteDisplayName(rootNote)} {scaleName}
                </div>
              </div>
            </div>

            {/* Right: Expand Button */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onPentatonicHeaderCollapsedChange?.(false)}
                className="p-2 rounded-lg transition-all hover:opacity-80"
                style={{
                  background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                  color: theme.textPrimary,
                }}
                title="Expand header"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        ) : (
          /* Full Header View */
          <>
            {/* Collapse Button for Pentatonic Mode */}
            {showTriadMode && showPentatonicMode && onPentatonicHeaderCollapsedChange && (
              <div className="flex justify-end mb-2">
                <button
                  onClick={() => onPentatonicHeaderCollapsedChange(true)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80"
                  style={{
                    background: theme.bgTertiary,
                    border: `1px solid ${theme.border}`,
                    color: theme.textSecondary,
                  }}
                  title="Collapse header for more fretboard space"
                >
                  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Collapse Header
                </button>
              </div>
            )}

            {/* Main Header Row - Three Column Layout */}
            <div className="flex items-start gap-6">
          {/* LEFT SECTION - Logo, Hamburger Menu & Circle of 5ths */}
          <div className="flex items-start gap-4 flex-shrink-0">
            {/* Logo, Hamburger Menu, Selected Key Card, and Song Builder Button */}
            <div className="flex-shrink-0 flex flex-col gap-3" data-guide="app-overview">

              {/* Triads & CAGED / Individual Notes toggles */}
              {onTriadModeChange && (
                <TriadCAGEDToggleCard
                  theme={theme}
                  showTriadMode={showTriadMode}
                  onTriadModeChange={onTriadModeChange}
                  overlappingChordsEnabled={overlappingChordsEnabled}
                  onOverlappingChordsChange={onOverlappingChordsChange}
                  showIndividualNotes={showIndividualNotes}
                  onIndividualNotesChange={onIndividualNotesChange}
                />
              )}

              {/* Swap Fretboards Button - Only show when both Triad Mode and Pentatonic Mode are enabled */}
              {showTriadMode && showPentatonicMode && onFretboardOrderChange && (
                <button
                  onClick={() => onFretboardOrderChange(fretboardOrder === 'triads-top' ? 'pentatonics-top' : 'triads-top')}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                  style={{
                    background: theme.buttonPrimary,
                    color: '#ffffff',
                    border: `1px solid ${theme.border}`,
                  }}
                  title="Swap fretboard order"
                >
                  <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  Swap Fretboards
                </button>
              )}
            </div>
          </div>

          {/* MIDDLE SECTION - Title and Controls */}
          <div className="flex-shrink-0">
            {/* Horizontal Layout: Manual Selection and Chord Tones */}
            <div className="flex gap-4 items-start">

            {/* Manual Key/Scale Selection - Two Column Layout */}
            {onManualKeyScaleChange && (
              <div
                className="p-3 rounded-lg transition-all"
                style={{
                  background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                  maxWidth: '800px',
                  width: 'fit-content',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                    Select Key & Scale
                  </div>
                  {onAddToList && (
                    <button
                      data-guide="add-to-list"
                      onClick={onAddToList}
                      disabled={!manualKey || !manualScaleName}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{
                        background: theme.buttonPrimary,
                        color: '#ffffff',
                        border: 'none',
                      }}
                      title="Add current key/scale to song progression"
                    >
                      + Add to Progression
                    </button>
                  )}
                </div>

                {/* Content Layout */}
                <div className="flex flex-col gap-3" data-guide="manual-selection">
                  {/* Root Note Buttons */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: theme.textSecondary }}>
                      Key
                    </label>
                    <div className="flex gap-1.5">
                      {getNotesDisplay().map((displayNote) => {
                        const internalNote = normalizeNoteFromDisplay(displayNote);
                        const isSelected = manualKey === internalNote;
                        return (
                          <button
                            key={displayNote}
                            onClick={() => onManualKeyScaleChange(internalNote, manualScaleName)}
                            className="px-2.5 py-1 rounded-lg font-semibold text-xs transition-all transform hover:scale-110 active:scale-95"
                            style={{
                              backgroundColor: NOTE_COLORS[displayNote],
                              color: '#ffffff',
                              boxShadow: isSelected
                                ? '0 0 0 3px #3b82f6, 0 0 12px rgba(59, 130, 246, 0.6), 0 4px 8px rgba(0,0,0,0.3)'
                                : '0 2px 4px rgba(0,0,0,0.2)',
                              border: isSelected ? '2px solid #ffffff' : 'none',
                              transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                              filter: isSelected ? 'brightness(1.2)' : 'brightness(1)',
                              position: 'relative',
                              zIndex: isSelected ? 10 : 1,
                            }}
                            title={displayNote}
                          >
                            {displayNote}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Triad Type Selector - Only show when triad mode is active */}
                  {showTriadMode && (
                    <div>
                      <label
                        className="text-xs font-medium mb-2 block"
                        style={{ color: theme.textSecondary }}
                      >
                        Triad Type
                      </label>
                      <div className="flex gap-2">
                        {getAllTriadTypes().map((type) => (
                          <button
                            key={type}
                            onClick={() => onTriadTypeChange?.(type)}
                            className="px-3 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-80 whitespace-nowrap"
                            style={{
                              background: selectedTriadType === type ? theme.buttonPrimary : theme.bgSecondary,
                              color: selectedTriadType === type ? '#ffffff' : theme.textPrimary,
                              border: `1px solid ${selectedTriadType === type ? theme.buttonPrimary : theme.border}`,
                            }}
                          >
                            {TRIAD_DISPLAY_NAMES[type]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Scale/Mode Row with Dropdown, Toggle, and Add Button */}
                  <div>
                    <label className="block text-xs font-medium mb-2" style={{ color: theme.textSecondary }}>
                      Scale/Mode
                    </label>
                    <div className="flex gap-2 items-center">
                      {/* Scale/Mode Dropdown */}
                      <select
                        value={manualScaleName || ''}
                        onChange={(e) => onManualKeyScaleChange(manualKey, e.target.value || null)}
                        className="px-3 py-1.5 rounded-lg text-xs"
                        style={{
                          background: theme.bgSecondary,
                          color: theme.textPrimary,
                          border: `1px solid ${theme.border}`,
                          minWidth: '200px',
                          width: 'auto',
                        }}
                      >
                        {!manualScaleName && <option value="">Select Scale/Mode</option>}
                        {getDisplayScaleNames(showBasicModesOnly).map((scale) => (
                          <option key={scale} value={scale}>
                            {scale}
                          </option>
                        ))}
                      </select>

                      {/* Basic/Advanced Toggle */}
                      <div className="flex rounded-lg overflow-hidden" style={{ border: `1px solid ${theme.border}` }}>
                        <button
                          type="button"
                          onClick={() => setShowBasicModesOnly(true)}
                          className="px-2 py-0.5 text-xs font-medium transition-all"
                          style={{
                            background: showBasicModesOnly ? theme.buttonPrimary : theme.bgTertiary,
                            color: showBasicModesOnly ? '#ffffff' : theme.textSecondary,
                            borderRight: `1px solid ${theme.border}`,
                          }}
                        >
                          Basic
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBasicModesOnly(false)}
                          className="px-2 py-0.5 text-xs font-medium transition-all"
                          style={{
                            background: !showBasicModesOnly ? theme.buttonPrimary : theme.bgTertiary,
                            color: !showBasicModesOnly ? '#ffffff' : theme.textSecondary,
                          }}
                        >
                          Advanced
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

              {/* CAGED Cards - Show when triad mode is active */}
              {showTriadMode && (
                <div className="space-y-3">
                  {/* CAGED Guide, CAGED Shapes, and Triad Positions */}
                  <CAGEDShapesCard
                    theme={theme}
                    selectedCAGEDShapes={selectedTriadCAGEDShapes || []}
                    onCAGEDShapesChange={onTriadCAGEDShapesChange || (() => {})}
                    positionCountsByShape={positionCountsByShape}
                    showCAGEDGuide={showCAGEDGuide}
                    onCAGEDGuideChange={onCAGEDGuideChange}
                    cagedBrightness={cagedBrightness}
                    onCAGEDBrightnessChange={onCAGEDBrightnessChange}
                    showPentatonicMode={showPentatonicMode}
                    onPentatonicModeChange={onPentatonicModeChange}
                  />
                </div>
              )}

              {/* Circle of 5ths - Show next to Triad settings when triad mode is active */}
              {showTriadMode && showCircleOf5ths && (
                <div className="flex-shrink-0">
                  <CircleOf5ths
                    theme={theme}
                    currentKey={manualKey || rootNote}
                    currentScale={manualScaleName || scaleName}
                    detectedNote={detectedNote}
                    onKeySelect={(key) => {
                      onManualKeyScaleChange?.(key, manualScaleName || scaleName);
                    }}
                    onScaleSelect={(scale) => {
                      onManualKeyScaleChange?.(manualKey || rootNote, scale);
                    }}
                    glowDuration={circleOf5thsGlowDuration}
                    showFretboardGlow={showCircleFretboardGlow}
                    onShowFretboardGlowChange={onShowCircleFretboardGlowChange}
                    fretboardGlowColor={circleFretboardGlowColor}
                    onFretboardGlowColorChange={onCircleFretboardGlowColorChange}
                    fretboardGlowOpacity={circleFretboardGlowOpacity}
                    onFretboardGlowOpacityChange={onCircleFretboardGlowOpacityChange}
                    fretboardGlowWidth={circleFretboardGlowWidth}
                    onFretboardGlowWidthChange={onCircleFretboardGlowWidthChange}
                  />
                </div>
              )}

              {/* Triad Tab - Show when triad mode is active */}
              {showTriadMode && (
                <div className="flex-shrink-0">
                  <TriadTab
                    theme={theme}
                    selectedRoot={manualKey || rootNote}
                    selectedType={selectedTriadType}
                    onTypeChange={onTriadTypeChange || (() => {})}
                    selectedCAGEDShapes={selectedTriadCAGEDShapes || []}
                    onCAGEDShapesChange={onTriadCAGEDShapesChange || (() => {})}
                    selectedInversion={selectedTriadInversion}
                    onInversionChange={onTriadInversionChange || (() => {})}
                    onTriadDataChange={onTriadDataChange}
                    onClose={() => onTriadModeChange?.(false)}
                    showCAGEDGuide={showCAGEDGuide}
                  />
                </div>
              )}

              {/* Chord Tones Section - Show when triad mode is NOT active */}
              {!showTriadMode && selectedChordNotes && onChordHighlightColorChange && onGuideTonesColorChange && onShowChordTonesChange && onShowGuideTonesChange && onShowChordGlowChange && onColorGuideEnabledChange && (
                <div className="flex-shrink-0 space-y-3" data-guide="song-list">
                  {/* Song Progression / Chord Tones Tabbed Section */}
                  <SongProgressionChordTonesTabs
                    theme={theme}
                    manualSelections={manualSelections}
                    currentSelectionIndex={currentSelectionIndex}
                    onSelectFromList={onSelectFromList}
                    onRemoveFromList={onRemoveFromList}
                    onMoveSelectionUp={onMoveSelectionUp}
                    onMoveSelectionDown={onMoveSelectionDown}
                    onNavigatePrevious={onNavigatePrevious}
                    onNavigateNext={onNavigateNext}
                    onClearAllSelections={onClearAllSelections}
                    rootNote={rootNote}
                    scaleName={scaleName}
                    selectedChordNotes={selectedChordNotes}
                    showChordTones={showChordTones}
                    onShowChordTonesChange={onShowChordTonesChange}
                    chordHighlightColor={chordHighlightColor}
                    onChordHighlightColorChange={onChordHighlightColorChange}
                    showGuideTones={showGuideTones}
                    guideTonesColor={guideTonesColor}
                    onGuideTonesColorChange={onGuideTonesColorChange}
                    showChordGlow={showChordGlow}
                    onShowChordGlowChange={onShowChordGlowChange}
                    showWhiteBorder={showWhiteBorder}
                    onShowWhiteBorderChange={onShowWhiteBorderChange}
                    glowOpacity={glowOpacity}
                    onGlowOpacityChange={onGlowOpacityChange}
                    colorGuideEnabled={colorGuideEnabled}
                    onColorGuideEnabledChange={onColorGuideEnabledChange}
                    onlyChordTones={onlyChordTones}
                    onOnlyChordTonesChange={onOnlyChordTonesChange}
                    selectedChordToneTypes={selectedChordToneTypes}
                    onSelectedChordToneTypesChange={onSelectedChordToneTypesChange}
                    allIntervalsMode={allIntervalsMode}
                    onAllIntervalsModeChange={onAllIntervalsModeChange}
                    selectedIntervalDegrees={selectedIntervalDegrees}
                    onSelectedIntervalDegreesChange={onSelectedIntervalDegreesChange}
                    onShowChordToneInfo={() => setIsChordToneInfoModalOpen(true)}
                    getTonicChordTones={getTonicChordTones}
                    progressionsOpen={progressionsOpen}
                    onProgressionsOpenChange={onProgressionsOpenChange}
                  />
                </div>
              )}

              {/* Circle of 5ths - Show next to Chord Tones when triad mode is NOT active */}
              {!showTriadMode && showCircleOf5ths && (
                <div className="flex-shrink-0">
                  <CircleOf5ths
                    theme={theme}
                    currentKey={manualKey || rootNote}
                    currentScale={manualScaleName || scaleName}
                    detectedNote={detectedNote}
                    onKeySelect={(key) => {
                      onManualKeyScaleChange?.(key, manualScaleName || scaleName);
                    }}
                    onScaleSelect={(scale) => {
                      onManualKeyScaleChange?.(manualKey || rootNote, scale);
                    }}
                    glowDuration={circleOf5thsGlowDuration}
                    showFretboardGlow={showCircleFretboardGlow}
                    onShowFretboardGlowChange={onShowCircleFretboardGlowChange}
                    fretboardGlowColor={circleFretboardGlowColor}
                    onFretboardGlowColorChange={onCircleFretboardGlowColorChange}
                    fretboardGlowOpacity={circleFretboardGlowOpacity}
                    onFretboardGlowOpacityChange={onCircleFretboardGlowOpacityChange}
                    fretboardGlowWidth={circleFretboardGlowWidth}
                    onFretboardGlowWidthChange={onCircleFretboardGlowWidthChange}
                  />
                </div>
              )}
            </div> {/* End of Horizontal Layout */}
          </div> {/* End of MIDDLE SECTION */}
        </div>
          </>
        )}
      </div>
      </div> {/* End px-6 py-4 controls wrapper */}

      {/* Chord Tone Info Modal */}
      <ChordToneInfoModal
        isOpen={isChordToneInfoModalOpen}
        onClose={() => setIsChordToneInfoModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}
