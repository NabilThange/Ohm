# Quick Reference - Responsive Textarea with View Transitions

## 🚀 Quick Start

```bash
npm run dev
# Open http://localhost:3000
# Type a message and press Enter
# Watch the smooth morph! ✨
```

---

## 📦 Components

### HeroPromptInput
**Use for:** Landing and Build pages (centered layout)

```tsx
import { HeroPromptInput } from '@/components/shared/HeroPromptInput';

<HeroPromptInput variant="landing" />  // Compact
<HeroPromptInput variant="build" />    // Larger
```

### ChatPromptInput
**Use for:** Chat interface (sticky bottom)

```tsx
import { ChatPromptInput } from '@/components/shared/ChatPromptInput';

<ChatPromptInput 
  onSendMessage={handleSend} 
  isLoading={false} 
/>
```

---

## 🎨 View Transitions

### Enable (Already Done ✅)
1. `app/template.tsx` - Triggers transitions
2. `viewTransitionName: 'prompt-input'` - On both components
3. CSS animations in `app/globals.css`

### Customize Duration
```css
/* app/globals.css */
::view-transition-old(prompt-input),
::view-transition-new(prompt-input) {
  animation-duration: 0.8s; /* Change this */
}
```

### Disable for Route
```tsx
// app/template.tsx
if (pathname.startsWith('/marketplace')) return;
```

---

## 📱 Responsive Classes

```tsx
// Container
className="w-full max-w-2xl mx-auto px-4"

// Mobile: Full width with padding
// Tablet: Constrained to 672px
// Desktop: Constrained to 672px, centered
```

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `app/template.tsx` | View Transitions trigger |
| `components/shared/HeroPromptInput.tsx` | Landing/Build textarea |
| `components/shared/ChatPromptInput.tsx` | Chat textarea |
| `app/globals.css` | Animation styles |

---

## 🐛 Troubleshooting

### No Animation?
```javascript
// Check browser support
console.log('Supported:', 'startViewTransition' in document);
```

### Animation Too Fast?
```css
/* Increase duration */
animation-duration: 1s;
```

### Overlapping Content?
```tsx
// Ensure proper layout
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto">
    {/* Content */}
  </div>
  <ChatPromptInput />
</div>
```

---

## ✅ Browser Support

- ✅ Chrome 111+
- ✅ Edge 111+
- ✅ Safari 18+
- ⚠️ Firefox (graceful fallback)

---

## 📚 Full Documentation

- `RESPONSIVE_TEXTAREA_IMPLEMENTATION.md` - Layout implementation
- `VIEW_TRANSITIONS_IMPLEMENTATION.md` - Animation implementation
- `TEXTAREA_TESTING_GUIDE.md` - Testing checklist
- `COMPLETE_TEXTAREA_SOLUTION.md` - Complete summary

---

## 🎉 Result

✅ Responsive on all devices
✅ Smooth 60fps animations
✅ No overlapping content
✅ Accessible & performant

**It just works!** 🚀
