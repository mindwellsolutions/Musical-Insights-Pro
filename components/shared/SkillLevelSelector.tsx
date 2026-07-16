'use client';

import React, { useState, useEffect } from 'react';
import { ThemeConfig } from '@/lib/themes';
import { ChevronDown, ChevronUp } from 'lucide-react';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Custom event for skill level changes
 * This allows all skill level selectors to sync immediately
 */
export const SKILL_LEVEL_CHANGE_EVENT = 'skillLevelChange';

export function dispatchSkillLevelChange(level: SkillLevel) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SKILL_LEVEL_CHANGE_EVENT, { detail: level }));
  }
}

interface SkillLevelSelectorProps {
  skillLevel: SkillLevel;
  onSkillLevelChange: (level: SkillLevel) => void;
  theme: ThemeConfig;
  compact?: boolean;
  showLabel?: boolean;
  showDescription?: boolean;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export default function SkillLevelSelector({
  skillLevel,
  onSkillLevelChange,
  theme,
  compact = false,
  showLabel = true,
  showDescription = true,
  collapsible = false,
  defaultExpanded = true,
}: SkillLevelSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleExpanded = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  // Helper function to get button styles consistently
  const getButtonStyle = (level: SkillLevel) => {
    const isSelected = skillLevel === level;
    return {
      background: isSelected ? theme.accentPrimary : 'transparent',
      color: isSelected ? '#ffffff' : theme.textPrimary,
      border: `1px solid ${isSelected ? theme.accentPrimary : theme.border}`,
    };
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={compact ? 'flex flex-col gap-1' : 'flex flex-col gap-2'}>
        {showLabel && (
          <label
            className={`${compact ? 'text-xs' : 'text-xs'} font-semibold uppercase tracking-wide`}
            style={{ color: theme.textSecondary }}
          >
            Skill Level
          </label>
        )}
        <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
          <div className={`flex-1 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg`} />
          <div className={`flex-1 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg`} />
          <div className={`flex-1 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg`} />
        </div>
      </div>
    );
  }

  return (
    <div className={compact ? 'flex flex-col gap-1' : 'flex flex-col gap-2'}>
      {showLabel && (
        <div className="flex items-center justify-between">
          <label
            className={`${compact ? 'text-xs' : 'text-xs'} font-semibold uppercase tracking-wide`}
            style={{ color: theme.textSecondary }}
          >
            Skill Level
          </label>
          {collapsible && (
            <button
              onClick={toggleExpanded}
              className="p-1 rounded hover:bg-opacity-10 hover:bg-white transition-colors"
              aria-label={isExpanded ? 'Collapse skill level' : 'Expand skill level'}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" style={{ color: theme.textSecondary }} />
              ) : (
                <ChevronDown className="w-4 h-4" style={{ color: theme.textSecondary }} />
              )}
            </button>
          )}
        </div>
      )}
      {isExpanded && (
        <>
          <div className={`flex ${compact ? 'gap-1' : 'gap-2'}`}>
            <button
              onClick={() => onSkillLevelChange('beginner')}
              className={`flex-1 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg font-medium transition-all ${
                skillLevel === 'beginner'
                  ? 'shadow-md'
                  : 'hover:bg-opacity-5 hover:bg-white'
              }`}
              style={getButtonStyle('beginner')}
            >
              Beginner
            </button>
            <button
              onClick={() => onSkillLevelChange('intermediate')}
              className={`flex-1 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg font-medium transition-all ${
                skillLevel === 'intermediate'
                  ? 'shadow-md'
                  : 'hover:bg-opacity-5 hover:bg-white'
              }`}
              style={getButtonStyle('intermediate')}
            >
              Intermediate
            </button>
            <button
              onClick={() => onSkillLevelChange('advanced')}
              className={`flex-1 ${compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-lg font-medium transition-all ${
                skillLevel === 'advanced'
                  ? 'shadow-md'
                  : 'hover:bg-opacity-5 hover:bg-white'
              }`}
              style={getButtonStyle('advanced')}
            >
              Advanced
            </button>
          </div>
          {showDescription && !compact && (
            <p className="text-xs" style={{ color: theme.textSecondary }}>
              {skillLevel === 'beginner' && 'Recommends scales with difficulty 1-2'}
              {skillLevel === 'intermediate' && 'Recommends scales with difficulty 1-4'}
              {skillLevel === 'advanced' && 'Recommends scales with difficulty 1-5'}
            </p>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Helper function to get difficulty range for a skill level
 */
export function getDifficultyRange(skillLevel: SkillLevel): { min: number; max: number } {
  switch (skillLevel) {
    case 'beginner':
      return { min: 1, max: 2 };
    case 'intermediate':
      return { min: 1, max: 4 };
    case 'advanced':
      return { min: 1, max: 5 };
  }
}

/**
 * Helper function to check if a difficulty level is within the skill level range
 */
export function isWithinSkillLevel(difficulty: number, skillLevel: SkillLevel): boolean {
  const range = getDifficultyRange(skillLevel);
  return difficulty >= range.min && difficulty <= range.max;
}

