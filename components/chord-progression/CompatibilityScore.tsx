'use client';

/**
 * Compatibility Score Display
 *
 * Compact single-row layout:
 *   [score badge] [AI Suggest btn] [💡 recommendations text] [▼ expand toggle]
 *
 * The full rationale is hidden by default; clicking ▼ opens a drop-down panel
 * below the header bar so the header height is never affected.
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, Sparkles, Lightbulb, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CompatibilityScoreProps {
  score: number | null;
  rationale: string | null;
  recommendations: string | null;
  isLoading: boolean;
  error: string | null;
  onGenerateUpdates?: () => void;
  isGeneratingUpdates?: boolean;
}

function scoreColor(s: number): string {
  if (s >= 80) return '#10b981';
  if (s >= 60) return '#3b82f6';
  if (s >= 40) return '#f59e0b';
  return '#ef4444';
}

function ScoreIcon({ score }: { score: number }) {
  if (score >= 80) return <CheckCircle2 className="w-3.5 h-3.5" />;
  if (score >= 60) return <TrendingUp className="w-3.5 h-3.5" />;
  return <AlertCircle className="w-3.5 h-3.5" />;
}

export default function CompatibilityScore({
  score,
  rationale,
  recommendations,
  isLoading,
  error,
  onGenerateUpdates,
  isGeneratingUpdates = false,
}: CompatibilityScoreProps) {
  const [expanded, setExpanded] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  // Track pixel position of the trigger so the portal panel aligns correctly
  const [panelPos, setPanelPos] = useState<{ top: number; left: number } | null>(null);

  // Recompute position whenever expanded or window scrolls/resizes
  useEffect(() => {
    if (!expanded || !wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    setPanelPos({ top: rect.bottom + 6, left: rect.left });

    const recompute = () => {
      if (wrapperRef.current) {
        const r = wrapperRef.current.getBoundingClientRect();
        setPanelPos({ top: r.bottom + 6, left: r.left });
      }
    };
    window.addEventListener('scroll', recompute, true);
    window.addEventListener('resize', recompute);
    return () => {
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
    };
  }, [expanded]);

  // Close when clicking outside (both trigger and portal panel)
  useEffect(() => {
    if (!expanded) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = wrapperRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) setExpanded(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [expanded]);

  // Close on fresh analysis
  useEffect(() => { setExpanded(false); }, [score, rationale]);

  if (!isLoading && score === null && !error) return null;

  const color = score !== null ? scoreColor(score) : '#3b82f6';

  return (
    <div ref={wrapperRef} className="relative">
      {/* ── Single-row pill ───────────────────────────────────────── */}
      <div
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl"
        style={{
          background: 'linear-gradient(135deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))',
          border: score !== null ? `1px solid ${color}28` : '1px solid rgba(255,255,255,0.08)',
          boxShadow: score !== null ? `0 0 14px ${color}12` : 'none',
        }}
      >
        {/* Loading */}
        {isLoading && (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#3b82f6] shrink-0" />
            <span className="text-xs text-white/40 whitespace-nowrap">Analyzing…</span>
          </>
        )}

        {/* Error */}
        {!isLoading && error && (
          <>
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span className="text-xs text-red-400 whitespace-nowrap">Analysis unavailable</span>
          </>
        )}

        {/* Score row */}
        {!isLoading && !error && score !== null && (
          <>
            {/* 1 — Score badge */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg shrink-0"
              style={{
                background: `${color}18`,
                border: `1.5px solid ${color}55`,
                color,
                boxShadow: `0 2px 6px ${color}20`,
              }}
            >
              <ScoreIcon score={score} />
              <span className="text-sm font-black leading-none">{score}%</span>
            </div>

            {/* 2 — AI Suggest button (immediately right of score) */}
            {onGenerateUpdates && (
              <Button
                onClick={onGenerateUpdates}
                disabled={isGeneratingUpdates}
                size="sm"
                className="shrink-0 gap-1.5 h-7 px-3 text-xs font-semibold bg-gradient-to-r from-[#3b82f6] to-[#6366f1] hover:opacity-90 text-white shadow-sm transition-all disabled:opacity-50"
              >
                {isGeneratingUpdates ? (
                  <><Loader2 className="w-3 h-3 animate-spin" />Generating…</>
                ) : (
                  <><Sparkles className="w-3 h-3" />AI&nbsp;Suggest</>
                )}
              </Button>
            )}

            {/* 3 — Expand toggle */}
            {(rationale || recommendations) && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-white/40 hover:text-white/80 hover:bg-white/6 transition-all"
                title={expanded ? 'Hide details' : 'Show analysis details'}
              >
                {expanded
                  ? <ChevronUp className="w-3.5 h-3.5" />
                  : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Portal drop-down — renders on document.body, above all stacking contexts ── */}
      {expanded && (rationale || recommendations) && panelPos &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: 'fixed',
              top: panelPos.top,
              left: panelPos.left,
              zIndex: 99999,
              minWidth: 360,
              maxWidth: 520,
              background: 'linear-gradient(145deg,#1a1a28,#12121e)',
              border: `1px solid ${color}30`,
              borderRadius: 14,
              padding: '14px 16px',
              boxShadow: `0 16px 48px rgba(0,0,0,0.85), 0 0 0 1px ${color}15`,
            }}
          >
            {/* Score label */}
            <div className="flex items-center gap-2 mb-2.5">
              <div
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold"
                style={{ background: `${color}20`, border: `1px solid ${color}50`, color }}
              >
                <ScoreIcon score={score!} />
                {score}% Harmony Score
              </div>
            </div>

            {/* Main rationale text */}
            {rationale && (
              <p className="text-[12px] font-semibold text-white leading-relaxed mb-2.5">
                {rationale}
              </p>
            )}

            {/* Sub-text / tip */}
            {recommendations && (
              <div className="flex items-start gap-1.5 pt-2.5 border-t border-white/10">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400/80 mt-0.5 shrink-0" />
                <p className="text-[11px] text-white/70 leading-relaxed">
                  {recommendations}
                </p>
              </div>
            )}
          </div>,
          document.body
        )
      }
    </div>
  );
}
