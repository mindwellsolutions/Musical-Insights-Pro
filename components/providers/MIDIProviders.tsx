'use client';

/**
 * MIDI Providers Wrapper
 * Client-side wrapper for MIDI-related providers
 */

import { ReactNode } from 'react';
import { MIDIContextProvider } from '@/components/midi/MIDIContext';
import { Toaster } from 'sonner';

interface MIDIProvidersProps {
  children: ReactNode;
}

export function MIDIProviders({ children }: MIDIProvidersProps) {
  return (
    <MIDIContextProvider>
      {children}
      <Toaster position="top-right" />
    </MIDIContextProvider>
  );
}

