# Drawer Opening Tools Implementation

## Overview
Implemented a new set of "open drawer" tools that allow AI agents to open drawers **BEFORE** generating content, providing immediate visual feedback to users that the AI is working on their request.

## Changes Made

### 1. New Tools Added (`lib/agents/tools.ts`)

Added 5 new drawer opening tools:
- `open_context_drawer` - Opens Context drawer before generating Context/MVP/PRD
- `open_bom_drawer` - Opens BOM drawer before generating bill of materials
- `open_code_drawer` - Opens Code drawer before generating code files
- `open_wiring_drawer` - Opens Wiring drawer before generating wiring diagrams
- `open_budget_drawer` - Opens Budget drawer before analyzing costs

These tools:
- Take NO arguments (empty parameters)
- Return `{ success: true, action: 'open_drawer', drawer: '<drawer_name>' }`
- Are called BEFORE content generation starts
- Signal the frontend to open the drawer immediately

### 2. Tool Executor Updates (`lib/agents/tool-executor.ts`)

Added handlers for all new open_drawer tools in the `executeToolCall` method:
- Each handler returns a simple success response with drawer information
- No database operations (these are UI-only tools)
- Organized with clear comments separating "DRAWER OPENING TOOLS" from "CONTENT UPDATE TOOLS"

### 3. Tool Availability (`lib/agents/tools.ts`)

Updated `getToolsForAgent()` to include open_drawer tools for each agent type:
- `conversational` & `projectInitializer`: `open_context_drawer`
- `bomGenerator`: `open_bom_drawer`
- `codeGenerator`: `open_code_drawer`
- `wiringDiagram`: `open_wiring_drawer`
- `budgetOptimizer`: `open_budget_drawer`

### 4. System Prompt Updates (`lib/agents/config.ts`)

Updated all agent system prompts to follow the new **Tool Call Sequence**:

#### Example: Conversational Agent
```
1. FIRST - Open the drawer:
   Call open_context_drawer() with NO arguments
   This opens the drawer IMMEDIATELY so the user sees you're working

2. THEN - Generate the content:
   Think through and generate your Context, MVP, and PRD content

3. FINALLY - Update with content:
   Call update_context(), update_mvp(), update_prd() with the generated content
```

All agents now follow this pattern:
1. Call `open_<drawer>_drawer()` first
2. Generate content
3. Call `update_<content>()` or `add_code_file()` with the content

### 5. Frontend Integration (`lib/hooks/use-chat.ts`)

Updated the `toolDrawerMap` to include all new open_drawer tools:
- Maps tool names to drawer identifiers
- Dispatches `open-drawer` custom events when tools are called
- Works with existing drawer opening infrastructure

## How It Works

### Before (Old Flow)
1. User asks for BOM
2. AI generates BOM data (30-60 seconds)
3. AI calls `update_bom` tool
4. Drawer opens with completed data

**Problem:** User sees nothing happening for 30-60 seconds

### After (New Flow)
1. User asks for BOM
2. AI calls `open_bom_drawer` tool (instant)
3. **Drawer opens immediately** showing loading state
4. AI generates BOM data (30-60 seconds)
5. AI calls `update_bom` tool
6. Drawer updates with completed data

**Benefit:** User sees immediate feedback that AI is working

## User Experience Improvements

### Visual Feedback
- Drawer opens instantly when AI starts working
- Loading skeleton/spinner shows content is being generated
- User knows the AI is actively working on their request

### Perceived Performance
- Feels much faster even though generation time is the same
- Reduces user anxiety during long operations
- Provides context about what the AI is doing

### Progressive Disclosure
- For code generation: Drawer opens, then files appear one by one
- For BOM: Drawer opens, then components populate
- For Context: Drawer opens, then Context/MVP/PRD appear sequentially

## Testing Recommendations

1. **Test Context Generation**
   - Ask: "I want to build a smart plant watering system"
   - Verify: Context drawer opens immediately
   - Verify: Context, MVP, PRD appear in sequence

2. **Test BOM Generation**
   - Ask: "What will this cost?"
   - Verify: BOM drawer opens immediately
   - Verify: Components populate after generation

3. **Test Code Generation**
   - Ask: "Generate the code"
   - Verify: Code drawer opens immediately
   - Verify: Files appear one by one

4. **Test Wiring Diagram**
   - Ask: "How do I wire this?"
   - Verify: Wiring drawer opens immediately
   - Verify: Connections appear after generation

5. **Test Budget Optimization**
   - Ask: "Can you make this cheaper?"
   - Verify: Budget drawer opens immediately
   - Verify: Recommendations appear after analysis

## Technical Notes

### Tool Call Order
The AI MUST call tools in this order:
1. `open_<drawer>_drawer()` - Opens drawer
2. [Generate content internally]
3. `update_<content>()` - Populates drawer

### Error Handling
- If `open_drawer` tool fails, content updates still work
- Drawer opening is optimistic (doesn't wait for confirmation)
- Existing error handling for content updates remains unchanged

### Performance
- Drawer opening adds ~10-50ms overhead (negligible)
- No additional API calls (uses existing SSE stream)
- No database operations for open_drawer tools

## Future Enhancements

1. **Progress Indicators**
   - Show estimated time remaining
   - Display current step (e.g., "Validating components...")

2. **Cancellation**
   - Allow users to cancel long-running operations
   - Close drawer if user cancels

3. **Multiple Drawers**
   - Support opening multiple drawers simultaneously
   - Coordinate drawer positions to avoid overlap

4. **Analytics**
   - Track time from drawer open to content ready
   - Measure user engagement with loading states
