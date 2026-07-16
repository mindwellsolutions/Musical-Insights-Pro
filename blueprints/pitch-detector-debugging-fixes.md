# Pitch Detector Debugging Fixes

## Issue
The note detector wasn't detecting any frequencies when users played notes, talked, or clapped.

## Root Cause Analysis
Several potential issues were identified:
1. **Sample Rate Mismatch**: Forcing AudioContext to use 44100 Hz when browser might use different rate
2. **Buffer Size**: 4096 might be too large for real-time detection
3. **YIN Threshold**: Default 0.1 might not be sensitive enough
4. **Module Import**: Incorrect reference to YIN detector function
5. **Lack of Debugging**: No visibility into what's happening during audio processing

## Changes Made

### 1. Fixed Sample Rate Handling
**Before**:
```typescript
this.state.audioContext = new AudioContext({
  sampleRate: this.config.sampleRate, // Forcing 44100
});
```

**After**:
```typescript
// Use browser's default sample rate instead of forcing 44100
this.state.audioContext = new AudioContext();
const actualSampleRate = this.state.audioContext.sampleRate;
this.config.sampleRate = actualSampleRate; // Update config to match
```

**Reason**: Browsers may not support 44100 Hz and will use their default (often 48000 Hz). Forcing a specific rate can cause issues.

### 2. Reduced Buffer Size
**Before**:
```typescript
bufferSize: 4096,
```

**After**:
```typescript
bufferSize: 2048,  // Reduced from 4096 for better real-time performance
```

**Reason**: Smaller buffer = lower latency and more responsive detection for real-time use.

### 3. Lowered YIN Threshold
**Before**:
```typescript
threshold: 0.1,
```

**After**:
```typescript
threshold: 0.05,  // More sensitive
```

**Reason**: Lower threshold makes the detector more sensitive to quieter sounds.

### 4. Fixed Pitchfinder Module Import
**Before**:
```typescript
let YIN: any = null;

async function initializePitchfinder() {
  const Pitchfinder = (await import('pitchfinder')).default;
  YIN = Pitchfinder.YIN;
}

// Later...
this.detector = YIN({ sampleRate, threshold });
```

**After**:
```typescript
let Pitchfinder: any = null;

async function initializePitchfinder() {
  Pitchfinder = (await import('pitchfinder')).default;
}

// Later...
this.detector = Pitchfinder.YIN({ sampleRate, threshold });
```

**Reason**: Need to keep reference to the Pitchfinder module, not just the YIN function.

### 5. Added Comprehensive Debugging
Added logging throughout the process:

**Initialization Logs**:
- ✅ Pitchfinder initialized
- ✅ Media stream obtained
- ✅ AudioContext created with sample rate
- ✅ Analyser node created
- ✅ Source node connected
- ✅ YIN detector initialized
- ✅ Audio processing started

**Runtime Logs**:
- 🎤 Audio level (RMS) - Shows if microphone is picking up sound
- 🔍 YIN detector output - Shows raw detector results
- 🎵 Detected frequency - Shows valid frequencies
- ⚠️ Processing warnings - Shows if processing stops unexpectedly
- ❌ Error messages - Shows any errors in detection

### 6. Added Audio Signal Validation
```typescript
// Calculate RMS to check if there's any audio signal
let sum = 0;
for (let i = 0; i < buffer.length; i++) {
  sum += buffer[i] * buffer[i];
}
const rms = Math.sqrt(sum / buffer.length);
```

**Reason**: Helps verify that audio is actually being captured from the microphone.

## Testing Instructions

1. **Open Browser Console** (F12)
2. **Navigate to Note Detector** (sidebar or /note-detector page)
3. **Click "Enable Microphone"** (if needed)
4. **Select Audio Device** from dropdown
5. **Click "Start"**
6. **Watch Console Logs**:
   - Should see initialization logs (✅)
   - Should see periodic audio level logs (🎤)
   - Should see YIN detector output logs (🔍)
   - When you play a note/talk/clap, should see frequency logs (🎵)

## Expected Console Output

### On Start:
```
✅ Pitchfinder module loaded: [Object]
✅ Pitchfinder initialized
✅ Media stream obtained: Microphone (Focusrite Solo)
✅ AudioContext created with sample rate: 48000
✅ Analyser node created with FFT size: 2048
✅ Source node connected to analyser
✅ YIN detector initialized with sample rate: 48000 threshold: 0.05
✅ Detector function: function
✅ Audio processing started
```

### During Detection (every ~1 second):
```
🎤 Audio level (RMS): 0.0234 Buffer range: -0.1234 to 0.1456 Buffer length: 2048
🔍 YIN detector output: 440.5 type: number
```

### When Note Detected:
```
🎵 Detected frequency: 440.50 Hz in range: true
```

## Troubleshooting

### If you see low RMS values (< 0.001):
- Microphone is not picking up sound
- Check microphone volume/gain
- Check if correct device is selected
- Try speaking louder or playing louder

### If you see good RMS but no frequencies:
- YIN detector might not be finding a clear pitch
- Try playing a sustained note (not a chord)
- Try a clearer sound source (whistle, sine wave)

### If you see frequencies but they're out of range:
- Check minFrequency (40 Hz) and maxFrequency (1200 Hz)
- Your sound might be too low or too high
- For voice: typical range is 80-300 Hz (male) or 150-500 Hz (female)
- For guitar: E2 (82 Hz) to E6 (1318 Hz)

## Next Steps

After reviewing console logs, we can:
1. Adjust threshold if needed
2. Adjust frequency range if needed
3. Try different pitch detection algorithms (AMDF, Dynamic Wavelet)
4. Add pre-processing (filtering, normalization)

---

**Status**: Debugging enabled, awaiting test results
**Date**: December 24, 2024

