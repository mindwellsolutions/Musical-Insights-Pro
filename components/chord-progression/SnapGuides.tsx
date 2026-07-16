'use client';

/**
 * Visual snap guides that appear during drag operations
 */

interface SnapGuidesProps {
  snapPosition: number | null;
  height: number;
}

export default function SnapGuides({ snapPosition, height }: SnapGuidesProps) {
  if (snapPosition === null) return null;

  return (
    <div
      className="absolute top-0 pointer-events-none transition-opacity duration-150"
      style={{
        left: snapPosition,
        height,
        width: 2,
        background: 'linear-gradient(180deg, #3b82f6 0%, rgba(59, 130, 246, 0.3) 100%)',
        boxShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
        zIndex: 'var(--cpb-z-time-ruler)',
        opacity: 0.8,
      }}
    >
      {/* Top indicator */}
      <div
        className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#3b82f6]"
        style={{
          boxShadow: '0 0 6px rgba(59, 130, 246, 0.8)',
        }}
      />
    </div>
  );
}

