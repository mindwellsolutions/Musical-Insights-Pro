# AI Music Assistant - UI Mockups & Design Specifications

## Visual Design Reference

### Color Palette (Matches Existing Theme System)

```typescript
// Use existing ThemeConfig colors
interface AIAssistantTheme {
  // Sidebar background
  sidebarBg: theme.bgSecondary,
  
  // Chat bubbles
  userMessageBg: '#3b82f6',      // Blue
  userMessageText: '#ffffff',
  assistantMessageBg: theme.bgTertiary,
  assistantMessageText: theme.textPrimary,
  
  // Scale cards
  cardBg: theme.bgTertiary,
  cardBorder: theme.border,
  cardHoverShadow: '0 4px 12px rgba(0,0,0,0.15)',
  
  // Buttons
  primaryButton: '#3b82f6',
  primaryButtonHover: '#2563eb',
  loadedButton: '#10b981',       // Green checkmark
  
  // Input
  inputBg: theme.bgPrimary,
  inputBorder: theme.border,
  inputFocus: '#3b82f6',
}
```

---

## Detailed Component Mockups

### 1. Collapsed Sidebar (Right Edge)

```
┌──────┐
│  ✨  │  ← AI Icon (animated sparkle)
│      │
│  [3] │  ← Badge (unread suggestions)
│      │
└──────┘
  48px wide
  Fixed position: right: 0
  Vertical center
  Hover: Slight scale + glow
```

**CSS**:
```css
.ai-sidebar-toggle {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 120px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px 0 0 12px;
  box-shadow: -2px 0 8px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.ai-sidebar-toggle:hover {
  transform: translateY(-50%) scale(1.05);
  box-shadow: -4px 0 16px rgba(102, 126, 234, 0.3);
}

.ai-icon {
  font-size: 24px;
  animation: sparkle 2s infinite;
}

@keyframes sparkle {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}
```

---

### 2. Expanded Sidebar (Full Chat Interface)

```
┌─────────────────────────────────────────┐
│ ✨ AI Music Theory Assistant        [×] │ ← Header (sticky)
├─────────────────────────────────────────┤
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💡 Suggested Questions:             │ │ ← Quick Start (empty state)
│ │ • What scales work for blues?       │ │
│ │ • Explain Dorian vs Aeolian         │ │
│ │ • Best modes for metal?             │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ User: What scales for jazz?     👤 │ │ ← User message (right)
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 🤖 For jazz improvisation, I        │ │ ← AI message (left)
│ │    recommend these scales:          │ │
│ │                                     │ │
│ │    ┌───────────────────────────┐   │ │
│ │    │ 🎵 D Dorian            [→]│   │ │ ← Scale card 1
│ │    │ Jazz, Funk • ⭐⭐⭐       │   │ │
│ │    │ Notes: D E F G A B C      │   │ │
│ │    │ [Load on Fretboard]       │   │ │
│ │    └───────────────────────────┘   │ │
│ │                                     │ │
│ │    ┌───────────────────────────┐   │ │
│ │    │ 🎵 G Mixolydian        [→]│   │ │ ← Scale card 2
│ │    │ Jazz, Blues • ⭐⭐         │   │ │
│ │    │ Notes: G A B C D E F      │   │ │
│ │    │ [Load on Fretboard]       │   │ │
│ │    └───────────────────────────┘   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ 💭 Typing...                        │ │ ← Loading indicator
│ └─────────────────────────────────────┘ │
│                                         │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────┐   │ │ ← Input area (sticky)
│ │ Ask about scales, modes...      │ 📤│ │
│ └─────────────────────────────────┘   │ │
│ [Clear Chat] [Suggested ▼]             │ │
└─────────────────────────────────────────┘
  400px wide (desktop)
  100% width (mobile)
```

---

### 3. Scale Recommendation Card (Detailed)

```
┌─────────────────────────────────────────┐
│ ┌───┐                                   │
│ │ D │ D Dorian                      [→] │ ← Root note circle + name + carousel nav
│ └───┘                                   │
├─────────────────────────────────────────┤
│ 📊 Genre: Jazz, Funk                    │
│ ⭐ Difficulty: ⭐⭐⭐ (3/10)              │
│                                         │
│ 🎼 Notes:                               │
│ ┌─┬─┬─┬─┬─┬─┬─┐                        │
│ │D│E│F│G│A│B│C│                        │ ← Note bubbles
│ └─┴─┴─┴─┴─┴─┴─┘                        │
│ Chord Tones: D F A C (highlighted)      │
│                                         │
│ 💡 "Perfect for minor ii-V-I jazz       │
│     progressions. The raised 6th (B)    │
│     creates a sophisticated sound."     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │   ✓ Load on Fretboard               │ │ ← Primary action
│ └─────────────────────────────────────┘ │
│ [Learn More] [Compare]                  │ ← Secondary actions
└─────────────────────────────────────────┘
  320px wide
  Auto height
  Hover: Scale 1.02x + shadow
```

**Interactive States**:
- **Default**: Blue "Load on Fretboard" button
- **Hover**: Button darkens, card scales up
- **Loading**: Button shows spinner
- **Loaded**: Button turns green with checkmark ✓
- **Error**: Button turns red with error icon

---

### 4. Mobile Layout (Bottom Sheet)

```
┌─────────────────────────────┐
│ ═══ AI Assistant            │ ← Drag handle
├─────────────────────────────┤
│                             │
│ [Chat messages scroll here] │
│                             │
│                             │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ Ask a question...       │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
  Full width
  Slides up from bottom
  Swipe down to minimize
```

---

## Animation Specifications

### 1. Sidebar Open/Close

```typescript
// Framer Motion variants
const sidebarVariants = {
  collapsed: {
    x: '100%',
    opacity: 0,
    transition: { duration: 0.3, ease: 'easeInOut' }
  },
  expanded: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeInOut' }
  }
};
```

### 2. Message Appearance

```typescript
const messageVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
};
```

### 3. Scale Card Carousel

```typescript
// Embla Carousel config
const carouselOptions = {
  align: 'start',
  loop: false,
  skipSnaps: false,
  dragFree: false,
};
```

### 4. Loading Indicator (Typing Dots)

```css
@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; }
  30% { opacity: 1; }
}

.dot-1 { animation: typing 1.4s infinite; }
.dot-2 { animation: typing 1.4s 0.2s infinite; }
.dot-3 { animation: typing 1.4s 0.4s infinite; }
```

---

## Responsive Breakpoints

```typescript
const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
};

// Sidebar widths
const sidebarWidth = {
  mobile: '100%',      // Full screen overlay
  tablet: '350px',     // Narrower sidebar
  desktop: '400px',    // Full width
};
```


