# Real-Time Key Detection - Testing & Deployment Guide

## Overview

This guide covers testing, optimization, and deployment of the Real-Time Key Detection feature for Modern Guitar Scales.

## Prerequisites

Before testing, ensure:

1. ✅ All dependencies installed (`npm install`)
2. ✅ Supabase database configured (`.env.local` with credentials)
3. ✅ Database migrations run (all SQL files in `sql/migrations/`)
4. ✅ Compatibility data seeded
5. ✅ HTTPS enabled (required for Web Audio API)

## Testing Checklist

### Phase 1: Database Testing

#### Test 1: Verify Database Schema
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) FROM musical_keys; -- Should return 24
SELECT COUNT(*) FROM scale_mode_compatibility; -- Should return thousands
SELECT COUNT(*) FROM detected_key_history; -- Should return 0 initially
```

#### Test 2: Verify Compatibility Data
```sql
-- Check C major compatibility
SELECT 
  mk.key_name,
  smc.scale_mode_name,
  smc.root_note,
  smc.compatibility_rating,
  smc.is_primary
FROM scale_mode_compatibility smc
JOIN musical_keys mk ON smc.musical_key_id = mk.id
WHERE mk.key_name = 'C'
ORDER BY smc.compatibility_rating DESC
LIMIT 10;
```

Expected: Should see C Major as primary (rating 10), followed by other compatible scales.

### Phase 2: Audio Device Testing

#### Test 1: Device Enumeration
1. Open the application
2. Navigate to "Real-Time Key Detection" section
3. Click "Refresh Devices"
4. Verify: List of available microphones appears

#### Test 2: Permission Handling
1. Deny microphone permission
2. Verify: Appropriate error message shown
3. Grant permission
4. Verify: Devices load successfully

### Phase 3: Key Detection Testing

#### Test 1: Basic Detection
1. Select a microphone
2. Click "Start Detection"
3. Play a C major chord on guitar
4. Verify:
   - Status shows "Detecting..."
   - Detected key appears within 2-3 seconds
   - Confidence score is reasonable (>30%)

#### Test 2: Key Changes
1. Start detection
2. Play C major chord
3. Wait for detection
4. Play G major chord
5. Verify:
   - Key changes from C to G
   - Debouncing prevents rapid flickering
   - Confidence updates appropriately

#### Test 3: Scale Recommendations
1. Detect a key (e.g., C major)
2. Verify:
   - Compatible scales appear sorted by rating
   - Primary scale is highlighted with ★ PRIMARY badge
   - Ratings range from 5-10
   - Chord tones and guide tones display correctly

### Phase 4: UI/UX Testing

#### Test 1: Visual Consistency
1. Check that note colors match between:
   - Key Detection Display
   - Scale Mode Cards
   - Chord Library
   - Fretboard

#### Test 2: Theme Switching
1. Switch between dark and light themes
2. Verify all components update correctly
3. Check contrast and readability

#### Test 3: Responsive Design
1. Test on different screen sizes
2. Verify cards wrap appropriately
3. Check mobile compatibility

### Phase 5: Performance Testing

#### Test 1: Memory Leaks
1. Start detection
2. Let run for 5 minutes
3. Open Chrome DevTools > Performance > Memory
4. Take heap snapshot
5. Stop detection
6. Take another heap snapshot
7. Verify: No significant memory growth

#### Test 2: CPU Usage
1. Start detection
2. Open Chrome DevTools > Performance
3. Record for 30 seconds
4. Verify: CPU usage stays reasonable (<20% on modern hardware)

#### Test 3: Audio Latency
1. Play a chord
2. Measure time to detection
3. Target: <2 seconds for initial detection
4. Target: <1 second for subsequent detections

### Phase 6: Integration Testing

#### Test 1: Fretboard Updates
1. Start detection
2. Detect a key
3. Select a compatible scale
4. Verify:
   - Fretboard updates with new scale
   - Chord tones highlight correctly
   - Guide tones highlight correctly

#### Test 2: Manual Override
1. Detect a key automatically
2. Manually change scale in "Select Scale & Key (Manual)"
3. Verify: Manual selection overrides auto-detection

#### Test 3: Persistence
1. Detect a key and select a scale
2. Refresh the page
3. Verify: Manual selections persist (localStorage)
4. Note: Auto-detected keys don't persist (by design)

## Known Issues & Limitations

### Browser Compatibility
- ✅ Chrome 66+ (full support)
- ✅ Firefox 76+ (full support)
- ⚠️ Safari 14.1+ (limited support, may have issues)
- ❌ Internet Explorer (not supported)

### Audio Input Limitations
- System audio capture requires browser extensions or OS-level routing
- Microphone input works natively
- Background noise can affect detection accuracy

### Detection Accuracy
- Works best with:
  - Clean, sustained chords
  - Minimal background noise
  - Proper microphone positioning
- May struggle with:
  - Very fast chord changes
  - Heavy distortion
  - Multiple instruments playing simultaneously

## Optimization Tips

### 1. Improve Detection Accuracy
```typescript
// Adjust in KeyDetectionEngine constructor
{
  debounceMs: 1000, // Increase for more stable detection
  minConfidence: 0.5, // Increase to filter out uncertain detections
}
```

### 2. Reduce CPU Usage
```javascript
// In essentia-key-detector.js
this.detectionInterval = 4096; // Increase to analyze less frequently
```

### 3. Memory Management
- Ensure all audio nodes are properly disconnected
- Clear buffers when stopping detection
- Use cleanup functions in React components

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Memory leaks checked
- [ ] Performance profiled
- [ ] Cross-browser tested
- [ ] Mobile tested
- [ ] Database seeded in production

### Environment Variables
```bash
# Production .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_PROJECT_ID=your-project-id
```

### Build & Deploy
```bash
# Build for production
npm run build

