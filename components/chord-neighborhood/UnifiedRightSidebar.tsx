'use client';

/**
 * Unified Right Sidebar
 * Combines Chord Diagrams and Explore Progressions in a tabbed interface
 */

import { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeConfig } from '@/lib/themes';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import ChordDiagramSidebar from './ChordDiagramSidebar';
import ChordProgressionModal from './ChordProgressionModal';
import { X, Music, Sparkles, ChevronRight, GripVertical } from 'lucide-react';

interface UnifiedRightSidebarProps {
  theme: ThemeConfig;
  isVisible: boolean;
  onClose: () => void;
  
  // Chord Diagrams props
  progressionChords: NearbyChord[];
  tuning?: string[];
  stringCount?: number;
  
  // Explore Progressions props
  rootNote: string;
  triadType: 'major' | 'minor' | 'diminished' | 'augmented';
  nearbyChords: NearbyChord[];
  onUseProgression: (chords: NearbyChord[]) => void;
  
  // Default tab
  defaultTab?: 'diagrams' | 'explore';
}

export default function UnifiedRightSidebar({
  theme,
  isVisible,
  onClose,
  progressionChords,
  tuning = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount = 6,
  rootNote,
  triadType,
  nearbyChords,
  onUseProgression,
  defaultTab = 'diagrams',
}: UnifiedRightSidebarProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [sidebarPosition, setSidebarPosition] = useState(0); // 0 = docked at right edge
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartPosition = useRef(0);

  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    dragStartPosition.current = sidebarPosition;
  };

  // Handle drag move
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = dragStartX.current - e.clientX; // Reversed: dragging left increases position
      const newPosition = Math.max(0, dragStartPosition.current + deltaX); // Prevent negative values
      setSidebarPosition(newPosition);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, sidebarPosition]);

  // Redock to right edge
  const handleRedock = () => {
    setSidebarPosition(0);
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed top-0 h-full w-[400px] flex flex-col shadow-2xl"
      style={{
        background: theme.bgSecondary,
        borderLeft: `1px solid ${theme.border}`,
        right: `${sidebarPosition}px`,
        transition: isDragging ? 'none' : 'right 0.3s ease',
        zIndex: 'var(--cpb-z-right-sidebar)',
      }}
    >
      {/* Drag Handle and Redock Button - Left side */}
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full flex flex-col items-center gap-1"
        style={{
          background: theme.bgSecondary,
          borderLeft: `1px solid ${theme.border}`,
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          borderRadius: '8px 0 0 8px',
          padding: '8px 4px',
        }}
      >
        {/* 6-Dot Drag Handle */}
        <div
          onMouseDown={handleDragStart}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-opacity-80 transition-all"
          style={{
            color: theme.textPrimary,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '3px',
          }}
          title="Drag to reposition sidebar"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: theme.textSecondary,
                opacity: 0.6,
              }}
            />
          ))}
        </div>

        {/* Redock Button */}
        <button
          onClick={handleRedock}
          className="p-1.5 rounded hover:bg-opacity-80 transition-all mt-1"
          style={{
            color: theme.textPrimary,
            background: sidebarPosition > 0 ? theme.bgTertiary : 'transparent',
          }}
          title="Redock sidebar to right edge"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Header with Close Button */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <h2 className="text-xl font-bold" style={{ color: theme.textPrimary }}>
          Chord Tools
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Close sidebar"
        >
          <X className="w-5 h-5" style={{ color: theme.textSecondary }} />
        </button>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'diagrams' | 'explore')} className="flex-1 flex flex-col overflow-hidden">
        {/* Custom Premium Tab Buttons */}
        <div className="flex gap-3 m-4 mb-0 p-1">
          <button
            onClick={() => setActiveTab('explore')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              background: activeTab === 'explore'
                ? 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)'
                : theme.bgTertiary,
              color: activeTab === 'explore' ? '#ffffff' : theme.textSecondary,
              border: activeTab === 'explore'
                ? '3px solid rgba(168, 85, 247, 0.8)'
                : `3px solid ${theme.border}`,
              boxShadow: activeTab === 'explore'
                ? '0 4px 12px rgba(139, 92, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 2px 6px rgba(0, 0, 0, 0.15)',
              outline: activeTab === 'explore' ? 'none' : `1px solid ${theme.border}`,
            }}
          >
            <Sparkles className="w-4 h-4" />
            <span>Explore Progressions</span>
          </button>
          <button
            onClick={() => setActiveTab('diagrams')}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            style={{
              background: activeTab === 'diagrams'
                ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                : theme.bgTertiary,
              color: activeTab === 'diagrams' ? '#ffffff' : theme.textSecondary,
              border: activeTab === 'diagrams'
                ? '3px solid rgba(96, 165, 250, 0.8)'
                : `3px solid ${theme.border}`,
              boxShadow: activeTab === 'diagrams'
                ? '0 4px 12px rgba(59, 130, 246, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                : '0 2px 6px rgba(0, 0, 0, 0.15)',
              outline: activeTab === 'diagrams' ? 'none' : `1px solid ${theme.border}`,
            }}
          >
            <Music className="w-4 h-4" />
            <span>Chord Diagrams</span>
          </button>
        </div>

        {/* Chord Diagrams Tab */}
        <TabsContent value="diagrams" className="flex-1 overflow-hidden mt-0">
          <div className="h-full overflow-y-auto">
            {progressionChords.length > 0 ? (
              <ChordDiagramSidebar
                theme={theme}
                chords={progressionChords}
                isVisible={true}
                onClose={onClose}
                tuning={tuning}
                stringCount={stringCount}
                inline={true}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <Music className="w-16 h-16 mb-4 opacity-30" style={{ color: theme.textSecondary }} />
                <p className="text-lg font-semibold mb-2" style={{ color: theme.textPrimary }}>
                  No Chords Selected
                </p>
                <p className="text-sm" style={{ color: theme.textSecondary }}>
                  Add chords to your progression to see their diagrams here
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Explore Progressions Tab */}
        <TabsContent value="explore" className="flex-1 overflow-hidden mt-0">
          <div className="h-full">
            <ChordProgressionModal
              isOpen={true}
              onClose={onClose}
              rootNote={rootNote}
              triadType={triadType}
              nearbyChords={nearbyChords}
              onUseProgression={onUseProgression}
              inline={true}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

