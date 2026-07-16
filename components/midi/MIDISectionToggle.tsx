'use client';

/**
 * MIDISectionToggle
 *
 * A compact radio-style button that claims/releases MIDI pedal control for a
 * given UI section. Only one section can be active at a time (enforced by
 * MIDISelectionContext).
 *
 * Usage:
 *   <MIDISectionToggle
 *     sectionId="compatible-scales"
 *     label="Compatible Scales"
 *     onLeft={handlePrevScale}
 *     onRight={handleNextScale}
 *     theme={theme}
 *   />
 */

import React, { useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { useMIDISelection, MIDISectionId, SectionCallbacks } from '@/contexts/MIDISelectionContext';
import { useMIDIPedal } from '@/components/midi/MIDIContext';

interface MIDISectionToggleProps {
  sectionId: MIDISectionId;
  label: string;
  onLeft: () => void;
  onRight: () => void;
  theme: ThemeConfig;
  className?: string;
}

/** Inline MIDI pedal foot-switch SVG icon */
function PedalIcon({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Body */}
      <rect x="1" y="4" width="14" height="8" rx="2" fill={color} opacity="0.9" />
      {/* Left pedal button */}
      <rect x="2.5" y="5.5" width="5" height="5" rx="1" fill="rgba(0,0,0,0.35)" />
      {/* Right pedal button */}
      <rect x="8.5" y="5.5" width="5" height="5" rx="1" fill="rgba(0,0,0,0.35)" />
      {/* Cable */}
      <path d="M8 4V2.5C8 2 8.5 1.5 9 1.5H10" stroke={color} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function MIDISectionToggle({
  sectionId,
  label,
  onLeft,
  onRight,
  theme,
  className,
}: MIDISectionToggleProps) {
  const { activeSectionId, toggleSectionId, registerCallbacks, unregisterCallbacks } = useMIDISelection();
  const { isConnected, config } = useMIDIPedal();

  const isActive = activeSectionId === sectionId;
  const isMIDIAvailable = isConnected && config.enabled;

  // Register/update callbacks whenever they change
  useEffect(() => {
    const callbacks: SectionCallbacks = { onLeft, onRight };
    registerCallbacks(sectionId, callbacks);
    return () => {
      unregisterCallbacks(sectionId);
    };
  }, [sectionId, onLeft, onRight, registerCallbacks, unregisterCallbacks]);

  const handleClick = () => {
    toggleSectionId(sectionId);
  };

  const accentColor = theme.accentPrimary || '#3b82f6';

  return (
    <button
      onClick={handleClick}
      title={
        !isMIDIAvailable
          ? 'MIDI pedal not connected'
          : isActive
          ? `MIDI Active: ${label} — click to release`
          : `Control "${label}" with MIDI pedal`
      }
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: 6,
        border: isActive
          ? `1.5px solid ${accentColor}`
          : `1px solid ${theme.border}`,
        background: isActive ? `${accentColor}22` : theme.bgSecondary,
        color: isActive ? accentColor : theme.textSecondary,
        cursor: isMIDIAvailable ? 'pointer' : 'not-allowed',
        opacity: isMIDIAvailable ? 1 : 0.4,
        transition: 'all 150ms ease',
        boxShadow: isActive ? `0 0 8px ${accentColor}55` : 'none',
        flexShrink: 0,
        padding: 0,
        // Pulse animation when active
        animation: isActive ? 'midi-section-pulse 2s ease-in-out infinite' : 'none',
      }}
      aria-pressed={isActive}
      aria-label={`MIDI control: ${label}`}
    >
      <PedalIcon size={14} color={isActive ? accentColor : theme.textSecondary} />
      <style jsx>{`
        @keyframes midi-section-pulse {
          0%, 100% { box-shadow: 0 0 6px ${accentColor}55; }
          50%       { box-shadow: 0 0 12px ${accentColor}99; }
        }
      `}</style>
    </button>
  );
}
