# AI Music Theory Assistant - Development Design Blueprint

## Executive Summary

This blueprint outlines the implementation of an AI-powered music theory assistant integrated into the right sidebar of the Musical Insights application. The assistant uses GPT-4o-mini to answer music theory questions, recommend scales/modes for specific genres and contexts, and provide interactive scale recommendations that can be loaded directly onto the fretboard.

## System Architecture Overview

### Core Components
1. **Right Sidebar UI** - Chat interface with collapsible/expandable panel
2. **AI Chat Service** - OpenAI GPT-4o-mini integration with structured outputs
3. **Scale Recommendation Parser** - Converts AI JSON responses to fretboard data
4. **Fretboard Integration** - Loads AI-recommended scales onto the fretboard
5. **Conversation State Management** - Maintains chat history and context

---

## 1. Data Structures & Types

### 1.1 AI Response Format (JSON Schema)

The AI will return structured JSON responses that include both conversational text and actionable scale/mode data:

```typescript
interface AIScaleRecommendation {
  scaleName: string;           // e.g., "Dorian", "Mixolydian", "Blues"
  rootNote: string;            // e.g., "C", "D#", "F#"
  intervals: number[];         // Semitone intervals: [0, 2, 3, 5, 7, 9, 10]
  noteDegrees: {               // Position metadata for each note
    note: string;              // e.g., "C", "D", "Eb"
    degree: number;            // Scale degree: 1, 2, 3, 4, 5, 6, 7
    role: string;              // "root", "3rd", "5th", "7th", etc.
    isChordTone: boolean;      // True for 1, 3, 5, 7
  }[];
  chordTones: string[];        // Notes that are chord tones: ["C", "Eb", "G", "Bb"]
  rationale: string;           // Why this scale fits the context
  genreContext: string;        // "Jazz", "Rock", "Blues", etc.
  difficulty: number;          // 1-10 scale
}

interface AIAssistantResponse {
  messageText: string;                      // Conversational response
  scaleRecommendations: AIScaleRecommendation[];  // 0-5 recommended scales
  progressionSuggestions?: {                // Optional chord progression suggestions
    chords: string[];                       // ["Cmaj7", "Dm7", "G7"]
    description: string;
  }[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;                          // Display text
  timestamp: number;
  scaleRecommendations?: AIScaleRecommendation[];
  progressionSuggestions?: any[];
}
```

### 1.2 Fretboard Integration Types

```typescript
interface FretboardScaleData {
  rootNote: string;
  scaleName: string;
  notePositions: NotePosition[];  // Existing type from lib/musicTheory.ts
  chordTones: string[];
  guideTones: string[];
}
```

---

## 2. UI/UX Design Specifications

### 2.1 Right Sidebar Layout

**Position**: Right side of the screen (opposite of the existing left AudioSidebar)
**Width**: 
- Collapsed: 48px (icon only)
- Expanded: 400px (desktop), 100% (mobile)
**Height**: Full viewport height
**Z-index**: 40 (below modals, above main content)

### 2.2 Visual Design

**Collapsed State**:
- Floating button with AI sparkle icon (✨ or robot icon)
- Positioned at right edge, vertically centered
- Subtle glow animation to indicate availability
- Badge showing unread AI suggestions count

**Expanded State**:
```
┌─────────────────────────────────────┐
│  AI Music Theory Assistant      [×] │
├─────────────────────────────────────┤
│                                     │
│  [Chat Messages Area]               │
│  - Scrollable conversation          │
│  - User messages (right-aligned)    │
│  - AI messages (left-aligned)       │
│  - Scale recommendation cards       │
│                                     │
├─────────────────────────────────────┤
│  [Input Area]                       │
│  ┌─────────────────────────────┐   │
│  │ Ask about scales, modes...  │   │
│  └─────────────────────────────┘   │
│  [Send Button] [Clear Chat]         │
└─────────────────────────────────────┘
```

### 2.3 Scale Recommendation Card Design

Each AI-recommended scale appears as an interactive card within the chat:

