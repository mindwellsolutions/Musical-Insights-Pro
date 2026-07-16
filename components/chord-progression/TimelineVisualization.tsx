'use client';

/**
 * Timeline visualization container with tracks and ruler
 * Now includes fixed TrackSidebar on the left
 */

import { useRef, useState } from 'react';
import { ChordInstance, ScaleModeInstance, PlaybackState } from '@/lib/chord-progression/types';
import { useTimelineSelection } from '@/hooks/chord-progression/useTimelineSelection';
import { ZOOM_LEVELS, getTotalDuration } from '@/lib/chord-progression/timeline-utils';
import TimeRuler from './TimeRuler';
import ChordProgressionTrack from './ChordProgressionTrack';
import ScaleModeTrack from './ScaleModeTrack';
import PlaybackCursor from './PlaybackCursor';
import TrackSidebar from './TrackSidebar';
import AIInsightsModal from './AIInsightsModal';
import { Button } from '@/components/ui/button';

interface TimelineVisualizationProps {
  chords: ChordInstance[];
  scaleModes: ScaleModeInstance[];
  pixelsPerBeat: number;
  onPixelsPerBeatChange: (value: number) => void;
  onChordsUpdate: (chords: ChordInstance[]) => void;
  onScaleModesUpdate: (scaleModes: ScaleModeInstance[]) => void;
  playbackState: PlaybackState;
  bpm: number;
  onAddChordClick?: () => void;
  onAddScaleModeClick?: () => void;
  onEditChordClick?: (chord: ChordInstance) => void;
  onEditScaleModeClick?: (scaleMode: ScaleModeInstance) => void;
  currentKey?: string;
  onKeyChangeClick?: () => void;
  onChordClick?: (chord: ChordInstance) => void;
  onSeek?: (beats: number) => void;
}

