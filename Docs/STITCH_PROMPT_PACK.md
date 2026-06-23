# Echo — Google Stitch Prompt Pack (v2)

Complete prompts for [stitch.withgoogle.com](https://stitch.withgoogle.com/).

**Echo** = offline-first **task manager**. Reminders fire by **time**, **location** (geofence), or **both**.  
Tagline: *Tasks echo back when you're in the right place or at the right time.*

---

## How Stitch works (read first)

| Input | Works? |
|-------|--------|
| Text prompt | Yes — paste into welcome input or chat |
| PNG / JPG images | Yes — wireframes, screenshots |
| PDF | **No** — use PNGs in `Docs/stitch-wireframes/` |

### Golden rules

1. **One screen, one prompt** — multi-feature prompts reset the layout ([Stitch guide](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844))
2. **Always attach an image** when refining — text alone drifts
3. **Never ask "light and dark side by side"** — Stitch invents a new app; do dark mode as a separate recolor prompt
4. Say **"Echo task manager"** — word "echo" alone → social/audio/network UI
5. **Save screenshots** after every good generation

### Wireframe PNGs (attach per screen)

| Screen | File |
|--------|------|
| Home | `Docs/stitch-wireframes/wireframe-01.png` |
| Create | `wireframe-02.png` |
| Search | `wireframe-03.png` |
| Map | `wireframe-04.png` |
| Calendar | `wireframe-05.png` |
| View | `wireframe-06.png` |
| Edit | `wireframe-07.png` |

Optional: `assets/images/icon.png`

---

## STEP 1 — Home (first prompt)

**Attach:** `wireframe-01.png` + optional `icon.png`

```
Design the Home screen for "Echo" — a mobile task manager app for iOS and Android.

IMPORTANT: Echo is a reminders/to-do app with TIME and LOCATION triggers. NOT a social network, NOT analytics, NOT audio app.

Attach wireframe = layout guide only. Modernize visuals — do not copy flat gray boxes.

─── ANATOMY ───
Top bar: "Echo" wordmark left (indigo accent), settings gear right.
Greeting block: "Hello, [Name]" bold + subtitle "Your tasks are synced with your context." Date pill right ("JULY 03 / Wednesday").
Search bar: rounded, placeholder "Search tasks or locations..."
Filter chips (horizontal scroll): All | Date & Time | Location | Completed — pill shape, filled indigo when active.
Section label: "YOUR TASKS" with "See All" link right.
Task cards (3 samples):
  1. Buy Milk — time tag 6:30 PM (amber) + location tag Navami, Moodbidri (teal) — BOTH triggers
  2. Production Deployment — time tag 03 July, 03:15 PM (amber) — time only
  3. Collect Laundry Clothes — location tag Evershine Laundry (teal) — location only
Each card: left checkbox, title, colored trigger tags below.
Map preview card below tasks: small map snippet, pill overlay "2 tasks nearby".
Bottom nav (icon-only, no labels): Home | Search | Create (center elevated FAB with +) | Map | Calendar. Home tab active.

─── VIBE ───
Modern, smooth, clean, aesthetic, punchy. Things 3 clarity + Apple Maps polish. Soft elevation on cards, not heavy borders. Generous whitespace. Geometric sans (SF Pro / Inter). Subtle indigo-to-violet gradient on FAB and active states.

─── COLORS (light mode) ───
Background #F7F8FC. Cards white. Primary indigo #4F46E5. Time accents amber #F59E0B. Location accents teal #14B8A6. Text #1A1A2E / secondary #6B7280.

Generate ONE light-mode Home screen in a phone frame.
```

---

## STEP 2 — Dark mode (recolor only)

**Attach:** your approved Step 1 Home screenshot (save it first!)

```
Create a DARK MODE version of the attached Echo task manager Home screen.

THIS IS A COLOR SWAP ONLY. Do not redesign.

DO NOT CHANGE:
- Layout, spacing, component positions
- All text and copy (greeting, task titles, tags, chip labels, map pill)
- Screen structure (header, search, chips, task cards, map preview, bottom nav with center FAB)
- Number of sections or elements

ONLY CHANGE COLORS:
- Background: OLED black #000000
- Cards/surfaces: #1C1C1E
- Primary text #F3F4F6, secondary #9CA3AF
- Primary accent indigo #6366F1 (active chip, FAB, links)
- Time tags: amber #FBBF24 on dark amber background
- Location tags: teal #2DD4BF on dark teal background
- Borders #3A3A3C, search bar dark surface

Output ONE dark-mode Home screen. Same Echo task manager. NOT social feed. NOT analytics dashboard. NOT different user name or content.
```

---

## STEP 3 — Remaining screens (one prompt each)

**Always attach:** your Step 1 Home screenshot + matching wireframe PNG.  
Add this line to every Step 3 prompt:

```
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3a — Create Task
**Attach:** Home screenshot + `wireframe-02.png`

```
Echo task manager — Create Task screen. Scrollable form:
- Title input (required, max 150 chars) with counter
- Priority pills: Low | Medium | High | Urgent (colored dots, no emoji)
- "Time reminder" toggle → date/time picker row when on
- "Location reminder" toggle → map preview ~200px + place search field + radius slider 50m–500m (default 150m) + expand map button
- Notes textarea (optional, max 500 chars)
Sticky bottom: Cancel (text) + Save (indigo gradient, full width).
Show both triggers enabled. Light mode. Center FAB tab bar with Create active.
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3b — Search
**Attach:** Home screenshot + `wireframe-03.png`

```
Echo task manager — Search tab. Autofocus search bar at top ("Search by task, location, notes"). Live filtered task cards (same card style as Home). Empty state: magnifying glass + "Start typing to search" or "No matching tasks". X clears search. Bottom nav: Search active. Light mode.
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3c — Map
**Attach:** Home screenshot + `wireframe-04.png`

```
Echo task manager — Map tab. Full-bleed map edge-to-edge. Location-task pins with subtle pulse. Tap pin → bottom sheet: task title, time/location snippet, "View task" button. Recenter FAB bottom-right (crosshair icon). Minimal header "Map". Bottom nav: Map active. Light mode.
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3d — Calendar
**Attach:** Home screenshot + `wireframe-05.png`

```
Echo task manager — Calendar tab. Month header < October 2026 >. 7-column grid, Monday start. Today: indigo ring. Selected day: filled indigo circle. Days with tasks: dot below number. Below grid: "Friday, Oct 24" + task cards for that day. Bottom nav: Calendar active. Light mode.
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3e — Task Detail
**Attach:** Home screenshot + `wireframe-06.png`

```
Echo task manager — Task Detail for "Buy Milk". Large title. Priority badge. Rows: clock + full datetime, pin + Navami Moodbidri, radio + 150 m trigger radius. Notes card with copy + share icons. Muted metadata: Created, Modified timestamps. Bottom: Edit (indigo gradient) + Delete (red outline). Undo toast at bottom: "Task deleted — Undo". Light mode.
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3f — Task Edit
**Attach:** Home screenshot + `wireframe-07.png`

```
Echo task manager — Edit Task. Same form as Create, pre-filled with Buy Milk. Header back + "Edit". Sticky Save/Cancel bottom bar. Light mode.
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3g — Settings
**Attach:** Home screenshot only

```
Echo task manager — Settings. iOS-style grouped list. Section "Appearance": Light | Dark | System with checkmark on active. Grayed "Coming soon" rows: Account & Sync, Notifications, About. Back navigation. Light mode.
Match the exact visual style, typography, colors, and component shapes of the attached Home screen.
```

### 3h — Dark variants (optional, per screen)

For each screen you approved in light mode: attach that screen's light screenshot, paste Step 2 recolor rules, name the screen.

---

## STEP 4 — Production screens (after core UI locked)

Attach Home screenshot with each prompt. One prompt per session.

### Onboarding
```
Echo task manager — first-launch onboarding, 3 swipeable cards:
1. "Reminders that find you" — location pin illustration
2. "Right time, right place" — clock + map icons
3. "Works offline" — no account needed
Final: permission primers for Location (Always) + Notifications with plain-language why. CTA "Get started". Skip top-right. Indigo gradient accents. Match attached Home screen style.
```

### Permission banner
```
Echo task manager — non-blocking banner at top of Home: "Enable background location so echoes fire when you arrive." Buttons: Enable (indigo) + Not now (ghost). Match attached Home screen style.
```

### Trigger icon system
```
Echo task manager — icon badge spec sheet:
- Time: amber clock in rounded square
- Location: teal pin in rounded square
- Both: split badge half amber half teal
Show on task card, map pin, calendar dot. Light and dark variants. Match attached Home screen style.
```

### Micro-interactions
```
Echo task manager — interaction states sheet:
- Checkbox complete: spring scale, green fill
- Card press: scale 0.98
- Delete undo toast: slide up, dark surface, amber Undo
- Skeleton loaders for map/search
Labeled frames. Match attached Home screen style.
```

---

## If Stitch drifts (recovery)

Attach your last good screenshot. Paste:

```
WRONG — you changed the layout/content. Revert to the attached screen exactly. This is Echo TASK MANAGER (to-do + time/location reminders). Keep same structure and copy. [Describe the one change you wanted.]
```

---

## Checklist

- [ ] Step 1: paste prompt + `wireframe-01.png` → save Home light screenshot
- [ ] Step 2: attach Home screenshot → dark recolor only
- [ ] Step 3a–3g: one screen each, Home screenshot + wireframe
- [ ] Step 4: production screens as needed
- [ ] Export to Figma → implement in React Native

## App features (must not drop)

- Sort/filter: All, Date & Time, Location, Completed
- Date slider on Date & Time and Completed tabs
- Multi-select delete on Home (long-press)
- Priority: Low / Medium / High / Urgent
- Time + location toggles on create
- Place search + map picker + radius 50–500 m
- Recenter on Map tab
- Calendar dots for days with tasks
- Copy/share notes, metadata on detail
- 10 s undo on delete
- Settings: Light / Dark / System
