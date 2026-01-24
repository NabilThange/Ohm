# Chat Page Textarea Positioning Fix

## Problem

The textarea on `/build/[chatId]` (chat page) was floating and not properly positioned inside the footer container.

## Solution

Updated `MorphingPromptInput` to render the textarea inside the footer div on chat pages with proper styling and layout.

## Changes Made

### 1. Position Styles Updated

**Before:**
```typescript
// Chat: Sticky to stay at bottom while scrolling
return {
    position: 'sticky' as const,
    bottom: '1.5rem',
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'min(850px, 92vw)',
}
```

**After:**
```typescript
// Chat: Fixed at bottom, inside the footer area
return {
    position: 'fixed' as const,
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '100%',
}
```

### 2. Conditional Rendering

Added conditional rendering to show different layouts for chat vs hero modes:

```typescript
{isChat ? (
    // Chat mode: Full width footer container
    <div className="w-full bg-background border-t border-border">
        <div className="mx-auto max-w-3xl px-4 py-4">
            <div className="relative bg-card border border-[#3e3e38] rounded-lg...">
                {/* Textarea and controls */}
            </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-4 text-center text-[11px] text-muted-foreground">
            AI can make mistakes. Check important info.
        </div>
    </div>
) : (
    // Hero mode (Landing/Build)
    <div className="relative bg-card border border-[#3e3e38] rounded-lg shadow-2xl...">
        {/* Hero textarea */}
    </div>
)}
```

### 3. Chat Page Layout

**Chat Mode Structure:**
```
┌─ Fixed container (bottom: 0, width: 100%) ─────────────────┐
│                                                              │
│  ┌─ Full width background ──────────────────────────────┐  │
│  │                                                       │  │
│  │  ┌─ Max-width container (max-w-3xl) ──────────────┐ │  │
│  │  │                                                 │ │  │
│  │  │  ┌─ Textarea with border ──────────────────┐  │ │  │
│  │  │  │  [Textarea input]                       │  │ │  │
│  │  │  │  [Buttons]                              │  │ │  │
│  │  │  └─────────────────────────────────────────┘  │ │  │
│  │  │                                                 │ │  │
│  │  └─────────────────────────────────────────────────┘ │  │
│  │                                                       │  │
│  │  ┌─ Footer text ────────────────────────────────┐  │  │
│  │  │  AI can make mistakes. Check important info. │  │  │
│  │  └───────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Styling Details

### Chat Mode Textarea
- **Container**: Full width, fixed at bottom
- **Background**: `bg-background` with `border-t border-border`
- **Inner Container**: `max-w-3xl` centered with `px-4 py-4`
- **Textarea Box**: Border `#3e3e38`, rounded corners, hover/focus orange
- **Padding**: `p-4` inside textarea box
- **Footer Text**: Centered, smaller font, muted color

### Hero Mode Textarea (Landing/Build)
- **Container**: Absolute positioned (centered or bottom)
- **Background**: `bg-card` with shadow
- **Border**: `#3e3e38` with hover/focus orange
- **Styling**: Same as before (no changes)

## Result

✅ **Chat page textarea is now properly positioned inside the footer container**

The textarea on `/build/[chatId]` now:
- Sits inside the footer div with proper styling
- Has the correct border and hover states
- Displays the footer text below it
- Maintains consistent styling with the rest of the app
- Properly handles the max-width constraint

## Pages Now Have

| Page | Textarea Position | Container |
|------|---|---|
| `/` (Landing) | Absolute, bottom | Hero section |
| `/build` (Build) | Absolute, centered | Page center |
| `/build/[chatId]` (Chat) | Fixed, bottom | Footer div ✅ |
