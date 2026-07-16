'use client';

import React from 'react';
import { NoteDisplayProps } from '@/types/audio';
import { Card, CardContent } from '@/components/ui/card';
import { Music } from 'lucide-react';

/**
 * NoteDisplay Component
 * Displays the currently detected musical note in a clean, modern interface
 */
export function NoteDisplay({
  note,
  frequency,
  isActive,
  className = '',
}: NoteDisplayProps) {
  /**
   * Get display text based on current state
   */
  const getDisplayText = (): string => {
    if (!isActive) {
      return '--';
    }
    if (note) {
      return note;
    }
    return '--';
  };

  /**
   * Get status text
   */
  const getStatusText = (): string => {
    if (!isActive) {
      return 'Not Active';
    }
    if (note) {
      return 'Detecting';
    }
    return 'Listening...';
  };

  /**
   * Get frequency display
   */
  const getFrequencyDisplay = (): string => {
    if (frequency && isActive) {
      return `${frequency.toFixed(2)} Hz`;
    }
    return '--';
  };

  return (
    <Card className={`${className}`}>
      <CardContent className="p-8">
        <div className="flex flex-col items-center space-y-6">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full transition-colors duration-300 ${
                isActive
                  ? note
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-yellow-500'
                  : 'bg-gray-400'
              }`}
            />
            <span className="text-sm font-medium text-muted-foreground">
              {getStatusText()}
            </span>
          </div>

          {/* Note Display */}
          <div className="relative">
            <div
              className={`flex items-center justify-center w-48 h-48 rounded-full border-4 transition-all duration-300 ${
                isActive && note
                  ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                  : 'border-muted bg-muted/10'
              }`}
            >
              <div className="text-center">
                <div
                  className={`text-7xl font-bold transition-all duration-200 ${
                    isActive && note
                      ? 'text-primary scale-110'
                      : 'text-muted-foreground'
                  }`}
                >
                  {getDisplayText()}
                </div>
              </div>
            </div>

            {/* Music Icon (decorative) */}
            {!isActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Music className="h-16 w-16 text-muted-foreground/20" />
              </div>
            )}
          </div>

          {/* Frequency Display */}
          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Frequency</p>
            <p
              className={`text-2xl font-mono transition-colors duration-300 ${
                isActive && frequency
                  ? 'text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {getFrequencyDisplay()}
            </p>
          </div>

          {/* Info Text */}
          {!isActive && (
            <p className="text-sm text-center text-muted-foreground max-w-md">
              Select an audio input device and click &quot;Start Detection&quot; to begin monitoring your guitar or bass.
            </p>
          )}

          {isActive && !note && (
            <p className="text-sm text-center text-muted-foreground max-w-md">
              Play a note on your guitar or bass to see it detected here.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

