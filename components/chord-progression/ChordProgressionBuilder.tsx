'use client';

/**
 * Main container component for Chord Progression Builder
 */

import { useState, useMemo, useRef } from 'react';
import { useChordProgressionState } from '@/hooks/chord-progression/useChordProgressionState';
import { useTimelinePlayback } from '@/hooks/chord-progression/useTimelinePlayback';
import { useKeyboardShortcuts } from '@/hooks/chord-progression/useKeyboardShortcuts';
import { useChordProgressionCompatibility } from '@/hooks/chord-progression/useChordProgressionCompatibility';
import { useUndoRedo } from '@/hooks/chord-progression/useUndoRedo';
import { DEFAULT_ZOOM_LEVEL, ZOOM_LEVELS } from '@/lib/chord-progression/timeline-utils';
import { VerseData, ChordInstance } from '@/lib/chord-progression/types';
import { NOTE_COLORS, normalizeNoteFromDisplay } from '@/lib/musicTheory';
import { updateProject } from '@/lib/chord-progression/database-service';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { UpdateChordsCommand, UpdateScaleModesCommand } from '@/lib/chord-progression/commands';
import VerseTabsManager from './VerseTabsManager';
import TimelineVisualization from './TimelineVisualization';
import PlaybackControls from './PlaybackControls';
import GeneratorPanel from './GeneratorPanel';
import AddChordModal from './AddChordModal';
import AddScaleModeModal from './AddScaleModeModal';
import SaveProjectDialog from './SaveProjectDialog';
import LoadProjectDialog from './LoadProjectDialog';
import KeyboardShortcutsDialog from './KeyboardShortcutsDialog';
import CompatibilityScore from './CompatibilityScore';
import CircleOf5ths from '@/components/CircleOf5ths';
import HamburgerMenu from '@/components/HamburgerMenu';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, HelpCircle, ArrowLeft, Menu, Undo, Redo, History, ChevronLeft, Play, Pause, Square, RotateCcw, Sparkles, Music2, Plus, Wand2, GitBranch } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { ScaleModeInstance } from '@/lib/chord-progression/types';
import { useRouter } from 'next/navigation';
import { themes } from '@/lib/themes';
import PlayingChordTonesHUD from './PlayingChordTonesHUD';

