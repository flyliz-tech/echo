---
name: Echo Performance Design System
colors:
  surface: '#fcf8ff'
  surface-dim: '#dad7f3'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f2ff'
  surface-container: '#efecff'
  surface-container-high: '#e8e5ff'
  surface-container-highest: '#e2e0fc'
  on-surface: '#1a1a2e'
  on-surface-variant: '#464555'
  inverse-surface: '#2f2e43'
  inverse-on-surface: '#f2efff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#855300'
  on-secondary: '#ffffff'
  secondary-container: '#fea619'
  on-secondary-container: '#684000'
  tertiary: '#00534a'
  on-tertiary: '#ffffff'
  tertiary-container: '#006d62'
  on-tertiary-container: '#69f1de'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#71f8e4'
  tertiary-fixed-dim: '#4fdbc8'
  on-tertiary-fixed: '#00201c'
  on-tertiary-fixed-variant: '#005048'
  background: '#fcf8ff'
  on-background: '#1a1a2e'
  surface-variant: '#e2e0fc'
typography:
  display:
    fontFamily: Inter
    fontSize: 34px
    fontWeight: '700'
    lineHeight: 41px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 26px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  container-padding: 16px
  stack-gap: 12px
---

## Brand & Style
The design system is centered on "Reduced Complexity" and "Active Clarity." Drawing inspiration from high-end productivity tools and utility-first navigation apps, it prioritizes a sense of calm efficiency. The aesthetic leans into **Modern Minimalism** with a **Tactile Polish**, utilizing soft elevation rather than lines to define structure. 

The target audience consists of high-output individuals who value focus and intentionality. The UI should evoke a feeling of "ordered space"—where every element feels light but significant. We achieve this through generous whitespace, a strictly geometric type scale, and the use of depth to imply interactability.

## Colors
This design system utilizes a "Foundation + Accent" palette. The background is a cool, desaturated off-white (#F7F8FC) to reduce eye strain and make white surface cards pop with clarity. 

- **Primary (Indigo):** Reserved for primary actions, focus states, and the Floating Action Button (FAB).
- **Time (Amber):** Used exclusively for temporal data—deadlines, alerts, and time-sensitive reminders.
- **Location (Teal):** Used for spatial metadata and map-related triggers.
- **Typography:** The primary text color (#1A1A2E) is a deep navy-charcoal to maintain high contrast without the harshness of pure black.

## Typography
We utilize **Inter** for its systematic, geometric neutrality. The type hierarchy relies on significant weight shifts (Bold for headers vs. Regular for body) to create a clear scannability. 

- **Headlines:** Should always feel "punchy." Use tight letter spacing for larger sizes to maintain a modern, compact look.
- **Labels:** Small labels use a medium or semi-bold weight with increased letter spacing to ensure legibility despite the small scale.
- **Body:** Stick to the 16px base for core task information to ensure maximum readability during quick mobile interactions.

## Layout & Spacing
The layout follows a **Fluid Grid** model optimized for one-handed mobile use. We employ a 4px baseline grid. 

- **Margins:** Standard 16px horizontal margins for the main container.
- **Gutters:** 12px or 16px between list items.
- **Safe Areas:** Generous bottom padding (32px+) to ensure the Floating Action Button (FAB) does not obscure the final list item in a view.
- **Grouping:** Use 24px-32px of vertical space to separate distinct logical sections (e.g., "Today" vs. "Upcoming").

## Elevation & Depth
This design system rejects heavy borders and harsh dividers. Instead, it uses **Tonal Layers** and **Ambient Shadows** to communicate hierarchy.

- **Level 0 (Background):** #F7F8FC. The base canvas.
- **Level 1 (Cards/Inputs):** #FFFFFF with a subtle shadow (Y: 2, Blur: 8, Color: RGBA(26, 26, 46, 0.05)).
- **Level 2 (Active/Lifted):** Used for dragging or active cards. Increased shadow (Y: 10, Blur: 20, Color: RGBA(26, 26, 46, 0.08)).
- **Level 3 (FAB):** The primary indigo-to-violet gradient button uses a colored drop shadow to create a "glow" effect, suggesting its high priority.

## Shapes
The shape language is consistently **Rounded**, avoiding sharp corners to maintain a friendly, approachable feel.

- **Cards & Modals:** Use `rounded-lg` (16px) for a soft, modern enclosure.
- **Search Bars & Chips:** Use `rounded-xl` (24px) or full pill shapes to distinguish them from content-heavy cards.
- **Checkboxes:** Slightly rounded squares (4px-6px) to bridge the gap between geometric and organic.

## Components

- **Buttons:** Primary buttons are Indigo with white text. Secondary buttons use a subtle Indigo tint (#EEF2FF) with Indigo text. All buttons feature high-radius corners (12px or pill).
- **Floating Action Button (FAB):** A circular or pill-shaped indigo-to-violet gradient button located at the bottom-right. It uses a softIndigo-tinted shadow for depth.
- **Cards:** White surfaces, no borders. Depth is created via the defined Level 1 shadow. 
- **Search Bar:** Elevated white surface, pill-shaped, with a subtle #6B7280 placeholder and a soft Indigo focus ring.
- **Chips:** Pill-shaped, used for tags (Time/Location). Active states use the color of the category with 10% opacity for the background and 100% opacity for the text.
- **Lists:** Items are separated by whitespace or a very faint 0.5px #E5E7EB divider that does not touch the edges of the screen.
- **Checkboxes:** Large, tap-friendly Indigo circles when checked, and subtle grey outlines when empty.