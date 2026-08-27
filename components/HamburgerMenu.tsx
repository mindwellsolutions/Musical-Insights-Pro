'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeConfig } from '@/lib/themes';
import {
  Settings, LogOut, Menu, X, Music2, Volume2, Shield, CreditCard,
  Save, FolderOpen, BookOpen, Mic, Triangle, Layers, Home, HelpCircle,
  FlaskConical, ChevronRight, Radio, Zap, Guitar,
} from 'lucide-react';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface HamburgerMenuProps {
  theme: ThemeConfig;
  isFocusMode?: boolean;
  showCircleOf5ths?: boolean;
  circleOf5thsPosition?: 'left' | 'right' | 'below';
  showColorfulStrings?: boolean;
  stringBrightness?: number;
  noteDetectorEnabled?: boolean;
  showTriadMode?: boolean;
  overlappingChordsEnabled?: boolean;
  showTriadArcBands?: boolean;
  onTriadArcBandsChange?: (enabled: boolean) => void;
  showIndividualNotes?: boolean;
  onIndividualNotesChange?: (enabled: boolean) => void;
  overlayMode?: string;
  onOverlayModeChange?: (mode: string) => void;
  isDetecting?: boolean;
  pedalSwitchingMode?: 'passive' | 'realtime';
  instrument?: 'guitar' | 'bass';
  onInstrumentChange?: (instrument: 'guitar' | 'bass') => void;
  guitarStringCount?: 6 | 7;
  onGuitarStringCountChange?: (count: 6 | 7) => void;
  bassStringCount?: 4 | 5 | 6;
  onBassStringCountChange?: (count: 4 | 5 | 6) => void;
  onSave?: () => void;
  onSaveAs?: () => void;
  onLoad?: () => void;
  onToggleSettings?: () => void;
  onFocusModeChange?: (enabled: boolean) => void;
  onShowGuide?: () => void;
  showGuideAtStart?: boolean;
  onShowGuideAtStartChange?: (v: boolean) => void;
  onShowCircleOf5thsChange?: (show: boolean) => void;
  onCircleOf5thsPositionChange?: (position: 'left' | 'right' | 'below') => void;
  onShowColorfulStringsChange?: (show: boolean) => void;
  onStringBrightnessChange?: (brightness: number) => void;
  onNoteDetectorEnabledChange?: (enabled: boolean) => void;
  onTriadModeChange?: (enabled: boolean) => void;
  onOverlappingChordsChange?: (enabled: boolean) => void;
  onStartDetection?: () => void;
  onStopDetection?: () => void;
  onPedalSwitchingModeChange?: (mode: 'passive' | 'realtime') => void;
  onLogout?: () => void;
  /** Increment this value to programmatically open the menu (e.g. from Settings back button) */
  forceOpen?: number;
}

// ── Reusable sub-components ──────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '18px 20px 7px',
      fontSize: 10.5, fontWeight: 700,
      letterSpacing: '0.10em', textTransform: 'uppercase',
      color: 'var(--mi-text-muted)',
    }}>
      {children}
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: 'var(--mi-border-subtle)', margin: '6px 16px' }} />;
}

function NavRow({
  icon, label, active, href, onClick, danger,
}: {
  icon: React.ReactNode; label: string; active?: boolean;
  href?: string; onClick?: () => void; danger?: boolean;
}) {
  const baseStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 13,
    padding: '0 20px', height: 46, fontSize: 14, fontWeight: 500,
    color: danger ? 'var(--mi-accent-red)' : active ? 'var(--mi-text-primary)' : '#c0c0d8',
    background: active ? 'rgba(59,130,246,0.08)' : 'transparent',
    borderLeft: active ? '3px solid var(--mi-accent-blue)' : '3px solid transparent',
    cursor: 'pointer', textDecoration: 'none',
    transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
    userSelect: 'none',
  };

  const iconStyle: React.CSSProperties = {
    width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: danger ? 'var(--mi-accent-red)' : active ? 'var(--mi-accent-blue)' : 'var(--mi-text-secondary)',
    transition: 'color 0.15s ease',
  };

  const handleHover = (el: HTMLElement, on: boolean) => {
    if (!active && !danger) {
      el.style.background = on ? 'var(--mi-bg-elevated)' : 'transparent';
      el.style.color = on ? 'var(--mi-text-primary)' : '#c0c0d8';
    } else if (danger) {
      el.style.background = on ? 'rgba(239,68,68,0.08)' : 'transparent';
    }
  };

  const inner = (
    <>
      <span style={iconStyle}>{icon}</span>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} style={baseStyle}
        onMouseEnter={(e) => handleHover(e.currentTarget as HTMLElement, true)}
        onMouseLeave={(e) => handleHover(e.currentTarget as HTMLElement, false)}
      >{inner}</Link>
    );
  }
  return (
    <div style={baseStyle} onClick={onClick}
      onMouseEnter={(e) => handleHover(e.currentTarget as HTMLDivElement, true)}
      onMouseLeave={(e) => handleHover(e.currentTarget as HTMLDivElement, false)}
    >{inner}</div>
  );
}

