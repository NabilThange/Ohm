# Parser Diagnosis Report

## Executive Summary
The parser in `lib/parsers.ts` is **correctly implemented** and should work as designed. However, there are **integration issues** that may prevent it from extracting data from AI responses in the live application.

---

## Parser Analysis

### ✅ What's Working

The parser has three extraction functions that are properly implemented:

#### 1. **BOM Parser** (`extractBOMFromMessage`)
- **Pattern**: `<BOM_CONTAINER>...</BOM_CONTAINER>`
- **Status**: ✅ Correctly extracts JSON from XML-style tags
- **Cleans**: Removes markdown code blocks (````json`)

#### 2. **Code Parser** (`extractCodeFromMessage`)
- **Pattern**: `<CODE_CONTAINER>...</CODE_CONTAINER>`
- **Status**: ✅ Correctly extracts JSON from XML-style tags
- **Cleans**: Removes markdown code blocks

#### 3. **Context Parser** (`extractContextFromMessage`)
- **Patterns**:
  - `---CONTEXT_START---` ... `---CONTEXT_END---`
  - `---MVP_START---` ... `---MVP_END---`
  - `---PRD_START---` ... `---PRD_END---`
- **Status**: ✅ Robust regex that handles variations
- **Features**: Supports streaming (matches even if closing tag is missing)

---

## ⚠️ Critical Issues Found

### Issue #1: **AI System Prompt Mismatch**

**Problem**: The AI agent's system prompt instructs it to output artifacts in **PLAIN TEXT** format, but the parser expects **XML-STYLE TAGS**.

**Evidence from `lib/agents/config.ts` (Line 98-113)**:

```typescript
**On agreement, output:**
```
---CONTEXT_START---
# Project Context
## Overview | Background | Success Criteria | Constraints | About User
---CONTEXT_END---

---MVP_START---
# MVP
## Core Features (with why) | Out of Scope | Success Metrics | Tech Stack
---MVP_END---

---PRD_START---
# PRD
## Vision | Hardware/Software Reqs | User Stories | BOM Preview | Timeline | Risks
---PRD_END---
```
```

**Analysis**: 
- ✅ The Context/MVP/PRD format is **correct** and matches the parser
- ❌ The BOM and Code formats are **incorrect**

**BOM Generator Prompt (Line 139-165)**:
```typescript
**Output in <BOM_CONTAINER>:**
```json
{
  "project_name": "Name",
  "components": [...]
}
```
```

**Problem**: The prompt shows the output wrapped in markdown code blocks with `<BOM_CONTAINER>:` as a label, NOT as actual XML tags. The AI will likely output:

```
**Output in <BOM_CONTAINER>:**
```json
{ ... }
```
```

Instead of:

```
<BOM_CONTAINER>
{ ... }
</BOM_CONTAINER>
```

---

### Issue #2: **Code Generator Format Mismatch**

**Code Generator Prompt (Line 214-221)**:
```typescript
**Output in <CODE_CONTAINER>:**
```json
{
  "files": [{"path": "src/main.cpp", "content": "..."}]
}
```
```

**Same Problem**: The AI will treat `<CODE_CONTAINER>:` as a markdown label, not as XML tags to wrap the output.

---

### Issue #3: **BuildInterface Mock Works, Live API Doesn't**

**BuildInterface.tsx Mock Response (Lines 241-260)** - ✅ CORRECT FORMAT:
```typescript
aiContent = `Here is the Bill of Materials...

<BOM_CONTAINER>
{
  "project_name": "Smart Garden Monitor",
  "components": [...]
}
</BOM_CONTAINER>

Check the **BOM Drawer** to see the full list!`
```

**This works because**:
- The mock response uses actual `<BOM_CONTAINER>` tags
- The parser can extract the JSON correctly

**But the live AI won't match this** because the system prompt doesn't instruct it to output in this exact format.

---

## 🔧 Recommended Fixes

### Fix #1: Update BOM Generator System Prompt

**File**: `lib/agents/config.ts`  
**Line**: 139

**Current**:
```typescript
**Output in <BOM_CONTAINER>:**
```json
{
  "project_name": "Name",
  ...
}
```
```

**Should be**:
```typescript
**CRITICAL**: Wrap your entire JSON output in <BOM_CONTAINER> tags like this:

<BOM_CONTAINER>
{
  "project_name": "Name",
  "summary": "One sentence",
  "components": [...]
}
</BOM_CONTAINER>

Do NOT use markdown code blocks. The tags must be on their own lines.
```

---

### Fix #2: Update Code Generator System Prompt

**File**: `lib/agents/config.ts`  
**Line**: 214

**Current**:
```typescript
**Output in <CODE_CONTAINER>:**
```json
{
  "files": [...]
}
```
```

**Should be**:
```typescript
**CRITICAL**: Wrap your entire JSON output in <CODE_CONTAINER> tags like this:

<CODE_CONTAINER>
{
  "files": [
    {"path": "src/main.cpp", "content": "..."},
    {"path": "platformio.ini", "content": "..."}
  ]
}
</CODE_CONTAINER>

Do NOT use markdown code blocks. The tags must be on their own lines.
```

---

### Fix #3: Add Logging to Parser (Debugging)

**File**: `lib/parsers.ts`

Add console logs to see what the parser is receiving:

```typescript
export const extractBOMFromMessage = (content: string): BOMData | null => {
    console.log("[Parser] Checking for BOM in:", content.substring(0, 200));
    const match = content.match(/<BOM_CONTAINER>([\s\S]*?)<\/BOM_CONTAINER>/);
    if (match && match[1]) {
        console.log("[Parser] ✅ BOM found!");
        try {
            const cleanJson = match[1].replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("[Parser] ❌ Failed to parse BOM JSON", e);
            return null;
        }
    }
    console.log("[Parser] ❌ No BOM container found");
    return null;
};
```

---

## 🧪 Testing Strategy

### Test #1: Verify Mock Responses Work
1. Open the app at `/build`
2. Type "show me the context" or "lock the design"
3. Check browser console for: `[BuildInterface] Restoring Context from history`
4. Open Context Drawer - should show MVP, PRD, Context

### Test #2: Verify Live AI Responses
1. Create a new chat
2. Ask: "Generate a BOM for an LED blinker"
3. Check browser console for parser logs
4. If no `[Parser] ✅ BOM found!`, the AI isn't using the correct format

### Test #3: Manual Parser Test
Run this in browser console:
```javascript
const { extractBOMFromMessage } = await import('/lib/parsers.ts');

const testResponse = `Here's your BOM:

<BOM_CONTAINER>
{
  "project_name": "Test",
  "components": []
}
</BOM_CONTAINER>`;

console.log(extractBOMFromMessage(testResponse));
// Should return the parsed object
```

---

## 📊 Summary Table

| Component | Status | Issue | Fix Priority |
|-----------|--------|-------|--------------|
| Parser Logic | ✅ Working | None | N/A |
| Context/MVP/PRD Format | ✅ Correct | None | N/A |
| BOM Format | ❌ Broken | Prompt doesn't output tags | 🔴 HIGH |
| Code Format | ❌ Broken | Prompt doesn't output tags | 🔴 HIGH |
| BuildInterface Mock | ✅ Working | None | N/A |
| Live AI Integration | ❌ Untested | Need to verify | 🟡 MEDIUM |

---

## 🎯 Action Items

1. **Immediate**: Update BOM and Code generator system prompts to explicitly instruct XML tag wrapping
2. **Testing**: Add console logging to parser to verify what content it receives
3. **Validation**: Test with live AI to confirm tags are being output correctly
4. **Monitoring**: Check browser console for parser status messages

---

## Conclusion

The parser is **correctly implemented**. The issue is that the AI agents are not being instructed to format their responses in a way that the parser can extract. The system prompts need to be updated to explicitly require XML-style tag wrapping for BOM and Code artifacts.
