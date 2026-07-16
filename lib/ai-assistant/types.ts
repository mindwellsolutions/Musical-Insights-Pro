/**
 * AI Music Theory Assistant - Type Definitions
 * 
 * This file contains all TypeScript interfaces and types for the AI assistant system.
 */

import { NotePosition } from '@/lib/musicTheory';

/**
 * Detailed information about a note degree in a scale
 */
export interface NoteDegree {
  note: string;           // e.g., "D", "F#", "Bb"
  degree: number;         // Scale degree (1-7 or more)
  role: string;           // e.g., "root", "minor 3rd", "perfect 5th"
  isChordTone: boolean;   // Whether this note is a chord tone (1, 3, 5, 7)
}

/**
 * Slim AI scale recommendation (token-optimized)
 * AI returns only these fields, we enrich with intervals/noteDegrees/chordTones from database
 */
export interface AIScaleRecommendationSlim {
  scaleName: string;              // e.g., "Dorian", "Harmonic Minor"
  rootNote: string;               // e.g., "D", "C#"
  rationale: string;              // Why this scale is recommended (2-3 sentences)
  genreContext: string;           // Genres where this scale is used (e.g., "Jazz, Funk")
  difficulty: number;             // 1-10 scale difficulty rating
}

/**
 * AI-generated scale recommendation with complete musical data
 * This is the enriched version with data populated from our database
 */
export interface AIScaleRecommendation {
  scaleName: string;              // e.g., "Dorian", "Harmonic Minor"
  rootNote: string;               // e.g., "D", "C#"
  intervals: number[];            // Semitone distances from root [0, 2, 3, 5, 7, 9, 10]
  noteDegrees: NoteDegree[];      // Detailed info for each note
  chordTones: string[];           // Notes that are chord tones ["D", "F", "A", "C"]
  rationale: string;              // Why this scale is recommended (2-3 sentences)
  genreContext: string;           // Genres where this scale is used (e.g., "Jazz, Funk")
  difficulty: number;             // 1-10 scale difficulty rating
}

/**
 * Chord progression suggestion from AI (legacy - kept for backwards compatibility)
 */
export interface ProgressionSuggestion {
  name: string;                   // e.g., "ii-V-I in C Major"
  chords: string[];               // e.g., ["Dm7", "G7", "Cmaj7"]
  romanNumerals?: string[];       // e.g., ["ii7", "V7", "Imaj7"]
  function?: string;              // Harmonic function explanation
  genre?: string;                 // Genre context
  difficulty?: number;            // 1-10 difficulty rating
  description?: string;           // Additional description
}

/**
 * Slim AI chord recommendation (token-optimized)
 * AI returns only these fields, we enrich with voicings/notes/quality from database
 */
export interface AIChordRecommendationSlim {
  chordName: string;              // e.g., "Cmaj7", "Dm7", "G7"
  rootNote: string;               // e.g., "C", "D", "G"
  rationale: string;              // Why this chord is recommended (1-2 sentences)
  genreContext: string;           // Genres where this chord is used (e.g., "Jazz, Blues")
  difficulty: number;             // 1-10 chord difficulty rating
}

/**
 * AI-generated chord recommendation with complete musical data
 * This is the enriched version with data populated from our chord database
 */
export interface AIChordRecommendation extends AIChordRecommendationSlim {
  notes: string[];                // Chord tones ["C", "E", "G", "B"]
  quality: string;                // Chord quality: "major7", "minor7", "dominant7", etc.
  voicings?: any[];               // Optional chord voicings from database (ChordVoicing[])
}

/**
 * Slim AI chord progression recommendation (token-optimized)
 * AI returns only these fields
 */
export interface AIChordProgressionRecommendationSlim {
  name: string;                   // e.g., "ii-V-I in C Major"
  chords: string[];               // e.g., ["Dm7", "G7", "Cmaj7"]
  romanNumerals: string[];        // e.g., ["ii7", "V7", "Imaj7"]
  rationale: string;              // Why this progression is recommended (1-2 sentences)
  genreContext: string;           // Genres where this progression is used (e.g., "Jazz, Blues")
  difficulty: number;             // 1-10 progression difficulty rating
}

/**
 * AI-generated chord progression recommendation
 * Currently same as slim version, but allows for future enrichment
 */
export interface AIChordProgressionRecommendation extends AIChordProgressionRecommendationSlim {
  // Future: Could add enriched data like scale recommendations per chord
}

/**
 * Token usage information from OpenAI API
 */
export interface TokenUsage {
  promptTokens: number;      // Input tokens used
  completionTokens: number;  // Output tokens used
  totalTokens: number;       // Total tokens used
  estimatedCost: number;     // Estimated cost in USD
}

/**
 * Complete AI assistant response structure
 */
export interface AIAssistantResponse {
  messageText: string;                                            // Conversational response text
  scaleRecommendations: AIScaleRecommendation[];                  // 0-5 scale recommendations
  chordRecommendations?: AIChordRecommendation[];                 // 0-5 chord recommendations
  progressionRecommendations?: AIChordProgressionRecommendation[]; // 0-5 progression recommendations
  progressionSuggestions?: ProgressionSuggestion[];               // Legacy - kept for backwards compatibility
  usage?: TokenUsage;                                             // Token usage metadata
}

/**
 * Chat message in conversation history
 */
export interface ChatMessage {
  id: string;                                                     // Unique message ID
  role: 'user' | 'assistant';                                     // Message sender
  content: string;                                                // Message text
  timestamp: number;                                              // Unix timestamp
  scaleRecommendations?: AIScaleRecommendation[];                 // AI scale recommendations
  chordRecommendations?: AIChordRecommendation[];                 // AI chord recommendations
  progressionRecommendations?: AIChordProgressionRecommendation[]; // AI progression recommendations
  progressionSuggestions?: ProgressionSuggestion[];               // Legacy - kept for backwards compatibility
  usage?: TokenUsage;                                             // Token usage for this message (assistant only)
}

/**
 * Fretboard scale data for visualization
 */
export interface FretboardScaleData {
  rootNote: string;               // Root note of the scale
  scaleName: string;              // Name of the scale
  notePositions: NotePosition[];  // All note positions on fretboard
  chordTones: string[];           // Chord tone notes
  guideTones: string[];           // Non-chord tone notes
}

/**
 * Context information for AI recommendations
 */
export interface AIContext {
  key?: string;                   // Current key on fretboard
  scale?: string;                 // Current scale on fretboard
  tuning?: string[];              // Guitar tuning
  userSkillLevel?: 'beginner' | 'intermediate' | 'advanced';
}

/**
 * AI assistant configuration
 */
export interface AIAssistantConfig {
  model: string;                  // OpenAI model to use
  temperature: number;            // Response creativity (0-1)
  maxTokens?: number;             // Maximum response length (optional)
  maxConversationHistory: number; // Number of messages to keep in context
}

/**
 * Rate limiting state
 */
export interface RateLimitState {
  count: number;                  // Number of requests made
  resetTime: number;              // When the count resets (Unix timestamp)
}

/**
 * Error response from API
 */
export interface AIErrorResponse {
  error: string;                  // Error message
  code?: string;                  // Error code
  retryAfter?: number;            // Seconds to wait before retry
}

/**
 * Suggested question for quick start
 */
export interface SuggestedQuestion {
  id: string;
  text: string;
  category: 'genre' | 'theory' | 'practice' | 'progression';
  icon?: string;
}

/**
 * User interaction analytics
 */
export interface AIAnalytics {
  sessionId: string;
  messageCount: number;
  scalesLoaded: number;
  averageResponseTime: number;
  errorCount: number;
  timestamp: number;
}

