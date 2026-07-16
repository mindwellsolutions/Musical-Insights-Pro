# Chord Progression Builder

A professional, timeline-based chord progression builder with real-time audio playback, scale/mode recommendations, and AI-assisted generation.

## Features

### 🎵 Core Functionality
- **Timeline-based editing** - Drag, resize, and arrange chords on a visual timeline
- **Multi-verse support** - Create multiple verses/sections with different progressions
- **Real-time audio playback** - Hear your progressions with piano or guitar sounds
- **BPM control** - Adjust tempo from 60-240 BPM
- **Key selection** - Work in any of the 12 musical keys

### 🎹 Chord Management
- **Drag & drop** - Move chords freely on the timeline
- **Resize** - Adjust chord duration by dragging edges
- **Multiple voicings** - Choose from different chord voicings
- **Color-coded** - Visual distinction between chord types
- **Context menus** - Right-click for quick actions

### 🎼 Scale/Mode Integration
- **Automatic recommendations** - Get scale suggestions for each chord
- **Compatibility scoring** - See how well scales fit with chords
- **Visual assignment** - Assign scales to specific chord sections
- **Multiple modes** - Support for Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, Locrian

### 🤖 Progression Generators

#### Genre-Based Generator
- Pre-built progressions from multiple genres:
  - Rock (I-V-vi-IV, I-IV-V, etc.)
  - Jazz (ii-V-I, etc.)
  - Pop (I-V-vi-IV, etc.)
  - Blues (12-bar blues, etc.)
  - EDM (vi-IV-I-V, etc.)
- Famous song examples
- Difficulty ratings
- Musical character descriptions

#### AI-Assisted Generator
- Natural language prompts ("emotional and melancholic")
- Complexity control (1-10)
- Length customization (2-16 chords)
- Intelligent chord selection based on mood

### 💾 Project Management
- **Save projects** - Store progressions in Supabase database
- **Load projects** - Access saved work anytime
- **Update projects** - Modify and re-save existing projects
- **Delete projects** - Remove unwanted progressions
- **User authentication** - Secure, per-user storage

### ⌨️ Keyboard Shortcuts
- `Space` - Play/Pause
- `Esc` - Stop playback
- `Ctrl+S` - Save project
- `Ctrl+O` - Load project
- `Ctrl+Z` - Undo
- `Ctrl+Shift+Z` - Redo
- `Delete` - Delete selected chord

## Usage

### Creating a Chord Progression

1. **Select a key** - Click "Change Key" in the verse tabs
2. **Add chords** - Click "Add Chord" or use the generator
3. **Arrange chords** - Drag chords to position them
4. **Adjust duration** - Drag chord edges to resize
5. **Play** - Click play to hear your progression

### Using the Genre Generator

1. Click "Open Chord Progression Generator"
2. Select "Genre-Based" tab
3. Choose a genre (Rock, Jazz, Pop, etc.)
4. Browse available progressions
5. Click a progression to select it
6. Click "Load Progression" to add to timeline

### Using the AI Generator

1. Click "Open Chord Progression Generator"
2. Select "AI-Assisted" tab
3. Enter a mood description or select a preset
4. Adjust complexity and length sliders
5. Click "Generate Progression"
6. Review the generated chords
7. Click "Load to Timeline" to use them

### Saving Your Work

1. Click "Save" in the header
2. Enter a project name
3. Add an optional description
4. Click "Save" to store in database

### Loading Projects

1. Click "Load" in the header
2. Browse your saved projects
3. Click "Load" on the desired project
4. Your progression will be restored

## Technical Architecture

### Components
- `ChordProgressionBuilder` - Main container
- `TimelineVisualization` - Timeline display and controls
- `ChordCard` - Individual draggable chord
- `VerseTabsManager` - Multi-verse management
- `PlaybackControls` - Audio playback interface
- `GenreProgressionSelector` - Genre-based generator
- `AIProgressionGenerator` - AI-assisted generator

### State Management
- `useChordProgressionState` - Verse and chord state
- `useTimelinePlayback` - Audio playback state
- `useChordDragResize` - Drag/resize operations
- `useKeyboardShortcuts` - Keyboard event handling

### Audio Engine
- Built with Tone.js
- Polyphonic synthesis
- Piano and guitar instruments
- Real-time BPM synchronization

### Database Schema
- `chord_progression_projects` - Project metadata
- `chord_progression_verses` - Verse data
- `chord_instances` - Individual chords
- `scale_mode_instances` - Scale assignments

### Security
- Row Level Security (RLS) enabled
- User-scoped data access
- Service role admin access
- Secure authentication via Supabase

## File Structure

```
app/chord-progression-builder/
  └── page.tsx

components/chord-progression/
  ├── ChordProgressionBuilder.tsx
  ├── TimelineVisualization.tsx
  ├── ChordCard.tsx
  ├── VerseTabsManager.tsx
  ├── PlaybackControls.tsx
  ├── GenreProgressionSelector.tsx
  ├── AIProgressionGenerator.tsx
  ├── SaveProjectDialog.tsx
  └── LoadProjectDialog.tsx

lib/chord-progression/
  ├── types.ts
  ├── chord-utils.ts
  ├── timeline-utils.ts
  ├── audio-engine.ts
  ├── genre-loader.ts
  └── database-service.ts

hooks/chord-progression/
  ├── useChordProgressionState.ts
  ├── useTimelinePlayback.ts
  ├── useChordDragResize.ts
  └── useKeyboardShortcuts.ts
```

## Future Enhancements

- MIDI export
- Audio file export (WAV/MP3)
- Chord progression analysis
- Harmonic function labeling
- Advanced voicing editor
- Collaboration features
- Mobile responsive design
- Undo/redo history
- Copy/paste chords
- Chord library/favorites

