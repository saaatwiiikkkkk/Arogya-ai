# Arogya AI - Design Guidelines

## Design Approach
**System-Based Approach** using shadcn/ui component library with a clinical/medical aesthetic. Drawing inspiration from modern health tech platforms like UpToC, Epic MyChart, and Zocdoc for their clean, trust-building interfaces.

**Core Principle**: Clinical precision meets modern usability - every element serves a clear purpose, whitespace creates breathing room, and visual hierarchy guides critical healthcare workflows.

---

## Typography

**Font System**: 
- Primary: Inter (via Google Fonts) - excellent for medical/data-heavy interfaces
- Fallback: system-ui, sans-serif

**Hierarchy**:
- Page Titles: text-3xl font-semibold (Doctor Dashboard, Patient Records)
- Section Headers: text-2xl font-semibold 
- Subsections: text-xl font-medium
- Card/Component Titles: text-lg font-medium
- Body Text: text-base font-normal
- Labels/Captions: text-sm font-medium
- Metadata/Timestamps: text-xs text-muted-foreground

---

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12** for consistency
- Component padding: p-6 or p-8
- Section spacing: space-y-6 or space-y-8
- Card gaps: gap-4 or gap-6
- Page margins: p-8 or p-12

**Container Widths**:
- Dashboard content: max-w-7xl mx-auto
- Form sections: max-w-2xl
- Wide tables: max-w-full with horizontal scroll

---

## Component Library

### Navigation
**Dashboard Layout**:
- Sidebar: w-64, fixed left, full-height with subtle border-r
- Top bar: h-16, flex items-center justify-between, border-b
- Main content: ml-64, min-h-screen with generous p-8

**Sidebar Navigation Items**:
- px-4 py-3, rounded-md on hover
- Active state: bg-accent with font-medium
- Icons from Lucide (FileText, Pill, Activity, Upload)

### Cards & Panels
**Standard Card**: shadcn Card component
- Border radius: rounded-lg
- Padding: p-6
- Shadow: minimal (default shadcn)
- Headers with pb-4 border-b separator

**Split-Panel Layout** (Prescription Verifier, Scan Analysis):
- Left panel: w-1/2 or w-2/5
- Right panel: flex-1, bg-muted/30 for differentiation
- Gap: gap-6 between panels

### Forms & Inputs
**Form Sections**:
- Label above input: text-sm font-medium mb-2
- Input spacing: space-y-4
- Helper text: text-xs text-muted-foreground mt-1

**Stepper (Drug Interaction)**:
- Horizontal stepper with numbered circles
- Active step: filled circle with accent color
- Completed: checkmark icon
- Connected by lines (border-t-2)

### Data Display
**Tables** (Patient Records, My Documents):
- shadcn Table component
- Header: bg-muted with font-medium
- Row hover: hover:bg-muted/50
- Action buttons: Ghost variant, size="sm"
- Badge for status indicators

**Upload Areas**:
- Dashed border-2 border-dashed
- Min height: min-h-[200px]
- Center content with upload icon
- "Click to upload or drag and drop" text

### Chatbot Panel
**Fixed Bottom Panel**:
- Sticky at bottom of content area (not global)
- Border-t with shadow-lg
- Height: h-96 max-h-[400px]
- Message thread: flex-1 overflow-y-auto with scrollbar styling
- Input area: p-4 border-t, flex gap-2

**Messages**:
- User: ml-auto, max-w-[70%], bg-primary text-primary-foreground, rounded-lg p-3
- Assistant: mr-auto, max-w-[70%], bg-muted, rounded-lg p-3
- Timestamp: text-xs text-muted-foreground mt-1

### Buttons & Actions
**Primary Actions**: shadcn Button default variant
**Secondary Actions**: variant="outline"
**Destructive**: variant="destructive" (logout, delete)
**Icon Buttons**: variant="ghost" size="icon"

**Logout Button**: Top-right in header, variant="outline" size="sm"

---

## Landing Page

**Hero Section**:
- Full-width, min-h-[600px]
- Center-aligned content with max-w-4xl
- Large hero image: Medical professional using tablet/AI interface (modern, diverse, professional)
- Gradient overlay on image for text legibility
- Headline: text-5xl font-bold mb-4
- Subheadline: text-xl text-muted-foreground mb-8
- CTA button: size="lg" with arrow icon

**Navigation**: 
- Transparent over hero, becomes solid on scroll
- Logo left, "Get Started" button right

---

## Auth Page

**Role Selection Cards**:
- Grid: grid-cols-1 md:grid-cols-2 gap-6
- Each card: min-h-[300px], border-2, hover:border-primary transition
- Large icon at top (Stethoscope for Doctor, User for Patient)
- Title: text-2xl font-semibold
- Description: text-muted-foreground

**Login Form**: 
- Max-w-md mx-auto
- Card wrapper with p-8
- Logo/title at top
- Form fields with space-y-4

---

## Medical Safety Indicators

**Status Badges**:
- Safe: variant="default" with green accent
- Warning: variant="destructive" with amber accent
- Info: variant="secondary"

**Patient ID Display**: 
- Top-right badge with mono font
- Border with subtle shadow
- Prefix "PAT-" followed by ID

**AI Response Formatting**:
- Info icon + "Assistive, non-diagnostic" label at top
- Structured sections with clear headings
- Bullet points for recommendations
- Separator between sections

---

## Loading & Error States

**Loading**: shadcn Skeleton components or Spinner
**Empty States**: Centered with icon, heading, description
**Inline Errors**: Alert variant="destructive" with icon
**Success Messages**: Alert variant="default" with checkmark

---

## Images

**Hero Image**: Large, professional medical-tech image showing AI/healthcare interaction - modern hospital setting or doctor with digital interface. Full-width background image with gradient overlay (dark to transparent top-to-bottom) for text contrast.

**Image Placement**:
- Landing hero: Full-width background
- No other images required for MVP

**Buttons on Images**: 
- backdrop-blur-sm bg-background/80 for buttons placed over hero image
- No hover/active states needed (inherit from Button component)

---

## Critical UX Patterns

- **Consistent Navigation**: Same sidebar structure across all dashboard pages
- **Clear Hierarchy**: Page → Section → Card → Content flow maintained throughout
- **Loading Feedback**: All async actions show loading state
- **Action Confirmation**: Destructive actions use Dialog confirmation
- **Professional Whitespace**: Never cramped - generous spacing reinforces trust
- **Readable Data**: Tables never exceed viewport width, use horizontal scroll if needed