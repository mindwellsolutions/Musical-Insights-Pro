'use client';

import React from 'react';
import { ThemeConfig } from '@/lib/themes';

interface GuitarTunerProps {
  theme: ThemeConfig;
  frequency: number | null;
  note: string | null;
}

// Standard guitar tuning frequencies (E2, A2, D3, G3, B3, E4)
const STANDARD_FREQUENCIES: { [key: string]: number } = {
  'E': 82.41,   // E2
  'A': 110.00,  // A2
  'D': 146.83,  // D3
  'G': 196.00,  // G3
  'B': 246.94,  // B3
  'E4': 329.63, // E4 (high E)
};

// Calculate frequency for any note
const getNoteFrequency = (note: string): number => {
  const noteFrequencies: { [key: string]: number } = {
    'C': 261.63, 'C#': 277.18, 'Db': 277.18,
    'D': 293.66, 'D#': 311.13, 'Eb': 311.13,
    'E': 329.63, 
    'F': 349.23, 'F#': 369.99, 'Gb': 369.99,
    'G': 392.00, 'G#': 415.30, 'Ab': 415.30,
    'A': 440.00, 'A#': 466.16, 'Bb': 466.16,
    'B': 493.88,
  };
  
  // Handle octave variations
  const baseNote = note.replace(/[0-9]/g, '');
  return noteFrequencies[baseNote] || 440.00;
};

// Calculate cents deviation from target frequency
const calculateCents = (frequency: number, targetFrequency: number): number => {
  return Math.floor(1200 * Math.log2(frequency / targetFrequency));
};

export default function GuitarTuner({ theme, frequency, note }: GuitarTunerProps) {
  // Calculate tuning status
  const targetFrequency = note ? getNoteFrequency(note) : 440;
  const cents = frequency ? calculateCents(frequency, targetFrequency) : 0;
  const isTuned = Math.abs(cents) <= 5; // Within ±5 cents is considered in tune
  
  // Calculate needle rotation (-50 to +50 cents maps to -90deg to +90deg)
  const needleRotation = Math.max(-90, Math.min(90, (cents / 50) * 90));
  
  // Determine status color
  const getStatusColor = () => {
    if (!frequency || !note) return '#64748b'; // Gray when no input
    if (isTuned) return '#06b6d4'; // Cyan when in tune
    if (cents < 0) return '#06b6d4'; // Cyan for flat
    return '#ec4899'; // Pink for sharp
  };
  
  const statusColor = getStatusColor();
  
  // Create gauge tick marks
  const createTicks = () => {
    const ticks = [];
    const totalTicks = 60;
    for (let i = 0; i <= totalTicks; i++) {
      const angle = -135 + (i / totalTicks) * 270; // -135deg to +135deg
      const isMainTick = i % 10 === 0;
      const tickLength = isMainTick ? 12 : 6;
      const tickWidth = isMainTick ? 2 : 1;
      
      ticks.push(
        <line
          key={i}
          x1="0"
          y1="-85"
          x2="0"
          y2={-85 + tickLength}
          stroke={statusColor}
          strokeWidth={tickWidth}
          transform={`rotate(${angle})`}
          opacity={0.6}
        />
      );
    }
    return ticks;
  };

  return (
    <div className="flex flex-col items-center justify-center p-6">
      {/* SVG Gauge */}
      <svg width="280" height="200" viewBox="0 0 280 200" className="mb-4">
        <defs>
          {/* Gradient for the arc */}
          <linearGradient id="arcGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        <g transform="translate(140, 140)">
          {/* Outer arc background */}
          <circle
            cx="0"
            cy="0"
            r="95"
            fill="none"
            stroke={theme.border}
            strokeWidth="2"
            opacity="0.3"
          />
          
          {/* Main colored arc */}
          <path
            d="M -67,-67 A 95,95 0 1,1 67,-67"
            fill="none"
            stroke="url(#arcGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            opacity="0.8"
          />
          
          {/* Tick marks */}
          {createTicks()}
          
          {/* Center circle */}
          <circle
            cx="0"
            cy="0"
            r="70"
            fill={theme.bgTertiary}
            stroke={statusColor}
            strokeWidth="3"
            opacity="0.9"
          />

          {/* Inner glow circle when in tune */}
          {isTuned && (
            <circle
              cx="0"
              cy="0"
              r="70"
              fill="none"
              stroke={statusColor}
              strokeWidth="6"
              opacity="0.4"
              filter="url(#glow)"
            />
          )}

          {/* Needle */}
          <g transform={`rotate(${needleRotation})`}>
            <polygon
              points="0,-60 -2,-10 2,-10"
              fill={statusColor}
              filter="url(#glow)"
            />
            <circle
              cx="0"
              cy="0"
              r="5"
              fill={statusColor}
            />
          </g>

          {/* FLAT label */}
          <text
            x="-55"
            y="25"
            fill="#06b6d4"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            opacity="0.8"
          >
            FLAT
          </text>

          {/* SHARP label */}
          <text
            x="55"
            y="25"
            fill="#ec4899"
            fontSize="12"
            fontWeight="600"
            textAnchor="middle"
            opacity="0.8"
          >
            SHARP
          </text>
        </g>
      </svg>

      {/* Status Text */}
      <div className="text-center mb-4">
        <div
          className="text-xs font-semibold tracking-wider mb-2"
          style={{ color: statusColor }}
        >
          {isTuned ? 'IN TUNE' : cents < 0 ? 'FLAT' : cents > 0 ? 'SHARP' : 'PLAY A NOTE'}
        </div>

        {/* Note Display */}
        <div
          className="text-6xl font-bold mb-2"
          style={{
            color: statusColor,
            textShadow: isTuned ? `0 0 20px ${statusColor}` : 'none',
          }}
        >
          {note || '-'}
        </div>

        {/* Frequency Display */}
        <div
          className="text-xl font-medium"
          style={{ color: theme.textSecondary }}
        >
          {frequency ? `${frequency.toFixed(1)} Hz` : '- Hz'}
        </div>

        {/* Cents Display */}
        {frequency && note && (
          <div
            className="text-sm font-medium mt-2"
            style={{ color: theme.textSecondary }}
          >
            {cents > 0 ? '+' : ''}{cents} cents
          </div>
        )}
      </div>
    </div>
  );
}

