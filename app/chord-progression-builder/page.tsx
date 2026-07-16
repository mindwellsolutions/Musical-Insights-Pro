/**
 * Chord Progression Builder - Main Page
 * A professional timeline-based chord progression builder with audio playback
 */

import { Suspense } from 'react';
import ChordProgressionBuilder from '@/components/chord-progression/ChordProgressionBuilder';
import { ChordProgressionErrorBoundary } from '@/components/chord-progression/ErrorBoundary';

export const metadata = {
  title: 'Song Progression Builder | Musical Insights',
  description: 'Create, edit, and play chord progressions with our professional timeline-based builder',
};

export default function ChordProgressionBuilderPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <ChordProgressionErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <ChordProgressionBuilder />
        </Suspense>
      </ChordProgressionErrorBoundary>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading Song Progression Builder...</p>
      </div>
    </div>
  );
}

