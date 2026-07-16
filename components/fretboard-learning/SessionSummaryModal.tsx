/**
 * Session Summary Modal Component
 * Displays session results and statistics
 */

'use client';

import React from 'react';
import { SessionStats } from '@/lib/fretboard-learning/types';
import { calculateAccuracy, formatTime } from '@/lib/fretboard-learning/utils';

interface SessionSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: SessionStats | null;
  onContinue?: () => void;
}

export default function SessionSummaryModal({
  isOpen,
  onClose,
  stats,
  onContinue,
}: SessionSummaryModalProps) {
  if (!isOpen || !stats) return null;

  const accuracy = calculateAccuracy(stats.correctAnswers, stats.questionsAttempted);
  const duration = stats.endTime ? (stats.endTime - stats.startTime) / 1000 : 0;

  const getAccuracyColor = (acc: number): string => {
    if (acc >= 90) return '#10b981'; // Green
    if (acc >= 75) return '#3b82f6'; // Blue
    if (acc >= 60) return '#f59e0b'; // Orange
    return '#ef4444'; // Red
  };

  const getPerformanceMessage = (acc: number): string => {
    if (acc >= 90) return 'Excellent! 🎉';
    if (acc >= 75) return 'Great job! 👍';
    if (acc >= 60) return 'Good effort! 💪';
    return 'Keep practicing! 📚';
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Session Complete!</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-400 mt-2">{getPerformanceMessage(accuracy)}</p>
        </div>

        {/* Main Stats */}
        <div className="p-6 space-y-6">
          {/* Accuracy Circle */}
          <div className="flex justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="#374151"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke={getAccuracyColor(accuracy)}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${(accuracy / 100) * 553} 553`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold" style={{ color: getAccuracyColor(accuracy) }}>
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-400 mt-1">Accuracy</div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">{stats.questionsAttempted}</div>
              <div className="text-sm text-gray-400 mt-1">Questions</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-500">{stats.correctAnswers}</div>
              <div className="text-sm text-gray-400 mt-1">Correct</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-500">{stats.incorrectAnswers}</div>
              <div className="text-sm text-gray-400 mt-1">Incorrect</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-orange-500">{stats.longestStreak}</div>
              <div className="text-sm text-gray-400 mt-1">Best Streak</div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
              <span className="text-gray-400">Duration</span>
              <span className="font-bold text-white">{formatTime(Math.floor(duration))}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
              <span className="text-gray-400">Avg Response Time</span>
              <span className="font-bold text-white">
                {(stats.averageResponseTime / 1000).toFixed(1)}s
              </span>
            </div>
            {stats.hintsUsed > 0 && (
              <div className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg">
                <span className="text-gray-400">Hints Used</span>
                <span className="font-bold text-blue-500">{stats.hintsUsed}</span>
              </div>
            )}
          </div>

          {/* Weak Notes */}
          {stats.weakNotes.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <h3 className="font-semibold text-red-400 mb-2">Notes to Practice:</h3>
              <div className="flex flex-wrap gap-2">
                {stats.weakNotes.map((item, index) => (
                  <div
                    key={index}
                    className="px-3 py-1 bg-red-500/20 rounded-full text-sm text-red-300"
                  >
                    {item.note} ({item.missCount} misses)
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-800 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors font-semibold text-white"
          >
            Close
          </button>
          {onContinue && (
            <button
              onClick={onContinue}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              }}
            >
              Continue Training
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

