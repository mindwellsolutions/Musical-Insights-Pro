# Real-Time Musical Key Detection Feature

## 🎵 Overview

The Real-Time Key Detection feature brings intelligent, AI-powered musical analysis to Modern Guitar Scales. It listens to your guitar playing through your microphone, detects the musical key in real-time, and automatically recommends compatible scales and modes with their chord tones and guide tones.

## ✨ Key Features

### 1. Real-Time Audio Analysis
- **Essentia.js Integration**: Uses industry-standard music information retrieval library
- **AudioWorklet Processing**: High-performance audio processing on separate thread
- **Low Latency**: Detects keys within 1-2 seconds
- **Confidence Scoring**: Shows how certain the detection is (0-100%)

### 2. Intelligent Scale Recommendations
- **AI-Powered Compatibility Ratings**: Each scale rated 1-10 for compatibility
- **Musical Context**: Explains when and how to use each scale
- **Sorted by Relevance**: Best scales appear first
- **Primary Scale Highlighting**: ★ PRIMARY badge for the best match

### 3. Visual Chord Tone Display
- **Color-Coded Notes**: Matches existing fretboard color scheme
- **Chord Tones**: Root, 3rd, 5th, 7th displayed
- **Guide Tones**: 3rd and 7th highlighted separately
- **Consistent Design**: Matches ChordLibrary card style

### 4. Seamless Integration
- **Auto-Updates Fretboard**: Selected scale applies immediately
- **Manual Override**: Can still manually select scales
- **Persistent Settings**: Manual selections saved to localStorage
- **Theme Support**: Works with dark and light themes

## 🏗️ Architecture

### Technology Stack

#### Frontend
- **Next.js 13.5.1**: App Router with React Server Components
- **React 18.2.0**: Client-side interactivity
- **TypeScript 5.2.2**: Type-safe development
- **Web Audio API**: Native browser audio processing

#### Audio Processing
- **Essentia.js 0.1.3**: Music analysis algorithms
- **AudioWorklet**: High-performance audio thread
- **HPCP Algorithm**: Harmonic Pitch Class Profile for key detection
- **Key Detection Algorithm**: Temperley profile for accuracy

#### Database
- **Supabase**: PostgreSQL database
- **3 Tables**:
  - `musical_keys`: All 24 musical keys
  - `scale_mode_compatibility`: ~3,000+ compatibility mappings
  - `detected_key_history`: Analytics and debugging

#### State Management
- **React Hooks**: useState, useEffect, useCallback, useRef
- **Local Storage**: Persistent user preferences
- **Session Tracking**: UUID-based session management

### System Flow

```
Microphone Input
    ↓
AudioDeviceManager (manages input devices)
    ↓
Web Audio API (creates audio graph)
    ↓
AudioWorklet (essentia-key-detector.js)
    ↓
Essentia.js (HPCP + Key Detection)
    ↓
KeyDetectionEngine (debouncing, filtering)
    ↓
KeyDetectionPanel (React component)
    ↓
Supabase Query (get compatible scales)
    ↓
ScaleModeCards (display recommendations)
    ↓
User Selection
    ↓
Fretboard Update (real-time visualization)
```

## 📊 Database Schema

