/**
 * API Route: Progression Recommendations
 * GET /api/progression-recommendations?key=C&genre=Rock&difficulty=1
 * 
 * Returns common chord progressions for a given key
 * Optional filters: genre, difficulty
 */

import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';
import {
  ProgressionRecommendationsResponse,
  ProgressionRecommendations,
  ChordProgression,
} from '@/lib/progression-analyzer/types';

/**
 * Normalize key name for file path
 * Examples: "A" → "a", "A#" → "a-sharp", "Bb" → "a-sharp", "B" → "b"
 */
function normalizeKeyName(key: string): string {
  const normalized = key.trim().toUpperCase();

  // Map all keys to their normalized file names
  const keyMap: Record<string, string> = {
    'A': 'a',
    'A#': 'a-sharp',
    'BB': 'a-sharp',
    'B': 'b',
    'C': 'c',
    'C#': 'c-sharp',
    'DB': 'c-sharp',
    'D': 'd',
    'D#': 'd-sharp',
    'EB': 'd-sharp',
    'E': 'e',
    'F': 'f',
    'F#': 'f-sharp',
    'GB': 'f-sharp',
    'G': 'g',
    'G#': 'g-sharp',
    'AB': 'g-sharp',
  };

  return keyMap[normalized] || normalized.toLowerCase();
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const key = searchParams.get('key');
    const genre = searchParams.get('genre');
    const difficultyParam = searchParams.get('difficulty');

    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }

    // Normalize key name for file path
    const normalizedKey = normalizeKeyName(key);

    // Load progression recommendations from file system
    const filePath = path.join(
      process.cwd(),
      'public',
      'data',
      'progression-recommendations',
      `${normalizedKey}.json`
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `No progression recommendations found for key: ${key}` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const recommendations: ProgressionRecommendations = JSON.parse(fileContent);

    // Apply filters
    let filteredProgressions: ChordProgression[] = recommendations.progressions;

    if (genre) {
      filteredProgressions = filteredProgressions.filter(p =>
        p.genre.some(g => g.toLowerCase() === genre.toLowerCase())
      );
    }

    if (difficultyParam) {
      const difficulty = parseInt(difficultyParam, 10);
      if (!isNaN(difficulty)) {
        filteredProgressions = filteredProgressions.filter(p => p.difficulty === difficulty);
      }
    }

    const response: ProgressionRecommendationsResponse = {
      key: recommendations.key,
      progressions: filteredProgressions,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in progression-recommendations API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

