'use client';

import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { NearbyChord } from '@/lib/music-theory/neighborhood';

interface ChordProgressionRecommendation {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  musicTheoryBasis: string;
  mood: string;
  complexity: number;
}

interface ChordProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rootNote: string;
  triadType: 'major' | 'minor' | 'diminished' | 'augmented';
  nearbyChords: NearbyChord[];
  onUseProgression: (chords: NearbyChord[]) => void;
  inline?: boolean; // New prop to render as inline sidebar instead of modal overlay
  // Shared state props (optional - if not provided, uses local state)
  sharedRecommendations?: ChordProgressionRecommendation[];
  onSharedRecommendationsChange?: (recommendations: ChordProgressionRecommendation[]) => void;
  sharedPrompt?: string;
  onSharedPromptChange?: (prompt: string) => void;
  sharedComplexity?: number;
  onSharedComplexityChange?: (complexity: number) => void;
  sharedLength?: number;
  onSharedLengthChange?: (length: number) => void;
  sharedNumRecommendations?: number;
  onSharedNumRecommendationsChange?: (num: number) => void;
  sharedShowFilters?: boolean;
  onSharedShowFiltersChange?: (show: boolean) => void;
  // Callbacks to change root note and triad type
  onRootNoteChange?: (rootNote: string) => void;
  onTriadTypeChange?: (triadType: 'major' | 'minor' | 'diminished' | 'augmented') => void;
}