### musical_keys
```sql
CREATE TABLE musical_keys (
  id UUID PRIMARY KEY,
  key_name TEXT UNIQUE,        -- "C", "Dm", "F#m"
  root_note TEXT,              -- "C", "D", "F#"
  quality TEXT,                -- "major" or "minor"
  scale_degrees INTEGER[],     -- [0, 2, 4, 5, 7, 9, 11]
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### scale_mode_compatibility
```sql
CREATE TABLE scale_mode_compatibility (
  id UUID PRIMARY KEY,
  musical_key_id UUID REFERENCES musical_keys(id),
  scale_mode_name TEXT,        -- "Dorian", "Mixolydian"
  root_note TEXT,              -- Root of the scale
  compatibility_rating INTEGER, -- 1-10
  is_primary BOOLEAN,          -- True for best match
  chord_tones TEXT[],          -- ["C", "E", "G", "B"]
  guide_tones TEXT[],          -- ["E", "B"]
  musical_context TEXT,        -- Usage description
  scale_intervals INTEGER[],   -- [0, 2, 3, 5, 7, 8, 10]
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### detected_key_history
```sql
CREATE TABLE detected_key_history (
  id UUID PRIMARY KEY,
  detected_key TEXT,           -- Detected key name
  confidence_score FLOAT,      -- 0.0 to 1.0
  detected_at TIMESTAMPTZ,
  session_id TEXT,             -- Session tracking
  audio_source TEXT,           -- "microphone", etc.
  created_at TIMESTAMPTZ
);
```

## 🎯 Compatibility Rating System

The AI-powered rating system evaluates scale compatibility on a 1-10 scale:

### Rating 10: Perfect Match
- Same key and scale (C Major in C Major)
- Relative minor/major (Am in C Major, C Major in Am)

### Rating 9: Excellent Match
- Diatonic modes (all modes of the key)
- Pentatonic scales within the key

### Rating 8: Very Good Match
- Blues scales with good common tones
- Harmonic/Melodic minor variations

### Rating 7: Good Match
- Parallel modes (same root, different mode)
- Strong harmonic relationships

### Rating 6: Moderate Match
- Chromatic neighbor scales
- Modal interchange possibilities

### Rating 5: Acceptable Match
- Experimental sounds
- Outside playing options

### Rating 1-4: Poor Match
- Limited compatibility
- Use sparingly for specific effects

## 🎸 Musical Intelligence

### Compatibility Algorithm

The system calculates compatibility based on:

1. **Common Tones**: How many notes are shared
2. **Modal Relationships**: Diatonic modes score higher
3. **Harmonic Distance**: Closer keys score higher
4. **Musical Theory**: Traditional relationships (relative major/minor)
5. **Practical Usage**: Real-world musical applications

### Musical Context

Each scale includes context like:
- "Primary scale for C. Perfect for melodic lines and improvisation."
- "Diatonic mode of C. Excellent for modal improvisation and color."
- "Strong harmonic relationship with C. Great for adding tension and color."

## 🔧 Component Structure

### Core Components

#### KeyDetectionPanel
- Main integration component
- Manages state and coordination
- Handles audio device lifecycle
- Coordinates database queries

#### AudioInputSelector
- Device selection UI
- Start/Stop controls
- Status indicators
- Permission handling

#### KeyDetectionDisplay
- Shows detected key
- Displays confidence
- Shows current scale
- Displays chord/guide tones

#### ScaleModeCards
- Grid of compatible scales
- Sorted by rating
- Interactive selection
- Visual feedback

### Library Modules

#### audioDeviceManager.ts
- Manages audio input devices
- Handles Web Audio API
- Device enumeration
- Permission management

#### keyDetectionEngine.ts
- Coordinates key detection
- Manages AudioWorklet
- Debouncing logic
- Confidence filtering

#### scaleCompatibility.ts
- Compatibility calculations
- Musical intelligence
- Rating algorithm
- Context generation

#### keyDetectionQueries.ts
- Supabase database queries
- Data fetching
- History recording
- Analytics

## 🚀 Performance Optimizations

### Memory Management
- Proper cleanup of audio nodes
- Buffer size limits
- Event listener cleanup
- React component unmounting

### CPU Optimization
- AudioWorklet (separate thread)
- Configurable detection intervals
- Debouncing to prevent excessive updates
- Efficient buffer management

### Network Optimization
- Request-level caching
- Batch database queries
- Minimal re-renders
- Optimistic UI updates

## 🔒 Security Considerations

### Browser Permissions
- Requires microphone permission
- HTTPS required for Web Audio API
- User-initiated actions only
- Clear permission prompts

### Database Security
- Row Level Security (RLS) optional
- Public read access for scales
- Controlled write access for history
- No sensitive data stored

### Privacy
- No audio recording
- No audio transmission
- Local processing only
- Optional history tracking

## 📈 Analytics & Monitoring

### Tracked Metrics
- Detection frequency
- Confidence scores
- Most common keys
- Session duration
- Device usage

### Available Queries
```typescript
// Get detection statistics
const stats = await getDetectionStats(sessionId);
// Returns: {
//   totalDetections: number,
//   averageConfidence: number,
//   mostCommonKey: string,
//   keyFrequency: Record<string, number>
// }
```

## 🎓 Educational Value

### Learning Opportunities
1. **Scale Relationships**: See how scales relate to keys
2. **Modal Theory**: Understand modes and their uses
3. **Chord Tones**: Learn important notes in scales
4. **Guide Tones**: Master voice leading
5. **Musical Context**: When to use each scale

### Practice Applications
1. **Ear Training**: Match what you hear to what you see
2. **Improvisation**: Explore compatible scales
3. **Composition**: Find interesting scale choices
4. **Theory**: Understand key relationships
5. **Performance**: Quick scale reference

## 🔮 Future Enhancements

### Planned Features
1. **Polyphonic Detection**: Multiple keys simultaneously
2. **Chord Recognition**: Identify specific chord types
3. **Tempo Detection**: BPM analysis
4. **Audio Recording**: Save and replay sessions
5. **Machine Learning**: Improved accuracy
6. **Offline Mode**: Cached Essentia.js
7. **Advanced Analytics**: Pattern recognition

### Potential Integrations
1. **MIDI Support**: Hardware controller integration
2. **DAW Integration**: Connect to recording software
3. **Backing Tracks**: Auto-generate accompaniment
4. **Practice Tools**: Metronome, looper
5. **Social Features**: Share detections

## 📚 Documentation

### Available Guides
- **Quick Start**: `docs/KEY_DETECTION_QUICK_START.md`
- **Testing Guide**: `docs/KEY_DETECTION_TESTING_GUIDE.md`
- **Database Setup**: `scripts/setupDatabase.md`
- **Blueprint**: `blueprints/realtime-key-detection-blueprint.md`

### Code Documentation
- Inline comments in all source files
- TypeScript type definitions
- JSDoc comments for public APIs
- SQL schema comments

## 🤝 Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase database
4. Run migrations
5. Start dev server: `npm run dev`

### Code Style
- TypeScript for type safety
- Functional React components
- Inline styles with theme objects
- Comprehensive error handling
- Memory leak prevention

## 📄 License

Part of Modern Guitar Scales application.

---

**Built with ❤️ for guitarists and musicians**