```
┌───────────────────────────────────────┐
│ 🎵 D Dorian                           │
│ ─────────────────────────────────     │
│ Genre: Jazz, Funk                     │
│ Difficulty: ⭐⭐⭐ (3/10)              │
│                                       │
│ Notes: D E F G A B C                  │
│ Chord Tones: D F A C (highlighted)    │
│                                       │
│ "Perfect for minor ii-V-I jazz        │
│  progressions and modal improvisation"│
│                                       │
│ [Load on Fretboard] [Learn More]     │
└───────────────────────────────────────┘
```

**Card Features**:
- **Carousel Navigation**: If multiple scales recommended, show carousel with dots
- **Color Coding**: Use existing NOTE_COLORS for root note
- **Hover Effects**: Scale 1.02x, subtle shadow
- **Click Action**: Loads scale onto fretboard with smooth transition
- **Visual Feedback**: Checkmark when loaded, pulse animation

---

## 3. Backend API Design

### 3.1 API Route: `/app/api/ai-assistant/chat/route.ts`

**Method**: POST
**Purpose**: Send user message to GPT-4o-mini and receive structured response

**Request Body**:
```typescript
{
  message: string;
  conversationHistory: ChatMessage[];  // Last 10 messages for context
  currentKey?: string;                 // Current fretboard key (e.g., "C")
  currentScale?: string;               // Current fretboard scale (e.g., "Dorian")
}
```

**Response**:
```typescript
{
  response: AIAssistantResponse;
  conversationId: string;
}
```

### 3.2 OpenAI Integration Strategy

**Model**: `gpt-4o-mini` (cost-effective, fast, good for structured outputs)
**Temperature**: 0.7 (balanced creativity and accuracy)
**Max Tokens**: 1000
**System Prompt**: (See Section 4)

**Structured Output Configuration**:
Use OpenAI's JSON mode with response_format: { type: "json_object" }

**Rate Limiting**:
- Client-side: Debounce user input (500ms)
- Server-side: Rate limit per IP (10 requests/minute)
- Caching: Cache common questions for 1 hour

**Error Handling**:
- Timeout: 30 seconds
- Retry: 2 attempts with exponential backoff
- Fallback: Generic music theory response if API fails

---

## 4. AI System Prompt Design

### 4.1 Core System Prompt

```
You are an expert music theory assistant integrated into Musical Insights, a professional guitar scale visualization tool. Your role is to help musicians understand scales, modes, chord progressions, and music theory concepts.

CRITICAL INSTRUCTIONS:
1. Always respond with valid JSON matching the AIAssistantResponse schema
2. When recommending scales/modes, provide complete mathematical data (intervals, note degrees, chord tones)
3. Recommend 1-5 scales maximum per response
4. Tailor recommendations to the user's specified genre and context
5. Use the 12-tone chromatic scale: C, C#, D, D#, E, F, F#, G, G#, A, A#, B
6. Calculate intervals as semitone distances from root: [0, 2, 4, 5, 7, 9, 11] for Major
7. Identify chord tones as scale degrees 1, 3, 5, 7
8. Provide clear, concise rationales (2-3 sentences max)

AVAILABLE SCALES/MODES:
- Major Modes: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian
- Harmonic Minor Modes: Harmonic Minor, Locrian ♮6, Ionian #5, Dorian #4, Phrygian Dominant, Lydian #2, Altered Diminished
- Melodic Minor Modes: Melodic Minor, Dorian b2, Lydian Augmented, Lydian Dominant, Mixolydian b6, Locrian ♮2, Altered
- Pentatonic: Major Pentatonic, Minor Pentatonic, Blues Scale
- Exotic: Whole Tone, Diminished (Half-Whole), Diminished (Whole-Half), Harmonic Major, Double Harmonic, Hungarian Minor, Neapolitan Minor, Persian, Enigmatic

GENRE CONTEXT KNOWLEDGE:
- Jazz: Dorian, Mixolydian, Altered, Lydian Dominant, Melodic Minor modes
- Blues: Minor Pentatonic, Blues Scale, Mixolydian
- Rock: Minor Pentatonic, Aeolian, Dorian
- Metal: Phrygian, Locrian, Harmonic Minor, Phrygian Dominant
- Country: Major Pentatonic, Mixolydian, Ionian
- Funk: Dorian, Mixolydian, Minor Pentatonic
- Classical: Ionian, Aeolian, Harmonic Minor, Melodic Minor

RESPONSE FORMAT:
{
  "messageText": "Conversational response here...",
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
      "rationale": "Dorian mode is perfect for jazz and funk due to its minor quality with a raised 6th, creating a sophisticated, less dark sound than natural minor.",
      "genreContext": "Jazz, Funk, Rock",
      "difficulty": 3
    }
  ]
}
```

