# 🎨 Homelink v2 - Complete Design System & UI/UX Roadmap

**Version**: 2.0 (Modern Dark-First Redesign)  
**Date**: March 5, 2026  
**Status**: Design System Foundation  

---

## 📌 Design Philosophy

### Core Principles
1. **Dark Mode First** - Primary aesthetic, light mode as secondary variant
2. **Minimalist Elegance** - Clean, purposeful design without clutter
3. **Mobile-First** - Designed for phones, scales beautifully to desktop
4. **Accessibility First** - WCAG AA compliant from ground up
5. **Performance Conscious** - Visual design that loads instantly
6. **Emotional Design** - Colors and typography evoke trust, comfort, belonging

### Design Values
- **Clarity**: Information hierarchy is immediately obvious
- **Consistency**: Predictable patterns across all pages
- **Delight**: Thoughtful micro-interactions and transitions
- **Inclusivity**: Works for everyone, regardless of ability or device
- **Speed**: No fluff, users find what they need in 2-3 clicks

---

## 🎨 Color System

### Primary Color Palette (Dark Mode First)

#### **Core Brand Colors**
```
Midnight Navy (Primary)
  └─ #0A0E27 - Darkest (Page background, hero sections)
  ├─ #1a1f3a - Dark (Card backgrounds)
  ├─ #2d3556 - Medium-Dark (Hoverable surfaces)
  └─ #3f4a6f - Elevated (Panels, modals)

Accent Blue (Interactive)
  └─ #00A3E0 - Primary CTA (Buttons, links, highlights)
  ├─ #0088B8 - Hover state (Darkened on interaction)
  ├─ #00CFFF - Bright accent (Badges, icons, emphasis)
  └─ #00E5FF - Glow state (Active tabs, focus states)

Emerald Green (Success/Positive)
  └─ #10B981 - Success states, confirmations
  └─ #059669 - Hover/darker variant
  └─ #D1FAE5 - Success background (light mode fallback)

Coral Red (Errors/Destructive)
  └─ #EF4444 - Errors, warnings, destructive actions
  └─ #DC2626 - Hover/darker variant
  └─ #FEE2E2 - Error background

Amber/Orange (Warnings/Pending)
  └─ #F59E0B - Warnings, pending states
  └─ #D97706 - Hover variant
  └─ #FEF3C7 - Warning background

Neutral Grays (Text, Borders, Backgrounds)
  └─ #FFFFFF - Pure white (Text on dark, borders)
  ├─ #F3F4F6 - Ultra light (Cards in light mode)
  ├─ #E5E7EB - Light gray (Borders, dividers)
  ├─ #9CA3AF - Medium gray (Secondary text, disabled)
  ├─ #6B7280 - Dark gray (Tertiary text, hints)
  └─ #1F2937 - Near black (Text in light mode)
```

### Color Interactions & Usage

#### **Text Hierarchy**
```
Level 1 (Primary Text - Main content)
  └─ Color: #FFFFFF
  └─ Usage: Headings, primary CTAs, main body text
  └─ Contrast: 21:1 with dark backgrounds ✓ WCAG AAA

Level 2 (Secondary Text - Descriptions)
  └─ Color: #D1D5DB (Light gray)
  └─ Usage: Subtitles, helper text, descriptions
  └─ Contrast: 9:1 with dark backgrounds ✓ WCAG AA

Level 3 (Tertiary Text - Metadata)
  └─ Color: #9CA3AF (Medium gray)
  └─ Usage: Timestamps, hints, disabled states
  └─ Contrast: 4.5:1 with dark backgrounds ✓ WCAG AA

Level 4 (Disabled/Placeholder)
  └─ Color: #6B7280 (Dark gray)
  └─ Usage: Disabled text, placeholder hints
  └─ Opacity: 50% reduction in prominence
```

#### **Interactive States**
```
Default (Idle)
  └─ Background: #1a1f3a (Dark card)
  └─ Border: #3f4a6f (Subtle outline)
  └─ Text: #FFFFFF
  └─ Icon: #00A3E0 (Accent blue)

Hover (Finger over element)
  └─ Background: #2d3556 (Lightened slightly)
  └─ Border: #00A3E0 (Accent reveals)
  └─ Text: #FFFFFF (unchanged)
  └─ Icon: #00CFFF (Brightens)

Active (Pressed/Selected)
  └─ Background: #3f4a6f (More pronounced)
  └─ Border: #00CFFF (Bright accent)
  └─ Text: #00E5FF (Glows)
  └─ Icon: #00E5FF (Bright glow)

Focus (Keyboard navigation)
  └─ Outline: 3px solid #00E5FF
  └─ Offset: 2px from element
  └─ Animation: Subtle pulse

Disabled (Inactive)
  └─ Background: #1a1f3a (Same but muted)
  └─ Border: #6B7280 (Gray, no accent)
  └─ Text: #6B7280 (Grayed out)
  └─ Opacity: 60%
  └─ Cursor: not-allowed
```

#### **Component Color Mappings**

