'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ThemeConfig } from '@/lib/themes';
import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { IntervalStep, IntervalProgression } from '@/lib/custom-progressions/types';
import { IntervalSequenceBuilder } from './IntervalSequenceBuilder';
import { AIIntervalProgressionGenerator } from './AIIntervalProgressionGenerator';
import { createClient } from '@/lib/supabase/client-ssr';

type CPTab = 'builder' | 'ai';

interface CustomProgressionsTabProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  diatonicDegrees: DiatonicTriad[];
  /** Lifted from page.tsx so fretboard can react in real-time */
  sequence: IntervalStep[];
  onSequenceChange: (steps: IntervalStep[]) => void;
}

/** Always retrieves a fresh access token — handles session refresh automatically */
async function getFreshToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function fetchProgressions(userId: string) {
  const token = await getFreshToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch('/api/custom-progressions/list', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to load progressions');
  const data = await res.json();
  return (data.progressions ?? []) as IntervalProgression[];
}

export function CustomProgressionsTab({ theme, currentKey, currentScale, diatonicDegrees, sequence, onSequenceChange }: CustomProgressionsTabProps) {
  const [activeTab, setActiveTab] = useState<CPTab>('builder');
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  // Use userId (stable) as query key — not the token (rotates on refresh)
  const [userId, setUserId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  const { data: savedProgressions = [], isLoading: historyLoading } = useQuery({
    queryKey: ['custom-progressions', userId],
    queryFn: () => fetchProgressions(userId!),
    enabled: !!userId,
    staleTime: 30_000,
    refetchOnMount: true,
  });

  // Reset saved state when sequence changes
  useEffect(() => { setIsSaved(false); }, [sequence]);

  const handleSave = useCallback(async (name: string) => {
    if (!userId) return;
    setIsSaving(true);
    try {
      const token = await getFreshToken();
      if (!token) throw new Error('Not authenticated');
      const res = await fetch('/api/custom-progressions/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, steps: sequence, key: currentKey, scale: currentScale, source: 'manual' }),
      });
      if (!res.ok) throw new Error('Save failed');
      setIsSaved(true);
      // Invalidate by the stable userId key — guaranteed to match
      await queryClient.invalidateQueries({ queryKey: ['custom-progressions', userId] });
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [userId, sequence, currentKey, currentScale, queryClient]);

  const handleDelete = useCallback(async (id: string) => {
    if (!userId) return;
    try {
      const token = await getFreshToken();
      if (!token) return;
      await fetch(`/api/custom-progressions/delete/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      await queryClient.invalidateQueries({ queryKey: ['custom-progressions', userId] });
    } catch (err) {
      console.error('Delete error:', err);
    }
  }, [userId, queryClient]);

  const handleLoadProgression = useCallback((prog: IntervalProgression) => {
    onSequenceChange(prog.steps);
    setActiveTab('builder');
    setIsSaved(true);
  }, [onSequenceChange]);

  const handleLoadToBuilder = useCallback((steps: IntervalStep[]) => {
    onSequenceChange(steps);
    setActiveTab('builder');
  }, [onSequenceChange]);

  const pillStyle = (active: boolean): React.CSSProperties => ({
    height: 28, borderRadius: 20, fontSize: 12, fontWeight: 600, padding: '0 14px',
    border: active ? 'none' : `1px solid ${theme.border}`,
    background: active ? `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentSecondary || theme.accentPrimary})` : theme.bgTertiary,
    color: active ? 'white' : theme.textSecondary,
    cursor: 'pointer', transition: 'all 160ms',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Sub-tab pill switcher */}
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={pillStyle(activeTab === 'builder')} onClick={() => setActiveTab('builder')}>
          🎼 Manual Builder
        </button>
        <button style={pillStyle(activeTab === 'ai')} onClick={() => setActiveTab('ai')}>
          ✨ AI Generator
        </button>
      </div>

      {/* Tab bodies */}
      {activeTab === 'builder' && (
        <IntervalSequenceBuilder
          theme={theme}
          diatonicDegrees={diatonicDegrees}
          sequence={sequence}
          isSaved={isSaved}
          onSequenceChange={onSequenceChange}
          onSave={handleSave}
          isSaving={isSaving}
          onHistoryOpen={() => {}}
          currentKey={currentKey}
          currentScale={currentScale}
          savedProgressions={savedProgressions}
          historyLoading={historyLoading}
          onLoadProgression={handleLoadProgression}
          onDeleteProgression={handleDelete}
        />
      )}

      {activeTab === 'ai' && (
        <AIIntervalProgressionGenerator
          theme={theme}
          currentKey={currentKey}
          currentScale={currentScale}
          diatonicDegrees={diatonicDegrees}
          onLoadToBuilder={handleLoadToBuilder}
        />
      )}
    </div>
  );
}
