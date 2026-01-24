# Textarea Testing Guide

## Quick Start

Run the development server:
```bash
npm run dev
# or
pnpm dev
```

Then test each page systematically.

---

## Test 1: Landing Page (/)

### Desktop Testing
1. Navigate to `http://localhost:3000/`
2. **Visual Check:**
   - [ ] Textarea visible below hero text
   - [ ] Centered on page
   - [ ] Not overlapping any content
   - [ ] Animated placeholder cycling through examples
3. **Interaction:**
   - [ ] Click textarea - should focus
   - [ ] Type a message
   - [ ] Press Enter - should navigate to `/build/[chatId]`
   - [ ] Click "Create" button - should navigate
4. **Responsive:**
   - [ ] Resize to mobile (< 768px) - textarea should be full width with padding
   - [ ] Resize to tablet (768-1024px) - textarea should be constrained
   - [ ] Resize to desktop (> 1024px) - textarea should be max 700px wide

### Mobile Testing (DevTools)
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test on:
   - [ ] iPhone SE (375px)
   - [ ] iPhone 12 Pro (390px)
   - [ ] iPad (768px)
   - [ ] iPad Pro (1024px)
4. **Check:**
   - [ ] No horizontal scroll
   - [ ] Textarea fits within viewport
   - [ ] Buttons are tappable (min 44px touch target)
   - [ ] Text is readable

---

## Test 2: Build Page (/build)

### Desktop Testing
1. Navigate to `http://localhost:3000/build`
2. **Visual Check:**
   - [ ] "Build Mode" heading visible
   - [ ] Textarea centered vertically and horizontally
   - [ ] Larger than landing page textarea
   - [ ] Helper text below: "Press Enter to create or click Create"
3. **Interaction:**
   - [ ] Type a project description
   - [ ] Press Enter - should create chat and navigate
   - [ ] Verify chat ID in URL: `/build/[uuid]`
4. **Responsive:**
   - [ ] Mobile: Textarea should stack vertically, full width
   - [ ] Tablet: Centered with padding
   - [ ] Desktop: Centered, max width

---

## Test 3: Chat Interface (/build/[chatId])

### Desktop Testing
1. Create a new chat from landing or build page
2. **Visual Check:**
   - [ ] Textarea sticky at bottom of chat
   - [ ] Not overlapping messages
   - [ ] Visible even when scrolling messages
   - [ ] Footer text: "AI can make mistakes..."
3. **Interaction:**
   - [ ] Type a message
   - [ ] Press Enter - message should send
   - [ ] Click Send button - message should send
   - [ ] Type "/" - command palette should appear
   - [ ] Arrow keys navigate commands
   - [ ] Tab/Enter selects command
   - [ ] Escape closes command palette
4. **Commands:**
   - [ ] Type `/update-context` - should show in palette
   - [ ] Type `/update-bom` - should show in palette
   - [ ] Type `/recheck-wiring` - should show in palette
   - [ ] Type `/update-code` - should show in palette
   - [ ] Click "More about commands" - help modal should open
5. **Loading States:**
   - [ ] Send message - button shows "Sending..." with spinner
   - [ ] Textarea disabled during send
   - [ ] Re-enabled after response
6. **Responsive:**
   - [ ] Mobile: Full width, sticky bottom
   - [ ] Tablet: Constrained width, centered
   - [ ] Desktop: Max 3xl width, centered

### Scroll Testing
1. Send multiple messages to fill the chat
2. **Check:**
   - [ ] Textarea stays at bottom (sticky)
   - [ ] Messages scroll independently
   - [ ] Textarea never scrolls out of view
   - [ ] No overlap with messages

---

## Test 4: Cross-Page Navigation

### Flow Testing
1. Start at landing page
2. Type message → Navigate to chat
3. **Check:**
   - [ ] No flash of unstyled content
   - [ ] Smooth transition
   - [ ] Message appears in chat
4. Go back to landing (browser back)
5. **Check:**
   - [ ] Landing textarea visible again
   - [ ] No duplicate textareas
   - [ ] Previous message cleared

### Multiple Chats
1. Create chat A
2. Navigate to `/build` (new chat)
3. Create chat B
4. Switch between chats
5. **Check:**
   - [ ] Textarea persists on each chat
   - [ ] No state leakage between chats
   - [ ] Each chat has independent textarea state

---

## Test 5: Edge Cases

