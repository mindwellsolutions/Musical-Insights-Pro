/**
 * Feedback Overlay Component
 * Displays visual feedback for correct/incorrect answers
 */

'use client';

import React, { useEffect, useState } from 'react';
import { FeedbackEvent } from '@/lib/fretboard-learning/types';

interface FeedbackOverlayProps {
  feedback: FeedbackEvent | null;
  onComplete?: () => void;
}

export default function FeedbackOverlay({ feedback, onComplete }: FeedbackOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (feedback) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback, onComplete]);

  if (!feedback || !visible) return null;

  const isCorrect = feedback.type === 'correct';
  const isHint = feedback.type === 'hint';

  return (
    <div className="fixed inset-0 pointer-events-none flex items-center justify-center z-50">
      {/* Confetti particles for correct answers */}
      {isCorrect && (
        <div className="absolute inset-0">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-confetti"
              style={{
                left: '50%',
                top: '50%',
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                animationDelay: `${i * 50}ms`,
                transform: `translate(-50%, -50%) rotate(${i * 36}deg)`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main feedback message */}
      <div
        className={`px-8 py-4 rounded-2xl font-bold text-2xl shadow-2xl transform transition-all duration-300 ${
          isCorrect
            ? 'bg-green-500 text-white scale-110 animate-bounce-once'
            : isHint
            ? 'bg-blue-500 text-white scale-105'
            : 'bg-red-500 text-white animate-shake'
        }`}
      >
        {isCorrect && (
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
            Correct!
          </div>
        )}
        {!isCorrect && !isHint && (
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
            Try Again
          </div>
        )}
        {isHint && (
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            Hint Shown
          </div>
        )}
      </div>

      {/* Score increment animation for correct answers */}
      {isCorrect && (
        <div className="absolute top-1/3 right-1/4 text-4xl font-bold text-green-500 animate-float-up">
          +1
        </div>
      )}
    </div>
  );
}

// Add these animations to your global CSS
const styles = `
@keyframes confetti {
  0% {
    transform: translate(-50%, -50%) rotate(0deg) translateY(0);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) rotate(720deg) translateY(200px);
    opacity: 0;
  }
}

@keyframes bounce-once {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-10px);
  }
  75% {
    transform: translateX(10px);
  }
}

@keyframes float-up {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100px);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti 1s ease-out forwards;
}

.animate-bounce-once {
  animation: bounce-once 0.5s ease-out;
}

.animate-shake {
  animation: shake 0.3s ease-in-out;
}

.animate-float-up {
  animation: float-up 1s ease-out forwards;
}
`;

