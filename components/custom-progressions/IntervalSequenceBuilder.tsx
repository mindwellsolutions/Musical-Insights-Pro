'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Plus, Save, Trash2, FolderOpen } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { DiatonicTriad } from '@/lib/music-theory/triad-membership/types';
import { IntervalStep, IntervalProgression } from '@/lib/custom-progressions/types';
import { DegreePaletteChip } from './DegreePaletteChip';
import { IntervalStepCard } from './IntervalStepCard';
import { HistoryPopover } from './HistoryPopover';
import { useIntervalSequenceDrag } from '@/hooks/custom-progressions/useIntervalSequenceDrag';
import { v4 as uuidv4 } from 'uuid';

interface IntervalSequenceBuilderProps {
  theme: ThemeConfig;
  diatonicDegrees: DiatonicTriad[];
  sequence: IntervalStep[];
  isSaved: boolean;
  onSequenceChange: (steps: IntervalStep[]) => void;
  onSave: (name: string) => Promise<void>;
  isSaving: boolean;
  onHistoryOpen: () => void;
  currentKey: string;
  currentScale: string;
  savedProgressions: IntervalProgression[];
  historyLoading: boolean;
  onLoadProgression: (p: IntervalProgression) => void;
  onDeleteProgression: (id: string) => Promise<void>;
}

