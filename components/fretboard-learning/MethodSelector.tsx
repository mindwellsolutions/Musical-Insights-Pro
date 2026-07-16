/**
 * Method Selector Component
 * Displays available training methods with progress indicators
 */

'use client';

import React from 'react';
import { TRAINING_METHODS } from '@/lib/fretboard-learning/constants';
import { TrainingMethod } from '@/lib/fretboard-learning/types';

interface MethodSelectorProps {
  selectedMethodId: string | null;
  onMethodSelect: (method: TrainingMethod) => void;
  compact?: boolean;
}

export default function MethodSelector({
  selectedMethodId,
  onMethodSelect,
  compact = false,
}: MethodSelectorProps) {
  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Beginner':
        return '#10b981';
      case 'Beginner-Intermediate':
        return '#3b82f6';
      case 'Intermediate':
        return '#f59e0b';
      case 'Advanced':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (compact) {
    // Horizontal scrollable pill bar for mobile
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {TRAINING_METHODS.map((method) => (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              selectedMethodId === method.id
                ? 'bg-purple-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {method.name}
          </button>
        ))}
      </div>
    );
  }

  // Desktop sidebar view
  return (
    <div className="w-72 bg-[#1a1a1a] border-r border-gray-800 p-4 space-y-2">
      <h3 className="text-lg font-bold mb-4 text-white">Training Methods</h3>
      {TRAINING_METHODS.map((method) => {
        const isSelected = selectedMethodId === method.id;
        
        return (
          <button
            key={method.id}
            onClick={() => onMethodSelect(method)}
            className={`w-full text-left p-4 rounded-lg transition-all ${
              isSelected
                ? 'bg-purple-600/20 border-2 border-purple-600'
                : 'bg-gray-800/50 border-2 border-transparent hover:bg-gray-800'
            }`}
          >
            {/* Method Name and Effectiveness */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold text-white text-sm mb-1">
                  {method.name}
                </div>
                <div
                  className="inline-block px-2 py-0.5 rounded text-xs font-semibold text-white"
                  style={{ backgroundColor: getDifficultyColor(method.difficulty) }}
                >
                  {method.difficulty}
                </div>
              </div>
              <div className="text-xs font-bold text-yellow-500">
                ⭐ {method.effectiveness}
              </div>
            </div>

            {/* Progress Ring (placeholder) */}
            <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                style={{ width: '0%' }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

