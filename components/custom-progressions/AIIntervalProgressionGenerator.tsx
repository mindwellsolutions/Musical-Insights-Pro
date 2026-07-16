'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Sparkles, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { AIIntervalProgressionRecommendation, IntervalStep } from '@/lib/custom-progressions/types';
import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { createClient } from '@/lib/supabase/client-ssr';

const MOOD_COLORS: Record<string, string> = {
  uplifting: '#10b981', energetic: '#10b981', happy: '#22c55e', bright: '#22c55e',
  melancholic: '#8b5cf6', sad: '#8b5cf6', wistful: '#8b5cf6',
  tension: '#ef4444', suspenseful: '#ef4444', dark: '#dc2626', dramatic: '#dc2626',
  jazz: '#f59e0b', sophisticated: '#f59e0b',
  epic: '#f97316', cinematic: '#f97316', powerful: '#f97316',
  calm: '#0ea5e9', peaceful: '#0ea5e9', serene: '#0ea5e9',
  neutral: '#6b7280',
};

function getMoodColor(mood: string): string {
  const key = mood.toLowerCase();
  return MOOD_COLORS[key] ?? MOOD_COLORS['neutral'];
}

const MOOD_PRESETS = [
  { label: 'Uplifting', prompt: 'Create an uplifting, energetic progression' },
  { label: 'Melancholic', prompt: 'Create a sad, emotional, melancholic progression' },
  { label: 'Tension', prompt: 'Create a suspenseful, tense progression with unresolved energy' },
  { label: 'Jazz', prompt: 'Create a jazz-flavored progression with ii-V movements' },
  { label: 'Epic', prompt: 'Create a cinematic, epic, powerful progression' },
];

interface AIIntervalProgressionGeneratorProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  diatonicDegrees: DiatonicTriad[];
  onLoadToBuilder: (steps: IntervalStep[]) => void;
}

