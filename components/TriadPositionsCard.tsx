'use client';

import { ThemeConfig } from '@/lib/themes';
import { TriadInversion } from '@/lib/triad-theory';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TriadPositionsCardProps {
  theme: ThemeConfig;
  selectedInversion: TriadInversion;
  onInversionChange: (inversion: TriadInversion) => void;
  positionCountsByInversion?: Record<TriadInversion, number>;
}

export default function TriadPositionsCard({
  theme,
  selectedInversion,
  onInversionChange,
  positionCountsByInversion = { root: 0, first: 0, second: 0 },
}: TriadPositionsCardProps) {
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

  return (
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
  );
}

