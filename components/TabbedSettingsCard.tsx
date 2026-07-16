'use client';

import { useState } from 'react';
import { Triangle, Layers } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { TriadInversion, CAGEDShape } from '@/lib/triad-theory';
import TriadPositionsCard from './TriadPositionsCard';
import CAGEDShapesCard from './CAGEDShapesCard';
import OverlappingChordsTab from './overlapping-chords/OverlappingChordsTab';

interface TabbedSettingsCardProps {
  theme: ThemeConfig;
  // Triad Settings props
  selectedTriadInversion: TriadInversion;
  onTriadInversionChange: (inversion: TriadInversion) => void;
  positionCountsByInversion?: Record<TriadInversion, number>;
  selectedCAGEDShapes: CAGEDShape[];
  onCAGEDShapesChange: (shapes: CAGEDShape[]) => void;
  positionCountsByShape?: Record<CAGEDShape, number>;
  showCAGEDGuide?: boolean;
  onCAGEDGuideChange?: (enabled: boolean) => void;
  cagedBrightness?: number;
  onCAGEDBrightnessChange?: (brightness: number) => void;
  showPentatonicMode?: boolean;
  onPentatonicModeChange?: (enabled: boolean) => void;
  // Overlapping Chords props
  overlappingChordsEnabled?: boolean;
  overlappingDisplayMode?: 'caged' | 'scale';
  onOverlappingDisplayModeChange?: (mode: 'caged' | 'scale') => void;
  overlappingCriteria?: 'all' | 'two-or-more';
  onOverlappingCriteriaChange?: (criteria: 'all' | 'two-or-more') => void;
  overlappingCAGEDShapes?: CAGEDShape[];
  onOverlappingCAGEDShapesChange?: (shapes: CAGEDShape[]) => void;
  currentKey?: string;
  currentScale?: string;
  overlappingScalePositions?: number[];
  onOverlappingScalePositionsChange?: (positions: number[]) => void;
}

type TabType = 'triad-settings' | 'overlapping-chords';

export default function TabbedSettingsCard({
  theme,
  selectedTriadInversion,
  onTriadInversionChange,
  positionCountsByInversion,
  selectedCAGEDShapes,
  onCAGEDShapesChange,
  positionCountsByShape,
  showCAGEDGuide,
  onCAGEDGuideChange,
  cagedBrightness,
  onCAGEDBrightnessChange,
  showPentatonicMode,
  onPentatonicModeChange,
  overlappingChordsEnabled = false,
  overlappingDisplayMode = 'caged',
  onOverlappingDisplayModeChange,
  overlappingCriteria = 'all',
  onOverlappingCriteriaChange,
  overlappingCAGEDShapes = ['C', 'A', 'G', 'E', 'D'],
  onOverlappingCAGEDShapesChange,
  currentKey = 'C',
  currentScale = 'Major',
  overlappingScalePositions = [],
  onOverlappingScalePositionsChange,
}: TabbedSettingsCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('triad-settings');

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: theme.bgSecondary,
        border: `1px solid ${theme.border}`,
      }}
    >
      {/* Tab Headers */}
      <div
        style={{
          display: 'flex',
          borderBottom: `1px solid ${theme.border}`,
          background: theme.bgTertiary,
          padding: '0 4px',
          gap: 2,
        }}
      >
        {/* Triad Settings Tab */}
        <button
          onClick={() => setActiveTab('triad-settings')}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 16px',
            fontSize: 13, fontWeight: 600,
            border: 'none', cursor: 'pointer',
            transition: 'all 0.15s ease',
            borderRadius: '6px 6px 0 0',
            color: activeTab === 'triad-settings' ? 'var(--mi-text-primary)' : theme.textSecondary,
            background: activeTab === 'triad-settings' ? 'var(--mi-bg-elevated)' : 'transparent',
            borderBottom: activeTab === 'triad-settings' ? '2px solid var(--mi-accent-blue)' : '2px solid transparent',
          }}
        >
          <Triangle size={14} style={{ color: activeTab === 'triad-settings' ? 'var(--mi-accent-blue)' : 'inherit' }} />
          Triad Settings
        </button>

        {/* Overlapping Chords Tab - Only show when feature is enabled */}
        {overlappingChordsEnabled && (
          <button
            onClick={() => setActiveTab('overlapping-chords')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '10px 16px',
              fontSize: 13, fontWeight: 600,
              border: 'none', cursor: 'pointer',
              transition: 'all 0.15s ease',
              borderRadius: '6px 6px 0 0',
              color: activeTab === 'overlapping-chords' ? 'var(--mi-text-primary)' : theme.textSecondary,
              background: activeTab === 'overlapping-chords' ? 'var(--mi-bg-elevated)' : 'transparent',
              borderBottom: activeTab === 'overlapping-chords' ? '2px solid var(--mi-accent-blue)' : '2px solid transparent',
            }}
          >
            <Layers size={14} style={{ color: activeTab === 'overlapping-chords' ? 'var(--mi-accent-blue)' : 'inherit' }} />
            Overlapping Chords
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'triad-settings' && (
          <div className="space-y-4">
            {/* Triad Positions Card */}
            <TriadPositionsCard
              theme={theme}
              selectedInversion={selectedTriadInversion}
              onInversionChange={onTriadInversionChange}
              positionCountsByInversion={positionCountsByInversion}
            />

            {/* CAGED Shapes Card */}
            <CAGEDShapesCard
              theme={theme}
              selectedCAGEDShapes={selectedCAGEDShapes}
              onCAGEDShapesChange={onCAGEDShapesChange}
              positionCountsByShape={positionCountsByShape}
              showCAGEDGuide={showCAGEDGuide}
              onCAGEDGuideChange={onCAGEDGuideChange}
              cagedBrightness={cagedBrightness}
              onCAGEDBrightnessChange={onCAGEDBrightnessChange}
              showPentatonicMode={showPentatonicMode}
              onPentatonicModeChange={onPentatonicModeChange}
            />
          </div>
        )}

        {activeTab === 'overlapping-chords' && overlappingChordsEnabled && (
          <OverlappingChordsTab
            theme={theme}
            displayMode={overlappingDisplayMode}
            onDisplayModeChange={onOverlappingDisplayModeChange || (() => {})}
            overlapCriteria={overlappingCriteria}
            onOverlapCriteriaChange={onOverlappingCriteriaChange || (() => {})}
            selectedCAGEDShapes={overlappingCAGEDShapes}
            onCAGEDShapesChange={onOverlappingCAGEDShapesChange || (() => {})}
            currentKey={currentKey}
            currentScale={currentScale}
            selectedScalePositions={overlappingScalePositions}
            onScalePositionsChange={onOverlappingScalePositionsChange || (() => {})}
          />
        )}
      </div>
    </div>
  );
}

