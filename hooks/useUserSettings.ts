/**
 * useUserSettings Hook
 * Manages user settings with Supabase, with debounced saves and optimistic updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client-ssr';
import { UserSettings, DEFAULT_SETTINGS, loadUserSettings, saveUserSettings } from '@/lib/supabase/settings-service';

const DEBOUNCE_DELAY = 1000; // 1 second debounce for saves

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Load user settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          const userSettings = await loadUserSettings(user.id);
          setSettings(userSettings);
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [supabase]);

  // Debounced save function
  const debouncedSave = useCallback((newSettings: Partial<UserSettings>) => {
    if (!userId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserSettings(userId, newSettings);
      } catch (error) {
        console.error('Error saving user settings:', error);
      }
    }, DEBOUNCE_DELAY);
  }, [userId]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K]
  ) => {
    // Optimistic update
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Debounced save
    debouncedSave({ [key]: value });
  }, [debouncedSave]);

  // Update multiple settings at once
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    // Optimistic update
    setSettings(prev => ({ ...prev, ...newSettings }));
    
    // Debounced save
    debouncedSave(newSettings);
  }, [debouncedSave]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    settings,
    loading,
    updateSetting,
    updateSettings,
  };
}

/**
 * Individual setting hooks for backward compatibility with useLocalStorage
 */
export function useUserSetting<T extends keyof UserSettings>(
  key: T,
  defaultValue: UserSettings[T]
): [UserSettings[T], (value: UserSettings[T]) => void] {
  const [value, setValue] = useState<UserSettings[T]>(defaultValue);
  const [userId, setUserId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load setting on mount
  useEffect(() => {
    if (!isClient) return;

    async function loadSetting() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          const settings = await loadUserSettings(user.id);
          setValue(settings[key]);
        }
      } catch (error) {
        console.error(`Error loading setting ${String(key)}:`, error);
      }
    }

    loadSetting();
  }, [key, isClient, supabase]);

  // Update setting with debounced save
  const updateValue = useCallback((newValue: UserSettings[T]) => {
    setValue(newValue);

    if (!userId) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveUserSettings(userId, { [key]: newValue });
      } catch (error) {
        console.error(`Error saving setting ${String(key)}:`, error);
      }
    }, DEBOUNCE_DELAY);
  }, [userId, key]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return [value, updateValue];
}

