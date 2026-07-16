'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ThemeConfig } from '@/lib/themes';
import {
  Settings, Eye, EyeOff, LogOut, Menu, X, Music2, Volume2, Shield, CreditCard,
  Save, FolderOpen, BookOpen, Mic, Triangle, Layers, Home, HelpCircle,
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
  isDetecting?: boolean;
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
  onLogout?: () => void;
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
  isDetecting = false,
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
  onLogout,
}: HamburgerMenuProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const { isAdmin } = useAdminCheck();

  const close = () => setIsOpen(false);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

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
          color: 'var(--mi-text-secondary)',
          cursor: 'pointer', fontSize: 13, fontWeight: 500,
          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-overlay)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--mi-border-accent)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-primary)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-elevated)';
          (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--mi-border-medium)';
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-secondary)';
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
            src="/images/logo-whitetext.png"
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
          <NavRow icon={<BookOpen size={17} />} label="Learn Fretboard" href="/learn/fretboard" active={isActive('/learn/fretboard')} onClick={close} />

          <Divider />

          {/* VIEW MODE */}
          <SectionLabel>View Mode</SectionLabel>
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
          {onFocusModeChange && (
            <ToggleRow
              icon={isFocusMode ? <EyeOff size={14} /> : <Eye size={14} />}
              label="Focus Mode"
              isOn={isFocusMode}
              onToggle={() => onFocusModeChange(!isFocusMode)}
            />
          )}

          <Divider />

          {/* AUDIO */}
          <SectionLabel>Audio</SectionLabel>
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
              label="Note Detector (Beta)"
              isOn={noteDetectorEnabled}
              onToggle={() => onNoteDetectorEnabledChange(!noteDetectorEnabled)}
            />
          )}

          <Divider />

          {/* TOOLS */}
          <SectionLabel>Tools</SectionLabel>
          {onShowGuide && (
            <NavRow icon={<HelpCircle size={17} />} label="Tutorial Guide" onClick={() => { onShowGuide(); close(); }} />
          )}
          {onShowGuideAtStartChange && (
            <ToggleRow
              icon={<BookOpen size={14} />}
              label="Show Guide on Startup"
              isOn={showGuideAtStart}
              onToggle={() => onShowGuideAtStartChange(!showGuideAtStart)}
              indented
            />
          )}
          {onToggleSettings && (
            <NavRow icon={<Settings size={17} />} label="Settings" onClick={() => { onToggleSettings(); close(); }} />
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