```
Buttons
├─ Primary (Brand CTA)
│  ├─ Bg: #00A3E0 → Hover: #0088B8
│  ├─ Text: #0A0E27
│  └─ Icon: #0A0E27
├─ Secondary (Ghost/Outline)
│  ├─ Bg: Transparent
│  ├─ Border: #00A3E0 → Hover: #00CFFF
│  ├─ Text: #00A3E0 → Hover: #00CFFF
│  └─ Icon: #00A3E0
├─ Tertiary (Minimal)
│  ├─ Bg: #1a1f3a
│  ├─ Text: #FFFFFF
│  ├─ Icon: #00A3E0
│  └─ Hover: Background brightens to #2d3556
└─ Danger (Destructive)
   ├─ Bg: #EF4444 → Hover: #DC2626
   ├─ Text: #FFFFFF
   └─ Icon: #FFFFFF

Cards
├─ Bg: #1a1f3a
├─ Border: 1px solid #3f4a6f
├─ Shadow: 0 10px 30px rgba(0,0,0,0.3)
├─ Hover Shadow: 0 20px 50px rgba(0,163,224,0.1)
└─ Hover Border: #3f4a6f → #00A3E0 (subtle glow)

Input Fields
├─ Bg: #0A0E27 (Darker than cards)
├─ Border: 1px solid #3f4a6f
├─ Focus Border: 2px solid #00A3E0
├─ Focus Shadow: 0 0 0 3px rgba(0,163,224,0.2)
├─ Text: #FFFFFF
├─ Placeholder: #9CA3AF
└─ Error Border: 2px solid #EF4444

Badges & Tags
├─ Success: Bg #10B981, Text #FFFFFF
├─ Warning: Bg #F59E0B, Text #0A0E27
├─ Error: Bg #EF4444, Text #FFFFFF
├─ Info: Bg #00A3E0, Text #0A0E27
└─ Neutral: Bg #3f4a6f, Text #FFFFFF

Backgrounds
├─ Page: Linear gradient #0A0E27 → #1a1f3a (20deg)
├─ Section: #1a1f3a with 1px border #3f4a6f
├─ Overlay: rgba(10,14,39,0.8) with backdrop blur
└─ Hover Overlay: rgba(0,163,224,0.05)
```

### Dark/Light Mode Toggle

**When Light Mode Is Active** (Secondary, not primary):
```
Text Inversion:
  └─ Primary Text: #0A0E27 (Instead of #FFFFFF)
  └─ Secondary Text: #4B5563 (Instead of #D1D5DB)

Background Inversion:
  └─ Page Bg: #F8FAFC (Light), card Bg: #FFFFFF
  └─ Borders: #E5E7EB (Light gray)

Accent Colors Remain:
  └─ #00A3E0 (Accent blue stays same)
  └─ #10B981 (Success stays same)
  └─ All status colors unchanged for consistency

Shadows (Softer):
  └─ Box Shadow: 0 4px 12px rgba(0,0,0,0.08)
```

---

## 🔤 Typography System

### Font Stack
```
Primary (Headings, Bold text):
  └─ Font: 'Inter' / 'Segoe UI' / -apple-system / sans-serif
  └─ Weight: 600-700 (Semibold to Bold)
  └─ Usage: All headings, CTAs, emphasis

Secondary (Body, Regular text):
  └─ Font: 'Inter' / 'Segoe UI' / -apple-system / sans-serif
  └─ Weight: 400-500 (Regular to Medium)
  └─ Usage: Body text, descriptions, UI labels

Mono (Code, Numbers):
  └─ Font: 'Courier New' / 'Menlo' / monospace
  └─ Weight: 400-500
  └─ Usage: Prices, IDs, technical text, code blocks
```

### Type Scale

```
H1 - Display Heading (Hero/Landing)
  └─ Size: 56px (desktop) / 36px (tablet) / 28px (mobile)
  └─ Weight: 700 (Bold)
  └─ Line Height: 1.2
  └─ Letter Spacing: -0.02em
  └─ Usage: Page titles, hero headlines
  └─ Example: "Discover Your Next Home"

H2 - Section Heading
  └─ Size: 40px (desktop) / 28px (tablet) / 24px (mobile)
  └─ Weight: 700 (Bold)
  └─ Line Height: 1.3
  └─ Letter Spacing: -0.01em
  └─ Usage: Section titles, major content breaks
  └─ Example: "Recent Listings"

H3 - Subsection Heading
  └─ Size: 28px (desktop) / 22px (tablet) / 18px (mobile)
  └─ Weight: 600 (Semibold)
  └─ Line Height: 1.4
  └─ Letter Spacing: 0
  └─ Usage: Card titles, dialog headers
  └─ Example: "Filter Results"

H4 - Minor Heading
  └─ Size: 20px (desktop) / 18px (tablet) / 16px (mobile)
  └─ Weight: 600 (Semibold)
  └─ Line Height: 1.4
  └─ Letter Spacing: 0
  └─ Usage: Form labels, list titles
  └─ Example: "Full Name"

Body Large (Primary body text)
  └─ Size: 18px (desktop) / 16px (mobile)
  └─ Weight: 400 (Regular)
  └─ Line Height: 1.6
  └─ Letter Spacing: 0
  └─ Usage: Main content paragraphs, descriptions
  └─ Example: Listing descriptions, about text

Body Regular (Default body text)
  └─ Size: 16px (desktop) / 14px (mobile)
  └─ Weight: 400 (Regular)
  └─ Line Height: 1.6
  └─ Letter Spacing: 0
  └─ Usage: Default body text, card content
  └─ Example: Most UI text

Body Small (Secondary text)
  └─ Size: 14px (desktop) / 12px (mobile)
  └─ Weight: 400 (Regular)
  └─ Line Height: 1.5
  └─ Letter Spacing: 0
  └─ Usage: Help text, captions, metadata
  └─ Example: "Last updated 2 hours ago"

Caption (Smallest text)
  └─ Size: 12px
  └─ Weight: 500 (Medium)
  └─ Line Height: 1.4
  └─ Letter Spacing: 0.01em
  └─ Usage: Timestamps, badges, labels
  └─ Example: "VERIFIED" badge, "Mar 5, 2026"

Label (Form labels, tags)
  └─ Size: 13px
  └─ Weight: 600 (Semibold)
  └─ Line Height: 1.5
  └─ Letter Spacing: 0.02em
  └─ Usage: Form field labels, tag labels
  └─ Example: "Email Address", "Landlord"

Button Text (CTAs)
  └─ Size: 14px / 16px (mobile)
  └─ Weight: 600 (Semibold)
  └─ Line Height: 1.5
  └─ Letter Spacing: 0.01em
  └─ Text Transform: None (natural case)
  └─ Usage: Button labels, CTAs
  └─ Example: "Browse Listings"
```

