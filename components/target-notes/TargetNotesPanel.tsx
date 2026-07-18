'use client';

import { useState, useCallback } from 'react';
import { Loader2, Target, X } from 'lucide-react';
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
  bgOpacity: number; onBgOpacityChange: (v: number) => void;
  theme: ThemeConfig;
  userPrompt: string; setUserPrompt: (v: string) => void;
  isLoading: boolean; error: string | null;
  recommendations: TargetNoteSet[];
  handleGenerate: () => void;
  manualSelected: string[]; toggleManualNote: (n: string) => void;
  resetManualSelected: () => void;
  handleLoadManual: () => void;
  isRecActive: (rec: TargetNoteSet) => boolean;
}

function TargetNotesPanelBody({
  currentKey, currentScale, scaleNotes,
  activeHighlight, onLoadHighlight,
  bgOpacity, onBgOpacityChange, theme,
  userPrompt, setUserPrompt, isLoading, error, recommendations,
  handleGenerate, manualSelected, toggleManualNote, resetManualSelected, handleLoadManual, isRecActive,
}: BodyProps) {
  const sec = theme.textSecondary;
  const bg3 = theme.bgTertiary;
  const border = theme.border;
  const accent = theme.accentPrimary;

  return (
    <div style={{ padding: '0 14px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* ── AI GENERATOR ── */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: sec, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          AI Generator
        </p>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleGenerate(); } }}
          rows={2}
          placeholder={`What mood or feeling? e.g. "dark cinematic tension" or "warm hopeful sunrise"`}
          style={{
            width: '100%', boxSizing: 'border-box', resize: 'none',
            background: bg3, border: `1px solid ${border}`, borderRadius: 8,
            color: theme.textPrimary, fontSize: 12, padding: '8px 10px',
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !userPrompt.trim()}
          style={{
            marginTop: 8, width: '100%', padding: '8px 0', borderRadius: 8,
            background: (!isLoading && userPrompt.trim()) ? accent : `${accent}55`,
            color: '#fff', fontSize: 12, fontWeight: 700, border: 'none',
            cursor: (!isLoading && userPrompt.trim()) ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            transition: 'all 150ms ease-out',
          }}
        >
          {isLoading ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : '✨ Generate Recommendations'}
        </button>
        {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6 }}>{error}</p>}
      </div>

      {/* ── RECOMMENDATION CARDS ── */}
      {recommendations.length > 0 && (
        <div
          style={{
            display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4,
            scrollbarWidth: 'none',
          }}
        >
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
      )}

      {/* ── DIVIDER ── */}
      <div style={{ height: 1, background: border, opacity: 0.5 }} />

      {/* ── MANUAL PICKER ── */}
      <div>
        <p style={{ fontSize: 10, fontWeight: 700, color: sec, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
          Manual — {currentKey} {currentScale}
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {scaleNotes.map((note) => {
            const isSelected = manualSelected.includes(note);
            const noteColor = (NOTE_COLORS as Record<string, string>)[note] || '#6b7280';
            return (
              <button
                key={note}
                onClick={() => toggleManualNote(note)}
                style={{
                  width: 38, height: 38, borderRadius: '50%', border: 'none',
                  background: isSelected ? noteColor : bg3,
                  color: isSelected ? '#fff' : sec,
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                  boxShadow: isSelected ? `0 0 10px ${noteColor}80` : 'none',
                  opacity: isSelected ? 1 : 0.5,
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
                <span key={n} style={{ borderRadius: 999, padding: '2px 8px', fontSize: 11, fontWeight: 700, background: `${nc}30`, color: nc }}>
                  {n}
                </span>
              );
            })}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={resetManualSelected}
            style={{
              flex: 1, padding: '7px 0', borderRadius: 7, background: bg3,
              border: `1px solid ${border}`, color: sec, fontSize: 11, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Reset
          </button>
          <button
            onClick={handleLoadManual}
            disabled={manualSelected.length === 0}
            style={{
              flex: 2, padding: '7px 0', borderRadius: 7,
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

      {/* ── BG OPACITY ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: sec, whiteSpace: 'nowrap' }}>Background opacity</span>
        <input
          type="range" min={0} max={100} value={bgOpacity}
          onChange={(e) => onBgOpacityChange(parseInt(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 11, fontFamily: 'monospace', color: sec, minWidth: 30 }}>{bgOpacity}%</span>
      </div>
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
}: TargetNotesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<TargetNoteSet[]>([]);
  const [manualSelected, setManualSelected] = useLocalStorage<string[]>('guitar-app-manual-target-notes', []);

  const handleGenerate = useCallback(async () => {
    if (!userPrompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/target-notes/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentKey, currentScale, scaleNotes, userPrompt }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to generate');
      }
      const data = await res.json();
      setRecommendations(enrichRecommendations(data.recommendations, scaleNotes));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error generating recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [userPrompt, isLoading, currentKey, currentScale, scaleNotes]);

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
      notes: manualSelected,
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

  const border = theme.border;
  const bgSec = theme.bgSecondary;

  return (
    <div style={{ background: bgSec, border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden', marginTop: 12 }}>
      {/* Panel header — use div to avoid nested <button> hydration error */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsCollapsed((c) => !c)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setIsCollapsed((c) => !c); }}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px', background: 'none', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Target size={14} style={{ color: theme.accentPrimary }} />
          <span style={{ fontSize: 13, fontWeight: 700, color: theme.textPrimary }}>Target Notes</span>
          {activeHighlight && (
            <span style={{
              fontSize: 10, fontWeight: 700, color: activeHighlight.color,
              background: `${activeHighlight.color}20`, border: `1px solid ${activeHighlight.color}50`,
              borderRadius: 999, padding: '1px 7px',
            }}>
              Active
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {activeHighlight && (
            <button
              onClick={(e) => { e.stopPropagation(); onClearHighlight(); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 2 }}
              title="Clear target notes"
            >
              <X size={13} />
            </button>
          )}
          <span style={{ fontSize: 11, color: theme.textSecondary }}>{isCollapsed ? '▼' : '▲'}</span>
        </div>
      </div>
      {/* Body rendered below — see continuation */}
      {!isCollapsed && <TargetNotesPanelBody
        currentKey={currentKey} currentScale={currentScale} scaleNotes={scaleNotes}
        activeHighlight={activeHighlight} onLoadHighlight={onLoadHighlight}
        bgOpacity={bgOpacity} onBgOpacityChange={onBgOpacityChange} theme={theme}
        userPrompt={userPrompt} setUserPrompt={setUserPrompt}
        isLoading={isLoading} error={error} recommendations={recommendations}
        handleGenerate={handleGenerate}
        manualSelected={manualSelected as string[]} toggleManualNote={toggleManualNote}
        resetManualSelected={resetManualSelected}
        handleLoadManual={handleLoadManual} isRecActive={isRecActive}
      />}
    </div>
  );
}