### Empty States
- [ ] Chat with no messages - textarea visible
- [ ] New chat - textarea functional
- [ ] Deleted chat - graceful handling

### Long Content
- [ ] Type very long message (1000+ chars)
- [ ] Textarea should auto-expand (if implemented)
- [ ] Should not break layout

### Special Characters
- [ ] Type emojis: 🚀 💡 🎯
- [ ] Type code: `const x = 1;`
- [ ] Type markdown: **bold** _italic_
- [ ] All should work without breaking

### Keyboard Shortcuts
- [ ] Enter - sends message
- [ ] Shift+Enter - new line
- [ ] Escape - closes command palette
- [ ] Tab - navigates commands
- [ ] Arrow keys - navigates commands

---

## Test 6: Accessibility

### Keyboard Navigation
1. Tab through page
2. **Check:**
   - [ ] Textarea receives focus
   - [ ] Focus visible (outline/ring)
   - [ ] Can type without mouse
   - [ ] Can submit with Enter

### Screen Reader (Optional)
1. Enable screen reader (NVDA/JAWS/VoiceOver)
2. **Check:**
   - [ ] Textarea announced as "text input"
   - [ ] Placeholder read correctly
   - [ ] Button labels clear
   - [ ] Error states announced

### Color Contrast
- [ ] Text readable in dark mode
- [ ] Placeholder text visible
- [ ] Border visible
- [ ] Focus state clear

---

## Test 7: Performance

### Load Time
1. Open DevTools Network tab
2. Navigate to each page
3. **Check:**
   - [ ] Landing page loads < 2s
   - [ ] Build page loads < 2s
   - [ ] Chat page loads < 3s
   - [ ] No unnecessary re-renders

### Memory
1. Open DevTools Performance tab
2. Create multiple chats
3. Navigate between pages
4. **Check:**
   - [ ] No memory leaks
   - [ ] Smooth animations
   - [ ] No jank/stuttering

---

## Test 8: Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

For each browser:
- [ ] Textarea renders correctly
- [ ] Animations work
- [ ] Navigation works
- [ ] No console errors

---

## Common Issues & Fixes

### Issue: Textarea not visible
**Fix:** Check if page imported the correct component:
- Landing/Build: `HeroPromptInput`
- Chat: `ChatPromptInput`

### Issue: Overlapping content
**Fix:** Ensure parent container has proper layout:
```tsx
<div className="flex flex-col h-full">
  <div className="flex-1 overflow-y-auto">
    {/* Messages */}
  </div>
  <ChatPromptInput />
</div>
```

### Issue: Not responsive
**Fix:** Check responsive classes:
```tsx
className="w-full max-w-2xl mx-auto px-4"
```

### Issue: Commands not working
**Fix:** Verify ChatPromptInput is used (not HeroPromptInput) in chat

### Issue: Navigation not working
**Fix:** Check router.push() calls and URL encoding

---

## Success Criteria

All tests pass when:
- ✅ No overlapping content on any screen size
- ✅ Responsive on mobile, tablet, desktop
- ✅ Smooth navigation between pages
- ✅ Commands work in chat
- ✅ Loading states display correctly
- ✅ Keyboard shortcuts functional
- ✅ No console errors
- ✅ Accessible via keyboard
- ✅ Works in all major browsers

---

## Automated Testing (Future)

Consider adding:
```typescript
// __tests__/textarea.test.tsx
describe('HeroPromptInput', () => {
  it('renders on landing page', () => {
    render(<HeroPromptInput variant="landing" />)
    expect(screen.getByPlaceholderText(/build/i)).toBeInTheDocument()
  })
  
  it('navigates on submit', async () => {
    const { user } = render(<HeroPromptInput variant="landing" />)
    await user.type(screen.getByRole('textbox'), 'Test project')
    await user.keyboard('{Enter}')
    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('/build/'))
  })
})
```

---

## Reporting Issues

If you find bugs, report with:
1. **Page:** Landing / Build / Chat
2. **Device:** Desktop / Mobile / Tablet
3. **Browser:** Chrome / Firefox / Safari / Edge
4. **Steps to reproduce**
5. **Expected behavior**
6. **Actual behavior**
7. **Screenshot** (if visual issue)

---

## Next Steps After Testing

Once all tests pass:
1. ✅ Delete old `MorphingPromptInput.tsx` (if not needed)
2. ✅ Update documentation
3. ✅ Deploy to staging
4. ✅ User acceptance testing
5. ✅ Deploy to production

Happy testing! 🚀
