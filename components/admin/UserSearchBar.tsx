'use client';

/**
 * User Search Bar Component
 * Real-time search with debouncing
 */

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface UserSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export function UserSearchBar({
  value,
  onChange,
  placeholder = 'Search users by email...',
  isLoading,
}: UserSearchBarProps) {
  const [localValue, setLocalValue] = useState(value);

  // Debounce the search
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(localValue);
    }, 300);

    return () => clearTimeout(timer);
  }, [localValue, onChange]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
      <div style={{ position: 'relative' }}>
        <Search
          size={20}
          style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#a0a0a0',
          }}
        />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          style={{
            width: '100%',
            height: '48px',
            padding: '12px 48px 12px 48px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '14px',
            outline: 'none',
            transition: 'all 200ms ease-in-out',
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {localValue && (
          <button
            onClick={() => setLocalValue('')}
            style={{
              position: 'absolute',
              right: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: '#a0a0a0',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
}

