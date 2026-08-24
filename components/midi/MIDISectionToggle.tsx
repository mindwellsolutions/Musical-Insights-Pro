'use client';

/**
 * MIDISectionToggle
 *
 * A compact MIDI icon button placed next to a UI section. Clicking it toggles
 * the section ON/OFF in the "enabled" set — sections that are ON will be cycled
 * through by the Next Section / Last Section pedal buttons.
 *
 * Three visual states:
 *   disabled  — greyed out icon, section is not in the cycle pool
 *   enabled   — white/lit icon, section is in the cycle pool but not currently focused
 *   focused   — accent-colored glow + pulse, section is currently being controlled
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
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="4" width="14" height="8" rx="2" fill={color} opacity="0.9" />
      <rect x="2.5" y="5.5" width="5" height="5" rx="1" fill="rgba(0,0,0,0.35)" />
      <rect x="8.5" y="5.5" width="5" height="5" rx="1" fill="rgba(0,0,0,0.35)" />
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
  const {
    activeSectionId,
    enabledSectionIds,
    toggleEnabled,
    registerCallbacks,
    unregisterCallbacks,
    registerSectionOrder,
    unregisterSectionOrder,
  } = useMIDISelection();
  const { isConnected, config } = useMIDIPedal();

  const isEnabled = enabledSectionIds.has(sectionId);
  const isFocused = activeSectionId === sectionId;
  // A device being connected is all that's needed to allow toggling sections.
  // config.enabled starts false on a fresh deployment (empty localStorage) even
  // when a device is selected — requiring it here blocks the button entirely on
  // first use of the deployed site. isConnected is the correct gate.
  const isMIDIAvailable = isConnected;

  // Register section in DOM order and callbacks
  useEffect(() => {
    registerSectionOrder(sectionId);
    return () => { unregisterSectionOrder(sectionId); };
  }, [sectionId, registerSectionOrder, unregisterSectionOrder]);

  useEffect(() => {
    const callbacks: SectionCallbacks = { onLeft, onRight };
    registerCallbacks(sectionId, callbacks);
    return () => { unregisterCallbacks(sectionId); };
  }, [sectionId, onLeft, onRight, registerCallbacks, unregisterCallbacks]);

  const handleClick = () => {
    if (!isMIDIAvailable) return;
    toggleEnabled(sectionId);
  };

  const accentColor = theme.accentPrimary || '#3b82f6';
  // Enabled-but-not-focused: bright white so it's clearly ON
  const enabledColor = '#e2e8f0';

  const iconColor = isFocused ? accentColor : isEnabled ? enabledColor : theme.textSecondary;
  const bgColor = isFocused
    ? `${accentColor}22`
    : isEnabled
    ? 'rgba(255,255,255,0.08)'
    : theme.bgSecondary;
  const borderStyle = isFocused
    ? `1.5px solid ${accentColor}`
    : isEnabled
    ? `1.5px solid ${enabledColor}66`
    : `1px solid ${theme.border}`;

  const titleText = !isMIDIAvailable
    ? 'MIDI pedal not connected — configure in Settings'
    : isFocused
    ? `MIDI focused: ${label} — Next/Last Section to cycle away`
    : isEnabled
    ? `${label}: in MIDI cycle — click to remove`
    : `Add "${label}" to MIDI cycle`;

  return (
    <button
      onClick={handleClick}
      title={titleText}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 5,
        border: borderStyle,
        background: bgColor,
        color: iconColor,
        cursor: isMIDIAvailable ? 'pointer' : 'default',
        opacity: isMIDIAvailable ? 1 : 0.6,
        transition: 'all 150ms ease',
        boxShadow: isFocused ? `0 0 8px ${accentColor}66` : 'none',
        flexShrink: 0,
        padding: 0,
        animation: isFocused ? 'midi-toggle-pulse 2s ease-in-out infinite' : 'none',
      }}
      aria-pressed={isEnabled}
      aria-label={`MIDI toggle: ${label}`}
    >
      <PedalIcon size={13} color={iconColor} />
      <style jsx>{`
        @keyframes midi-toggle-pulse {
          0%, 100% { box-shadow: 0 0 6px ${accentColor}55; }
          50%       { box-shadow: 0 0 14px ${accentColor}aa; }
        }
      `}</style>
    </button>
  );
}
