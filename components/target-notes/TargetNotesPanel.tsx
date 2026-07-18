'use client';

import { useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { TargetNoteSet, TargetNoteHighlight, TargetNoteSetSlim, CARD_COLORS } from '@/lib/target-notes/types';
import { ThemeConfig } from '@/lib/themes';
import { NOTE_COLORS } from '@/lib/musicTheory';
import TargetNoteCard from './TargetNoteCard';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TargetNotesPanelProps {
  currentKey: string;
  currentScale: string;
  scaleNotes: string[];
  activeHighlight: TargetNoteHighlight | null;
  onLoadHighlight: (highlight: TargetNoteHighlight) => void;
  onClearHighlight: () => void;
  bgOpacity: number;
  onBgOpacityChange: (v: number) => void;
  theme: ThemeConfig;
  /** When true, renders without the outer card wrapper (used when hosted inside a tab container) */
  inTabContainer?: boolean;
}

function enrichRecommendations(slims: TargetNoteSetSlim[], scaleNotes: string[]): TargetNoteSet[] {
  return slims.map((s, i) => ({
    ...s,
    id: `ai-rec-${i}`,
    color: CARD_COLORS[i % CARD_COLORS.length],
    source: 'ai' as const,
    notes: s.notes.filter((n) => scaleNotes.includes(n)),
  }));
}

// ── Internal body (extracted to avoid hoisting issues) ─────────────────────
interface BodyProps {
  currentKey: string; currentScale: string; scaleNotes: string[];
  activeHighlight: TargetNoteHighlight | null;
  onLoadHighlight: (h: TargetNoteHighlight) => void;
  onClearHighlight: () => void;
  bgOpacity: number; onBgOpacityChange: (v: number) => void;
  theme: ThemeConfig;
  userPrompt: string; setUserPrompt: (v: string) => void;
  isLoading: boolean; error: string | null;
  recommendations: TargetNoteSet[];
  /** Key+scale context that was used when current recommendations were generated */
  generatedForKey: string | null;
  generatedForScale: string | null;
  handleGenerate: () => void;
  manualSelected: string[]; toggleManualNote: (n: string) => void;
  resetManualSelected: () => void;
  handleLoadManual: () => void;
  isRecActive: (rec: TargetNoteSet) => boolean;
}

function TargetNotesPanelBody({
  currentKey, currentScale, scaleNotes,
  activeHighlight, onLoadHighlight, onClearHighlight,
  bgOpacity, onBgOpacityChange, theme,
  userPrompt, setUserPrompt, isLoading, error, recommendations,
  generatedForKey, generatedForScale,
  handleGenerate, manualSelected, toggleManualNote, resetManualSelected, handleLoadManual, isRecActive,
}: BodyProps) {
  const sec = theme.textSecondary;
  const bg3 = theme.bgTertiary;
  const border = theme.border;
  const accent = theme.accentPrimary;

  // Stale: active highlight exists but key/scale has changed since generation
  const isStale = !!(activeHighlight && generatedForKey && generatedForScale &&
    (generatedForKey !== currentKey || generatedForScale !== currentScale));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── STALE KEY/SCALE WARNING ── */}
      {isStale && (
        <div style={{
          background: `${accent}12`, border: `1px solid ${accent}45`,
          borderRadius: 8, padding: '10px 12px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 15, flexShrink: 0, lineHeight: 1.4 }}>⚠️</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: accent, margin: 0, marginBottom: 3 }}>
              Key / Scale Changed
            </p>
            <p style={{ fontSize: 11, color: sec, margin: 0, marginBottom: 8, lineHeight: 1.45 }}>
              Active notes were generated for{' '}
              <strong style={{ color: theme.textPrimary }}>{generatedForKey} {generatedForScale}</strong>.
              You&apos;re now on{' '}
              <strong style={{ color: theme.textPrimary }}>{currentKey} {currentScale}</strong>.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={handleGenerate}
                disabled={isLoading || !userPrompt.trim()}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: (!isLoading && userPrompt.trim()) ? accent : `${accent}55`,
                  color: '#fff', fontSize: 11, fontWeight: 700, border: 'none',
                  cursor: (!isLoading && userPrompt.trim()) ? 'pointer' : 'not-allowed',
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  transition: 'all 150ms ease-out',
                }}
              >
                {isLoading
                  ? <><Loader2 size={12} className="animate-spin" /> Regenerating…</>
                  : userPrompt.trim() ? '🎯 Regenerate' : 'Enter a mood above first'}
              </button>
              <button
                onClick={onClearHighlight}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: bg3, border: `1px solid ${border}`,
                  color: sec, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                }}
              >
                Clear Active
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── TWO-COLUMN MAIN BODY: AI Generator (left) + Manual Picker (right) ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* LEFT COLUMN — AI Generator */}
        <div style={{ flex: '1 1 240px', minWidth: 200 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: sec, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0, marginBottom: 8 }}>
            AI Generator
          </p>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
            rows={3}
            placeholder={`Mood or feeling?\ne.g. "dark cinematic tension"\nor "warm hopeful sunrise"`}
            style={{
              width: '100%', boxSizing: 'border-box', resize: 'vertical',
              background: bg3, border: `1px solid ${border}`, borderRadius: 8,
              color: theme.textPrimary, fontSize: 12, padding: '8px 10px',
              fontFamily: 'inherit', outline: 'none', display: 'block',
            }}
          />
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={handleGenerate}
              disabled={isLoading || !userPrompt.trim()}
              style={{
                padding: '7px 18px', borderRadius: 8,
                background: (!isLoading && userPrompt.trim()) ? accent : `${accent}55`,
                color: '#fff', fontSize: 12, fontWeight: 700, border: 'none',
                cursor: (!isLoading && userPrompt.trim()) ? 'pointer' : 'not-allowed',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                transition: 'all 150ms ease-out', flexShrink: 0,
              }}
            >
              {isLoading ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : '🎯 Generate'}
            </button>

            {/* Bg Notes Opacity — inline with Generate button */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: sec, whiteSpace: 'nowrap', fontWeight: 500 }}>Bg Opacity</span>
              <div style={{
                position: 'relative', display: 'flex', alignItems: 'center',
                width: 80, height: 22, borderRadius: 11,
                background: 'rgba(0,0,0,0.35)',
                border: `1px solid ${border}`,
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4)',
                padding: '0 7px',
              }}>
                <div style={{
                  position: 'absolute', left: 7, right: 7,
                  top: '50%', transform: 'translateY(-50%)',
                  height: 4, borderRadius: 2,
                  background: `linear-gradient(to right, ${accent} 0%, ${accent} ${bgOpacity}%, rgba(255,255,255,0.12) ${bgOpacity}%, rgba(255,255,255,0.12) 100%)`,
                  pointerEvents: 'none',
                }} />
                <input
                  type="range" min={0} max={100} step={5} value={bgOpacity}
                  onChange={(e) => onBgOpacityChange(parseInt(e.target.value))}
                  title={`Background note opacity: ${bgOpacity}%`}
                  style={{ position: 'relative', width: '100%', height: '100%', opacity: 0, cursor: 'pointer', zIndex: 1, margin: 0 }}
                />
              </div>
              <span style={{ fontSize: 11, fontFamily: 'monospace', color: sec, minWidth: 28 }}>{bgOpacity}%</span>
            </div>
          </div>
          {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{error}</p>}
        </div>

        {/* DIVIDER — vertical between columns */}
        <div style={{ width: 1, background: border, alignSelf: 'stretch', opacity: 0.5, flexShrink: 0 }} />

        {/* RIGHT COLUMN — Manual Picker */}
        <div style={{ flex: '1 1 200px', minWidth: 180 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: sec, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0, marginBottom: 8 }}>
            Manual — {currentKey} {currentScale}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {scaleNotes.map((note) => {
              const isSelected = manualSelected.includes(note);
              const noteColor = (NOTE_COLORS as Record<string, string>)[note] || '#6b7280';
              return (
                <button
                  key={note}
                  onClick={() => toggleManualNote(note)}
                  style={{
                    width: 34, height: 34, borderRadius: '50%', border: 'none',
                    background: isSelected ? noteColor : bg3,
                    color: isSelected ? '#fff' : sec,
                    fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    boxShadow: isSelected ? `0 0 8px ${noteColor}80` : 'none',
                    opacity: isSelected ? 1 : 0.45,
                    transition: 'all 150ms ease-out',
                  }}
                  title={note}
                >
                  {note}
                </button>
              );
            })}
          </div>

          {/* Selected note pills */}
          {manualSelected.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
              {manualSelected.map((n) => {
                const nc = (NOTE_COLORS as Record<string, string>)[n] || '#6b7280';
                return (
                  <span key={n} style={{ borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, background: `${nc}28`, color: nc }}>
                    {n}
                  </span>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <button
              onClick={resetManualSelected}
              style={{
                padding: '6px 13px', borderRadius: 7, background: bg3,
                border: `1px solid ${border}`, color: sec, fontSize: 11, fontWeight: 600, cursor: 'pointer',
              }}
            >
              Reset
            </button>
            <button
              onClick={handleLoadManual}
              disabled={manualSelected.length === 0}
              style={{
                padding: '6px 16px', borderRadius: 7,
                background: manualSelected.length > 0 ? accent : `${accent}55`,
                border: 'none', color: '#fff', fontSize: 11, fontWeight: 700,
                cursor: manualSelected.length > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 150ms ease-out',
              }}
            >
              Load to Fretboard
            </button>
          </div>
        </div>
      </div>

      {/* ── RECOMMENDATION CARDS ── */}
      {recommendations.length > 0 && (
        <>
          <div style={{ height: 1, background: border, opacity: 0.4 }} />
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
            {recommendations.map((rec) => (
              <TargetNoteCard
                key={rec.id}
                noteSet={rec}
                isActive={isRecActive(rec)}
                onLoad={() => onLoadHighlight({ notes: rec.notes, label: rec.label, color: rec.color, source: 'ai' })}
                theme={theme}
              />
            ))}
          </div>
        </>
      )}


    </div>
  );
}

export default function TargetNotesPanel({
  currentKey,
  currentScale,
  scaleNotes,
  activeHighlight,
  onLoadHighlight,
  onClearHighlight,
  bgOpacity,
  onBgOpacityChange,
  theme,
  inTabContainer = false,
}: TargetNotesPanelProps) {
  // ── Persisted session (prompt + last results) ──────────────────────────────
  // Stored as a single compact object so we only use one localStorage slot.
  // recommendations are plain JSON-serializable TargetNoteSet objects — no
  // enrichment needed on restore (enrichRecommendations only adds id+color
  // which are already present on the stored value).
  const [session, setSession] = useLocalStorage<{
    prompt: string;
    generatedForKey: string | null;
    generatedForScale: string | null;
    recommendations: TargetNoteSet[];
  }>('guitar-app-target-notes-session', {
    prompt: '',
    generatedForKey: null,
    generatedForScale: null,
    recommendations: [],
  });

  // Ephemeral UI state — never persisted
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualSelected, setManualSelected] = useLocalStorage<string[]>('guitar-app-manual-target-notes', []);

  // Convenience aliases so the JSX below stays unchanged
  const userPrompt = session.prompt;
  const recommendations = session.recommendations;
  const generatedForKey = session.generatedForKey;
  const generatedForScale = session.generatedForScale;

  // useLocalStorage setter is stable (useCallback-wrapped inside the hook),
  // so we can safely derive setUserPrompt without capturing session in deps.
  const setUserPrompt = useCallback((p: string) => {
    // Read current stored value directly to avoid stale closure on session
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem('guitar-app-target-notes-session') : null;
      const current = raw ? JSON.parse(raw) : { prompt: '', generatedForKey: null, generatedForScale: null, recommendations: [] };
      setSession({ ...current, prompt: p });
    } catch {
      setSession({ prompt: p, generatedForKey: null, generatedForScale: null, recommendations: [] });
    }
  }, [setSession]);

  const handleGenerate = useCallback(async () => {
    if (!session.prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/target-notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentKey, currentScale, scaleNotes, userPrompt: session.prompt }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to generate');
      }
      const data = await res.json();
      const enriched = enrichRecommendations(data.recommendations, scaleNotes);
      // Single atomic write — persists prompt + results + context together
      setSession({
        prompt: session.prompt,
        generatedForKey: currentKey,
        generatedForScale: currentScale,
        recommendations: enriched,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generating recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [session, isLoading, currentKey, currentScale, scaleNotes, setSession]);

  const toggleManualNote = useCallback((note: string) => {
    const current: string[] = (manualSelected as string[]) ?? [];
    if (current.includes(note)) {
      setManualSelected(current.filter((n) => n !== note));
    } else {
      setManualSelected([...current, note]);
    }
  }, [manualSelected, setManualSelected]);

  const resetManualSelected = useCallback(() => {
    setManualSelected([]);
  }, [setManualSelected]);

  const handleLoadManual = useCallback(() => {
    if (manualSelected.length === 0) return;
    onLoadHighlight({
      notes: manualSelected as string[],
      label: 'Manual Selection',
      color: '#EF9F27',
      source: 'manual',
    });
  }, [manualSelected, onLoadHighlight]);

  const isRecActive = useCallback((rec: TargetNoteSet) => {
    if (!activeHighlight) return false;
    return (
      activeHighlight.label === rec.label &&
      activeHighlight.notes.length === rec.notes.length &&
      rec.notes.every((n) => activeHighlight.notes.includes(n))
    );
  }, [activeHighlight]);

  const body = (
    <TargetNotesPanelBody
      currentKey={currentKey} currentScale={currentScale} scaleNotes={scaleNotes}
      activeHighlight={activeHighlight} onLoadHighlight={onLoadHighlight} onClearHighlight={onClearHighlight}
      bgOpacity={bgOpacity} onBgOpacityChange={onBgOpacityChange} theme={theme}
      userPrompt={userPrompt} setUserPrompt={setUserPrompt}
      isLoading={isLoading} error={error} recommendations={recommendations}
      generatedForKey={generatedForKey} generatedForScale={generatedForScale}
      handleGenerate={handleGenerate}
      manualSelected={manualSelected as string[]} toggleManualNote={toggleManualNote}
      resetManualSelected={resetManualSelected}
      handleLoadManual={handleLoadManual} isRecActive={isRecActive}
    />
  );

  // When hosted inside a tab container, render the body flat (no card wrapper, no collapse)
  if (inTabContainer) {
    return body;
  }

  // Standalone card mode (legacy — kept for if used outside tabs)
  return (
    <div style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
      {body}
    </div>
  );
}
