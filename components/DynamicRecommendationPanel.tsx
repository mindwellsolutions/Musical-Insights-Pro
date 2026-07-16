'use client';

import { useState, useEffect, memo } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { Lightbulb, TrendingUp, Music, ArrowRight } from 'lucide-react';
import { ManualSelection } from './ManualSelectionList';
import { analyzeProgression } from '@/lib/progression-analyzer/service';
import { ProgressionAnalysis } from '@/lib/progression-analyzer/types';

interface DynamicRecommendationPanelProps {
  theme: ThemeConfig;
  manualSelections: ManualSelection[];
  currentSelectionIndex: number;
  currentKey: string;
  currentScaleName: string;
  onChordSelect?: (notes: string[]) => void;
  onScaleSelect?: (scaleName: string) => void;
}

const DynamicRecommendationPanel = memo(function DynamicRecommendationPanel({
  theme,
  manualSelections,
  currentSelectionIndex,
  currentKey,
  currentScaleName,
  onChordSelect,
  onScaleSelect,
}: DynamicRecommendationPanelProps) {
  const [analysis, setAnalysis] = useState<ProgressionAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (manualSelections.length === 0 || currentSelectionIndex < 0) {
      setAnalysis(null);
      return;
    }

    const analyzeCurrentProgression = async () => {
      setLoading(true);

      try {
        // Convert manual selections to chord list
        const songList = manualSelections.map(sel => {
          if (sel.type === 'chord' && sel.chord) {
            return sel.chord.symbol;
          }
          // For scale selections, use the key as a placeholder
          return `${sel.key}`;
        });

        const result = await analyzeProgression({
          songList,
          currentPosition: currentSelectionIndex,
          key: currentKey,
          scale: currentScaleName,
        });

        setAnalysis(result);
      } catch (error) {
        console.error('Error analyzing progression:', error);
        setAnalysis(null);
      } finally {
        setLoading(false);
      }
    };

    analyzeCurrentProgression();
  }, [manualSelections, currentSelectionIndex, currentKey]);

  if (manualSelections.length === 0) {
    return null;
  }

  return (
    <div
      className="rounded-xl p-6 mb-6"
      style={{
        background: theme.bgSecondary,
        border: `2px solid ${theme.border}`,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb size={24} style={{ color: theme.accentPrimary }} />
        <h2 className="text-2xl font-bold" style={{ color: theme.textPrimary }}>
          Smart Recommendations
        </h2>
      </div>

      {loading && (
        <div className="text-center py-8" style={{ color: theme.textSecondary }}>
          Analyzing your progression...
        </div>
      )}

      {!loading && analysis && (
        <div className="space-y-6">
          {/* Current Context */}
          <div
            className="rounded-lg p-4"
            style={{
              background: theme.bgTertiary,
              border: `1px solid ${theme.border}`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Music size={18} style={{ color: theme.accentPrimary }} />
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                Current Position
              </h3>
            </div>
            <p className="text-sm mb-2" style={{ color: theme.textSecondary }}>
              {analysis.musicalContext}
            </p>
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              Position {analysis.currentIndex + 1} of {analysis.totalChords} • {analysis.progressionType}
            </p>
          </div>

          {/* Next Chord Suggestions */}
          {analysis.nextChordSuggestions.length > 0 && (
            <div
              className="rounded-lg p-4"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={18} style={{ color: theme.accentPrimary }} />
                <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                  Suggested Next Chords
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.nextChordSuggestions.map((chord, idx) => (
                  <button
                    key={idx}
                    onClick={() => onChordSelect?.([])} // You'd need to convert chord symbol to notes
                    className="px-4 py-2 rounded-lg font-bold transition-all hover:scale-105"
                    style={{
                      background: theme.buttonPrimary,
                      color: '#ffffff',
                      border: `1px solid ${theme.buttonPrimary}`,
                    }}
                  >
                    {chord}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Compatible Scales */}
          {analysis.compatibleScales.length > 0 && (
            <div
              className="rounded-lg p-4"
              style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight size={18} style={{ color: theme.accentPrimary }} />
                <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                  Compatible Scales for Current Chord
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {analysis.compatibleScales.slice(0, 4).map((scale, idx) => (
                  <button
                    key={idx}
                    onClick={() => onScaleSelect?.(scale.scaleName)}
                    className="text-left px-4 py-3 rounded-lg transition-all hover:scale-[1.02]"
                    style={{
                      background: theme.bgPrimary,
                      border: `1px solid ${theme.border}`,
                    }}
                  >
                    <div className="font-bold mb-1" style={{ color: theme.textPrimary }}>
                      {scale.scaleName}
                    </div>
                    <div className="text-xs" style={{ color: theme.textSecondary }}>
                      {scale.usage}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

export default DynamicRecommendationPanel;