### Typography Color & Contrast

```
Dark Mode (Primary)
├─ Heading: #FFFFFF (H1-H4)
│  └─ Contrast: 21:1 with #0A0E27 ✓ AAA
├─ Body Large: #FFFFFF
│  └─ Contrast: 21:1 ✓ AAA
├─ Body Regular: #D1D5DB
│  └─ Contrast: 9:1 ✓ AA
├─ Secondary: #9CA3AF
│  └─ Contrast: 4.5:1 ✓ AA
├─ Tertiary: #6B7280
│  └─ Contrast: 3.5:1 (Decorative only)
└─ Links: #00CFFF
   └─ Contrast: 10:1 ✓ AAA
   └─ Underline: Visible on hover

Light Mode (Secondary)
├─ Heading: #0A0E27 (Dark navy)
├─ Body: #1F2937 (Near black)
├─ Secondary: #4B5563 (Dark gray)
└─ Links: #0088B8 (Darker blue)
```

### Font Loading Strategy
```
System Fonts (Fallback - instant):
└─ -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto'

Optimized Web Fonts (Inter - 400, 500, 600, 700):
└─ Self-hosted or Google Fonts with font-display: swap
└─ Preload critical weights: 400, 600, 700
└─ Lazy load 500 weight for better performance
```

---

## 🎯 Spacing & Layout System

### Spacing Scale (8px base)
```
0:   0px    (No space)
1:   4px    (Tight)
2:   8px    (XS - Between elements)
3:   12px   (Small - Form fields, compact areas)
4:   16px   (Medium - Standard padding, margins)
5:   20px   (ML - Card padding)
6:   24px   (Large - Section spacing)
7:   32px   (XL - Major section gaps)
8:   40px   (2XL - Hero spacing)
9:   48px   (3XL - Full screen sections)
10:  56px   (4XL - Landing page sections)
11:  64px   (5XL - Large hero gaps)
12:  80px   (6XL - Extra large sections)
```

### Breakpoints (Mobile-First)
```
xs:  0px     (Mobile portrait)
sm:  640px   (Mobile landscape / small tablet)
md:  768px   (Tablet portrait)
lg:  1024px  (Tablet landscape)
xl:  1280px  (Desktop)
2xl: 1536px  (Large desktop)

Design Guide:
└─ Mobile first: Design for xs, enhance at md, optimize at lg
└─ Stacking: Cards stack on xs-sm, 2 columns on md, 3+ on lg-xl
└─ Touch targets: Min 44x44px on mobile (24x24 on desktop)
```

### Container & Grid System
```
Page Container:
└─ Max width: 1280px
└─ Padding: 16px (mobile) → 24px (tablet) → 32px (desktop)
└─ Margins: Center-aligned, auto left/right

Grid Columns:
└─ Mobile (xs): 1 column (full width)
└─ Tablet (md): 2 columns
└─ Desktop (lg): 3-4 columns
└─ Large (xl): 4-5 columns
└─ Gutter: 16px (mobile) → 20px (tablet) → 24px (desktop)

Card Dimensions:
└─ Standard: Width varies by grid, Height: auto (content-driven)
└─ Listing Card: Min-height 320px, aspect-ratio image 4:3
└─ Small Card: Min-height 200px
└─ Hero Card: Full width, height 280-400px based on screen

Section Padding:
└─ Vertical: 32px (mobile) → 48px (tablet) → 64px (desktop)
└─ Horizontal: 16px (mobile) → 24px (tablet) → 32px (desktop)
```

---

## 🎭 Component Library Specifications

### Buttons

