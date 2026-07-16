'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Check, X } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';

interface SliderResetButtonProps {
  onReset: () => void;
  theme: ThemeConfig;
  /** Tooltip label shown on the reset icon button */
  label?: string;
}

/**
 * A small RotateCcw icon button that shows an inline confirmation
 * (Yes / No pill) before resetting a slider to its default value.
 *
 * Usage:
 *   <SliderResetButton onReset={() => setGlowOpacity(40)} theme={theme} label="Reset glow opacity" />
 */
export function SliderResetButton({ onReset, theme, label = 'Reset to default' }: SliderResetButtonProps) {
  const [confirming, setConfirming] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-cancel confirmation after 3 seconds of no interaction
  useEffect(() => {
    if (confirming) {
      timerRef.current = setTimeout(() => setConfirming(false), 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [confirming]);

  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(true);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
    onReset();
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirming(false);
  };

  if (confirming) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 3,
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
          borderRadius: 10,
          padding: '1px 5px',
          fontSize: 10,
          color: theme.textSecondary,
          whiteSpace: 'nowrap',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 10 }}>Reset?</span>
        <button
          onClick={handleConfirm}
          title="Confirm reset"
          style={{
            background: '#22c55e',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '1px 3px',
          }}
        >
          <Check style={{ width: 9, height: 9 }} />
        </button>
        <button
          onClick={handleCancel}
          title="Cancel"
          style={{
            background: '#ef4444',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            padding: '1px 3px',
          }}
        >
          <X style={{ width: 9, height: 9 }} />
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={handleIconClick}
      title={label}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 2,
        display: 'flex',
        alignItems: 'center',
        color: theme.textSecondary,
        opacity: 0.5,
        flexShrink: 0,
        borderRadius: 4,
        transition: 'opacity 150ms',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
    >
      <RotateCcw style={{ width: 12, height: 12 }} />
    </button>
  );
}