### 4.2 Context-Aware Prompting

When user provides current fretboard state:
```
CURRENT FRETBOARD STATE:
- Key: {currentKey}
- Scale: {currentScale}
- Tuning: {tuning}

Consider this context when making recommendations. Suggest complementary scales or modes that work well with the current selection.
```

---

## 5. Component Architecture

### 5.1 Component Hierarchy

```
<AIAssistantSidebar>
  ├── <SidebarToggleButton />
  ├── <ChatContainer>
  │   ├── <ChatHeader />
  │   ├── <MessageList>
  │   │   ├── <UserMessage />
  │   │   ├── <AssistantMessage>
  │   │   │   ├── <MessageText />
  │   │   │   └── <ScaleRecommendationCarousel>
  │   │   │       └── <ScaleCard>
  │   │   │           ├── <ScaleInfo />
  │   │   │           ├── <NoteDisplay />
  │   │   │           └── <LoadButton />
  │   ├── <ChatInput>
  │   │   ├── <TextArea />
  │   │   └── <SendButton />
  │   └── <QuickActions>
  │       ├── <ClearChatButton />
  │       └── <SuggestedQuestions />
  └── <LoadingIndicator />
```

### 5.2 File Structure

```
components/
  ai-assistant/
    AIAssistantSidebar.tsx          # Main sidebar container
    ChatContainer.tsx               # Chat UI wrapper
    MessageList.tsx                 # Scrollable message list
    UserMessage.tsx                 # User message bubble
    AssistantMessage.tsx            # AI message bubble
    ScaleRecommendationCarousel.tsx # Carousel for multiple scales
    ScaleCard.tsx                   # Individual scale recommendation card
    ChatInput.tsx                   # Message input area
    QuickActions.tsx                # Suggested questions, clear chat
    LoadingIndicator.tsx            # Typing indicator

lib/
  ai-assistant/
    openai-service.ts               # OpenAI API integration
    scale-parser.ts                 # Parse AI JSON to fretboard data
    conversation-manager.ts         # Manage chat history
    prompt-builder.ts               # Build context-aware prompts
    types.ts                        # TypeScript interfaces

app/
  api/
    ai-assistant/
      chat/
        route.ts                    # POST endpoint for chat
```

---

## 6. Scale Loading & Fretboard Integration

### 6.1 Scale Loading Flow

1. **User clicks "Load on Fretboard" button** on a scale card
2. **Parse AI recommendation** to extract:
   - Root note (e.g., "D")
   - Scale name (e.g., "Dorian")
   - Intervals (e.g., [0, 2, 3, 5, 7, 9, 10])
   - Chord tones (e.g., ["D", "F", "A", "C"])
3. **Convert to NotePosition[]** using existing `calculateScalePositions()` function
4. **Update fretboard state** in parent component (app/page.tsx)
5. **Visual feedback**:
   - Scale card shows checkmark ✓
   - Fretboard smoothly transitions to new scale
   - Toast notification: "Loaded D Dorian on fretboard"

### 6.2 Integration with Existing System

**Reuse Existing Functions**:
- `lib/musicTheory.ts::calculateScalePositions()` - Calculate fret positions
- `lib/musicTheory.ts::getScaleNotes()` - Get scale notes from intervals
- `lib/musicTheory.ts::NOTE_COLORS` - Color coding for notes
- `lib/musicalCompatibility.ts::EXTENDED_SCALE_INTERVALS` - Validate scale names

**New Helper Function** (`lib/ai-assistant/scale-parser.ts`):
```typescript
export function parseAIScaleToFretboard(
  aiScale: AIScaleRecommendation,
  tuning: string[]
): FretboardScaleData {
  // 1. Validate scale name exists in EXTENDED_SCALE_INTERVALS
  // 2. If not, use intervals from AI to create custom scale
  // 3. Calculate note positions using calculateScalePositions()
  // 4. Extract chord tones from noteDegrees where isChordTone === true
  // 5. Return FretboardScaleData
}
```

### 6.3 Custom Scale Support

