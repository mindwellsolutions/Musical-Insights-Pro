# Guitar Note Detection Fix - Implementation Summary

## Problem
The note detector was working perfectly with voice/whistling through the webcam microphone, but **not detecting any notes** when using a guitar through the Focusrite USB audio interface.

## Root Causes Identified

### 1. **Audio Device Conflict** ✅ FIXED
- The key detection system was holding exclusive access to the Focusrite device
- The note detector tried to create a separate audio stream, causing conflicts
- **Solution**: Modified `PitchDetector` to accept and share existing `MediaStream` instances

### 2. **Guitar-Specific Detection Challenges** ✅ FIXED
Guitar signals are fundamentally different from voice/whistling:

| Characteristic | Voice/Whistle | Guitar |
|----------------|---------------|--------|
| **Harmonics** | Simple, clear fundamental | Complex overtones that confuse detectors |
| **Attack** | Smooth onset | Sharp transient with noise |
| **Sustain** | Long, steady | Quick decay |
| **Frequency** | 150-500 Hz (easy) | 82-1318 Hz (wide range) |

## Changes Made

### 1. **PitchDetector.ts** - Guitar-Optimized Configuration

#### Buffer Size Increase
```typescript
// BEFORE: bufferSize: 2048
// AFTER:  bufferSize: 4096
```
**Why**: Guitar's low E2 (82Hz) needs ~537 samples per cycle. Larger buffer = better low-frequency detection.

#### High-Pass Filter Added
```typescript
const highPassFilter = audioContext.createBiquadFilter();
highPassFilter.type = 'highpass';
highPassFilter.frequency.value = 60; // Cut below 60Hz
```
**Why**: Removes rumble, handling noise, and low-frequency interference.

#### YIN Threshold Adjustment
```typescript
// BEFORE: threshold: 0.05 (too sensitive for guitar)
// AFTER:  threshold: 0.15 (optimized for guitar harmonics)
```
**Why**: Higher threshold reduces false positives from guitar's complex harmonic content.

#### Noise Gating
```typescript
const noiseGateThreshold = 0.01; // RMS threshold
if (rms < noiseGateThreshold) {
  // Ignore weak signals
}
```
**Why**: Prevents detection attempts on background noise and guitar decay.

#### Smoothing Reduction
```typescript
// BEFORE: smoothingTimeConstant: 0.8
// AFTER:  smoothingTimeConstant: 0.3
```
**Why**: Less smoothing allows faster response to guitar's sharp attack transients.

### 2. **Shared Audio Stream Support**

Modified `PitchDetector.start()` to accept either:
- `string` (device ID) - creates new stream
- `MediaStream` (existing stream) - shares with key detection

```typescript
async start(deviceIdOrStream: string | MediaStream, callback)
```

### 3. **Debug Mode Added**

New debugging features:
- Toggle debug mode via UI checkbox
- Logs RMS levels every 30 frames
- Logs detected frequencies
- Helps diagnose detection issues

## How to Test

### 1. **Enable Debug Mode**
1. Open the app
2. In the Note Detector sidebar, check **"Debug Mode (Console)"**
3. Open browser console (F12)
4. Play a note on your guitar

### 2. **What to Look For in Console**

#### Good Signal:
```
[PitchDetector] RMS: 0.0234, Threshold: 0.01
[PitchDetector] Detected frequency: 82.41 Hz
```

#### Weak Signal (too quiet):
```
[PitchDetector] RMS: 0.0045, Threshold: 0.01
[PitchDetector] Detected frequency: null
```
**Fix**: Turn up your guitar volume or interface gain

#### No Harmonics Detected:
```
[PitchDetector] RMS: 0.0234, Threshold: 0.01
[PitchDetector] Detected frequency: null
```
**Fix**: Play single notes (not chords), use neck pickup, play cleaner

### 3. **Best Practices for Guitar Detection**

✅ **DO**:
- Play single notes (not chords)
- Use neck pickup (warmer, clearer fundamental)
- Play with moderate attack (not too hard)
- Let notes ring out
- Use clean tone (no heavy distortion)

❌ **DON'T**:
- Play chords (confuses pitch detector)
- Use bridge pickup (too bright, more harmonics)
- Play with heavy distortion (masks fundamental)
- Play too softly (below noise gate)
- Mute strings quickly (not enough sustain)

## Technical Details

### Industry-Standard Approaches Used

1. **YIN Algorithm**: Better than autocorrelation for guitar (handles harmonics)
2. **High-Pass Filtering**: Standard for removing low-frequency noise
3. **Noise Gating**: Prevents false detections during silence
4. **Larger Buffer**: Required for low-frequency instruments
5. **RMS-Based Confidence**: Signal strength indicates detection quality

### Frequency Range
- **Min**: 40 Hz (E1 - bass guitar)
- **Max**: 1200 Hz (D#6 - high guitar notes)
- **Optimal**: 82-659 Hz (E2-E5 - standard guitar range)

## Files Modified

1. `lib/audio/pitchDetector.ts` - Core detection engine
2. `components/audio/NoteDetectorSidebar.tsx` - UI and debug controls

## Next Steps (Optional Improvements)

If detection is still problematic:

1. **Try AMDF Algorithm**: Alternative to YIN, sometimes better for guitar
2. **Add Harmonic Product Spectrum (HPS)**: Reinforces fundamental frequency
3. **Implement Median Filtering**: Smooths out detection jitter
4. **Add Onset Detection**: Only detect during note attacks
5. **Use Machine Learning**: Train model specifically for guitar timbres

## References

- YIN Algorithm: http://audition.ens.fr/adc/pdf/2002_JASA_YIN.pdf
- Guitar Pitch Detection: https://github.com/cwilso/PitchDetect
- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API