```
PRIMARY BUTTON
├─ Size: 40px (md), 36px (sm), 32px (xs)
├─ Padding: 0 24px (md), 0 20px (sm), 0 16px (xs)
├─ Border Radius: 12px
├─ Font: Button Text (14px, Semibold)
├─ Bg: #00A3E0
├─ Hover: #0088B8, shadow increase
├─ Active: #006A8A, pressed effect
├─ Disabled: #6B7280 60%, cursor not-allowed
├─ Transition: all 200ms ease
└─ Icon: Can include left/right icon, 20px size

SECONDARY BUTTON (Ghost/Outline)
├─ Size: 40px (md), 36px (sm), 32px (xs)
├─ Border: 2px solid #00A3E0
├─ Background: Transparent
├─ Text: #00A3E0
├─ Hover: Border #00CFFF, Bg rgba(0,163,224,0.05), shadow
├─ Active: Border #00CFFF, Bg rgba(0,163,224,0.1)
├─ Transition: all 200ms ease
└─ Icon: 20px, same color as text

TERTIARY BUTTON (Minimal)
├─ Size: 40px (md), 36px (sm), 32px (xs)
├─ Padding: 0 16px
├─ Background: #1a1f3a
├─ Border: 1px solid #3f4a6f
├─ Text: #FFFFFF
├─ Icon: #00A3E0
├─ Hover: Bg #2d3556, Border #00A3E0
├─ Active: Bg #3f4a6f, Border #00CFFF
└─ Transition: all 200ms ease

DANGER BUTTON (Destructive)
├─ Size: 40px (md), 36px (sm), 32px (xs)
├─ Background: #EF4444
├─ Hover: #DC2626
├─ Text: #FFFFFF
├─ Icon: #FFFFFF
└─ Requires confirmation dialog before action

ICON BUTTON (Compact)
├─ Size: 40px square
├─ Padding: 8px (centered icon)
├─ Icon: 24px
├─ Background: Transparent → Hover: #1a1f3a
├─ Border: None → Hover: 1px solid #3f4a6f
├─ Transition: all 150ms ease
└─ Usage: Navigation, quick actions, toggles
```

### Input Fields

```
TEXT INPUT
├─ Height: 44px (md), 40px (sm), 36px (xs)
├─ Padding: 12px 16px
├─ Border: 1px solid #3f4a6f
├─ Border Radius: 8px
├─ Background: #0A0E27
├─ Text: #FFFFFF
├─ Placeholder: #9CA3AF
├─ Font: Body Regular (14px)
├─ Focus: Border 2px #00A3E0, Shadow 0 0 0 3px rgba(0,163,224,0.2)
├─ Error: Border #EF4444, Error text below input
├─ Disabled: Bg #1a1f3a 60%, Text #6B7280, cursor not-allowed
├─ Transition: all 150ms ease
└─ Label: Above input, 13px Semibold, required indicator with *

TEXTAREA
├─ Min height: 120px
├─ Resize: Vertical only
├─ Font: Body Regular (14px)
├─ All other properties match TEXT INPUT
└─ Scrollbar: Custom styled (narrow, accent color)

SELECT / DROPDOWN
├─ Height: 44px
├─ Padding: 12px 16px
├─ Arrow: 16px icon on right, accent color
├─ Display: Custom dropdown (not browser default)
├─ Options: Dark background #1a1f3a, hover #2d3556
├─ Selected: Bg #3f4a6f, checkmark icon
└─ Animation: Smooth dropdown slide, 150ms

CHECKBOX
├─ Size: 20x20px
├─ Border: 2px solid #3f4a6f
├─ Border Radius: 4px
├─ Background: Unchecked #0A0E27
├─ Checked: Bg #00A3E0, checkmark #FFFFFF
├─ Hover: Border #00A3E0
├─ Focus: Outline 3px #00E5FF, offset 2px
└─ Animation: 200ms scale-up on check

RADIO BUTTON
├─ Size: 20x20px (outer), 12x12px (inner dot)
├─ Border: 2px solid #3f4a6f
├─ Border Radius: 50%
├─ Unchecked: Transparent center
├─ Checked: Inner dot #00A3E0
├─ Hover: Border #00A3E0
└─ Animation: 200ms on toggle

SWITCH / TOGGLE
├─ Size: 48x28px (md), 44x26px (sm)
├─ Border Radius: 14px
├─ Off: Bg #3f4a6f, knob left
├─ On: Bg #10B981, knob right
├─ Knob: 24px circle, white
├─ Transition: 250ms ease-in-out
├─ Focus: Outline 3px #00E5FF
└─ Cursor: pointer
```

### Cards & Containers

