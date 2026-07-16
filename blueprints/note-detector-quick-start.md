# Real-Time Note Detector - Quick Start Guide

## 🎸 What is This?

The Real-Time Note Detector is a web-based tool that listens to your guitar or bass through your audio interface and displays the musical note you're playing in real-time. It works simultaneously with your DAW (like Reaper), so you can record and see what notes you're playing at the same time.

## 🚀 How to Use

### Step 1: Access the Note Detector
1. Open the app in your browser (http://localhost:3000)
2. Click the **Menu** button (☰) in the top-right corner
3. Select **"Note Detector"** from the dropdown menu

### Step 2: Grant Microphone Permission
1. Click the **"Enable Microphone Access"** button
2. Your browser will ask for permission to use your microphone
3. Click **"Allow"** to grant permission

### Step 3: Select Your Audio Input
1. From the **"Audio Input Device"** dropdown, select your audio interface
   - Example: "Focusrite Solo Input 1"
   - Example: "Scarlett 2i2 USB"
2. Make sure your guitar/bass is plugged into the selected input

### Step 4: Start Detection
1. Click the **"Start Detection"** button
2. The status indicator will turn yellow (Listening...)
3. Play a note on your guitar or bass
4. The detected note will appear in the large circle
5. The frequency (in Hz) will be displayed below

### Step 5: Stop Detection
1. Click the **"Stop Detection"** button when you're done
2. The detector will stop and release the audio input

## 🎯 Features

### Note Display
- **Large, clear note display** - Easy to read from a distance
- **Flat notation** - Notes displayed as Bb, Db, Eb, Gb, Ab (not sharps)
- **Real-time updates** - Low latency (~50ms)
- **Frequency readout** - Shows the exact frequency in Hz

### Status Indicators
- **Gray dot** - Not active
- **Yellow dot** - Listening (no note detected)
- **Green dot (pulsing)** - Note detected

### Technical Specs
- **Algorithm**: YIN pitch detection (highly accurate)
- **Frequency Range**: 40 Hz - 1200 Hz (E1 to D#6)
- **Sample Rate**: 44.1 kHz
- **Accuracy**: ±5 cents
- **Latency**: ~50ms typical

## 🎵 Use Cases

### Practice & Learning
- **Ear training** - Play notes and verify what you're hearing
- **Tuning verification** - Check if you're in tune
- **Note identification** - Learn the fretboard by seeing note names

### Recording & Production
- **DAW compatibility** - Works while Reaper (or other DAWs) record the same input
- **Real-time feedback** - See what notes you're playing during recording
- **Improvisation aid** - Identify notes while jamming

### Live Performance
- **Quick reference** - Verify notes during soundcheck
- **Tuning check** - Make sure you're in tune before performing

## 🔧 Troubleshooting

### "Microphone permission denied"
- **Solution**: Click the lock icon in your browser's address bar and allow microphone access
- **Chrome**: Settings → Privacy and security → Site settings → Microphone
- **Firefox**: Settings → Privacy & Security → Permissions → Microphone

### "No audio input devices found"
- **Solution**: Make sure your audio interface is connected and recognized by your computer
- **Check**: System sound settings to verify the device is available

### "Note detection not working"
- **Check volume**: Make sure your guitar/bass signal is strong enough
- **Check input**: Verify you selected the correct input on your audio interface
- **Check cable**: Ensure your instrument cable is properly connected
- **Check gain**: Adjust the gain on your audio interface if needed

### "Works in Chrome but not Firefox/Edge"
- **Note**: Web Audio API support varies by browser
- **Recommended**: Use Chrome or Edge for best compatibility
- **Firefox**: Should work but may have slightly different behavior

### "Interferes with DAW recording"
- **Solution**: This shouldn't happen! The detector only reads the audio, it doesn't modify it
- **Check**: Make sure you're not using the same device in exclusive mode in your DAW

## 🌐 Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 74+ | ✅ Full | Recommended |
| Edge 79+ | ✅ Full | Recommended |
| Firefox 76+ | ✅ Full | Works well |
| Safari 14.1+ | ⚠️ Limited | Web Audio API limitations |

## 📝 Tips & Best Practices

1. **Use a clean signal** - Direct input works best (no heavy effects)
2. **Adjust gain properly** - Not too quiet, not clipping
3. **Play single notes** - Polyphonic detection is not supported
4. **Wait for detection** - Give it a moment to lock onto the pitch
5. **Check your tuning** - Make sure your instrument is in tune first

## 🔐 Privacy & Security

- **No recording** - Audio is processed in real-time only, never recorded or stored
- **No data sent** - All processing happens locally in your browser
- **Microphone access** - Only used while detection is active
- **HTTPS required** - For security, microphone access requires HTTPS (or localhost)

## 🆘 Need Help?

If you encounter issues not covered in this guide:
1. Check the browser console for error messages (F12)
2. Try refreshing the page
3. Try a different browser
4. Restart your audio interface
5. Check that your audio interface drivers are up to date

---

**Enjoy detecting notes in real-time! 🎸🎵**

