'use client';

import { useState, useRef, useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { CAGEDShape } from '@/lib/triad-theory';
import { Info } from 'lucide-react';

interface CAGEDShapesCardProps {
  theme: ThemeConfig;
  selectedCAGEDShapes: CAGEDShape[];
  onCAGEDShapesChange: (shapes: CAGEDShape[]) => void;
  positionCountsByShape?: Record<CAGEDShape, number>;
  showCAGEDGuide?: boolean;
  onCAGEDGuideChange?: (enabled: boolean) => void;
  cagedBrightness?: number;
  onCAGEDBrightnessChange?: (brightness: number) => void;
  showPentatonicMode?: boolean;
  onPentatonicModeChange?: (enabled: boolean) => void;
}

export default function CAGEDShapesCard({
  theme,
  selectedCAGEDShapes,
  onCAGEDShapesChange,
  positionCountsByShape = { C: 0, A: 0, G: 0, E: 0, D: 0 },
  showCAGEDGuide = false,
  onCAGEDGuideChange,
  cagedBrightness = 100,
  onCAGEDBrightnessChange,
  showPentatonicMode = false,
  onPentatonicModeChange,
}: CAGEDShapesCardProps) {
  const [showBrightnessPopup, setShowBrightnessPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const cagedColors: Record<CAGEDShape, string> = {
    C: '#ef4444',  // Red
    A: '#f97316',  // Orange
    G: '#eab308',  // Yellow
    E: '#22c55e',  // Green
    D: '#3b82f6',  // Blue
  };

  const handleShapeToggle = (shape: CAGEDShape) => {
    if (selectedCAGEDShapes.includes(shape)) {
      onCAGEDShapesChange(selectedCAGEDShapes.filter((s) => s !== shape));
    } else {
      onCAGEDShapesChange([...selectedCAGEDShapes, shape]);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setShowBrightnessPopup(false);
      }
    };

    if (showBrightnessPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showBrightnessPopup]);

  return (
    <div
      className="rounded-lg p-3 space-y-3"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* CAGED Guide Toggle Switch */}
      {onCAGEDGuideChange && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
            CAGED GUIDE
          </span>
          <div className="flex items-center gap-2">
            {/* Brightness Icon with Popup */}
            <div className="relative">
              <button
                onClick={() => setShowBrightnessPopup(!showBrightnessPopup)}
                className="p-1 rounded transition-all hover:opacity-80"
                style={{
                  background: 'transparent',
                  color: theme.textSecondary,
                  border: `1px solid ${theme.border}`,
                }}
                title="Adjust CAGED brightness"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>

              {/* Brightness Popup */}
              {showBrightnessPopup && onCAGEDBrightnessChange && (
                <div
                  ref={popupRef}
                  className="absolute right-0 top-8 z-50 rounded-lg p-3 shadow-lg"
                  style={{
                    background: theme.bgSecondary,
                    border: `1px solid ${theme.border}`,
                    minWidth: '200px',
                  }}
                >
                  <div className="text-xs font-semibold mb-2" style={{ color: theme.textPrimary }}>
                    CAGED Brightness
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    value={cagedBrightness}
                    onChange={(e) => onCAGEDBrightnessChange(Number(e.target.value))}
                    className="w-full"
                    style={{ accentColor: theme.accentPrimary }}
                  />
                  <div className="text-xs text-center mt-1" style={{ color: theme.textSecondary }}>
                    {cagedBrightness}%
                  </div>
                </div>
              )}
            </div>

            {/* Toggle Switch */}
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
                className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md"
                style={{
                  transform: showCAGEDGuide ? 'translateX(20px)' : 'translateX(2px)',
                }}
              />
            </button>
          </div>
        </div>
      )}

      {/* CAGED Scales Toggle Switch */}
      {onPentatonicModeChange && (
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: theme.textPrimary }}>
            CAGED Scales
          </span>
          <button
            onClick={() => onPentatonicModeChange(!showPentatonicMode)}
            className="relative inline-flex h-6 w-11 items-center rounded-full transition-all shadow-sm"
            style={{
              background: showPentatonicMode ? theme.accentPrimary : '#4b5563',
              border: `2px solid ${showPentatonicMode ? theme.accentPrimary : '#6b7280'}`,
            }}
            title={showPentatonicMode ? 'Hide Pentatonic Scales' : 'Show Pentatonic Scales'}
          >
            <span
              className="inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md"
              style={{
                transform: showPentatonicMode ? 'translateX(20px)' : 'translateX(2px)',
              }}
            />
          </button>
        </div>
      )}

      {/* CAGED Shapes */}
      <div>
        <span className="text-xs font-semibold block mb-2" style={{ color: theme.textPrimary }}>
          CAGED Shapes
        </span>
        <div className="flex gap-1.5 flex-wrap">
          {(['C', 'A', 'G', 'E', 'D'] as const).map((shape) => {
            const isSelected = selectedCAGEDShapes.includes(shape);
            const count = positionCountsByShape[shape] || 0;

            return (
              <button
                key={shape}
                onClick={() => handleShapeToggle(shape)}
                className="relative flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all hover:opacity-80"
                style={{
                  background: isSelected ? theme.bgSecondary : theme.bgPrimary,
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
  );
}

