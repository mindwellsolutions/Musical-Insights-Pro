/**
 * Progress Tracking System
 * Manages user progress, spaced repetition, and analytics
 */

import { UserProgress, SessionStats, SpacedRepetitionItem } from './types';
import { updateProficiencyScore, calculateSelectionProbability } from './utils';

const STORAGE_PREFIX = 'fretboard_learning_';

/**
 * Save user progress to localStorage
 */
export function saveProgress(methodId: string, progress: UserProgress): void {
  if (typeof window === 'undefined') return; // SSR guard

  try {
    const key = `${STORAGE_PREFIX}progress_${methodId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  } catch (error) {
    console.error('Failed to save progress:', error);
  }
}

/**
 * Load user progress from localStorage
 */
export function loadProgress(methodId: string): UserProgress | null {
  if (typeof window === 'undefined') return null; // SSR guard

  try {
    const key = `${STORAGE_PREFIX}progress_${methodId}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    return JSON.parse(data) as UserProgress;
  } catch (error) {
    console.error('Failed to load progress:', error);
    return null;
  }
}

/**
 * Initialize progress for a new method
 */
export function initializeProgress(methodId: string): UserProgress {
  return {
    methodId,
    completedSessions: 0,
    totalAccuracy: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: new Date().toISOString(),
    noteScores: {},
    weakNotes: [],
    totalTimeSpent: 0,
  };
}

/**
 * Update progress after a session
 */
export function updateProgress(
  methodId: string,
  sessionStats: SessionStats
): UserProgress {
  let progress = loadProgress(methodId) || initializeProgress(methodId);

  // Update session count
  progress.completedSessions += 1;

  // Update accuracy
  const sessionAccuracy =
    sessionStats.questionsAttempted > 0
      ? (sessionStats.correctAnswers / sessionStats.questionsAttempted) * 100
      : 0;
  progress.totalAccuracy =
    (progress.totalAccuracy * (progress.completedSessions - 1) + sessionAccuracy) /
    progress.completedSessions;

  // Update streaks
  progress.currentStreak = sessionStats.currentStreak;
  progress.longestStreak = Math.max(progress.longestStreak, sessionStats.longestStreak);

  // Update last session date
  progress.lastSessionDate = new Date().toISOString();

  // Update time spent
  const sessionDuration = sessionStats.endTime
    ? (sessionStats.endTime - sessionStats.startTime) / 1000 / 60
    : 0;
  progress.totalTimeSpent += sessionDuration;

  // Update weak notes
  progress.weakNotes = sessionStats.weakNotes.map((item) => item.note);

  // Save updated progress
  saveProgress(methodId, progress);

  return progress;
}

/**
 * Save spaced repetition items
 */
export function saveSpacedRepetitionItems(
  methodId: string,
  items: SpacedRepetitionItem[]
): void {
  if (typeof window === 'undefined') return; // SSR guard

  try {
    const key = `${STORAGE_PREFIX}sr_${methodId}`;
    localStorage.setItem(key, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save spaced repetition items:', error);
  }
}

/**
 * Load spaced repetition items
 */
export function loadSpacedRepetitionItems(
  methodId: string
): SpacedRepetitionItem[] {
  if (typeof window === 'undefined') return []; // SSR guard

  try {
    const key = `${STORAGE_PREFIX}sr_${methodId}`;
    const data = localStorage.getItem(key);
    if (!data) return [];
    return JSON.parse(data) as SpacedRepetitionItem[];
  } catch (error) {
    console.error('Failed to load spaced repetition items:', error);
    return [];
  }
}

/**
 * Update spaced repetition item after review
 */
export function updateSpacedRepetitionItem(
  item: SpacedRepetitionItem,
  correct: boolean,
  usedHint: boolean = false
): SpacedRepetitionItem {
  const updatedItem = { ...item };

  // Update proficiency score
  updatedItem.proficiencyScore = updateProficiencyScore(
    item.proficiencyScore,
    correct,
    usedHint
  );

  // Update review stats
  updatedItem.lastReviewed = Date.now();
  updatedItem.reviewCount += 1;

  if (correct) {
    updatedItem.correctCount += 1;
  } else {
    updatedItem.incorrectCount += 1;
  }

  return updatedItem;
}

/**
 * Select next item for review using spaced repetition algorithm
 */
export function selectNextReviewItem(
  items: SpacedRepetitionItem[]
): SpacedRepetitionItem | null {
  if (items.length === 0) return null;

  // Calculate selection weights based on proficiency scores
  const weights = items.map((item) =>
    calculateSelectionProbability(item.proficiencyScore)
  );

  // Weighted random selection
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  return items[0];
}

/**
 * Get global statistics across all methods
 */
export function getGlobalStats(): {
  totalSessions: number;
  averageAccuracy: number;
  longestStreak: number;
  totalTimeSpent: number;
} {
  const methodIds = [
    'note-a-day',
    'octave-shapes',
    'caged-system',
    'fretboard-logic',
    'quiz-drills',
    'interval-training',
    'single-string',
  ];

  let totalSessions = 0;
  let totalAccuracy = 0;
  let longestStreak = 0;
  let totalTimeSpent = 0;
  let methodsWithProgress = 0;

  methodIds.forEach((methodId) => {
    const progress = loadProgress(methodId);
    if (progress) {
      totalSessions += progress.completedSessions;
      totalAccuracy += progress.totalAccuracy;
      longestStreak = Math.max(longestStreak, progress.longestStreak);
      totalTimeSpent += progress.totalTimeSpent;
      methodsWithProgress += 1;
    }
  });

  return {
    totalSessions,
    averageAccuracy: methodsWithProgress > 0 ? totalAccuracy / methodsWithProgress : 0,
    longestStreak,
    totalTimeSpent,
  };
}

/**
 * Clear all progress data (for testing or reset)
 */
export function clearAllProgress(): void {
  if (typeof window === 'undefined') return; // SSR guard

  const keys = Object.keys(localStorage).filter((key) =>
    key.startsWith(STORAGE_PREFIX)
  );
  keys.forEach((key) => localStorage.removeItem(key));
}

