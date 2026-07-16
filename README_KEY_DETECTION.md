# 🎵 Real-Time Musical Key Detection

## Welcome!

This feature brings intelligent, AI-powered musical analysis to Modern Guitar Scales. It listens to your guitar playing and automatically recommends compatible scales with their chord tones and guide tones displayed in real-time.

---

## 🚀 Quick Start (5 Minutes)

### 1. Set Up Database

```bash
# Copy environment template
cp .env.local.example .env.local

# Add your Supabase credentials to .env.local
```

Run these SQL files in Supabase SQL Editor (in order):
1. `sql/migrations/001_create_musical_keys.sql`
2. `sql/migrations/002_create_scale_compatibility.sql`
3. `sql/migrations/003_create_detected_key_history.sql`
4. `sql/migrations/004_seed_musical_keys.sql`

Generate and run compatibility data:
```bash
npx ts-node scripts/generateCompatibilityData.ts > sql/migrations/005_seed_compatibility_data.sql
```
Then run `005_seed_compatibility_data.sql` in Supabase SQL Editor.

### 2. Start the App

```bash
npm run dev
```

### 3. Use It!

1. Scroll to "🎵 Real-Time Key Detection"
2. Select your microphone
3. Click "▶ Start Detection"
4. Play a chord and watch the magic happen!

---

## 📖 Documentation

### For Users
- **[Quick Start Guide](docs/KEY_DETECTION_QUICK_START.md)** - Get started in 5 minutes
- **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment

### For Developers
- **[Feature Documentation](docs/REAL_TIME_KEY_DETECTION.md)** - Complete technical docs
- **[Testing Guide](docs/KEY_DETECTION_TESTING_GUIDE.md)** - Comprehensive testing
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - What was built
- **[Blueprint](blueprints/realtime-key-detection-blueprint.md)** - Original design

### For Database Setup
- **[Database Setup Guide](scripts/setupDatabase.md)** - Detailed SQL instructions

---

## ✨ Features

### 🎸 Real-Time Detection
- Detects musical keys as you play
- Shows confidence score (0-100%)
- Updates within 1-2 seconds
- Works with any microphone

### 🧠 Intelligent Recommendations
- AI-powered compatibility ratings (1-10)
- Sorted from most to least compatible
- Musical context for each scale
- Primary scale highlighting

### 🎨 Visual Display
- Color-coded chord tones
- Guide tones (3rd & 7th)
- Matches existing design
- Dark/light theme support

### 🔄 Seamless Integration
- Auto-updates fretboard
- Manual override available
- Persistent preferences
- Session tracking

---

## 🏗️ What Was Built

### Components (4)
- `AudioInputSelector.tsx` - Device selection
- `KeyDetectionDisplay.tsx` - Key & scale display
- `ScaleModeCards.tsx` - Scale recommendations
- `KeyDetectionPanel.tsx` - Main integration

### Libraries (5)
- `audioDeviceManager.ts` - Audio device management
- `keyDetectionEngine.ts` - Key detection coordination
- `scaleCompatibility.ts` - Musical intelligence
- `keyDetectionQueries.ts` - Database queries
- `client.ts` - Supabase configuration

### Database (3 Tables)
- `musical_keys` - 24 musical keys
- `scale_mode_compatibility` - ~3,000+ mappings
- `detected_key_history` - Analytics

### Audio Processing
- `essentia-key-detector.js` - AudioWorklet processor
- Uses Essentia.js for HPCP and key detection
- High-performance separate thread

---

## 🎯 How It Works

```
Your Guitar
    ↓
Microphone
    ↓
Web Audio API
    ↓
Essentia.js (HPCP + Key Detection)
    ↓
Detected Key (e.g., "C")
    ↓
Database Query (compatible scales)
    ↓
AI Rating System (1-10)
    ↓
Display Recommendations
    ↓
You Select a Scale
    ↓
Fretboard Updates!
```

---

## 🎓 Musical Intelligence

### Compatibility Rating System

**10** - Perfect match (same key, relative major/minor)  
**9** - Excellent (diatonic modes, pentatonic)  
**8** - Very good (blues, harmonic minor)  
**7** - Good (parallel modes)  
**6** - Moderate (chromatic neighbors)  
**5** - Acceptable (experimental)

### Example: C Major

When you play C major, you'll see:
- **C Major** (10/10) ★ PRIMARY - Perfect for melodic lines
- **A Minor** (10/10) - Relative minor, shares all notes
- **C Pentatonic Major** (9/10) - Great for solos
- **G Mixolydian** (9/10) - Modal color
- **D Dorian** (9/10) - Bright minor sound
- And many more...

