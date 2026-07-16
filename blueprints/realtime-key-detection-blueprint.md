# Real-Time Musical Key Detection & Scale Recommendation System
## Development Blueprint v1.0

---

## 📋 Executive Summary

This blueprint outlines the complete development plan for integrating real-time audio key detection using Essentia.js into the Modern Guitar Scales application. The system will detect musical keys from system audio or microphone input and automatically recommend compatible scales/modes with their chord tones and guide tones displayed on the fretboard in real-time.

---

## 🎯 Project Objectives

1. **Real-Time Audio Analysis**: Implement Essentia.js for live musical key detection from system audio and microphone inputs
2. **Musical Intelligence Database**: Build comprehensive scale/mode compatibility database with AI-powered compatibility ratings
3. **Dynamic UI Updates**: Create responsive GUI that updates fretboard and scale recommendations as keys change
4. **Supabase Integration**: Store and manage musical compatibility data in Supabase database
5. **Performance Optimization**: Ensure smooth real-time updates without memory leaks or performance degradation

---

## 🏗️ System Architecture

### High-Level Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Audio Input  │  │  Key Display │  │ Scale Selector   │  │
│  │  Selector    │  │  Component   │  │  Cards           │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Audio Processing Layer                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Essentia.js Audio Worklet Processor          │  │
│  │  • Key Detection Algorithm                           │  │
│  │  • Real-time Audio Analysis                          │  │
│  │  • Web Audio API Integration                         │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Musical Intelligence Layer                  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Scale/Mode Compatibility Engine                 │  │
│  │  • Compatibility Rating Algorithm                    │  │
│  │  • Chord Tone Calculation                            │  │
│  │  • Guide Tone Extraction                             │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      Data Storage Layer                      │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Supabase Database                       │  │
│  │  • musical_keys table                                │  │
│  │  • scale_mode_compatibility table                    │  │
│  │  • detected_key_history table                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema Design

### Table 1: `musical_keys`
Stores all possible musical keys and their properties.

```sql
CREATE TABLE musical_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_name TEXT NOT NULL UNIQUE, -- e.g., "C", "C#", "Dm", "F#m"
  root_note TEXT NOT NULL, -- e.g., "C", "C#", "D"
  quality TEXT NOT NULL, -- "major" or "minor"
  scale_degrees INTEGER[], -- Array of semitone intervals
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Table 2: `scale_mode_compatibility`
Maps musical keys to compatible scales/modes with AI-generated compatibility ratings.

```sql
CREATE TABLE scale_mode_compatibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musical_key_id UUID REFERENCES musical_keys(id),
  scale_mode_name TEXT NOT NULL, -- e.g., "Dorian", "Mixolydian"
  root_note TEXT NOT NULL,
  compatibility_rating INTEGER CHECK (compatibility_rating >= 1 AND compatibility_rating <= 10),
  is_primary BOOLEAN DEFAULT FALSE, -- True for the most compatible scale
  chord_tones TEXT[], -- Array of note names
  guide_tones TEXT[], -- Array of note names (3rd and 7th)
  musical_context TEXT, -- Description of when to use this scale
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(musical_key_id, scale_mode_name, root_note)
);
```

### Table 3: `detected_key_history`
Tracks detected keys for analytics and debugging (optional).

```sql
CREATE TABLE detected_key_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detected_key TEXT NOT NULL,
  confidence_score FLOAT,
  detected_at TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT
);
```

---

## 🎼 Musical Compatibility Algorithm

### Compatibility Rating System (1-10 Scale)

#### Rating 10 - Perfect Match
- **Same key scales**: If detecting "C major", C Major scale = 10
- **Relative minor/major**: C major → A minor = 10
- **Parent scale modes**: C major → C Ionian = 10

#### Rating 9 - Excellent Match
- **Diatonic modes of the key**: C major → D Dorian, E Phrygian, F Lydian, G Mixolydian, A Aeolian, B Locrian
- **Pentatonic scales**: C major → C Major Pentatonic, A Minor Pentatonic

#### Rating 8 - Very Good Match
- **Blues scales in key**: C major → C Blues, A Blues
- **Harmonic/Melodic minor variations**: C major → A Harmonic Minor, A Melodic Minor

#### Rating 7 - Good Match
- **Parallel modes**: C major → C Dorian, C Mixolydian
- **Neighboring key modes**: C major → G Mixolydian, F Lydian

#### Rating 6 - Moderate Match
- **Chromatic neighbor scales**: C major → Db Lydian, B Mixolydian
- **Modal interchange**: C major → C Phrygian, C Locrian

#### Rating 5 - Acceptable Match
- **Distant relative modes**: C major → Eb Lydian
- **Altered scales with some common tones**

#### Rating 1-4 - Poor Match
- **Scales with minimal common tones**
- **Highly dissonant combinations**

---

## 🔧 Technology Stack

### Core Technologies
- **Next.js 13.5.1** (App Router)
- **React 18.2.0**
- **TypeScript 5.2.2**
- **Essentia.js** (latest version via CDN)
- **Web Audio API** (AudioWorklet for performance)
- **Supabase** (PostgreSQL database)

### New Dependencies to Install
```json
{
  "essentia.js": "^0.1.3"
}
```

---

## 📁 File Structure

```
/app
  /audio-detection
    page.tsx                    # Main audio detection page (optional separate page)
