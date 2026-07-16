'use client';

/**
 * Chord Voicing Selector Modal
 * Shows all available voicings for a chord organized by categories and CAGED shapes
 * with live chord diagram preview and AI-generated descriptions
 */

import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChordVoicing } from '@/lib/chord-voicings';
import { getChordVoicingsByCAGED } from '@/lib/chord-voicings-database';
import { getNearestCAGEDShape, type CAGEDShapeName } from '@/lib/chord-voicings-database';
import { getComprehensiveChordVoicings, type EnhancedChordVoicing } from '@/lib/enhanced-chord-voicings-database';
import ChordDiagram from '@/components/ChordDiagram';
import { ThemeConfig, themes } from '@/lib/themes';
import { X, Music2 } from 'lucide-react';

interface ChordVoicingSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chordSymbol: string;
  rootNote: string;
  chordNotes: string[];
  currentVoicingIndex?: number;
  currentFretPosition?: number; // The fret position of the current chord
  onVoicingSelect: (voicingIndex: number, voicing: ChordVoicing) => void;
  tuning?: string[];
  stringCount?: number;
  theme?: ThemeConfig;
}

export default function ChordVoicingSelector({
  open,
  onOpenChange,
  chordSymbol,
  rootNote,
  chordNotes,
  currentVoicingIndex = 0,
  currentFretPosition = 0,
  onVoicingSelect,
  tuning = ['E', 'A', 'D', 'G', 'B', 'E'],
  stringCount = 6,
  theme: themeProp,
}: ChordVoicingSelectorProps) {
  // Ensure theme is always defined
  const theme: ThemeConfig = themeProp || themes.dark;
  // Parse quality from chord symbol
  const quality = useMemo(() => {
    const symbol = chordSymbol.replace(rootNote, '');

    // Debug logging for C# and F# chords
    if (rootNote === 'C#' || rootNote === 'F#') {
      console.log(`[ChordVoicingSelector] Parsing chord: ${chordSymbol}, rootNote: ${rootNote}, symbol: ${symbol}`);
    }

    // Check more specific patterns first to avoid false matches
    if (symbol.includes('dim')) return 'diminished';
    if (symbol.includes('aug')) return 'augmented';
    if (symbol.includes('maj7')) return 'major7';  // Check before 'm' to avoid false match
    if (symbol.includes('m7')) return 'minor7';    // Check before 'm' to avoid false match
    if (symbol.includes('7')) return 'dominant7';
    if (symbol.includes('m') || symbol.includes('min')) return 'minor';  // Check after maj7/m7

    const result = 'major';
    if (rootNote === 'C#' || rootNote === 'F#') {
      console.log(`[ChordVoicingSelector] Determined quality: ${result}`);
    }
    return result;
  }, [chordSymbol, rootNote]);

  // Get comprehensive voicing database with all categories
  const comprehensiveDatabase = useMemo(() => {
    return getComprehensiveChordVoicings(rootNote, tuning, 15);
  }, [rootNote, tuning]);

  // Get all voicings organized by CAGED shape (for basic triads)
  const voicingDatabase = useMemo(() => {
    return getChordVoicingsByCAGED(rootNote, quality, tuning, 15);
  }, [rootNote, quality, tuning]);

  // Determine the default CAGED shape based on current fret position
  const defaultShape = useMemo(() => {
    const nearest = getNearestCAGEDShape(rootNote, quality, currentFretPosition);
    if (nearest && voicingDatabase.byCAGEDShape.length > 0) {
      const nearestShapeData = voicingDatabase.byCAGEDShape.find(s => s.shapeName === nearest);
      if (nearestShapeData) {
        return `${nearestShapeData.shapeName}-${nearestShapeData.startFret}`;
      }
    }
    const firstShape = voicingDatabase.byCAGEDShape[0];
    return firstShape ? `${firstShape.shapeName}-${firstShape.startFret}` : 'All';
  }, [rootNote, quality, currentFretPosition, voicingDatabase]);

  // Determine the base chord type (major, minor, diminished, augmented) from the quality
  const baseChordType = useMemo(() => {
    // Map quality to base type
    if (quality.includes('minor') || quality.includes('m7') || quality.includes('m9') ||
        quality.includes('m11') || quality.includes('m13') || quality === 'minor') {
      return 'minor';
    }
    if (quality.includes('diminished') || quality.includes('dim')) {
      return 'diminished';
    }
    if (quality.includes('augmented') || quality.includes('aug')) {
      return 'augmented';
    }
    // Default to major for dominant, major7, major9, etc.
    return 'major';
  }, [quality]);

  // Find the category for the current quality
  const initialCategory = useMemo(() => {
    for (const cat of comprehensiveDatabase.byCategory) {
      const qualityDef = cat.chordQualities.find(q => q.quality === quality);
      if (qualityDef) {
        return cat.category;
      }
    }
    return 'Triads';
  }, [quality, comprehensiveDatabase]);

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [selectedQuality, setSelectedQuality] = useState<string>(quality);
  const [selectedShape, setSelectedShape] = useState<string>(defaultShape);
  const [selectedVoicing, setSelectedVoicing] = useState<EnhancedChordVoicing | null>(null);
  const [hoveredVoicing, setHoveredVoicing] = useState<EnhancedChordVoicing | null>(null);
  const [showLiveDetails, setShowLiveDetails] = useState<boolean>(true); // Default to true (Character Live on by default)

  // Load previously selected voicing from localStorage when modal opens
  useEffect(() => {
    if (!open) {
      // Reset selection when modal closes
      setSelectedVoicing(null);
      return;
    }

    if (chordSymbol) {
      const storageKey = `voicing-selection-${chordSymbol}`;
      const savedVoicingData = localStorage.getItem(storageKey);

      if (savedVoicingData) {
        try {
          const parsed = JSON.parse(savedVoicingData);
          // Find the matching voicing in the current database
          const matchingVoicing = comprehensiveDatabase.allVoicings.find(
            v => v.name === parsed.name && v.startFret === parsed.startFret
          );
          if (matchingVoicing) {
            setSelectedVoicing(matchingVoicing as EnhancedChordVoicing);
          }
        } catch (error) {
          console.error('Failed to load saved voicing:', error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, chordSymbol]);

  // Get voicings for the selected CAGED shape
  const currentShapeData = useMemo(() => {
    if (selectedShape === 'All') return null;
    return voicingDatabase.byCAGEDShape.find(s => `${s.shapeName}-${s.startFret}` === selectedShape);
  }, [voicingDatabase, selectedShape]);

  // Filter the comprehensive database to only show chords matching the base type
  const filteredDatabase = useMemo(() => {
    return {
      ...comprehensiveDatabase,
      byCategory: comprehensiveDatabase.byCategory.map(category => ({
        ...category,
        chordQualities: category.chordQualities.filter(qualityData => {
          const qualityName = qualityData.quality.toLowerCase();

          // Match based on base chord type
          if (baseChordType === 'minor') {
            return qualityName.includes('minor') || qualityName.includes('m7') ||
                   qualityName.includes('m9') || qualityName.includes('m11') ||
                   qualityName.includes('m13') || qualityName === 'minor' ||
                   qualityName === 'halfdiminished7'; // m7b5 is a minor variant
          }
          if (baseChordType === 'diminished') {
            return qualityName.includes('diminished') || qualityName.includes('dim');
          }
          if (baseChordType === 'augmented') {
            return qualityName.includes('augmented') || qualityName.includes('aug');
          }
          // Major type includes: major, major7, major9, dominant7, dominant9, etc.
          // But NOT minor, diminished, or augmented
          return !qualityName.includes('minor') &&
                 !qualityName.includes('diminished') &&
                 !qualityName.includes('augmented') &&
                 !qualityName.includes('m7') &&
                 !qualityName.includes('m9') &&
                 !qualityName.includes('m11') &&
                 !qualityName.includes('m13') &&
                 qualityName !== 'halfdiminished7';
        }),
      })).filter(category => category.chordQualities.length > 0), // Remove empty categories
    };
  }, [comprehensiveDatabase, baseChordType]);

  // Get current category data from filtered database
  const currentCategoryData = useMemo(() => {
    return filteredDatabase.byCategory.find(c => c.category === selectedCategory);
  }, [filteredDatabase, selectedCategory]);

  // Get current quality voicings
  const currentQualityVoicings = useMemo(() => {
    if (!currentCategoryData) return [];
    const qualityData = currentCategoryData.chordQualities.find(q => q.quality === selectedQuality);
    return qualityData?.voicings || [];
  }, [currentCategoryData, selectedQuality]);

  // Get CAGED shapes for current quality voicings
  const currentCAGEDShapes = useMemo(() => {
    const shapeGroups = new Map<string, typeof currentQualityVoicings>();

    for (const voicing of currentQualityVoicings) {
      if (voicing.cagedShape) {
        const key = `${voicing.cagedShape}-${voicing.startFret}`;
        if (!shapeGroups.has(key)) {
          shapeGroups.set(key, []);
        }
        shapeGroups.get(key)!.push(voicing);
      }
    }

    const shapes = Array.from(shapeGroups.entries()).map(([key, voicings]) => {
      const [shapeName, startFretStr] = key.split('-');
      const startFret = parseInt(startFretStr);
      const endFret = Math.max(...voicings.map(v => v.endFret));

      return {
        shapeName,
        startFret,
        endFret,
        voicings: voicings.sort((a, b) => a.startFret - b.startFret),
        key,
      };
    });

    return shapes.sort((a, b) => a.startFret - b.startFret);
  }, [currentQualityVoicings]);

  // Display voicing (must be after currentQualityVoicings is defined)
  const displayVoicing = hoveredVoicing || selectedVoicing || currentQualityVoicings[0] || null;

  const handleVoicingClick = (voicing: EnhancedChordVoicing) => {
    setSelectedVoicing(voicing);
  };

  const handleConfirm = () => {
    if (selectedVoicing) {
      // Save to localStorage
      const storageKey = `voicing-selection-${chordSymbol}`;
      const voicingData = {
        name: selectedVoicing.name,
        startFret: selectedVoicing.startFret
      };
      localStorage.setItem(storageKey, JSON.stringify(voicingData));

      // Find index in the comprehensive database
      const globalIndex = comprehensiveDatabase.allVoicings.findIndex(
        v => v.name === selectedVoicing.name && v.startFret === selectedVoicing.startFret
      );
      onVoicingSelect(globalIndex >= 0 ? globalIndex : 0, selectedVoicing);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[51vw] max-h-[95vh] overflow-hidden flex flex-col border-gray-700"
        style={{
          background: theme?.bgSecondary || '#1a1a1a',
          borderColor: theme?.border || '#374151',
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle
              className="text-2xl font-bold"
              style={{ color: theme?.textPrimary || '#ffffff' }}
            >
              Select Voicing for {chordSymbol}
            </DialogTitle>
          </div>
          <DialogDescription
            className="text-sm"
            style={{ color: theme?.textSecondary || '#9ca3af' }}
          >
            Browse {comprehensiveDatabase.totalVoicings}+ voicings across all chord categories. Select by category, quality, and CAGED position.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-0.5 flex-1 overflow-hidden">
          {/* Left Sidebar - Categories - Show ALL categories with matching chord types */}
          <div
            className="w-36 flex-shrink-0 border-r pr-0.5 overflow-y-auto"
            style={{ borderColor: theme?.border || '#374151' }}
          >
            <h3
              className="text-xs font-bold mb-2 tracking-wider uppercase"
              style={{ color: theme?.textSecondary || '#9ca3af' }}
            >
              Categories
            </h3>
            <div className="space-y-1.5">
              {filteredDatabase.byCategory.map((categoryData) => {
                const isSelected = selectedCategory === categoryData.category;
                return (
                  <button
                    key={categoryData.category}
                    onClick={() => {
                      setSelectedCategory(categoryData.category);
                      // Set first quality in category as default
                      if (categoryData.chordQualities.length > 0) {
                        setSelectedQuality(categoryData.chordQualities[0].quality);
                      }
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg font-semibold transition-all shadow-sm hover:scale-[1.02]"
                    style={{
                      background: isSelected
                        ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                        : theme?.bgTertiary || '#2d2d2d',
                      color: isSelected ? '#ffffff' : theme?.textPrimary || '#e5e7eb',
                      border: isSelected
                        ? '2px solid rgba(59, 130, 246, 0.5)'
                        : `2px solid ${theme?.border || '#374151'}`,
                      boxShadow: isSelected
                        ? '0 2px 6px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                        : '0 1px 2px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <div className="flex items-center gap-1">
                      <Music2 className="w-3.5 h-3.5" />
                      <span className="text-xs">{categoryData.category}</span>
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5 font-normal">
                      {categoryData.chordQualities.length} {categoryData.chordQualities.length === 1 ? 'type' : 'types'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex gap-0.5 flex-1 overflow-hidden">
            {/* Middle Panel - Chord Quality Selector and Voicings */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Chord Quality Pills - Show ALL qualities in selected category */}
              {currentCategoryData && (
                <div
                  className="mb-2 pb-2 border-b"
                  style={{ borderColor: theme?.border || '#374151' }}
                >
                  <h3
                    className="text-xs font-bold mb-1.5 tracking-wider uppercase"
                    style={{ color: theme?.textSecondary || '#9ca3af' }}
                  >
                    {selectedCategory} Chords
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {currentCategoryData.chordQualities.map((qualityData) => {
                      // Format the display name with proper spacing
                      const displayText = qualityData.quality === 'major'
                        ? rootNote
                        : `${rootNote} ${qualityData.displayName}`;

                      const isSelected = selectedQuality === qualityData.quality;

                      return (
                        <button
                          key={qualityData.quality}
                          onClick={() => setSelectedQuality(qualityData.quality)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:scale-[1.02]"
                          style={{
                            background: isSelected
                              ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                              : theme?.bgTertiary || '#2d2d2d',
                            color: isSelected ? '#ffffff' : theme?.textPrimary || '#e5e7eb',
                            border: isSelected
                              ? '2px solid rgba(59, 130, 246, 0.5)'
                              : `2px solid ${theme?.border || '#374151'}`,
                            boxShadow: isSelected
                              ? '0 2px 6px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                              : '0 1px 2px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          {displayText}
                          <span className="ml-1 text-[10px] opacity-75 font-normal">
                            ({qualityData.voicings.length})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* All Voicings - Horizontal List with CAGED Badges */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-5 gap-[2px] p-0.5">
                  {currentQualityVoicings.map((voicing, index) => (
                    <VoicingCard
                      key={`voicing-${index}`}
                      voicing={voicing}
                      isSelected={selectedVoicing === voicing}
                      onClick={() => handleVoicingClick(voicing)}
                      onMouseEnter={() => setHoveredVoicing(voicing)}
                      onMouseLeave={() => setHoveredVoicing(null)}
                      tuning={tuning}
                      stringCount={stringCount}
                      theme={theme}
                      showLiveDetails={showLiveDetails}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Chord Diagram Preview with Description */}
            {displayVoicing && (
              <div className="w-64 flex-shrink-0 flex flex-col gap-2 p-2.5 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <h3 className="text-base font-bold mb-0.5">{chordSymbol}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {displayVoicing.commonName || 'Voicing Preview'}
                  </p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">
                    Fret {displayVoicing.startFret}-{displayVoicing.endFret}
                    {displayVoicing.cagedShape && ` • ${displayVoicing.cagedShape} Shape`}
                  </p>
                </div>

                <div className="flex-1 flex items-center justify-center">
                  <ChordDiagram
                    voicing={displayVoicing}
                    stringCount={stringCount}
                    theme={theme}
                  />
                </div>

                {/* Voicing Description */}
                {displayVoicing.description && (
                  <div className="p-2.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-[10px] font-semibold text-blue-900 dark:text-blue-100">
                        Character
                      </p>
                      {/* Show Live Details Toggle */}
                      <label className="flex items-center gap-1 cursor-pointer">
                        <span className="text-[9px] text-blue-700 dark:text-blue-300">Live</span>
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={showLiveDetails}
                            onChange={(e) => setShowLiveDetails(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-7 h-3.5 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-blue-500 transition-colors"></div>
                          <div className="absolute left-0.5 top-0.5 w-2.5 h-2.5 bg-white rounded-full transition-transform peer-checked:translate-x-3.5"></div>
                        </div>
                      </label>
                    </div>
                    <p className="text-xs leading-relaxed text-blue-800 dark:text-blue-200">
                      {displayVoicing.description}
                    </p>
                    {displayVoicing.emotionalQuality && (
                      <p className="text-[10px] leading-relaxed text-blue-600 dark:text-blue-300 mt-1 italic">
                        {displayVoicing.emotionalQuality}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleConfirm}
                  disabled={!selectedVoicing}
                  className="w-full text-sm py-2"
                  style={{
                    background: selectedVoicing ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : undefined,
                  }}
                >
                  {selectedVoicing ? 'Confirm Selection' : 'Select a Voicing'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Voicing Card Component
interface VoicingCardProps {
  voicing: EnhancedChordVoicing;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  tuning: string[];
  stringCount: number;
  theme?: ThemeConfig;
  showLiveDetails?: boolean;
}

function VoicingCard({
  voicing,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
  tuning,
  stringCount,
  theme: themeProp,
  showLiveDetails = false,
}: VoicingCardProps) {
  // Ensure theme is always defined
  const theme: ThemeConfig = themeProp || themes.dark;
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="p-1 rounded-md border-2 transition-all hover:scale-105 hover:shadow-lg group w-fit mx-auto relative"
      style={{
        borderColor: isSelected ? '#3b82f6' : '#e5e7eb',
        background: isSelected
          ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)'
          : '#ffffff',
        boxShadow: isSelected ? '0 0 10px rgba(59, 130, 246, 0.4)' : '0 1px 2px rgba(0,0,0,0.1)',
      }}
    >
      <div className="flex flex-col items-center gap-1">
        {/* CAGED Shape Badge at Top */}
        {voicing.cagedShape && (
          <div className="absolute top-1 left-1 z-10">
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500 text-white shadow-sm">
              {voicing.cagedShape}
            </span>
          </div>
        )}

        <div className="px-0.5">
          <ChordDiagram
            voicing={voicing}
            stringCount={stringCount}
            theme={theme}
            compact={true}
          />
        </div>
        <div className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 px-1 text-center leading-tight max-w-[108px]">
          {voicing.commonName || `Fret ${voicing.startFret}`}
        </div>

        {/* Live Details - Character Description */}
        {showLiveDetails && voicing.description && (
          <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800 max-w-[156px]">
            <p className="text-[10px] leading-snug text-blue-800 dark:text-blue-200">
              {voicing.description}
            </p>
            {voicing.emotionalQuality && (
              <p className="text-[9px] leading-snug text-blue-600 dark:text-blue-300 mt-1 italic">
                {voicing.emotionalQuality}
              </p>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

