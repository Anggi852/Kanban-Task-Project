# UX Vision

TaskFlow should provide a calm, focused, and distraction-free productivity experience.

The interface must help users organize and track their work without overwhelming them with unnecessary visual elements.

The user experience should feel:

- Clean
- Modern
- Professional
- Lightweight
- Comfortable for long usage sessions

The application should prioritize content and workflow visibility over decorative elements.

Every interaction should support productivity and reduce cognitive load.

---

# Design Philosophy

## Design Approach

Modern Minimalism

TaskFlow adopts a modern minimalist design philosophy that emphasizes clarity, focus, and usability.

The visual design should feel similar in spirit to modern productivity tools such as Notion, Linear, and Vercel Dashboard.

The interface should avoid:

- Excessive gradients
- Glassmorphism
- Heavy shadows
- Decorative illustrations
- Overly colorful UI elements

The design should focus on:

- Clear hierarchy
- Consistent spacing
- Subtle contrast
- Comfortable reading experience

---

## Core Principles

### Simplicity First

Every UI element must serve a purpose.

Avoid unnecessary components and visual clutter.

### Content Over Decoration

Tasks, boards, and productivity data should remain the primary focus.

Visual styling should support information hierarchy rather than compete with it.

### Consistency

Components should share consistent:

- Spacing
- Border radius
- Typography
- Interaction patterns

### Visual Comfort

The application should minimize eye strain during long productivity sessions.

Avoid pure black and pure white as dominant interface colors.

---

# Visual Design System

## Color Palette

### Light Theme

Background

Warm Alabaster

# F9F9F7

Purpose:

- Primary application background
- Dashboard background
- Board page background

Characteristics:

- Warm
- Soft
- Low visual fatigue

---

Surface

Milk White

# FFFFFF

Purpose:

- Task cards
- Modals
- Dropdowns
- Sidebar
- Analytics widgets

---

Primary Text

Ink Black

# 1A1A1A

Purpose:

- Headings
- Task titles
- Board titles
- Primary content

---

Muted Text

Ash Gray

# 8E8E93

Purpose:

- Metadata
- Due dates
- Timestamps
- Secondary information

---

### Dark Theme

Background

Obsidian Shadow

# 121212

Purpose:

- Application background
- Dashboard background
- Analytics background

---

Surface

Soft Charcoal

# 1E1E1E

Purpose:

- Cards
- Modals
- Dropdowns
- Sidebar

---

Primary Text

Off-White Slate

# E4E4E7

Purpose:

- Headings
- Body text
- Navigation items

---

Muted Text

Ash Gray

# 8E8E93

Purpose:

- Metadata
- Secondary information

---

## Semantic Colors

### Primary Accent

Muted Indigo

# 6366F1

Used for:

- Primary buttons
- Active navigation items
- Links
- Selected states
- Focus indicators

---

### Success

Sage Green

# 4CAF50

Used for:

- Completed tasks
- Success notifications
- Positive metrics

---

### Warning

Amber Gold

# F4B942

Used for:

- Medium priority tasks
- Upcoming deadlines

---

### Danger

Terracotta Red

# E57373

Used for:

- High priority tasks
- Delete actions
- Overdue tasks

---

# Typography

Typography should prioritize readability and clarity.

Recommended Font Families:

Primary:

- Inter

Fallback:

- system-ui
- sans-serif

---

Heading Style

Weight:

600–700

Usage:

- Page titles
- Section headings
- Board names

---

Body Text

Weight:

400–500

Usage:

- General content
- Task descriptions

---

Metadata

Weight:

400

Color:

Ash Gray

Usage:

- Due dates
- Activity timestamps
- Secondary information

---

# Spacing System

Use an 8-point spacing scale.

Available spacing values:

- 8px
- 16px
- 24px
- 32px
- 40px
- 48px
- 64px

Spacing should remain consistent throughout the application.

---

# Border Radius

Buttons

8px

Inputs

8px

Cards

12px

Modals

16px

The application should feel soft and approachable without becoming overly rounded.

---

# Shadows

Use subtle shadows only.

Avoid heavy elevation.

Light Theme Example:

0 1px 3px rgba(0, 0, 0, 0.08)

Dark Theme Example:

0 1px 3px rgba(0, 0, 0, 0.25)

Shadows should provide depth without drawing attention.

---

# Interaction Design

Hover States

Use subtle background color changes.

Avoid dramatic animations.

---

Transitions

Duration:

150ms–250ms

Use:

- opacity
- background-color
- transform

Avoid:

- large motion effects
- excessive bounce animations

---

Focus States

All interactive elements must provide visible focus indicators.

Use Primary Accent color for focus rings.

---

# Kanban Board Design Guidelines

Columns should remain visually lightweight.

Task cards should be the primary visual focus.

Column backgrounds should blend naturally with application surfaces.

Tasks should be easy to scan and distinguish.

Priority indicators should use subtle color accents rather than large colored blocks.

Drag-and-drop interactions should feel smooth and responsive without excessive visual effects.

---

# Dark Mode Requirements

Dark mode is a first-class experience.

The interface should maintain the same visual hierarchy as light mode.

Avoid:

- Pure black (#000000)
- Pure white (#FFFFFF) text on dark backgrounds

Prioritize comfort and readability during extended nighttime usage.
