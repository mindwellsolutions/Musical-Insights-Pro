'use client';

import { useEffect, useRef } from 'react';

interface PlaybackCursorProps {
  position: number;  // Position in pixels
  height: number;
  isPlaying: boolean;
}

/**
 * Smooth playback cursor with no CSS transitions
 * Uses direct DOM manipulation for 60fps updates
 */
export default function PlaybackCursor({ position, height, isPlaying }: PlaybackCursorProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const lastPositionRef = useRef(0);

  useEffect(() => {
    if (!cursorRef.current) return;

    // Direct DOM manipulation - bypasses React rendering
    // This ensures smooth 60fps updates without re-renders
    const element = cursorRef.current;

    // Use transform instead of left for better performance
    // GPU-accelerated, no layout recalculation
    element.style.transform = `translateX(${position}px)`;

    lastPositionRef.current = position;
  }, [position]);

  return (
    <div
      ref={cursorRef}
      className="absolute top-0 pointer-events-none playback-cursor-container"
      style={{
        left: 0,  // Always at 0, we use transform for positioning
        height,
        width: 2,
        zIndex: 'var(--cpb-z-playback-cursor)',
        willChange: 'transform',  // Hint to browser for optimization
      }}
    >
      {/* Main cursor line with gradient */}
      <div
        className="w-full h-full relative"
        style={{
          background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)',
          boxShadow: isPlaying
            ? '0 0 10px rgba(59, 130, 246, 0.6), 0 0 20px rgba(59, 130, 246, 0.3)'
            : '0 0 5px rgba(59, 130, 246, 0.4)',
        }}
      >
        {/* Triangle indicator at top */}
        <div
          className="absolute -top-2 left-1/2 -translate-x-1/2"
          style={{
            width: 0,
            height: 0,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #3b82f6',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))',
          }}
        />
      </div>

      {/* Pulse animation only when playing */}
      {isPlaying && (
        <style jsx>{`
          @keyframes pulse-glow {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
          .playback-cursor-container {
            animation: pulse-glow 1s ease-in-out infinite;
          }
        `}</style>
      )}
    </div>
  );
}

