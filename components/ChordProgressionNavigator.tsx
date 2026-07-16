'use client';

import { useState, useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { NearbyChord } from '@/lib/music-theory/neighborhood';
import { ChevronLeft, ChevronRight, Sparkles, ChevronDown, Plus, X, Music, Save, FolderOpen } from 'lucide-react';
import ChordVoicingSelector from './chord-neighborhood/ChordVoicingSelector';
import { ChordVoicing } from '@/lib/chord-voicings';
import { getChordSymbol } from '@/lib/music-theory/neighborhood/diatonic';

interface ChordProgressionNavigatorProps {
  theme: ThemeConfig;
  nearbyChords: NearbyChord[];
  selectedChord: NearbyChord | null;
  onChordSelect: (chord: NearbyChord) => void;
  chordColors: string[];
  showAllChords?: boolean;
  onShowAllChordsChange?: (show: boolean) => void;
  isPanelExpanded?: boolean;
  onTogglePanel?: () => void;
  selectedChords?: NearbyChord[]; // The progression chords to display as buttons
  onSelectedChordsChange?: (chords: NearbyChord[]) => void;
  enabledChords?: NearbyChord[]; // Which chords from the progression are enabled for fretboard display
  onEnabledChordsChange?: (chords: NearbyChord[]) => void;
  onExploreProgressions?: () => void;
  onChordsReorder?: (chords: NearbyChord[]) => void;
  onBackToTriads?: () => void;
  showAllDiatonicButton?: boolean;
  onShowAllDiatonic?: () => void;
  onVoicingChange?: (chordIndex: number, voicingIndex: number, voicing: ChordVoicing) => void;
  onChordDelete?: (chordIndex: number) => void;
  onAddChord?: () => void;
  showChordDiagrams?: boolean;
  onShowChordDiagramsChange?: (show: boolean) => void;
  onSaveProgression?: () => void;
  onLoadProgression?: () => void;
}

export default function ChordProgressionNavigator({
  theme,
  nearbyChords,
  selectedChord,
  onChordSelect,
  chordColors,
  showAllChords = false,
  onShowAllChordsChange,
  isPanelExpanded = false,
  onTogglePanel,
  selectedChords = [],
  onSelectedChordsChange,
  enabledChords = [],
  onEnabledChordsChange,
  onExploreProgressions,
  onChordsReorder,
  onBackToTriads,
  showAllDiatonicButton = false,
  onShowAllDiatonic,
  onVoicingChange,
  onChordDelete,
  onAddChord,
  showChordDiagrams = false,
  onShowChordDiagramsChange,
  onSaveProgression,
  onLoadProgression,
}: ChordProgressionNavigatorProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [currentDragX, setCurrentDragX] = useState(0);
  const [voicingSelectorOpen, setVoicingSelectorOpen] = useState(false);
  const [selectedChordForVoicing, setSelectedChordForVoicing] = useState<{ chord: NearbyChord; index: number } | null>(null);

  // Display selectedChords if any are selected (from "Use This Progression"), otherwise show nearbyChords
  const displayedChords = selectedChords.length > 0 ? selectedChords : nearbyChords;

  if (displayedChords.length === 0) return null;

  const handlePrevious = () => {
    const currentIndex = selectedChord
      ? displayedChords.findIndex(c => c.degree === selectedChord.degree)
      : -1;
    const prevIndex = currentIndex <= 0 ? displayedChords.length - 1 : currentIndex - 1;
    onChordSelect(displayedChords[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = selectedChord
      ? displayedChords.findIndex(c => c.degree === selectedChord.degree)
      : -1;
    const nextIndex = (currentIndex + 1) % displayedChords.length;
    onChordSelect(displayedChords[nextIndex]);
  };

  const handleCheckboxToggle = (chord: NearbyChord) => {
    if (!onEnabledChordsChange) return;

    // Toggle the chord in the enabledChords list (for fretboard display)
    // Keep selectedChords intact (for button display)
    const isEnabled = enabledChords.some(c => c.degree === chord.degree && c.rootNote === chord.rootNote);
    if (isEnabled) {
      onEnabledChordsChange(enabledChords.filter(c => !(c.degree === chord.degree && c.rootNote === chord.rootNote)));
    } else {
      onEnabledChordsChange([...enabledChords, chord]);
    }
  };

  const handleVoicingClick = (chord: NearbyChord, index: number) => {
    setSelectedChordForVoicing({ chord, index });
    setVoicingSelectorOpen(true);
  };

  const handleVoicingSelect = (voicingIndex: number, voicing: ChordVoicing) => {
    if (selectedChordForVoicing && onVoicingChange) {
      onVoicingChange(selectedChordForVoicing.index, voicingIndex, voicing);
    }
    setVoicingSelectorOpen(false);
    setSelectedChordForVoicing(null);
  };

  const handleDeleteChord = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onChordDelete) {
      onChordDelete(index);
    }
  };

  // Mouse-based dragging for smoother experience
  const handleMouseDown = (e: React.MouseEvent, index: number) => {
    // Don't start drag if clicking on the selection dot
    const target = e.target as HTMLElement;
    if (target.closest('.selection-dot')) {
      return;
    }

    setDraggedIndex(index);
    setIsDragging(true);
    setDragStartX(e.clientX);
    setCurrentDragX(e.clientX);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || draggedIndex === null) return;

    setCurrentDragX(e.clientX);

    // Calculate which index we're hovering over based on mouse position
    const container = document.querySelector('.chord-buttons-container');
    if (container) {
      const buttons = container.querySelectorAll('.chord-button-wrapper');
      let newDragOverIndex = draggedIndex;

      buttons.forEach((button, index) => {
        const rect = button.getBoundingClientRect();
        if (e.clientX >= rect.left && e.clientX <= rect.right) {
          newDragOverIndex = index;
        }
      });

      setDragOverIndex(newDragOverIndex);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || draggedIndex === null) return;

    // Perform the reorder if we're over a different index
    if (dragOverIndex !== null && dragOverIndex !== draggedIndex) {
      const reordered = [...displayedChords];
      const [draggedChord] = reordered.splice(draggedIndex, 1);
      reordered.splice(dragOverIndex, 0, draggedChord);

      // If we're displaying selectedChords, update them directly
      if (selectedChords.length > 0 && onSelectedChordsChange) {
        onSelectedChordsChange(reordered);
      } else if (onChordsReorder) {
        // Otherwise, notify parent of reordering nearbyChords
        onChordsReorder(reordered);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    setIsDragging(false);
    setDragStartX(0);
    setCurrentDragX(0);
  };

  // Add global mouse event listeners for smooth dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, draggedIndex, dragOverIndex]);

  // Calculate transform for dragged element
  const getDragTransform = (index: number) => {
    if (draggedIndex === index && isDragging) {
      const deltaX = currentDragX - dragStartX;
      return `translateX(${deltaX}px)`;
    }
    return 'translateX(0)';
  };

  return (
    <>
      <div className="flex flex-col gap-2 flex-1">
        {/* Top Row: Label, Show All Toggle, Expand Button, and Explore Button */}
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            {/* Nearby Diatonic Chords Label */}
            <span className="text-sm font-semibold whitespace-nowrap" style={{ color: theme.textSecondary }}>
              Nearby Diatonic Chords
            </span>

            {/* Save and Load Buttons */}
            {(onSaveProgression || onLoadProgression) && (
              <div className="flex items-center gap-1">
                {onSaveProgression && (
                  <button
                    onClick={onSaveProgression}
                    className="p-1.5 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: theme.bgTertiary,
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary
                    }}
                    title="Save Progression"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                )}
                {onLoadProgression && (
                  <button
                    onClick={onLoadProgression}
                    className="p-1.5 rounded-lg transition-all hover:scale-110"
                    style={{
                      background: theme.bgTertiary,
                      border: `1px solid ${theme.border}`,
                      color: theme.textPrimary
                    }}
                    title="Load Progression"
                  >
                    <FolderOpen className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Show All Toggle Switch - with border */}
            {onShowAllChordsChange && (
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-lg"
                style={{
                  border: `1px solid ${theme.border}`,
                  background: 'rgba(0, 0, 0, 0.1)',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                  Show All
                </span>
                <button
                  onClick={() => onShowAllChordsChange(!showAllChords)}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-all shadow-sm"
                  style={{
                    background: showAllChords ? theme.accentPrimary : '#4b5563',
                    border: `2px solid ${showAllChords ? theme.accentPrimary : '#6b7280'}`,
                  }}
                  title={showAllChords ? 'Hide all chords' : 'Show all chords'}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md"
                    style={{
                      transform: showAllChords ? 'translateX(18px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>
            )}

            {/* Chord Diagrams Toggle Switch - with border */}
            {onShowChordDiagramsChange && selectedChords && selectedChords.length > 0 && (
              <div
                className="flex items-center gap-2 px-2 py-1 rounded-lg"
                style={{
                  border: `1px solid ${theme.border}`,
                  background: 'rgba(0, 0, 0, 0.1)',
                }}
              >
                <span className="text-xs font-semibold" style={{ color: theme.textSecondary }}>
                  Chord Diagrams
                </span>
                <button
                  onClick={() => onShowChordDiagramsChange(!showChordDiagrams)}
                  className="relative inline-flex h-5 w-9 items-center rounded-full transition-all shadow-sm"
                  style={{
                    background: showChordDiagrams ? theme.accentPrimary : '#4b5563',
                    border: `2px solid ${showChordDiagrams ? theme.accentPrimary : '#6b7280'}`,
                  }}
                  title={showChordDiagrams ? 'Hide chord diagrams' : 'Show chord diagrams'}
                >
                  <span
                    className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-md"
                    style={{
                      transform: showChordDiagrams ? 'translateX(18px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>
            )}

            {/* All Diatonic Chords Button - Show when a progression is loaded */}
            {showAllDiatonicButton && onShowAllDiatonic && (
              <button
                onClick={onShowAllDiatonic}
                className="group relative overflow-hidden rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)',
                }}
              >
                <span className="relative z-10">All Diatonic Chords</span>
                {/* Hover effect overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />
              </button>
            )}

            {/* Back to Triads Button */}
            {onBackToTriads && (
              <button
                onClick={onBackToTriads}
                className="group relative overflow-hidden rounded-lg px-3 py-1.5 text-sm font-semibold transition-all duration-300 hover:shadow-xl active:scale-[0.98]"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 15px rgba(139, 92, 246, 0.3)',
                }}
              >
                <span className="relative z-10">Back to Triads</span>
                {/* Hover effect overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)',
                  }}
                />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Chord Diagrams Button - Opens right sidebar to Chord Diagrams tab */}
            {onShowChordDiagramsChange && (
              <button
                onClick={() => onShowChordDiagramsChange(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                }}
                title="View chord diagrams"
              >
                <Music className="w-4 h-4" />
                Chord Diagrams
              </button>
            )}

            {/* Recommend Progressions Button - Opens right sidebar to Explore Progressions tab */}
            {onTogglePanel && (
              <button
                onClick={onTogglePanel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:opacity-80 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
                  color: '#ffffff',
                  boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
                }}
                title={isPanelExpanded ? "Close chord progression explorer" : "Explore AI-powered chord progressions"}
              >
                <Sparkles className="w-4 h-4" />
                Recommend Progressions
                {isPanelExpanded ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Bottom Row: Navigation and Chords */}
        <div className="flex items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            className="p-2 rounded transition-all hover:opacity-80"
            style={{
              background: theme.buttonPrimary,
              color: '#ffffff',
            }}
            title="Previous chord"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Chord Buttons with Checkboxes */}
          <div className="flex gap-2 chord-buttons-container">
            {displayedChords.map((chord, index) => {
              const isSelected = selectedChord?.degree === chord.degree;
              const isChecked = enabledChords.some(c => c.degree === chord.degree && c.rootNote === chord.rootNote);
              const isCurrentlyDragging = draggedIndex === index && isDragging;
              const isDragOver = dragOverIndex === index;
              const color = chordColors[index % chordColors.length];
              const chordSymbol = `${chord.rootNote}${chord.quality === 'major' ? '' : chord.quality === 'minor' ? 'm' : chord.quality === 'diminished' ? 'dim' : 'aug'}`;

              return (
                <div
                  key={`${chord.degree}-${chord.rootNote}-${index}`}
                  className="relative chord-button-wrapper"
                  onMouseDown={(e) => handleMouseDown(e, index)}
                  style={{
                    opacity: isCurrentlyDragging ? 0.7 : 1,
                    transform: getDragTransform(index),
                    transition: isCurrentlyDragging ? 'none' : 'all 0.2s ease',
                    cursor: isCurrentlyDragging ? 'grabbing' : 'grab',
                    zIndex: isCurrentlyDragging ? 1000 : 1,
                  }}
                >
                  {/* Chord Button with integrated toggle switch */}
                  <button
                    onClick={(e) => {
                      // Always toggle the switch when button is clicked
                      if (onEnabledChordsChange) {
                        e.stopPropagation();
                        handleCheckboxToggle(chord);
                      }
                    }}
                    className="relative text-center px-5 py-4 rounded-lg font-bold text-base transition-all hover:opacity-80 hover:scale-105 flex flex-col items-center justify-center"
                    style={{
                      background: color,
                      color: '#ffffff',
                      border: isSelected ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid transparent',
                      boxShadow: isSelected
                        ? `0 0 16px ${color}, 0 2px 6px rgba(0,0,0,0.3)`
                        : `0 0 8px ${color}66, 0 2px 4px rgba(0,0,0,0.2)`,
                      minWidth: '90px',
                      minHeight: '60px',
                    }}
                    title={`${chord.degree} - ${chordSymbol} (Drag to reorder)`}
                  >
                    {/* Toggle Switch - Top Right Corner */}
                    {onSelectedChordsChange && (
                      <div
                        className="absolute top-2 right-2 selection-dot cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCheckboxToggle(chord);
                        }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        {/* Toggle Switch Container */}
                        <div
                          className="relative rounded-full transition-all"
                          style={{
                            width: '28px',
                            height: '16px',
                            background: isChecked ? '#10b981' : 'rgba(255, 255, 255, 0.3)',
                            border: '2px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: isChecked ? '0 0 8px rgba(16, 185, 129, 0.6), inset 0 1px 3px rgba(0,0,0,0.2)' : 'inset 0 1px 3px rgba(0,0,0,0.2)',
                          }}
                        >
                          {/* Toggle Switch Knob */}
                          <div
                            className="absolute top-0 rounded-full transition-all"
                            style={{
                              width: '12px',
                              height: '12px',
                              background: '#ffffff',
                              left: isChecked ? '12px' : '0px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                            }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Chord content - centered below toggle switch */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <span className="text-lg">{chord.degree}</span>
                      <span
                        className="text-sm px-2.5 py-1 rounded-full font-semibold"
                        style={{
                          background: 'rgba(255, 255, 255, 0.25)',
                        }}
                      >
                        {chordSymbol}
                      </span>
                    </div>
                  </button>

                  {/* Down Arrow Button for Voicing Selection */}
                  {onVoicingChange && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVoicingClick(chord, index);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 p-1 rounded-full transition-all hover:scale-110"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                      }}
                      title="Select chord voicing"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}

                  {/* Delete Button */}
                  {onChordDelete && selectedChords.length > 0 && (
                    <button
                      onClick={(e) => handleDeleteChord(index, e)}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="absolute top-1 left-1 p-1 rounded-full transition-all hover:scale-110 hover:bg-red-500"
                      style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(4px)',
                      }}
                      title="Remove chord"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Chord Button */}
          {onAddChord && selectedChords.length > 0 && (
            <button
              onClick={onAddChord}
              className="p-2 rounded-lg transition-all hover:opacity-80 hover:scale-105 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                minWidth: '60px',
                minHeight: '60px',
                boxShadow: '0 0 8px rgba(16, 185, 129, 0.4)',
              }}
              title="Add chord to progression"
            >
              <Plus className="w-6 h-6" />
            </button>
          )}

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="p-2 rounded transition-all hover:opacity-80"
            style={{
              background: theme.buttonPrimary,
              color: '#ffffff',
            }}
            title="Next chord"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Chord Voicing Selector Modal */}
      {selectedChordForVoicing && (
        <ChordVoicingSelector
          open={voicingSelectorOpen}
          onOpenChange={setVoicingSelectorOpen}
          chordSymbol={selectedChordForVoicing.chord.chordSymbol || getChordSymbol(selectedChordForVoicing.chord.rootNote, selectedChordForVoicing.chord.quality)}
          rootNote={selectedChordForVoicing.chord.rootNote}
          chordNotes={selectedChordForVoicing.chord.chordNotes || selectedChordForVoicing.chord.nearestVoicing.notes}
          currentVoicingIndex={selectedChordForVoicing.chord.selectedVoicingIndex}
          currentFretPosition={selectedChordForVoicing.chord.nearestVoicing.frets[0] || 0}
          onVoicingSelect={handleVoicingSelect}
          theme={theme}
        />
      )}
    </>
  );
}

