# Audio Components

This directory contains React components for audio-related functionality in the application.

## Components

### AudioDeviceSelector
**File**: `AudioDeviceSelector.tsx`

A component that allows users to select audio input devices (WDM devices) for guitar/bass input.

**Features:**
- Enumerates available audio input devices
- Handles microphone permission requests
- Provides a dropdown UI for device selection
- Auto-selects the first available device
- Listens for device changes (plug/unplug)

**Props:**
```typescript
interface AudioDeviceSelectorProps {
  onDeviceSelect: (deviceId: string) => void;
  selectedDeviceId?: string;
  className?: string;
}
```

**Usage:**
```tsx
<AudioDeviceSelector
  onDeviceSelect={(deviceId) => console.log('Selected:', deviceId)}
  selectedDeviceId={currentDeviceId}
/>
```

---

### NoteDisplay
**File**: `NoteDisplay.tsx`

A component that displays the currently detected musical note in a clean, modern interface.

**Features:**
- Large, centered note display
- Real-time frequency readout
- Status indicators (not active, listening, detecting)
- Smooth animations and transitions
- Responsive design

**Props:**
```typescript
interface NoteDisplayProps {
  note: string | null;
  frequency: number | null;
  isActive: boolean;
  className?: string;
}
```

**Usage:**
```tsx
<NoteDisplay
  note="A"
  frequency={440}
  isActive={true}
/>
```

---

## Other Audio Components

### AudioInputSelector
**File**: `AudioInputSelector.tsx`

Component for selecting audio input sources in the key detection system.

### KeyDetectionDisplay
**File**: `KeyDetectionDisplay.tsx`

Displays detected musical key information.

### KeyDetectionPanel
**File**: `KeyDetectionPanel.tsx`

Panel for controlling key detection features.

### CompatibleScalesSection
**File**: `CompatibleScalesSection.tsx`

Shows scales compatible with the detected key.

### ScaleModeCards
**File**: `ScaleModeCards.tsx`

Displays scale mode information in card format.

### ScaleRecommendationCard
**File**: `ScaleRecommendationCard.tsx`

Shows recommended scales based on detected key.

---

## Related Files

### Type Definitions
**File**: `/types/audio.d.ts`

Contains TypeScript type definitions for audio-related functionality.

### Audio Utilities
**Directory**: `/lib/audio/`

Contains utility functions and classes for audio processing:
- `pitchDetector.ts` - Pitch detection engine
- `frequencyToNote.ts` - Frequency to note conversion
- `keyDetectionEngine.ts` - Key detection logic
- `essentiaAnalyzer.ts` - Essentia.js integration
- `audioDeviceManager.ts` - Device management utilities

---

## Development Notes

### Browser Compatibility
- Chrome 74+ ✅
- Firefox 76+ ✅
- Edge 79+ ✅
- Safari 14.1+ ⚠️ (Limited Web Audio API support)

### Security Requirements
- HTTPS or localhost required for microphone access
- User must grant microphone permissions
- Permissions can be revoked at any time

### Performance Considerations
- Audio processing runs in real-time
- CPU usage should be <5% on modern hardware
- Latency typically <50ms
- Proper cleanup is essential to prevent memory leaks

---

## Testing

### Unit Testing
Components should be tested for:
- Proper rendering
- Event handling
- State management
- Error handling

### Integration Testing
Test with:
- Different audio devices
- Various browsers
- Different screen sizes
- Permission denial scenarios

### Performance Testing
Monitor:
- CPU usage
- Memory usage
- Latency
- Frame rate

---

## Contributing

When adding new audio components:
1. Follow the existing component structure
2. Add TypeScript types to `/types/audio.d.ts`
3. Document props and usage
4. Handle errors gracefully
5. Clean up resources properly
6. Test across browsers
7. Update this README

---

**Last Updated**: December 24, 2024

