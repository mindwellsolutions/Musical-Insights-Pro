'use client';

import { ThemeConfig } from '@/lib/themes';
import { Music, Guitar, ListMusic } from 'lucide-react';

export type RecommendationType = 'scales' | 'chords' | 'progressions';

interface RecommendationTabsProps {
  activeTab: RecommendationType;
  onTabChange: (tab: RecommendationType) => void;
  theme: ThemeConfig;
  counts: {
    scales: number;
    chords: number;
    progressions: number;
  };
}

export default function RecommendationTabs({
  activeTab,
  onTabChange,
  theme,
  counts,
}: RecommendationTabsProps) {
  const tabs: Array<{
    id: RecommendationType;
    label: string;
    icon: typeof Music;
    count: number;
  }> = [
    { id: 'scales', label: 'Scales', icon: Music, count: counts.scales },
    { id: 'chords', label: 'Chords', icon: Guitar, count: counts.chords },
    { id: 'progressions', label: 'Progressions', icon: ListMusic, count: counts.progressions },
  ];

  // Only show tabs that have recommendations
  const visibleTabs = tabs.filter(tab => tab.count > 0);

  // If only one tab has content, don't show tabs
  if (visibleTabs.length <= 1) {
    return null;
  }

  return (
    <div className="mb-4">
      <div
        className="flex gap-2 p-1 rounded-lg"
        style={{
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
        }}
      >
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all"
              style={{
                background: isActive ? theme.accentPrimary : 'transparent',
                color: isActive ? '#ffffff' : theme.textPrimary,
                opacity: isActive ? 1 : 0.7,
              }}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className="px-1.5 py-0.5 rounded-full text-xs font-bold"
                style={{
                  background: isActive ? 'rgba(255, 255, 255, 0.2)' : theme.bgTertiary,
                  color: isActive ? '#ffffff' : theme.textSecondary,
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

