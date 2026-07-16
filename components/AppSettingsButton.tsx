'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Settings } from 'lucide-react';

/**
 * Floating "App Settings" pill button rendered by the root layout on every
 * page except the home page ("/").  On click it stores a flag in
 * sessionStorage so that page.tsx can auto-open the AudioSidebar on arrival.
 */
export default function AppSettingsButton() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide on the home page — AudioSidebar has its own toggle there
  if (pathname === '/') return null;

  function handleClick() {
    sessionStorage.setItem('openAudioSidebar', '1');
    router.push('/');
  }

  return (
    <button
      onClick={handleClick}
      aria-label="Open app settings"
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 45,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 16px',
        height: 36,
        borderRadius: 'var(--mi-radius-full, 9999px)',
        background: 'linear-gradient(135deg, var(--mi-accent-blue, #3b82f6), #2563eb)',
        color: '#fff',
        fontSize: 12,
        fontWeight: 600,
        border: '1px solid var(--mi-border-medium, rgba(255,255,255,0.12))',
        boxShadow: 'var(--mi-shadow-elevated, 0 4px 16px rgba(0,0,0,0.4))',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      <Settings size={14} />
      App Settings
    </button>
  );
}
