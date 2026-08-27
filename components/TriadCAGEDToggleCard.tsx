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
  // Triads in Scale arc-bands (synced with fretboard panel toggle)
  showTriadArcBands?: boolean;
  onTriadArcBandsChange?: (enabled: boolean) => void;
  overlayMode?: string;
  onOverlayModeChange?: (mode: string) => void;
}

export default function TriadCAGEDToggleCard({
  theme,
  showTriadMode,
  onTriadModeChange,
  overlappingChordsEnabled = false,
  onOverlappingChordsChange,
  showIndividualNotes = false,
  onIndividualNotesChange,
  showTriadArcBands = false,
  onTriadArcBandsChange,
  overlayMode = 'triads',
  onOverlayModeChange,
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

        {/* ── Triads in Scale toggle + overlay dropdown (synced with fretboard) ── */}
        {onTriadArcBandsChange && (
          <div>
            <div className="flex items-center gap-2">
              {/* Toggle pill */}
              <div
                onClick={() => onTriadArcBandsChange(!showTriadArcBands)}
                className="relative flex-shrink-0"
                style={{
                  width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
                  background: showTriadArcBands ? theme.accentPrimary : '#4b5563',
                  border: `2px solid ${showTriadArcBands ? theme.accentPrimary : '#6b7280'}`,
                  transition: 'background 0.2s ease, border-color 0.2s ease',
                }}
                aria-label="Toggle Triads in Scale"
              >
                <span
                  className="inline-block rounded-full shadow-md"
                  style={{
                    position: 'absolute', top: 1,
                    width: 12, height: 12,
                    background: '#fff',
                    transform: showTriadArcBands ? 'translateX(16px)' : 'translateX(2px)',
                    transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1)',
                  }}
                />
              </div>
              {/* Overlay mode dropdown */}
              <select
                value={overlayMode}
                onChange={(e) => onOverlayModeChange?.(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 text-xs font-semibold rounded"
                style={{
                  background: theme.bgSecondary,
                  color: theme.textPrimary,
                  border: `1px solid ${theme.border}`,
                  padding: '2px 5px',
                  cursor: 'pointer',
                  outline: 'none',
                  minWidth: 0,
                }}
              >
                <option value="triads">Triads in Scale</option>
                <option value="seventh-chords">7th Chords in Scale</option>
                <option value="pentatonic">Pentatonic per Chord</option>
                <option value="arpeggios">Arpeggio Shapes (CAGED)</option>
                <option value="diatonic-intervals">Diatonic Intervals</option>
                <option value="tritone">Tritone Tension &amp; Resolution</option>
              </select>
            </div>
            {/* Divider below */}
            <div className="mt-2 border-t" style={{ borderColor: theme.border }} />
          </div>
        )}

        {/* Back button — shown only when Triads & CAGED is ON */}
        {showTriadMode && (
          <button
            onClick={() => {
              if (overlappingChordsEnabled && onOverlappingChordsChange) {
                onOverlappingChordsChange(false);
              }
              onTriadModeChange(false);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80"
            style={{
              background: 'transparent',
              border: `1px solid ${theme.border}`,
              color: theme.textSecondary,
              cursor: 'pointer',
              width: '100%',
              justifyContent: 'flex-start',
            }}
            aria-label="Back — turn off Triads & CAGED"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back
          </button>
        )}

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

