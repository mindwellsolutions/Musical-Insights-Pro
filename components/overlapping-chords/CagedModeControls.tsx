/**
 * CAGED Mode Controls Component
 * Controls for CAGED mode (shape selection, positions, overlap type)
 */

'use client';

import { ThemeConfig } from '@/lib/themes';
import { CAGEDShape, OverlapType } from '@/lib/music-theory/overlapping-chords/types';
import OverlapTypeSelector from './OverlapTypeSelector';

interface CagedModeControlsProps {
  theme: ThemeConfig;
  selectedShapes: CAGEDShape[];
  positions: Record<CAGEDShape, number>;
  overlapType: OverlapType;
  onToggleShape: (shape: CAGEDShape) => void;
  onSetPosition: (shape: CAGEDShape, position: number) => void;
  onSetOverlapType: (type: OverlapType) => void;
}

const CAGED_SHAPES: CAGEDShape[] = ['C', 'A', 'G', 'E', 'D'];

export default function CagedModeControls({
  theme,
  selectedShapes,
  positions,
  overlapType,
  onToggleShape,
  onSetPosition,
  onSetOverlapType,
}: CagedModeControlsProps) {
  return (
    <div className="space-y-4">
      {/* Shape Selection */}
      <div>
        <label
          className="block text-sm font-medium mb-2"
          style={{ color: theme.textSecondary }}
        >
          CAGED Shapes
        </label>
        <div className="flex flex-wrap gap-3">
          {CAGED_SHAPES.map((shape) => (
            <div key={shape} className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`shape-${shape}`}
                checked={selectedShapes.includes(shape)}
                onChange={() => onToggleShape(shape)}
                className="w-4 h-4 cursor-pointer rounded"
                style={{ accentColor: theme.accentPrimary }}
              />
              <label
                htmlFor={`shape-${shape}`}
                className="text-sm font-medium cursor-pointer"
                style={{ color: theme.textPrimary }}
              >
                {shape}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Position Inputs for Selected Shapes */}
      {selectedShapes.length > 0 && (
        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: theme.textSecondary }}
          >
            Fret Positions
          </label>
          <div className="grid grid-cols-2 gap-3">
            {selectedShapes.map((shape) => (
              <div key={shape} className="flex items-center gap-2">
                <span
                  className="text-sm font-medium w-8"
                  style={{ color: theme.textPrimary }}
                >
                  {shape}:
                </span>
                <input
                  type="number"
                  min="0"
                  max="12"
                  value={positions[shape]}
                  onChange={(e) => onSetPosition(shape, parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 rounded text-sm"
                  style={{
                    background: theme.bgTertiary,
                    color: theme.textPrimary,
                    border: `1px solid ${theme.border}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Overlap Type */}
      <OverlapTypeSelector
        theme={theme}
        overlapType={overlapType}
        onSetOverlapType={onSetOverlapType}
      />
    </div>
  );
}