```
CONTENT CARD
├─ Background: #1a1f3a
├─ Border: 1px solid #3f4a6f
├─ Border Radius: 12px
├─ Padding: 20px
├─ Box Shadow: 0 10px 30px rgba(0,0,0,0.3)
├─ Hover Shadow: 0 20px 50px rgba(0,163,224,0.1)
├─ Hover Border: #3f4a6f → #00A3E0 (subtle glow)
├─ Transition: all 300ms ease
└─ Usage: General content, listings, items

ELEVATED CARD (Modal, Dialog)
├─ Background: #1a1f3a
├─ Border: 1px solid #3f4a6f
├─ Border Radius: 16px
├─ Padding: 32px
├─ Box Shadow: 0 25px 50px rgba(0,0,0,0.5)
├─ Backdrop: rgba(10,14,39,0.8) with backdrop-blur(4px)
└─ Z-index: 50 (on top of everything)

IMAGE CARD (Listing/Marketplace)
├─ Aspect Ratio: 4:3 (horizontal), 3:4 (vertical)
├─ Border Radius: 12px (top), 0 (bottom with text)
├─ Image: Object-fit cover
├─ Overlay: None (clean image)
├─ Shadow: Small on card container only
├─ Text Section Below:
│  ├─ Padding: 16px
│  ├─ Title: H4 size, white
│  ├─ Subtitle: Body Small, gray
│  ├─ Price: Mono font, accent blue, larger
│  └─ Badge: Top-right corner, position absolute
└─ Hover: Card lifts slightly, shadow grows

STAT CARD (Dashboard)
├─ Size: 1/3 width on desktop, 1/2 on tablet, full on mobile
├─ Background: Linear gradient #1a1f3a → #2d3556
├─ Border: 1px solid rgba(0,163,224,0.2)
├─ Padding: 24px
├─ Icon: 40px, accent blue, top-right
├─ Label: Caption text, gray
├─ Value: H3 size, white
├─ Footer: Body Small gray text
└─ Transition: Subtle glow on hover
```

### Navigation

```
NAVBAR (Top Desktop)
├─ Height: 64px
├─ Background: #0A0E27 with 1px border bottom #3f4a6f
├─ Padding: 0 32px
├─ Layout: Flexbox, space-between
├─ Left: Logo (24x24 + text)
├─ Center: Nav links (desktop only, hidden on mobile)
├─ Right: Icons (search, messages, notifications, profile)
├─ Sticky: Yes, z-index 40
├─ Shadow: Subtle below
├─ Icon spacing: 16px between each
└─ Responsive: Hamburger menu on md and below

MOBILE BOTTOM NAB
├─ Height: 60px
├─ Background: #0A0E27 with 1px border top #3f4a6f
├─ Position: Fixed bottom, full width
├─ Layout: 5 equal-width tabs
├─ Icon: 24px, centered
├─ Label: 10px text below icon (optional)
├─ Active: Icon #00CFFF, underline 3px #00A3E0
├─ Inactive: Icon #9CA3AF, gray
├─ Badge: Red dot or number on icon (messages, notifications)
└─ Safe area: Includes notch/bottom safe area on mobile

SIDEBAR (Desktop Optional)
├─ Width: 240px
├─ Background: #0A0E27 with 1px border right #3f4a6f
├─ Position: Fixed left or collapsible
├─ Padding: 24px
├─ Items: Full-width, 8px padding
├─ Item Height: 40px
├─ Font: Body Regular (14px)
├─ Active: Bg #1a1f3a, Border-left 3px #00A3E0
├─ Hover: Bg #1a1f3a
└─ Collapse: Width 64px when collapsed, icons only
```

### Modals & Dialogs

```
MODAL CONTAINER
├─ Backdrop: rgba(10,14,39,0.8) with backdrop-blur(4px)
├─ Animation: Fade in 200ms, scale from 0.95
├─ Card: Elevated Card styles (see above)
├─ Position: Centered on screen
├─ Max width: 90vw, max height: 90vh
├─ Responsive: Full screen on xs-sm with rounded corners
├─ Close Button: Top-right, X icon, 32px
├─ Padding: 32px (desktop), 24px (tablet), 20px (mobile)
└─ Z-index: 50

DIALOG CONTENT
├─ Header: H3 title, optional close button
├─ Body: Content area, scrollable if needed
├─ Footer: Action buttons (primary, secondary, cancel)
├─ Button spacing: 12px between buttons
├─ Button size: Full width on mobile, fixed on desktop
└─ Min height: 200px (no smaller)
```

### Forms

```
FORM GROUP
├─ Margin bottom: 24px
├─ Label: 13px Semibold, #FFFFFF, margin-bottom 8px
├─ Input: Standard input styles
├─ Error message: 12px, color #EF4444, margin-top 4px
├─ Helper text: 12px, color #9CA3AF, margin-top 4px
└─ Required indicator: Red * after label

FORM SECTION
├─ Padding: 24px
├─ Border: 1px solid #3f4a6f
├─ Border radius: 12px
├─ Background: #0A0E27
├─ Margin bottom: 32px
├─ Heading: H4 size, white, margin-bottom 20px
└─ Nested groups: Same spacing

FORM ACTIONS (Buttons)
├─ Layout: Flex, justify-end (desktop), stack (mobile)
├─ Spacing: 12px between buttons
├─ Width: Fixed on desktop, full on mobile
├─ Order: Primary (right/bottom), Secondary, Cancel/Tertiary
└─ Padding: 20px top, 0 sides (separated by border)
```

### Badges & Tags

```
BADGE (Small label)
├─ Padding: 4px 12px
├─ Border radius: 16px (pill-shaped)
├─ Font: Caption (12px, Semibold)
├─ Height: 24px (auto with padding)

Badge Variants:
├─ Success: Bg #10B981, Text #FFFFFF
├─ Warning: Bg #F59E0B, Text #0A0E27
├─ Error: Bg #EF4444, Text #FFFFFF
├─ Info: Bg #00A3E0, Text #0A0E27
├─ Neutral: Bg #3f4a6f, Text #FFFFFF
└─ Primary: Bg #00A3E0, Text #0A0E27

TAG (Clickable label)
├─ Same styling as badge
├─ Add border: 1px solid (same color)
├─ Bg: Transparent or very faint
├─ Cursor: pointer
├─ Hover: Bg fades in
└─ Usage: Filters, categories, skills

VERIFICATION BADGE
├─ Icon: ✓ checkmark in circle
├─ Size: 20px (sits next to name)
├─ Color: #10B981 (green)
├─ Hover: Show tooltip "Verified seller"
└─ Usage: On seller profiles, verified listings
```

