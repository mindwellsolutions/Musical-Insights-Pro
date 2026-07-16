 

**FRETBOARD NOTE LEARNING SYSTEM**

Complete Development Blueprint

7 Interactive Training Methods for Guitar Fretboard Mastery

 

Next.js Web Application

Technical Specification & UX Design Document

March 2026



# Table of Contents

 

Part 1: System Architecture & Global Design ............................... 3

Part 2: Shared Component Specifications ........................................ 5

Part 3: Note Color System & Data Constants ................................. 7

Part 4: Method 1 — Note-a-Day (Single Note Focus) ................... 9

Part 5: Method 2 — Octave Shapes / Octave Displacement ....... 15

Part 6: Method 3 — The CAGED System ...................................... 21

Part 7: Method 4 — Fretboard Logic (Landmarks + Intervals) .... 27

Part 8: Method 5 — Call-and-Response / Quiz Drills .................. 33

Part 9: Method 6 — Interval Training .......................................... 39

Part 10: Method 7 — Single-String Chromatic Exercises ............. 44

Part 11: Gamification, Progress & Analytics .................................. 49

Part 12: Tips & Shortcuts Overlay System ..................................... 53

Part 13: Integration & Implementation Roadmap .......................... 55



# Part 1: System Architecture & Global Design

## 1.1 High-Level Architecture

The Fretboard Note Learning System is a self-contained module within the existing Next.js web application. It shares the existing visual fretboard component but wraps it in a training orchestration layer that manages state, progress tracking, scoring, and method-specific logic.

### Application Structure

The system lives under a dedicated route: /learn/fretboard. This route renders a top-level LearningHub component that contains a method selector sidebar, the shared fretboard visualization, and a training interaction panel. Each of the 7 methods is implemented as an independent training module that plugs into the hub via a standardized interface.

### Routing

•     /learn/fretboard — Main hub with method selector and overview dashboard

•     /learn/fretboard/[method-slug] — Individual training method view (e.g. /learn/fretboard/note-a-day)

•     /learn/fretboard/progress — Cross-method analytics and achievements

### State Management

Use React Context (or Zustand for lightweight global state) to manage: the currently active training method, the fretboard display state (which notes are highlighted, animations, overlays), user progress per method (stored in localStorage with optional cloud sync), session statistics (current streak, accuracy, time), and user preferences (tuning, number of frets displayed, left-handed mode, audio on/off).

## 1.2 Fretboard Component Interface

The existing fretboard component must expose a programmatic API that the training modules can control. The following props/methods are required:

| **Prop / Method**    | **Type**                      | **Description**                                              |
| -------------------- | ----------------------------- | ------------------------------------------------------------ |
| **highlightedNotes** | NoteHighlight[]               | Array of  notes to visually highlight with color, border, pulse, glow effects |
| **dimmedNotes**      | string[]                      | Notes to show  at reduced opacity (gray out non-target notes) |
| **hiddenNotes**      | string[]                      | Notes to hide  completely (show empty fret positions)        |
| **onNoteClick**      | (note,  string, fret) => void | Callback when  user clicks/taps a fret position              |
| **overlayShapes**    | Shape[]                       | SVG overlay  shapes (octave connectors, CAGED outlines, interval arrows) |
| **animationQueue**   | Animation[]                   | Queued  animations (pulse, sweep, cascade reveal)            |
| **showNoteNames**    | boolean \|  'target'          | Show all note  names, only target notes, or hide all (quiz mode) |
| **activeFrets**      | [number,  number]             | Range of  frets to display (e.g. [0, 12] for first 12 frets) |
| **stringHighlight**  | number \| null                | Highlight a  single string for single-string exercises       |

 

## 1.3 NoteHighlight Data Structure

Each highlighted note carries display metadata:

•     note: string — The note name (e.g. 'C', 'F#')

•     string: number — Guitar string (1-6, where 1 = high E)

•     fret: number — Fret number (0-22)

•     color: string — Hex color from the note color map

•     borderColor: string | null — Optional contrasting border for emphasis

•     borderWidth: number — Border thickness (default 0, set 3-4 for emphasis)

•     opacity: number — 0.0 to 1.0 (for dimming/revealing animations)

•     pulse: boolean — Whether to apply a CSS pulse animation

•     glow: boolean — Whether to apply a glow/shadow effect

•     label: string | null — Override label (for showing intervals like 'P5' instead of note name)

•     size: 'normal' | 'large' — For emphasizing root/target notes

## 1.4 Audio Engine

An optional audio playback system using the Web Audio API or Tone.js that plays the pitch of notes when clicked or during demonstrations. This provides auditory reinforcement alongside visual learning. The audio engine should support: single note playback (sine or guitar-like tone), quick arpeggiated playback for shapes/chords, adjustable volume, and a mute toggle persisted in user preferences.



 

**PART 2: SHARED COMPONENT SPECIFICATIONS**

## 2.1 Method Selector Panel

A sidebar or top navigation that lists all 7 training methods. Each entry shows: the method name, a difficulty badge (Beginner / Intermediate / Advanced), a small progress ring showing completion percentage, and the overall effectiveness rating. Clicking a method loads its training module into the main content area beside the fretboard.

### Layout Design

On desktop (>1024px): the method selector is a left sidebar (280px wide) with the fretboard and training panel filling the remaining width. On tablet/mobile (<1024px): the method selector becomes a horizontal scrollable pill bar above the fretboard, with method names abbreviated.

## 2.2 Training Control Bar

A shared control bar that sits between the fretboard and the exercise panel. It provides:

•     Play/Pause button — Start or pause the current exercise

•     Reset button — Restart the current exercise from the beginning

•     Difficulty selector — Easy / Medium / Hard (adjusts parameters per method)

•     Timer display — Shows elapsed time for timed exercises

•     Score display — Running accuracy/streak count

•     Settings gear icon — Opens preferences (tuning, fret range, audio, left-hand mode)

•     Hints toggle — Show/hide the Tips & Shortcuts overlay for the current method

## 2.3 Feedback System

Every user interaction produces immediate visual and optional audio feedback:

### Correct Answer

