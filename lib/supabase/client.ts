/**
 * Supabase Client Configuration
 * Provides authenticated Supabase client for database operations
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-loaded Supabase client (only initialized when needed)
let supabaseInstance: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance
 * Only initializes on client-side with proper environment variables
 */
export function getSupabaseClient(): SupabaseClient | null {
  // Only run on client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Return existing instance if available
  if (supabaseInstance) {
    return supabaseInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
    // Silently return null - database not configured (display-only mode)
    return null;
  }

  // Create and cache the client
  supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseInstance;
}

// Legacy export for backward compatibility (will return null on server)
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null;

// Type definitions for our database tables
export type MusicalKey = {
  id: string;
  key_name: string;
  root_note: string;
  quality: 'major' | 'minor';
  scale_degrees: number[];
  created_at: string;
  updated_at: string;
};

export type ScaleModeCompatibility = {
  id: string;
  musical_key_id: string;
  scale_mode_name: string;
  root_note: string;
  compatibility_rating: number;
  is_primary: boolean;
  chord_tones: string[];
  guide_tones: string[];
  musical_context: string | null;
  scale_intervals: number[];
  created_at: string;
  updated_at: string;
};

export type DetectedKeyHistory = {
  id: string;
  detected_key: string;
  confidence_score: number;
  detected_at: string;
  session_id: string | null;
  audio_source: string | null;
  created_at: string;
};