### Loading & Feedback

```
SKELETON LOADER
├─ Shape: Matches content (card, text, image)
├─ Bg: #1a1f3a
├─ Animation: Pulse, opacity 0.5 → 1 → 0.5, 2s loop
├─ Border radius: Same as final component
└─ Usage: While fetching content

SPINNER
├─ Type: Circular, rotating
├─ Size: 20px (inline), 40px (centered loading)
├─ Color: #00A3E0
├─ Animation: 360° rotation, 1s loop
├─ Background: Transparent
└─ Usage: Page loads, form submissions

TOAST/NOTIFICATION
├─ Position: Bottom-right, 16px from edges
├─ Padding: 16px 20px
├─ Border radius: 8px
├─ Font: Body Small (14px)
├─ Width: 300px (max), 100% - 32px (mobile)
├─ Box shadow: 0 10px 30px rgba(0,0,0,0.3)
├─ Auto-dismiss: 3-5 seconds
├─ Variants:
│  ├─ Success: Bg #10B981, Icon checkmark
│  ├─ Error: Bg #EF4444, Icon X
│  ├─ Warning: Bg #F59E0B, Icon alert
│  └─ Info: Bg #00A3E0, Icon info
├─ Close: X button on right
└─ Animation: Slide in from right 300ms, slide out left on close

PROGRESS BAR
├─ Height: 4px
├─ Bg: #3f4a6f
├─ Fill: #00A3E0
├─ Fill animation: Linear progress
├─ Border radius: 2px
└─ Usage: Upload progress, multi-step forms

ERROR STATE
├─ Icon: Alert triangle or X circle
├─ Color: #EF4444
├─ Heading: H3, error message
├─ Body: Helpful text on how to fix
├─ Action: Button to retry or navigate away
└─ Illustration: Optional light SVG background
```

---

## ✨ Interaction Patterns

### Transitions & Animations

```
DEFAULT TIMING
├─ Quick micro-interactions: 100ms
├─ Standard transitions: 200ms
├─ Major animations: 300-400ms
├─ Easing: ease-in-out (default), ease-out (entrance), ease-in (exit)

HOVER EFFECTS
├─ Button: Scale 1.02, shadow deepens, 200ms
├─ Card: Translate Y -2px, shadow grows, border glows, 300ms
├─ Link: Color shift, underline appears, 150ms
├─ Icon: Rotate/scale, color shift, 150ms

FOCUS STATES (Keyboard Navigation)
├─ Outline: 3px solid #00E5FF
├─ Offset: 2px from element
├─ Animation: Subtle 200ms pulse
└─ Accessible: Never remove focus ring

LOADING STATES
├─ Skeleton pulse: 2s infinite
├─ Spinner: 1s infinite rotation
├─ Progress bar: Animated fill, 200ms per tick

ERROR STATES
├─ Border color: #EF4444, 200ms transition
├─ Text color: #EF4444
├─ Shake animation: 150ms horizontal shake
├─ Error message: Fade in 200ms

SUCCESS STATES
├─ Border color: #10B981, 200ms transition
├─ Icon: Checkmark fade in 300ms
├─ Background: Subtle green glow 300ms
└─ Toast: Slide in 300ms, auto-dismiss
```

### Mobile Interactions

```
TAP TARGETS
├─ Minimum: 44x44px (touch area)
├─ Recommended: 56x56px (comfort)
├─ Spacing: 8px minimum between targets

GESTURES
├─ Tap: Standard button press
├─ Long press: Context menu, 500ms hold
├─ Swipe right: Go back, dismiss (optional)
├─ Swipe left: Delete/archive (with confirmation)
├─ Pinch: Zoom images (if applicable)

BOTTOM SHEET
├─ Height: 60-80% screen on mobile
├─ Animation: Slide up from bottom 300ms
├─ Drag handle: 4px bar at top center
├─ Dismiss: Swipe down or tap outside
└─ Usage: Filters, mobile menus, options

HAPTIC FEEDBACK (Optional)
├─ Light: Successful action
├─ Medium: Important action (delete)
├─ Strong: Error or warning
└─ Note: Test battery impact, make optional
```

---

## 🎯 Page-Specific Design Guidelines

### Landing Page
```
Hero Section:
├─ Height: 600px (desktop), 500px (tablet), 400px (mobile)
├─ Background: Gradient #0A0E27 → #1a1f3a with animated geometric shapes
├─ Content: Centered, max width 640px
├─ Headline: H1, white, centered
├─ Subheading: Body Large, gray, centered
├─ CTA: 2 primary buttons (Sign Up, Browse)
├─ Animation: Subtle fade-in on load, 400ms

Feature Section:
├─ Bg: #1a1f3a
├─ Layout: 3 columns (md: 2, xs: 1)
├─ Card: With icon, title, description
├─ Icon: 48px, accent blue
├─ Hover: Card lifts, icon color shifts
└─ Spacing: 48px between cards

Social Proof Section:
├─ Testimonials: 3 cards in row, avatar + quote + name
├─ Stats: 4 columns showing metrics (users, listings, etc)
├─ Logo: "Featured in" section with partner logos
└─ All: Alternating bg colors for contrast

CTA Footer:
├─ Bg: Gradient (accent blue)
├─ Text: White, centered
├─ Heading: H2
├─ Description: Body Large
├─ Button: Primary button
└─ Padding: 64px vertical
```

