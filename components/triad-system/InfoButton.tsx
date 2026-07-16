'use client';

/**
 * Info Button Component
 * Shows help information in a modal when clicked
 */

import React, { useState } from 'react';
import type { ThemeConfig } from '@/lib/themes';

interface InfoButtonProps {
  theme: ThemeConfig;
}

export function InfoButton({ theme }: InfoButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Info Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="w-6 h-6 rounded-full flex items-center justify-center transition-all hover:opacity-80"
        style={{
          background: theme.accentPrimary,
          color: theme.bgPrimary,
          border: `1px solid ${theme.accentPrimary}`
        }}
        title="How to Use"
      >
        <span className="text-sm font-bold">i</span>
      </button>

      {/* Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            style={{
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3
                className="text-lg font-bold"
                style={{ color: theme.textPrimary }}
              >
                How to Use
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded flex items-center justify-center transition-all hover:opacity-80"
                style={{
                  background: theme.bgTertiary,
                  color: theme.textPrimary
                }}
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div
              className="space-y-3 text-sm"
              style={{ color: theme.textSecondary }}
            >
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Select a key and chord quality to see all triad positions</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Triads are shown within their relative minor pentatonic scale boxes</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Use string set and inversion filters to focus on specific voicings</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Navigate zones to explore different areas of the fretboard</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Enable view toggles to see pentatonic overlay, embellishments, and voice leading</span>
              </div>
              <div className="flex gap-2">
                <span className="flex-shrink-0">•</span>
                <span>Two-note mode removes the middle or bass note for "breathing" technique</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 rounded transition-all hover:opacity-80"
                style={{
                  background: theme.accentPrimary,
                  color: theme.bgPrimary
                }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