export function IntervalSequenceBuilder({
  theme, diatonicDegrees, sequence, isSaved, onSequenceChange,
  onSave, isSaving, currentKey, currentScale,
  savedProgressions, historyLoading, onLoadProgression, onDeleteProgression,
}: IntervalSequenceBuilderProps) {
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyBtnRef = useRef<HTMLButtonElement>(null);
  const cardRefs = useRef<React.RefObject<HTMLDivElement | null>[]>([]);

  // Sync cardRefs array length to sequence length
  while (cardRefs.current.length < sequence.length) cardRefs.current.push(React.createRef<HTMLDivElement | null>());
  while (cardRefs.current.length > sequence.length) cardRefs.current.pop();

  const { dragState, onDragStart, getCardStyle, insertionGhostIndex } = useIntervalSequenceDrag(
    sequence, cardRefs.current, onSequenceChange
  );

  const addStep = useCallback((deg: DiatonicTriad) => {
    const step: IntervalStep = { id: uuidv4(), degree: deg.degree, degreeIndex: deg.degreeIndex, rootNote: deg.rootNote, quality: deg.quality, color: deg.color };
    onSequenceChange([...sequence, step]);
  }, [sequence, onSequenceChange]);

  const removeStep = useCallback((idx: number) => {
    onSequenceChange(sequence.filter((_, i) => i !== idx));
  }, [sequence, onSequenceChange]);

  const editStep = useCallback((idx: number, updated: IntervalStep) => {
    onSequenceChange(sequence.map((s, i) => i === idx ? updated : s));
  }, [sequence, onSequenceChange]);

  const handleSaveConfirm = async () => {
    if (!saveName.trim()) return;
    await onSave(saveName.trim());
    setSaveName('');
    setSaveDialogOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Key Context */}
      <div style={{ fontSize: 12, color: theme.textSecondary }}>
        Key: <span style={{ color: theme.accentPrimary, fontWeight: 600 }}>{currentKey} {currentScale}</span>
      </div>

      {/* Palette */}
      <div>
        {sequence.length === 0 && (
          <div style={{ fontSize: 11, color: theme.textSecondary, opacity: 0.7, marginBottom: 6 }}>
            Click a scale degree below to start building your progression
          </div>
        )}
        <div style={{ fontSize: 10, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 6 }}>Scale Degree Palette</div>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {diatonicDegrees.map(deg => (
            <DegreePaletteChip key={deg.degreeIndex} theme={theme} degree={deg} onClick={addStep} />
          ))}
        </div>
      </div>

      {/* Sequence Lane — only rendered once at least one degree is selected */}
      {sequence.length > 0 && (
      <div style={{ overflowX: 'auto', padding: '12px 0', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
            {sequence.map((step, idx) => (
              <React.Fragment key={step.id}>
                {/* Insertion ghost */}
                {dragState.isDragging && insertionGhostIndex === idx && (
                  <div style={{ width: 2, height: 78, borderRadius: 2, background: step.color, opacity: 0.85, boxShadow: `0 0 8px 2px ${step.color}66`, marginRight: 4, flexShrink: 0 }} />
                )}
                <IntervalStepCard
                  theme={theme} step={step} index={idx}
                  diatonicDegrees={diatonicDegrees}
                  isDragging={dragState.isDragging && dragState.dragIndex === idx}
                  style={getCardStyle(idx)}
                  cardRef={cardRefs.current[idx]}
                  onDragStart={onDragStart} onRemove={removeStep} onEdit={editStep}
                />
                {idx < sequence.length - 1 && (
                  <span style={{ fontSize: 16, color: theme.textSecondary, opacity: 0.6, margin: '0 6px', flexShrink: 0 }}>→</span>
                )}
              </React.Fragment>
            ))}
            {/* Trailing ghost */}
            {dragState.isDragging && insertionGhostIndex === sequence.length && (
              <div style={{ width: 2, height: 78, borderRadius: 2, background: sequence[dragState.dragIndex!]?.color ?? '#fff', opacity: 0.85, marginLeft: 4, flexShrink: 0 }} />
            )}
            {/* Add button */}
            <div style={{ marginLeft: sequence.length ? 8 : 0 }}>
              <button onClick={() => diatonicDegrees[0] && addStep(diatonicDegrees[0])} title="Add first degree"
                style={{ width: 56, height: 78, borderRadius: 10, border: `1.5px dashed ${theme.border}`, background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={20} color={theme.textSecondary} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Bar + Save Dialog — only show when there are steps */}
      {sequence.length > 0 && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={() => setSaveDialogOpen(v => !v)} disabled={sequence.length < 2 || isSaving}
              style={{ height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '0 12px', border: 'none', cursor: sequence.length < 2 ? 'not-allowed' : 'pointer', opacity: sequence.length < 2 ? 0.5 : 1, background: `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentSecondary || theme.accentPrimary})`, color: 'white', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Save size={12} /> {isSaving ? 'Saving...' : 'Save Progression'}
            </button>
            <button onClick={() => onSequenceChange([])}
              style={{ height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '0 12px', border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.textSecondary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Trash2 size={12} /> Clear All
            </button>
            <button ref={historyBtnRef} onClick={() => setHistoryOpen(v => !v)}
              style={{ height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '0 12px', border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.textPrimary, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FolderOpen size={12} /> Load Saved ▾
            </button>
          </div>

          {/* Save Name Dialog */}
          {saveDialogOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderTop: `1px solid ${theme.border}`, animation: 'slideDown 200ms ease-out' }}>
              <input value={saveName} onChange={e => setSaveName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSaveConfirm()}
                placeholder="Name this progression..." autoFocus
                style={{ width: 220, height: 32, borderRadius: 8, border: `1px solid ${theme.border}`, background: theme.bgTertiary, color: theme.textPrimary, fontSize: 12, padding: '0 10px', outline: 'none' }} />
              <button onClick={handleSaveConfirm} disabled={!saveName.trim() || isSaving}
                style={{ height: 32, borderRadius: 8, fontSize: 12, fontWeight: 600, padding: '0 12px', border: 'none', cursor: 'pointer', background: `linear-gradient(135deg, ${theme.accentPrimary}, ${theme.accentSecondary || theme.accentPrimary})`, color: 'white', opacity: !saveName.trim() ? 0.5 : 1 }}>
                Save ✓
              </button>
              <button onClick={() => setSaveDialogOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, fontSize: 12 }}>Cancel</button>
            </div>
          )}

          <HistoryPopover theme={theme} isOpen={historyOpen} anchorRef={historyBtnRef} onClose={() => setHistoryOpen(false)}
            onLoad={onLoadProgression} onDelete={onDeleteProgression} progressions={savedProgressions} isLoading={historyLoading} />
        </>
      )}
    </div>
  );
}
