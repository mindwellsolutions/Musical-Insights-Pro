import { useState, useEffect, useCallback } from 'react';
import { SkillLevel } from '@/components/shared/SkillLevelSelector';

// Custom event for skill level changes
const SKILL_LEVEL_CHANGE_EVENT = 'skillLevelChange';

// Storage key
const STORAGE_KEY = 'user-skill-level';

// Default value
const DEFAULT_SKILL_LEVEL: SkillLevel = 'intermediate';

/**
 * Shared skill level hook that synchronizes across all components in real-time
 * When any component changes the skill level, all other components update immediately
 */
export function useSharedSkillLevel() {
  // Initialize from localStorage
  const getStoredValue = useCallback((): SkillLevel => {
    if (typeof window === 'undefined') return DEFAULT_SKILL_LEVEL;
    
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? (JSON.parse(item) as SkillLevel) : DEFAULT_SKILL_LEVEL;
    } catch (error) {
      console.error('Error reading skill level from localStorage:', error);
      return DEFAULT_SKILL_LEVEL;
    }
  }, []);

  const [skillLevel, setSkillLevelState] = useState<SkillLevel>(getStoredValue);

  // Handler for custom events from other components
  useEffect(() => {
    const handleSkillLevelChange = (event: Event) => {
      const customEvent = event as CustomEvent<SkillLevel>;
      setSkillLevelState(customEvent.detail);
    };

    window.addEventListener(SKILL_LEVEL_CHANGE_EVENT, handleSkillLevelChange);

    return () => {
      window.removeEventListener(SKILL_LEVEL_CHANGE_EVENT, handleSkillLevelChange);
    };
  }, []);

  // Handler for storage events from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue) as SkillLevel;
          setSkillLevelState(newValue);
        } catch (error) {
          console.error('Error parsing skill level from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Setter that updates localStorage and dispatches event to all components
  const setSkillLevel = useCallback((newLevel: SkillLevel) => {
    try {
      // Update localStorage
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newLevel));
      
      // Update local state
      setSkillLevelState(newLevel);
      
      // Dispatch custom event to notify all other components immediately
      const event = new CustomEvent(SKILL_LEVEL_CHANGE_EVENT, {
        detail: newLevel,
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Error setting skill level:', error);
    }
  }, []);

  return [skillLevel, setSkillLevel] as const;
}

