'use client';

import { ThemeConfig } from '@/lib/themes';
import { CAGEDShape } from '@/lib/triad-theory';

interface OverlappingChordsTabProps {
  theme: ThemeConfig;
  displayMode: 'caged' | 'scale';
  onDisplayModeChange: (mode: 'caged' | 'scale') => void;
  overlapCriteria: 'all' | 'two-or-more';
  onOverlapCriteriaChange: (criteria: 'all' | 'two-or-more') => void;
  // CAGED Mode props
  selectedCAGEDShapes: CAGEDShape[];
  onCAGEDShapesChange: (shapes: CAGEDShape[]) => void;
  // Scale Mode props
  currentKey: string;
  currentScale: string;
  selectedScalePositions: number[];
  onScalePositionsChange: (positions: number[]) => void;
}

export default function OverlappingChordsTab({
  theme,
  displayMode,
  onDisplayModeChange,
  overlapCriteria,
  onOverlapCriteriaChange,
  selectedCAGEDShapes,
  onCAGEDShapesChange,
  currentKey,
  currentScale,
  selectedScalePositions,
  onScalePositionsChange,
}: OverlappingChordsTabProps) {
  const cagedShapes: CAGEDShape[] = ['C', 'A', 'G', 'E', 'D'];
  const scalePositions = [
    { position: 1, fret: 0, name: 'Position I' },
    { position: 2, fret: 2, name: 'Position II' },
    { position: 3, fret: 4, name: 'Position III' },
    { position: 4, fret: 7, name: 'Position IV' },
    { position: 5, fret: 9, name: 'Position V' },
  ];

  const handleCAGEDShapeToggle = (shape: CAGEDShape) => {
    if (selectedCAGEDShapes.includes(shape)) {
      onCAGEDShapesChange(selectedCAGEDShapes.filter(s => s !== shape));
    } else {
      onCAGEDShapesChange([...selectedCAGEDShapes, shape]);
    }
  };

  const handleScalePositionToggle = (position: number) => {
    if (selectedScalePositions.includes(position)) {
      onScalePositionsChange(selectedScalePositions.filter(p => p !== position));
    } else {
      onScalePositionsChange([...selectedScalePositions, position]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Display Mode Selector */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: theme.textPrimary }}>
          Display Mode
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => onDisplayModeChange('caged')}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: displayMode === 'caged' ? theme.accentPrimary : theme.bgTertiary,
              color: displayMode === 'caged' ? '#ffffff' : theme.textSecondary,
              border: `1px solid ${displayMode === 'caged' ? theme.accentPrimary : theme.border}`,
            }}
          >
            CAGED Areas
          </button>
          <button
            onClick={() => onDisplayModeChange('scale')}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: displayMode === 'scale' ? theme.accentPrimary : theme.bgTertiary,
              color: displayMode === 'scale' ? '#ffffff' : theme.textSecondary,
              border: `1px solid ${displayMode === 'scale' ? theme.accentPrimary : theme.border}`,
            }}
          >
            Scale/Mode Positions
          </button>
        </div>
      </div>

      {/* Overlap Criteria Selector */}
      <div>
        <label className="block text-xs font-semibold mb-2" style={{ color: theme.textPrimary }}>
          Overlap Criteria
        </label>
        <div className="flex gap-3">
          <button
            onClick={() => onOverlapCriteriaChange('all')}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: overlapCriteria === 'all' ? theme.accentPrimary : theme.bgTertiary,
              color: overlapCriteria === 'all' ? '#ffffff' : theme.textSecondary,
              border: `1px solid ${overlapCriteria === 'all' ? theme.accentPrimary : theme.border}`,
            }}
          >
            ALL notes
          </button>
          <button
            onClick={() => onOverlapCriteriaChange('two-or-more')}
            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: overlapCriteria === 'two-or-more' ? theme.accentPrimary : theme.bgTertiary,
              color: overlapCriteria === 'two-or-more' ? '#ffffff' : theme.textSecondary,
              border: `1px solid ${overlapCriteria === 'two-or-more' ? theme.accentPrimary : theme.border}`,
            }}
          >
            TWO OR MORE notes
          </button>
        </div>
      </div>

      {/* CAGED Mode Controls */}
      {displayMode === 'caged' && (
        <div>
          <label className="block text-xs font-semibold mb-2" style={{ color: theme.textPrimary }}>
            Select CAGED Shapes
          </label>
          <div className="flex flex-wrap gap-2">
            {cagedShapes.map((shape) => (
              <button
                key={shape}
                onClick={() => handleCAGEDShapeToggle(shape)}
                className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: selectedCAGEDShapes.includes(shape) ? theme.accentPrimary : theme.bgTertiary,
                  color: selectedCAGEDShapes.includes(shape) ? '#ffffff' : theme.textSecondary,
                  border: `1px solid ${selectedCAGEDShapes.includes(shape) ? theme.accentPrimary : theme.border}`,
                }}
              >
                {shape} Shape
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Scale/Mode Controls */}
      {displayMode === 'scale' && (
        <div className="space-y-3">
          <div
            className="px-3 py-2 rounded text-sm"
            style={{
              background: theme.bgTertiary,
              color: theme.textSecondary,
              border: `1px solid ${theme.border}`,
            }}
          >
            Current: <span style={{ color: theme.textPrimary, fontWeight: 600 }}>{currentKey} {currentScale}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2" style={{ color: theme.textPrimary }}>
              Select Scale Positions
            </label>
            <div className="space-y-2">
              {scalePositions.map(({ position, fret, name }) => (
                <button
                  key={position}
                  onClick={() => handleScalePositionToggle(position)}
                  className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between"
                  style={{
                    background: selectedScalePositions.includes(position) ? theme.accentPrimary : theme.bgTertiary,
                    color: selectedScalePositions.includes(position) ? '#ffffff' : theme.textSecondary,
                    border: `1px solid ${selectedScalePositions.includes(position) ? theme.accentPrimary : theme.border}`,
                  }}
                >
                  <span>{name}</span>
                  <span className="text-xs opacity-75">(Fret {fret})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