### Dashboard
```
Header:
├─ Greeting: "Welcome back, [Name]"
├─ Subtext: Role-specific description
├─ Quick actions: 2-3 buttons based on role

Stat Cards Row:
├─ 4 cards on lg, 2 on md, 1 on sm
├─ Metrics: Views, Messages, Bookings, Revenue
├─ Icon: Top-right
├─ Trend: Up/down indicator with %
└─ Hover: Subtle glow

Recent Activity Section:
├─ Title: "Recent Activity"
├─ List: 5-10 items, most recent first
├─ Item: Avatar, action description, timestamp, link
├─ Empty state: "No recent activity" with illustration
└─ Load more: Button at bottom

Quick Links Sidebar (Desktop):
├─ 5-6 action cards
├─ Icon, title, subtitle
├─ Hover: Accent glow
└─ Examples: "Add Listing", "View Messages", "Manage Account"
```

### Listing/Marketplace Detail Page
```
Image Section:
├─ Main image: Full width, 500px height (md), 400px (sm)
├─ Aspect ratio: 16:9 or 4:3
├─ Gallery: Thumbnail carousel below main image
├─ Controls: Previous/Next arrows, pagination dots
├─ Zoom: Hover to zoom (or pinch on mobile)

Content Section:
├─ Title: H2, white
├─ Meta: Location, date posted, view count
├─ Price: Large mono font, accent blue
├─ Status badge: "Available", "Sold", "Pending"
├─ Description: Body text, line-height 1.6
├─ Amenities: Grid of icons with labels
└─ CTA buttons: Message seller, Save, Share

Sidebar (Desktop) / Below (Mobile):
├─ Seller card: Avatar, name, verified badge, rating
├─ Contact options: Message button, phone (if available)
├─ Additional info: Views, created date, condition
├─ Related items: Carousel of 4-5 similar items
└─ Reviews: Recent reviews from other buyers

Responsive Notes:
├─ Desktop: Image left (60%), content right (40%)
├─ Tablet: Image full width, content below
├─ Mobile: All stacked, full width
└─ Sticky CTA: Button sticky at bottom on mobile
```

### Messaging/Chat Page
```
Conversation List (Sidebar on Desktop / Drawer on Mobile):
├─ Width: 320px (desktop), full on mobile with slide-in
├─ Search: Input at top with icon
├─ Conversations: List of threads
├─ Per item:
│  ├─ Avatar: 44px circle
│  ├─ Name: H4
│  ├─ Last message: Body Small, gray, truncated
│  ├─ Timestamp: Caption
│  ├─ Unread badge: Red dot (if unread)
│  └─ Hover: Bg highlight
├─ Empty state: "No conversations" when none exist
└─ New button: FAB in corner

Chat Area:
├─ Header: Participant info, back button (mobile)
├─ Messages: Bubbles, left for other, right for self
│  ├─ Bubble bg: Gray (#3f4a6f) for other, Blue (#00A3E0) for self
│  ├─ Bubble text: White for both
│  ├─ Timestamp: Gray, below bubble
│  ├─ Avatar: Next to first message from sender
│  └─ Grouping: Multiple messages without gap if same sender
├─ Input area (sticky bottom):
│  ├─ Bg: #0A0E27
│  ├─ Border top: 1px #3f4a6f
│  ├─ Input: Expandable textarea, 44-120px height
│  ├─ Icons: Attach (image), Emoji, Send button
│  └─ Padding: 12px
├─ Context: If related to listing/item, show context card at top
└─ Scroll: Auto-scroll to latest message on open
```

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance Target
```
Color Contrast:
├─ Normal text: 4.5:1 minimum
├─ Large text (18pt+): 3:1 minimum
├─ UI components & borders: 3:1 minimum
├─ Non-text: 3:1 minimum
└─ All verified with tools

Focus Management:
├─ All interactive elements: Keyboard accessible
├─ Tab order: Logical, top-to-bottom
├─ Focus visible: 3px outline, never hidden
├─ Focus trap: Modal traps focus inside, releases on close
└─ Home/End: Work in lists and inputs

Semantic HTML:
├─ Headings: H1-H6 used properly, never skipped
├─ Lists: UL/OL for grouped items
├─ Forms: Label associated with input (for attribute)
├─ Buttons: Use button element or role="button"
├─ Links: Distinct from regular text
└─ Landmarks: Header, nav, main, footer used correctly

ARIA Attributes:
├─ aria-label: Icons without text
├─ aria-expanded: Expandable sections
├─ aria-hidden: Decorative elements
├─ aria-live: Dynamic content updates
├─ aria-invalid: Form errors
├─ aria-required: Required fields
└─ role: Used only when semantic HTML insufficient

Images:
├─ alt text: Descriptive for all meaningful images
├─ Decorative: alt="" and aria-hidden="true"
├─ Format: Natural language, under 125 characters
└─ SVGs: Use title + desc or aria-label

Forms:
├─ Labels: Always visible or aria-label
├─ Instructions: Clear and accessible
├─ Error messages: Associated with input
├─ Required fields: Marked with * and explained
├─ Success feedback: Announced to screen readers
└─ Helper text: Associated with input

Mobile:
├─ Touch targets: 44x44px minimum
├─ Text: Zoomable to 200% without horizontal scroll
├─ Orientation: Works in both portrait & landscape
└─ Input: Easy to use virtual keyboards
```

