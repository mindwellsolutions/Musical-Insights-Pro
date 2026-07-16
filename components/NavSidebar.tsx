'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home, Music, BookOpen, Triangle, Layers, Volume2, HelpCircle, Eye, EyeOff,
  CreditCard, Shield, LogOut, ChevronRight, ChevronLeft, X, Menu, Mic, Sparkles,
} from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { useAdminCheck } from '@/hooks/useAdminCheck';

interface NavSidebarProps {
  theme: ThemeConfig;
  isFocusMode: boolean;
  onFocusModeChange: (enabled: boolean) => void;
  showTriadMode: boolean;
  onTriadModeChange: (enabled: boolean) => void;
  overlappingChordsEnabled: boolean;
  onOverlappingChordsChange: (enabled: boolean) => void;
  showIndividualNotes?: boolean;
  onIndividualNotesChange?: (enabled: boolean) => void;
  noteDetectorEnabled: boolean;
  onNoteDetectorEnabledChange: (enabled: boolean) => void;
  isDetecting: boolean;
  onStartDetection?: () => void;
  onStopDetection?: () => void;
  onShowGuide: () => void;
  onLogout: () => void;
  isExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

function NavToggleRow({
  label, isOn, onToggle, icon, disabled, indented,
}: {
  label: string; isOn: boolean; onToggle: () => void;
  icon?: React.ReactNode; disabled?: boolean; indented?: boolean;
}) {
  return (
    <div
      onClick={disabled ? undefined : onToggle}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: `0 16px 0 ${indented ? '28px' : '16px'}`,
        height: 44, cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1, userSelect: 'none',
        transition: 'background var(--mi-transition-fast)',
      }}
      onMouseEnter={(e) => { if (!disabled) (e.currentTarget as HTMLDivElement).style.background = 'var(--mi-bg-elevated)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {icon && <span style={{ color: isOn ? 'var(--mi-accent-blue)' : 'var(--mi-text-secondary)', width: 16, display: 'flex', alignItems: 'center' }}>{icon}</span>}
        <span style={{ fontSize: 14, fontWeight: 500, color: isOn ? 'var(--mi-text-primary)' : '#c0c0d8' }}>{label}</span>
      </div>
      <div style={{
        width: 40, height: 22, borderRadius: 11, flexShrink: 0, position: 'relative',
        background: isOn ? 'var(--mi-accent-blue)' : 'var(--mi-bg-elevated)',
        border: `1px solid ${isOn ? 'var(--mi-accent-blue)' : 'var(--mi-border-medium)'}`,
        transition: 'background 0.18s ease, border-color 0.18s ease',
      }}>
        <div style={{
          position: 'absolute', top: 2, left: isOn ? 20 : 2,
          width: 16, height: 16, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.30)',
          transition: 'left 0.18s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}

function SectionDivider() {
  return <div style={{ height: 1, background: 'var(--mi-border-subtle)', margin: '8px 12px' }} />;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      padding: '16px 16px 6px', fontSize: 11, fontWeight: 600,
      letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--mi-text-muted)',
    }}>{children}</div>
  );
}

