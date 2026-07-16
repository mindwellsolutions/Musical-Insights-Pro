'use client';

import React, { useEffect, useRef } from 'react';
import { X, Loader2, Trash2 } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { IntervalProgression } from '@/lib/custom-progressions/types';

interface HistoryPopoverProps {
  theme: ThemeConfig;
  isOpen: boolean;
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onLoad: (progression: IntervalProgression) => void;
  onDelete: (id: string) => Promise<void>;
  progressions: IntervalProgression[];
  isLoading: boolean;
}

export function HistoryPopover({ theme, isOpen, anchorRef, onClose, onLoad, onDelete, progressions, isLoading }: HistoryPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = React.useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: Math.max(8, rect.right - 380) });
  }, [isOpen, anchorRef]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    const handleClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
          anchorRef.current && !anchorRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => { document.removeEventListener('keydown', handleKey); document.removeEventListener('mousedown', handleClick); };
  }, [isOpen, onClose, anchorRef]);

  if (!isOpen) return null;

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div ref={popoverRef} style={{
      position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999,
      width: 380, maxHeight: 340, overflowY: 'auto',
      background: theme.bgSecondary, border: `1px solid ${theme.border}`,
      borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      opacity: isOpen ? 1 : 0, transform: isOpen ? 'translateY(0)' : 'translateY(-6px)',
      transition: 'opacity 160ms ease-out, transform 160ms ease-out',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 10px', borderBottom: `1px solid ${theme.border}` }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: theme.textPrimary }}>📂 Saved Progressions</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 2 }}>
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24, color: theme.textSecondary, fontSize: 12 }}>
            <Loader2 size={14} className="animate-spin" /> Loading history...
          </div>
        ) : progressions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: theme.textSecondary, fontSize: 12, lineHeight: 1.6 }}>
            No saved progressions yet.<br />Save your first progression using the builder or AI generator.
          </div>
        ) : (
          progressions.map(prog => (
            <div key={prog.id} style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Degree mini-preview */}
              <div style={{ display: 'flex', gap: 3, flexShrink: 0 }}>
                {prog.steps.slice(0, 5).map((s, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: 4, background: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: 'white' }}>
                    {s.degree.replace('°', '')}
                  </div>
                ))}
                {prog.steps.length > 5 && <div style={{ width: 20, height: 20, borderRadius: 4, background: theme.bgTertiary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: theme.textSecondary }}>+{prog.steps.length - 5}</div>}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: theme.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prog.name}</div>
                <div style={{ fontSize: 10, color: theme.textSecondary }}>{prog.key} {prog.scale} · {prog.steps.length} steps · {formatDate(prog.createdAt)}</div>
              </div>
              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => { onLoad(prog); onClose(); }} style={{ height: 24, borderRadius: 6, fontSize: 11, background: theme.accentPrimary, color: 'white', border: 'none', padding: '0 10px', cursor: 'pointer', fontWeight: 600 }}>Load</button>
                <button onClick={() => onDelete(prog.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: theme.textSecondary, padding: 2, display: 'flex', alignItems: 'center' }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#f87171')} onMouseLeave={e => (e.currentTarget.style.color = theme.textSecondary)}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
