# MIDI Pedal Integration - Testing Guide

## Prerequisites

### Browser Requirements
- **Supported Browsers**: Chrome 43+, Edge 79+, Opera 30+
- **Not Supported**: Safari, Firefox (Web MIDI API not available)

### Hardware Requirements
- MIDI foot pedal (e.g., Behringer FCB1010, Boss FS-6, Line 6 FBV Express, etc.)
- USB MIDI interface (if pedal doesn't have USB)
- Computer with USB port

### Connection Setup
1. Connect MIDI pedal to computer via USB or MIDI interface
2. Ensure pedal is powered on
3. Check that your OS recognizes the MIDI device:
   - **Windows**: Device Manager > Sound, video and game controllers
   - **macOS**: Audio MIDI Setup app
   - **Linux**: `aconnect -l` or `amidi -l`

## Testing Checklist

### Phase 1: Initial Setup & Detection

#### 1.1 Browser Compatibility Check
- [ ] Open the webapp in Chrome/Edge/Opera
- [ ] Verify no "MIDI Not Supported" error appears
- [ ] Check browser console for any MIDI-related errors

#### 1.2 MIDI Device Detection
- [ ] Open the left sidebar (Audio Sidebar)
- [ ] Locate the "MIDI Pedal" section
- [ ] Verify it shows:
  - Device: "No Device" (initially)
  - Buttons: 0 / 4
  - Status: Red dot with "Disconnected"

#### 1.3 Device Selection
- [ ] Click "Configure MIDI Pedalboard" button
- [ ] Modal should open with configuration screen
- [ ] In "1. Select MIDI Device" dropdown:
  - [ ] Verify your MIDI pedal appears in the list
  - [ ] Select your MIDI device
  - [ ] Verify sidebar updates to show device name
  - [ ] Verify status changes to green "Connected"

### Phase 2: Button Mapping

#### 2.1 Learn Button 1 (Manual Selection: Previous)
- [ ] In the config modal, find "Button 1"
- [ ] Verify default action is "Manual Selection: Previous"
- [ ] Click "Learn" button
- [ ] Verify button shows "Listening..." with pulsing indicator
- [ ] Press a button on your MIDI pedal
- [ ] Verify:
  - [ ] Learning mode stops automatically
  - [ ] Button shows MIDI info (e.g., "CC 20 • Ch 1")
  - [ ] Button is now enabled (colored indicator)

#### 2.2 Learn Button 2 (Manual Selection: Next)
- [ ] Repeat learning process for Button 2
- [ ] Use a different pedal button
- [ ] Verify action is "Manual Selection: Next"

#### 2.3 Learn Button 3 (Compatible Scales: Navigate Left)
- [ ] Repeat learning process for Button 3
- [ ] Verify action is "Compatible Scales: Navigate Left"

#### 2.4 Learn Button 4 (Compatible Scales: Navigate Right)
- [ ] Repeat learning process for Button 4
- [ ] Verify action is "Compatible Scales: Navigate Right"

#### 2.5 Test Message Detection
- [ ] In "3. Test Your Configuration" section
- [ ] Press each pedal button
- [ ] Verify last MIDI message updates showing:
  - Type (Control Change or Note)
  - Number
  - Value
  - Channel
  - Timestamp

### Phase 3: Configuration Persistence

#### 3.1 Save Configuration
- [ ] Click "Save Configuration" button
- [ ] Close the modal
- [ ] Verify sidebar shows "Buttons: 4 / 4"

#### 3.2 Reload Test
- [ ] Refresh the browser page
- [ ] Open sidebar
- [ ] Verify:
  - [ ] Device name is still shown
  - [ ] Status is "Connected" (if device still connected)
  - [ ] Buttons count is 4 / 4
- [ ] Open config modal
- [ ] Verify all button mappings are preserved

#### 3.3 Reset Configuration
- [ ] In config modal, click "Reset to Defaults"
- [ ] Confirm the reset
- [ ] Verify all buttons return to disabled state
- [ ] Re-configure buttons for next tests

### Phase 4: Functional Testing

#### 4.1 Manual Selection Navigation
**Setup:**
- [ ] Create at least 3 manual selections:
  1. C Major
  2. G Mixolydian
  3. A Minor
- [ ] Select the first item in the list

**Test Button 1 (Previous):**
- [ ] Press MIDI Button 1
- [ ] Verify selection moves to last item (A Minor)
- [ ] Press again
- [ ] Verify selection moves to G Mixolydian
- [ ] Verify fretboard updates to show correct scale

**Test Button 2 (Next):**
- [ ] Press MIDI Button 2
- [ ] Verify selection moves to A Minor
- [ ] Press again
- [ ] Verify selection moves to C Major
- [ ] Verify fretboard updates correctly

#### 4.2 Compatible Scales Navigation
**Setup:**
- [ ] Enable "Auto Recommendation" in sidebar
- [ ] Start audio detection
- [ ] Play a chord to detect a key (or use Manual Mode)
- [ ] Verify Compatible Scales section appears with multiple scales

**Test Button 3 (Navigate Left):**
- [ ] Note the currently selected scale
- [ ] Press MIDI Button 3
- [ ] Verify:
  - [ ] Selection moves to previous scale
  - [ ] Selected card is highlighted
  - [ ] Card scrolls into view smoothly
  - [ ] Fretboard updates to show new scale

**Test Button 4 (Navigate Right):**
- [ ] Press MIDI Button 4
- [ ] Verify:
  - [ ] Selection moves to next scale
  - [ ] Selected card is highlighted
  - [ ] Card scrolls into view smoothly
  - [ ] Fretboard updates to show new scale

#### 4.3 Wrap-Around Behavior
- [ ] Navigate to last compatible scale
- [ ] Press Button 4 (Right)
- [ ] Verify it wraps to first scale
- [ ] Navigate to first scale
- [ ] Press Button 3 (Left)
- [ ] Verify it wraps to last scale

### Phase 5: Edge Cases & Error Handling

#### 5.1 No Manual Selections
- [ ] Clear all manual selections
- [ ] Press Buttons 1 & 2
- [ ] Verify no errors occur (buttons should do nothing)

#### 5.2 No Compatible Scales
- [ ] Disable Auto Recommendation
- [ ] Exit Manual Mode
- [ ] Press Buttons 3 & 4
- [ ] Verify no errors occur

#### 5.3 Device Disconnection
- [ ] Unplug MIDI device
- [ ] Verify sidebar status changes to "Disconnected"
- [ ] Reconnect device
- [ ] Verify status returns to "Connected"
- [ ] Test that buttons still work

#### 5.4 Multiple Rapid Presses
- [ ] Rapidly press the same MIDI button 5-10 times
- [ ] Verify debouncing works (not all presses trigger actions)
- [ ] Verify no errors or crashes occur

## Expected Results Summary

✅ **All tests should pass with:**
- Smooth, responsive MIDI button detection
- Accurate navigation through lists and scales
- Proper visual feedback (highlighting, scrolling)
- Configuration persistence across page reloads
- No console errors or warnings
- Graceful handling of edge cases

## Troubleshooting

### Device Not Detected
1. Check USB connection
2. Try different USB port
3. Restart browser
4. Check browser permissions (may need to allow MIDI access)
5. Try clicking "Refresh" button in device selection

### Buttons Not Responding
1. Verify device is "Connected" in sidebar
2. Check that buttons are enabled (colored indicators)
3. Open config modal and test in "Test Your Configuration"
4. Verify MIDI messages are being received
5. Try re-learning the button

### Wrong Button Triggered
1. Check for MIDI message conflicts in config modal
2. Ensure each button has unique CC/Note number
3. Re-learn the problematic button

## Notes for Developers

- MIDI messages are debounced with 200ms delay
- Only button presses (value > 0) trigger actions, not releases
- Configuration is stored in localStorage under key: `midi-pedal-config`
- The app supports both Control Change (CC) and Note messages
- MIDI channels 1-16 are supported

