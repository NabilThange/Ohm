# Testing Plan for Drawer Opening Tools

## Quick Test Scenarios

### 1. Test Context Drawer Opening
**User Message:** "I want to build a smart plant watering system with WiFi control"

**Expected Behavior:**
1. ✅ Context drawer opens immediately (within 100ms of AI starting)
2. ✅ Drawer shows loading skeleton/spinner
3. ✅ AI generates Context, MVP, PRD content (30-60 seconds)
4. ✅ Content appears in drawer as it's generated
5. ✅ Toast notification: "Agent called open_context_drawer"
6. ✅ Toast notification: "Agent called update_context"
7. ✅ Toast notification: "Agent called update_mvp"
8. ✅ Toast notification: "Agent called update_prd"

**Console Logs to Check:**
```
[ToolExecutor] Executing tool: open_context_drawer
[useChat] 🔧 Tool call notification received: open_context_drawer
[useChat] 🔓 OPTIMISTIC OPENING: Dispatching drawer open event for context
```

---

### 2. Test BOM Drawer Opening
**User Message:** "What will this cost? Show me the bill of materials"

**Expected Behavior:**
1. ✅ BOM drawer opens immediately
2. ✅ Drawer shows "Generating Content..." state
3. ✅ AI validates components (30-60 seconds)
4. ✅ BOM table populates with components
5. ✅ Toast notification: "Agent called open_bom_drawer"
6. ✅ Toast notification: "Agent called update_bom"

**Console Logs to Check:**
```
[ToolExecutor] Executing tool: open_bom_drawer
[useChat] 🔓 OPTIMISTIC OPENING: Dispatching drawer open event for bom
[ToolExecutor] BOM updated: X components, $XX.XX
```

---

### 3. Test Code Drawer Opening
**User Message:** "Generate the Arduino code for this project"

**Expected Behavior:**
1. ✅ Code drawer opens immediately
2. ✅ Drawer shows loading state
3. ✅ AI generates code files (20-40 seconds)
4. ✅ Files appear one by one in the drawer
5. ✅ Toast notification: "Agent called open_code_drawer"
6. ✅ Toast notifications for each file: "Agent called add_code_file"

**Console Logs to Check:**
```
[ToolExecutor] Executing tool: open_code_drawer
[useChat] 🔓 OPTIMISTIC OPENING: Dispatching drawer open event for code
[ToolExecutor] Code file processed: src/main.cpp
[ToolExecutor] Code file processed: platformio.ini
```

---

### 4. Test Wiring Drawer Opening
**User Message:** "How do I wire this circuit?"

**Expected Behavior:**
1. ✅ Wiring drawer opens immediately
2. ✅ Drawer shows loading state
3. ✅ AI generates wiring instructions (20-30 seconds)
4. ✅ Wiring table and diagram appear
5. ✅ Toast notification: "Agent called open_wiring_drawer"
6. ✅ Toast notification: "Agent called update_wiring"

**Console Logs to Check:**
```
[ToolExecutor] Executing tool: open_wiring_drawer
[useChat] 🔓 OPTIMISTIC OPENING: Dispatching drawer open event for wiring
[ToolExecutor] Wiring updated: X connections
```

---

### 5. Test Budget Drawer Opening
**User Message:** "Can you make this cheaper? Find budget alternatives"

**Expected Behavior:**
1. ✅ Budget drawer opens immediately
2. ✅ Drawer shows loading state
3. ✅ AI analyzes alternatives (30-60 seconds)
4. ✅ Budget recommendations appear
5. ✅ Toast notification: "Agent called open_budget_drawer"
6. ✅ Toast notification: "Agent called update_budget"

**Console Logs to Check:**
```
[ToolExecutor] Executing tool: open_budget_drawer
[useChat] 🔓 OPTIMISTIC OPENING: Dispatching drawer open event for budget
[ToolExecutor] Budget updated: $XX → $YY (save $ZZ)
```

---