If AI recommends a scale not in `EXTENDED_SCALE_INTERVALS`:
1. **Create temporary scale entry** using AI-provided intervals
2. **Calculate positions** using intervals directly
3. **Display warning** to user: "Custom scale loaded from AI recommendation"
4. **Option to save** custom scale to user's library (future feature)

---

## 7. State Management

### 7.1 Local State (Component Level)

**AIAssistantSidebar.tsx**:
```typescript
const [isExpanded, setIsExpanded] = useState(false);
const [messages, setMessages] = useState<ChatMessage[]>([]);
const [inputValue, setInputValue] = useState('');
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

### 7.2 Global State (Parent Component)

**app/page.tsx** additions:
```typescript
const [aiAssistantExpanded, setAIAssistantExpanded] = useState(false);
const [aiRecommendedScale, setAIRecommendedScale] = useState<FretboardScaleData | null>(null);

// Callback to load AI-recommended scale
const handleLoadAIScale = useCallback((scaleData: FretboardScaleData) => {
  setRootNote(scaleData.rootNote);
  setScaleName(scaleData.scaleName);
  setSelectedChordNotes(scaleData.chordTones);
  setSelectedGuideTones(scaleData.guideTones);
  // Trigger fretboard update
}, []);
```

### 7.3 Persistence

**LocalStorage**:
- Save last 50 messages: `localStorage.setItem('ai-chat-history', JSON.stringify(messages))`
- Save expanded state: `localStorage.setItem('ai-sidebar-expanded', 'true')`
- Clear on user request or after 7 days

---

## 8. Example User Interactions

### 8.1 Scenario 1: Genre-Based Recommendation

**User Input**: "What scales sound best for jazz improvisation over a ii-V-I in C major?"

**AI Response**:
```json
{
  "messageText": "For jazz improvisation over a ii-V-I in C major (Dm7 - G7 - Cmaj7), I recommend these scales that create authentic jazz vocabulary:",
  "scaleRecommendations": [
    {
      "scaleName": "Dorian",
      "rootNote": "D",
      "intervals": [0, 2, 3, 5, 7, 9, 10],
      "noteDegrees": [...],
      "chordTones": ["D", "F", "A", "C"],
      "rationale": "D Dorian is the perfect choice for the ii chord (Dm7), providing a minor sound with a raised 6th that avoids the darker Aeolian quality.",
      "genreContext": "Jazz",
      "difficulty": 3
    },
    {
      "scaleName": "Mixolydian",
      "rootNote": "G",
      "intervals": [0, 2, 4, 5, 7, 9, 10],
      "noteDegrees": [...],
      "chordTones": ["G", "B", "D", "F"],
      "rationale": "G Mixolydian works beautifully over the V chord (G7), emphasizing the dominant 7th quality with its major 3rd and flat 7th.",
      "genreContext": "Jazz",
      "difficulty": 2
    },
    {
      "scaleName": "Ionian",
      "rootNote": "C",
      "intervals": [0, 2, 4, 5, 7, 9, 11],
      "noteDegrees": [...],
      "chordTones": ["C", "E", "G", "B"],
      "rationale": "C Ionian (Major) resolves the progression perfectly on the I chord (Cmaj7), providing a bright, stable resolution.",
      "genreContext": "Jazz",
      "difficulty": 1
    }
  ]
}
```

**UI Display**:
- Message text appears in chat bubble
- 3 scale cards appear in a carousel below the message
- User can swipe/click through cards
- Each card has "Load on Fretboard" button

### 8.2 Scenario 2: Contextual Follow-Up

**User Input**: "I'm currently using C Major. What modes can I explore?"

**AI Response** (with context awareness):
```json
{
  "messageText": "Since you're in C Major (Ionian), you can explore all 7 modes of the major scale by starting on different scale degrees. Here are the most useful modes:",
  "scaleRecommendations": [
    {
      "scaleName": "Dorian",
      "rootNote": "D",
      "intervals": [0, 2, 3, 5, 7, 9, 10],
      "rationale": "D Dorian (2nd mode of C Major) - Minor with a jazzy, sophisticated feel. Great for funk and jazz.",
      "genreContext": "Jazz, Funk",
      "difficulty": 3
    },
    {
      "scaleName": "Mixolydian",
      "rootNote": "G",
      "intervals": [0, 2, 4, 5, 7, 9, 10],
      "rationale": "G Mixolydian (5th mode of C Major) - Dominant sound perfect for blues and rock. The flat 7th creates tension.",
      "genreContext": "Blues, Rock",
      "difficulty": 2
    }
  ]
}
```

---

## 9. Performance Optimization

### 9.1 Client-Side Optimizations

1. **Lazy Loading**: Load AI sidebar component only when user clicks toggle button
2. **Debouncing**: Debounce user input (500ms) to reduce API calls
3. **Memoization**: Memoize scale card components with React.memo()
4. **Virtual Scrolling**: Use react-window for long chat histories (>100 messages)

### 9.2 Server-Side Optimizations

1. **Response Streaming**: Stream AI responses token-by-token for perceived speed
2. **Caching**: Cache common questions in Redis (1-hour TTL)
3. **Edge Functions**: Deploy API route to Vercel Edge for low latency
4. **Rate Limiting**: Implement per-IP rate limiting (10 req/min)

### 9.3 Cost Management

**OpenAI API Costs** (gpt-4o-mini):
- Input: $0.150 / 1M tokens
- Output: $0.600 / 1M tokens
- Average request: ~500 input + 800 output tokens = $0.00055 per request
- Monthly budget: $50 = ~90,000 requests

**Cost Controls**:
- Max tokens: 1000 (prevents runaway costs)
- Conversation history: Last 10 messages only
- Timeout: 30 seconds
- Fallback to cached responses when possible

---

## 10. Error Handling & Edge Cases

### 10.1 API Errors

| Error Type | User Message | Fallback Behavior |
|------------|--------------|-------------------|
| OpenAI Timeout | "AI is taking longer than expected. Please try again." | Retry once, then show cached response |
| Rate Limit | "Too many requests. Please wait a moment." | Show countdown timer (60s) |
| Invalid JSON | "AI response format error. Please rephrase your question." | Log error, ask user to retry |
| Network Error | "Connection lost. Check your internet." | Retry with exponential backoff |

### 10.2 Invalid Scale Data

If AI returns invalid scale data:
1. **Validate intervals**: Check if intervals are within 0-11 range
2. **Validate notes**: Check if notes exist in NOTES array
3. **Fallback**: If invalid, show message text only (no scale cards)
4. **Logging**: Log invalid responses for prompt improvement

### 10.3 Fretboard Integration Errors

If scale cannot be loaded on fretboard:
1. **Show error toast**: "Unable to load scale. Please try manually selecting it."
2. **Highlight issue**: If scale name not found, suggest closest match
3. **Provide manual option**: Link to ControlPanel to select scale manually

---

## 11. Accessibility & UX Enhancements

### 11.1 Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation**:
  - Tab through all interactive elements
  - Enter to send message, Escape to close sidebar
  - Arrow keys to navigate scale carousel
- **Screen Reader Support**:
  - ARIA labels on all buttons
  - Live region announcements for AI responses
  - Alt text for scale card icons
- **Color Contrast**:
  - Minimum 4.5:1 contrast ratio for text
  - Use theme colors from existing ThemeConfig
- **Focus Indicators**:
  - Visible focus rings on all interactive elements
  - Skip to main content link

### 11.2 Mobile Responsiveness

**Breakpoints**:
- Desktop (>1024px): 400px sidebar width
- Tablet (768-1024px): 350px sidebar width
- Mobile (<768px): Full-screen overlay

**Touch Optimizations**:
- Minimum 44x44px touch targets
- Swipe gestures for carousel navigation
- Pull-to-refresh for chat history
- Bottom sheet UI on mobile (instead of sidebar)

### 11.3 Suggested Questions (Quick Start)

Display 3-5 suggested questions when chat is empty:
- "What scales work best for blues improvisation?"
- "Explain the difference between Dorian and Aeolian modes"
- "What modes should I use for metal riffs?"
- "How do I use the Phrygian Dominant scale?"
- "What's a good scale for country music?"

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Components** (`components/ai-assistant/*.test.tsx`):
- ScaleCard renders correctly with valid data
- ChatInput validates user input
- MessageList scrolls to bottom on new message
- ScaleRecommendationCarousel navigation works

**Services** (`lib/ai-assistant/*.test.ts`):
- openai-service.ts: Mock OpenAI API responses
- scale-parser.ts: Validate interval calculations
- conversation-manager.ts: Test message history limits

### 12.2 Integration Tests

**API Routes** (`app/api/ai-assistant/chat/route.test.ts`):
- POST request returns valid AIAssistantResponse
- Rate limiting works correctly
- Error handling for invalid requests
- Timeout handling

**Fretboard Integration**:
- Loading AI scale updates fretboard state
- Chord tones highlight correctly
- Scale transitions smoothly

### 12.3 E2E Tests (Playwright)

**User Flows**:
1. Open AI sidebar → Ask question → Receive response → Load scale
2. Navigate carousel → Click different scales → Verify fretboard updates
3. Clear chat → Verify messages removed
4. Mobile: Open sidebar → Send message → Close sidebar

### 12.4 Manual Testing Checklist

- [ ] AI responses are coherent and accurate
- [ ] Scale recommendations load correctly on fretboard
- [ ] Carousel navigation works smoothly
- [ ] Chat history persists across page reloads
- [ ] Error messages display correctly
- [ ] Mobile UI works on iOS and Android
- [ ] Keyboard navigation works
- [ ] Screen reader announces messages
- [ ] Theme colors match existing design
- [ ] Performance: <2s response time for AI

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal**: Set up basic infrastructure
- [ ] Create file structure (components, lib, api)
- [ ] Set up OpenAI API integration
- [ ] Create TypeScript types and interfaces
- [ ] Build basic sidebar UI (collapsed/expanded states)
- [ ] Implement chat input and message display

**Deliverables**:
- Working sidebar that opens/closes
- Basic chat UI (no AI yet)
- API route skeleton

### Phase 2: AI Integration (Week 2)
**Goal**: Connect to OpenAI and parse responses
- [ ] Implement OpenAI service with structured outputs
- [ ] Create system prompt and context builder
- [ ] Build scale parser (AI JSON → fretboard data)
- [ ] Add conversation history management
- [ ] Implement error handling and retries

**Deliverables**:
- Working AI chat with real responses
- Scale recommendations appear in chat
- Error handling for API failures

### Phase 3: Fretboard Integration (Week 3)
**Goal**: Load AI scales onto fretboard
- [ ] Create ScaleCard component with "Load" button
- [ ] Implement scale loading logic
- [ ] Add visual feedback (checkmarks, toasts)
- [ ] Build carousel for multiple recommendations
- [ ] Test with various scale types

**Deliverables**:
- Clickable scale cards that load onto fretboard
- Smooth transitions and animations
- Carousel navigation

### Phase 4: Polish & Optimization (Week 4)
**Goal**: Improve UX and performance
- [ ] Add suggested questions
- [ ] Implement caching for common queries
- [ ] Optimize mobile UI
- [ ] Add keyboard shortcuts
- [ ] Improve accessibility (ARIA, focus management)
- [ ] Add loading states and animations

**Deliverables**:
- Polished, production-ready UI
- Fast response times (<2s)
- Mobile-optimized experience

### Phase 5: Testing & Launch (Week 5)
**Goal**: Ensure quality and deploy
- [ ] Write unit tests for all components
- [ ] Write integration tests for API
- [ ] Conduct E2E testing
- [ ] Perform accessibility audit
- [ ] Load testing (100 concurrent users)
- [ ] Deploy to production

**Deliverables**:
- 80%+ test coverage
- Passing accessibility audit
- Production deployment

---

## 14. Environment Variables

Add to `.env.local`:
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=1000
OPENAI_TEMPERATURE=0.7

# Rate Limiting
AI_RATE_LIMIT_PER_MINUTE=10
AI_RATE_LIMIT_PER_HOUR=100

# Feature Flags
NEXT_PUBLIC_AI_ASSISTANT_ENABLED=true
```

---

## 15. Dependencies to Install

```bash
npm install openai@^4.0.0          # OpenAI SDK
npm install react-markdown@^9.0.0  # Render markdown in AI responses
npm install embla-carousel-react   # Already installed (for carousel)
npm install @radix-ui/react-toast  # Already installed (for notifications)
```

---

## 16. Security Considerations

### 16.1 API Key Protection
- **Never expose** OpenAI API key to client
- Store in environment variables only
- Use server-side API routes exclusively

### 16.2 Input Validation
- **Sanitize user input** before sending to OpenAI
- **Limit message length**: Max 500 characters
- **Block malicious prompts**: Filter SQL injection, XSS attempts
- **Rate limiting**: Prevent abuse (10 req/min per IP)

### 16.3 Output Validation
- **Validate JSON structure** before parsing
- **Sanitize AI responses** before rendering (prevent XSS)
- **Validate scale data** before loading on fretboard
- **Log suspicious responses** for review

### 16.4 Cost Protection
- **Set monthly budget** in OpenAI dashboard ($50/month)
- **Monitor usage** with OpenAI API dashboard
- **Alert on anomalies**: Email if usage >80% of budget
- **Implement circuit breaker**: Disable AI if budget exceeded

---

## 17. Monitoring & Analytics

### 17.1 Metrics to Track

**Usage Metrics**:
- Total AI requests per day/week/month
- Average response time
- Error rate (%)
- Most common questions
- Scale recommendation click-through rate

**Performance Metrics**:
- API latency (p50, p95, p99)
- Client-side render time
- Fretboard load time after scale selection

**Cost Metrics**:
- OpenAI API cost per day
- Cost per user interaction
- Token usage (input vs output)

### 17.2 Logging

**Client-Side** (Console):
```typescript
console.log('[AI Assistant] User message:', message);
console.log('[AI Assistant] AI response:', response);
console.log('[AI Assistant] Scale loaded:', scaleData);
```

**Server-Side** (API Route):
```typescript
console.log('[AI API] Request from IP:', ip);
console.log('[AI API] OpenAI tokens used:', usage.total_tokens);
console.log('[AI API] Response time:', responseTime, 'ms');
```

**Error Tracking**:
- Use Sentry or similar for production error tracking
- Log all API errors with context
- Alert on error rate >5%

---

## 18. Future Enhancements (Post-MVP)

### 18.1 Advanced Features
- **Voice Input**: Use Web Speech API for voice questions
- **Scale Comparison**: "Compare Dorian vs Aeolian" with side-by-side view
- **Progression Builder**: AI suggests full chord progressions, not just scales
- **Practice Exercises**: AI generates scale practice patterns
- **Theory Lessons**: Interactive music theory tutorials

### 18.2 Personalization
- **User Preferences**: Remember favorite genres, skill level
- **Learning Path**: AI tracks progress and suggests next steps
- **Custom Scales**: Save AI-recommended custom scales to library
- **Favorites**: Bookmark useful AI responses

### 18.3 Social Features
- **Share Conversations**: Export chat as PDF or link
- **Community Questions**: See popular questions from other users
- **AI-Generated Lessons**: Create shareable scale lessons

---

## 19. Success Metrics

### 19.1 Launch Goals (First Month)

- **Adoption**: 30% of active users try AI assistant
- **Engagement**: Average 5 messages per session
- **Retention**: 50% of users return to AI assistant within 7 days
- **Satisfaction**: 4+ star rating in user feedback
- **Performance**: <2s average response time
- **Reliability**: 99% uptime, <1% error rate

### 19.2 Long-Term Goals (6 Months)

- **Adoption**: 60% of active users use AI assistant regularly
- **Engagement**: Average 10 messages per session
- **Scale Loads**: 70% of AI recommendations result in fretboard load
- **Cost Efficiency**: <$0.01 per user interaction
- **User Feedback**: "AI assistant is helpful" - 80% agree

---

## 20. Documentation Requirements

### 20.1 Developer Documentation

**README.md** (`components/ai-assistant/README.md`):
- Component architecture overview
- Props and state management
- Integration guide for new features
- Testing instructions

**API Documentation** (`app/api/ai-assistant/README.md`):
- Endpoint specifications
- Request/response schemas
- Error codes and handling
- Rate limiting details

### 20.2 User Documentation

**Help Section** (in-app):
- "How to use the AI Assistant"
- "Understanding scale recommendations"
- "Loading scales onto the fretboard"
- "Troubleshooting common issues"

**Video Tutorial** (optional):
- 2-minute walkthrough of AI assistant
- Example questions and responses
- Demonstration of loading scales

---

## 21. Rollout Strategy

### 21.1 Beta Testing (Week 1-2)

- **Invite 50 beta users** from existing user base
- **Collect feedback** via in-app survey
- **Monitor metrics**: Usage, errors, performance
- **Iterate** based on feedback

### 21.2 Soft Launch (Week 3-4)

- **Enable for 25% of users** (A/B test)
- **Compare metrics** vs control group
- **Optimize** based on data
- **Fix critical bugs**

### 21.3 Full Launch (Week 5)

- **Enable for 100% of users**
- **Announce** via email, social media
- **Monitor closely** for first 48 hours
- **Provide support** for user questions

---

## 22. Appendix: Example Code Snippets

### 22.1 OpenAI Service Implementation

```typescript
// lib/ai-assistant/openai-service.ts
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getChatCompletion(
  userMessage: string,
  conversationHistory: ChatMessage[],
  currentContext?: { key: string; scale: string }
): Promise<AIAssistantResponse> {
  const systemPrompt = buildSystemPrompt(currentContext);
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
    { role: 'user', content: userMessage },
  ];

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    temperature: 0.7,
    max_tokens: 1000,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0].message.content;
  return JSON.parse(responseText) as AIAssistantResponse;
}
```

### 22.2 Scale Parser Implementation

```typescript
// lib/ai-assistant/scale-parser.ts
import { calculateScalePositions, NOTES } from '@/lib/musicTheory';
import { AIScaleRecommendation, FretboardScaleData } from './types';

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
    throw new Error('Invalid intervals');
  }

  // Calculate note positions
  const notePositions = calculateScalePositions(
    aiScale.rootNote,
    aiScale.scaleName,
    tuning
  );

  // Extract chord tones and guide tones
  const chordTones = aiScale.chordTones;
  const guideTones = aiScale.noteDegrees
    .filter(nd => !nd.isChordTone)
    .map(nd => nd.note);

  return {
    rootNote: aiScale.rootNote,
    scaleName: aiScale.scaleName,
    notePositions,
    chordTones,
    guideTones,
  };
}
```

### 22.3 Scale Card Component

```typescript
// components/ai-assistant/ScaleCard.tsx
import { AIScaleRecommendation } from '@/lib/ai-assistant/types';
import { NOTE_COLORS } from '@/lib/musicTheory';

interface ScaleCardProps {
  scale: AIScaleRecommendation;
  onLoad: (scale: AIScaleRecommendation) => void;
  isLoaded: boolean;
}

export function ScaleCard({ scale, onLoad, isLoaded }: ScaleCardProps) {
  const rootColor = NOTE_COLORS[scale.rootNote];

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-all">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: rootColor }}
        >
          {scale.rootNote}
        </div>
        <h3 className="text-lg font-semibold">{scale.scaleName}</h3>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <p className="text-sm text-gray-600">
          <strong>Genre:</strong> {scale.genreContext}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Difficulty:</strong> {'⭐'.repeat(Math.min(scale.difficulty, 5))}
        </p>
        <p className="text-sm">
          <strong>Notes:</strong> {scale.noteDegrees.map(nd => nd.note).join(' ')}
        </p>
        <p className="text-sm italic text-gray-700">{scale.rationale}</p>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onLoad(scale)}
        disabled={isLoaded}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {isLoaded ? '✓ Loaded' : 'Load on Fretboard'}
      </button>
    </div>
  );
}
```

---

## 23. Conclusion

This blueprint provides a comprehensive roadmap for implementing an AI-powered music theory assistant in the Musical Insights application. The system leverages GPT-4o-mini to provide intelligent, context-aware scale and mode recommendations that integrate seamlessly with the existing fretboard visualization.

**Key Success Factors**:
1. **Structured AI Outputs**: JSON schema ensures reliable, parseable responses
2. **Mathematical Precision**: AI provides complete interval and degree data for accurate fretboard rendering
3. **Seamless Integration**: Reuses existing music theory functions and UI patterns
4. **User-Centric Design**: Interactive scale cards with one-click loading
5. **Performance & Cost**: Optimized for speed (<2s) and cost-effectiveness (<$0.01/interaction)

**Next Steps**:
1. Review and approve this blueprint
2. Set up OpenAI API account and obtain API key
3. Begin Phase 1 implementation (Foundation)
4. Iterate based on user feedback during beta testing

This feature will significantly enhance the learning experience for musicians by providing personalized, AI-powered guidance on scales, modes, and music theory concepts.

