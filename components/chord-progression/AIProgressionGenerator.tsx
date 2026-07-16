'use client';

/**
 * AI-assisted progression generator with GPT-4o-mini recommendations
 */

import { useState, useEffect } from 'react';
import { ChordInstance, ScaleModeInstance } from '@/lib/chord-progression/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, AlertCircle, Music, SlidersHorizontal } from 'lucide-react';
import ChordProgressionRecommendations from './ChordProgressionRecommendations';
import { NOTE_COLORS } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';
import { ThemeConfig } from '@/lib/themes';

const RECOMMENDATIONS_STORAGE_KEY = 'chord-progression-recommendations';

interface ChordProgressionRecommendation {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  musicTheoryBasis: string;
  mood: string;
  complexity: number;
}

interface AIProgressionGeneratorProps {
  currentKey: string;
  pixelsPerBeat: number;
  onProgressionLoad: (chords: ChordInstance[]) => void;
  currentProgression?: ChordInstance[];
  currentScaleModes?: ScaleModeInstance[];
  onKeyChangeClick?: () => void;
  verseId: string; // ID of the current verse/section
  selectedInstrument?: import('@/lib/chord-progression/types').InstrumentType;
  theme: ThemeConfig;
  updateRecommendations?: any[] | null;
  onUpdateRecommendationsConsumed?: () => void;
  isGeneratingUpdates?: boolean;
}