# Test production build locally
npm run start

# Deploy to your hosting platform
# (Vercel, Netlify, etc.)
```

### Post-Deployment
- [ ] Verify HTTPS is enabled
- [ ] Test microphone permissions
- [ ] Verify database connectivity
- [ ] Check error logging
- [ ] Monitor performance metrics

## Troubleshooting

### Issue: "Failed to initialize Essentia.js"
**Solution:** Check that `/audio-worklets/essentia-key-detector.js` is accessible and CDN links are working.

### Issue: "No audio devices found"
**Solution:** Ensure microphone permissions are granted and devices are connected.

### Issue: "Key detection not working"
**Solution:** 
1. Check browser console for errors
2. Verify audio input is receiving signal
3. Try different microphone
4. Check confidence threshold settings

### Issue: "Memory leak detected"
**Solution:**
1. Ensure `cleanup()` is called on component unmount
2. Check that all audio nodes are disconnected
3. Verify no circular references in callbacks

### Issue: "Slow performance"
**Solution:**
1. Increase `detectionInterval` in worklet
2. Reduce `bufferSize` if possible
3. Check for other CPU-intensive processes

## Success Metrics

### Performance Targets
- Initial detection: <2 seconds
- Subsequent detections: <1 second
- CPU usage: <20% average
- Memory growth: <10MB per hour
- Accuracy: >80% for clean audio

### User Experience Targets
- Device selection: <5 seconds
- Permission grant: <10 seconds
- First detection: <5 seconds total
- Scale recommendation: Instant after detection

## Future Enhancements

1. **Polyphonic Detection**: Detect multiple keys simultaneously
2. **Chord Recognition**: Identify specific chord types
3. **Tempo Detection**: Detect BPM for rhythm features
4. **Audio Recording**: Save and replay detected sessions
5. **Machine Learning**: Improve accuracy with ML models
6. **Offline Mode**: Cache Essentia.js for offline use
7. **Advanced Analytics**: Track detection patterns over time

## Support

For issues or questions:
1. Check this guide first
2. Review blueprint: `blueprints/realtime-key-detection-blueprint.md`
3. Check database setup: `scripts/setupDatabase.md`
4. Review code comments in source files