export function AIIntervalProgressionGenerator({
  theme, currentKey, currentScale, diatonicDegrees, onLoadToBuilder,
}: AIIntervalProgressionGeneratorProps) {
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState(5);
  const [numChords, setNumChords] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<AIIntervalProgressionRecommendation[]>([]);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (dir: 'left' | 'right') => {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: dir === 'left' ? -220 : 220, behavior: 'smooth' });
  };

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;

      const res = await fetch('/api/interval-progression/generate-recommendations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ currentKey, currentScale, userPrompt: prompt.trim(), complexity, numChords, numRecommendations: 5 }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Generation failed');
      }
      const data = await res.json();
      setRecommendations(data.recommendations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsGenerating(false);
    }
  }, [currentKey, currentScale, prompt, complexity, numChords]);

  const buildStepsFromDegrees = useCallback((degrees: string[]): IntervalStep[] => {
    return degrees.map((deg, i) => {
      const triad = diatonicDegrees.find(d => d.degree === deg) ?? diatonicDegrees[0];
      return { id: `ai-${Date.now()}-${i}`, degree: triad.degree, degreeIndex: triad.degreeIndex, rootNote: triad.rootNote, quality: triad.quality, color: triad.color };
    });
  }, [diatonicDegrees]);

  const inputStyle: React.CSSProperties = { background: theme.bgTertiary, border: `1px solid ${theme.border}`, color: theme.textPrimary, borderRadius: 8, outline: 'none', fontSize: 13 };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Key context */}
      <div style={{ fontSize: 12, color: theme.textSecondary }}>
        Generating for: <span style={{ color: theme.accentPrimary, fontWeight: 600 }}>{currentKey} {currentScale}</span>
      </div>

      {/* Mood presets */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {MOOD_PRESETS.map(p => (
          <button key={p.label} onClick={() => setPrompt(p.prompt)}
            style={{ height: 26, borderRadius: 20, fontSize: 11, fontWeight: 600, padding: '0 10px', border: `1px solid ${theme.border}`, background: prompt === p.prompt ? theme.accentPrimary : theme.bgTertiary, color: prompt === p.prompt ? 'white' : theme.textSecondary, cursor: 'pointer', transition: 'all 120ms' }}>
            {p.label}
          </button>
        ))}
      </div>

      {/* Prompt input */}
      <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={2}
        placeholder="Describe the mood, style, or feel you want (or use a preset above)..."
        style={{ ...inputStyle, width: '100%', padding: '8px 10px', resize: 'vertical', boxSizing: 'border-box' }} />

      {/* Controls row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: theme.textSecondary }}>
          Chords:
          <select value={numChords} onChange={e => setNumChords(+e.target.value)}
            style={{ ...inputStyle, height: 28, padding: '0 8px', width: 60 }}>
            {[3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>

        {/* Modern complexity slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: theme.textSecondary, whiteSpace: 'nowrap' }}>Complexity:</span>
          <div style={{ position: 'relative', width: 140 }}>
            <style>{`
              .cp-slider { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 999px; outline: none; cursor: pointer; border: none; }
              .cp-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 2.5px solid ${theme.accentPrimary}; box-shadow: 0 0 10px ${theme.accentPrimary}99, 0 2px 6px rgba(0,0,0,0.4); cursor: pointer; transition: transform 120ms, box-shadow 120ms; }
              .cp-slider::-webkit-slider-thumb:hover { transform: scale(1.2); box-shadow: 0 0 16px ${theme.accentPrimary}cc, 0 2px 8px rgba(0,0,0,0.5); }
              .cp-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #fff; border: 2.5px solid ${theme.accentPrimary}; box-shadow: 0 0 10px ${theme.accentPrimary}99; cursor: pointer; }
            `}</style>
            <input
              type="range" min={1} max={10} value={complexity} className="cp-slider"
              onChange={e => setComplexity(+e.target.value)}
              style={{ background: `linear-gradient(to right, ${theme.accentPrimary} 0%, ${theme.accentPrimary} ${(complexity - 1) / 9 * 100}%, rgba(255,255,255,0.12) ${(complexity - 1) / 9 * 100}%, rgba(255,255,255,0.12) 100%)` }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.accentPrimary, minWidth: 16, textAlign: 'center' }}>{complexity}</span>
        </div>

        <button onClick={handleGenerate} disabled={isGenerating}
          style={{ height: 32, borderRadius: 8, fontSize: 12, fontWeight: 700, padding: '0 16px', border: 'none', cursor: isGenerating ? 'not-allowed' : 'pointer', background: isGenerating ? theme.bgTertiary : `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentSecondary || theme.accentPrimary})`, color: isGenerating ? theme.textSecondary : 'white', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 160ms', flexShrink: 0 }}>
          {isGenerating ? <><Loader2 size={12} className="animate-spin" /> Generating...</> : <><Sparkles size={12} /> Generate</>}
        </button>
      </div>

      {/* Error */}
      {error && <div style={{ padding: '8px 12px', background: '#ef444420', border: '1px solid #ef444466', borderRadius: 8, fontSize: 12, color: '#f87171' }}>{error}</div>}

      {/* Empty state */}
      {!isGenerating && recommendations.length === 0 && !error && (
        <div style={{ textAlign: 'center', padding: '20px 16px', color: theme.textSecondary, fontSize: 12, opacity: 0.7 }}>
          Enter a mood or style above and click Generate to get AI-powered progression ideas.
        </div>
      )}

      {/* Recommendations — horizontal card carousel */}
      {recommendations.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 10, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
              {recommendations.length} Suggestions for {currentKey} {currentScale}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[{ dir: 'left' as const, icon: <ChevronLeft size={14} /> }, { dir: 'right' as const, icon: <ChevronRight size={14} /> }].map(({ dir, icon }) => (
                <button key={dir} onClick={() => scrollCarousel(dir)}
                  style={{ width: 26, height: 26, borderRadius: 6, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable card row */}
          <div ref={carouselRef} style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6, scrollbarWidth: 'none' }}>
            {recommendations.map(rec => {
              const moodColor = getMoodColor(rec.mood);
              return (
                <div key={rec.id} style={{
                  width: 200, minWidth: 200, borderRadius: 12, flexShrink: 0,
                  background: theme.bgTertiary,
                  border: `1px solid ${theme.border}`,
                  borderTop: `3px solid ${moodColor}`,
                  display: 'flex', flexDirection: 'column', gap: 0,
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
                    {/* Mood badge */}
                    <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${moodColor}25`, color: moodColor, alignSelf: 'flex-start' }}>
                      {rec.mood}
                    </span>
                    {/* Name */}
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: theme.textPrimary, lineHeight: 1.3 }}>{rec.name}</p>
                    {/* Rationale */}
                    <p style={{ margin: 0, fontSize: 10, color: theme.textSecondary, lineHeight: 1.5, flex: 1 }}>{rec.rationale}</p>
                    {/* Degree pills with arrows */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
                      {rec.degrees.map((deg, i) => {
                        const triad = diatonicDegrees.find(d => d.degree === deg);
                        return (
                          <React.Fragment key={i}>
                            {i > 0 && <span style={{ fontSize: 10, color: theme.textSecondary }}>→</span>}
                            <span style={{ minWidth: 22, height: 22, borderRadius: 5, padding: '0 4px', fontSize: 11, fontWeight: 700, background: triad?.color ?? theme.bgSecondary, color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: triad ? `0 0 6px ${triad.color}66` : 'none' }}>{deg}</span>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                  {/* CTA */}
                  <button onClick={() => onLoadToBuilder(buildStepsFromDegrees(rec.degrees))}
                    style={{ width: '100%', height: 30, borderRadius: 0, border: 'none', borderTop: `1px solid ${theme.border}`, cursor: 'pointer', fontSize: 11, fontWeight: 700, background: `${moodColor}18`, color: moodColor, transition: 'background 120ms' }}
                    onMouseEnter={e => (e.currentTarget.style.background = `${moodColor}30`)}
                    onMouseLeave={e => (e.currentTarget.style.background = `${moodColor}18`)}>
                    Load to Builder →
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
