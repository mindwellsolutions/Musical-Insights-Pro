'use client';

/**
 * Smart Add Chord Modal
 * - Empty timeline  → two-panel: chord library (left) + AI full progression generator (right)
 * - Has chords      → tabs: "AI Recommend next" | "Chord Library"
 * - Editing chord   → chord library only (redesigned)
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Search, Sparkles, RefreshCw, Plus, Loader2,
  Music, Zap, AlertCircle, CheckCircle2,
} from 'lucide-react';
import {
  CHORD_LIBRARY, CHORD_CATEGORIES, ChordDefinition, searchChords, ChordCategory,
} from '@/lib/chord-progression/chord-library';
import { getChordColor } from '@/lib/chord-progression/chord-colors';
import { ChordInstance, ScaleModeInstance } from '@/lib/chord-progression/types';
import ChordDiagram from '@/components/ChordDiagram';
import { calculateChordVoicings, ChordVoicing } from '@/lib/chord-voicings';
import { ThemeConfig } from '@/lib/themes';

// Minimal dark theme for voicing diagrams inside modal
const MODAL_THEME: ThemeConfig = {
  name: 'Modal',
  bgPrimary: '#0a0a0a', bgSecondary: '#1a1a1a', bgTertiary: '#2a2a2a',
  textPrimary: '#ffffff', textSecondary: '#a0a0a0', border: '#333333',
  fretboardBg: '#1e1e1e', fretboardFret: '#4a4a4a', fretboardString: '#666666',
  fretMarker: '#888888', sidebarBg: '#141414', buttonPrimary: '#2563eb',
  buttonSecondary: '#374151', buttonHover: '#3b82f6',
  accentPrimary: '#3b82f6', accentSecondary: '#60a5fa',
};

const STD_TUNING = ['E', 'A', 'D', 'G', 'B', 'E'];

// ── Types ─────────────────────────────────────────────────────────────────────

interface NextChordEntry {
  chordSymbol: string;
  confidence: number;
  rationale: string;
  role: string;
}
interface NextChordResult {
  topRecommendation: NextChordEntry;
  alternatives: NextChordEntry[];
  fullCompletion: string[];
  fullCompletionRationale: string;
}
interface AIFullProgRec {
  id: string;
  progression: string[];
  name: string;
  rationale: string;
  mood: string;
  complexity: number;
}

export interface AddChordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentKey: string;
  onChordSelect: (chordSymbol: string, duration: number, voicingIndex?: number, voicingForced?: boolean) => void;
  editingChord?: ChordInstance | null;
  currentProgression?: ChordInstance[];
  currentScaleModes?: ScaleModeInstance[];
  onLoadFullProgression?: (chords: string[]) => void;
  tuning?: string[];
}

// ── Duration selector ─────────────────────────────────────────────────────────
const DURATION_OPTIONS = [
  { value: '1', label: '1 beat' },
  { value: '2', label: '2 beats' },
  { value: '4', label: '4 beats' },
  { value: '8', label: '8 beats' },
  { value: '16', label: '16 beats' },
];

// ── Chord Library Panel ───────────────────────────────────────────────────────
function ChordLibraryPanel({
  selectedChord,
  onChordClick,
  compact = false,
}: {
  selectedChord: ChordDefinition | null;
  onChordClick: (c: ChordDefinition) => void;
  compact?: boolean;
}) {
  const [cat, setCat] = useState<ChordCategory>('Triads');
  const [q, setQ] = useState('');
  const displayed = q ? searchChords(q) : CHORD_LIBRARY[cat];

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
        <Input
          placeholder="Search chords…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 h-9 bg-white/5 border-white/10 text-white placeholder:text-white/25 text-sm focus:border-[#3b82f6]/60"
        />
      </div>
      <div className="flex gap-3 flex-1 min-h-0">
        {/* Category sidebar */}
        <div className="w-28 shrink-0 flex flex-col gap-0.5">
          <p className="text-[9px] font-bold tracking-widest text-white/25 mb-1 uppercase">Category</p>
          {CHORD_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCat(c); setQ(''); }}
              className="text-left px-2 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: cat === c && !q ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
                color: cat === c && !q ? '#fff' : 'rgba(255,255,255,0.4)',
              }}
            >
              {c}
            </button>
          ))}
        </div>
        {/* Grid */}
        <div className="flex-1 overflow-y-auto">
          <div className={`grid gap-1.5 ${compact ? 'grid-cols-6' : 'grid-cols-7'}`}>
            {displayed.map((chord) => {
              const cc = getChordColor(chord.symbol);
              const isSel = selectedChord?.symbol === chord.symbol;
              return (
                <button
                  key={chord.symbol}
                  onClick={() => onChordClick(chord)}
                  title={chord.name}
                  className="h-10 rounded-lg flex items-center justify-center transition-all duration-150"
                  style={{
                    background: isSel ? cc.gradient : 'linear-gradient(135deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))',
                    border: isSel ? `2px solid ${cc.base}` : '1.5px solid rgba(255,255,255,0.08)',
                    boxShadow: isSel ? `0 0 14px ${cc.glow}` : 'none',
                    transform: isSel ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span className="text-xs font-bold text-white leading-none">{chord.symbol}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Voicing Selector ──────────────────────────────────────────────────────────
function VoicingSelector({
  chord,
  selectedVoicingIndex,
  onVoicingSelect,
  voicingForced,
  onVoicingForcedChange,
  tuning,
}: {
  chord: ChordDefinition;
  selectedVoicingIndex: number;
  onVoicingSelect: (idx: number) => void;
  voicingForced: boolean;
  onVoicingForcedChange: (forced: boolean) => void;
  tuning: string[];
}) {
  const voicings = useMemo((): ChordVoicing[] => {
    if (!chord.notes || chord.notes.length === 0) return [];
    return calculateChordVoicings(chord.notes, chord.notes[0], tuning, 15);
  }, [chord, tuning]);

  if (voicings.length === 0) return null;

  return (
    <div className="shrink-0 border-t border-white/10 pt-3 mt-3">
      {/* Header row with title + force toggle */}
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase">
          Guitar Voicings <span className="text-white/15 font-normal normal-case tracking-normal ml-1">— select a position to use on the fretboard</span>
        </p>
        {/* Force Voicing Position toggle */}
        <button
          type="button"
          onClick={() => onVoicingForcedChange(!voicingForced)}
          className="flex items-center gap-2 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all duration-200 shrink-0 ml-4"
          style={{
            background: voicingForced
              ? 'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(234,88,12,0.15))'
              : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${voicingForced ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: voicingForced ? '#f59e0b' : 'rgba(255,255,255,0.35)',
          }}
          title="When on, this chord always appears in the selected voicing position even as you navigate other chord neighborhoods"
        >
          {/* Toggle pill */}
          <span
            className="relative inline-flex items-center w-7 h-4 rounded-full transition-colors duration-200 shrink-0"
            style={{ background: voicingForced ? '#f59e0b' : 'rgba(255,255,255,0.15)' }}
          >
            <span
              className="absolute w-3 h-3 rounded-full bg-white shadow transition-transform duration-200"
              style={{ transform: voicingForced ? 'translateX(14px)' : 'translateX(2px)' }}
            />
          </span>
          Force Voicing Position
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 pr-1">
        {voicings.map((voicing, idx) => {
          const isSel = idx === selectedVoicingIndex;
          return (
            <div
              key={idx}
              onClick={() => onVoicingSelect(idx)}
              className="shrink-0 cursor-pointer rounded-xl p-2 flex flex-col items-center gap-1 transition-all duration-200"
              style={{
                background: isSel
                  ? 'linear-gradient(135deg,rgba(59,130,246,0.18),rgba(99,102,241,0.12))'
                  : 'rgba(255,255,255,0.03)',
                border: `${isSel ? 2 : 1.5}px solid ${isSel ? '#3b82f6' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: isSel ? '0 0 18px rgba(59,130,246,0.3)' : 'none',
                transform: isSel ? 'translateY(-1px) scale(1.02)' : 'none',
              }}
              title={voicing.commonName || `Voicing ${idx + 1}`}
            >
              <ChordDiagram voicing={voicing} theme={MODAL_THEME} stringCount={tuning.length as 6 | 7} compact />
              <div className="flex items-center gap-1 mt-0.5">
                {isSel ? (
                  <CheckCircle2 size={11} className="text-[#3b82f6]" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full border border-white/20" />
                )}
                <span
                  className="text-[9px] font-semibold"
                  style={{ color: isSel ? '#3b82f6' : 'rgba(255,255,255,0.3)' }}
                >
                  {voicing.commonName || `Position ${idx + 1}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Footer bar ─────────────────────────────────────────────────────────────────
function FooterBar({
  selectedChord,
  duration,
  setDuration,
  onConfirm,
  onCancel,
  confirmLabel,
}: {
  selectedChord: ChordDefinition | null;
  duration: string;
  setDuration: (v: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel: string;
}) {
  const cc = selectedChord ? getChordColor(selectedChord.symbol) : null;
  return (
    <div className="flex items-center justify-between pt-4 mt-auto border-t border-white/10">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-white/50">Duration:</span>
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger className="w-28 h-8 bg-white/5 border-white/10 text-white text-xs focus:border-[#3b82f6]/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#1e1e2a] border-white/10 text-white z-[200]">
            {DURATION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value} className="text-xs text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCancel}
          className="px-5 h-9 bg-transparent border-white/15 text-white/60 hover:bg-white/5 hover:border-white/25 text-xs font-semibold">
          Cancel
        </Button>
        <Button size="sm" onClick={onConfirm} disabled={!selectedChord}
          className="px-5 h-9 text-xs font-semibold disabled:opacity-40 transition-all"
          style={cc
            ? { background: cc.gradient, boxShadow: `0 4px 14px ${cc.glow}` }
            : { background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }
          }>
          {confirmLabel}
        </Button>
      </div>
    </div>
  );
}

// ── AI Next Chord Tab ─────────────────────────────────────────────────────────
function AIRecommendTab({
  currentKey,
  currentProgression,
  currentScaleModes,
  onAddChord,
  onLoadCompletion,
  onSwitchToLibrary,
}: {
  currentKey: string;
  currentProgression: ChordInstance[];
  currentScaleModes: ScaleModeInstance[];
  onAddChord: (symbol: string) => void;
  onLoadCompletion: (symbols: string[]) => void;
  onSwitchToLibrary: () => void;
}) {
  const [descriptors, setDescriptors] = useState('');
  const [result, setResult] = useState<NextChordResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchRecommendations = useCallback(async (desc: string) => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/chord-progression/recommend-next-chord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          currentKey,
          currentProgression: currentProgression.map(c => ({
            chordSymbol: c.chordSymbol, duration: c.duration, startTime: c.startTime,
          })),
          currentScaleModes: currentScaleModes.map(s => ({
            scaleName: s.scaleName, rootNote: s.rootNote, startTime: s.startTime, duration: s.duration,
          })),
          userDescriptors: desc,
        }),
      });
      if (!res.ok) throw new Error('AI request failed');
      const data: NextChordResult = await res.json();
      setResult(data);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError('Could not get recommendations. Try again.');
    } finally {
      setLoading(false);
    }
  }, [currentKey, currentProgression, currentScaleModes]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchRecommendations('');
    return () => { abortRef.current?.abort(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const top = result?.topRecommendation;
  const topColor = top ? getChordColor(top.chordSymbol) : null;

  return (
    <div className="flex flex-col h-full gap-4 overflow-y-auto pb-2 pr-1">
      {/* Current progression context */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase shrink-0">Current:</span>
        {currentProgression.map((c, i) => {
          const cc = getChordColor(c.chordSymbol);
          return (
            <span key={c.id} className="flex items-center gap-1">
              <span className="px-2 py-0.5 rounded text-xs font-bold text-white"
                style={{ background: cc.gradient, boxShadow: `0 0 8px ${cc.glow}` }}>
                {c.chordSymbol}
              </span>
              {i < currentProgression.length - 1 && (
                <span className="text-white/20 text-xs">→</span>
              )}
            </span>
          );
        })}
        <span className="text-white/30 text-xs">→ ?</span>
      </div>

      {/* Vibe descriptor input */}
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <label className="text-[10px] font-bold tracking-widest text-white/30 uppercase block mb-1.5">
            Vibe / Genre Descriptors (optional)
          </label>
          <Input
            placeholder="e.g. melancholic jazz, uplifting pop, dark cinematic…"
            value={descriptors}
            onChange={(e) => setDescriptors(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchRecommendations(descriptors)}
            className="h-9 bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm focus:border-[#3b82f6]/60"
          />
        </div>
        <Button size="sm" onClick={() => fetchRecommendations(descriptors)} disabled={loading}
          className="h-9 gap-1.5 bg-white/8 hover:bg-white/12 border border-white/15 text-white/70 text-xs font-semibold shrink-0 px-3">
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          {loading ? 'Analyzing…' : 'Refresh'}
        </Button>
      </div>

      {/* Loading state */}
      {loading && !result && (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-8">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-[#3b82f6]/20 animate-ping" />
            <Sparkles className="w-5 h-5 text-[#3b82f6] animate-pulse" />
          </div>
          <p className="text-sm text-white/40">AI is analyzing your progression…</p>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {result && !loading && (
        <>
          {/* Top Recommendation Hero */}
          {top && topColor && (
            <div>
              <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">Best Next Chord</p>
              <button
                onClick={() => onAddChord(top.chordSymbol)}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 hover:scale-[1.01] group text-left"
                style={{
                  background: `linear-gradient(135deg, ${topColor.base}20 0%, rgba(255,255,255,0.03) 100%)`,
                  border: `2px solid ${topColor.base}50`,
                  boxShadow: `0 0 30px ${topColor.glow}40, 0 4px 20px rgba(0,0,0,0.4)`,
                }}
              >
                {/* Chord symbol */}
                <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: topColor.gradient, boxShadow: `0 0 20px ${topColor.glow}` }}>
                  <span className="text-2xl font-black text-white">{top.chordSymbol}</span>
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${topColor.base}30`, color: topColor.base }}>
                      {top.role}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: topColor.base }}>
                      {top.confidence}% match
                    </span>
                  </div>
                  <p className="text-xs text-white/60 leading-relaxed line-clamp-2">{top.rationale}</p>
                </div>
                {/* Add icon */}
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                  style={{ background: topColor.gradient }}>
                  <Plus className="w-4 h-4 text-white" />
                </div>
              </button>
            </div>
          )}

          {/* Alternatives grid */}
          {result.alternatives.length > 0 && (
            <div>
              <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-2">Alternatives</p>
              <div className="grid grid-cols-3 gap-2">
                {result.alternatives.slice(0, 6).map((alt) => {
                  const ac = getChordColor(alt.chordSymbol);
                  return (
                    <button key={alt.chordSymbol} onClick={() => onAddChord(alt.chordSymbol)}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150 hover:scale-[1.02] group text-left"
                      style={{
                        background: `linear-gradient(135deg,${ac.base}12,rgba(255,255,255,0.02))`,
                        border: `1.5px solid ${ac.base}30`,
                      }}
                      title={alt.rationale}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: ac.gradient }}>
                        <span className="text-sm font-black text-white">{alt.chordSymbol}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold truncate" style={{ color: ac.base }}>{alt.role}</p>
                        <p className="text-[9px] text-white/35">{alt.confidence}% match</p>
                      </div>
                      <Plus className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Full Completion */}
          {result.fullCompletion.length > 0 && (
            <div className="px-4 py-3 rounded-xl"
              style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(59,130,246,0.08))', border: '1.5px solid rgba(139,92,246,0.25)' }}>
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-1.5">Complete My Progression</p>
                  <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                    {result.fullCompletion.map((sym, i) => {
                      const fc = getChordColor(sym);
                      return (
                        <span key={i} className="flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded text-xs font-bold text-white"
                            style={{ background: fc.gradient }}>
                            {sym}
                          </span>
                          {i < result.fullCompletion.length - 1 && <span className="text-white/20 text-xs">→</span>}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-white/40 leading-relaxed">{result.fullCompletionRationale}</p>
                </div>
                <Button size="sm" onClick={() => onLoadCompletion(result.fullCompletion)}
                  className="gap-1.5 px-4 h-9 bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] hover:opacity-90 text-white text-xs font-bold shrink-0 shadow-lg shadow-purple-500/20">
                  <Zap className="w-3.5 h-3.5" />
                  Add All
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── AI Full Progression Panel (empty state) ────────────────────────────────────
function AIFullProgPanel({
  currentKey,
  onLoadProgression,
}: {
  currentKey: string;
  onLoadProgression: (chords: string[]) => void;
}) {
  const [prompt, setPrompt] = useState('');
  const [complexity, setComplexity] = useState(5);
  const [numChords, setNumChords] = useState(5);
  const [loading, setLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<AIFullProgRec[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const presets = ['Melancholic & emotional', 'Uplifting & energetic', 'Dark & cinematic', 'Jazzy & sophisticated', 'Epic & dramatic'];

  const generate = async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true); setError(null); setResults([]);
    setHasGenerated(true);
    try {
      const res = await fetch('/api/chord-progression/generate-recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: ctrl.signal,
        body: JSON.stringify({
          currentKey, userPrompt: prompt, complexity, numChords,
          numRecommendations: 3, currentProgression: [], currentScaleModes: [],
        }),
      });
      if (!res.ok) throw new Error('Generation failed');
      const data = await res.json();
      setResults(data.recommendations || []);
    } catch (e: any) {
      if (e.name !== 'AbortError') setError('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => () => { abortRef.current?.abort(); }, []);

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Header + Controls */}
      <div className="flex flex-col gap-3 shrink-0">
        {/* Title row */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6]">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Progression Generator</p>
            <p className="text-[10px] text-white/55">Describe a vibe and generate a full chord sequence</p>
          </div>
        </div>

        {/* Chord count + Complexity controls — below header */}
        <div className="flex items-center gap-4 px-0.5">
          {/* Chord count */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest shrink-0">Chords</span>
            <div className="flex-1 relative">
              <input
                type="range" min={2} max={10} value={numChords}
                onChange={(e) => setNumChords(+e.target.value)}
                className="ai-complexity-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${(numChords - 2) / 8 * 100}%, rgba(255,255,255,0.1) ${(numChords - 2) / 8 * 100}%, rgba(255,255,255,0.1) 100%)`,
                  WebkitAppearance: 'none',
                }}
              />
            </div>
            <span className="text-xs font-bold w-5 text-center shrink-0"
              style={{ color: `hsl(${230 - numChords * 10}, 80%, 70%)` }}>
              {numChords}
            </span>
          </div>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10 shrink-0" />

          {/* Complexity */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <span className="text-[10px] text-white/50 uppercase font-bold tracking-widest shrink-0">Complexity</span>
            <div className="flex-1 relative">
              <input
                type="range" min={1} max={10} value={complexity}
                onChange={(e) => setComplexity(+e.target.value)}
                className="ai-complexity-slider w-full h-1.5 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${(complexity - 1) / 9 * 100}%, rgba(255,255,255,0.1) ${(complexity - 1) / 9 * 100}%, rgba(255,255,255,0.1) 100%)`,
                  WebkitAppearance: 'none',
                }}
              />
            </div>
            <span className="text-xs font-bold w-5 text-center shrink-0"
              style={{ color: `hsl(${230 - complexity * 14}, 80%, 70%)` }}>
              {complexity}
            </span>
          </div>
        </div>
      </div>

      {/* Preset chips — hidden after first generate */}
      {!hasGenerated && (
        <div className="flex flex-wrap gap-1.5 shrink-0">
          {presets.map((p) => (
            <button key={p} onClick={() => setPrompt(p)}
              className="px-2.5 py-1 rounded-full text-[10px] font-medium border border-white/10 text-white/50 hover:border-[#3b82f6]/50 hover:text-[#3b82f6] transition-all">
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Prompt */}
      <Textarea
        placeholder="Describe the feel, genre, or mood of your progression…"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        className="bg-white/5 border-white/10 text-white placeholder:text-white/20 text-sm resize-none focus:border-[#3b82f6]/60 shrink-0"
      />

      {/* Generate button */}
      <Button onClick={generate} disabled={loading}
        className="gap-2 h-10 font-bold text-sm bg-gradient-to-r from-[#3b82f6] to-[#8b5cf6] hover:opacity-90 shadow-lg shadow-blue-500/20 transition-all shrink-0">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</> : <><Sparkles className="w-4 h-4" />Generate Full Progression</>}
      </Button>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
          {results.map((rec) => (
            <div key={rec.id}
              className="px-4 py-3 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white mb-1">{rec.name}</p>
                  <div className="flex gap-1 flex-wrap mb-2">
                    {rec.progression.map((sym, i) => {
                      const cc = getChordColor(sym);
                      return (
                        <span key={i} className="flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
                            style={{ background: cc.gradient }}>{sym}</span>
                          {i < rec.progression.length - 1 && <span className="text-white/20 text-[10px]">→</span>}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-white/40 line-clamp-2">{rec.rationale}</p>
                </div>
                <Button size="sm" onClick={() => onLoadProgression(rec.progression)}
                  className="shrink-0 h-8 px-3 text-xs font-bold gap-1 bg-gradient-to-r from-[#3b82f6] to-[#6366f1] hover:opacity-90">
                  <Plus className="w-3 h-3" />Load
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Modal ─────────────────────────────────────────────────────────────────
export default function AddChordModal({
  open,
  onOpenChange,
  currentKey,
  onChordSelect,
  editingChord,
  currentProgression = [],
  currentScaleModes = [],
  onLoadFullProgression,
  tuning = STD_TUNING,
}: AddChordModalProps) {
  const hasChords = currentProgression.length > 0;

  // Tab: 'ai' | 'library' (only when hasChords && !editingChord)
  const [activeTab, setActiveTab] = useState<'ai' | 'library'>('ai');
  const [selectedChord, setSelectedChord] = useState<ChordDefinition | null>(null);
  const [duration, setDuration] = useState('4');
  const [selectedVoicingIndex, setSelectedVoicingIndex] = useState(0);
  const [voicingForced, setVoicingForced] = useState(false);

  // Reset on open/close
  useEffect(() => {
    if (open) {
      setSelectedChord(null);
      setSelectedVoicingIndex(0);
      setVoicingForced(false);
      setActiveTab(hasChords && !editingChord ? 'ai' : 'library');
      if (editingChord) {
        setDuration(editingChord.duration.toString());
        setSelectedVoicingIndex(editingChord.voicingIndex ?? 0);
        setVoicingForced(editingChord.voicingForced ?? false);
        const match = Object.values(CHORD_LIBRARY).flat().find(c => c.symbol === editingChord.chordSymbol);
        if (match) setSelectedChord(match);
      } else {
        setDuration('4');
      }
    }
  }, [open, editingChord, hasChords]);

  // Reset voicing index when chord changes
  const handleChordSelect = (chord: ChordDefinition) => {
    setSelectedChord(chord);
    setSelectedVoicingIndex(0);
    setVoicingForced(false);
  };

  const handleConfirm = () => {
    if (!selectedChord) return;
    onChordSelect(selectedChord.symbol, parseFloat(duration), selectedVoicingIndex, voicingForced);
    onOpenChange(false);
  };

  const handleAddSingleChord = (symbol: string) => {
    onChordSelect(symbol, parseFloat(duration), 0);
    onOpenChange(false);
  };

  const handleLoadCompletion = (symbols: string[]) => {
    symbols.forEach((sym) => onChordSelect(sym, parseFloat(duration), 0));
    onOpenChange(false);
  };

  const handleLoadFullProg = (chords: string[]) => {
    if (onLoadFullProgression) {
      onLoadFullProgression(chords);
    } else {
      chords.forEach((sym) => onChordSelect(sym, 4));
    }
    onOpenChange(false);
  };

  // ── Render title ─────────────────────────────────────────────────────────────
  const title = editingChord
    ? 'Update Chord'
    : hasChords
      ? 'Add Next Chord'
      : 'Start Your Progression';

  const subtitle = editingChord
    ? 'Select a replacement chord from the library'
    : hasChords
      ? `Key of ${currentKey} · ${currentProgression.length} chord${currentProgression.length > 1 ? 's' : ''} in timeline`
      : `Key of ${currentKey} · Build your first progression`;

  // ── Modal size: wider for empty state (two-panel) ─────────────────────────────
  const modalWidth = !editingChord && !hasChords ? 'max-w-5xl' : 'max-w-4xl';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${modalWidth} h-[875px] flex flex-col p-0 overflow-hidden`}
        style={{
          background: 'linear-gradient(145deg,#14141e 0%,#0d0d15 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04)',
        }}>

        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/8 shrink-0"
          style={{ background: 'linear-gradient(180deg,rgba(59,130,246,0.06) 0%,transparent 100%)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', boxShadow: '0 0 16px rgba(59,130,246,0.4)' }}>
                <Music className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white block leading-tight">{title}</span>
                <span className="text-xs text-white/35 font-normal">{subtitle}</span>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Tabs (only in "has chords, not editing" mode) */}
          {hasChords && !editingChord && (
            <div className="flex gap-1 mt-4 p-1 rounded-xl w-fit"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'ai' as const, label: 'AI Recommend', icon: Sparkles },
                { id: 'library' as const, label: 'Chord Library', icon: Music },
              ].map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                  style={{
                    background: activeTab === id ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'transparent',
                    color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.4)',
                    boxShadow: activeTab === id ? '0 2px 12px rgba(59,130,246,0.3)' : 'none',
                  }}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden px-6 py-5">

          {/* ── EDITING MODE: library only ─────────────────────────────────── */}
          {editingChord && (
            <div className="flex flex-col h-full overflow-y-auto">
              <div className="flex-1 min-h-0">
                <ChordLibraryPanel selectedChord={selectedChord} onChordClick={handleChordSelect} />
              </div>
              {selectedChord && (
                <VoicingSelector
                  chord={selectedChord}
                  selectedVoicingIndex={selectedVoicingIndex}
                  onVoicingSelect={setSelectedVoicingIndex}
                  voicingForced={voicingForced}
                  onVoicingForcedChange={setVoicingForced}
                  tuning={tuning}
                />
              )}
              <FooterBar
                selectedChord={selectedChord} duration={duration} setDuration={setDuration}
                onConfirm={handleConfirm} onCancel={() => onOpenChange(false)} confirmLabel="Update Chord"
              />
            </div>
          )}

          {/* ── EMPTY STATE: two-panel (library + AI generator) ────────────── */}
          {!editingChord && !hasChords && (
            <div className="flex gap-6 h-full">
              {/* Left: Chord Library + Voicing selector */}
              <div className="flex flex-col w-[52%] h-full overflow-y-auto">
                <p className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-3">
                  Or pick a single chord to start
                </p>
                <div className="flex-1 min-h-0">
                  <ChordLibraryPanel selectedChord={selectedChord} onChordClick={handleChordSelect} compact />
                </div>
                {selectedChord && (
                  <VoicingSelector
                    chord={selectedChord}
                    selectedVoicingIndex={selectedVoicingIndex}
                    onVoicingSelect={setSelectedVoicingIndex}
                    voicingForced={voicingForced}
                    onVoicingForcedChange={setVoicingForced}
                    tuning={tuning}
                  />
                )}
                <FooterBar
                  selectedChord={selectedChord} duration={duration} setDuration={setDuration}
                  onConfirm={handleConfirm} onCancel={() => onOpenChange(false)} confirmLabel="Add Chord"
                />
              </div>

              {/* Divider */}
              <div className="w-px shrink-0 bg-white/8 self-stretch" />

              {/* Right: AI full progression generator */}
              <div className="flex-1 min-w-0 h-full overflow-y-auto">
                <AIFullProgPanel currentKey={currentKey} onLoadProgression={handleLoadFullProg} />
              </div>
            </div>
          )}

          {/* ── HAS CHORDS: tabbed ─────────────────────────────────────────── */}
          {!editingChord && hasChords && (
            <div className="flex flex-col h-full">
              <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'ai' && (
                  <AIRecommendTab
                    currentKey={currentKey}
                    currentProgression={currentProgression}
                    currentScaleModes={currentScaleModes}
                    onAddChord={handleAddSingleChord}
                    onLoadCompletion={handleLoadCompletion}
                    onSwitchToLibrary={() => setActiveTab('library')}
                  />
                )}
                {activeTab === 'library' && (
                  <div className="flex flex-col h-full overflow-y-auto">
                    <div className="flex-1 min-h-0">
                      <ChordLibraryPanel selectedChord={selectedChord} onChordClick={handleChordSelect} />
                    </div>
                    {selectedChord && (
                      <VoicingSelector
                        chord={selectedChord}
                        selectedVoicingIndex={selectedVoicingIndex}
                        onVoicingSelect={setSelectedVoicingIndex}
                        voicingForced={voicingForced}
                        onVoicingForcedChange={setVoicingForced}
                        tuning={tuning}
                      />
                    )}
                    <FooterBar
                      selectedChord={selectedChord} duration={duration} setDuration={setDuration}
                      onConfirm={handleConfirm} onCancel={() => onOpenChange(false)} confirmLabel="Add Chord"
                    />
                  </div>
                )}
              </div>

              {/* Duration footer for AI tab */}
              {activeTab === 'ai' && (
                <div className="flex items-center gap-2 pt-3 mt-auto border-t border-white/10">
                  <span className="text-xs text-white/35 font-semibold">Default duration for added chords:</span>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger className="w-28 h-8 bg-white/5 border-white/10 text-white text-xs focus:border-[#3b82f6]/60">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1e1e2a] border-white/10 text-white z-[200]">
                      {DURATION_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value} className="text-xs text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}
                    className="ml-auto px-5 h-8 bg-transparent border-white/15 text-white/50 hover:bg-white/5 text-xs font-semibold">
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
