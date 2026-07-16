# Testing Instructions - Guitar Note Detection with Pitchy

## What Changed

### ✅ Removed
- ❌ Old `pitchDetector.ts` (YIN algorithm) - **NOT USED ANYMORE**
- ❌ Essentia.js integration - **REMOVED**
- ❌ Debug mode toggle - **REMOVED** (was causing errors)

### ✅ Now Using
- ✅ **Pitchy** (McLeod Pitch Method) - Industry standard for guitar tuners
- ✅ **GuitarPitchDetector** - Optimized for guitar signals
- ✅ **Shared audio stream** - No more device conflicts

## Current Settings (Optimized for Guitar)

```typescript
bufferSize: 4096        // Large buffer for low frequencies
minClarity: 0.70        // Lowered from 0.85 for better detection
minFrequency: 70 Hz     // Below low E (82 Hz)
maxFrequency: 1200 Hz   // Above high notes
noiseGate: 0.005        // Lowered from 0.01
highPassFilter: 60 Hz   // Removes rumble
```

## Testing Steps

1. **Refresh the browser** (Ctrl+Shift+R or Cmd+Shift+R) to clear cache

2. **Open Developer Console** (F12) to see debug logs

3. **Start Key Detection** with Focusrite device

4. **Start Note Detector** - should use shared stream

5. **Play a note on your guitar** - watch console for:

### Expected Console Output

```
🎸 Initialized Guitar Pitch Detector (Pitchy - McLeod Pitch Method)
🎸 Guitar Pitch Detector: Using existing MediaStream
🎸 Pitchy initialized: buffer=4096, sampleRate=48000, clarity threshold=0.70
```

When you play a note:
```
🎸 RMS: 0.0234, threshold: 0.005
🎸 Pitchy detected: 329.63 Hz, clarity: 0.823, threshold: 0.70
✅ Note detected: E (329.63 Hz, clarity: 0.823)
```

If clarity is too low:
```
🎸 RMS: 0.0156, threshold: 0.005
🎸 Pitchy detected: 246.94 Hz, clarity: 0.654, threshold: 0.70
❌ Rejected: clarity 0.654 < 0.70
```

## Troubleshooting

### If you see NO detections at all:

1. **Check RMS values** in console:
   - If RMS < 0.005: Your guitar signal is too weak
   - **Solution:** Strum harder, increase guitar volume, or lower `noiseGateThreshold` in `guitarPitchDetector.ts` line 193

2. **Check if Pitchy is loaded:**
   - Look for: `✅ Pitchy library loaded successfully`
   - If missing: Check browser console for import errors

### If you see detections but clarity is too low:

1. **Lower the clarity threshold:**
   - Edit `lib/audio/guitarPitchDetector.ts` line 46
   - Change from `0.70` to `0.60` or `0.50`

2. **Try different strings:**
   - Higher strings (B, E) often have clearer pitch
   - Lower strings (E, A) may need lower threshold

### If you see crazy frequencies (like 19222 Hz):

1. **Hard refresh the browser** (Ctrl+Shift+R)
2. **Check imports** - make sure it's using `GuitarPitchDetector` not `PitchDetector`
3. **Restart dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## What You Should See in the UI

When a note is detected:
- ✅ **Note name** displayed (e.g., "E", "A", "D")
- ✅ **Frequency** shown in Hz (e.g., "329.63 Hz")
- ✅ **Live Notes Glow** highlights the note on fretboard
- ✅ **Tuner** shows if you're sharp/flat

## Fine-Tuning

If detection is too sensitive (false positives):
- **Increase** `minClarity` (line 46): `0.70` → `0.75` → `0.80`
- **Increase** `noiseGateThreshold` (line 193): `0.005` → `0.008` → `0.01`

If detection is not sensitive enough (missing notes):
- **Decrease** `minClarity` (line 46): `0.70` → `0.65` → `0.60`
- **Decrease** `noiseGateThreshold` (line 193): `0.005` → `0.003` → `0.001`

## Success Criteria

✅ Console shows: `🎸 Initialized Guitar Pitch Detector (Pitchy - McLeod Pitch Method)`
✅ Console shows: `🎸 Guitar Pitch Detector: Using existing MediaStream`
✅ When playing guitar, RMS > 0.005
✅ Pitchy detects frequencies in guitar range (70-1200 Hz)
✅ Clarity values are reasonable (0.5-1.0)
✅ Notes are displayed in the UI
✅ No errors about `enableDebug`

## Need More Help?

Check the console logs and share:
1. The RMS values you're seeing
2. The detected frequencies and clarity values
3. Any error messages

