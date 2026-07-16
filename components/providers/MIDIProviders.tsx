'use client';

/**
 * MIDI Providers Wrapper
 * Client-side wrapper for MIDI-related providers
 */

import { ReactNode } from 'react';
import { MIDIProvider } from '@react-midi/hooks';
import { MIDIContextProvider } from '@/components/midi/MIDIContext';
import { Toaster } from 'sonner';

interface MIDIProvidersProps {
  children: ReactNode;
}

export function MIDIProviders({ children }: MIDIProvidersProps) {
  return (
    <MIDIProvider>
      <MIDIContextProvider>
        {children}
        <Toaster position="top-right" />
      </MIDIContextProvider>
    </MIDIProvider>
  );
}