/components
  /audio
    AudioInputSelector.tsx      # Audio device selection component
    KeyDetectionDisplay.tsx     # Real-time key display component
    ScaleModeCards.tsx          # Compatible scale/mode card grid
    AudioWorkletManager.tsx     # Manages audio worklet lifecycle
  /fretboard
    (existing Fretboard.tsx - will be enhanced)
/lib
  /audio
    essentiaWorkletProcessor.ts # Essentia.js audio worklet code
    audioDeviceManager.ts       # Manages audio input devices
    keyDetectionEngine.ts       # Key detection logic wrapper
  /musical-intelligence
    scaleCompatibility.ts       # Compatibility calculation engine
    musicalKeyMapper.ts         # Maps detected keys to scales
    chordToneCalculator.ts      # Calculates chord and guide tones
  /supabase
    keyDetectionQueries.ts      # Supabase queries for key detection
    compatibilityQueries.ts     # Queries for scale compatibility
/public
  /audio-worklets
    essentia-key-detector.js    # Compiled audio worklet
/sql
  /migrations
    001_create_musical_keys.sql
    002_create_scale_compatibility.sql
    003_seed_compatibility_data.sql
```

---

## 🚀 Development Phases

### Phase 1: Foundation & Setup (Days 1-2)
**Objective**: Set up project infrastructure and dependencies

#### Tasks:
1. ✅ Install Essentia.js dependency
2. ✅ Create Supabase database tables
3. ✅ Set up .env.local with Supabase credentials
4. ✅ Create base file structure
5. ✅ Configure Next.js for audio worklet support

**Deliverables**:
- Database schema created
- Project structure established
- Dependencies installed

---

### Phase 2: Musical Intelligence Database (Days 3-5)
**Objective**: Build comprehensive scale/mode compatibility database

#### Tasks:
1. ✅ Define all 12 major keys (C, C#, D, D#, E, F, F#, G, G#, A, A#, B)
2. ✅ Define all 12 minor keys (Cm, C#m, Dm, D#m, Em, Fm, F#m, Gm, G#m, Am, A#m, Bm)
3. ✅ Calculate compatibility ratings for each key-scale combination
4. ✅ Generate chord tones for each scale/mode
5. ✅ Extract guide tones (3rd and 7th) for each combination
6. ✅ Seed database with compatibility data

**Deliverables**:
- Populated `musical_keys` table (24 keys)
- Populated `scale_mode_compatibility` table (~3,000+ combinations)
- Compatibility algorithm implemented

---

### Phase 3: Audio Detection Engine (Days 6-9)
**Objective**: Implement real-time key detection using Essentia.js

#### Tasks:
1. ✅ Create Essentia.js AudioWorklet processor
2. ✅ Implement key detection algorithm using Essentia's HPCP and Key algorithms
3. ✅ Build audio device manager for input selection
4. ✅ Create Web Audio API integration
5. ✅ Implement debouncing for key change detection
6. ✅ Add confidence scoring for detected keys
7. ✅ Test with various audio sources

**Deliverables**:
- Working audio worklet processor
- Real-time key detection functional
- Audio device selection working

---

### Phase 4: UI Components (Days 10-13)
**Objective**: Build user interface for audio detection and scale recommendations

#### Tasks:
1. ✅ Create AudioInputSelector component
2. ✅ Build KeyDetectionDisplay component
3. ✅ Design ScaleModeCards component with sorting
4. ✅ Integrate with existing Fretboard component
5. ✅ Add chord tone and guide tone display (matching image style)
6. ✅ Implement smooth transitions for key changes
7. ✅ Add loading states and error handling

**Deliverables**:
- Complete UI components
- Integrated with existing app
- Responsive design implemented

---

### Phase 5: Integration & Real-Time Updates (Days 14-16)
**Objective**: Connect all systems for seamless real-time operation

#### Tasks:
1. ✅ Connect key detection to Supabase queries
2. ✅ Implement automatic scale/mode switching on key change
3. ✅ Update fretboard in real-time with new scale
4. ✅ Default chord tones and guide tones to ON state
5. ✅ Implement scale card sorting (highest to lowest compatibility)
6. ✅ Add smooth animations for transitions
7. ✅ Optimize query performance with caching

**Deliverables**:
- Fully integrated system
- Real-time updates working
- Performance optimized

---

### Phase 6: Testing & Optimization (Days 17-19)
**Objective**: Ensure reliability, performance, and user experience

#### Tasks:
1. ✅ Test with various musical keys and genres
2. ✅ Performance profiling and optimization
3. ✅ Memory leak detection and fixes
4. ✅ Cross-browser compatibility testing
5. ✅ Audio latency optimization
6. ✅ Error handling and edge cases
7. ✅ User acceptance testing

**Deliverables**:
- Bug-free application
- Optimized performance
- Comprehensive test coverage

---

### Phase 7: Documentation & Polish (Days 20-21)
**Objective**: Finalize documentation and user experience

#### Tasks:
1. ✅ Write user documentation
2. ✅ Create developer documentation
3. ✅ Add tooltips and help text
4. ✅ Final UI polish and refinements
5. ✅ Performance benchmarking
6. ✅ Deployment preparation

**Deliverables**:
- Complete documentation
- Polished user interface
- Ready for deployment

---

## 🎨 UI/UX Design Specifications

### Key Detection Display
- **Location**: Top center of screen, between Chord Tones and Guide Tones checkboxes
- **Content**: 
  - Detected musical key (large, bold text)
  - Currently selected scale/mode name
  - Chord tones (colorful rounded squares matching NOTE_COLORS)
  - Guide tones (3rd and optionally 7th)
- **Style**: Match existing ChordLibrary card design

### Scale/Mode Cards
- **Layout**: Horizontal scrollable card grid
- **Sorting**: Highest compatibility rating first
- **Card Content**:
  - Scale/mode name
  - Compatibility rating (visual indicator)
  - Chord tones (colored squares)
  - Guide tones (colored squares)
  - Click to switch scale on fretboard
- **Active State**: Highlighted border for currently selected scale

### Audio Input Selector
- **Location**: New section above or beside fretboard
- **Content**:
  - Dropdown for audio device selection
  - Start/Stop detection button
  - Visual indicator for audio activity
  - Confidence meter for detection

---

## ⚡ Performance Considerations

### Memory Management
1. **Audio Worklet**: Properly disconnect and cleanup on component unmount
2. **Event Listeners**: Remove all listeners when stopping detection
3. **Database Queries**: Use React Query for caching and deduplication
4. **State Updates**: Debounce key changes to prevent excessive re-renders

### Optimization Strategies
1. **Request-Level Caching**: Cache compatibility queries for detected keys
2. **Lazy Loading**: Load scale compatibility data only when needed
3. **Web Workers**: Offload heavy calculations to background threads
4. **Memoization**: Use React.memo and useMemo for expensive computations

---

## 🔒 Security & Best Practices

1. **Supabase Auth**: Always use AuthType.Admin for database operations
2. **Input Validation**: Validate all audio input and user selections
3. **Error Boundaries**: Implement React error boundaries for graceful failures
4. **CORS**: Properly configure for Essentia.js CDN resources
5. **Privacy**: No audio recording, only real-time analysis

---

## 📈 Success Metrics

1. **Performance**: Key detection latency < 500ms
2. **Accuracy**: >90% key detection accuracy for clear audio
3. **Responsiveness**: UI updates within 100ms of key change
4. **Stability**: Zero memory leaks during extended use
5. **Compatibility**: Works on Chrome, Firefox, Edge, Safari

---

## 🔄 Future Enhancements

1. **Chord Detection**: Detect individual chords, not just keys
2. **Multi-Instrument Support**: Separate detection for different instruments
3. **Practice Mode**: Record and analyze practice sessions
4. **Export Features**: Save detected progressions
5. **Mobile Support**: Optimize for mobile devices

---

## 📝 Notes & Considerations

- **Browser Compatibility**: AudioWorklet requires modern browsers (Chrome 66+, Firefox 76+)
- **HTTPS Required**: Web Audio API requires secure context
- **Microphone Permissions**: User must grant microphone access
- **System Audio**: May require additional browser extensions or OS-level routing
- **Next.js Static Export**: Current config uses `output: 'export'` - may need adjustment for dynamic features

---

**Blueprint Version**: 1.0  
**Created**: 2025-11-05  
**Status**: Ready for Implementation  
**Estimated Timeline**: 21 days  
**Complexity**: High  
**Priority**: High