export default function ChordProgressionBuilder() {
  const router = useRouter();
  const { getNoteDisplayName, getNotesDisplay } = useNoteDisplay();

  // Colorful Strings state - local to Song Builder
  const [showColorfulStrings, setShowColorfulStrings] = useLocalStorage('song-builder-show-colorful-strings', false);
  const [stringBrightness, setStringBrightness] = useLocalStorage('song-builder-string-brightness', 100);
  // Chord Tones HUD visibility — persisted per user
  const [showChordTonesHUD, setShowChordTonesHUD] = useLocalStorage('song-builder-show-chord-tones-hud', true);
  const {
    verses,
    activeVerse,
    activeVerseId,
    addVerse,
    updateVerse,
    deleteVerse,
    setActiveVerse,
    updateChords: updateChordsInternal,
    updateScaleModes: updateScaleModesInternal,
    setVerses,
  } = useChordProgressionState();

  // Undo/Redo system
  const {
    execute: executeCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    lastUndoDescription,
    lastRedoDescription,
    getUndoHistory,
    getRedoHistory,
    restoreToUndoState,
    restoreToRedoState,
  } = useUndoRedo(50);

  // Wrapped update functions with undo/redo support
  const updateChords = (newChords: ChordInstance[], description?: string) => {
    if (!activeVerse) return;

    // Auto-detect operation type if no description provided
    let finalDescription = description;
    if (!finalDescription) {
      const oldChords = activeVerse.chordProgression;

      // Check if chords were reordered (same chords, different order)
      if (oldChords.length === newChords.length) {
        const oldIds = oldChords.map(c => c.id).join(',');
        const newIds = newChords.map(c => c.id).join(',');

        if (oldIds !== newIds) {
          finalDescription = 'Reorder chords';
        } else {
          // Check if any chord was moved/resized
          const movedOrResized = newChords.some((newChord, i) => {
            const oldChord = oldChords[i];
            return oldChord.position !== newChord.position || oldChord.width !== newChord.width;
          });
          finalDescription = movedOrResized ? 'Move/resize chord' : 'Update chords';
        }
      } else if (oldChords.length < newChords.length) {
        finalDescription = 'Add chord';
      } else {
        finalDescription = 'Delete chord';
      }
    }

    const command = new UpdateChordsCommand(
      activeVerse.chordProgression,
      newChords,
      updateChordsInternal,
      finalDescription
    );
    executeCommand(command);
  };

  const updateScaleModes = (newScaleModes: ScaleModeInstance[], description?: string) => {
    if (!activeVerse) return;

    const command = new UpdateScaleModesCommand(
      activeVerse.scaleModeAssignments,
      newScaleModes,
      updateScaleModesInternal,
      description || 'Update scale modes'
    );
    executeCommand(command);
  };

  const { toast } = useToast();
  const [pixelsPerBeat, setPixelsPerBeat] = useState(DEFAULT_ZOOM_LEVEL.pixelsPerBeat);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [currentProjectName, setCurrentProjectName] = useState<string>('');
  const [currentProjectDescription, setCurrentProjectDescription] = useState<string>('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showLoadDialog, setShowLoadDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showAddChordModal, setShowAddChordModal] = useState(false);
  const [showAddScaleModeModal, setShowAddScaleModeModal] = useState(false);
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [editingChord, setEditingChord] = useState<ChordInstance | null>(null);
  const [editingScaleMode, setEditingScaleMode] = useState<ScaleModeInstance | null>(null);
  const [selectedChord, setSelectedChord] = useState<ChordInstance | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [isGeneratingUpdates, setIsGeneratingUpdates] = useState(false);
  const [generatorPanelRef, setGeneratorPanelRef] = useState<{
    triggerUpdateRecommendations: (updates: any[]) => void;
    setGeneratingUpdates: (isGenerating: boolean) => void;
    switchToTab?: (tab: string) => void;
  } | null>(null);
  const generatorScrollRef = useRef<HTMLDivElement>(null);

  const {
    playbackState,
    selectedInstrument,
    setSelectedInstrument,
    volume,
    setVolume,
    midiEnabled,
    setMidiEnabled,
    audioOutputDevice,
    setAudioOutputDevice,
    availableDevices,
    play,
    pause,
    stop,
    seek,
    replay,
    setBPM,
  } = useTimelinePlayback(
    activeVerse?.chordProgression || [],
    activeVerse?.bpm || 120,
    pixelsPerBeat
  );

  // Chord progression compatibility analysis
  const { compatibility, isLoading: isAnalyzing, error: analysisError } = useChordProgressionCompatibility(
    activeVerse?.chordProgression || [],
    activeVerse?.key || 'C'
  );

  // Reactively derive the chord under the playback cursor — updates on every time tick
  const currentlyPlayingChord = useMemo((): ChordInstance | null => {
    if (!playbackState.isPlaying) return null;
    const chords = activeVerse?.chordProgression || [];
    const currentTime = playbackState.currentTime;
    for (const chord of chords) {
      const chordStartBeat = chord.position / pixelsPerBeat;
      const chordEndBeat = chordStartBeat + chord.duration;
      if (currentTime >= chordStartBeat && currentTime < chordEndBeat) {
        return chord;
      }
    }
    return null;
  }, [playbackState.isPlaying, playbackState.currentTime, activeVerse?.chordProgression, pixelsPerBeat]);

  // Get the chord to display in the diagrams tab
  const displayChord = playbackState.isPlaying ? currentlyPlayingChord : selectedChord;

  const handleBPMChange = (newBPM: number) => {
    if (activeVerseId) {
      updateVerse(activeVerseId, { bpm: newBPM });
      setBPM(newBPM);
    }
  };

  const handleKeyChange = (newKey: string) => {
    if (activeVerseId) {
      updateVerse(activeVerseId, { key: newKey });
    }
  };

  const handleQuickSave = async () => {
    if (!currentProjectId || !currentProjectName) return;

    const result = await updateProject(
      currentProjectId,
      currentProjectName,
      currentProjectDescription,
      verses
    );

    if (result.success) {
      toast({
        title: 'Success',
        description: 'Project saved successfully',
      });
    } else {
      toast({
        title: 'Error',
        description: result.error || 'Failed to save project',
        variant: 'destructive',
      });
    }
  };

  const handleSaveSuccess = (projectId: string, projectName?: string, projectDescription?: string) => {
    setCurrentProjectId(projectId);
    if (projectName) setCurrentProjectName(projectName);
    if (projectDescription !== undefined) setCurrentProjectDescription(projectDescription);
  };

  const handleLoadSuccess = (
    projectId: string,
    loadedVerses: VerseData[],
    projectName: string,
    projectDescription: string
  ) => {
    setCurrentProjectId(projectId);
    setCurrentProjectName(projectName);
    setCurrentProjectDescription(projectDescription);
    setVerses(loadedVerses);
    if (loadedVerses.length > 0) {
      setActiveVerse(loadedVerses[0].id);
    }
  };

  const handleAddChord = (chordSymbol: string, duration: number, voicingIndex?: number) => {
    if (!activeVerse) return;

    // Calculate position at the end of the rightmost chord (not just the last in the array)
    let position = 0;
    if (activeVerse.chordProgression.length > 0) {
      // Find the rightmost chord by checking position + width
      let maxEndPosition = 0;
      activeVerse.chordProgression.forEach(chord => {
        const endPosition = chord.position + chord.width;
        if (endPosition > maxEndPosition) {
          maxEndPosition = endPosition;
        }
      });
      position = maxEndPosition;
    }
    const startTime = position / pixelsPerBeat;

    // Import chord utilities
    const { parseChordSymbol } = require('@/lib/chord-progression/chord-utils');
    const { getChordTones } = require('@/lib/musicTheory');
    const { NOTE_COLORS } = require('@/lib/musicTheory');

    // Parse chord and generate notes
    const { rootNote, quality } = parseChordSymbol(chordSymbol);
    const notes = getChordTones(rootNote, quality);
    const color = NOTE_COLORS[rootNote] || '#3b82f6';

    const newChord = {
      id: `chord-${Date.now()}`,
      chordSymbol,
      chordQuality: quality,
      notes,
      rootNote,
      startTime,
      position,
      width: duration * pixelsPerBeat,
      duration,
      color,
      voicingIndex: voicingIndex ?? 0,
    };

    updateChords([...activeVerse.chordProgression, newChord], `Add chord ${chordSymbol}`);
  };

  const handleEditChord = (chord: ChordInstance) => {
    setEditingChord(chord);
    setShowAddChordModal(true);
  };

  const handleUpdateChord = (chordSymbol: string, duration: number, voicingIndex?: number) => {
    if (!activeVerse || !editingChord) return;

    // Import chord utilities
    const { parseChordSymbol } = require('@/lib/chord-progression/chord-utils');
    const { getChordTones } = require('@/lib/musicTheory');
    const { NOTE_COLORS } = require('@/lib/musicTheory');

    // Parse chord and generate notes
    const { rootNote, quality } = parseChordSymbol(chordSymbol);
    const notes = getChordTones(rootNote, quality);
    const color = NOTE_COLORS[rootNote] || '#3b82f6';

    const updatedChords = activeVerse.chordProgression.map(c =>
      c.id === editingChord.id
        ? {
            ...c,
            chordSymbol,
            chordQuality: quality,
            notes,
            rootNote,
            duration,
            width: duration * pixelsPerBeat,
            color,
            voicingIndex: voicingIndex ?? c.voicingIndex ?? 0,
          }
        : c
    );

    updateChords(updatedChords, `Edit chord to ${chordSymbol}`);
    setEditingChord(null);
  };

  const handleAddScaleMode = (scaleName: string, duration: number) => {
    if (!activeVerse) return;

    // Calculate position at the end of the rightmost scale mode (not just the last in the array)
    let position = 0;
    if (activeVerse.scaleModeAssignments.length > 0) {
      // Find the rightmost scale mode by checking position + width
      let maxEndPosition = 0;
      activeVerse.scaleModeAssignments.forEach(scaleMode => {
        const endPosition = scaleMode.position + scaleMode.width;
        if (endPosition > maxEndPosition) {
          maxEndPosition = endPosition;
        }
      });
      position = maxEndPosition;
    }
    const startTime = position / pixelsPerBeat;

    const newScaleMode: ScaleModeInstance = {
      id: `scale-${Date.now()}`,
      chordId: '', // Not linked to specific chord
      scaleName,
      rootNote: activeVerse.key,
      compatibilityScore: 10, // Default score
      startTime,
      duration,
      position,
      width: duration * pixelsPerBeat,
    };

    updateScaleModes([...activeVerse.scaleModeAssignments, newScaleMode], `Add scale ${scaleName}`);
  };

  // Handler for adding scale from recommendations (with default 4 beat duration)
  const handleAddScaleFromRecommendations = (scaleName: string, rootNote: string) => {
    handleAddScaleMode(scaleName, 4); // Default to 4 beats
  };

  // Handler for generating chord progression updates from compatibility score
  const handleGenerateProgressionUpdates = async () => {
    if (!activeVerse || activeVerse.chordProgression.length === 0) {
      toast({
        title: 'No Progression',
        description: 'Add some chords to your progression first',
        variant: 'destructive',
      });
      return;
    }

    setIsGeneratingUpdates(true);

    // Notify the generator panel to show loading state and switch tabs
    if (generatorPanelRef?.setGeneratingUpdates) {
      generatorPanelRef.setGeneratingUpdates(true);
    }

    try {
      const response = await fetch('/api/chord-progression/generate-progression-updates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentKey: activeVerse.key,
          currentProgression: activeVerse.chordProgression.map(c => c.chordSymbol),
          currentScaleModes: activeVerse.scaleModeAssignments.map(s => s.scaleName),
          compatibilityScore: compatibility?.score,
          compatibilityRationale: compatibility?.rationale,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate updates');
      }

      const data = await response.json();

      // Trigger the generator panel to show the updates
      if (generatorPanelRef?.triggerUpdateRecommendations) {
        generatorPanelRef.triggerUpdateRecommendations(data.updates);
      }

      toast({
        title: 'Success',
        description: `Generated ${data.updates.length} chord progression updates`,
      });
    } catch (error) {
      console.error('Error generating updates:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate chord progression updates',
        variant: 'destructive',
      });

      // Stop generating state on error
      if (generatorPanelRef?.setGeneratingUpdates) {
        generatorPanelRef.setGeneratingUpdates(false);
      }
    } finally {
      setIsGeneratingUpdates(false);
    }
  };

  const handleEditScaleMode = (scaleMode: ScaleModeInstance) => {
    setEditingScaleMode(scaleMode);
    setShowAddScaleModeModal(true);
  };

  const handleUpdateScaleMode = (scaleName: string, duration: number) => {
    if (!activeVerse || !editingScaleMode) return;

    const updatedScaleModes = activeVerse.scaleModeAssignments.map(sm =>
      sm.id === editingScaleMode.id
        ? {
            ...sm,
            scaleName,
            duration,
            width: duration * pixelsPerBeat,
          }
        : sm
    );

    updateScaleModes(updatedScaleModes);
    setEditingScaleMode(null);
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onPlay: play,
    onPause: pause,
    onStop: stop,
    isPlaying: playbackState.isPlaying,
    onSave: () => setShowSaveDialog(true),
    onLoad: () => setShowLoadDialog(true),
    onUndo: undo,
    onRedo: redo,
  });

  return (
    <div className="flex flex-col h-screen text-white" style={{ background: 'var(--mi-bg-void)' }}>
      {/* Branded Navigation Header */}
      <header style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)', flexShrink: 0, position: 'relative' }}>
        <div className="flex items-center gap-4 flex-1">
          {/* Back to Home Button */}
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '0 12px',
              height: 32,
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.7)',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              textDecoration: 'none',
              flexShrink: 0,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)';
              (e.currentTarget as HTMLElement).style.color = '#fff';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
              (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)';
            }}
            title="Back to Musical Insights Home"
          >
            <ChevronLeft size={14} />
            Home
          </a>

          {/* Logo + Label — clickable to home */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <a href="/" title="Go to Musical Insights Home" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
              <Image src="/images/logo-whitetext.png" width={110} height={25} alt="Musical Insights" style={{ objectFit: 'contain', cursor: 'pointer' }} />
            </a>
            <div style={{ width: 1, height: 22, background: 'var(--mi-border-medium)' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-text-secondary)', whiteSpace: 'nowrap' }}>Song Builder</span>
            {currentProjectName && (
              <span style={{ fontSize: 13, color: 'var(--mi-text-muted)', whiteSpace: 'nowrap' }}>— {currentProjectName}</span>
            )}
          </div>

          {/* Hamburger Menu */}
          <HamburgerMenu
            theme={themes.dark}
            showColorfulStrings={showColorfulStrings}
            stringBrightness={stringBrightness}
            onShowColorfulStringsChange={setShowColorfulStrings}
            onStringBrightnessChange={setStringBrightness}
            onSave={() => {
              if (currentProjectId) {
                handleQuickSave();
              } else {
                setShowSaveDialog(true);
              }
            }}
            onSaveAs={() => setShowSaveDialog(true)}
            onLoad={() => setShowLoadDialog(true)}
            onToggleSettings={() => setShowSettings(!showSettings)}
            onLogout={() => {}}
          />

          {/* ── Compact Playback Buttons ── */}
          <div className="ml-3 pl-3 border-l border-[#2a2a2a] flex items-center gap-1">
            <button
              onClick={playbackState.isPlaying ? pause : play}
              title={playbackState.isPlaying ? 'Pause' : 'Play'}
              className="flex items-center justify-center w-7 h-7 rounded-md transition-all hover:bg-white/10 active:scale-95"
              style={{ color: playbackState.isPlaying ? '#facc15' : '#10b981' }}
            >
              {playbackState.isPlaying
                ? <Pause className="w-4 h-4" />
                : <Play className="w-4 h-4" />}
            </button>
            <button
              onClick={stop}
              title="Stop"
              className="flex items-center justify-center w-7 h-7 rounded-md text-white/50 hover:text-white/90 hover:bg-white/10 active:scale-95 transition-all"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={replay}
              title="Replay from start"
              className="flex items-center justify-center w-7 h-7 rounded-md text-white/50 hover:text-white/90 hover:bg-white/10 active:scale-95 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* ── Live Chord Tones HUD — left of CompatibilityScore ── */}
          <div className="ml-3 pl-3 border-l border-[#2a2a2a]">
            <PlayingChordTonesHUD
              playingChord={currentlyPlayingChord}
              isPlaying={playbackState.isPlaying}
              isVisible={showChordTonesHUD as boolean}
              onToggleVisibility={() => setShowChordTonesHUD(!(showChordTonesHUD as boolean))}
            />
          </div>

          {/* Compatibility Score - right of Chord Tones HUD */}
          <div className="ml-3 pl-3 border-l border-[#2a2a2a]">
            <CompatibilityScore
              score={compatibility?.score ?? null}
              rationale={compatibility?.rationale ?? null}
              recommendations={compatibility?.recommendations ?? null}
              isLoading={isAnalyzing}
              error={analysisError}
              onGenerateUpdates={handleGenerateProgressionUpdates}
              isGeneratingUpdates={isGeneratingUpdates}
            />
          </div>
        </div>

        <div className="flex gap-3 items-center">
          {/* Undo/Redo Controls */}
          <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[#333333]">
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              onClick={undo}
              disabled={!canUndo}
              title={lastUndoDescription ? `Undo: ${lastUndoDescription}` : 'Undo (Ctrl+Z)'}
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              onClick={redo}
              disabled={!canRedo}
              title={lastRedoDescription ? `Redo: ${lastRedoDescription}` : 'Redo (Ctrl+Shift+Z)'}
            >
              <Redo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="px-2"
              onClick={() => setShowHistoryModal(true)}
              title="View History"
            >
              <History className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="gap-2 font-semibold"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcutsDialog(true)}
            title="Keyboard Shortcuts"
            className="hover:bg-[#3b82f6]/10"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>

          {/* Back to Visualizer */}
          <a
            href="/"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
          >
            <ChevronLeft size={14} /> Visualizer
          </a>
        </div>
      </header>

      {/* Verse Tabs */}
      <VerseTabsManager
        verses={verses}
        activeVerseId={activeVerseId}
        onVerseSelect={setActiveVerse}
        onVerseAdd={addVerse}
        onVerseUpdate={updateVerse}
        onVerseDelete={deleteVerse}
        onKeyChange={handleKeyChange}
      />

      {/* Main Content Area - Timeline + Generator */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Empty State — shown only when timeline has no chords */}
        {(!activeVerse || activeVerse.chordProgression.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center relative overflow-hidden bg-[#080810]" style={{ minHeight: 240 }}>
            {/* Animated background grid */}
            <div className="absolute inset-0 pointer-events-none" style={{
              backgroundImage: 'linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }} />
            {/* Radial glow */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.10) 0%, transparent 70%)',
            }} />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-6 px-6 text-center max-w-2xl">
              {/* Icon cluster */}
              <div className="relative flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.20) 0%, rgba(139,92,246,0.20) 100%)',
                  border: '1px solid rgba(59,130,246,0.3)',
                  boxShadow: '0 0 40px rgba(59,130,246,0.15), inset 0 1px 0 rgba(255,255,255,0.06)',
                }}>
                  <Music2 className="w-9 h-9 text-[#3b82f6]" style={{ filter: 'drop-shadow(0 0 8px rgba(59,130,246,0.6))' }} />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                  boxShadow: '0 0 12px rgba(245,158,11,0.5)',
                }}>
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-white mb-2" style={{ letterSpacing: '-0.02em' }}>
                  Start Your Progression
                </h2>
                <p className="text-[#888] text-sm leading-relaxed">
                  Build a chord progression from scratch, or let AI generate one for you based on key, genre, and mood — then play it back with full musical insights.
                </p>
              </div>

              {/* Two primary CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                {/* Manual build */}
                <button
                  onClick={() => { setEditingChord(null); setShowAddChordModal(true); }}
                  className="flex-1 group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(37,99,235,0.08) 100%)',
                    border: '1px solid rgba(59,130,246,0.3)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.7)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(59,130,246,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.15)' }}>
                    <Plus className="w-5 h-5 text-[#3b82f6]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Add Chord</div>
                    <div className="text-xs text-[#666] mt-0.5">Build manually, chord by chord</div>
                  </div>
                </button>

                {/* AI generate */}
                <button
                  onClick={() => {
                    generatorScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (generatorPanelRef?.switchToTab) generatorPanelRef.switchToTab('chords');
                  }}
                  className="flex-1 group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.12) 0%, rgba(239,68,68,0.08) 100%)',
                    border: '1px solid rgba(245,158,11,0.3)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.7)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(245,158,11,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
                    <Wand2 className="w-5 h-5 text-[#f59e0b]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Generate with AI</div>
                    <div className="text-xs text-[#666] mt-0.5">Key, genre &amp; mood-based</div>
                  </div>
                </button>

                {/* Genre presets */}
                <button
                  onClick={() => {
                    generatorScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (generatorPanelRef?.switchToTab) generatorPanelRef.switchToTab('genre');
                  }}
                  className="flex-1 group flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(109,40,217,0.08) 100%)',
                    border: '1px solid rgba(139,92,246,0.3)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.7)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 24px rgba(139,92,246,0.2)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,92,246,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
                >
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <GitBranch className="w-5 h-5 text-[#8b5cf6]" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">Genre Presets</div>
                    <div className="text-xs text-[#666] mt-0.5">Jazz, blues, pop &amp; more</div>
                  </div>
                </button>
              </div>

              {/* Quick tip */}
              <p className="text-xs text-[#555]">
                Current key: <span className="text-[#3b82f6] font-semibold">{activeVerse?.key || 'C'}</span>
                &nbsp;·&nbsp;Use the generator below or click any option above to begin
              </p>
            </div>
          </div>
        ) : (
        /* Timeline Visualization — only shown when chords exist */
        <TimelineVisualization
          chords={activeVerse?.chordProgression || []}
          scaleModes={activeVerse?.scaleModeAssignments || []}
          pixelsPerBeat={pixelsPerBeat}
          onPixelsPerBeatChange={setPixelsPerBeat}
          onChordsUpdate={updateChords}
          onScaleModesUpdate={updateScaleModes}
          playbackState={playbackState}
          bpm={activeVerse?.bpm || 120}
          onAddChordClick={() => {
            setEditingChord(null);
            setShowAddChordModal(true);
          }}
          onAddScaleModeClick={() => {
            setEditingScaleMode(null);
            setShowAddScaleModeModal(true);
          }}
          onEditChordClick={handleEditChord}
          onEditScaleModeClick={handleEditScaleMode}
          currentKey={activeVerse?.key || 'C'}
          onKeyChangeClick={() => setShowKeySelector(true)}
          onChordClick={setSelectedChord}
          onSeek={seek}
        />
        )}

        {/* Generator Panel - Always Visible, Below Timeline */}
        <div ref={generatorScrollRef}>
          <GeneratorPanel
            currentKey={activeVerse?.key || 'C'}
            pixelsPerBeat={pixelsPerBeat}
            onProgressionLoad={(chords) => {
              updateChords(chords);
            }}
            currentProgression={activeVerse?.chordProgression || []}
            currentScaleModes={activeVerse?.scaleModeAssignments || []}
            onAddScaleToTimeline={handleAddScaleFromRecommendations}
            onKeyChangeClick={() => setShowKeySelector(true)}
            verseId={activeVerseId || ''}
            selectedChord={displayChord}
            isPlaying={playbackState.isPlaying}
            currentTime={playbackState.currentTime}
            showColorfulStrings={showColorfulStrings}
            onShowColorfulStringsChange={setShowColorfulStrings}
            stringBrightness={stringBrightness}
            onStringBrightnessChange={setStringBrightness}
            selectedInstrument={selectedInstrument}
            activeVerse={activeVerse}
            onVerseUpdate={updateVerse}
            onGeneratorRef={setGeneratorPanelRef}
          />
        </div>
      </div>

      {/* Playback Controls */}
      <PlaybackControls
        isPlaying={playbackState.isPlaying}
        bpm={activeVerse?.bpm || 120}
        currentKey={activeVerse?.key || 'C'}
        selectedInstrument={selectedInstrument}
        volume={volume}
        midiEnabled={midiEnabled}
        audioOutputDevice={audioOutputDevice}
        availableDevices={availableDevices}
        onPlay={play}
        onPause={pause}
        onStop={stop}
        onReplay={replay}
        onBPMChange={handleBPMChange}
        onInstrumentChange={setSelectedInstrument}
        onVolumeChange={setVolume}
        onMidiToggle={setMidiEnabled}
        onAudioOutputChange={setAudioOutputDevice}
      />

      {/* Add/Edit Chord Modal */}
      <AddChordModal
        open={showAddChordModal}
        onOpenChange={(open) => {
          setShowAddChordModal(open);
          if (!open) setEditingChord(null);
        }}
        currentKey={activeVerse?.key || 'C'}
        onChordSelect={editingChord ? handleUpdateChord : handleAddChord}
        editingChord={editingChord}
        currentProgression={activeVerse?.chordProgression || []}
        currentScaleModes={activeVerse?.scaleModeAssignments || []}
        onLoadFullProgression={(symbols) => {
          // Build a fresh progression from scratch with the AI-recommended symbols
          const { parseChordSymbol } = require('@/lib/chord-progression/chord-utils');
          const { getChordTones, NOTE_COLORS } = require('@/lib/musicTheory');
          const defaultDuration = 4;
          let offset = 0;
          const newChords = symbols.map((sym, idx) => {
            const { rootNote, quality } = parseChordSymbol(sym);
            const notes = getChordTones(rootNote, quality);
            const color = NOTE_COLORS[rootNote] || '#3b82f6';
            const chord = {
              id: `chord-${Date.now()}-${idx}`,
              chordSymbol: sym,
              chordQuality: quality,
              notes,
              rootNote,
              startTime: offset,
              position: offset * pixelsPerBeat,
              width: defaultDuration * pixelsPerBeat,
              duration: defaultDuration,
              color,
              voicingIndex: 0,
            };
            offset += defaultDuration;
            return chord;
          });
          updateChords(newChords, `Load AI progression: ${symbols.join(' → ')}`);
        }}
      />

      {/* Add/Edit Scale/Mode Modal */}
      <AddScaleModeModal
        open={showAddScaleModeModal}
        onOpenChange={(open) => {
          setShowAddScaleModeModal(open);
          if (!open) setEditingScaleMode(null);
        }}
        currentKey={activeVerse?.key || 'C'}
        onScaleModeSelect={editingScaleMode ? handleUpdateScaleMode : handleAddScaleMode}
        editingScaleMode={editingScaleMode}
      />

      {/* Save Dialog */}
      <SaveProjectDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        verses={verses}
        currentProjectId={currentProjectId || undefined}
        currentProjectName={currentProjectName}
        currentProjectDescription={currentProjectDescription}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Load Dialog */}
      <LoadProjectDialog
        open={showLoadDialog}
        onOpenChange={setShowLoadDialog}
        onLoadSuccess={handleLoadSuccess}
      />

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        open={showShortcutsDialog}
        onOpenChange={setShowShortcutsDialog}
      />

      {/* Key Selector Dialog */}
      <Dialog open={showKeySelector} onOpenChange={setShowKeySelector}>
        <DialogContent
          className="p-0 overflow-hidden w-fit max-w-none"
          style={{
            background: 'linear-gradient(145deg, #141420 0%, #0e0e18 60%, #0a0a12 100%)',
            border: '1px solid rgba(99,102,241,0.3)',
            boxShadow: '0 0 60px rgba(99,102,241,0.12), 0 24px 48px rgba(0,0,0,0.6)',
          }}
        >
          {/* Premium Header */}
          <div
            className="px-6 pt-5 pb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(99,102,241,0.12) 50%, rgba(139,92,246,0.08) 100%)',
              borderBottom: '1px solid rgba(99,102,241,0.15)',
            }}
          >
            <div className="flex items-center justify-between gap-6 pr-8">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)',
                    boxShadow: '0 4px 16px rgba(99,102,241,0.5)',
                  }}
                >
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-white tracking-tight">
                    Select Musical Key
                  </DialogTitle>
                  <p className="text-xs text-white/40 mt-0.5 font-medium">
                    Choose the tonal center for your progression
                  </p>
                </div>
              </div>

              {/* Previous Section Key badge */}
              {(() => {
                const currentIndex = verses.findIndex(v => v.id === activeVerseId);
                const previousVerse = currentIndex > 0 ? verses[currentIndex - 1] : null;
                if (!previousVerse) return null;
                const prevColor = NOTE_COLORS[getNoteDisplayName(previousVerse.key)] || '#888888';
                return (
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-[10px] text-white/35 font-semibold uppercase tracking-widest">
                      Last Section
                    </p>
                    <div
                      className="px-3 py-1.5 rounded-lg font-bold text-white text-base shadow-lg"
                      style={{
                        backgroundColor: `${prevColor}22`,
                        border: `2px solid ${prevColor}`,
                        boxShadow: `0 0 16px ${prevColor}50`,
                      }}
                    >
                      {getNoteDisplayName(previousVerse.key)}
                    </div>
                    <p className="text-[10px] text-white/30 font-medium">{previousVerse.name}</p>
                  </div>
                );
              })()}
            </div>
          </div>

          <div className="flex gap-0 py-5 px-5">
            {/* Key Selection Grid */}
            <div className="grid grid-cols-4 gap-2 w-72 shrink-0">
              {getNotesDisplay().map(displayNote => {
                const internalNote = normalizeNoteFromDisplay(displayNote);
                const noteColor = NOTE_COLORS[displayNote] || '#888888';
                const isActive = activeVerse?.key === internalNote;

                return (
                  <button
                    key={displayNote}
                    onClick={() => { handleKeyChange(internalNote); setShowKeySelector(false); }}
                    className="group relative aspect-square rounded-xl font-bold text-white transition-all duration-200 hover:scale-108 active:scale-95 overflow-hidden"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${noteColor} 0%, ${noteColor}bb 100%)`
                        : `linear-gradient(135deg, ${noteColor}28 0%, ${noteColor}12 100%)`,
                      border: isActive
                        ? `2px solid ${noteColor}`
                        : `1px solid ${noteColor}40`,
                      boxShadow: isActive
                        ? `0 0 24px ${noteColor}70, 0 6px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.25)`
                        : `0 2px 6px rgba(0,0,0,0.25)`,
                    }}
                  >
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: `linear-gradient(135deg, transparent, ${noteColor}35, transparent)` }}
                    />
                    <span className="relative z-10 text-base font-bold tracking-wide drop-shadow-md">
                      {displayNote}
                    </span>
                    {isActive && (
                      <div
                        className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white"
                        style={{ boxShadow: `0 0 6px ${noteColor}` }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div
              className="mx-5 shrink-0"
              style={{ width: '1px', background: 'linear-gradient(to bottom, transparent, rgba(99,102,241,0.2), transparent)' }}
            />

            {/* Circle of 5ths */}
            <div className="shrink-0 pr-2">
              <CircleOf5ths
                theme={themes.dark}
                currentKey={activeVerse?.key || 'C'}
                onKeySelect={(key) => { handleKeyChange(key); setShowKeySelector(false); }}
                compactMode={false}
                hideControls={true}
                circleSize={380}
                noteCircleScale={1.6}
                previousSectionKey={(() => {
                  const currentIndex = verses.findIndex(v => v.id === activeVerseId);
                  const previousVerse = currentIndex > 0 ? verses[currentIndex - 1] : null;
                  return previousVerse?.key || null;
                })()}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Modal */}
      <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
        <DialogContent className="bg-[#1a1a1a] border-[#333333] text-white max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5" />
              Action History Timeline
            </DialogTitle>
            <p className="text-xs text-[#888888] mt-1">
              Click "Restore" to jump to any previous state
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {(() => {
              const undoHistory = getUndoHistory();
              const redoHistory = getRedoHistory();
              const totalHistory = undoHistory.length + redoHistory.length;

              if (totalHistory === 0) {
                return (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="w-12 h-12 text-[#333333] mb-3" />
                    <p className="text-sm text-[#666666]">No actions in history yet</p>
                    <p className="text-xs text-[#444444] mt-1">Make changes to see them here</p>
                  </div>
                );
              }

              // Build unified timeline: redo items (future) + current state + undo items (past)
              const timeline: Array<{
                description: string;
                index: number;
                type: 'undo' | 'redo' | 'current';
                timestamp: number;
              }> = [];

              // Add redo items (future states) - reversed so most recent redo is first
              redoHistory.slice().reverse().forEach((entry, i) => {
                timeline.push({
                  description: entry.description,
                  index: redoHistory.length - 1 - i,
                  type: 'redo',
                  timestamp: entry.timestamp,
                });
              });

              // Add current state marker
              timeline.push({
                description: 'Current State',
                index: -1,
                type: 'current',
                timestamp: Date.now(),
              });

              // Add undo items (past states) - reversed so most recent is first
              undoHistory.slice().reverse().forEach((entry, i) => {
                timeline.push({
                  description: entry.description,
                  index: undoHistory.length - 1 - i,
                  type: 'undo',
                  timestamp: entry.timestamp,
                });
              });

              return (
                <div className="space-y-1.5 py-2">
                  {timeline.map((item, timelineIndex) => {
                    const isCurrent = item.type === 'current';
                    const isRedo = item.type === 'redo';
                    const isUndo = item.type === 'undo';

                    return (
                      <div
                        key={timelineIndex}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-r from-[#3b82f6]/20 to-[#6366f1]/20 border-2 border-[#3b82f6] shadow-lg'
                            : isRedo
                            ? 'bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#10b981]/50'
                            : 'bg-[#0a0a0a] border border-[#2a2a2a] hover:border-[#3b82f6]/50'
                        }`}
                      >
                        {/* Timeline connector */}
                        <div className="flex flex-col items-center gap-1">
                          {isCurrent ? (
                            <div className="w-3 h-3 rounded-full bg-[#3b82f6] shadow-lg shadow-[#3b82f6]/50" />
                          ) : isRedo ? (
                            <Redo className="w-4 h-4 text-[#10b981]" />
                          ) : (
                            <Undo className="w-4 h-4 text-[#888888]" />
                          )}
                        </div>

                        {/* Description */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${isCurrent ? 'text-[#3b82f6]' : 'text-white'}`}>
                            {item.description}
                          </p>
                          {!isCurrent && (
                            <p className="text-xs text-[#666666] mt-0.5">
                              {isRedo ? 'Future state' : 'Past state'} • {new Date(item.timestamp).toLocaleTimeString()}
                            </p>
                          )}
                        </div>

                        {/* Restore button */}
                        {!isCurrent && (
                          <Button
                            size="sm"
                            variant="outline"
                            className={`gap-1.5 font-semibold ${
                              isRedo
                                ? 'border-[#10b981] text-[#10b981] hover:bg-[#10b981]/10'
                                : 'border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10'
                            }`}
                            onClick={() => {
                              if (isRedo) {
                                restoreToRedoState(item.index);
                              } else {
                                restoreToUndoState(item.index);
                              }
                              setShowHistoryModal(false);
                              toast({
                                title: 'State Restored',
                                description: `Restored to: ${item.description}`,
                              });
                            }}
                          >
                            {isRedo ? <Redo className="w-3.5 h-3.5" /> : <Undo className="w-3.5 h-3.5" />}
                            Restore
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

