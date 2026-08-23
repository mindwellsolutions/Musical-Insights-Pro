'use client';

/**
 * MIDI Providers Wrapper
 * Client-side wrapper for MIDI-related providers.
 *
 * MIDIProvider (from @react-midi/hooks) calls requestMIDIAccess internally
 * and provides reactive inputs via useMIDIInputs — this is the proven working
 * approach from the reference project. MIDIContextProvider wraps inside it so
 * it can call useMIDIInputs for device enumeration while still wiring its own
 * onmidimessage listeners to support Program Change messages.
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

