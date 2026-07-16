# AI Music Assistant - Implementation Guide

## Quick Start Checklist

### Prerequisites
- [ ] OpenAI API key obtained (https://platform.openai.com/api-keys)
- [ ] Add `OPENAI_API_KEY` to `.env.local`
- [ ] Install dependencies: `npm install openai@^4.0.0`
- [ ] Review main blueprint: `ai-music-assistant-system.md`

### Phase 1: Foundation (Week 1)
- [ ] Create directory structure
- [ ] Set up TypeScript types
- [ ] Build basic sidebar UI
- [ ] Implement open/close functionality
- [ ] Create chat message components

### Phase 2: AI Integration (Week 2)
- [ ] Create API route `/api/ai-assistant/chat`
- [ ] Implement OpenAI service
- [ ] Build system prompt
- [ ] Test AI responses
- [ ] Add error handling

### Phase 3: Fretboard Integration (Week 3)
- [ ] Create scale parser
- [ ] Build scale card component
- [ ] Implement "Load on Fretboard" functionality
- [ ] Add carousel navigation
- [ ] Test scale loading

### Phase 4: Polish (Week 4)
- [ ] Add suggested questions
- [ ] Implement caching
- [ ] Optimize mobile UI
- [ ] Add accessibility features
- [ ] Performance testing

---

## File Creation Order

### Step 1: Create Type Definitions

**File**: `lib/ai-assistant/types.ts`

```typescript
export interface AIScaleRecommendation {
  scaleName: string;
  rootNote: string;
  intervals: number[];
  noteDegrees: {
    note: string;
    degree: number;
    role: string;
    isChordTone: boolean;
  }[];
  chordTones: string[];
  rationale: string;
  genreContext: string;
  difficulty: number;
}

export interface AIAssistantResponse {
  messageText: string;
  scaleRecommendations: AIScaleRecommendation[];
  progressionSuggestions?: {
    chords: string[];
    description: string;
  }[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  scaleRecommendations?: AIScaleRecommendation[];
  progressionSuggestions?: any[];
}

export interface FretboardScaleData {
  rootNote: string;
  scaleName: string;
  notePositions: NotePosition[];
  chordTones: string[];
  guideTones: string[];
}
```

---

### Step 2: Create OpenAI Service

**File**: `lib/ai-assistant/openai-service.ts`

```typescript
import OpenAI from 'openai';
import { AIAssistantResponse, ChatMessage } from './types';
import { buildSystemPrompt } from './prompt-builder';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(
  userMessage: string,
  conversationHistory: ChatMessage[],
  currentContext?: { key: string; scale: string }
): Promise<AIAssistantResponse> {
  try {
    const systemPrompt = buildSystemPrompt(currentContext);
    
    // Build messages array (last 10 messages for context)
    const recentHistory = conversationHistory.slice(-10);
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...recentHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0].message.content;
    if (!responseText) {
      throw new Error('Empty response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText) as AIAssistantResponse;
    
    // Validate response structure
    if (!parsedResponse.messageText) {
      throw new Error('Invalid response structure: missing messageText');
    }

    return parsedResponse;
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw error;
  }
}
```

---

### Step 3: Create System Prompt Builder

**File**: `lib/ai-assistant/prompt-builder.ts`

```typescript
export function buildSystemPrompt(context?: { key: string; scale: string }): string {
  const basePrompt = `You are an expert music theory assistant integrated into Musical Insights, a professional guitar scale visualization tool. Your role is to help musicians understand scales, modes, chord progressions, and music theory concepts.

CRITICAL INSTRUCTIONS:
1. Always respond with valid JSON matching this schema:
{
  "messageText": "Your conversational response here",
  "scaleRecommendations": [
    {
      "scaleName": "Dorian",
      "rootNote": "D",
      "intervals": [0, 2, 3, 5, 7, 9, 10],
      "noteDegrees": [
        { "note": "D", "degree": 1, "role": "root", "isChordTone": true },
        { "note": "E", "degree": 2, "role": "2nd", "isChordTone": false },
        { "note": "F", "degree": 3, "role": "minor 3rd", "isChordTone": true },
        { "note": "G", "degree": 4, "role": "4th", "isChordTone": false },
        { "note": "A", "degree": 5, "role": "5th", "isChordTone": true },
        { "note": "B", "degree": 6, "role": "6th", "isChordTone": false },
        { "note": "C", "degree": 7, "role": "minor 7th", "isChordTone": true }
      ],
      "chordTones": ["D", "F", "A", "C"],
      "rationale": "Brief explanation (2-3 sentences)",
      "genreContext": "Jazz, Funk",
      "difficulty": 3
    }
  ]
}

2. Recommend 1-5 scales maximum per response
3. Use chromatic notes: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
4. Calculate intervals as semitone distances from root
5. Identify chord tones as scale degrees 1, 3, 5, 7
6. Provide clear, concise rationales

AVAILABLE SCALES:
- Major Modes: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
- Harmonic Minor Modes: Harmonic Minor, Locrian ♮6, Ionian #5, Dorian #4, Phrygian Dominant, Lydian #2, Altered Diminished
- Melodic Minor Modes: Melodic Minor, Dorian b2, Lydian Augmented, Lydian Dominant, Mixolydian b6, Locrian ♮2, Altered
- Pentatonic: Pentatonic Major, Pentatonic Minor, Blues
- Exotic: Whole Tone, Diminished (Half-Whole), Diminished (Whole-Half), Harmonic Major, Double Harmonic, Hungarian Minor

GENRE KNOWLEDGE:
- Jazz: Dorian, Mixolydian, Altered, Lydian Dominant
- Blues: Pentatonic Minor, Blues, Mixolydian
- Rock: Pentatonic Minor, Aeolian, Dorian
- Metal: Phrygian, Locrian, Harmonic Minor, Phrygian Dominant
- Country: Pentatonic Major, Mixolydian, Ionian
- Funk: Dorian, Mixolydian, Pentatonic Minor`;

  if (context) {
    return `${basePrompt}

CURRENT FRETBOARD STATE:
- Key: ${context.key}
- Scale: ${context.scale}

Consider this context when making recommendations. Suggest complementary scales or modes that work well with the current selection.`;
  }

  return basePrompt;
}
```

---

### Step 4: Create API Route

**File**: `app/api/ai-assistant/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getChatCompletion } from '@/lib/ai-assistant/openai-service';
import { ChatMessage } from '@/lib/ai-assistant/types';

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = requestCounts.get(ip);

  if (!limit || now > limit.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute
    return true;
  }

  if (limit.count >= 10) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait a moment.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { message, conversationHistory, currentKey, currentScale } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid message' },
        { status: 400 }
      );
    }

    // Limit message length
    if (message.length > 500) {
      return NextResponse.json(
        { error: 'Message too long (max 500 characters)' },
        { status: 400 }
      );
    }

    const context = currentKey && currentScale 
      ? { key: currentKey, scale: currentScale }
      : undefined;

    const response = await getChatCompletion(
      message,
      conversationHistory || [],
      context
    );

    return NextResponse.json({
      response,
      conversationId: crypto.randomUUID(),
    });

  } catch (error) {
    console.error('AI Assistant API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
```

---

### Step 5: Create Scale Parser

**File**: `lib/ai-assistant/scale-parser.ts`

```typescript
import { calculateScalePositions, getScaleNotes, NOTES } from '@/lib/musicTheory';
import { EXTENDED_SCALE_INTERVALS } from '@/lib/musicalCompatibility';
import { AIScaleRecommendation, FretboardScaleData } from './types';
import { NotePosition } from '@/lib/musicTheory';

export function parseAIScaleToFretboard(
  aiScale: AIScaleRecommendation,
  tuning: string[]
): FretboardScaleData {
  // Validate root note
  if (!NOTES.includes(aiScale.rootNote)) {
    throw new Error(`Invalid root note: ${aiScale.rootNote}`);
  }

  // Validate intervals
  if (!aiScale.intervals.every(i => i >= 0 && i <= 11)) {
    throw new Error('Invalid intervals: must be 0-11');
  }

  let notePositions: NotePosition[];

  // Check if scale exists in EXTENDED_SCALE_INTERVALS
  if (EXTENDED_SCALE_INTERVALS[aiScale.scaleName]) {
    // Use existing scale calculation
    notePositions = calculateScalePositions(
      aiScale.rootNote,
      aiScale.scaleName,
      tuning
    );
  } else {
    // Custom scale: calculate positions from AI-provided intervals
    notePositions = calculateCustomScalePositions(
      aiScale.rootNote,
      aiScale.intervals,
      tuning
    );
  }

  // Extract chord tones and guide tones
  const chordTones = aiScale.chordTones;
  const allNotes = aiScale.noteDegrees.map(nd => nd.note);
  const guideTones = allNotes.filter(note => !chordTones.includes(note));

  return {
    rootNote: aiScale.rootNote,
    scaleName: aiScale.scaleName,
    notePositions,
    chordTones,
    guideTones,
  };
}

function calculateCustomScalePositions(
  rootNote: string,
  intervals: number[],
  tuning: string[],
  maxFrets: number = 24
): NotePosition[] {
  const positions: NotePosition[] = [];
  const rootIndex = NOTES.indexOf(rootNote);

  // Calculate scale notes from intervals
  const scaleNotes = intervals.map(interval => NOTES[(rootIndex + interval) % 12]);

  tuning.forEach((openNote, stringIndex) => {
    const openNoteIndex = NOTES.indexOf(openNote);

    for (let fret = 0; fret <= maxFrets; fret++) {
      const noteIndex = (openNoteIndex + fret) % 12;
      const note = NOTES[noteIndex];

      if (scaleNotes.includes(note)) {
        positions.push({
          stringIndex,
          fretNumber: fret,
          note,
          isRoot: note === rootNote,
        });
      }
    }
  });

  return positions;
}

export function validateAIScale(scale: AIScaleRecommendation): boolean {
  // Validate required fields
  if (!scale.scaleName || !scale.rootNote || !scale.intervals) {
    return false;
  }

  // Validate root note
  if (!NOTES.includes(scale.rootNote)) {
    return false;
  }

  // Validate intervals
  if (!Array.isArray(scale.intervals) || scale.intervals.length === 0) {
    return false;
  }

  if (!scale.intervals.every(i => typeof i === 'number' && i >= 0 && i <= 11)) {
    return false;
  }

  // Validate note degrees match intervals
  if (scale.noteDegrees && scale.noteDegrees.length !== scale.intervals.length) {
    return false;
  }

  return true;
}
```

---

### Step 6: Create Main Sidebar Component

**File**: `components/ai-assistant/AIAssistantSidebar.tsx`

```typescript
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { X, Sparkles, Send, Trash2 } from 'lucide-react';
import { ThemeConfig } from '@/lib/themes';
import { ChatMessage, AIScaleRecommendation, FretboardScaleData } from '@/lib/ai-assistant/types';
import { parseAIScaleToFretboard } from '@/lib/ai-assistant/scale-parser';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import QuickActions from './QuickActions';

interface AIAssistantSidebarProps {
  theme: ThemeConfig;
  isExpanded: boolean;
  onToggle: () => void;
  currentKey?: string;
  currentScale?: string;
  tuning: string[];
  onLoadScale: (scaleData: FretboardScaleData) => void;
}

export default function AIAssistantSidebar({
  theme,
  isExpanded,
  onToggle,
  currentKey,
  currentScale,
  tuning,
  onLoadScale,
}: AIAssistantSidebarProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedScales, setLoadedScales] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setMessages(parsed);
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('ai-chat-history', JSON.stringify(messages.slice(-50)));
    }
  }, [messages]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory: messages,
          currentKey,
          currentScale,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response.messageText,
        timestamp: Date.now(),
        scaleRecommendations: data.response.scaleRecommendations,
        progressionSuggestions: data.response.progressionSuggestions,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setIsLoading(false);
    }
  }, [inputValue, messages, currentKey, currentScale, isLoading]);

  const handleLoadScale = useCallback((scale: AIScaleRecommendation) => {
    try {
      const scaleData = parseAIScaleToFretboard(scale, tuning);
      onLoadScale(scaleData);

      const scaleKey = `${scale.rootNote}-${scale.scaleName}`;
      setLoadedScales(prev => new Set(prev).add(scaleKey));

      // Show success toast (you can use your existing toast system)
      console.log(`Loaded ${scale.rootNote} ${scale.scaleName} on fretboard`);
    } catch (err) {
      console.error('Error loading scale:', err);
      setError('Failed to load scale on fretboard');
    }
  }, [tuning, onLoadScale]);

  const handleClearChat = useCallback(() => {
    setMessages([]);
    setLoadedScales(new Set());
    localStorage.removeItem('ai-chat-history');
  }, []);

  const handleSuggestedQuestion = useCallback((question: string) => {
    setInputValue(question);
  }, []);

  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-0 top-1/2 -translate-y-1/2 w-12 h-32 rounded-l-xl flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 z-40"
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        }}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6 text-white animate-pulse" />
        {messages.length > 0 && (
          <span className="text-xs text-white font-bold bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
            {messages.filter(m => m.role === 'assistant').length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div
      className="fixed right-0 top-0 h-full w-full md:w-[400px] flex flex-col shadow-2xl z-40 transition-transform"
      style={{ background: theme.bgSecondary }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: theme.border }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: theme.textPrimary }} />
          <h2 className="font-semibold" style={{ color: theme.textPrimary }}>
            AI Music Theory Assistant
          </h2>
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded hover:bg-opacity-10 hover:bg-white transition-colors"
          aria-label="Close AI Assistant"
        >
          <X className="w-5 h-5" style={{ color: theme.textPrimary }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          theme={theme}
          loadedScales={loadedScales}
          onLoadScale={handleLoadScale}
          onSuggestedQuestion={handleSuggestedQuestion}
        />
        {isLoading && (
          <div className="flex items-center gap-2 p-3 rounded-lg" style={{ background: theme.bgTertiary }}>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0s' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
            <span className="text-sm" style={{ color: theme.textSecondary }}>Thinking...</span>
          </div>
        )}
        {error && (
          <div className="p-3 rounded-lg bg-red-100 text-red-700 text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div
        className="border-t p-4"
        style={{ borderColor: theme.border }}
      >
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSendMessage}
          isLoading={isLoading}
          theme={theme}
        />
        <QuickActions
          onClearChat={handleClearChat}
          onSuggestedQuestion={handleSuggestedQuestion}
          theme={theme}
          hasMessages={messages.length > 0}
        />
      </div>
    </div>
  );
}
```

---

## Testing Commands

```bash
# Run development server
npm run dev

# Test API endpoint
curl -X POST http://localhost:3000/api/ai-assistant/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What scales work for blues?", "conversationHistory": []}'

# Run type checking
npm run typecheck

# Run linting
npm run lint
```

---

## Common Issues & Solutions

### Issue 1: OpenAI API Key Not Found
**Error**: `Error: OpenAI API key not found`
**Solution**: Add `OPENAI_API_KEY=sk-...` to `.env.local` and restart dev server

### Issue 2: Invalid JSON Response
**Error**: `SyntaxError: Unexpected token`
**Solution**: Check system prompt includes `response_format: { type: "json_object" }` instruction

### Issue 3: Scale Not Loading on Fretboard
**Error**: Scale card shows "Failed to load"
**Solution**: Verify scale name exists in `EXTENDED_SCALE_INTERVALS` or use custom scale logic

### Issue 4: Rate Limit Exceeded
**Error**: `429 Too Many Requests`
**Solution**: Wait 60 seconds or increase rate limit in API route

---

## Next Steps

After completing the implementation:
1. Test with real users (beta group)
2. Monitor OpenAI API costs
3. Collect feedback on AI responses
4. Iterate on system prompt for better recommendations
5. Add more advanced features (voice input, progression builder, etc.)


