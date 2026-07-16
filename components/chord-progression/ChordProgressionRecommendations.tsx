'use client';

import { useState, useRef, useEffect } from 'react';
import { ChordInstance, InstrumentType, ChordQuality } from '@/lib/chord-progression/types';
import { generateChordVoicing, getChordColor } from '@/lib/chord-progression/chord-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Music, BookOpen, Heart, TrendingUp, Play, Loader2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import ReplaceProgressionModal from './ReplaceProgressionModal';
import { ChordProgressionAudioEngineSmplr } from '@/lib/chord-progression/audio-engine-smplr';
import * as Tone from 'tone';
import { ThemeConfig } from '@/lib/themes';
import RecommendationChordDiagramSidebar from './RecommendationChordDiagramSidebar';

interface ChordProgressionRecommendation {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  musicTheoryBasis: string;
  mood: string;
  complexity: number;
  isModification?: boolean;
  variationType?: string;
}

interface ChordProgressionRecommendationsProps {
  recommendations: ChordProgressionRecommendation[];
  currentKey: string;
  pixelsPerBeat: number;
  onImplement: (chords: ChordInstance[]) => void;
  isModification: boolean;
  currentProgression?: ChordInstance[];
  onSaveProgression?: (name: string) => Promise<void>;
  selectedInstrument?: InstrumentType;
  complexity?: number;
  length?: number;
  currentScaleModes?: string[];
  theme: ThemeConfig;
  isUpdateMode?: boolean;
}