## Performance Benchmarks

### Timing Expectations
- **Drawer Open Latency:** < 100ms from tool call to drawer visible
- **Tool Call Detection:** < 50ms from SSE event to drawer dispatch
- **Total Overhead:** < 150ms added to user experience

### Console Timing Logs
Look for these performance logs:
```
[useChat] 🔧 Tool call notification received at XXX.XX ms
[useChat] ⏱️ Tool call received → Drawer open dispatch: XX.XXms
[useChat] ✅ Drawer open event dispatched in XX.XXms
[useChat] 📊 TOTAL: Tool notification → Drawer event = XX.XXms
```

---

## Edge Cases to Test

### 1. Multiple Tool Calls in Sequence
**Scenario:** AI calls `open_context_drawer` AND `update_context`, `update_mvp`, `update_prd` in the SAME response.

**Expected:**
- Drawer opens immediately when `open_context_drawer` event arrives
- Content updates follow shortly after in the same stream
- No "stops after opening" behavior

### 2. Rapid Successive Calls
**Scenario:** AI calls `open_code_drawer` AND multiple `add_code_file` calls in ONE response.

**Expected:**
- Drawer opens immediately
- Files appear one by one as they are processed from the same tool call batch
- No performance degradation

### 3. User Closes Drawer During Generation
**Scenario:** User manually closes drawer while AI is still generating

**Expected:**
- Drawer stays closed
- Content still updates in background
- User can re-open drawer to see progress

### 4. Network Delay
**Scenario:** Slow network connection delays SSE events

**Expected:**
- Drawer opens as soon as tool_call event arrives
- Graceful handling of delayed content updates
- No UI freezing or errors

---

## Debugging Checklist

If drawer doesn't open:

1. ✅ Check browser console for `[useChat] 🔧 Tool call notification received`
2. ✅ Check for `[useChat] 🔓 OPTIMISTIC OPENING` log
3. ✅ Verify `window.dispatchEvent` is called with correct drawer name
4. ✅ Check drawer component is listening for `open-drawer` event
5. ✅ Verify tool is in `toolDrawerMap` in `use-chat.ts`
6. ✅ Check agent has access to the tool in `getToolsForAgent()`
7. ✅ Verify system prompt instructs agent to call the tool

If content doesn't appear:

1. ✅ Check `[ToolExecutor] Executing tool: update_XXX` logs
2. ✅ Verify database insert succeeded
3. ✅ Check realtime subscription is active
4. ✅ Verify drawer is polling/listening for updates

---

## Success Criteria

### Must Have
- ✅ All 5 drawer types open immediately when AI calls open_drawer tool
- ✅ Loading states display while content is being generated
- ✅ Content populates correctly after generation
- ✅ No TypeScript errors related to new tools
- ✅ No console errors during normal operation

### Nice to Have
- ✅ Drawer open latency < 100ms
- ✅ Smooth animations when drawer opens
- ✅ Toast notifications for all tool calls
- ✅ Progress indicators during long operations

### Performance
- ✅ No memory leaks from event listeners
- ✅ No UI freezing during generation
- ✅ Drawer remains responsive during updates
- ✅ No excessive re-renders

---

## Rollback Plan

If issues arise:

1. **Revert System Prompts:** Remove open_drawer tool instructions
2. **Revert Tool Executor:** Remove open_drawer case handlers
3. **Revert Frontend:** Remove open_drawer tools from toolDrawerMap
4. **Revert Tools:** Remove open_drawer tool definitions

The system will fall back to the old behavior where drawers open only after content is generated.

---

## Next Steps After Testing

1. **Gather User Feedback:** Does the immediate drawer opening feel better?
2. **Measure Metrics:** Track drawer open latency and user engagement
3. **Iterate on Loading States:** Improve skeleton screens and progress indicators
4. **Add Progress Tracking:** Show estimated time remaining for long operations
5. **Consider Cancellation:** Allow users to cancel long-running generations
