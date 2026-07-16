# Real-Time Key Detection - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Database Setup (One-Time)

1. **Copy environment file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Add your Supabase credentials to `.env.local`:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_PROJECT_ID=your-project-id-here
   ```

3. **Run database migrations in Supabase SQL Editor:**
   - Open Supabase Dashboard → SQL Editor
   - Run each file in order:
     1. `sql/migrations/001_create_musical_keys.sql`
     2. `sql/migrations/002_create_scale_compatibility.sql`
     3. `sql/migrations/003_create_detected_key_history.sql`
     4. `sql/migrations/004_seed_musical_keys.sql`

4. **Generate and seed compatibility data:**
   ```bash
   npx ts-node scripts/generateCompatibilityData.ts > sql/migrations/005_seed_compatibility_data.sql
   ```
   
   Then run `005_seed_compatibility_data.sql` in Supabase SQL Editor.

### Step 2: Start the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Step 3: Use Key Detection

1. **Scroll to "Real-Time Key Detection" section**

2. **Select your microphone:**
   - Click the dropdown
   - Choose your audio input device
   - Grant microphone permission if prompted

3. **Start detection:**
   - Click "▶ Start Detection"
   - Play a chord on your guitar
   - Watch the detected key appear!

4. **Explore compatible scales:**
   - View recommended scales sorted by compatibility
   - Click any scale card to apply it to the fretboard
   - See chord tones and guide tones highlighted

## 🎸 How to Use

### Basic Workflow

1. **Connect your guitar** to your computer (via audio interface or microphone)
2. **Select the input device** in the app
3. **Start detection**
4. **Play chords** and watch the key detection work in real-time
5. **Browse compatible scales** and select one to see it on the fretboard

### Tips for Best Results

✅ **DO:**
- Use a clean guitar tone (minimal distortion)
- Play sustained chords (let them ring)
- Position microphone close to guitar
- Use a quiet environment
- Wait 1-2 seconds between chord changes

❌ **DON'T:**
- Play too fast (detection needs time)
- Use heavy distortion (affects accuracy)
- Have loud background noise
- Expect instant results (allow 1-2 seconds)

### Understanding the Display

#### Detected Musical Key
- **Large text**: The detected key (e.g., "C", "Am")
- **Confidence**: How certain the detection is (0-100%)
- Higher confidence = more accurate detection

#### Current Scale/Mode
- Shows the currently selected scale
- Automatically selects the primary (best) scale for the detected key
- You can click other scales to change

#### Chord Tones & Guide Tones
- **Chord Tones**: Root, 3rd, 5th, 7th of the scale
- **Guide Tones**: 3rd and 7th (most important for chord quality)
- Color-coded squares matching the fretboard

#### Compatible Scales
- **Rating (1-10)**: How well the scale fits the detected key
  - 10 = Perfect match
  - 9 = Excellent (diatonic modes)
  - 8 = Very good
  - 7 = Good
  - 6 = Moderate
  - 5 = Acceptable
- **★ PRIMARY**: The best scale for this key
- **Musical Context**: When/how to use this scale

### Scale Selection

Click any scale card to:
- Apply it to the fretboard
- See its chord tones highlighted
- See its guide tones highlighted
- Update the scale display

## 🎵 Musical Examples

### Example 1: Playing in C Major
1. Play a C major chord (C-E-G)
2. App detects: "C" with high confidence
3. Primary scale: "C Major"
4. Try these compatible scales:
   - C Major (10/10) - Primary scale
   - A Minor (10/10) - Relative minor
   - C Pentatonic Major (9/10) - Great for solos
   - G Mixolydian (9/10) - Modal color

### Example 2: Playing in A Minor
1. Play an A minor chord (A-C-E)
2. App detects: "Am" with high confidence
3. Primary scale: "A Minor"
4. Try these compatible scales:
   - A Minor (10/10) - Primary scale
   - C Major (10/10) - Relative major
   - A Pentatonic Minor (9/10) - Blues/rock
   - A Dorian (9/10) - Jazzy sound

### Example 3: Modal Exploration
1. Play a D minor chord
2. App detects: "Dm"
3. Explore different modes:
   - D Dorian (9/10) - Bright minor sound
   - D Aeolian (10/10) - Natural minor
   - D Phrygian (9/10) - Spanish/exotic sound

## 🔧 Troubleshooting

### "No audio devices found"
- **Solution**: Grant microphone permission in browser
- Check that microphone is connected
- Click "🔄 Refresh Devices"

### "Detection not working"
- **Solution**: 
  - Check that audio is reaching the microphone
  - Try playing louder/clearer chords
  - Reduce background noise
  - Try a different microphone

### "Wrong key detected"
- **Solution**:
  - Play the chord more clearly
  - Let the chord ring longer
  - Check tuning of your guitar
  - Try playing the root note more prominently

### "Confidence is low"
- **Solution**:
  - Play cleaner chords
  - Reduce background noise
  - Use less distortion
  - Position microphone better

## 📱 Browser Compatibility

✅ **Fully Supported:**
- Chrome 66+
- Firefox 76+
- Edge 79+

⚠️ **Limited Support:**
- Safari 14.1+ (may have issues)

❌ **Not Supported:**
- Internet Explorer
- Older browsers

## 🎯 Next Steps

After getting comfortable with basic detection:

1. **Experiment with different scales** for the same key
2. **Learn about modal interchange** using the compatibility ratings
3. **Practice improvisation** using the recommended scales
4. **Explore chord progressions** in different keys
5. **Use the manual controls** to override auto-detection when needed

## 💡 Pro Tips

1. **Combine with Chord Library**: Use detected key to find chord progressions
2. **Learn Scale Relationships**: Notice which scales share notes
3. **Practice Modal Playing**: Try different modes of the same key
4. **Use Guide Tones**: Focus on 3rd and 7th for smooth voice leading
5. **Experiment**: Don't be afraid to try "lower rated" scales for unique sounds

## 📚 Additional Resources

- **Full Blueprint**: `blueprints/realtime-key-detection-blueprint.md`
- **Testing Guide**: `docs/KEY_DETECTION_TESTING_GUIDE.md`
- **Database Setup**: `scripts/setupDatabase.md`
- **Essentia.js Docs**: https://github.com/MTG/essentia.js

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review the testing guide for detailed diagnostics
3. Check browser console for error messages
4. Verify database is properly set up

---

**Happy Playing! 🎸🎵**

