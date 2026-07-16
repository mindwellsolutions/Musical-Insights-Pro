# Guitar Pitch Detection Fix - Implementation Summary

## Problem Identified

The note detector was not detecting guitar notes from the Focusrite USB audio interface for two main reasons:

### 1. **Audio Device Conflict** ✅ FIXED
- The key detection system was using a singleton `AudioDeviceManager` that held exclusive access to the Focusrite device
- When the note detector tried to access the same device, it created a separate `AudioContext` and tried to get a new `MediaStream`
- The browser/OS blocked this because the device was already in use

**Solution:** Modified `PitchDetector` to accept either a device ID OR an existing `MediaStream`, allowing it to share the audio stream from the key detection system.

### 2. **Wrong Algorithm for Guitar** ✅ FIXED
- The original implementation used the **YIN algorithm** from `pitchfinder`
- YIN struggles with guitar signals because:
  - Guitars have complex harmonic content
  - Slower attack times compared to voice/whistling
  - Weaker fundamental frequencies
  - Rich overtones that confuse YIN

**Solution:** Replaced with **Pitchy** library using the **McLeod Pitch Method (MPM)**, which is specifically designed for musical instruments.

## Changes Made

### 1. Modified `lib/audio/pitchDetector.ts`
- Updated `start()` method to accept `string | MediaStream`
- Added logic to detect if we're using a shared stream
- Modified `stop()` to only close streams we created ourselves

### 2. Replaced `lib/audio/guitarPitchDetector.ts`
- **Before:** Used Essentia.js with YIN fallback
- **After:** Uses Pitchy (McLeod Pitch Method)
- Optimized configuration for guitar:
  - `bufferSize: 4096` - Larger buffer for low guitar frequencies (E2 = 82Hz)
  - `minClarity: 0.85` - High threshold to filter noise (MPM clarity is reliable)
  - `minFrequency: 70 Hz` - Below low E with margin
  - `maxFrequency: 1200 Hz` - Above high notes with harmonics
  - High-pass filter at 60Hz to remove rumble
  - Noise gate at RMS threshold 0.01

### 3. Updated `components/audio/NoteDetectorSidebar.tsx`
- Modified to check for shared audio stream from `AudioDeviceManager`
- Falls back to creating its own stream if none available
- Both manual start and auto-start use shared stream logic

### 4. Created `lib/audio/pitchyDetector.ts`
- New standalone implementation using Pitchy
- Can be used as alternative to `GuitarPitchDetector`

## Why Pitchy (McLeod Pitch Method) Works Better for Guitar

### McLeod Pitch Method (MPM) Advantages:
1. **Designed for musical instruments** - Handles complex harmonic content
2. **Better fundamental detection** - Doesn't get confused by strong harmonics
3. **Clarity measure** - Provides reliable 0-1 confidence score
4. **Fast and accurate** - Real-time performance suitable for tuners
5. **Proven track record** - Used in many guitar tuner applications

### Configuration Optimizations:
- **Larger buffer (4096)** - Better frequency resolution for low notes
- **High clarity threshold (0.85)** - Filters out noise and uncertain detections
- **High-pass filter (60Hz)** - Removes rumble and electrical noise
- **Noise gate (RMS 0.01)** - Ignores weak signals
- **Less smoothing (0.3)** - Faster response to guitar transients

## Testing

To test the fix:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open the app and navigate to the fretboard**

3. **Enable Key Detection** with your Focusrite device

4. **Enable Note Detector** - it should now use the shared audio stream

5. **Play a note on your guitar** - you should see:
   - Frequency detected in Hz
   - Note name displayed
   - Live notes glow on fretboard (if enabled)
   - Tuner showing pitch accuracy

## Expected Behavior

- ✅ Note detector works with Focusrite WDM input
- ✅ Detects guitar notes accurately
- ✅ Shows frequency in Hz
- ✅ Shows note name
- ✅ Works simultaneously with key detection
- ✅ No audio device conflicts

## Troubleshooting

If notes still aren't detected:

1. **Check signal level** - Strum harder or increase guitar volume
2. **Adjust noise gate** - Lower `noiseGateThreshold` in `guitarPitchDetector.ts` (line 199)
3. **Adjust clarity threshold** - Lower `minClarity` from 0.85 to 0.75 (line 46)
4. **Check browser console** - Look for Pitchy initialization messages

## Technical References

- **Pitchy GitHub:** https://github.com/ianprime0509/pitchy
- **McLeod Pitch Method Paper:** "A Smarter Way to Find Pitch" by Philip McLeod and Geoff Wyvill
- **Pitchy Playground:** https://ianjohnson.dev/pitchy/playground.html