---

## 🔧 Technology Stack

- **Next.js 13.5.1** - App Router
- **React 18.2.0** - UI components
- **TypeScript 5.2.2** - Type safety
- **Essentia.js 0.1.3** - Music analysis
- **Web Audio API** - Audio processing
- **Supabase** - PostgreSQL database
- **AudioWorklet** - High-performance audio

---

## 📊 Project Stats

- **20+ files created**
- **~3,500+ lines of code**
- **24 musical keys**
- **~3,000+ compatibility mappings**
- **10+ scale types**
- **5 comprehensive guides**
- **7 development phases**

---

## ✅ All Phases Complete

- ✅ Phase 1: Foundation & Setup
- ✅ Phase 2: Musical Intelligence Database
- ✅ Phase 3: Audio Detection Engine
- ✅ Phase 4: UI Components
- ✅ Phase 5: Integration & Real-Time Updates
- ✅ Phase 6: Testing & Optimization
- ✅ Phase 7: Documentation & Polish

---

## 🚀 Deployment

Follow the **[Deployment Checklist](DEPLOYMENT_CHECKLIST.md)** for step-by-step instructions.

**Key Requirements:**
- HTTPS enabled (required for microphone access)
- Supabase database configured
- Environment variables set
- Migrations run
- Compatibility data seeded

---

## 🎸 Tips for Best Results

### ✅ DO:
- Use clean guitar tone
- Play sustained chords
- Position mic close to guitar
- Use quiet environment
- Wait 1-2 seconds between chords

### ❌ DON'T:
- Play too fast
- Use heavy distortion
- Have loud background noise
- Expect instant results

---

## 🌐 Browser Support

- ✅ Chrome 66+
- ✅ Firefox 76+
- ✅ Edge 79+
- ⚠️ Safari 14.1+ (limited)
- ❌ Internet Explorer

---

## 🐛 Troubleshooting

### No audio devices?
→ Grant microphone permission, refresh devices

### Detection not working?
→ Play clearer chords, reduce noise, check tuning

### Wrong key detected?
→ Play root note prominently, let chord ring

### Low confidence?
→ Use less distortion, position mic better

**Full troubleshooting**: See [Testing Guide](docs/KEY_DETECTION_TESTING_GUIDE.md)

---

## 🔮 Future Enhancements

- Polyphonic detection (multiple keys)
- Chord recognition (specific types)
- Tempo detection (BPM)
- Audio recording (save sessions)
- Machine learning (improved accuracy)
- Offline mode (cached Essentia.js)
- Advanced analytics (pattern recognition)

---

## 📚 Learn More

### Musical Concepts
- **Chord Tones**: Root, 3rd, 5th, 7th
- **Guide Tones**: 3rd and 7th (define chord quality)
- **Modes**: Different scales from same notes
- **Compatibility**: How well scales fit together

### Technical Concepts
- **HPCP**: Harmonic Pitch Class Profile
- **AudioWorklet**: High-performance audio processing
- **Debouncing**: Preventing rapid flickering
- **Confidence Score**: Detection certainty

---

## 🎉 You're Ready!

Everything is built and documented. Just follow the deployment checklist and you'll be detecting keys in minutes!

**Questions?** Check the comprehensive documentation in the `docs/` folder.

**Happy Playing! 🎸🎵**

---

## 📄 File Structure

```
Modern Guitar Scales/
├── 📖 Documentation
│   ├── README_KEY_DETECTION.md (this file)
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── docs/
│   │   ├── KEY_DETECTION_QUICK_START.md
│   │   ├── KEY_DETECTION_TESTING_GUIDE.md
│   │   └── REAL_TIME_KEY_DETECTION.md
│   └── blueprints/
│       └── realtime-key-detection-blueprint.md
│
├── 🎨 Components
│   └── components/audio/
│       ├── AudioInputSelector.tsx
│       ├── KeyDetectionDisplay.tsx
│       ├── ScaleModeCards.tsx
│       └── KeyDetectionPanel.tsx
│
├── 📚 Libraries
│   └── lib/
│       ├── audio/
│       ├── musical-intelligence/
│       └── supabase/
│
├── 🗄️ Database
│   ├── sql/migrations/
│   └── scripts/
│
└── 🔊 Audio Processing
    └── public/audio-worklets/
```

---

**Built with ❤️ for guitarists and musicians**