•     The tapped note flashes green (#22C55E) with a brief scale-up animation (transform: scale(1.3) over 200ms, then back to 1.0)

•     A subtle confetti particle burst from the note position (6-10 small colored dots that expand outward and fade over 400ms)

•     Optional success chime (short ascending two-note tone)

•     Score counter increments with a number-flip animation

### Incorrect Answer

•     The tapped note flashes red (#EF4444) with a brief shake animation (translateX -4px, +4px, -2px, +2px over 300ms)

•     The correct answer is immediately revealed with a pulsing green highlight and an arrow/line connecting from where the user tapped to where the correct note is

•     Optional error buzz (short low tone)

•     Streak counter resets to zero

### Hint/Reveal

•     When the user requests a hint, the correct answer fades in at 50% opacity, pulses twice, then fades back out

•     Using a hint marks the question as 'assisted' in the scoring system (partial credit)

## 2.4 Session Summary Modal

After completing an exercise or ending a session, a modal appears showing: total questions attempted, accuracy percentage, average response time, longest streak, notes that were missed most frequently (the 'weak notes' list), an XP earned summary, and a 'Continue' or 'Review Weak Notes' button.



 

**PART 3: NOTE COLOR SYSTEM & DATA CONSTANTS**

## 3.1 Note Color Map

The application uses a consistent color for each of the 12 chromatic notes. This color persists everywhere a note appears — on the fretboard, in quiz answers, in progress charts, and in educational diagrams. The colors are:

| **Note** | **Hex Color** | **Note** | **Hex Color** | **Note** | **Hex Color** |
| -------- | ------------- | -------- | ------------- | -------- | ------------- |
| **C**    | #E74C3C       | **C#**   | #E67E22       | **D**    | #F1C40F       |
| **D#**   | #2ECC71       | **E**    | #1ABC9C       | **F**    | #3498DB       |
| **F#**   | #2980B9       | **G**    | #27AE60       | **G#**   | #16A085       |
| **A**    | #8E44AD       | **A#**   | #9B59B6       | **B**    | #E91E63       |

 

## 3.2 Standard Tuning Data

The fretboard data model assumes standard tuning (E A D G B E) with 22 frets. Each string is represented as an array of note names from fret 0 (open) through fret 22. The chromatic sequence is: C, C#, D, D#, E, F, F#, G, G#, A, A#, B. Open string notes: String 6 (low E) = E2, String 5 = A2, String 4 = D3, String 3 = G3, String 2 = B3, String 1 (high E) = E4.

## 3.3 Music Theory Constants

The following constants are used across multiple training methods:

•     CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

•     NATURAL_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']

•     SHARP_NOTES = ['C#', 'D#', 'F#', 'G#', 'A#']

•     OPEN_STRINGS = ['E', 'A', 'D', 'G', 'B', 'E'] (from string 6 to string 1)

•     LANDMARK_FRETS = [0, 3, 5, 7, 9, 12, 15, 17, 19] (frets with dot markers)

•     OCTAVE_SHAPES = [{strings: [6,4], fretOffset: [0,2]}, {strings: [6,3], fretOffset: [0,3]}, {strings: [5,3], fretOffset: [0,2]}, {strings: [5,2], fretOffset: [0,3]}, {strings: [4,2], fretOffset: [0,2]}] (each shape shows string pair and fret displacement, adjusted for B-string offset)

•     CAGED_SHAPES = { C: {...}, A: {...}, G: {...}, E: {...}, D: {...} } (each containing chord tones, scale tones, and root positions for each shape)

•     INTERVALS = { 'P1': 0, 'm2': 1, 'M2': 2, 'm3': 3, 'M3': 4, 'P4': 5, 'TT': 6, 'P5': 7, 'm6': 8, 'M6': 9, 'm7': 10, 'M7': 11, 'P8': 12 }



 

**PART 4: METHOD 1 — NOTE-A-DAY (SINGLE NOTE FOCUS)**

# Method 1: Note-a-Day (Single Note Focus)

**Effectiveness Rating: 9/10** | Difficulty: Beginner | Sessions: 12-day cycle

## 4.1 Core Concept & Music Theory

This method isolates one note from the 12-note chromatic scale and focuses the entire session on finding every instance of that note across all 6 strings and all frets. The music theory foundation is simple: every note repeats every 12 frets (since there are 12 semitones in an octave), and each note appears on every string at a predictable fret position determined by the string’s open tuning.

For example, if today’s note is C: on the low E string (6th), C appears at fret 8. On the A string (5th), C appears at fret 3. On the D string (4th), C appears at fret 10. And so on. After fret 12, the pattern repeats identically (fret 8 + 12 = fret 20, etc.).

The 12-day cycle goes: Day 1 = C, Day 2 = C#/Db, Day 3 = D, Day 4 = D#/Eb, Day 5 = E, Day 6 = F, Day 7 = F#/Gb, Day 8 = G, Day 9 = G#/Ab, Day 10 = A, Day 11 = A#/Bb, Day 12 = B. After completing the cycle, repeat it 2-3 more times for deep retention.

## 4.2 Training Phases

Each daily session progresses through 4 phases:

### Phase 1: Discovery (2 minutes)

The fretboard highlights every instance of today’s target note in its designated color with a gentle pulse animation. All other notes are dimmed to 20% opacity. The user simply observes the pattern. A tooltip appears saying something like 'Notice how C appears in a diagonal pattern across the strings.' The fretboard slowly cascades the highlights on, string by string from low E to high E, with a 500ms delay between each string so the user can visually absorb each position.

**Fretboard Display:** All target notes highlighted with full color and a soft pulsing border. All non-target notes shown as small gray dots at 20% opacity. The note name is displayed inside each highlighted circle. Fret numbers and string names remain visible.

### Phase 2: Guided Practice (3 minutes)

The system prompts the user to find the target note on one string at a time. It starts with the low E string: the prompt says 'Find C on the low E string' and the string is visually highlighted (its line glows or thickens). The user taps a fret position. If correct, the note lights up with a success animation and the system moves to the next string. If wrong, the system shows the correct position and lets the user try the next string. After all 6 strings, the exercise repeats but this time with notes hidden — the user must find them from memory.

**Fretboard Display:** Only the active string is fully visible. Other strings are dimmed. No note names shown on the active string (quiz mode). After the user taps, the correct answer is revealed with a colored highlight.

### Phase 3: Speed Drill (3 minutes)

Random fret positions flash on the fretboard (highlighted but with no note name). The user must determine if the highlighted position IS or IS NOT the target note. This is a rapid yes/no drill. Positions flash for 3 seconds (Easy), 2 seconds (Medium), or 1 second (Hard). The user taps a 'Yes' or 'No' button (or taps the note itself for Yes, taps a ‘Not it’ button for No). Tracks accuracy and average response time.

**Fretboard Display:** All notes hidden. A single fret position lights up with a white/neutral highlight (not the note’s color, to avoid giving away the answer). Two large buttons appear below the fretboard: a green 'Yes — That’s [Note]' and a red 'No — That’s not [Note]'.

### Phase 4: Full Recall (2 minutes)

The fretboard is completely blank (no notes, no highlights). The prompt says 'Tap every [Note] you can find. You have 60 seconds. Go!' The user taps as many correct positions as they can. Each correct tap lights up in the note’s color and stays lit. Each incorrect tap shows a brief red flash. At the end, any missed positions are revealed with a dashed border, showing the user what they missed. A percentage score is shown: 'You found 14 out of 18 C notes (78%).'

**Fretboard Display:** Completely blank fretboard with all fret positions shown as empty circles. As the user taps correctly, notes fill in with their color. Missed notes appear at the end with dashed outlines.

## 4.3 Visual Design Specifications

### Target Note Hero Display

At the top of the training panel, a large circle (80px diameter) displays the current target note in its designated color. The note name is displayed in 36px bold white text centered inside. A subtle pulsing glow animation around the circle keeps the user’s attention anchored to which note they’re learning. Below the circle, the text reads 'Today’s Note' and the date.

### Progress Calendar

A 12-cell grid (4 columns x 3 rows) represents the 12-note cycle. Each cell contains the note name and is colored with the note’s color when completed. Incomplete days are shown as gray outlined cells. The current day pulses. Hovering a completed cell shows the accuracy score for that day.

### String-by-String Mini Map

A compact horizontal view showing 6 rows (one per string) with small dots at each position where the target note exists. Dots fill with color as the user correctly identifies them during the session. This serves as both a reference and a progress indicator within the current exercise.

## 4.4 Interaction Mechanics

•     Click/tap a fret position on the fretboard to select it as your answer

•     On mobile, fret positions should have generous tap targets (minimum 44px)

•     Keyboard shortcuts: number keys 0-9 for quick fret selection on the active string, arrow keys to move between strings

•     Long-press on a highlighted note to hear its audio pitch

•     Swipe left/right on mobile to advance through phases

## 4.5 Difficulty Scaling

| **Setting**    | **Easy**                            | **Medium**            | **Hard**                    |
| -------------- | ----------------------------------- | --------------------- | --------------------------- |
| **Fret Range** | 0-12 only                           | 0-17                  | 0-22 (full  neck)           |
| **Note Names** | Shown on all  frets                 | Hidden during  drills | Hidden always               |
| **Timer**      | No time  pressure                   | 5 sec per  question   | 2 sec per  question         |
| **Hints**      | Always  available                   | 3 hints per  session  | No hints                    |
| **Note Set**   | Natural notes  only (C D E F G A B) | All 12 notes          | All 12 +  enharmonic naming |

## 4.6 Shortcuts & Memory Tricks (Toggleable Overlay)

When the Hints toggle is enabled, contextual tips appear as floating tooltips near relevant fret positions:

•     'Fret 12 = Open string note. Always.' — shown at fret 12 with a bright connection line to fret 0

•     'The B string shifts everything up 1 fret' — shown when the user reaches the B string exercises

•     'Same note, same fret + 12' — shown with a visual arrow connecting fret N to fret N+12

•     Mnemonic for open strings: 'Eddie Ate Dynamite Good Bye Eddie' shown at the nut

•     Natural note pattern on each string (the 'whole-whole-half' step pattern) shown as bracket annotations between frets



 

**PART 5: METHOD 2 — OCTAVE SHAPES / OCTAVE DISPLACEMENT**

# Method 2: Octave Shapes / Octave Displacement

**Effectiveness Rating: 8.5/10** | Difficulty: Beginner-Intermediate | Prerequisite: Know open string names

## 5.1 Core Concept & Music Theory

An octave is the same note at a higher or lower pitch — 12 semitones apart. On the guitar, octaves form consistent two-note geometric shapes across string pairs. Because the guitar is tuned in 4ths (with one exception at the B string), the same octave shape always works on the same string pair regardless of position.

There are 5 primary octave shapes based on string pairs:

| **Shape #** | **String Pair**        | **Fret Offset**            | **Example (from A, fret 5 on string 6)**                     |
| ----------- | ---------------------- | -------------------------- | ------------------------------------------------------------ |
| **Shape 1** | Strings 6 → 4          | Same fret + 2              | String 6 fret  5 → String 4 fret 7                           |
| **Shape 2** | Strings 6 → 3          | Same fret + 3  (crosses B) | String 6 fret  5 → String 3 fret 8 (if crossing B: +3 not +2) |
| **Shape 3** | Strings 5 → 3          | Same fret + 2              | String 5 fret  5 → String 3 fret 7                           |
| **Shape 4** | Strings 5 → 2          | Same fret + 3  (crosses B) | String 5 fret  5 → String 2 fret 8                           |
| **Shape 5** | Strings 4 → 2          | Same fret + 3  (crosses B) | String 4 fret  5 → String 2 fret 8                           |
| **Shape 6** | Strings 4 → 1  / 3 → 1 | Various  (derived)         | Combine  shapes to reach string 1                            |

 

**Critical B-String Rule:** Whenever an octave shape crosses from string 3 (G) to string 2 (B), add 1 extra fret to the offset. This is because the interval between G and B is a major 3rd (4 semitones) instead of a perfect 4th (5 semitones) like all other adjacent string pairs. The system must programmatically account for this in all shape calculations.

## 5.2 Training Phases

### Phase 1: Shape Gallery (Learn the 5 Shapes)

Present one octave shape at a time. On the fretboard, show two notes connected by a curved line or arrow. The root note (lower string) displays with a thick border. The octave note (higher string) displays in the same color but with a glow effect. An animated dotted line connects them showing the geometric relationship. The training panel shows a diagram of just the shape: 'Start here [circle] → Go 2 strings up, 2 frets forward [circle].' The user can click 'Show on Fretboard' to see this shape applied at different positions across the neck. Each click randomly repositions the shape.

**Fretboard Display:** Only two notes are shown — the root and its octave. Connected by an animated curved SVG line. A semi-transparent rectangle overlay highlights the 'zone' between the two notes. All other notes are hidden.

### Phase 2: Shape Practice (Apply Each Shape)

The system shows a single highlighted note (the root) and the user must tap where the octave is using a specific shape. For example: 'Using Shape 1 (Strings 6→4), find the octave of this A.' The root note glows at String 6, Fret 5. The user taps String 4, Fret 7. If correct, the connecting line animates in and both notes pulse. The exercise cycles through all 5 shapes, testing each multiple times at random positions.

### Phase 3: Navigation Challenge

This is the key exercise that turns octave shapes into a fretboard navigation tool. The system names a note and a target string: 'Find G on String 2.' The user knows G is at Fret 3 on String 6 (common anchor). They must use octave shapes to jump from that known position to String 2. The fretboard starts with only the anchor note visible. As the user clicks each intermediate octave jump, the connecting line appears, building a visual path across the neck. This teaches the student to chain shapes together.

### Phase 4: Speed Navigation

Rapid-fire version: the system flashes a note name and a random string/fret zone. The user must find it within a time limit. No shapes are shown — the user must internalize them. Accuracy and time are tracked. This phase is unlocked after Phase 3 reaches 80% accuracy.

## 5.3 Visual Design Specifications

### Octave Connector Lines

The visual connection between octave pairs is the signature visual element. It should be an SVG path (curved or angled) drawn as an overlay on the fretboard. The line uses the note’s color with a 2px stroke and a subtle dashed animation (stroke-dasharray with animated stroke-dashoffset). The root end of the line has a small filled circle (8px). The octave end has an open circle with a ring (indicating the target). When the connection is confirmed (correct answer), the line becomes solid and both endpoints pulse.

### Shape Diagram Cards

Below the fretboard, display a compact card for each of the 5 shapes. Each card shows: a mini 2x4 grid diagram of the shape (two dots on a simplified string/fret grid), the string pair label (e.g. '6→4'), the fret offset ('+2 frets'), and a colored indicator showing if the user has mastered this shape (gray = not started, yellow = practicing, green = mastered). The currently active shape’s card has a highlighted border.

## 5.4 B-String Warning System

Whenever a shape crosses the B string, the system displays a visual warning. The B string line on the fretboard turns a contrasting color (amber/orange). A small badge appears near the shape saying '+1 fret — B string offset.' This warning can be toggled off once the user demonstrates consistent accuracy crossing the B string (5 consecutive correct answers).

## 5.5 Interaction Mechanics

•     Click the root note on the fretboard → system highlights it and waits for octave tap

•     Click the fret where you think the octave is → feedback and connecting line appears

•     In Navigation Challenge: click multiple times to build a chain of octave jumps

•     Double-click a highlighted octave pair to hear both notes played sequentially (confirming they’re the same note at different pitches)

•     Drag gesture: on touch devices, drag from the root note toward the octave to draw your own connector line — releasing on the correct fret confirms the answer

## 5.6 Shortcuts & Memory Tricks

•     '2 strings up, 2 frets over' — the most common shape, displayed as a large visual mnemonic near the fretboard

•     'Cross the B? Add a fret.' — displayed whenever B-string crossing is involved

•     'One octave shape gives you the whole neck from one anchor' — demonstrated with an animation starting from one note and cascading octaves across all strings

•     'Fret 0 and Fret 12 are always the same note' — shown with a mirror-line overlay at fret 12



 

**PART 6: METHOD 3 — THE CAGED SYSTEM**

# Method 3: The CAGED System

**Effectiveness Rating: 8/10** | Difficulty: Intermediate | Prerequisite: Know open chord shapes C, A, G, E, D

## 6.1 Core Concept & Music Theory

The CAGED system maps the entire fretboard using 5 interconnected chord shapes derived from the open chords C, A, G, E, and D. Every major chord (and its related scale) can be played in 5 positions across the neck, each corresponding to one of these shapes. The shapes connect seamlessly — the top of one shape overlaps with the bottom of the next in the sequence C → A → G → E → D → C (repeating).

For example, a C major chord is most commonly played as the open C shape. But you can also play it as an A-shape barre chord (root on string 5, fret 3), a G-shape (root on string 6, fret 8), an E-shape barre (root on string 6, fret 8), and a D-shape (root on string 4, fret 10). Each shape highlights different chord tones and scale degrees across a 4-5 fret zone.

**The CAGED sequence for any root note is always: C → A → G → E → D**, moving up the neck. This order never changes regardless of the root note. The starting shape depends on where the root note naturally falls.

## 6.2 Shape Data Model

Each CAGED shape must be defined as a data object containing: the root note positions (string + fret for each root within the shape), all chord tones (1st, 3rd, 5th) with their positions, the full scale pattern overlaid on the shape, the fret range the shape spans (typically 4-5 frets), the visual outline (an SVG polygon that encompasses the shape’s zone on the fretboard), and connection points to adjacent shapes (where this shape overlaps with the next and previous shape in the CAGED sequence).

## 6.3 Training Phases

### Phase 1: Shape Recognition

Show each CAGED shape one at a time, starting with the E-shape and A-shape (most familiar to barre chord players). The fretboard highlights the chord tones within the shape in their respective note colors. The root notes have a thick white border and are slightly larger. A semi-transparent colored zone overlay (matching the shape’s assigned color) covers the fret range. The outline of the original open chord shape is faintly visible as a ghost overlay to help the user recognize the connection to what they already know.

**Fretboard Display:** The shape’s chord tones are highlighted. Root notes have white borders and are enlarged. A colored translucent zone covers the shape’s fret range. A faint dotted outline shows the open chord shape for reference. Notes outside the zone are dimmed to 15% opacity.

### Phase 2: Shape Connection (The Key Exercise)

This is the core of CAGED training. The user selects a root note (e.g. G). The system shows the first CAGED shape for G (typically the E-shape at fret 3). Then a 'Next Shape' button advances to the A-shape, and the fretboard animates a smooth transition: the current shape’s zone slides/fades out while the next shape’s zone slides/fades in. Crucially, overlapping notes between the two shapes remain highlighted during the transition, showing how the shapes connect. The user can click 'Animate All' to see all 5 shapes cascade through in sequence, visualizing how the entire fretboard is covered.

### Phase 3: Root Finding

The system names a note and a CAGED shape: 'Find the D chord using the A-shape.' The user must identify the correct fret position and tap the root. This builds the mental map of where each shape falls for each key. The fretboard shows no shapes — the user must recall the shape’s position. After tapping, the full shape is revealed for confirmation.

### Phase 4: Scale Integration

Each CAGED shape has a corresponding major scale pattern. This phase overlays the full scale pattern within each shape’s zone. The user plays through the scale notes in order (guided by numbered circles: 1, 2, 3, 4, 5, 6, 7, 8). Chord tones (1, 3, 5) are shown in the root’s color; other scale degrees are shown in a lighter shade. This connects chord knowledge directly to scale knowledge within each position.

## 6.4 Visual Design Specifications

### Shape Zone Overlays

Each CAGED shape has an assigned overlay color (semi-transparent): C-shape = coral/orange, A-shape = blue, G-shape = green, E-shape = purple, D-shape = teal. The zone is rendered as an SVG rectangle with rounded corners that spans the shape’s fret range and all 6 strings. Opacity is 0.08 (very subtle). When active/selected, opacity increases to 0.15 and a thin border appears.

### Ghost Chord Overlay

A dashed SVG outline showing the original open chord fingering, transposed to the current position. This uses thin gray dashed lines connecting the finger positions, mimicking a chord diagram. This overlay is toggleable and defaults to ON for beginners, OFF for advanced users.

### Connection Animation

When transitioning between shapes, an animation runs for 800ms: the outgoing shape’s zone fades from 0.15 to 0.0 opacity. The incoming shape’s zone fades from 0.0 to 0.15. Notes that exist in both shapes (the overlap region) remain at full brightness and have a brief white flash to draw attention to the connection points. A thin horizontal bracket annotation appears between the two shapes showing 'Overlap zone.'

## 6.5 Interaction Mechanics

•     Click a root note on the fretboard to set the key, then cycle through CAGED shapes with left/right arrow buttons

•     Toggle buttons for each layer: Chord Tones, Scale Pattern, Zone Overlay, Ghost Chord

•     'Play Shape' button: arpeggiate the chord tones within the shape (low to high) using the audio engine

•     'Animate Sequence' button: auto-cycle through all 5 shapes with transition animations

•     In quiz mode: tap where you think the root of a named shape is, then the full shape reveals

## 6.6 Shortcuts & Memory Tricks

•     'CAGED order never changes: C-A-G-E-D, then loops back to C' — shown as a circular diagram

•     'E-shape and A-shape are your barre chords. You already know these.' — shown with a barre chord reference diagram

•     'The root of the A-shape is always on string 5. The root of the E-shape is always on string 6.' — string roots are annotated

•     'Each shape shares 2-3 notes with the next shape — those are your landmarks' — overlap notes are circled



 

**PART 7: METHOD 4 — FRETBOARD LOGIC (LANDMARKS + INTERVALS)**

# Method 4: Fretboard Logic (Landmark Notes + Intervals)

**Effectiveness Rating: 8/10** | Difficulty: Intermediate | Prerequisite: Basic interval knowledge

## 7.1 Core Concept & Music Theory

This method builds a mental coordinate system on the fretboard by anchoring 'landmark' notes at known positions, then using interval knowledge (how many frets between notes) to derive any note from the nearest landmark. Think of it like a city street grid: you memorize the major intersections, then calculate distances to reach any address.

The landmark positions are: Fret 0 (open strings: E A D G B E), Fret 5 (A D G C E A — the notes on fret 5 match the open string one step higher, except the B string), Fret 7 (B E A D F# B — a perfect 5th above the open string), and Fret 12 (same as open strings, one octave higher: E A D G B E). From any landmark, the student counts semitones: 1 fret = 1 half step, 2 frets = 1 whole step.

**Key Theory Principle:** Half steps in the chromatic scale: B→C and E→F have no sharp between them (adjacent frets). All other natural notes have a sharp/flat between them (2 frets apart). This is the single most important pattern for deriving notes by interval.

## 7.2 Training Phases

### Phase 1: Landmark Memorization

The fretboard highlights ONLY the landmark frets (0, 5, 7, 12) with their note names visible. All other frets are completely empty. The user practices naming the notes at these positions. A prompt cycles through: 'What note is on String 3, Fret 5?' The user taps or types the answer. This phase continues until the user achieves 95% accuracy on all landmarks.

**Fretboard Display:** Four vertical columns of highlights at frets 0, 5, 7, and 12. Each column shows all 6 notes with their note colors. Thick vertical dotted lines connect the fret markers (the dots on real guitars) to emphasize these as reference points. All other frets are empty gray circles.

### Phase 2: Interval Counting Trainer

A landmark note is highlighted. An arrow extends from it toward a target fret with a number showing the semitone distance. The user must name the note at the target. For example: String 5, Fret 5 (the note D) is highlighted. An arrow points 3 frets higher to Fret 8. The prompt says: 'D + 3 semitones = ?' The user answers F. The system visually labels each fret between the landmark and target with the intermediate note names, reinforcing the chromatic sequence.

**Fretboard Display:** The landmark note is highlighted with its color. A horizontal arrow extends along the string to the target position. Small numbered steps appear between ('+1 D#', '+2 E', '+3 F'). The target position shows a question mark until answered.

### Phase 3: Nearest-Landmark Navigation

A random fret position is highlighted (no note name shown). The system asks: 'What note is this?' The user must mentally identify the nearest landmark, count the interval, and determine the note. After answering, the system shows which landmark was nearest and the interval path, reinforcing the navigation strategy. This trains the critical skill of going from any fret position to a note name using the landmark system.

### Phase 4: Reverse Derivation

The system names a note and a string: 'Find F# on String 4.' The user must identify the nearest landmark to F#, calculate the offset, and tap the correct fret. This is the reverse of Phase 3 — instead of position → note name, it’s note name → position. Both directions must be trained for fluency.

## 7.3 Visual Design Specifications

### Landmark Pillars

The landmark frets should be visually distinct from all other frets. Render them as full-height semi-transparent colored columns spanning all 6 strings: Fret 0 = subtle blue column, Fret 5 = subtle green column, Fret 7 = subtle purple column, Fret 12 = subtle blue column (matching fret 0 to reinforce the octave connection). The column opacity is 0.06 so it’s visible but doesn’t interfere with notes.

### Interval Arrows

SVG arrows drawn along a string from the landmark to the target. The arrow is colored with the target note’s color. Small labels at each fret along the path show the chromatic note name in 10px text. The arrow has an animated drawing effect (stroke-dashoffset animation over 600ms) so it appears to extend from landmark to target.

### Half-Step / Whole-Step Brackets

Between adjacent natural notes on the fretboard, show small bracket annotations: 'H' for half-step (B-C and E-F) and 'W' for whole-step (all others). These appear as small curved brackets below the string with the letter inside. Toggleable via the Hints system. This visual pattern is the single most useful memory aid for this method.

## 7.4 Interaction Mechanics

•     Click any fret position to attempt naming the note (a text input or note-button selector appears)

•     The system tracks which landmarks the user is relying on and varies exercises to strengthen weak landmarks

•     After an answer, the derivation path is always shown (even on correct answers) to reinforce the mental model

•     Optional 'show breadcrumbs' mode draws a faint line from the nearest landmark to the answered position

## 7.5 Shortcuts & Memory Tricks

•     'Fret 5 = next string open (except B)' — this single rule gives you 24 free notes

•     'B to C and E to F are neighbors (no sharp between)' — the most important interval pattern, shown with a highlighted chromatic ring diagram

•     'Fret 12 is a mirror of fret 0' — with an animated mirror/reflection visual effect

•     'Fret 7 = perfect 5th above open' — for users who know their 5ths, this is a powerful anchor



 

**PART 8: METHOD 5 — CALL-AND-RESPONSE / QUIZ DRILLS**

# Method 5: Call-and-Response / Quiz Drills

**Effectiveness Rating: 7.5/10** | Difficulty: All Levels | Prerequisite: None

## 8.1 Core Concept & Learning Science

Active recall — being tested on material rather than passively reviewing it — is one of the strongest memory techniques supported by cognitive science research. This method turns the fretboard into a two-way quiz system. The 'call' is a prompt (either a note name or a fret position), and the 'response' is the user’s answer (either tapping a position or naming a note). By training both directions, the user builds complete bidirectional fluency.

The system uses a spaced repetition algorithm (based on SM-2 or a simplified variant) to prioritize notes the user struggles with. Notes answered correctly multiple times in a row are shown less frequently. Notes answered incorrectly are repeated more often and sooner. This ensures practice time is spent where it’s needed most.

## 8.2 Quiz Modes

### Mode A: Name → Location ('Find It')

The system displays a note name prominently (e.g. 'Find all Bb notes' or 'Find Bb on String 3'). The fretboard shows empty circles at all positions. The user taps fret positions. Correct taps light up in the note’s color. Incorrect taps flash red and shake. The 'Find all' variant asks the user to find every instance on the fretboard. The 'Find on String X' variant constrains to a single string.

**Fretboard Display:** Completely blank fretboard. All fret positions are shown as empty gray circles. When the user taps correctly, the circle fills with the note’s color and the note name appears inside. When wrong, the circle flashes red for 300ms then returns to gray.

### Mode B: Location → Name ('Name It')

The system highlights a random fret position on the fretboard with a white/neutral pulsing circle (no note name or color shown). Below the fretboard, a row of 12 note buttons appears (C, C#, D, D#, E, F, F#, G, G#, A, A#, B) each in their assigned color. The user taps the correct note button. This tests recognition: given a position, can you name the note?

**Fretboard Display:** All notes hidden. One fret position highlighted with a white pulsing circle and a question mark icon inside. The answer buttons appear below the fretboard as a horizontal row of colored circles, matching the note color key.

### Mode C: Mixed Rapid Fire

Alternates randomly between Mode A and Mode B questions. This prevents the user from settling into a single recognition pattern and builds true fluency. A timer counts up and the system tracks how many correct answers per minute. The session ends after a configurable number of questions (default: 20) or a configurable time limit (default: 5 minutes).

### Mode D: Timed Challenge

A 60-second sprint. Questions fire every time the user answers (no waiting). The goal is to answer as many correctly as possible. A running count shows 'Correct: 24 / Attempted: 27' in real-time. At the end, the session summary shows accuracy, speed, and which notes were missed. A leaderboard (personal best scores) encourages repeat attempts.

## 8.3 Spaced Repetition Engine

Each note at each fret position has a proficiency score stored in the user’s progress data. The score starts at 0 and ranges from 0 (never seen) to 5 (mastered). The algorithm works as follows:

\1.   When a note-position is answered correctly on the first try, its score increases by 1 (max 5).

\2.   When answered incorrectly, its score decreases by 2 (min 0).

\3.   When answered correctly after a hint, its score increases by 0.5.

\4.   The probability of a note-position being selected as a quiz question is inversely proportional to its score: P = (6 - score) / totalWeight.

\5.   Notes at score 0-1 are shown 3x more frequently than notes at score 4-5.

\6.   After all notes reach score 3+, the system introduces speed pressure (shorter response windows) to push toward automatic recall.

## 8.4 Visual Design Specifications

### Note Answer Buttons

12 circular buttons (48px diameter on desktop, 44px on mobile) arranged in a horizontal row. Each button shows the note name in white text on its assigned color background. The currently correct answer button has no visual distinction (to prevent pattern recognition). After selection, the correct button briefly scales up (1.2x) with a green ring, while the wrong selection (if any) shakes.

### Streak Counter

A prominent counter in the top-right of the training panel showing the current streak (consecutive correct answers). Displayed as a large number with a small flame emoji at milestones (5, 10, 15, 20...). The counter has a flip animation when incrementing. At streak = 0, the counter is gray. At streak >= 5, it turns amber. At streak >= 10, it turns orange with a glow.

### Heat Map Progress View

A miniature fretboard overlay where each fret position is colored by proficiency score: Score 0 = dark gray (unknown), Score 1 = red, Score 2 = orange, Score 3 = yellow, Score 4 = light green, Score 5 = bright green. This gives the user an at-a-glance view of which areas of the fretboard they know well and which need work. Accessible via a 'Progress Map' toggle button.

## 8.5 Difficulty Scaling

| **Setting**         | **Easy**                      | **Medium**              | **Hard**                     |
| ------------------- | ----------------------------- | ----------------------- | ---------------------------- |
| **Notes**           | Natural notes  only (7 notes) | All 12  chromatic notes | All 12 +  enharmonic names   |
| **Strings**         | Strings 5  & 6 only           | All 6 strings           | All 6, random  order         |
| **Frets**           | 0-5 only                      | 0-12                    | 0-22 full  neck              |
| **Timer**           | None  (unlimited time)        | 5 seconds per  question | 2 seconds per  question      |
| **Answer  Choices** | 4 choices  (multiple choice)  | 12 choices  (all notes) | Open input  (type note name) |



 

**PART 9: METHOD 6 — INTERVAL TRAINING ON THE FRETBOARD**

# Method 6: Interval Training on the Fretboard

**Effectiveness Rating: 7/10** | Difficulty: Advanced | Prerequisite: Know note names, basic interval theory

## 9.1 Core Concept & Music Theory

Instead of memorizing individual note names at positions, this method teaches the geometric shapes that intervals make on the fretboard. An interval is the distance between two notes. On guitar, each interval has a consistent two-dimensional shape across string pairs (similar to octave shapes, but for all 12 intervals).

The 12 intervals and their fretboard geometry:

| **Interval**          | **Semitones** | **Same String** | **Adjacent String**      | **Musical Role**      |
| --------------------- | ------------- | --------------- | ------------------------ | --------------------- |
| **Minor 2nd  (m2)**   | 1             | +1 fret         | Next string,  -4 frets   | Tension,  chromatic   |
| **Major 2nd  (M2)**   | 2             | +2 frets        | Next string,  -3 frets   | Scale step            |
| **Minor 3rd  (m3)**   | 3             | +3 frets        | Next string,  -2 frets   | Minor chord  tone     |
| **Major 3rd  (M3)**   | 4             | +4 frets        | Next string,  -1 fret    | Major chord  tone     |
| **Perfect  4th (P4)** | 5             | +5 frets        | Next string,  same fret  | Tuning  interval      |
| **Tritone  (TT)**     | 6             | +6 frets        | Next string,  +1 fret    | Dissonance,  dominant |
| **Perfect  5th (P5)** | 7             | +7 frets        | Next string,  +2 frets   | Power chord           |
| **Minor 6th  (m6)**   | 8             | +8 frets        | Next string,  +3 frets   | Inversion of  M3      |
| **Major 6th  (M6)**   | 9             | +9 frets        | Next string,  +4 frets   | Inversion of  m3      |
| **Minor 7th  (m7)**   | 10            | +10 frets       | 2 strings up,  same fret | Dominant 7th  chord   |
| **Major 7th  (M7)**   | 11            | +11 frets       | 2 strings up,  +1 fret   | Major 7th  chord      |
| **Octave  (P8)**      | 12            | +12 frets       | 2 strings up,  +2 frets  | Same note,  higher    |

 

**B-String Adjustment:** All 'Adjacent String' shapes assume the standard 4th tuning interval. When crossing from String 3 (G) to String 2 (B), subtract 1 fret from the offset. When crossing from String 2 (B) to String 1 (E), the standard 4th tuning resumes. The system must apply this correction dynamically.

## 9.2 Training Phases

### Phase 1: Interval Shape Gallery

Present one interval at a time. The fretboard shows a root note (large, colored, with 'R' label) and the interval note (with the interval name label, e.g. 'P5'). An SVG arrow connects them. The user can click 'Move' to see the same interval shape at different positions. Click 'Change Strings' to see it across different string pairs (noting the B-string adjustment). An audio button plays both notes sequentially so the user hears the interval.

### Phase 2: Interval Identification

Two notes are highlighted on the fretboard. The user must identify the interval between them. A panel shows buttons for all 12 intervals. The user selects the correct one. After answering, the system labels both notes and draws the connecting arrow. Start with intervals on the same string (easy to count frets), then progress to cross-string intervals.

### Phase 3: Interval Construction

A root note is highlighted and the system prompts: 'Build a Perfect 5th above this note.' The user must tap the fretboard at the correct position. Multiple correct positions may exist (same-string or cross-string). The system accepts any correct position and then shows all valid positions for that interval from the given root.

### Phase 4: Applied Intervals — Chord Building

The system prompts: 'Build a major triad from this root (R, M3, P5).' The user taps three positions. This connects interval knowledge directly to chord construction. Extend to minor triads (R, m3, P5), dominant 7ths (R, M3, P5, m7), and other common chord types. This is the most musically rewarding phase.

## 9.3 Visual Design Specifications

### Interval Label System

When a note is displayed in interval context, its circle shows the interval abbreviation (P1, m2, M2, m3, M3, P4, TT, P5, m6, M6, m7, M7, P8) instead of the note name. A toggle allows switching between showing interval labels and note name labels. Root notes always show 'R' in a slightly larger circle with a thick white border.

### Interval Arrow Styles

Different intervals use different arrow styles for visual distinction: Perfect intervals (P4, P5, P8) = solid thick line. Major intervals = solid thin line. Minor intervals = dashed line. Tritone = dotted line with a warning color (amber). All arrows use the target note’s color.

### Chord Shape Overlay

When building chords in Phase 4, all the selected notes are connected by lines forming a geometric shape on the fretboard. Major triads form a characteristic triangular pattern. Minor triads form a slightly different triangle. This visual geometry reinforces the spatial relationship of chord tones.

## 9.4 Interaction Mechanics

•     Click a note, then click the interval button to see that interval from the clicked note

•     In quiz mode: two notes are shown, tap the interval name button to identify

•     In build mode: one note and an interval name are shown, tap the fretboard to place the second note

•     Audio always plays both notes (root first, then interval) after each interaction

•     Toggle between 'interval labels' and 'note name labels' with a button in the control bar



 

**PART 10: METHOD 7 — SINGLE-STRING CHROMATIC EXERCISES**

# Method 7: Single-String Chromatic Exercises

**Effectiveness Rating: 7/10** | Difficulty: Beginner | Prerequisite: None

## 10.1 Core Concept & Music Theory

This is the simplest and most accessible method. It reduces the fretboard from a complex 2D grid to a simple 1D line. On any single string, the notes ascend chromatically: each fret is one semitone higher than the previous. By saying or thinking the note name as you play each fret, you build the fundamental association between position and note name.

The chromatic sequence on any string starting from its open note: For the low E string: E, F, F#, G, G#, A, A#, B, C, C#, D, D#, E (at fret 12, the octave). Key music theory insight: the distance between any two natural notes is 2 frets (a whole step), except B→C and E→F which are 1 fret (a half step). This 'whole-whole-half' irregularity is the core pattern that defines the chromatic scale and western music.

## 10.2 Training Phases

### Phase 1: Chromatic Walkthrough (Guided)

The user selects a string. The fretboard dims all other strings to 10% opacity and visually isolates the selected string. The exercise begins at the open string (fret 0). The system highlights each fret position one at a time, left to right, with the note name displayed inside. An animated cursor (a glowing ring) moves along the string at a comfortable pace (1 note per second). The user’s job is to say the note name aloud (or tap a 'Next' button) as each note is highlighted. A text prompt below shows 'Say: E ... F ... F# ... G ...' synced with the animation.

**Fretboard Display:** Only one string is prominently visible. All fret positions on that string show their note names in their respective colors. A glowing animated ring moves from fret to fret. The currently active note is enlarged and has a thick border. Previously passed notes remain highlighted at 60% opacity, creating a trail.

### Phase 2: Natural Notes Only

Same single-string exercise, but only the 7 natural notes (C D E F G A B) are highlighted. Sharp/flat positions are shown as empty gray dots. The user walks through the string naming only the natural notes. This is easier and reinforces the whole-step/half-step pattern. The system adds bracket annotations between adjacent natural notes: 'W' (whole step = 2 frets gap) and 'H' (half step = 1 fret gap).

The half-step pairs (B→C and E→F) are highlighted with a warm color bracket and a special annotation: 'These two notes are neighbors — no sharp between them!'

### Phase 3: Fill in the Blanks

The system shows the string with some notes labeled and others hidden (shown as '?'). The user must tap each '?' position and name the note. Start with 1-2 missing notes (Easy), progress to only landmark notes shown with everything else hidden (Hard). This tests whether the user has internalized the sequence rather than just reading it.

**Fretboard Display:** The selected string shows a mix of labeled notes (with their colors) and mystery positions (gray circles with '?' inside). When the user taps a '?', a note input appears. On correct answer, the '?' fills with the note’s color and name.

### Phase 4: Reverse (Descending)

Same exercises but starting from fret 12 and going down to fret 0. This builds the descending sequence memory which many guitarists neglect. The cursor moves right to left. The note sequence reverses: E, D#, D, C#, C, B, A#, A, G#, G, F#, F, E.

### Phase 5: Speed Naming

The system randomly highlights positions on the selected string and the user must name them as fast as possible. A timer tracks response time. The exercise uses the spaced repetition engine from Method 5 to prioritize positions the user struggles with. Target: consistently naming any position within 2 seconds.

### Phase 6: Multi-String Graduation

After mastering each string individually, the system tests across strings. It randomly switches which string is active and which position is highlighted. This bridges the gap between single-string knowledge and full fretboard knowledge, preparing the user to combine this method with others (especially Octave Shapes and Fretboard Logic).

## 10.3 Visual Design Specifications

### String Isolation View

When a single string is selected, the fretboard rendering changes: the selected string’s line becomes 3px thick (from the normal 1.5px). Its color becomes the primary text color. All other strings become 0.5px lines at 15% opacity. Fret positions on non-selected strings are hidden entirely. The selected string’s note circles are 50% larger than normal (e.g. 36px instead of 24px diameter) for easy tapping on mobile.

### Chromatic Trail Animation

As the user progresses through the chromatic walkthrough, each correctly named note’s circle fills with its color and remains lit. This creates a growing 'trail' of colored dots from left to right across the string, giving a satisfying visual sense of progress. The trail has a subtle gradient effect where older notes are at 60% opacity and the newest is at 100%.

### Whole/Half Step Annotations

Between adjacent natural notes, bracket-shaped annotations appear below (or above) the string. Whole steps show a wide bracket labeled 'W' spanning 2 frets. Half steps show a narrow bracket labeled 'H' spanning 1 fret. The half-step brackets are colored coral/red to make them stand out as the exception to the 'default' whole-step pattern.

## 10.4 String Selector

A 6-button selector with each button representing a string. Buttons are arranged vertically (matching string order on the fretboard) or horizontally. Each shows the open string note name and tuning pitch (e.g. 'E2', 'A2', 'D3', 'G3', 'B3', 'E4'). The currently selected string’s button has a highlighted border. Completed strings show a green checkmark.

## 10.5 Interaction Mechanics

•     Click a string button to select which string to practice on

•     In walkthrough mode: tap 'Next' or press spacebar to advance to the next note; the system waits for user input

•     In fill-in-the-blanks mode: tap a '?' circle, then tap the note name from the 12-button answer panel below

•     In speed naming mode: positions highlight randomly and the user taps note buttons as fast as possible

•     Audio: each note plays its pitch when highlighted (if audio is enabled), reinforcing ear training

•     Voice input (optional/experimental): the user says the note name aloud and speech recognition validates the answer



 

**PART 11: GAMIFICATION, PROGRESS & ANALYTICS**

# Part 11: Gamification, Progress & Analytics

## 11.1 XP and Leveling System

Each correctly answered question earns XP (experience points). XP accumulates to unlock levels. The leveling curve requires progressively more XP per level, encouraging sustained practice.

| **Level** | **XP Needed** | **Title**            | **Unlock**                      |
| --------- | ------------- | -------------------- | ------------------------------- |
| **1-3**   | 0-300         | Fret Newbie          | Basic methods  (1, 5, 7)        |
| **4-7**   | 300-1000      | String  Explorer     | Intermediate  methods (2, 4)    |
| **8-12**  | 1000-3000     | Fretboard  Navigator | Advanced  methods (3, 6)        |
| **13-20** | 3000-10000    | Note Master          | All hard  modes, challenges     |
| **21+**   | 10000+        | Fretboard  Wizard    | Bragging  rights, custom themes |

 

### XP Awards

•     Correct answer (first try): 10 XP

•     Correct answer (after hint): 3 XP

•     Streak bonus: +2 XP per streak (10 streak = +20 XP per answer)

•     Speed bonus: answer within 1 second = +5 XP

•     Session completion bonus: 50 XP for completing a full exercise

•     Perfect session (100% accuracy): 100 XP bonus

•     Daily streak bonus: consecutive days of practice earn multipliers (Day 2 = 1.2x, Day 7 = 2x, Day 30 = 3x)

## 11.2 Achievement Badges

Unlock visual badges for milestones. Badges appear on the user’s progress profile and can be displayed as a collection. Categories include:

•     Note Mastery: 'C Master', 'F# Master', etc. — awarded when a specific note reaches Score 5 across all positions

•     String Mastery: 'Low E Ace', 'B String Boss' — awarded when all notes on a string are mastered

•     Method Mastery: 'CAGED Pro', 'Octave Oracle' — awarded for completing all phases of a method

•     Speed: 'Lightning Fingers' (20+ correct in 60 seconds), 'Blitz Master' (30+)

•     Consistency: 'Week Warrior' (7-day streak), 'Month of Mastery' (30-day streak)

•     Completionist: 'Full Fretboard' — all 132 positions (22 frets x 6 strings) mastered

## 11.3 Progress Analytics Dashboard

A dedicated analytics page showing:

### Fretboard Heat Map

A full fretboard visualization where each position is color-coded by proficiency (dark gray to green gradient as described in Method 5). This is the single most valuable progress visualization — the user can see at a glance which parts of the neck they know and which are weak. Filter by string, by fret range, or by note.

### Note Proficiency Radar Chart

A radar/spider chart with 12 axes (one per note). Each axis shows the average proficiency score (0-5) for that note across all positions. This reveals if the user has blind spots for certain notes (e.g. always struggles with Bb/A#).

### Practice History Timeline

A calendar heatmap (like GitHub’s contribution graph) showing daily practice activity over the past 3-6 months. Darker green = more practice that day. Shows total sessions, total time, and total XP for any clicked date.

### Method Progress Cards

7 cards (one per method) showing: the current phase, the completion percentage of each phase, accuracy trends (line chart of last 10 sessions), and time invested. A recommended 'Next Method to try' suggestion based on current proficiency gaps.

### Speed Trend Chart

A line graph showing average response time over the last 20 sessions. Separate lines for each method. The target line at 2 seconds is shown as a dashed horizontal reference. This motivates the user to get faster over time.



 

**PART 12: TIPS & SHORTCUTS OVERLAY SYSTEM**

# Part 12: Tips & Shortcuts Overlay System

## 12.1 Overview

The Tips & Shortcuts system is a toggleable overlay layer that can be activated on top of any training method. When enabled, contextual memory aids, mnemonics, and visual shortcuts appear as floating annotations on or near the fretboard. These are sourced from established guitar pedagogy and optimized for the specific method being used.

## 12.2 Global Tips (Available in All Methods)

•     Open String Mnemonic: 'Eddie Ate Dynamite Good Bye Eddie' (E A D G B E) — displayed as floating text at the nut, with each word colored in its note’s color

•     Fret 12 Mirror Rule: 'Fret 12 = Open strings, one octave up' — shown as a mirror line with identical note circles on both sides

•     B-String Offset Warning: 'Everything shifts +1 fret when crossing from G to B string' — appears whenever an exercise involves cross-string work touching the B string

•     Half-Step Neighbors: 'B→C and E→F have no sharp between them' — shown as red brackets on the chromatic display

•     Fret 5 Rule: 'Fret 5 = next higher string open (except B string → use fret 4)' — shown with arrows from fret 5 to the next open string

•     Fret Dot Pattern: 'Dots at 3, 5, 7, 9, 12 = your landmarks' — the fret markers glow when this tip is active

•     Same Shape Rule: 'Strings 1 and 6 are both E — same notes, same frets, always' — shown with a connecting bracket between strings 1 and 6

## 12.3 Method-Specific Tips

Each method has 3-5 additional tips unique to its technique. These are detailed in each method’s section above. The system loads the appropriate tips based on which method is active.

## 12.4 Visual Implementation

Tips are rendered as floating overlay elements positioned via absolute CSS within the fretboard container. Each tip has: a semi-transparent background card (white at 90% opacity with a subtle shadow), a colored left border matching the relevant note or method color, concise text (max 2 lines, 14px font), an optional SVG annotation (arrow, bracket, connecting line) drawn on the fretboard overlay layer, and a small 'x' button to dismiss individually. Tips can be toggled on/off globally via the control bar. The first time a user enables tips in a new method, they appear one at a time with a brief intro animation (fade in from bottom, 300ms delay between each). On subsequent visits, all tips appear immediately.

## 12.5 Adaptive Tip Triggering

Beyond the manual toggle, the system can proactively show relevant tips when it detects the user struggling. If a user misses 3 consecutive questions involving the B string, the B-String Offset tip automatically appears with a subtle 'Hint!' badge. If the user’s accuracy drops below 50% for natural notes, the Half-Step Neighbors tip appears. This adaptive behavior can be disabled in settings.



 

**PART 13: INTEGRATION & IMPLEMENTATION ROADMAP**

# Part 13: Integration & Implementation Roadmap

## 13.1 Component Architecture

All components should be built as React functional components using TypeScript. The directory structure:

•     src/components/learn/ — Top-level learning hub components

•     src/components/learn/methods/ — 7 method-specific training modules (NoteADay.tsx, OctaveShapes.tsx, CAGEDSystem.tsx, FretboardLogic.tsx, QuizDrills.tsx, IntervalTraining.tsx, ChromaticExercises.tsx)

•     src/components/learn/shared/ — Shared components (TrainingControlBar.tsx, FeedbackSystem.tsx, SessionSummary.tsx, TipsOverlay.tsx, ProgressHeatMap.tsx)

•     src/hooks/useTrainingSession.ts — Custom hook managing session state, scoring, timing

•     src/hooks/useSpacedRepetition.ts — Spaced repetition algorithm

•     src/hooks/useAudioEngine.ts — Web Audio API hook for note playback

•     src/lib/fretboard-data.ts — All constants (chromatic scale, tuning, CAGED shapes, interval shapes, note colors)

•     src/lib/progress-store.ts — localStorage wrapper with optional cloud sync adapter

•     src/app/learn/fretboard/page.tsx — Main route component

•     src/app/learn/fretboard/[method]/page.tsx — Dynamic route for each method

## 13.2 Fretboard Component Extension

The existing fretboard component needs the following extensions to support the training system:

\1.   Add an overlay SVG layer on top of the fretboard for rendering arrows, connectors, brackets, zone highlights, and animated elements. This layer has pointer-events: none so clicks pass through to the fret positions below.

\2.   Add onClick handlers to each fret position circle. The handler should pass (noteName, stringNumber, fretNumber) to the parent via the onNoteClick callback.

\3.   Add CSS animation classes: pulse (scale 1.0 → 1.1 → 1.0, 600ms infinite), shake (translateX shake, 300ms), glow (box-shadow pulse, 800ms), fadeIn (opacity 0 → 1, 300ms), cascade (staggered fadeIn with nth-child delays).

\4.   Add a 'quiz mode' state where note names are hidden and fret positions show as neutral gray circles.

\5.   Add string isolation mode: when stringHighlight prop is set, dim all other strings and enlarge notes on the selected string.

\6.   Add support for the overlayShapes prop: render SVG paths/lines/arrows/rectangles on the overlay layer based on shape definitions passed from the training module.

## 13.3 Implementation Phases

### Phase 1 (Weeks 1-2): Foundation

•     Extend fretboard component with overlay layer, click handlers, animation classes, and quiz mode

•     Build shared components: TrainingControlBar, FeedbackSystem, SessionSummary

•     Implement progress-store with localStorage

•     Build the LearningHub layout (method selector + fretboard + training panel)

•     Implement Method 7 (Single-String Chromatic) as the simplest proof of concept

•     Implement Method 1 (Note-a-Day) as the highest-value beginner method

### Phase 2 (Weeks 3-4): Core Methods

•     Implement Method 5 (Quiz Drills) with spaced repetition engine

•     Implement Method 2 (Octave Shapes) with SVG connector lines

•     Implement Method 4 (Fretboard Logic) with interval arrows and landmark pillars

•     Build the audio engine for note playback

•     Add difficulty scaling to all implemented methods

### Phase 3 (Weeks 5-6): Advanced Methods

•     Implement Method 3 (CAGED System) with zone overlays, ghost chords, and connection animations

•     Implement Method 6 (Interval Training) with interval labels, arrow styles, and chord building

•     Build the Tips & Shortcuts overlay system with both manual and adaptive triggering

### Phase 4 (Weeks 7-8): Gamification & Polish

•     Build XP system, leveling, and achievement badges

•     Build progress analytics dashboard (heat map, radar chart, calendar, speed trends)

•     Add all animations and micro-interactions (confetti, streak flames, level-up celebrations)

•     Mobile optimization (tap targets, responsive layouts, swipe gestures)

•     Performance optimization (lazy load methods, memoize fretboard renders, debounce animations)

•     Accessibility: keyboard navigation, screen reader labels, reduced motion support

## 13.4 Performance Considerations

•     The fretboard SVG overlay can contain many elements during complex exercises. Use React.memo on note circles and only re-render changed elements.

•     Animation frames should use requestAnimationFrame for smooth 60fps rendering, not setInterval.

•     The spaced repetition engine should pre-compute the next 10 questions during idle time so there’s zero delay between questions.

•     Progress data should be debounce-saved to localStorage (write at most once per second) to avoid blocking the main thread.

•     Audio samples should be pre-loaded on first visit and cached in an AudioBuffer pool.

## 13.5 Accessibility Requirements

•     All fret positions must have aria-label attributes describing the note name, string, and fret number.

•     Quiz modes must announce questions and feedback via aria-live regions.

•     Keyboard navigation: Tab through fret positions, Enter to select, arrow keys for navigation.

•     Respect prefers-reduced-motion: disable pulse, shake, confetti, and cascade animations.

•     Color is never the sole indicator of correctness — icons (checkmark/X) accompany color feedback.

•     All text meets WCAG AA contrast ratios against its background.

 

*End of Development Blueprint*