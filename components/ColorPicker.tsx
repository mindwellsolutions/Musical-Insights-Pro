'use client';

import { useState, useRef, useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';

interface ColorOption {
  name: string;
  value: string;
}

interface ColorPickerProps {
  colors: ColorOption[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  disabledColor?: string;
  theme: ThemeConfig;
  disabled?: boolean;
  compact?: boolean;
}

export default function ColorPicker({ colors, selectedColor, onColorChange, disabledColor, theme, disabled = false, compact = false }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedColorName = colors.find(c => c.value === selectedColor)?.name || 'Select';

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`rounded-lg font-medium flex items-center gap-2 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'}`}
        style={{
          background: disabled ? theme.bgSecondary : theme.bgTertiary,
          color: disabled ? theme.textSecondary : theme.textPrimary,
          border: `2px solid ${theme.border}`,
          minWidth: compact ? '120px' : '160px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        <div
          style={{
            width: compact ? '16px' : '24px',
            height: compact ? '16px' : '24px',
            borderRadius: '50%',
            backgroundColor: selectedColor,
            border: '2px solid rgba(255,255,255,0.3)',
            flexShrink: 0,
          }}
        />
        <span className="flex-1 text-left">{selectedColorName}</span>
        <svg
          width={compact ? '10' : '12'}
          height={compact ? '10' : '12'}
          viewBox="0 0 12 12"
          fill="none"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        >
          <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 rounded-lg shadow-lg overflow-hidden"
          style={{
            background: theme.bgTertiary,
            border: `2px solid ${theme.border}`,
            minWidth: '160px',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {colors.map((color) => {
            const isDisabled = disabledColor === color.value;
            return (
              <button
                key={color.value}
                onClick={() => {
                  if (!isDisabled) {
                    onColorChange(color.value);
                    setIsOpen(false);
                  }
                }}
                disabled={isDisabled}
                className="w-full px-3 py-2 flex items-center gap-3 transition-colors"
                style={{
                  background: selectedColor === color.value ? theme.bgSecondary : 'transparent',
                  color: isDisabled ? theme.textSecondary : theme.textPrimary,
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  opacity: isDisabled ? 0.5 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) {
                    e.currentTarget.style.background = theme.bgSecondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedColor !== color.value) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: color.value,
                    border: '2px solid rgba(255,255,255,0.3)',
                    flexShrink: 0,
                  }}
                />
                <span className="text-sm font-medium">{color.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
