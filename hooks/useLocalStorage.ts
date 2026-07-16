'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(defaultValue);
  const [isClient, setIsClient] = useState(false);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || isInitializedRef.current) return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsedValue = JSON.parse(item);
        setValue(parsedValue);
      }
      isInitializedRef.current = true;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      isInitializedRef.current = true;
    }
  }, [key, isClient]);

  const setStoredValue = useCallback((newValue: T) => {
    try {
      setValue(newValue);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(newValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key]);

  return [value, setStoredValue];
}