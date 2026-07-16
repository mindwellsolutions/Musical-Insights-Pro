'use client';

/**
 * AI Insights Modal - Non-blocking modal for track-specific AI queries
 * Provides AI-powered recommendations for chord progressions and scales
 */

import { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChordInstance } from '@/lib/chord-progression/types';

interface AIInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trackType: 'chord' | 'scale';
  currentChords?: ChordInstance[];
  onApplyRecommendation?: (recommendation: any) => void;
}

interface Recommendation {
  id: string;
  title: string;
  description: string;
  chords?: ChordInstance[];
  reasoning: string;
}

export default function AIInsightsModal({
  open,
  onOpenChange,
  trackType,
  currentChords = [],
  onApplyRecommendation,
}: AIInsightsModalProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleSubmit = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          trackType,
          currentChords,
        }),
      });

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed right-4 top-20 z-[100] w-[420px] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-[#3a3a3a] rounded-xl shadow-2xl"
      style={{ maxHeight: 'calc(100vh - 100px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#3b82f6]" />
          <h3 className="text-lg font-bold text-white">
            AI Insights - {trackType === 'chord' ? 'Chords' : 'Scales'}
          </h3>
        </div>
        <button
          onClick={() => onOpenChange(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {/* Query Input */}
        <div className="p-4 border-b border-[#2a2a2a]">
          <Textarea
            placeholder={`Ask for ${trackType} recommendations...\nExample: "What chords would work well with what I have?" or "Suggest improvements to my progression"`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-[100px] bg-[#0a0a0a] border-[#3a3a3a] text-white placeholder:text-gray-500 resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !query.trim()}
            className="mt-3 w-full bg-gradient-to-r from-[#3b82f6] to-[#2563eb] hover:from-[#2563eb] hover:to-[#1d4ed8] shadow-lg shadow-[#3b82f6]/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Get Insights
              </>
            )}
          </Button>
        </div>

        {/* Recommendations */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {recommendations.length === 0 && !isLoading && (
            <div className="text-center text-gray-500 py-8">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Ask a question to get AI-powered recommendations</p>
            </div>
          )}

          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="bg-gradient-to-br from-[#0a0a0a] to-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 hover:border-[#3b82f6]/30 transition-all"
            >
              <h4 className="font-semibold text-white mb-2">{rec.title}</h4>
              <p className="text-sm text-gray-400 mb-3">{rec.description}</p>
              <p className="text-xs text-gray-500 mb-3 italic">{rec.reasoning}</p>
              <Button
                onClick={() => onApplyRecommendation?.(rec)}
                size="sm"
                className="w-full bg-[#3b82f6] hover:bg-[#2563eb]"
              >
                Apply Recommendation
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

