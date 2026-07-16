'use client';

import { useState } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { ChevronUp } from 'lucide-react';
import { NOTE_COLORS, getScaleNotes, getHarmonyNoteForOriginal } from '@/lib/musicTheory';
import { useNoteDisplay } from '@/hooks/useNoteDisplay';

interface HarmonizationTabsProps {
  theme: ThemeConfig;
  currentKey: string;
  currentScale: string;
  selectedHarmonization: 'original' | '3rds' | '5ths' | '6ths' | '7ths';
  onHarmonizationChange: (harmonization: 'original' | '3rds' | '5ths' | '6ths' | '7ths') => void;
  /** When true, renders without the outer card wrapper and title — for use inside a parent tabbed UI */
  isEmbedded?: boolean;
}

export default function HarmonizationTabs({
  theme,
  currentKey,
  currentScale,
  selectedHarmonization,
  onHarmonizationChange,
  isEmbedded = false,
}: HarmonizationTabsProps) {
  const { getNoteDisplayName } = useNoteDisplay();
  const [isDetailsCollapsed, setIsDetailsCollapsed] = useState(false);
  const tabs = [
    { id: 'original' as const, label: `${getNoteDisplayName(currentKey)} ${currentScale}`, description: 'Original scale notes only' },
    { id: '3rds' as const, label: '3rds', description: 'Shows original + harmony notes (thirds above)' },
    { id: '5ths' as const, label: '5ths', description: 'Shows original + harmony notes (fifths above)' },
    { id: '6ths' as const, label: '6ths', description: 'Shows original + harmony notes (sixths above)' },
    { id: '7ths' as const, label: '7ths', description: 'Shows original + harmony notes (sevenths above)' },
  ];

  const content = (
    <>
      {/* Selection buttons row + collapse toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex flex-wrap gap-2 flex-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onHarmonizationChange(tab.id)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90"
              style={{
                background: selectedHarmonization === tab.id
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : theme.bgTertiary,
                color: selectedHarmonization === tab.id ? '#ffffff' : theme.textSecondary,
                border: `1px solid ${selectedHarmonization === tab.id ? '#2563eb' : theme.border}`,
              }}
              title={tab.description}
            >
              {tab.id === 'original' ? (
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>{tab.label}</span>
                </div>
              ) : (
                tab.label
              )}
            </button>
          ))}
        </div>
        {selectedHarmonization !== 'original' && (
          <button
            onClick={() => setIsDetailsCollapsed(!isDetailsCollapsed)}
            className="p-1 rounded transition-all hover:scale-110 flex-shrink-0"
            style={{ color: theme.textSecondary, background: 'transparent' }}
            title={isDetailsCollapsed ? 'Expand details' : 'Collapse details'}
          >
            <ChevronUp
              className="w-4 h-4 transition-transform"
              style={{ transform: isDetailsCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
            />
          </button>
        )}
      </div>

      {/* Note pairs legend */}
      {selectedHarmonization !== 'original' && !isDetailsCollapsed && (
        <div className="mt-3 flex flex-wrap gap-3">
          {(() => {
            const scaleNotes = getScaleNotes(currentKey, currentScale);
            const notePairs = scaleNotes.map((originalNote) => {
              const harmonyNote = getHarmonyNoteForOriginal(originalNote, currentKey, currentScale, selectedHarmonization);
              return {
                original: originalNote,
                harmony: harmonyNote,
                originalColor: NOTE_COLORS[originalNote] || '#ef4444',
                harmonyColor: NOTE_COLORS[harmonyNote] || '#3b82f6',
              };
            });
            return notePairs.map((pair, index) => (
              <div key={index} className="inline-flex items-center gap-2 px-2 py-1.5 rounded" style={{ background: theme.bgTertiary }}>
                <div className="flex items-center justify-center font-semibold text-xs" style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: pair.originalColor, color: '#ffffff', border: '2px solid #ffffff', boxShadow: `0 0 0 2px rgba(255,255,255,0.15)`, flexShrink: 0 }}>
                  {getNoteDisplayName(pair.original)}
                </div>
                <svg className="w-3 h-3 flex-shrink-0" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <div className="flex items-center justify-center font-semibold text-xs" style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: pair.harmonyColor, color: '#ffffff', border: `3px solid ${pair.originalColor}`, boxShadow: `0 0 0 6px ${pair.originalColor}80, 0 0 12px ${pair.originalColor}66, 0 0 20px ${pair.originalColor}4D`, flexShrink: 0 }}>
                  {getNoteDisplayName(pair.harmony)}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </>
  );

  // Embedded: no outer card, used inside a tabbed UI
  if (isEmbedded) {
    return <div>{content}</div>;
  }

  // Standalone: render with own card wrapper + title
  return (
    <div className="rounded-lg p-4 flex-shrink-0" style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>Harmonization Options</h3>
      </div>
      {content}
    </div>
  );
}