export default function AIProgressionGenerator({
  currentKey,
  pixelsPerBeat,
  onProgressionLoad,
  currentProgression = [],
  currentScaleModes = [],
  onKeyChangeClick,
  verseId,
  selectedInstrument = 'piano',
  theme,
  updateRecommendations = null,
  onUpdateRecommendationsConsumed,
  isGeneratingUpdates = false,
}: AIProgressionGeneratorProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState(5);
  const [length, setLength] = useState(4);
  const [numRecommendations, setNumRecommendations] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<ChordProgressionRecommendation[]>([]);
  const [isModification, setIsModification] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Handle incoming update recommendations from compatibility score button
  useEffect(() => {
    if (updateRecommendations && updateRecommendations.length > 0) {
      setRecommendations(updateRecommendations);
      setIsUpdateMode(true);
      setIsModification(false);
      setPrompt(''); // Clear the prompt when showing updates

      // Notify parent that we've consumed the updates
      if (onUpdateRecommendationsConsumed) {
        onUpdateRecommendationsConsumed();
      }
    }
  }, [updateRecommendations, onUpdateRecommendationsConsumed]);

  // Load recommendations and prompt from localStorage when verseId changes
  useEffect(() => {
    const loadRecommendations = () => {
      try {
        const stored = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
        if (stored) {
          const allRecommendations = JSON.parse(stored);
          const verseRecommendations = allRecommendations[verseId];
          if (verseRecommendations) {
            setRecommendations(verseRecommendations.recommendations || []);
            setIsModification(verseRecommendations.isModification || false);
            setPrompt(verseRecommendations.prompt || '');
            setIsUpdateMode(false); // Reset update mode when loading from storage
          } else {
            // Clear recommendations and prompt if switching to a verse with no saved data
            setRecommendations([]);
            setIsModification(false);
            setPrompt('');
            setIsUpdateMode(false);
          }
        } else {
          setRecommendations([]);
          setIsModification(false);
          setPrompt('');
          setIsUpdateMode(false);
        }
      } catch (error) {
        console.error('Failed to load recommendations from localStorage:', error);
      }
    };

    loadRecommendations();
  }, [verseId]);



  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setRecommendations([]);

    // Capture the current prompt value to save with recommendations
    const currentPrompt = prompt;

    try {
      const response = await fetch('/api/chord-progression/generate-recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentKey,
          userPrompt: currentPrompt,
          complexity,
          numChords: length,
          numRecommendations,
          currentProgression: currentProgression.map(c => c.chordSymbol),
          currentScaleModes: currentScaleModes.map(s => s.scaleName),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      const newRecommendations = data.recommendations || [];
      const newIsModification = data.isModification || false;

      setRecommendations(newRecommendations);
      setIsModification(newIsModification);

      // Save to localStorage immediately after generating
      if (newRecommendations.length > 0) {
        try {
          const stored = localStorage.getItem(RECOMMENDATIONS_STORAGE_KEY);
          const allRecommendations = stored ? JSON.parse(stored) : {};

          allRecommendations[verseId] = {
            recommendations: newRecommendations,
            isModification: newIsModification,
            prompt: currentPrompt,
            timestamp: new Date().toISOString(),
          };

          localStorage.setItem(RECOMMENDATIONS_STORAGE_KEY, JSON.stringify(allRecommendations));
        } catch (saveError) {
          console.error('Failed to save recommendations to localStorage:', saveError);
        }
      }
    } catch (err) {
      console.error('Error generating recommendations:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate recommendations');
    } finally {
      setIsGenerating(false);
    }
  };

  const presetPrompts = [
    'Emotional and melancholic',
    'Uplifting and energetic',
    'Dark and mysterious',
    'Bright and happy',
    'Jazzy and sophisticated',
    'Epic and cinematic',
  ];

  return (
    <div className="h-full overflow-y-auto">
      {/* Modern Header Section - Compact Single Line */}
      <div className="bg-[#1a1a1a] pb-4 px-6 pt-6">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Title Section */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Chord Assistant</h2>
          </div>

          {/* Change Key Button */}
          {onKeyChangeClick && (() => {
            const keyColor = NOTE_COLORS[getNoteDisplayName(currentKey)] || '#888888';
            return (
              <button
                onClick={onKeyChangeClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95"
                style={{
                  background: `linear-gradient(135deg, ${keyColor}18 0%, ${keyColor}08 100%)`,
                  border: `1.5px solid ${keyColor}60`,
                  boxShadow: `0 0 14px ${keyColor}35`,
                }}
              >
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">Key</span>
                <div
                  className="px-2.5 py-1 rounded-lg font-bold text-white text-sm leading-none"
                  style={{
                    background: `linear-gradient(135deg, ${keyColor} 0%, ${keyColor}cc 100%)`,
                    boxShadow: `0 2px 8px ${keyColor}60`,
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  }}
                >
                  {getNoteDisplayName(currentKey)}
                </div>
              </button>
            );
          })()}

          {/* Current Progression + Filter */}
          <div className="flex items-center gap-3">
            {currentProgression.length > 0 && (
              <div
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest shrink-0">Now</span>
                <div className="flex gap-1 flex-wrap max-w-xs">
                  {currentProgression.map((chord, idx) => {
                    const rootColor = NOTE_COLORS[chord.rootNote] || '#888888';
                    return (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white leading-none"
                        style={{
                          background: `${rootColor}cc`,
                          boxShadow: `0 0 6px ${rootColor}50`,
                        }}
                      >
                        {chord.chordSymbol}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filter Toggle Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-9 px-3 font-semibold transition-all ${
                showFilters
                  ? 'bg-[#3b82f6] border-[#3b82f6] text-white hover:bg-[#2563eb]'
                  : 'bg-[#2a2a2a] border-[#444444] text-[#e0e0e0] hover:bg-[#333333]'
              }`}
              title={showFilters ? 'Hide filters' : 'Show filters'}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Compact Horizontal Controls - Conditionally shown */}
          {showFilters && (
            <div className="flex items-center gap-3">
            {/* Complexity */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] border border-[#333333]">
              <Label className="text-[#e0e0e0] text-sm font-semibold whitespace-nowrap">Complexity:</Label>
              <input
                type="number"
                value={complexity}
                onChange={(e) => setComplexity(Math.min(10, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-12 px-2 py-1 text-sm text-center bg-[#1a1a1a] border border-[#444444] rounded-lg text-white focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                min={1}
                max={10}
              />
              <div className="w-20">
                <Slider
                  value={[complexity]}
                  onValueChange={(val) => setComplexity(val[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6] [&>span:first-child]:bg-[#444444] [&>span:first-child>span]:bg-[#3b82f6]"
                />
              </div>
            </div>

            {/* Chords */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] border border-[#333333]">
              <Label className="text-[#e0e0e0] text-sm font-semibold whitespace-nowrap">Chords:</Label>
              <input
                type="number"
                value={length}
                onChange={(e) => setLength(Math.min(16, Math.max(2, parseInt(e.target.value) || 2)))}
                className="w-12 px-2 py-1 text-sm text-center bg-[#1a1a1a] border border-[#444444] rounded-lg text-white focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                min={2}
                max={16}
              />
              <div className="w-20">
                <Slider
                  value={[length]}
                  onValueChange={(val) => setLength(val[0])}
                  min={2}
                  max={16}
                  step={1}
                  className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6] [&>span:first-child]:bg-[#444444] [&>span:first-child>span]:bg-[#3b82f6]"
                />
              </div>
            </div>

            {/* Results */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2a2a2a] border border-[#333333]">
              <Label className="text-[#e0e0e0] text-sm font-semibold whitespace-nowrap">Results:</Label>
              <input
                type="number"
                value={numRecommendations}
                onChange={(e) => setNumRecommendations(Math.min(8, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-12 px-2 py-1 text-sm text-center bg-[#1a1a1a] border border-[#444444] rounded-lg text-white focus:border-[#3b82f6] focus:ring-1 focus:ring-[#3b82f6]"
                min={1}
                max={8}
              />
              <div className="w-20">
                <Slider
                  value={[numRecommendations]}
                  onValueChange={(val) => setNumRecommendations(val[0])}
                  min={1}
                  max={8}
                  step={1}
                  className="[&_[role=slider]]:bg-[#3b82f6] [&_[role=slider]]:border-[#3b82f6] [&>span:first-child]:bg-[#444444] [&>span:first-child>span]:bg-[#3b82f6]"
                />
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      <div className="px-6 pb-6 space-y-6">
        {/* Prompt Input */}
        <div className="space-y-3">
          <Label className="text-[#e0e0e0] font-semibold flex items-center gap-2">
            <Music className="w-4 h-4 text-[#3b82f6]" />
            Describe Your Vision
          </Label>
          <Textarea
            placeholder="e.g., 'Create an emotional progression with a melancholic feel' or 'Modify my progression to be more uplifting'"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.shiftKey && prompt.trim() && !isGenerating) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            className="bg-[#2a2a2a] border-[#444444] text-white placeholder:text-[#666666] min-h-[120px] max-w-3xl focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/50 rounded-xl resize-y overflow-y-auto"
            rows={4}
          />

          {/* Preset Prompts */}
          <div className="flex gap-2 flex-wrap">
            {presetPrompts.map(preset => (
              <Badge
                key={preset}
                variant="outline"
                className="cursor-pointer hover:bg-[#3b82f6] hover:text-white hover:border-[#3b82f6] transition-all border-[#444444] text-[#b0b0b0] text-xs px-3 py-1"
                onClick={() => setPrompt(preset)}
              >
                {preset}
              </Badge>
            ))}
          </div>
        </div>

        {/* Generate Button - Left aligned */}
        <div className="flex justify-start">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-[#8b5cf6] hover:from-[#2563eb] hover:via-[#4f46e5] hover:to-[#7c3aed] text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300 py-6 px-8 text-lg rounded-xl"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Generating Recommendations...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Chord Recommendations
              </>
            )}
          </Button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-xl bg-red-900/20 border border-red-500/50 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-200 font-medium">Error</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Stunning Loading Animation for Generating Updates */}
        {isGeneratingUpdates && (
          <div className="flex flex-col items-center justify-center py-20 px-8 space-y-8">
            {/* Title */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent animate-pulse">
                Generating Recommended Chord Updates
              </h3>
              <p className="text-sm text-[#888888]">
                Analyzing your progression and crafting emotional variations...
              </p>
            </div>

            {/* Animated Musical Notes */}
            <div className="relative w-full max-w-md h-32">
              {/* Floating musical notes */}
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="absolute animate-float"
                  style={{
                    left: `${20 + i * 15}%`,
                    animationDelay: `${i * 0.2}s`,
                    animationDuration: '3s',
                  }}
                >
                  <Music className="w-8 h-8 text-[#3b82f6] opacity-60" />
                </div>
              ))}

              {/* Sparkles */}
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={`sparkle-${i}`}
                  className="absolute animate-sparkle"
                  style={{
                    left: `${10 + i * 25}%`,
                    top: `${30 + (i % 2) * 40}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '2s',
                  }}
                >
                  <Sparkles className="w-6 h-6 text-[#8b5cf6] opacity-70" />
                </div>
              ))}
            </div>

            {/* Animated Progress Bars */}
            <div className="w-full max-w-md space-y-3">
              {['Analyzing chord relationships', 'Exploring emotional variations', 'Crafting recommendations'].map((text, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-xs text-[#666666] font-medium">{text}</p>
                  <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
                    <div
                      className="h-full bg-gradient-to-r from-[#3b82f6] via-[#8b5cf6] to-[#ec4899] animate-progress"
                      style={{
                        animationDelay: `${i * 0.3}s`,
                        animationDuration: '2s',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Pulsing Circle */}
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] opacity-20 animate-ping" />
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] opacity-40 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-white animate-spin" />
              </div>
            </div>
          </div>
        )}

        {/* Recommendations Display */}
        {!isGeneratingUpdates && recommendations.length > 0 && (
          <ChordProgressionRecommendations
            recommendations={recommendations}
            currentKey={currentKey}
            pixelsPerBeat={pixelsPerBeat}
            onImplement={onProgressionLoad}
            isModification={isModification}
            currentProgression={currentProgression}
            onSaveProgression={async (name: string) => {
              // TODO: Implement save functionality
              console.log('Saving progression:', name);
            }}
            selectedInstrument={selectedInstrument}
            complexity={complexity}
            length={length}
            currentScaleModes={currentScaleModes.map(s => s.scaleName)}
            theme={theme}
            isUpdateMode={isUpdateMode}
          />
        )}
      </div>

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0.5) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: scale(1.2) rotate(180deg);
          }
        }

        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }

        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