export default function ChordProgressionModal({
  isOpen,
  onClose,
  rootNote,
  triadType,
  nearbyChords,
  onUseProgression,
  inline = false,
  sharedRecommendations,
  onSharedRecommendationsChange,
  sharedPrompt,
  onSharedPromptChange,
  sharedComplexity,
  onSharedComplexityChange,
  sharedLength,
  onSharedLengthChange,
  sharedNumRecommendations,
  onSharedNumRecommendationsChange,
  sharedShowFilters,
  onSharedShowFiltersChange,
  onRootNoteChange,
  onTriadTypeChange,
}: ChordProgressionModalProps) {
  // Use shared state if provided, otherwise use local state
  const [localPrompt, setLocalPrompt] = useState('');
  const [localComplexity, setLocalComplexity] = useState(5);
  const [localLength, setLocalLength] = useState(4);
  const [localNumRecommendations, setLocalNumRecommendations] = useState(4);
  const [localRecommendations, setLocalRecommendations] = useState<ChordProgressionRecommendation[]>([]);
  const [localShowFilters, setLocalShowFilters] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local root note and triad type for the sidebar (defaults to parent's values)
  const [localRootNote, setLocalRootNote] = useState(rootNote);
  const [localTriadType, setLocalTriadType] = useState(triadType);

  // Track the root/type used for the current recommendations
  const [recommendationsRootNote, setRecommendationsRootNote] = useState(rootNote);
  const [recommendationsTriadType, setRecommendationsTriadType] = useState(triadType);

  // Update local state when parent props change (e.g., when modal first opens)
  useEffect(() => {
    setLocalRootNote(rootNote);
    setLocalTriadType(triadType);
  }, [rootNote, triadType]);

  // Dropdown state
  const [showRootDropdown, setShowRootDropdown] = useState(false);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const rootDropdownRef = useRef<HTMLDivElement>(null);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (rootDropdownRef.current && !rootDropdownRef.current.contains(event.target as Node)) {
        setShowRootDropdown(false);
      }
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(event.target as Node)) {
        setShowTypeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine which state to use
  const prompt = sharedPrompt !== undefined ? sharedPrompt : localPrompt;
  const setPrompt = onSharedPromptChange || setLocalPrompt;
  const complexity = sharedComplexity !== undefined ? sharedComplexity : localComplexity;
  const setComplexity = onSharedComplexityChange || setLocalComplexity;
  const length = sharedLength !== undefined ? sharedLength : localLength;
  const setLength = onSharedLengthChange || setLocalLength;
  const numRecommendations = sharedNumRecommendations !== undefined ? sharedNumRecommendations : localNumRecommendations;
  const setNumRecommendations = onSharedNumRecommendationsChange || setLocalNumRecommendations;
  const recommendations = sharedRecommendations !== undefined ? sharedRecommendations : localRecommendations;
  const setRecommendations = onSharedRecommendationsChange || setLocalRecommendations;
  const showFilters = sharedShowFilters !== undefined ? sharedShowFilters : localShowFilters;
  const setShowFilters = onSharedShowFiltersChange || setLocalShowFilters;

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setRecommendations([]);

    // Track the root/type used for these recommendations
    setRecommendationsRootNote(localRootNote);
    setRecommendationsTriadType(localTriadType);

    try {
      const response = await fetch('/api/chord-progression/generate-nearby-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rootNote: localRootNote,
          triadType: localTriadType,
          userPrompt: prompt,
          complexity,
          numChords: length,
          numRecommendations,
          nearbyChords: nearbyChords.map(c => ({
            degree: c.degree,
            rootNote: c.rootNote,
            quality: c.quality,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseProgression = (progression: string[]) => {
    // Map progression chord symbols to nearby chords
    // IMPORTANT: Allow duplicate chords in the progression (e.g., I-IV-V-IV-I)
    const orderedChords: NearbyChord[] = [];

    // Debug: Log all available nearby chords
    console.log('🎵 Available nearby chords:', nearbyChords.map(nc => {
      const symbol = `${nc.rootNote}${nc.quality === 'major' ? '' : nc.quality === 'minor' ? 'm' : nc.quality === 'diminished' ? 'dim' : 'aug'}`;
      return `${symbol} (${nc.degree})`;
    }));
    console.log('🎵 Progression to match:', progression);

    progression.forEach(chordSymbol => {
      // Normalize the chord symbol from the progression (remove any extensions/additions)
      const normalizedChordSymbol = chordSymbol.trim();

      const matchingChord = nearbyChords.find(nc => {
        // Build the nearby chord symbol
        const ncSymbol = `${nc.rootNote}${nc.quality === 'major' ? '' : nc.quality === 'minor' ? 'm' : nc.quality === 'diminished' ? 'dim' : 'aug'}`;

        // Try exact match first
        if (normalizedChordSymbol === ncSymbol) {
          return true;
        }

        // Try matching with the chord symbol starting with the nearby chord symbol
        // This handles cases like "Cmaj7" matching "C" or "Am7" matching "Am"
        if (normalizedChordSymbol.startsWith(ncSymbol)) {
          // Make sure we're not matching "B" to "Bm" - check that the next character isn't a quality indicator
          const nextChar = normalizedChordSymbol[ncSymbol.length];
          if (!nextChar || !['m', 'd', 'a', '°', '+'].includes(nextChar)) {
            return true;
          }
        }

        // Also try matching just by root note if the quality matches
        if (normalizedChordSymbol === nc.rootNote && nc.quality === 'major') {
          return true;
        }

        return false;
      });

      // Add the chord even if it's a duplicate - progressions often repeat chords
      if (matchingChord) {
        orderedChords.push(matchingChord);
      } else {
        console.warn(`Could not find matching chord for: ${chordSymbol}`);
      }
    });

    console.log('Progression chords:', progression);
    console.log('Matched chords:', orderedChords.map(c => `${c.rootNote}${c.quality === 'major' ? '' : c.quality === 'minor' ? 'm' : c.quality === 'diminished' ? 'dim' : 'aug'}`));

    // Check if the recommendations were generated with different root/type than parent settings
    // If so, update parent settings first before loading the progression
    if (recommendationsRootNote !== rootNote || recommendationsTriadType !== triadType) {
      console.log(`🎸 Updating triad settings from ${rootNote} ${triadType} to ${recommendationsRootNote} ${recommendationsTriadType}`);

      // Update parent's root note and triad type
      if (onRootNoteChange && recommendationsRootNote !== rootNote) {
        onRootNoteChange(recommendationsRootNote);
      }
      if (onTriadTypeChange && recommendationsTriadType !== triadType) {
        onTriadTypeChange(recommendationsTriadType);
      }

      // Note: The parent will re-render with new root/type, which will trigger fretboard updates
      // We'll call onUseProgression after a brief delay to ensure state has updated
      setTimeout(() => {
        onUseProgression(orderedChords);
      }, 100);
    } else {
      // Root/type matches, proceed immediately
      onUseProgression(orderedChords);
    }

    // Don't auto-close the sidebar - let user close it manually
  };

  const presetPrompts = [
    'Emotional and melancholic',
    'Uplifting and energetic',
  ];

  // Available root notes and triad types
  const rootNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const triadTypes: Array<'major' | 'minor' | 'diminished' | 'augmented'> = ['major', 'minor', 'diminished', 'augmented'];

  // Content component that can be used in both modal and inline modes
  const content = (
    <div className={inline ? "bg-[#1a1a1a] rounded-xl shadow-2xl w-full h-full overflow-hidden flex flex-col" : "bg-[#1a1a1a] rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"}>
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Explore Chord Progressions</h2>
            <div className="flex items-center gap-2 text-sm text-[#888888]">
              <span>Root:</span>
              <div className="relative" ref={rootDropdownRef}>
                <button
                  onClick={() => {
                    setShowRootDropdown(!showRootDropdown);
                    setShowTypeDropdown(false);
                  }}
                  className="text-white font-semibold px-2 py-0.5 rounded transition-colors hover:bg-[#2a2a2a] cursor-pointer"
                >
                  {localRootNote}
                </button>
                {showRootDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-[#2a2a2a] border border-[#444444] rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {rootNotes.map(note => (
                      <button
                        key={note}
                        onClick={() => {
                          setLocalRootNote(note);
                          setShowRootDropdown(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm transition-colors ${
                          note === localRootNote ? 'bg-[#3b82f6] text-white' : 'text-[#cccccc] hover:bg-[#3a3a3a]'
                        }`}
                      >
                        {note}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span>•</span>
              <span>Type:</span>
              <div className="relative" ref={typeDropdownRef}>
                <button
                  onClick={() => {
                    setShowTypeDropdown(!showTypeDropdown);
                    setShowRootDropdown(false);
                  }}
                  className="text-white font-semibold px-2 py-0.5 rounded transition-colors hover:bg-[#2a2a2a] cursor-pointer"
                >
                  {localTriadType}
                </button>
                {showTypeDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-[#2a2a2a] border border-[#444444] rounded-lg shadow-lg z-50">
                    {triadTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          setLocalTriadType(type);
                          setShowTypeDropdown(false);
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm transition-colors whitespace-nowrap ${
                          type === localTriadType ? 'bg-[#3b82f6] text-white' : 'text-[#cccccc] hover:bg-[#3a3a3a]'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-[#2a2a2a] transition-colors flex-shrink-0"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-[#888888] hover:text-white transition-colors" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Prompt Input */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-white">Describe your desired chord progression</Label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="e.g., 'Emotional and melancholic' or 'Uplifting and energetic' (Ctrl+Enter to generate)"
              className="min-h-[80px] bg-[#0f0f0f] border-[#333333] text-white placeholder:text-[#666666] focus:border-[#3b82f6] resize-none"
            />

            {/* Preset Prompts */}
            <div className="flex flex-wrap gap-2">
              {presetPrompts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setPrompt(preset)}
                  className="px-3 py-1.5 text-xs rounded-full bg-[#2a2a2a] text-[#b0b0b0] hover:bg-[#3a3a3a] hover:text-white transition-all"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Filters Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
          >
            <span>{showFilters ? 'Hide' : 'Show'} Advanced Options</span>
          </button>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="space-y-4 p-4 bg-[#0f0f0f] rounded-lg border border-[#333333]">
              <div className="space-y-2">
                <Label className="text-sm text-white">Complexity: {complexity}/10</Label>
                <Slider
                  value={[complexity]}
                  onValueChange={(value) => setComplexity(value[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-white">Progression Length: {length} chords</Label>
                <Slider
                  value={[length]}
                  onValueChange={(value) => setLength(value[0])}
                  min={2}
                  max={8}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-white">Number of Recommendations: {numRecommendations}</Label>
                <Slider
                  value={[numRecommendations]}
                  onValueChange={(value) => setNumRecommendations(value[0])}
                  min={1}
                  max={6}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white font-semibold py-6 text-base"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Chord Progressions
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Recommendations Display */}
          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Recommendations</h3>
              {/* Scrollable container - shows max 3 cards at once */}
              <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#444444] scrollbar-track-[#1a1a1a]">
                <div className="grid gap-4">
                  {recommendations.map((rec) => (
                    <div
                      key={rec.id}
                      className="p-5 bg-[#0f0f0f] border border-[#333333] rounded-lg hover:border-[#3b82f6] transition-all"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="text-base font-bold text-white mb-1">{rec.name}</h4>
                          <div className="flex items-center gap-3 text-xs text-[#888888]">
                            <span className="px-2 py-1 bg-[#2a2a2a] rounded">
                              Complexity: {rec.complexity}/10
                            </span>
                            <span className="px-2 py-1 bg-[#2a2a2a] rounded capitalize">
                              {rec.mood}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Progression */}
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-2">
                          {rec.progression.map((chord, idx) => (
                            <div
                              key={idx}
                              className="px-3 py-2 bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] text-white font-bold rounded-lg text-sm"
                            >
                              {chord}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rationale */}
                      <p className="text-sm text-[#b0b0b0] mb-2">{rec.rationale}</p>

                      {/* Music Theory Basis */}
                      <details className="mb-3">
                        <summary className="text-xs text-[#3b82f6] cursor-pointer hover:text-[#60a5fa]">
                          Music Theory Details
                        </summary>
                        <p className="text-xs text-[#888888] mt-2 pl-4">{rec.musicTheoryBasis}</p>
                      </details>

                      {/* Use Progression Button */}
                      <Button
                        onClick={() => handleUseProgression(rec.progression)}
                        className="w-full bg-[#10b981] hover:bg-[#059669] text-white font-semibold"
                      >
                        Use This Progression
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );

  // Return inline or modal version based on prop
  if (inline) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      {content}
    </div>
  );
}

