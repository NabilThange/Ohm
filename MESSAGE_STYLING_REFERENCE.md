# Message Styling Reference - Visual Guide

## User Message (Right-Aligned, White Background)

```
                                    ┌─────────────────────────────────┐
                                    │ How do I create an agent?       │
                                    │                                 │
                                    │ (White background)              │
                                    │ (Dark text)                     │
                                    └─────────────────────────────────┘
```

**CSS Classes:**
```html
<div data-from="user" class="group flex gap-3 flex-row-reverse mb-4">
  <div class="flex-1 rounded-2xl px-4 py-2.5 text-sm shadow-sm max-w-[85%] bg-white text-gray-900">
    How do I create an agent?
  </div>
</div>
```

**Key Features:**
- No avatar
- White background (`bg-white`)
- Dark text (`text-gray-900`)
- Right-aligned (`flex-row-reverse`)
- Subtle shadow (`shadow-sm`)

---

## AI Message (Left-Aligned, Dark Background)

```
  ┌───┐  ┌─────────────────────────────────────────────────┐
  │ Ω │  │ To create a new agent with ElevenLabs Agents,   │
  └───┘  │ head to this link: https://elevenlabs.io/...    │
         │                                                 │
         │ 1. Sign in to your ElevenLabs account.         │
         │ 2. Click New Agent to start.                   │
         │ 3. Give your agent a name and description.     │
         │ 4. Configure its behavior, knowledge sources...│
         │ 5. Save it — and your agent is ready to use.  │
         │                                                 │
         │ (Dark gray background #2a2a2a)                 │
         │ (White text)                                    │
         └─────────────────────────────────────────────────┘
```

**CSS Classes:**
```html
<div data-from="assistant" class="group flex gap-3 flex-row mb-4">
  <!-- Avatar -->
  <div class="relative flex shrink-0 overflow-hidden rounded-full h-8 w-8 flex-shrink-0 ring-1 ring-border bg-primary text-primary-foreground">
    <div class="flex h-full w-full items-center justify-center rounded-full text-xs font-bold">
      Ω
    </div>
  </div>
  
  <!-- Message Content -->
  <div class="flex-1 rounded-2xl px-4 py-2.5 text-sm max-w-[85%] bg-gray-800 text-white">
    To create a new agent with ElevenLabs Agents...
  </div>
</div>
```

**Key Features:**
- Avatar with Ω symbol on the left
- Dark gray background (`bg-gray-800` / `#2a2a2a`)
- White text (`text-white`)
- Left-aligned (`flex-row`)
- No shadow

---

## Color Palette

### User Messages
- **Background:** `#ffffff` (white)
- **Text:** `#111827` (gray-900)
- **Shadow:** Subtle drop shadow

### AI Messages
- **Background:** `#1f2937` (gray-800) or `#2a2a2a` (charcoal)
- **Text:** `#ffffff` (white)
- **Avatar Background:** Primary theme color
- **Avatar Border:** 1px ring with border color

---

## Layout Structure

### User Message Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                        ┌─────────────────────────┐ │
│                        │ User message content    │ │
│                        └─────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### AI Message Layout
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ┌───┐  ┌─────────────────────────────────────┐   │
│  │ Ω │  │ AI message content                  │   │
│  └───┘  └─────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Responsive Behavior

- Both message types have `max-w-[85%]` to prevent full-width messages
- Messages maintain their alignment on all screen sizes
- Avatar size remains consistent at 8x8 (32px)
- Padding and spacing scale appropriately

---

## Accessibility

- ✅ High contrast between text and background
- ✅ White text on dark background (AI messages)
- ✅ Dark text on white background (User messages)
- ✅ Clear visual distinction between message types
- ✅ Semantic HTML structure with data attributes

---

## Implementation Notes

1. **Conditional Avatar Rendering:**
   ```jsx
   {!isUser && <MessageAvatar name="Ω" />}
   ```
   Only AI messages display an avatar.

2. **Group Data Attributes:**
   ```jsx
   <div data-from="user">  // or data-from="assistant"
   ```
   Used for context-aware styling via CSS group selectors.

3. **Variant System:**
   - `contained`: Has background and shadow (both message types use this)
   - `flat`: Minimal styling (alternative option)

4. **Tailwind Classes:**
   - User: `bg-white text-gray-900 shadow-sm`
   - AI: `bg-gray-800 text-white`

---

## Quick Reference

| Property | User | AI |
|----------|------|-----|
| Background | White | Gray-800 |
| Text | Gray-900 | White |
| Avatar | None | Ω symbol |
| Align | Right | Left |
| Shadow | Yes | No |
| Max Width | 85% | 85% |
