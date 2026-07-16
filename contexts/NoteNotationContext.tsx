'use client';

/**
 * Note Notation Context
 * Manages global preference for displaying notes as sharps (#) or flats (b)
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client-ssr';

export type NoteNotation = 'sharp' | 'flat';

interface NoteNotationContextType {
  notation: NoteNotation;
  setNotation: (notation: NoteNotation) => void;
  toggleNotation: () => void;
}

const NoteNotationContext = createContext<NoteNotationContextType | undefined>(undefined);

interface NoteNotationProviderProps {
  children: ReactNode;
}

export function NoteNotationProvider({ children }: NoteNotationProviderProps) {
  const [notation, setNotationState] = useState<NoteNotation>('flat'); // Default to flat (current behavior)
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClient();

  // Load preference from Supabase or localStorage on mount
  useEffect(() => {
    async function loadPreference() {
      try {
        // Try to load from Supabase first
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('user_settings')
            .select('note_notation')
            .eq('user_id', user.id)
            .single();

          if (!error && data?.note_notation) {
            setNotationState(data.note_notation as NoteNotation);
            setIsInitialized(true);
            return;
          }
        }
      } catch (error) {
        console.warn('Error loading note notation preference from Supabase:', error);
      }

      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('note-notation-preference');
        if (stored === 'sharp' || stored === 'flat') {
          setNotationState(stored);
        }
      } catch (error) {
        console.warn('Error loading note notation preference from localStorage:', error);
      }
      
      setIsInitialized(true);
    }

    loadPreference();
  }, [supabase]);

  // Save preference to both Supabase and localStorage
  const setNotation = async (newNotation: NoteNotation) => {
    setNotationState(newNotation);

    // Save to localStorage immediately
    try {
      localStorage.setItem('note-notation-preference', newNotation);
    } catch (error) {
      console.warn('Error saving note notation preference to localStorage:', error);
    }

    // Save to Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            note_notation: newNotation,
          }, {
            onConflict: 'user_id',
          });
      }
    } catch (error) {
      console.warn('Error saving note notation preference to Supabase:', error);
    }
  };

  const toggleNotation = () => {
    setNotation(notation === 'sharp' ? 'flat' : 'sharp');
  };

  // Always render children to avoid hydration issues
  // The default 'flat' notation will be used until preferences load
  return (
    <NoteNotationContext.Provider value={{ notation, setNotation, toggleNotation }}>
      {children}
    </NoteNotationContext.Provider>
  );
}

export function useNoteNotation() {
  const context = useContext(NoteNotationContext);
  if (context === undefined) {
    throw new Error('useNoteNotation must be used within a NoteNotationProvider');
  }
  return context;
}

