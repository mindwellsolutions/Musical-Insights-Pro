# MIDI Pedal Integration Blueprint

## Overview
This blueprint outlines the complete implementation of MIDI pedal support for the Modern Guitar Scales webapp. The integration will allow users to connect their MIDI foot pedals and configure buttons to control key functionalities within the application, enhancing the hands-free user experience for guitarists.

## Technology Stack
- **Library**: `@react-midi/hooks` by nicorobo
- **Version**: Latest (to be installed)
- **API**: Web MIDI API (browser-based)
- **State Management**: React Context + localStorage for persistence
- **UI Framework**: React with Next.js App Router

## Architecture Overview

### 1. MIDI Provider Layer
- Wrap the entire application with `<MIDIProvider>` from `@react-midi/hooks`
- Create custom context for MIDI configuration state
- Manage MIDI device connections and button mappings

### 2. Component Structure
```
app/
├── layout.tsx (wrap with MIDIProvider)
├── page.tsx (integrate MIDI handlers)
components/
├── midi/
│   ├── MIDIConfigModal.tsx (configuration screen)
│   ├── MIDIPedalStatus.tsx (sidebar status display)
│   ├── MIDIButtonMapper.tsx (button mapping UI)
│   └── MIDIContext.tsx (custom context)
hooks/
├── useMIDIPedal.ts (main MIDI hook)
├── useMIDIConfig.ts (configuration management)
└── useMIDIButtonHandlers.ts (button action handlers)
lib/
└── midi/
    ├── midiTypes.ts (TypeScript types)
    └── midiUtils.ts (utility functions)
```

## Feature Requirements

### MIDI Pedal Detection & Status Display
**Location**: Left AudioSidebar (below Audio Input section)

**Display Information**:
- MIDI Pedal Name (e.g., "Boss FS-6", "Line 6 FBV Express")
- Number of Buttons Detected
- Connection Status (Connected/Disconnected)
- Configure Button

**UI Design**:
```
┌─────────────────────────────────┐
│ 🎹 MIDI Pedal                   │
├─────────────────────────────────┤
│ Device: Boss FS-6               │
│ Buttons: 6                      │
│ Status: ● Connected             │
│                                 │
│ [Configure MIDI Pedalboard]     │
└─────────────────────────────────┘
```

### MIDI Configuration Modal
**Trigger**: "Configure MIDI Pedalboard" button

**Modal Sections**:
1. **Device Selection**
   - Dropdown to select MIDI input device
   - Auto-detect and list all connected MIDI devices
   - Refresh button to re-scan devices

2. **Button Detection & Mapping**
   - Visual grid showing all detected buttons
   - "Learn" mode: Click a slot, press pedal button to map
   - Display current MIDI CC/Note number for each button
   - Clear individual button mappings

3. **Function Assignment**
   - Assign webapp functions to each button:
     - Button 1: Manual Selection "Prev"
     - Button 2: Manual Selection "Next"
     - Button 3: Compatible Scales Navigate Left
     - Button 4: Compatible Scales Navigate Right
   - Dropdown for each button to select function
   - Option to leave buttons unassigned

4. **Testing Section**
   - Real-time feedback when buttons are pressed
   - Visual indicator showing which button was pressed
   - Test assigned functions without closing modal

5. **Actions**
   - Save Configuration
   - Reset to Defaults
   - Cancel

### Button Functionalities

#### Button 1: Manual Selection "Prev"
- **Target**: `ManualSelectionList` component
- **Action**: Trigger `onNavigatePrevious()` callback
- **Behavior**: Navigate to previous item in manual selection list
- **Visual Feedback**: Highlight previous item

#### Button 2: Manual Selection "Next"
- **Target**: `ManualSelectionList` component
- **Action**: Trigger `onNavigateNext()` callback
- **Behavior**: Navigate to next item in manual selection list
- **Visual Feedback**: Highlight next item

#### Button 3: Compatible Scales Navigate Left
- **Target**: `CompatibleScalesSection` component
- **Action**: Select previous scale card in the grid
- **Behavior**: 
  - Track currently selected scale index
  - Move selection left (decrement index)
  - Wrap around to last card if at beginning
  - Auto-scroll to keep selected card visible
- **Visual Feedback**: Highlight selected card with distinct border/glow

#### Button 4: Compatible Scales Navigate Right
- **Target**: `CompatibleScalesSection` component
- **Action**: Select next scale card in the grid
- **Behavior**:
  - Track currently selected scale index
  - Move selection right (increment index)
  - Wrap around to first card if at end
  - Auto-scroll to keep selected card visible