export default function TimelineVisualization({
  chords,
  scaleModes,
  pixelsPerBeat,
  onPixelsPerBeatChange,
  onChordsUpdate,
  onScaleModesUpdate,
  playbackState,
  bpm,
  onAddChordClick,
  onAddScaleModeClick,
  onEditChordClick,
  onEditScaleModeClick,
  currentKey,
  onKeyChangeClick,
  onChordClick,
  onSeek,
}: TimelineVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Shared cross-track selection — Shift+click adds blocks from either track
  const {
    selectedChordIds,
    selectedScaleModeIds,
    setSelectedChordIds,
    setSelectedScaleModeIds,
    handleChordSelect,
    handleScaleModeSelect,
    clearAll: clearAllSelections,
  } = useTimelineSelection();

  const [tracks, setTracks] = useState([
    { id: 'chord-track', name: 'Chords', type: 'chord' as const, isMuted: false, isSolo: false },
    { id: 'scale-track', name: 'Scales', type: 'scale' as const, isMuted: false, isSolo: false },
  ]);
  const [showAIInsights, setShowAIInsights] = useState(false);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState(false);
  const [aiInsightsTrackType, setAIInsightsTrackType] = useState<'chord' | 'scale'>('chord');

  // Calculate total duration from both chords and scale modes
  const chordDuration = getTotalDuration(chords) || 0;
  const scaleModeDuration = scaleModes.length > 0
    ? Math.max(...scaleModes.map(sm => sm.startTime + sm.duration))
    : 0;
  const totalDuration = Math.max(chordDuration, scaleModeDuration, 16); // Minimum 16 beats

  // Add generous buffer space at the end (16 beats) to allow for expansion
  const timelineWidth = (totalDuration + 16) * pixelsPerBeat;

  const handleAddClick = (trackId: string) => {
    if (trackId === 'chord-track' && onAddChordClick) {
      onAddChordClick();
    } else if (trackId === 'scale-track' && onAddScaleModeClick) {
      onAddScaleModeClick();
    }
  };

  const handleMuteToggle = (trackId: string) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, isMuted: !track.isMuted } : track
    ));
  };

  const handleSoloToggle = (trackId: string) => {
    setTracks(prev => prev.map(track =>
      track.id === trackId ? { ...track, isSolo: !track.isSolo } : track
    ));
  };

  const handleAIInsightsClick = (trackId: string) => {
    const trackType = trackId === 'chord-track' ? 'chord' : 'scale';
    setAIInsightsTrackType(trackType);
    setShowAIInsights(true);
  };

  const handleApplyRecommendation = (recommendation: any) => {
    if (aiInsightsTrackType === 'chord' && recommendation.chords) {
      // Convert recommendation chords to ChordInstance format
      const newChords = recommendation.chords.map((chord: any, index: number) => {
        const startTime = index * chord.duration;
        return {
          id: crypto.randomUUID(),
          chordSymbol: chord.chordSymbol,
          chordQuality: chord.chordQuality || 'major',
          notes: chord.notes || [],
          rootNote: chord.rootNote || chord.chordSymbol.replace(/[^A-G#b]/g, ''),
          startTime,
          duration: chord.duration,
          position: startTime * pixelsPerBeat,
          width: chord.duration * pixelsPerBeat,
          color: chord.color || '#3b82f6',
          voicingIndex: 0,
        };
      });

      // Append to existing chords
      onChordsUpdate([...chords, ...newChords]);
      setShowAIInsights(false);
    }
  };

  return (
    <div className="flex flex-col bg-[#0a0a0a]">
      {/* Main Timeline Section with Sidebar */}
      {!isTimelineCollapsed && (
        <div className="flex overflow-hidden">
          {/* Fixed Track Sidebar */}
          <TrackSidebar
            tracks={tracks}
            onAddClick={handleAddClick}
            onMuteToggle={handleMuteToggle}
            onSoloToggle={handleSoloToggle}
            onAIInsightsClick={handleAIInsightsClick}
            currentKey={currentKey}
            onKeyChange={onKeyChangeClick}
            isTimelineCollapsed={isTimelineCollapsed}
            onToggleCollapse={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
          />

          {/* Scrollable Timeline Area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto relative bg-[#0a0a0a]"
          >
            <div style={{ width: timelineWidth, minHeight: '100%' }}>
              {/* Time Ruler */}
              <TimeRuler
                totalBeats={totalDuration + 16}
                pixelsPerBeat={pixelsPerBeat}
                bpm={bpm}
                chords={chords}
                onSeek={onSeek}
              />

              {/* Chord Progression Track */}
              <ChordProgressionTrack
                chords={chords}
                pixelsPerBeat={pixelsPerBeat}
                onChordsUpdate={onChordsUpdate}
                onEditChord={onEditChordClick}
                onAddChordClick={onAddChordClick}
                onChordClick={onChordClick}
                selectedChordIds={selectedChordIds}
                onChordSelect={handleChordSelect}
                onSetChordSelection={setSelectedChordIds}
                onClearAllSelections={clearAllSelections}
              />

              {/* Scale/Mode Track */}
              <ScaleModeTrack
                scaleModes={scaleModes}
                chords={chords}
                pixelsPerBeat={pixelsPerBeat}
                onScaleModesUpdate={onScaleModesUpdate}
                onAddScaleModeClick={onAddScaleModeClick}
                onEditScaleMode={onEditScaleModeClick}
                selectedScaleModeIds={selectedScaleModeIds}
                onScaleModeSelect={handleScaleModeSelect}
                onSetScaleModeSelection={setSelectedScaleModeIds}
                onClearAllSelections={clearAllSelections}
              />

              {/* Playback Cursor */}
              <PlaybackCursor
                position={playbackState.playbackPosition}
                height={200} // 24px (ruler) + 88px (chord track) + 88px (scale track)
                isPlaying={playbackState.isPlaying}
              />
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Modal */}
      <AIInsightsModal
        open={showAIInsights}
        onOpenChange={setShowAIInsights}
        trackType={aiInsightsTrackType}
        currentChords={chords}
        onApplyRecommendation={handleApplyRecommendation}
      />
    </div>
  );
}