export default function ChordProgressionRecommendations({
  recommendations,
  currentKey,
  pixelsPerBeat,
  onImplement,
  isModification,
  currentProgression = [],
  onSaveProgression,
  selectedInstrument = 'piano',
  complexity = 5,
  length = 4,
  currentScaleModes = [],
  theme,
  isUpdateMode = false,
}: ChordProgressionRecommendationsProps) {
  const [showReplaceModal, setShowReplaceModal] = useState(false);
  const [pendingChords, setPendingChords] = useState<ChordInstance[] | null>(null);
  const [selectedRecId, setSelectedRecId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [currentPreviewChordIndex, setCurrentPreviewChordIndex] = useState<number>(-1);
  const [isLoadingAdditional, setIsLoadingAdditional] = useState(false);
  const [additionalRecommendations, setAdditionalRecommendations] = useState<ChordProgressionRecommendation[]>([]);
  const [expandedVariations, setExpandedVariations] = useState<{ [key: string]: ChordProgressionRecommendation[] }>({});
  const [loadingVariations, setLoadingVariations] = useState<string | null>(null);
  const [showAdditionalSection, setShowAdditionalSection] = useState(false);
  const [showChordDiagramSidebar, setShowChordDiagramSidebar] = useState(false);
  const [selectedProgressionForDiagrams, setSelectedProgressionForDiagrams] = useState<ChordProgressionRecommendation | null>(null);

  const audioEngineRef = useRef<ChordProgressionAudioEngineSmplr | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio engine
  useEffect(() => {
    if (typeof window === 'undefined') return;

    audioContextRef.current = new AudioContext();
    audioEngineRef.current = new ChordProgressionAudioEngineSmplr(audioContextRef.current, {
      instrument: selectedInstrument,
    });

    return () => {
      if (audioEngineRef.current) {
        audioEngineRef.current.stop();
      }
    };
  }, []);

  // Update instrument when it changes
  useEffect(() => {
    if (audioEngineRef.current && selectedInstrument) {
      audioEngineRef.current.setInstrument(selectedInstrument);
    }
  }, [selectedInstrument]);

  if (recommendations.length === 0) {
    return null;
  }

  // Sort recommendations by complexity (highest to lowest)
  const sortedRecommendations = [...recommendations].sort((a, b) => b.complexity - a.complexity);

  const handleImplement = (rec: ChordProgressionRecommendation) => {
    const chordInstances: ChordInstance[] = rec.progression.map((chordSymbol, index) => {
      const voicing = generateChordVoicing(chordSymbol);
      const startTime = index * 4;

      return {
        id: crypto.randomUUID(),
        chordSymbol,
        chordQuality: getChordQuality(chordSymbol),
        notes: voicing,
        rootNote: getRootNote(chordSymbol),
        startTime,
        duration: 4,
        position: startTime * pixelsPerBeat,
        width: 4 * pixelsPerBeat,
        color: getChordColor(chordSymbol),
        voicingIndex: 0,
      };
    });

    // Check if we need to show the replace modal
    const hasExistingProgression = currentProgression.length > 0;
    const isCreatingNew = !isModification;

    if (hasExistingProgression && isCreatingNew) {
      // Show modal to warn about replacing
      setPendingChords(chordInstances);
      setShowReplaceModal(true);
    } else {
      // Directly implement (either modifying or no existing progression)
      onImplement(chordInstances);
    }
  };

  const handleConfirmReplace = () => {
    if (pendingChords) {
      onImplement(pendingChords);
      setPendingChords(null);
    }
    setShowReplaceModal(false);
  };

  const handleSaveAndReplace = async (name: string) => {
    if (onSaveProgression) {
      await onSaveProgression(name);
    }
  };

  const handlePreview = async (rec: ChordProgressionRecommendation) => {
    if (!audioEngineRef.current || !audioContextRef.current) return;

    // Stop if already previewing this one
    if (previewingId === rec.id) {
      audioEngineRef.current.stop();
      setPreviewingId(null);
      setCurrentPreviewChordIndex(-1);
      return;
    }

    // Stop any current preview
    if (previewingId) {
      audioEngineRef.current.stop();
      setCurrentPreviewChordIndex(-1);
    }

    setPreviewingId(rec.id);
    setCurrentPreviewChordIndex(-1);

    try {
      // Create chord instances for preview
      const previewChords: ChordInstance[] = rec.progression.map((chordSymbol, index) => {
        const voicing = generateChordVoicing(chordSymbol);
        const startTime = index * 2; // 2 beats per chord

        return {
          id: crypto.randomUUID(),
          chordSymbol,
          chordQuality: getChordQuality(chordSymbol),
          notes: voicing,
          rootNote: getRootNote(chordSymbol),
          startTime,
          duration: 2, // 2 beats duration
          position: startTime * pixelsPerBeat,
          width: 2 * pixelsPerBeat,
          color: getChordColor(chordSymbol),
          voicingIndex: 0,
        };
      });

      // Check if playPreview method exists (it should after page refresh)
      if (typeof audioEngineRef.current.playPreview === 'function') {
        // Use the new playPreview method that plays chords immediately in sequence
        // This bypasses Transport scheduling and plays chords directly with pauses
        await audioEngineRef.current.playPreview(previewChords, 120);

        // Highlight each chord as it plays
        // Each chord plays for 1.8s with 0.2s pause = 2s total per chord
        for (let i = 0; i < previewChords.length; i++) {
          setTimeout(() => {
            setCurrentPreviewChordIndex(i);
          }, i * 2000);
        }

        // Auto-stop and reset preview state after all chords finish
        const totalDurationMs = previewChords.length * 2000;
        setTimeout(() => {
          setPreviewingId(null);
          setCurrentPreviewChordIndex(-1);
        }, totalDurationMs + 100); // Add small buffer
      } else {
        // Fallback: Recreate audio engine with new code
        console.log('⚠️ Audio engine needs refresh - recreating...');
        audioEngineRef.current = new ChordProgressionAudioEngineSmplr(audioContextRef.current, {
          instrument: selectedInstrument,
        });

        // Try again with new instance
        await audioEngineRef.current.playPreview(previewChords, 120);

        // Highlight each chord as it plays
        for (let i = 0; i < previewChords.length; i++) {
          setTimeout(() => {
            setCurrentPreviewChordIndex(i);
          }, i * 2000);
        }

        const totalDurationMs = previewChords.length * 2000;
        setTimeout(() => {
          setPreviewingId(null);
          setCurrentPreviewChordIndex(-1);
        }, totalDurationMs + 100);
      }
    } catch (error) {
      console.error('Error previewing progression:', error);
      setPreviewingId(null);
    }
  };

  const handleLoadAdditionalRecommendations = async () => {
    setIsLoadingAdditional(true);
    try {
      const allRecommendations = [...recommendations, ...additionalRecommendations];

      // Use different endpoint based on whether we're in update mode or regular mode
      const endpoint = isUpdateMode
        ? '/api/chord-progression/generate-additional-updates'
        : '/api/chord-progression/generate-additional-recommendations';

      const requestBody = isUpdateMode
        ? {
            currentKey,
            currentProgression: currentProgression.map(c => c.chordSymbol),
            existingUpdates: allRecommendations,
            currentScaleModes,
          }
        : {
            currentKey,
            complexity,
            numChords: length,
            numRecommendations: 4,
            existingRecommendations: allRecommendations,
            currentScaleModes,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate additional ${isUpdateMode ? 'updates' : 'recommendations'}`);
      }

      const data = await response.json();
      setAdditionalRecommendations([...additionalRecommendations, ...data.recommendations]);
      setShowAdditionalSection(true);
    } catch (error) {
      console.error(`Error loading additional ${isUpdateMode ? 'updates' : 'recommendations'}:`, error);
    } finally {
      setIsLoadingAdditional(false);
    }
  };

  const handleLoadSimilarVariations = async (rec: ChordProgressionRecommendation) => {
    setLoadingVariations(rec.id);
    try {
      const response = await fetch('/api/chord-progression/generate-similar-variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentKey,
          originalProgression: rec.progression,
          originalName: rec.name,
          originalRationale: rec.rationale,
          originalMusicTheoryBasis: rec.musicTheoryBasis,
          numVariations: 4,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate similar variations');
      }

      const data = await response.json();
      setExpandedVariations({
        ...expandedVariations,
        [rec.id]: data.variations,
      });
    } catch (error) {
      console.error('Error loading similar variations:', error);
    } finally {
      setLoadingVariations(null);
    }
  };

  const getComplexityColor = (complexity: number): string => {
    if (complexity >= 8) return '#10b981'; // Green  - High score
    if (complexity >= 6) return '#eab308'; // Yellow - Good
    if (complexity >= 4) return '#f97316'; // Orange - Moderate
    return '#ef4444';                      // Red    - Low score
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#333333]">
        <Sparkles className="w-5 h-5 text-[#8b5cf6]" />
        <h3 className="text-lg font-semibold text-[#e0e0e0]">
          {isUpdateMode ? 'Recommended Chord Updates' : 'Recommended Chord Progressions'}
        </h3>
        <span className="text-sm text-[#666666] ml-auto">
          {recommendations.length} {recommendations.length === 1 ? 'recommendation' : 'recommendations'}
        </span>
      </div>

      {/* Grid of Recommendation Cards — compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {sortedRecommendations.map((rec) => {
          const isSelected = selectedRecId === rec.id;

          return (
            <div
              key={rec.id}
              onClick={() => setSelectedRecId(rec.id)}
              className="bg-[#161616] border rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-lg"
              style={{
                borderColor: isSelected ? '#3b82f6' : '#2a2a2a',
                transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
                boxShadow: isSelected
                  ? '0 6px 18px rgba(59, 130, 246, 0.25)'
                  : '0 2px 6px rgba(0, 0, 0, 0.2)',
              }}
            >
              {/* Card Header */}
              <div className="mb-2.5">
                <h4 className="text-xs font-bold text-[#e0e0e0] mb-1.5 line-clamp-1">
                  {rec.name}
                </h4>
                <div className="flex flex-wrap gap-1">
                  <Badge
                    className="text-[10px] px-1.5 py-0 leading-5"
                    style={{ backgroundColor: '#8b5cf6', color: 'white' }}
                  >
                    <Heart className="w-2.5 h-2.5 mr-0.5" />
                    {rec.mood}
                  </Badge>
                  <Badge
                    className="text-[10px] px-1.5 py-0 leading-5"
                    style={{ backgroundColor: getComplexityColor(rec.complexity), color: 'white' }}
                  >
                    <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                    {rec.complexity}/10
                  </Badge>
                </div>
              </div>

              {/* Chord Progression */}
              <div className="flex flex-wrap gap-1 mb-2.5 pb-2.5 border-b border-[#222222]">
                {rec.progression.map((chord, idx) => {
                  const isCurrentlyPlaying = previewingId === rec.id && currentPreviewChordIndex === idx;
                  return (
                    <div key={idx} className="flex items-center gap-0.5">
                      <Badge
                        className="text-white text-[11px] px-1.5 py-0 leading-5 font-semibold transition-all duration-300"
                        style={{
                          backgroundColor: isCurrentlyPlaying ? '#22c55e' : '#3b82f6',
                          boxShadow: isCurrentlyPlaying ? '0 0 12px rgba(34,197,94,0.5)' : 'none',
                          transform: isCurrentlyPlaying ? 'scale(1.08)' : 'scale(1)',
                        }}
                      >
                        {chord}
                      </Badge>
                      {idx < rec.progression.length - 1 && (
                        <span className="text-[#444444] text-[9px]">›</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Rationale (collapsed by default for compactness) */}
              <p className="text-[#888888] text-[10px] leading-relaxed line-clamp-2 mb-2.5">
                {rec.rationale}
              </p>

              {/* Action Buttons */}
              <div className="space-y-1">
                <div className="flex items-center gap-1">
                  <Button
                    onClick={(e) => { e.stopPropagation(); handlePreview(rec); }}
                    variant="outline"
                    className="flex-1 border-[#3b82f6] text-[#3b82f6] hover:bg-[#3b82f6]/10 text-[10px] font-medium h-7"
                    size="sm"
                    disabled={previewingId !== null && previewingId !== rec.id}
                  >
                    {previewingId === rec.id ? (
                      <><Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />Playing</>
                    ) : (
                      <><Play className="w-2.5 h-2.5 mr-1" />Preview</>
                    )}
                  </Button>
                  <Button
                    onClick={(e) => { e.stopPropagation(); handleImplement(rec); }}
                    className="flex-1 bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:from-[#2563eb] hover:to-[#7c3aed] text-white text-[10px] font-medium shadow-md h-7"
                    size="sm"
                  >
                    {isModification ? 'Apply' : 'Add'}
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    onClick={(e) => { e.stopPropagation(); setSelectedProgressionForDiagrams(rec); setShowChordDiagramSidebar(true); }}
                    variant="ghost"
                    className="flex-1 text-[#3b82f6] hover:bg-[#3b82f6]/10 text-[10px] h-6"
                    size="sm"
                  >
                    <Music className="w-2.5 h-2.5 mr-1" />Chords
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (expandedVariations[rec.id]) {
                        const nv = { ...expandedVariations }; delete nv[rec.id]; setExpandedVariations(nv);
                      } else { handleLoadSimilarVariations(rec); }
                    }}
                    variant="ghost"
                    className="flex-1 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 text-[10px] h-6"
                    size="sm"
                    disabled={loadingVariations === rec.id}
                  >
                    {loadingVariations === rec.id ? (
                      <><Loader2 className="w-2.5 h-2.5 mr-1 animate-spin" />…</>
                    ) : expandedVariations[rec.id] ? (
                      <><ChevronUp className="w-2.5 h-2.5 mr-1" />Hide</>
                    ) : (
                      <><Sparkles className="w-2.5 h-2.5 mr-1" />Variations</>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Similar Variations Section */}
      {Object.entries(expandedVariations).map(([recId, variations]) => {
        const originalRec = [...recommendations, ...additionalRecommendations].find(r => r.id === recId);
        if (!originalRec || variations.length === 0) return null;

        return (
          <div key={`variations-${recId}`} className="space-y-4 mt-6 p-4 bg-[#0f0f0f] rounded-xl border border-[#333333]">
            <div className="flex items-center gap-2 pb-2 border-b border-[#2a2a2a]">
              <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
              <h4 className="text-sm font-semibold text-[#e0e0e0]">
                Similar Variations of "{originalRec.name}"
              </h4>
              <Badge className="text-xs bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30">
                {variations.length} variations
              </Badge>
            </div>

            {/* Original Progression Reference */}
            <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
              <div className="text-xs text-[#888888] mb-1">Original:</div>
              <div className="flex flex-wrap gap-1.5">
                {originalRec.progression.map((chord, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Badge className="bg-[#3b82f6]/30 text-[#3b82f6] text-xs px-2 py-0.5 font-semibold border border-[#3b82f6]/50">
                      {chord}
                    </Badge>
                    {idx < originalRec.progression.length - 1 && (
                      <span className="text-[#555555] text-xs">→</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Variations Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {variations.map((variation) => (
                <div
                  key={variation.id}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#8b5cf6]/50 transition-all"
                >
                  {/* Variation Header */}
                  <div className="mb-3">
                    <h5 className="text-sm font-bold text-[#e0e0e0] mb-1 line-clamp-1">
                      {variation.name}
                    </h5>
                    {variation.variationType && (
                      <Badge className="text-xs bg-[#8b5cf6]/20 text-[#8b5cf6] border border-[#8b5cf6]/30">
                        {variation.variationType}
                      </Badge>
                    )}
                  </div>

                  {/* Variation Progression */}
                  <div className="flex flex-wrap gap-1 mb-3 pb-3 border-b border-[#2a2a2a]">
                    {variation.progression.map((chord, idx) => {
                      const isCurrentlyPlaying = previewingId === variation.id && currentPreviewChordIndex === idx;
                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <Badge
                            className="text-white text-xs px-2 py-0.5 font-semibold transition-all duration-300"
                            style={{
                              backgroundColor: isCurrentlyPlaying ? '#22c55e' : '#8b5cf6',
                              boxShadow: isCurrentlyPlaying ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none',
                              transform: isCurrentlyPlaying ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            {chord}
                          </Badge>
                          {idx < variation.progression.length - 1 && (
                            <span className="text-[#555555] text-xs">→</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Variation Rationale */}
                  <p className="text-[#a0a0a0] text-xs leading-relaxed line-clamp-2 mb-3">
                    {variation.rationale}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(variation);
                      }}
                      variant="outline"
                      className="flex-1 border-[#8b5cf6] text-[#8b5cf6] hover:bg-[#8b5cf6]/10 text-xs"
                      size="sm"
                      disabled={previewingId !== null && previewingId !== variation.id}
                    >
                      {previewingId === variation.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Playing
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Preview
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleImplement(variation);
                      }}
                      className="flex-1 bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] hover:from-[#7c3aed] hover:to-[#9333ea] text-white text-xs"
                      size="sm"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Additional Recommendations Section */}
      {additionalRecommendations.length > 0 && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-2 pb-2 border-b border-[#333333]">
            <Sparkles className="w-5 h-5 text-[#6366f1]" />
            <h3 className="text-lg font-semibold text-[#e0e0e0]">
              Additional Recommendations
            </h3>
            <span className="text-sm text-[#666666] ml-auto">
              {additionalRecommendations.length} {additionalRecommendations.length === 1 ? 'recommendation' : 'recommendations'}
            </span>
          </div>

          {/* Additional Recommendations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {additionalRecommendations.map((rec) => {
              const isSelected = selectedRecId === rec.id;

              return (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecId(rec.id)}
                  className="bg-[#1a1a1a] border-2 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-xl"
                  style={{
                    borderColor: isSelected ? '#6366f1' : '#333333',
                    transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                    boxShadow: isSelected
                      ? '0 8px 24px rgba(99, 102, 241, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-[#e0e0e0] mb-2 line-clamp-2">
                        {rec.name}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge
                          className="text-xs px-2 py-0.5"
                          style={{
                            backgroundColor: '#8b5cf6',
                            color: 'white',
                          }}
                        >
                          <Heart className="w-3 h-3 mr-1" />
                          {rec.mood}
                        </Badge>
                        <Badge
                          className="text-xs px-2 py-0.5"
                          style={{
                            backgroundColor: getComplexityColor(rec.complexity),
                            color: 'white',
                          }}
                        >
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {rec.complexity}/10
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Chord Progression */}
                  <div className="flex flex-wrap gap-1.5 mb-4 pb-4 border-b border-[#2a2a2a]">
                    {rec.progression.map((chord, idx) => {
                      const isCurrentlyPlaying = previewingId === rec.id && currentPreviewChordIndex === idx;
                      return (
                        <div key={idx} className="flex items-center gap-1">
                          <Badge
                            className="text-white text-sm px-2.5 py-1 font-semibold transition-all duration-300"
                            style={{
                              backgroundColor: isCurrentlyPlaying ? '#22c55e' : '#6366f1',
                              boxShadow: isCurrentlyPlaying ? '0 0 20px rgba(34, 197, 94, 0.6)' : 'none',
                              transform: isCurrentlyPlaying ? 'scale(1.1)' : 'scale(1)',
                            }}
                          >
                            {chord}
                          </Badge>
                          {idx < rec.progression.length - 1 && (
                            <span className="text-[#555555] text-xs">→</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Rationale */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-1.5 text-[#e0e0e0] text-xs font-semibold">
                      <Music className="w-3.5 h-3.5 text-[#6366f1]" />
                      Why This Works
                    </div>
                    <p className="text-[#a0a0a0] text-xs leading-relaxed line-clamp-3">
                      {rec.rationale}
                    </p>
                  </div>

                  {/* Music Theory Basis */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-1.5 text-[#e0e0e0] text-xs font-semibold">
                      <BookOpen className="w-3.5 h-3.5 text-[#8b5cf6]" />
                      Music Theory
                    </div>
                    <p className="text-[#a0a0a0] text-xs leading-relaxed line-clamp-3">
                      {rec.musicTheoryBasis}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePreview(rec);
                        }}
                        variant="outline"
                        className="flex-1 border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 text-xs font-medium"
                        size="sm"
                        disabled={previewingId !== null && previewingId !== rec.id}
                      >
                        {previewingId === rec.id ? (
                          <>
                            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            Playing...
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" />
                            Preview
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImplement(rec);
                        }}
                        className="flex-1 bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white text-xs font-medium shadow-lg"
                        size="sm"
                      >
                        Add to Timeline
                      </Button>
                    </div>

                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (expandedVariations[rec.id]) {
                          const newVariations = { ...expandedVariations };
                          delete newVariations[rec.id];
                          setExpandedVariations(newVariations);
                        } else {
                          handleLoadSimilarVariations(rec);
                        }
                      }}
                      variant="ghost"
                      className="w-full text-[#8b5cf6] hover:bg-[#8b5cf6]/10 text-xs"
                      size="sm"
                      disabled={loadingVariations === rec.id}
                    >
                      {loadingVariations === rec.id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Loading Variations...
                        </>
                      ) : expandedVariations[rec.id] ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Hide Similar Variations
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 mr-1" />
                          Show Similar Variations
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Recommendations Button - Shows after additional recs or when none loaded yet */}
      <div className="flex justify-center mt-6">
        <Button
          onClick={handleLoadAdditionalRecommendations}
          disabled={isLoadingAdditional}
          className="bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] hover:from-[#4f46e5] hover:to-[#7c3aed] text-white font-semibold shadow-lg px-8"
        >
          {isLoadingAdditional ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isUpdateMode ? 'Generating More Updates...' : 'Generating More Recommendations...'}
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              {isUpdateMode ? 'Load 4 More Updates' : 'Load 4 More Recommendations'}
            </>
          )}
        </Button>
      </div>

      {/* Replace Progression Modal */}
      <ReplaceProgressionModal
        isOpen={showReplaceModal}
        onClose={() => {
          setShowReplaceModal(false);
          setPendingChords(null);
        }}
        onConfirm={handleConfirmReplace}
        onSave={handleSaveAndReplace}
        currentProgression={currentProgression}
      />

      {/* Chord Diagram Sidebar */}
      <RecommendationChordDiagramSidebar
        theme={theme}
        progression={selectedProgressionForDiagrams}
        isVisible={showChordDiagramSidebar}
        onClose={() => {
          setShowChordDiagramSidebar(false);
          setSelectedProgressionForDiagrams(null);
        }}
      />
    </div>
  );
}

function getChordQuality(chordSymbol: string): ChordQuality {
  if (chordSymbol.includes('maj7')) return 'maj7';
  if (chordSymbol.includes('m7')) return 'min7';
  if (chordSymbol.includes('7')) return 'dom7';
  if (chordSymbol.includes('dim')) return 'dim';
  if (chordSymbol.includes('aug')) return 'aug';
  if (chordSymbol.includes('m')) return 'min';
  return 'maj';
}

function getRootNote(chordSymbol: string): string {
  const match = chordSymbol.match(/^[A-G][#b]?/);
  return match ? match[0] : 'C';
}

