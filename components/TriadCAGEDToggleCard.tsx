'use client';

import { ThemeConfig } from '@/lib/themes';

interface TriadCAGEDToggleCardProps {
  theme: ThemeConfig;
  showTriadMode: boolean;
  onTriadModeChange: (enabled: boolean) => void;
  overlappingChordsEnabled?: boolean;
  onOverlappingChordsChange?: (enabled: boolean) => void;
  showIndividualNotes?: boolean;
  onIndividualNotesChange?: (enabled: boolean) => void;
}

export default function TriadCAGEDToggleCard({
  theme,
  showTriadMode,
  onTriadModeChange,
  overlappingChordsEnabled = false,
  onOverlappingChordsChange,
  showIndividualNotes = false,
  onIndividualNotesChange,
}: TriadCAGEDToggleCardProps) {
  // Reusable toggle row
  const ToggleRow = ({
    label,
    isOn,
    onToggle,
    ariaLabel,
  }: {
    label: string;
    isOn: boolean;
    onToggle: () => void;
    ariaLabel: string;
  }) => (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs font-semibold whitespace-nowrap" style={{ color: theme.textPrimary }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-xs font-semibold" style={{ color: !isOn ? theme.accentPrimary : theme.textSecondary, opacity: !isOn ? 1 : 0.5 }}>
          OFF
        </span>
        <button
          onClick={onToggle}
          className="relative inline-flex h-5 w-9 items-center rounded-full transition-all shadow-sm focus:outline-none"
          style={{
            backgroundColor: isOn ? theme.accentPrimary : '#4b5563',
            border: `2px solid ${isOn ? theme.accentPrimary : '#6b7280'}`,
          }}
          aria-label={ariaLabel}
        >
          <span
            className="inline-block h-4 w-4 transform rounded-full transition-transform duration-200 ease-in-out shadow-md"
            style={{
              backgroundColor: '#ffffff',
              transform: isOn ? 'translateX(16px)' : 'translateX(2px)',
            }}
          />
        </button>
        <span className="text-xs font-semibold" style={{ color: isOn ? theme.accentPrimary : theme.textSecondary, opacity: isOn ? 1 : 0.5 }}>
          ON
        </span>
      </div>
    </div>
  );

  return (
    <div
      className="rounded-lg p-2.5"
      style={{
        background: theme.bgTertiary,
        border: `1px solid ${theme.border}`,
      }}
    >
      <div className="space-y-2">
        <ToggleRow
          label="Triads & CAGED"
          isOn={showTriadMode}
          ariaLabel="Toggle Triads & CAGED"
          onToggle={() => {
            if (showTriadMode && overlappingChordsEnabled && onOverlappingChordsChange) {
              onOverlappingChordsChange(false);
            }
            onTriadModeChange(!showTriadMode);
          }}
        />

        {!showTriadMode && onIndividualNotesChange && (
          <div className="pt-1.5 border-t" style={{ borderColor: theme.border }}>
            <ToggleRow
              label="Individual Notes"
              isOn={showIndividualNotes}
              ariaLabel="Toggle Individual Notes"
              onToggle={() => onIndividualNotesChange(!showIndividualNotes)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

