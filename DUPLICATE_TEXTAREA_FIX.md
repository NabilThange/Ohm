# Duplicate Textarea Fix

## Problem

The `/build/[chatId]` (chat) page had **2 textareas**:
1. **MorphingPromptInput** - Global floating textarea (from app/layout.tsx)
2. **MorphingComposer** - In ChatPane component (at bottom of page)

This caused confusion and duplicate input areas.

## Root Cause

- `MorphingPromptInput` is rendered globally in `app/layout.tsx`
- `ChatPane` was also rendering its own `MorphingComposer`
- Both were visible on the chat page simultaneously

## Solution

Removed the `MorphingComposer` from ChatPane since we're using the global `MorphingPromptInput` for all pages.

## Changes Made

### 1. ChatPane.jsx - Removed MorphingComposer

**Before:**
```jsx
import { MorphingComposer } from "@/components/shared/MorphingComposer"

const [draft, setDraft] = useState("")
const composerRef = useRef(null)

// ... in render:
<MorphingComposer
    ref={composerRef}
    value={draft}
    onChange={setDraft}
    onSubmit={async () => {
        if (!draft.trim()) return
        await handleSend(draft)
        setDraft("")
    }}
    placeholder="How can Ohm help you today? (Type / for commands)"
    disabled={busy || isLoading}
    variant="chat"
/>
```

**After:**
```jsx
// Removed MorphingComposer import
// Removed draft state
// Removed composerRef

// ... in render:
<div className="border-t border-border bg-background pb-32">
    <div className="mx-auto max-w-3xl p-4 text-center text-[11px] text-muted-foreground">
        AI can make mistakes. Check important info.
    </div>
</div>
```

### 2. Cleaned Up Imports

**Removed:**
```jsx
import { MorphingComposer } from "@/components/shared/MorphingComposer"
```

### 3. Cleaned Up State

**Removed:**
```jsx
const [draft, setDraft] = useState("")
const composerRef = useRef(null)
```

### 4. Updated useImperativeHandle

**Before:**
```jsx
useImperativeHandle(
    ref,
    () => ({
        insertTemplate: (templateContent) => {
            setDraft((prev) => prev ? `${prev}\n\n${templateContent}` : templateContent)
            composerRef.current?.focus()
        },
    }),
    [],
)
```

**After:**
```jsx
useImperativeHandle(
    ref,
    () => ({
        insertTemplate: (templateContent) => {
            // Template insertion is now handled by MorphingPromptInput
            // This is kept for backwards compatibility but does nothing
            console.log('Template insertion:', templateContent)
        },
    }),
    [],
)
```

## Architecture Now

### Global Textarea (MorphingPromptInput)
- Rendered in `app/layout.tsx`
- Appears on all pages
- Handles all user input
- Morphs between pages

### ChatPane
- Only renders messages
- Renders footer text
- No textarea
- Cleaner component

## Pages Now Have

| Page | Textarea | Source |
|------|----------|--------|
| `/` (Landing) | 1 | MorphingPromptInput (global) |
| `/build` (Build) | 1 | MorphingPromptInput (global) |
| `/build/[chatId]` (Chat) | 1 | MorphingPromptInput (global) |

## Benefits

✅ **Single Textarea**: Only one input area per page
✅ **Consistent UX**: Same textarea across all pages
✅ **Cleaner Code**: ChatPane is simpler
✅ **No Conflicts**: No duplicate input handling
✅ **Better Performance**: One component instead of two

## Result

🎉 The chat page now has only **ONE textarea** - the global MorphingPromptInput that morphs between pages!

No more duplicate textareas on the `/build/[chatId]` page.