function ToggleRow({
  icon, label, isOn, onToggle, indented, disabled,
}: {
  icon?: React.ReactNode; label: string; isOn: boolean;
  onToggle: () => void; indented?: boolean; disabled?: boolean;
}) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 20px 0 ${indented ? '36px' : '20px'}`, height: 44,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, userSelect: 'none',
        transition: 'background 0.15s ease',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLDivElement).style.background = 'var(--mi-bg-elevated)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {icon && (
          <span style={{ width: 16, display: 'flex', alignItems: 'center', color: isOn ? 'var(--mi-accent-blue)' : 'var(--mi-text-secondary)', transition: 'color 0.15s ease' }}>
            {icon}
          </span>
        )}
        <span style={{ fontSize: 14, fontWeight: 500, color: isOn ? 'var(--mi-text-primary)' : '#c0c0d8', transition: 'color 0.15s ease' }}>
          {label}
        </span>
      </div>
      {/* Toggle pill */}
      <div style={{
        width: 42, height: 24, borderRadius: 12, flexShrink: 0, position: 'relative',
        background: isOn ? 'var(--mi-accent-blue)' : 'rgba(255,255,255,0.08)',
        border: `1px solid ${isOn ? 'var(--mi-accent-blue)' : 'var(--mi-border-medium)'}`,
        boxShadow: isOn ? '0 0 8px rgba(59,130,246,0.35)' : 'none',
        transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
      }}>
        <div style={{
          position: 'absolute', top: 3, left: isOn ? 21 : 3,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
          transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function HamburgerMenu({
  theme,
  isFocusMode = false,
  showCircleOf5ths = true,
  circleOf5thsPosition = 'left',
  showColorfulStrings = false,
  stringBrightness = 100,
  noteDetectorEnabled = false,
  showTriadMode = false,
  overlappingChordsEnabled = false,
  showTriadArcBands = false,
  onTriadArcBandsChange,
  showIndividualNotes = false,
  onIndividualNotesChange,
  overlayMode = 'triads',
  onOverlayModeChange,
  isDetecting = false,
  pedalSwitchingMode = 'passive',
  instrument = 'guitar',
  onInstrumentChange,
  guitarStringCount = 6,
  onGuitarStringCountChange,
  bassStringCount = 4,
  onBassStringCountChange,
  onSave,
  onSaveAs,
  onLoad,
  onToggleSettings,
  onFocusModeChange,
  onShowGuide,
  showGuideAtStart = true,
  onShowGuideAtStartChange,
  onShowCircleOf5thsChange,
  onCircleOf5thsPositionChange,
  onShowColorfulStringsChange,
  onStringBrightnessChange,
  onNoteDetectorEnabledChange,
  onTriadModeChange,
  onOverlappingChordsChange,
  onStartDetection,
  onStopDetection,
  onPedalSwitchingModeChange,
  onLogout,
  forceOpen,
}: HamburgerMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [betaOpen, setBetaOpen] = useState(false);
  const { isAdmin } = useAdminCheck();

  const close = () => { setIsOpen(false); setBetaOpen(false); };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Open programmatically when forceOpen increments (e.g. Settings back button)
  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '0 12px', height: 34, borderRadius: 'var(--mi-radius-md)',
          background: 'var(--mi-bg-elevated)',
          border: '1px solid var(--mi-border-medium)',
          color: '#ffffff',
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          transition: 'background 0.15s ease, border-color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-overlay)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--mi-border-accent)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-elevated)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--mi-border-medium)';
        }}
        title="Open navigation menu"
        aria-label="Open navigation menu"
      >
        <Menu size={16} />
        <span>Menu</span>
      </button>

      {/* ── Backdrop ── */}
      <div
        onClick={close}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          zIndex: 300,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.28s ease',
        }}
        aria-hidden="true"
      />

      {/* ── Sidebar Panel ── */}
      <div
        style={{
          position: 'fixed', left: 0, top: 0, width: 300, height: '100vh',
          background: 'linear-gradient(180deg, #12121a 0%, #0e0e15 100%)',
          borderRight: '1px solid var(--mi-border-medium)',
          boxShadow: '6px 0 40px rgba(0,0,0,0.6), 1px 0 0 rgba(255,255,255,0.04)',
          zIndex: 301,
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        {/* ── Sidebar Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 16px 0 20px', height: 64, flexShrink: 0,
          borderBottom: '1px solid var(--mi-border-subtle)',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <Image
            src="/images/logo/website-logo-live-v1.2.png"
            alt="Musical Insights"
            width={118} height={26}
            style={{ objectFit: 'contain' }}
          />
          <button
            onClick={close}
            style={{
              width: 32, height: 32, borderRadius: 'var(--mi-radius-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent', border: '1px solid var(--mi-border-subtle)',
              color: 'var(--mi-text-muted)', cursor: 'pointer',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-elevated)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-muted)'; }}
            aria-label="Close menu"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Scrollable Content ── */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>

          {/* NAVIGATE */}
          <SectionLabel>Navigate</SectionLabel>
          <NavRow icon={<Home size={17} />} label="Visualizer" href="/" active={isActive('/')} onClick={close} />
          <NavRow icon={<Music2 size={17} />} label="Song Builder" href="/chord-progression-builder" active={isActive('/chord-progression-builder')} onClick={close} />
          {onToggleSettings && (
            <NavRow icon={<Settings size={17} />} label="Settings" onClick={() => { onToggleSettings(); close(); }} />
          )}

          {/* BETA submenu trigger */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setBetaOpen(o => !o)}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--mi-bg-elevated)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', height: 46, fontSize: 14, fontWeight: 500,
                color: betaOpen ? 'var(--mi-text-primary)' : '#c0c0d8',
                background: betaOpen ? 'rgba(59,130,246,0.08)' : 'transparent',
                borderLeft: betaOpen ? '3px solid var(--mi-accent-blue)' : '3px solid transparent',
                cursor: 'pointer', userSelect: 'none',
                transition: 'background 0.15s ease, color 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: betaOpen ? 'var(--mi-accent-blue)' : 'var(--mi-text-secondary)' }}>
                  <FlaskConical size={17} />
                </span>
                <span>Beta</span>
                <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 5px', borderRadius: 4, background: 'rgba(99,102,241,0.25)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.35)' }}>BETA</span>
              </div>
              <ChevronRight size={14} style={{ color: 'var(--mi-text-muted)', transform: betaOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
            </div>

            {/* Beta flyout panel */}
            {betaOpen && (
              <div style={{
                position: 'absolute', left: '100%', top: 0, width: 240,
                background: 'linear-gradient(180deg, #16162a 0%, #0e0e1a 100%)',
                border: '1px solid var(--mi-border-medium)',
                borderRadius: '0 10px 10px 0',
                boxShadow: '8px 0 32px rgba(0,0,0,0.55)',
                zIndex: 400, overflow: 'hidden',
              }}>
                <div style={{ padding: '10px 16px 6px', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase', color: 'var(--mi-text-muted)' }}>
                  Beta Features
                </div>
                {onStartDetection && onStopDetection && (
                  <ToggleRow
                    icon={<Volume2 size={14} />}
                    label="Key Detection"
                    isOn={isDetecting}
                    onToggle={() => isDetecting ? onStopDetection() : onStartDetection()}
                  />
                )}
                {onNoteDetectorEnabledChange && (
                  <ToggleRow
                    icon={<Mic size={14} />}
                    label="Note Detector"
                    isOn={noteDetectorEnabled}
                    onToggle={() => onNoteDetectorEnabledChange(!noteDetectorEnabled)}
                  />
                )}
                <NavRow
                  icon={<BookOpen size={17} />}
                  label="Learn Fretboard"
                  href="/learn/fretboard"
                  active={isActive('/learn/fretboard')}
                  onClick={close}
                />
              </div>
            )}
          </div>

          <Divider />

          {/* INSTRUMENT */}
          {onInstrumentChange && (
            <>
              <SectionLabel>Instrument</SectionLabel>
              <div style={{ padding: '0 20px 8px' }}>
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--mi-border-medium)' }}>
                  {(['guitar', 'bass'] as const).map(opt => {
                    const active = instrument === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => onInstrumentChange(opt)}
                        style={{
                          flex: 1, height: 36, border: 'none', cursor: 'pointer',
                          fontSize: 13, fontWeight: 600,
                          background: active ? 'var(--mi-accent-blue)' : 'transparent',
                          color: active ? '#fff' : '#8888aa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                          transition: 'background 0.15s ease, color 0.15s ease',
                        }}
                      >
                        <Guitar size={14} />
                        {opt === 'guitar' ? 'Guitar' : 'Bass'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* String count selector: Guitar = 6/7, Bass = 4/5/6 */}
              <div style={{ padding: '0 20px 12px' }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#8888aa', marginBottom: 6 }}>
                  Strings
                </div>
                <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--mi-border-medium)' }}>
                  {(instrument === 'guitar' ? [6, 7] as const : [4, 5, 6] as const).map(count => {
                    const active = instrument === 'guitar' ? guitarStringCount === count : bassStringCount === count;
                    return (
                      <button
                        key={count}
                        onClick={() => {
                          if (instrument === 'guitar') {
                            onGuitarStringCountChange?.(count as 6 | 7);
                          } else {
                            onBassStringCountChange?.(count as 4 | 5 | 6);
                          }
                        }}
                        style={{
                          flex: 1, height: 32, border: 'none', cursor: 'pointer',
                          fontSize: 13, fontWeight: 600,
                          background: active ? 'var(--mi-accent-blue)' : 'transparent',
                          color: active ? '#fff' : '#8888aa',
                          transition: 'background 0.15s ease, color 0.15s ease',
                        }}
                      >
                        {count}
                      </button>
                    );
                  })}
                </div>
              </div>
              <Divider />
            </>
          )}

          {/* VIEW MODE */}
          <SectionLabel>View Mode</SectionLabel>

          {/* ── Triads in Scale (synced with fretboard toggle + dropdown) ── */}
          {onTriadArcBandsChange && (
            <div style={{ padding: '4px 20px 10px' }}>
              {/* Toggle + dropdown row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {/* Toggle pill */}
                <div
                  onClick={() => onTriadArcBandsChange(!showTriadArcBands)}
                  style={{
                    width: 42, height: 24, borderRadius: 12, flexShrink: 0, position: 'relative',
                    background: showTriadArcBands ? 'var(--mi-accent-blue)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${showTriadArcBands ? 'var(--mi-accent-blue)' : 'var(--mi-border-medium)'}`,
                    boxShadow: showTriadArcBands ? '0 0 8px rgba(59,130,246,0.35)' : 'none',
                    transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: showTriadArcBands ? 21 : 3,
                    width: 16, height: 16, borderRadius: '50%', background: '#fff',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                    transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                  }} />
                </div>
                {/* Overlay mode dropdown */}
                <select
                  value={overlayMode}
                  onChange={(e) => onOverlayModeChange?.(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    flex: 1, fontSize: 12, fontWeight: 600,
                    color: '#c0c0d8',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid var(--mi-border-medium)',
                    borderRadius: 6, padding: '3px 6px',
                    cursor: 'pointer', outline: 'none',
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
              {/* Individual Notes toggle below */}
              {onIndividualNotesChange && (
                <ToggleRow
                  icon={<Music2 size={14} />}
                  label="Individual Notes"
                  isOn={showIndividualNotes}
                  onToggle={() => onIndividualNotesChange(!showIndividualNotes)}
                />
              )}
            </div>
          )}

          {onTriadModeChange && (
            <ToggleRow
              icon={<Triangle size={14} />}
              label="Triads & CAGED"
              isOn={showTriadMode}
              onToggle={() => {
                if (showTriadMode && overlappingChordsEnabled) onOverlappingChordsChange?.(false);
                onTriadModeChange(!showTriadMode);
              }}
            />
          )}
          {onOverlappingChordsChange && showTriadMode && (
            <ToggleRow
              icon={<Layers size={14} />}
              label="Overlapping Chords"
              isOn={overlappingChordsEnabled}
              onToggle={() => onOverlappingChordsChange(!overlappingChordsEnabled)}
              indented
            />
          )}

          {/* Pedal Switching View — Passive ↔ Real-time */}
          {onPedalSwitchingModeChange && (
            <div style={{ padding: '6px 20px 8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ width: 16, display: 'flex', alignItems: 'center', color: 'var(--mi-text-secondary)' }}><Radio size={14} /></span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#c0c0d8' }}>Pedal Switching View</span>
              </div>
              <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--mi-border-medium)' }}>
                {(['passive', 'realtime'] as const).map(mode => {
                  const isActive = pedalSwitchingMode === mode;
                  return (
                    <button
                      key={mode}
                      onClick={() => onPedalSwitchingModeChange(mode)}
                      style={{
                        flex: 1, height: 32, border: 'none', cursor: 'pointer',
                        fontSize: 12, fontWeight: 600,
                        background: isActive ? 'var(--mi-accent-blue)' : 'transparent',
                        color: isActive ? '#fff' : '#8888aa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                    >
                      {mode === 'passive' ? <><Zap size={11} />Passive</> : <><Radio size={11} />Real-time</>}
                    </button>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: 'var(--mi-text-muted)', marginTop: 5, lineHeight: 1.4 }}>
                {pedalSwitchingMode === 'passive'
                  ? 'Toast only — view stays where you are'
                  : 'View follows pedal section selection'}
              </div>
            </div>
          )}

          <Divider />

          {/* TOOLS */}
          <SectionLabel>Tools</SectionLabel>
          {onShowGuide && (
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0 20px', height: 46, cursor: 'pointer', userSelect: 'none',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--mi-bg-elevated)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              onClick={() => { onShowGuide(); close(); }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <span style={{ width: 18, height: 18, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mi-text-secondary)' }}>
                  <HelpCircle size={17} />
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: '#c0c0d8' }}>Tutorial Guide</span>
              </div>
              {onShowGuideAtStartChange && (
                <div
                  onClick={(e) => { e.stopPropagation(); onShowGuideAtStartChange(!showGuideAtStart); }}
                  style={{ flexShrink: 0 }}
                  title="Show Guide on Startup"
                >
                  <div style={{
                    width: 42, height: 24, borderRadius: 12, position: 'relative',
                    background: showGuideAtStart ? 'var(--mi-accent-blue)' : 'rgba(255,255,255,0.08)',
                    border: `1px solid ${showGuideAtStart ? 'var(--mi-accent-blue)' : 'var(--mi-border-medium)'}`,
                    boxShadow: showGuideAtStart ? '0 0 8px rgba(59,130,246,0.35)' : 'none',
                    transition: 'background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                  }}>
                    <div style={{
                      position: 'absolute', top: 3, left: showGuideAtStart ? 21 : 3,
                      width: 16, height: 16, borderRadius: '50%', background: '#fff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.35)',
                      transition: 'left 0.2s cubic-bezier(0.4,0,0.2,1)',
                    }} />
                  </div>
                </div>
              )}
            </div>
          )}
          {onSave && (
            <NavRow icon={<Save size={17} />} label="Save" onClick={() => { onSave(); close(); }} />
          )}
          {onSaveAs && (
            <NavRow icon={<Save size={17} />} label="Save As" onClick={() => { onSaveAs(); close(); }} />
          )}
          {onLoad && (
            <NavRow icon={<FolderOpen size={17} />} label="Load" onClick={() => { onLoad(); close(); }} />
          )}

          <Divider />

          {/* ACCOUNT */}
          <SectionLabel>Account</SectionLabel>
          <NavRow
            icon={<CreditCard size={17} />}
            label="Manage Subscription"
            href="/subscription/manage"
            active={isActive('/subscription/manage')}
            onClick={close}
          />
          {isAdmin && (
            <>
              <NavRow
                icon={<Shield size={17} />}
                label="Admin Dashboard"
                href="/admin/dashboard"
                active={isActive('/admin/dashboard')}
                onClick={close}
              />
              <NavRow
                icon={<CreditCard size={17} />}
                label="Subscription Analytics"
                href="/admin/subscriptions"
                active={isActive('/admin/subscriptions')}
                onClick={close}
              />
            </>
          )}
        </div>

        {/* ── Pinned Footer: Logout ── */}
        <div style={{ flexShrink: 0, borderTop: '1px solid var(--mi-border-subtle)', padding: '8px 0' }}>
          {onLogout && (
            <NavRow
              icon={<LogOut size={17} />}
              label="Logout"
              onClick={() => { onLogout(); close(); }}
              danger
            />
          )}
        </div>
      </div>
    </>
  );
}