- **Visual Feedback**: Highlight selected card with distinct border/glow

## Implementation Phases

### Phase 1: Setup & Infrastructure (Tasks 1-2)
1. Install `@react-midi/hooks` package
2. Create MIDI types and utilities
3. Set up MIDIProvider in app layout
4. Create MIDI context for configuration state

### Phase 2: MIDI Detection & Status (Task 3-5)
1. Create MIDIPedalStatus component
2. Implement device detection using `useMIDIInputs()`
3. Add status section to AudioSidebar
4. Display connection status and device info

### Phase 3: Configuration Modal (Task 4)
1. Create MIDIConfigModal component
2. Implement device selection dropdown
3. Build button detection/learning interface
4. Create function assignment UI
5. Add testing section with real-time feedback

### Phase 4: Button Handlers (Task 6)
1. Create useMIDIButtonHandlers hook
2. Implement handlers for all 4 button functions
3. Use `useMIDIControl()` to listen for button presses
4. Map MIDI messages to webapp actions

### Phase 5: Integration (Task 7)
1. Add MIDI keyboard navigation to ManualSelectionList
2. Implement scale card navigation in CompatibleScalesSection
3. Add visual feedback for MIDI-triggered actions
4. Ensure proper focus management

### Phase 6: Persistence (Task 8)
1. Create MIDI configuration storage schema
2. Implement localStorage save/load
3. Auto-restore configuration on app load
4. Handle device reconnection scenarios

### Phase 7: Testing & Polish (Task 9)
1. Test with various MIDI pedal devices
2. Verify all button mappings work correctly
3. Test edge cases (device disconnect, multiple devices)
4. Add error handling and user feedback
5. Performance optimization

## Technical Implementation Details

### MIDI Message Handling

Most MIDI foot pedals send **Control Change (CC)** messages when buttons are pressed. Some may send **Note On/Off** messages.

**Using `useMIDIControl()` for CC messages**:
```typescript
const midiControl = useMIDIControl({
  cc: buttonConfig.ccNumber,
  channel: buttonConfig.channel
});

useEffect(() => {
  if (midiControl && midiControl.value > 0) {
    // Button pressed
    handleButtonAction(buttonConfig.action);
  }
}, [midiControl]);
```

**Using `useMIDINote()` for Note messages**:
```typescript
const midiNote = useMIDINote({
  note: buttonConfig.noteNumber,
  channel: buttonConfig.channel
});

useEffect(() => {
  if (midiNote && midiNote.velocity > 0) {
    // Button pressed
    handleButtonAction(buttonConfig.action);
  }
}, [midiNote]);
```

### Configuration State Schema

```typescript
interface MIDIButtonConfig {
  id: string;
  ccNumber?: number;
  noteNumber?: number;
  channel: number;
  action: 'prev' | 'next' | 'scale-left' | 'scale-right' | 'none';
  label: string;
}

interface MIDIPedalConfig {
  deviceId: string | null;
  deviceName: string | null;
  buttons: MIDIButtonConfig[];
  enabled: boolean;
}

interface MIDIContextState {
  config: MIDIPedalConfig;
  isConnected: boolean;
  availableDevices: MIDIInput[];
  updateConfig: (config: Partial<MIDIPedalConfig>) => void;
  learnButton: (buttonId: string) => void;
  isLearning: boolean;
  learningButtonId: string | null;
}
```

### localStorage Schema

```typescript
// Key: 'midi-pedal-config'
{
  "deviceId": "input-123456",
  "deviceName": "Boss FS-6",
  "buttons": [
    {
      "id": "button-1",
      "ccNumber": 64,
      "channel": 1,
      "action": "prev",
      "label": "Manual Prev"
    },
    {
      "id": "button-2",
      "ccNumber": 65,
      "channel": 1,
      "action": "next",
      "label": "Manual Next"
    },
    {
      "id": "button-3",
      "ccNumber": 66,
      "channel": 1,
      "action": "scale-left",
      "label": "Scale Left"
    },
    {
      "id": "button-4",
      "ccNumber": 67,
      "channel": 1,
      "action": "scale-right",
      "label": "Scale Right"
    }
  ],
  "enabled": true
}
```

### Compatible Scales Navigation Implementation

The Compatible Scales section needs to be enhanced to support keyboard/MIDI navigation:

**Current State**: Cards are displayed in a grid, selection happens via click
**New State**: Track selected card index, allow navigation via MIDI

**Implementation Approach**:
```typescript
// In CompatibleScalesSection component
const [selectedCardIndex, setSelectedCardIndex] = useState<number>(0);
const [midiNavigationEnabled, setMidiNavigationEnabled] = useState(false);

const handleNavigateLeft = useCallback(() => {
  setSelectedCardIndex(prev => {
    const newIndex = prev <= 0 ? filteredScales.length - 1 : prev - 1;
    // Auto-scroll to card
    scrollToCard(newIndex);
    return newIndex;
  });
}, [filteredScales.length]);

const handleNavigateRight = useCallback(() => {
  setSelectedCardIndex(prev => {
    const newIndex = prev >= filteredScales.length - 1 ? 0 : prev + 1;
    // Auto-scroll to card
    scrollToCard(newIndex);
    return newIndex;
  });
}, [filteredScales.length]);

// Expose handlers to parent via callback props
useEffect(() => {
  if (onMIDINavigateLeft) {
    onMIDINavigateLeft(handleNavigateLeft);
  }
  if (onMIDINavigateRight) {
    onMIDINavigateRight(handleNavigateRight);
  }
}, [handleNavigateLeft, handleNavigateRight]);
```

**Visual Feedback**:
- Add `data-card-index` attribute to each card
- Apply special styling to selected card when MIDI navigation is active
- Use `scrollIntoView()` to ensure selected card is visible

### Manual Selection Integration

The ManualSelectionList component already has `onNavigatePrevious` and `onNavigateNext` callbacks, so integration is straightforward:

```typescript
// In useMIDIButtonHandlers hook
const { onNavigatePrevious, onNavigateNext } = useManualSelectionCallbacks();

const handleMIDIButton = useCallback((action: string) => {
  switch (action) {
    case 'prev':
      onNavigatePrevious?.();
      break;
    case 'next':
      onNavigateNext?.();
      break;
    // ... other actions
  }
}, [onNavigatePrevious, onNavigateNext]);
```

## File-by-File Implementation Guide

### 1. `lib/midi/midiTypes.ts`
Define all TypeScript interfaces and types for MIDI functionality.

### 2. `lib/midi/midiUtils.ts`
Utility functions for:
- MIDI message parsing
- Device name formatting
- Button configuration validation
- Default configuration generation

### 3. `components/midi/MIDIContext.tsx`
React Context provider for MIDI state management:
- Wrap `useMIDIInputs()` from @react-midi/hooks
- Manage configuration state
- Provide configuration update methods
- Handle button learning mode

### 4. `hooks/useMIDIPedal.ts`
Main hook for consuming MIDI context:
- Access current configuration
- Get connection status
- Update configuration
- Trigger learning mode

### 5. `hooks/useMIDIConfig.ts`
Hook for managing MIDI configuration:
- Load from localStorage
- Save to localStorage
- Validate configuration
- Reset to defaults

### 6. `hooks/useMIDIButtonHandlers.ts`
Hook for handling MIDI button presses:
- Listen to configured MIDI messages
- Map to webapp actions
- Debounce button presses
- Provide action callbacks

### 7. `components/midi/MIDIPedalStatus.tsx`
Status display component for AudioSidebar:
- Show device name and connection status
- Display button count
- "Configure" button to open modal
- Real-time connection updates

### 8. `components/midi/MIDIConfigModal.tsx`
Main configuration modal:
- Device selection dropdown
- Button mapping interface
- Function assignment
- Testing section
- Save/Cancel actions

### 9. `components/midi/MIDIButtonMapper.tsx`
Button mapping sub-component:
- Visual button grid
- Learn mode activation
- Real-time MIDI message display
- Clear button mappings

### 10. `components/AudioSidebar.tsx` (Modification)
Add MIDI status section below Audio Input section.

### 11. `components/audio/CompatibleScalesSection.tsx` (Modification)
Add MIDI navigation support:
- Track selected card index
- Implement navigation handlers
- Add visual feedback for selection
- Auto-scroll to selected card

### 12. `app/layout.tsx` (Modification)
Wrap application with MIDIProvider:
```typescript
import { MIDIProvider } from '@react-midi/hooks';
import { MIDIContextProvider } from '@/components/midi/MIDIContext';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MIDIProvider>
          <MIDIContextProvider>
            {children}
          </MIDIContextProvider>
        </MIDIProvider>
      </body>
    </html>
  );
}
```

