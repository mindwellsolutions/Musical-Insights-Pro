'use client';

/**
 * AI-Powered Scale/Mode Recommendations
 * Allows users to describe their vision and get AI-generated scale/mode recommendations
 */

import { useState, useEffect } from 'react';
import { ChordInstance, VerseData, AIScaleModeRecommendation } from '@/lib/chord-progression/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Plus } from 'lucide-react';
import { mapGPTScaleNameToInternal, mapGPTKeyNameToInternal } from '@/lib/scale-mode-mapping';
import { useToast } from '@/hooks/use-toast';

interface AIScaleModeRecommendationsProps {
  currentKey: string;
  currentProgression: ChordInstance[];
  onAddScaleToTimeline?: (scaleName: string, rootNote: string) => void;
  activeVerse?: VerseData;
  onVerseUpdate?: (verseId: string, updates: Partial<VerseData>) => void;
}

export default function AIScaleModeRecommendations({
  currentKey,
  currentProgression,
  onAddScaleToTimeline,
  activeVerse,
  onVerseUpdate,
}: AIScaleModeRecommendationsProps) {
  const [userVision, setUserVision] = useState('');
  const [recommendations, setRecommendations] = useState<AIScaleModeRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Load saved vision and recommendations when activeVerse changes
  useEffect(() => {
    if (activeVerse) {
      if (activeVerse.aiScaleVisionText) {
        setUserVision(activeVerse.aiScaleVisionText);
      }
      if (activeVerse.aiScaleRecommendations && activeVerse.aiScaleRecommendations.length > 0) {
        setRecommendations(activeVerse.aiScaleRecommendations);
      }
    }
  }, [activeVerse?.id]); // Only re-run when verse ID changes

  const handleGenerate = async () => {
    if (!userVision.trim()) {
      toast({
        title: 'Vision Required',
        description: 'Please describe your musical vision to generate recommendations.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/scale-mode-recommendations/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userVision,
          chordProgression: currentProgression.map(c => ({
            chordSymbol: c.chordSymbol,
            rootNote: c.rootNote,
            chordQuality: c.chordQuality,
          })),
          currentKey,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);

      // Save to database
      if (activeVerse && onVerseUpdate) {
        onVerseUpdate(activeVerse.id, {
          aiScaleVisionText: userVision,
          aiScaleRecommendations: data.recommendations || [],
        });
      }

      toast({
        title: 'Success',
        description: `Generated ${data.recommendations?.length || 0} scale/mode recommendations`,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToTimeline = (recommendation: AIScaleModeRecommendation) => {
    if (!onAddScaleToTimeline) return;

    // Map GPT names to internal format
    const internalScaleName = mapGPTScaleNameToInternal(recommendation.scaleName);
    const internalRootNote = mapGPTKeyNameToInternal(recommendation.rootNote);

    onAddScaleToTimeline(internalScaleName, internalRootNote);

    toast({
      title: 'Added to Timeline',
      description: `${internalRootNote} ${internalScaleName} added to the Scales track`,
    });
  };

  const getScoreColor = (score: number): string => {
    if (score >= 9) return '#4CAF50'; // Green
    if (score >= 7) return '#2196F3'; // Blue
    if (score >= 5) return '#FF9800'; // Orange
    return '#9E9E9E'; // Gray
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      {/* Input Section - Fixed Width, Left Aligned */}
      <div className="mb-6 max-w-3xl w-full">
        <label className="block text-sm font-semibold text-[#e0e0e0] mb-2">
          Describe Your Vision
        </label>
        <Textarea
          value={userVision}
          onChange={(e) => setUserVision(e.target.value)}
          placeholder="E.g., 'I want a jazzy, sophisticated sound for improvisation' or 'Looking for bluesy scales that work over the whole progression'"
          className="min-h-[100px] bg-[#1a1a1a] border-[#333333] text-white placeholder:text-[#666666] resize-none"
          disabled={isGenerating}
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-[#888888]">
            {currentProgression.length > 0
              ? `Current progression: ${currentProgression.map(c => c.chordSymbol).join(' - ')}`
              : 'No chords in progression yet'}
          </p>
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !userVision.trim()}
            className="gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white font-semibold"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Recommendations
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Recommendations Display - Fixed Width, Left Aligned */}
      {recommendations.length > 0 && (
        <div className="flex-1 max-w-3xl w-full">
          <h3 className="text-lg font-bold text-white mb-4">
            Recommended Scales & Modes
          </h3>
          <div className="grid gap-4">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-[#1e1e1e] to-[#1a1a1a] border border-[#333333] rounded-lg p-4 hover:border-[#8b5cf6] transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-bold text-white">
                      {rec.rootNote} {rec.scaleName}
                    </h4>
                    {rec.genreContext && (
                      <p className="text-xs text-[#888888] mt-1">
                        {rec.genreContext}
                      </p>
                    )}
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: getScoreColor(rec.compatibilityScore) }}
                  >
                    ⭐ {rec.compatibilityScore}/10
                  </div>
                </div>
                <p className="text-sm text-[#b0b0b0] mb-3">
                  {rec.rationale}
                </p>
                {onAddScaleToTimeline && (
                  <Button
                    onClick={() => handleAddToTimeline(rec)}
                    size="sm"
                    className="gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add to Timeline
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && !isGenerating && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-[#8b5cf6]" />
            <h3 className="text-xl font-bold text-white mb-2">
              AI-Powered Scale Recommendations
            </h3>
            <p className="text-sm text-[#a0a0a0]">
              Describe your musical vision and get personalized scale/mode recommendations
              that work over your entire chord progression.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

