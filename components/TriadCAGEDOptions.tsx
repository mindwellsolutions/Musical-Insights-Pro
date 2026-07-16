'use client';

import { useState, useEffect, useRef } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { TriadInversion, CAGEDShape } from '@/lib/triad-theory';
import { ChevronLeft, ChevronRight, Eye, EyeOff, Info } from 'lucide-react';

interface TriadCAGEDOptionsProps {
  theme: ThemeConfig;
  selectedInversion: TriadInversion;
  onInversionChange: (inversion: TriadInversion) => void;
  selectedCAGEDShapes: CAGEDShape[];
  onCAGEDShapesChange: (shapes: CAGEDShape[]) => void;
  positionCountsByInversion?: Record<TriadInversion, number>;
  positionCountsByShape?: Record<CAGEDShape, number>;
  showCAGEDGuide?: boolean;
  onCAGEDGuideChange?: (enabled: boolean) => void;
}

export default function TriadCAGEDOptions({
  theme,
  selectedInversion,
  onInversionChange,
  selectedCAGEDShapes,
  onCAGEDShapesChange,
  positionCountsByInversion = { root: 0, first: 0, second: 0 },
  positionCountsByShape = { C: 0, A: 0, G: 0, E: 0, D: 0 },
  showCAGEDGuide = false,
  onCAGEDGuideChange,
}: TriadCAGEDOptionsProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const cagedColors: Record<CAGEDShape, string> = {
    C: '#ef4444',
    A: '#f97316',
    G: '#eab308',
    E: '#22c55e',
    D: '#3b82f6',
  };

  const handleShapeToggle = (shape: CAGEDShape) => {
    if (selectedCAGEDShapes.includes(shape)) {
      onCAGEDShapesChange(selectedCAGEDShapes.filter((s) => s !== shape));
    } else {
      onCAGEDShapesChange([...selectedCAGEDShapes, shape]);
    }
  };

  const handlePreviousInversion = () => {
    const inversions: TriadInversion[] = ['root', 'first', 'second'];
    const currentIndex = inversions.indexOf(selectedInversion);
    const prevIndex = (currentIndex - 1 + inversions.length) % inversions.length;
    onInversionChange(inversions[prevIndex]);
  };

  const handleNextInversion = () => {
    const inversions: TriadInversion[] = ['root', 'first', 'second'];
    const currentIndex = inversions.indexOf(selectedInversion);
    const nextIndex = (currentIndex + 1) % inversions.length;
    onInversionChange(inversions[nextIndex]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if the container is focused or a child is focused
      if (!containerRef.current?.contains(document.activeElement)) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePreviousInversion();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextInversion();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedInversion, onInversionChange]);

  return (
    <>
      <div
        ref={containerRef}
        tabIndex={0}
        className="rounded-lg p-4 mb-4 focus:outline-none focus:ring-2 transition-all"
        style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
          outlineColor: theme.accentPrimary,
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" style={{ color: theme.textSecondary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="text-sm font-semibold" style={{ color: theme.textPrimary }}>
              Triad & CAGED Options
            </h3>

            {/* CAGED Guide Toggle */}
            {onCAGEDGuideChange && (
              <div className="ml-2 flex items-center gap-2 px-3 py-1 rounded" style={{
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
              }}>
                <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
                  CAGED Guide
                </span>
                <button
                  onClick={() => onCAGEDGuideChange(!showCAGEDGuide)}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm"
                  style={{
                    background: showCAGEDGuide ? theme.accentPrimary : '#4b5563',
                    border: `2px solid ${showCAGEDGuide ? theme.accentPrimary : '#6b7280'}`,
                  }}
                  title={showCAGEDGuide ? 'Hide CAGED Guide' : 'Show CAGED Guide'}
                >
                  <span
                    className="inline-block h-5 w-5 transform rounded-full transition-transform shadow-md"
                    style={{
                      background: '#ffffff',
                      transform: showCAGEDGuide ? 'translateX(20px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Info Icon */}
          <button
            onClick={() => setShowInfoModal(true)}
            className="p-1.5 rounded transition-all hover:opacity-80"
            style={{
              background: 'transparent',
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
            title="Show triad color legend"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

      <div className="flex items-center gap-4 mt-3">
        {/* Triad Positions Section */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: theme.textSecondary }}>
            Triad Positions:
          </span>
          
          {/* Previous Button */}
          <button
            onClick={handlePreviousInversion}
            className="p-1.5 rounded transition-all hover:opacity-80"
            style={{
              background: theme.buttonPrimary,
              color: '#ffffff',
            }}
            title="Previous position"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Radio Buttons */}
          <div className="flex gap-1.5">
            {(['root', 'first', 'second'] as const).map((inversion) => {
              const isSelected = selectedInversion === inversion;
              return (
                <button
                  key={inversion}
                  onClick={() => onInversionChange(inversion)}
                  className="text-center px-3 py-1.5 rounded text-xs transition-all hover:opacity-80"
                  style={{
                    background: isSelected ? theme.buttonPrimary : theme.bgTertiary,
                    color: isSelected ? '#ffffff' : theme.textPrimary,
                    border: `2px solid ${isSelected ? theme.buttonPrimary : theme.border}`,
                  }}
                >
                  <div className="font-semibold text-xs">
                    {inversion === 'root' ? 'Root' : inversion === 'first' ? '1st' : '2nd'}
                  </div>
                  <div
                    className="text-[10px] mt-0.5"
                    style={{ color: isSelected ? '#ffffff' : theme.textSecondary }}
                  >
                    {positionCountsByInversion[inversion] || 0}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextInversion}
            className="p-1.5 rounded transition-all hover:opacity-80"
            style={{
              background: theme.buttonPrimary,
              color: '#ffffff',
            }}
            title="Next position"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CAGED Shapes Section */}
        <div className="flex items-center gap-2 ml-4">
          <span className="text-xs font-semibold whitespace-nowrap" style={{ color: theme.textSecondary }}>
            CAGED Shapes:
          </span>
          <div className="flex gap-1.5">
            {(['C', 'A', 'G', 'E', 'D'] as const).map((shape) => {
              const isSelected = selectedCAGEDShapes.includes(shape);
              const count = positionCountsByShape[shape] || 0;

              return (
                <button
                  key={shape}
                  onClick={() => handleShapeToggle(shape)}
                  className="relative flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all hover:opacity-80"
                  style={{
                    background: isSelected ? theme.bgTertiary : theme.bgPrimary,
                    border: `2px solid ${isSelected ? cagedColors[shape] : theme.border}`,
                    opacity: isSelected ? 1 : 0.5,
                  }}
                >
                  <span className="font-semibold" style={{ color: theme.textPrimary }}>
                    {shape}
                  </span>
                  {count > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: cagedColors[shape],
                        color: '#ffffff',
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CAGED Guide Active Indicator */}
      {showCAGEDGuide && (
        <div
          className="mt-3 p-3 rounded-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.accentPrimary}20, ${theme.accentPrimary}10)`,
            border: `1px solid ${theme.accentPrimary}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4" style={{ color: theme.accentPrimary }} />
            <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
              CAGED Guide Active
            </span>
          </div>
          <p className="text-xs" style={{ color: theme.textSecondary }}>
            Fretboard zones are highlighted to show CAGED shape positions. Selected shapes above determine which zones are visible.
          </p>
        </div>
      )}
    </div>

      {/* Info Modal */}
      {showInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowInfoModal(false)}
        >
          <div
            className="rounded-lg p-6 max-w-md w-full mx-4"
            style={{
              background: theme.bgSecondary,
              border: `2px solid ${theme.border}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold" style={{ color: theme.textPrimary }}>
                Triad Color Legend
              </h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="p-1 rounded transition-all hover:opacity-80"
                style={{ color: theme.textSecondary }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* Root */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: '#E53935' }}
                >
                  R
                </div>
                <div>
                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                    Root Note
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Red (#E53935)
                  </div>
                </div>
              </div>

              {/* Third */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: '#3b82f6' }}
                >
                  3
                </div>
                <div>
                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                    Third Note
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Blue (#3b82f6)
                  </div>
                </div>
              </div>

              {/* Fifth */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white"
                  style={{ background: '#5DB572' }}
                >
                  5
                </div>
                <div>
                  <div className="font-semibold" style={{ color: theme.textPrimary }}>
                    Fifth Note
                  </div>
                  <div className="text-xs" style={{ color: theme.textSecondary }}>
                    Green (#5DB572)
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${theme.border}` }}>
              <p className="text-xs" style={{ color: theme.textSecondary }}>
                These colors help you identify the role of each note within the triad chord structure.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

