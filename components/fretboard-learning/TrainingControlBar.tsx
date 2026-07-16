/**
 * Training Control Bar Component
 * Shared control bar for all training methods
 */

'use client';

import React from 'react';
import { DifficultyLevel, DIFFICULTY_LEVELS } from '@/lib/fretboard-learning/constants';
import { formatTime } from '@/lib/fretboard-learning/utils';

interface TrainingControlBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onReset: () => void;
  difficulty: DifficultyLevel;
  onDifficultyChange: (difficulty: DifficultyLevel) => void;
  elapsedTime?: number;
  score?: number;
  streak?: number;
  showHints: boolean;
  onToggleHints: () => void;
  onSettings?: () => void;
}

export default function TrainingControlBar({
  isPlaying,
  onPlayPause,
  onReset,
  difficulty,
  onDifficultyChange,
  elapsedTime = 0,
  score = 0,
  streak = 0,
  showHints,
  onToggleHints,
  onSettings,
}: TrainingControlBarProps) {
  return (
    <div className="bg-[#1a1a1a] border-y border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Left: Play Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPlayPause}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
          >
            {isPlaying ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
                Pause
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Start
              </>
            )}
          </button>

          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-semibold flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset
          </button>
        </div>

        {/* Center: Difficulty Selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Difficulty:</span>
          <div className="flex gap-1">
            {DIFFICULTY_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => onDifficultyChange(level)}
                className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
                  difficulty === level
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Stats and Settings */}
        <div className="flex items-center gap-4">
          {/* Timer */}
          {elapsedTime > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-white">{formatTime(elapsedTime)}</span>
            </div>
          )}

          {/* Score */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Score:</span>
            <span className="font-bold text-white">{score}</span>
          </div>

          {/* Streak */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-400">Streak:</span>
            <span className={`font-bold ${streak >= 5 ? 'text-orange-500' : 'text-white'}`}>
              {streak >= 5 && '🔥'} {streak}
            </span>
          </div>

          {/* Hints Toggle */}
          <button
            onClick={onToggleHints}
            className={`px-3 py-1 rounded text-sm font-semibold transition-all ${
              showHints
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            💡 Hints
          </button>

          {/* Settings */}
          {onSettings && (
            <button
              onClick={onSettings}
              className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