export default function NavSidebar({
  theme, isFocusMode, onFocusModeChange, showTriadMode, onTriadModeChange,
  overlappingChordsEnabled, onOverlappingChordsChange, showIndividualNotes,
  onIndividualNotesChange, noteDetectorEnabled, onNoteDetectorEnabledChange,
  isDetecting, onStartDetection, onStopDetection, onShowGuide, onLogout,
  isExpanded: externalExpanded, onExpandedChange,
}: NavSidebarProps) {
  const pathname = usePathname();
  const { isAdmin } = useAdminCheck();
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;

  const setExpanded = (v: boolean) => {
    setInternalExpanded(v);
    onExpandedChange?.(v);
  };

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navItems = [
    { href: '/', icon: <Home size={18} />, label: 'Home / Visualizer' },
    { href: '/chord-progression-builder', icon: <Music size={18} />, label: 'Song Builder' },
    { href: '/learn/fretboard', icon: <BookOpen size={18} />, label: 'Learn Fretboard' },
  ];

  const railItem = (icon: React.ReactNode, label: string, onClick?: () => void, href?: string, active?: boolean, glowing?: boolean) => {
    const style: React.CSSProperties = {
      width: 44, height: 44, borderRadius: 'var(--mi-radius-md)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: active || glowing ? 'var(--mi-accent-blue)' : 'var(--mi-text-secondary)',
      background: active ? 'var(--mi-accent-blue-dim)' : 'transparent',
      cursor: 'pointer', position: 'relative',
      boxShadow: glowing ? '0 0 10px var(--mi-accent-blue-glow)' : 'none',
      transition: 'background var(--mi-transition-fast), color var(--mi-transition-fast)',
      border: 'none', flexShrink: 0,
    };
    const content = (
      <span style={style}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = active ? 'var(--mi-accent-blue-dim)' : 'var(--mi-bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--mi-text-primary)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = active ? 'var(--mi-accent-blue-dim)' : 'transparent'; (e.currentTarget as HTMLElement).style.color = active || glowing ? 'var(--mi-accent-blue)' : 'var(--mi-text-secondary)'; }}
        onClick={onClick} title={label}
      >{icon}</span>
    );
    if (href) return <Link key={href} href={href} style={{ textDecoration: 'none' }}>{content}</Link>;
    return <span key={label} style={{ display: 'block' }}>{content}</span>;
  };

  const expandedNavRow = (icon: React.ReactNode, label: string, href?: string, onClick?: () => void, active?: boolean) => {
    const style: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '0 16px', height: 44, fontSize: 14, fontWeight: 500,
      color: active ? 'var(--mi-text-primary)' : '#c0c0d8',
      background: active ? 'var(--mi-accent-blue-dim)' : 'transparent',
      borderLeft: active ? '3px solid var(--mi-accent-blue)' : '3px solid transparent',
      cursor: 'pointer', textDecoration: 'none',
      transition: 'background var(--mi-transition-fast), color var(--mi-transition-fast)',
    };
    const inner = <><span style={{ color: active ? 'var(--mi-accent-blue)' : 'var(--mi-text-secondary)', display: 'flex', alignItems: 'center' }}>{icon}</span>{label}</>;
    if (href) return (
      <Link key={href} href={href} style={style}
        onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--mi-bg-elevated)'; (e.currentTarget as HTMLElement).style.color = 'var(--mi-text-primary)'; }}}
        onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#c0c0d8'; }}}
      >{inner}</Link>
    );
    return (
      <div key={label} style={style} onClick={onClick}
        onMouseEnter={(e) => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = 'var(--mi-bg-elevated)'; (e.currentTarget as HTMLDivElement).style.color = 'var(--mi-text-primary)'; }}}
        onMouseLeave={(e) => { if (!active) { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; (e.currentTarget as HTMLDivElement).style.color = '#c0c0d8'; }}}
      >{inner}</div>
    );
  };

  const panelContent = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
      <SectionLabel>Navigate</SectionLabel>
      {navItems.map(item => expandedNavRow(item.icon, item.label, item.href, undefined, isActive(item.href)))}
      <SectionDivider />
      <SectionLabel>View Mode</SectionLabel>
      <NavToggleRow label="Triads & CAGED" isOn={showTriadMode} onToggle={() => { if (showTriadMode && overlappingChordsEnabled) onOverlappingChordsChange(false); onTriadModeChange(!showTriadMode); }} icon={<Triangle size={14} />} />
      {showTriadMode && <NavToggleRow label="Overlapping Chords" isOn={overlappingChordsEnabled} onToggle={() => onOverlappingChordsChange(!overlappingChordsEnabled)} icon={<Layers size={14} />} indented />}
      {!showTriadMode && onIndividualNotesChange && <NavToggleRow label="Individual Notes" isOn={!!showIndividualNotes} onToggle={() => onIndividualNotesChange(!showIndividualNotes)} />}
      <SectionDivider />
      <SectionLabel>Audio</SectionLabel>
      {onStartDetection && onStopDetection && <NavToggleRow label="Key Detection" isOn={isDetecting} onToggle={() => isDetecting ? onStopDetection?.() : onStartDetection?.()} icon={<Volume2 size={14} />} />}
      <NavToggleRow label="Note Detector" isOn={noteDetectorEnabled} onToggle={() => onNoteDetectorEnabledChange(!noteDetectorEnabled)} icon={<Mic size={14} />} />
      <SectionDivider />
      <SectionLabel>Tools</SectionLabel>
      {expandedNavRow(<HelpCircle size={18} />, 'Tutorial Guide', undefined, () => { onShowGuide(); setExpanded(false); setMobileOpen(false); })}
      <NavToggleRow label="Focus Mode" isOn={isFocusMode} onToggle={() => onFocusModeChange(!isFocusMode)} icon={isFocusMode ? <EyeOff size={14} /> : <Eye size={14} />} />
      <SectionDivider />
      <SectionLabel>Account</SectionLabel>
      {expandedNavRow(<CreditCard size={18} />, 'Manage Subscription', '/subscription/manage')}
      {isAdmin && expandedNavRow(<Shield size={18} />, 'Admin Dashboard', '/admin/dashboard')}
      <div onClick={() => { onLogout(); }}
        style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', height: 44, fontSize: 14, fontWeight: 500, color: 'var(--mi-accent-red)', cursor: 'pointer', transition: 'background var(--mi-transition-fast)' }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--mi-bg-elevated)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
      >
        <LogOut size={18} /> Logout
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Icon Rail */}
      <div style={{
        position: 'fixed', left: 0, top: 64, width: 52, height: 'calc(100vh - 64px)',
        background: 'var(--mi-bg-surface)', borderRight: '1px solid var(--mi-border-subtle)',
        zIndex: 'var(--mi-z-nav-rail)' as any, display: 'flex', flexDirection: 'column',
        alignItems: 'center', padding: '8px 0', gap: 2,
      }} className="hidden md:flex">
        <button onClick={() => setExpanded(!isExpanded)} style={{
          width: 44, height: 44, borderRadius: 'var(--mi-radius-md)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', background: 'transparent',
          color: 'var(--mi-text-secondary)', cursor: 'pointer', border: 'none',
          transition: 'background var(--mi-transition-fast), color var(--mi-transition-fast)',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-elevated)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-accent-blue)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-secondary)'; }}
          title={isExpanded ? 'Collapse navigation' : 'Expand navigation'}
        >
          {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
        <div style={{ height: 1, background: 'var(--mi-border-subtle)', width: 36, margin: '2px 0' }} />
        {navItems.map(item => railItem(item.icon, item.label, undefined, item.href, isActive(item.href)))}
        <div style={{ height: 1, background: 'var(--mi-border-subtle)', width: 36, margin: '2px 0' }} />
        {railItem(<Triangle size={18} />, 'Triads & CAGED', () => { onTriadModeChange(!showTriadMode); }, undefined, showTriadMode, showTriadMode)}
        <div style={{ height: 1, background: 'var(--mi-border-subtle)', width: 36, margin: '2px 0' }} />
        {railItem(<HelpCircle size={18} />, 'Tutorial Guide', onShowGuide)}
        {railItem(isFocusMode ? <EyeOff size={18} /> : <Eye size={18} />, 'Focus Mode', () => onFocusModeChange(!isFocusMode), undefined, isFocusMode)}
        <div style={{ flex: 1 }} />
        {railItem(<LogOut size={18} />, 'Logout', onLogout)}
      </div>

      {/* Desktop Expanded Panel */}
      <div style={{
        position: 'fixed', left: 52, top: 64, width: 256, height: 'calc(100vh - 64px)',
        background: 'var(--mi-bg-surface)', borderRight: '1px solid var(--mi-border-medium)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.4)',
        zIndex: 'var(--mi-z-nav-panel)' as any,
        transform: isExpanded ? 'translateX(0)' : 'translateX(-256px)',
        transition: 'transform var(--mi-transition-slide)',
        overflow: 'hidden',
      }} className="hidden md:block">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 12px 0' }}>
          <button onClick={() => setExpanded(false)} style={{ width: 28, height: 28, borderRadius: 'var(--mi-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', color: 'var(--mi-text-muted)', cursor: 'pointer' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--mi-bg-elevated)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-primary)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--mi-text-muted)'; }}
          ><X size={14} /></button>
        </div>
        {panelContent}
      </div>

      {/* Mobile Hamburger Button (rendered externally in header, but backdrop here) */}
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 49, backdropFilter: 'blur(2px)',
        }} className="md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Slide-over Panel */}
      <div style={{
        position: 'fixed', left: 0, top: 0, width: '100vw', maxWidth: 320, height: '100vh',
        background: 'var(--mi-bg-surface)', borderRight: '1px solid var(--mi-border-medium)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform var(--mi-transition-slide)',
        overflow: 'hidden',
      }} className="md:hidden">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 16px 8px', borderBottom: '1px solid var(--mi-border-subtle)' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--mi-text-secondary)' }}>Navigation</span>
          <button onClick={() => setMobileOpen(false)} style={{ width: 32, height: 32, borderRadius: 'var(--mi-radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', color: 'var(--mi-text-secondary)', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
        {panelContent}
      </div>
    </>
  );
}

/* Export mobile toggle trigger so Header can use it */
export function NavMobileButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: 'var(--mi-radius-md)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', background: 'transparent',
      border: '1px solid var(--mi-border-medium)', color: 'var(--mi-text-secondary)', cursor: 'pointer',
    }} className="md:hidden">
      <Menu size={20} />
    </button>
  );
}