### 13. `app/page.tsx` (Modification)
Integrate MIDI button handlers:
- Import useMIDIButtonHandlers
- Pass navigation callbacks to components
- Handle MIDI-triggered actions

## Error Handling & Edge Cases

### Device Disconnection
- Detect when MIDI device is disconnected
- Update status display immediately
- Show reconnection prompt
- Attempt to reconnect when device becomes available

### Multiple Devices
- Allow user to select specific device from dropdown
- Handle device ID changes (some devices have dynamic IDs)
- Fallback to device name matching if ID changes

### Button Conflicts
- Prevent assigning same MIDI message to multiple functions
- Warn user if conflict detected
- Provide conflict resolution UI

### Browser Compatibility
- Check for Web MIDI API support
- Show helpful error message if not supported
- Provide link to compatible browsers (Chrome, Edge, Opera)

### Performance
- Debounce MIDI button presses (prevent double-triggers)
- Throttle rapid button presses
- Optimize re-renders when MIDI messages received

## Testing Checklist

### Device Detection
- [ ] MIDI device appears in device list when connected
- [ ] Device name displays correctly
- [ ] Button count is accurate
- [ ] Connection status updates in real-time

### Button Learning
- [ ] Learn mode activates when button clicked
- [ ] MIDI message captured correctly (CC or Note)
- [ ] Button configuration saved properly
- [ ] Visual feedback during learning

### Function Assignment
- [ ] All 4 functions can be assigned
- [ ] Dropdown shows correct options
- [ ] Assignments persist after modal close
- [ ] Can unassign functions (set to "none")

### Button Actions
- [ ] Button 1 triggers Manual Selection Prev
- [ ] Button 2 triggers Manual Selection Next
- [ ] Button 3 navigates Compatible Scales left
- [ ] Button 4 navigates Compatible Scales right
- [ ] Actions work correctly when list/grid is empty
- [ ] Actions wrap around at boundaries

### Persistence
- [ ] Configuration saves to localStorage
- [ ] Configuration loads on app startup
- [ ] Configuration persists across page refreshes
- [ ] Invalid configurations handled gracefully

### Edge Cases
- [ ] Works when device disconnected mid-session
- [ ] Handles device reconnection
- [ ] Works with multiple MIDI devices connected
- [ ] Handles rapid button presses
- [ ] Works when Manual Selection list is empty
- [ ] Works when Compatible Scales list is empty

## UI/UX Considerations

### Visual Feedback
- Highlight selected scale card with distinct border (e.g., 3px solid accent color)
- Add subtle glow effect to MIDI-selected items
- Show brief toast notification when MIDI action triggered
- Animate transitions between selections

### Accessibility
- Ensure MIDI navigation doesn't break keyboard navigation
- Maintain focus management
- Provide screen reader announcements for MIDI actions
- Support both MIDI and keyboard shortcuts simultaneously

### User Guidance
- Add tooltips explaining MIDI functionality
- Provide "First Time Setup" wizard for MIDI configuration
- Include help text in configuration modal
- Show example MIDI pedal configurations

## Future Enhancements (Out of Scope)

- Support for more than 4 buttons
- MIDI output (send MIDI messages from webapp)
- MIDI learn for any webapp action
- Preset configurations for popular pedals
- MIDI velocity sensitivity
- MIDI expression pedal support
- Multi-device support (use multiple pedals simultaneously)

## Dependencies

### Required Packages
```json
{
  "@react-midi/hooks": "^latest"
}
```

### Browser Requirements
- Chrome 43+
- Edge 79+
- Opera 30+
- Safari: Not supported (Web MIDI API not available)
- Firefox: Not supported (Web MIDI API not available)

## Completion Criteria

The MIDI pedal integration is complete when:
1. ✅ Users can connect and detect their MIDI pedal
2. ✅ Status displays correctly in AudioSidebar
3. ✅ Configuration modal allows full button mapping
4. ✅ All 4 button functions work correctly
5. ✅ Configuration persists across sessions
6. ✅ Visual feedback is clear and responsive
7. ✅ Error handling covers all edge cases
8. ✅ Testing checklist is 100% complete
9. ✅ Code is well-documented and follows project standards
10. ✅ Performance is optimized (no lag or stuttering)

---

**Blueprint Version**: 1.0
**Created**: 2025-11-13
**Status**: Ready for Implementation