---

## 📱 Responsive Design Specifications

### Mobile (XS - 0px to 640px)
```
Navigation: Bottom nav bar (5 tabs)
Layout: Single column, full width
Padding: 16px
Cards: Full width, stack vertically
Images: 100% width, max 300px height
Typography: Smaller sizes (28px H1, 24px H2, 18px H3)
Buttons: Full width or two-column grid
Modals: Full screen with 12px rounded corners
Forms: Single column, full-width inputs
```

### Tablet (SM-MD - 640px to 1024px)
```
Navigation: Hamburger menu + top nav
Layout: 2-3 columns for grids
Padding: 20-24px
Cards: 2 columns
Images: 50% width or responsive grid
Typography: Medium sizes (32px H1, 28px H2, 20px H3)
Buttons: 2-column layout or inline
Modals: 90vw width, centered
Forms: Single or dual column
```

### Desktop (LG-XL+ - 1024px+)
```
Navigation: Full top nav + optional sidebar
Layout: 3-4 columns for grids
Padding: 32px
Cards: 3-4 columns
Images: Responsive, 1200px max
Typography: Full sizes (56px H1, 40px H2, 28px H3)
Buttons: Inline or grid
Modals: 500-700px width, centered
Forms: Dual column with sidebar
Sidebar: 240px fixed navigation
```

---

## 🎨 Dark Mode-First Implementation Notes

### Why Dark Mode First?
- **Default aesthetic** for modern audience
- **Battery efficiency** on OLED devices
- **Reduced eye strain** for evening usage
- **Premium feel** vs. light corporate interface
- **Performance**: Darker pixels use less energy

### Light Mode Implementation
- Avoid simple inversion (looks harsh)
- Invert text only, keep accent colors consistent
- Reduce saturation slightly
- Use subtle shadows instead of glows
- Ensure same contrast ratios
- Test both modes equally

### CSS Variables Strategy
```
Dark Mode (Default):
--bg-primary: #0A0E27
--bg-secondary: #1a1f3a
--text-primary: #FFFFFF
--accent: #00A3E0
--border: #3f4a6f

Light Mode (Conditional):
@media (prefers-color-scheme: light) {
  --bg-primary: #F8FAFC
  --bg-secondary: #FFFFFF
  --text-primary: #0A0E27
  --accent: #0088B8 (darker variant)
  --border: #E5E7EB
}

Use: var(--bg-primary) throughout
```

---

## 📊 Design System Implementation Checklist

### Phase 1: Foundation (Week 1)
- [ ] Tailwind config: Colors, spacing, typography
- [ ] CSS variables: Dark/light mode toggle
- [ ] Font loading: Inter typeface setup
- [ ] Base components: Button, Input, Card
- [ ] Layout: Container, grid, spacing utilities
- [ ] Navbar & Footer: Basic structure

### Phase 2: Extended Components (Week 2)
- [ ] Form components: All input types
- [ ] Badges & Tags: All variants
- [ ] Modals & Dialogs: Base templates
- [ ] Navigation: Sidebar, bottom nav
- [ ] Loading states: Skeleton, spinner

### Phase 3: Complex Components (Week 3)
- [ ] Image carousel: Listing detail
- [ ] Chat interface: Message bubbles
- [ ] Conversation list: With filters
- [ ] Data tables: Sortable, paginated
- [ ] Notifications: Toast system

### Phase 4: Pages (Week 4-5)
- [ ] Landing page: Full layout
- [ ] Auth pages: Login, signup, reset
- [ ] Dashboard: Role-specific layouts
- [ ] Listing detail: Complete page
- [ ] Marketplace: Browse & detail

### Phase 5: Polish (Week 6)
- [ ] Animations: Transitions throughout
- [ ] Accessibility: WCAG AA audit
- [ ] Performance: Image optimization, lazy loading
- [ ] Mobile: Touch interactions, safe areas
- [ ] Testing: Visual regression, component library

---

## 🚀 Next Steps

1. **Set up Tailwind config** with design tokens
2. **Create component library** in Storybook or similar
3. **Build base page layout** (header, sidebar, footer)
4. **Implement landing page** first
5. **Test on multiple devices** (phone, tablet, desktop)
6. **Iterate based on feedback** before full build-out

---

## 📝 Design System Update Log

**March 5, 2026** - Initial v2 Design System created
- Complete color palette with interactions
- Typography scale defined
- Component specifications
- Responsive breakpoints
- Accessibility standards
- Implementation roadmap

---

**Status**: Ready for implementation  
**Next Document**: None (use chat for updates)  
**Version**: 2.0-final
