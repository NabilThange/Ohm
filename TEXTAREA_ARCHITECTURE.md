# Simplified Textarea Architecture

## Overview
We've consolidated all textarea components into a clean, simple architecture with just 3 components.

## Component Structure

### 1. **AnimatedTextarea** (`components/ui/animated-textarea.tsx`)
**Purpose:** Base textarea component with typing animation

**Features:**
- Character-by-character typing animation
- Blinking cursor (`│`)
- Auto-delete and cycle through examples
- Stops animation when user types
- Configurable speeds and delays

**Props:**
```typescript
{
  placeholderExamples?: string[]  // Examples to cycle through
  typeSpeed?: number              // Typing speed (default: 50ms)
  deleteSpeed?: number            // Delete speed (default: 30ms)
  pauseDelay?: number             // Pause after typing (default: 2000ms)
  value: string                   // Controlled value
  onChange: (e) => void           // Change handler
  ...HTMLTextareaAttributes       // All standard textarea props
}
```

**Usage:**
```tsx
<AnimatedTextarea
  value={text}
  onChange={(e) => setText(e.target.value)}
  placeholderExamples={[
    "Build a smart weather station...",
    "Create a gesture-controlled lamp..."
  ]}
/>
```

---

### 2. **MorphingComposer** (`components/shared/MorphingComposer.tsx`)
**Purpose:** Full-featured composer with commands, help modal, and actions

**Features:**
- Uses `AnimatedTextarea` internally
- Command menu (slash commands)
- Help modal
- Action buttons (attach, mic, send)
- Framer Motion animations
- Multiple variants (landing, build, chat)

**Props:**
```typescript
{
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  onKeyDown?: (e: KeyboardEvent) => void
  placeholder?: string
  placeholderExamples?: string[]
  disabled?: boolean
  variant?: "landing" | "build" | "chat"
  showCommands?: boolean
  filteredCommands?: Array<{command: string, description: string}>
  activeIndex?: number
  onSelectCommand?: (cmd: string) => void
  helpOpen?: boolean
  onHelpOpenChange?: (open: boolean) => void
}
```

**Used On:**
- Landing page (`/`) - Static textarea
- Chat page (`/build/[chatId]`) - Via ChatPane

---

### 3. **MorphingPromptInput** (`components/shared/MorphingPromptInput.tsx`)
**Purpose:** Floating textarea that morphs between pages

**Features:**
- Persistent floating textarea (never unmounts)
- Morphs position/size based on route
- Uses `AnimatedTextarea` internally
- Hero mode on `/build` page (centered, large)
- Chat mode on `/build/[chatId]` (bottom, compact)
- Instant navigation (doesn't wait for AI response)

**Behavior:**
- **Build page (`/build`)**: Centered, hero-style, with typing animation
- **Chat page (`/build/[chatId]`)**: Bottom-positioned, compact
- **Other pages**: Hidden (returns null)

**Auto-navigation:**
When user submits on `/build`:
1. Generate chatId client-side
2. Clear input immediately
3. Navigate to `/build/[chatId]?initialPrompt=...`
4. Chat page creates session and sends to AI in background

---

## Page Usage

### Landing Page (`app/page.tsx`)
```tsx
<MorphingComposer
  value={prompt}
  onChange={setPrompt}
  onSubmit={handleSubmit}
  placeholderExamples={PLACEHOLDER_EXAMPLES}
  variant="landing"
/>
```

### Build Page (`app/build/page.tsx`)
- Uses `MorphingPromptInput` (floating, auto-rendered)
- No explicit textarea component needed

### Chat Page (`app/build/[chatId]/page.tsx`)
- Uses `MorphingPromptInput` (floating, auto-rendered)
- ChatPane also has `MorphingComposer` at bottom

---

## Deleted Components

The following redundant components were removed:

1. ❌ **Composer.jsx** - Old chat composer (replaced by MorphingComposer)
2. ❌ **UnifiedComposer.tsx** - Unnecessary wrapper around MorphingComposer
3. ❌ **MorphingTextareaWrapper.tsx** - Incomplete/broken file

---

## Key Benefits

✅ **Simple**: Only 3 components instead of 6+
✅ **Consistent**: All use AnimatedTextarea for typing animation
✅ **Maintainable**: Clear separation of concerns
✅ **Performant**: Floating textarea never unmounts (smooth morphing)
✅ **Flexible**: Easy to add new variants or features

---

## Animation Details

**Typing Animation:**
- Types at 50ms per character
- Shows blinking cursor `│`
- Pauses 2000ms after completing
- Deletes at 30ms per character
- Cycles through all examples
- Stops when user starts typing

**Morphing Animation:**
- Uses CSS transitions with cubic-bezier easing
- Transition: `all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`
- Smooth position and size changes between routes
- No unmounting = no flicker

---

## Future Improvements

- Add voice input functionality
- Add file attachment handling
- Add more slash commands
- Add keyboard shortcuts guide
- Add textarea auto-resize based on content
