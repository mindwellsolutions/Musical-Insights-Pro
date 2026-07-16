/**
 * Learn Fretboard - Main Hub Page
 * Entry point for the fretboard learning system
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TRAINING_METHODS } from '@/lib/fretboard-learning/constants';
import { TrainingMethod } from '@/lib/fretboard-learning/types';
import { getGlobalStats, loadProgress } from '@/lib/fretboard-learning/progress-tracker';

export default function LearnFretboardPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<TrainingMethod | null>(null);
  const [globalStats, setGlobalStats] = useState({
    totalSessions: 0,
    averageAccuracy: 0,
    longestStreak: 0,
    totalTimeSpent: 0,
  });

  // Load global stats on mount
  useEffect(() => {
    const stats = getGlobalStats();
    setGlobalStats(stats);
  }, []);

  const handleMethodSelect = (method: TrainingMethod) => {
    router.push(`/learn/fretboard/${method.slug}`);
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'Beginner':
        return '#10b981'; // Green
      case 'Beginner-Intermediate':
        return '#3b82f6'; // Blue
      case 'Intermediate':
        return '#f59e0b'; // Orange
      case 'Advanced':
        return '#ef4444'; // Red
      default:
        return '#6b7280'; // Gray
    }
  };

  const getEffectivenessColor = (rating: number): string => {
    if (rating >= 9) return '#10b981'; // Green
    if (rating >= 8) return '#3b82f6'; // Blue
    if (rating >= 7) return '#f59e0b'; // Orange
    return '#6b7280'; // Gray
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--mi-bg-void)', color: 'var(--mi-text-primary)', position: 'relative' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid var(--mi-border-subtle)', background: 'var(--mi-bg-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Image src="/images/logo-whitetext.png" width={130} height={30} alt="Musical Insights" style={{ objectFit: 'contain' }} />
          <div style={{ width: 1, height: 28, background: 'var(--mi-border-medium)' }} />
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: 'var(--mi-text-primary)', margin: 0 }}>Learn Fretboard Notes</h1>
            <p style={{ fontSize: 12, color: 'var(--mi-text-muted)', margin: 0 }}>Master the guitar fretboard with 7 proven training methods</p>
          </div>
        </div>
        <button
          onClick={() => router.push('/')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 'var(--mi-radius-sm)', background: 'var(--mi-bg-elevated)', border: '1px solid var(--mi-border-medium)', fontSize: 13, fontWeight: 500, color: 'var(--mi-text-secondary)', cursor: 'pointer' }}
        >
          <ChevronLeft size={14} /> Back to App
        </button>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 32px' }}>
        {/* Introduction */}
        <div style={{ textAlign: 'center', marginBottom: 48, maxWidth: 640, margin: '0 auto 48px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--mi-text-primary)', marginBottom: 12 }}>Choose Your Learning Method</h2>
          <p style={{ fontSize: 14, color: 'var(--mi-text-secondary)', lineHeight: 1.7 }}>
            Each method offers a unique approach to learning the fretboard. Start with beginner methods and progress to advanced techniques.
          </p>
        </div>

        {/* Quick Stats Row */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 40, flexWrap: 'wrap' }}>
          {[
            { label: 'Total Sessions', value: globalStats.totalSessions, color: 'var(--mi-accent-violet)' },
            { label: 'Avg Accuracy', value: `${Math.round(globalStats.averageAccuracy)}%`, color: 'var(--mi-accent-blue)' },
            { label: 'Best Streak', value: globalStats.longestStreak, color: 'var(--mi-accent-green)' },
          ].map((stat) => (
            <div key={stat.label} style={{ width: 160, padding: '20px 24px', borderRadius: 'var(--mi-radius-lg)', background: 'var(--mi-bg-surface)', border: '1px solid var(--mi-border-medium)', textAlign: 'center' }}>
              <div style={{ fontSize: 30, fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
              <div style={{ fontSize: 12, color: 'var(--mi-text-muted)', marginTop: 6 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Method Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {TRAINING_METHODS.map((method) => {
            const progress = loadProgress(method.id);
            const progressPercent = progress ? Math.min(100, (progress.completedSessions / 12) * 100) : 0;

            return (
              <div
                key={method.id}
                onClick={() => handleMethodSelect(method)}
                style={{
                  position: 'relative', padding: 24,
                  borderRadius: 'var(--mi-radius-xl)',
                  background: 'var(--mi-bg-surface)',
                  border: '1px solid var(--mi-border-medium)',
                  cursor: 'pointer', transition: 'all 0.18s ease',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid var(--mi-accent-violet)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(139,92,246,0.15)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.border = '1px solid var(--mi-border-medium)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                {/* Effectiveness Badge */}
                <div style={{ position: 'absolute', top: 16, right: 16, padding: '3px 10px', borderRadius: 'var(--mi-radius-full)', fontSize: 11, fontWeight: 700, background: getEffectivenessColor(method.effectiveness), color: '#fff' }}>
                  ⭐ {method.effectiveness}/10
                </div>

                {/* Method Name + Difficulty */}
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--mi-text-primary)', margin: '0 0 8px', paddingRight: 72 }}>{method.name}</h3>
                  <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--mi-radius-full)', fontSize: 11, fontWeight: 600, background: getDifficultyColor(method.difficulty), color: '#fff' }}>
                    {method.difficulty}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: 13, color: 'var(--mi-text-secondary)', lineHeight: 1.6, margin: 0 }}>{method.description}</p>

                {/* Sessions Info */}
                <div style={{ fontSize: 12, color: 'var(--mi-text-muted)' }}>📅 {method.sessions}</div>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--mi-text-muted)', marginBottom: 5 }}>
                    <span>Progress</span><span>{Math.round(progressPercent)}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--mi-bg-elevated)', borderRadius: 'var(--mi-radius-full)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(90deg, var(--mi-accent-violet), var(--mi-accent-blue))', transition: 'width 0.4s ease' }} />
                  </div>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                  <button
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 24px', borderRadius: 'var(--mi-radius-md)', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer' }}
                    onClick={(e) => { e.stopPropagation(); handleMethodSelect(method); }}
                  >
                    Start Training <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

