# Parser Fix Implementation Guide

## Summary
I've diagnosed the parser issue. The parser code in `lib/parsers.ts` is **correctly implemented**, but the AI system prompts in `lib/agents/config.ts` need to be updated to output in the correct format.

## Root Cause

The system prompts currently show examples using markdown code blocks like this:

```
**Output in <BOM_CONTAINER>:**
```json
{ ... }
```
```

This causes the AI to treat `<BOM_CONTAINER>:` as a markdown label, not as actual XML tags to wrap the output.

## Required Changes

### File: `lib/agents/config.ts`

#### Change #1: BOM Generator (Line ~139-165)

**Find this section:**
```typescript
**Output in <BOM_CONTAINER>:**
\`\`\`json
{
  "project_name": "Name",
  ...
}
\`\`\`
```

**Replace with:**
```typescript
**CRITICAL OUTPUT FORMAT**: You MUST wrap your entire JSON response in <BOM_CONTAINER> tags. Do NOT use markdown code blocks. Example:

<BOM_CONTAINER>
{
  "project_name": "Name",
  "summary": "One sentence",
  "components": [{
    "name": "Readable name",
    "partNumber": "Exact manufacturer part#",
    "quantity": 1,
    "voltage": "3.3V",
    "current": "50mA active, 10µA sleep",
    "estimatedCost": 12.50,
    "supplier": "DigiKey",
    "alternatives": ["Alt with reasoning"],
    "link": "https://...",
    "notes": "Polarity warnings, pull-up needs"
  }],
  "totalCost": 45.00,
  "powerAnalysis": {
    "peakCurrent": "Max simultaneous draw",
    "batteryLife": "Runtime estimate",
    "recommendedSupply": "5V 2A USB"
  },
  "warnings": ["⚠️ Critical gotchas"],
  "assemblyNotes": ["Pro tips"]
}
</BOM_CONTAINER>
```

#### Change #2: Code Generator (Line ~214-221)

**Find this section:**
```typescript
**Output in <CODE_CONTAINER>:**
\`\`\`json
{
  "files": [...]
}
\`\`\`
```

**Replace with:**
```typescript
**CRITICAL OUTPUT FORMAT**: You MUST wrap your entire JSON response in <CODE_CONTAINER> tags. Do NOT use markdown code blocks. Example:

<CODE_CONTAINER>
{
  "files": [
    {"path": "src/main.cpp", "content": "..."},
    {"path": "platformio.ini", "content": "..."}
  ],
  "buildInstructions": ["Steps"],
  "testingNotes": ["Expected output, common issues"]
}
</CODE_CONTAINER>
```

## Testing After Fix

1. **Test with BuildInterface Mock** (should already work):
   - Navigate to `/build`
   - Type "show me the BOM" or "generate parts list"
   - Check if BOM drawer populates

2. **Test with Live AI**:
   - Create a new chat
   - Ask: "Generate a BOM for an LED blinker with ESP32"
   - Check browser console for `[BuildInterface] Restoring BOM from history`
   - Open BOM drawer to verify data appears

3. **Check Console Logs**:
   - Look for: `[Parser STATUS: ON] 🟢 Scanning X messages for artifacts...`
   - Should see: `[BuildInterface] Restoring BOM from history` when BOM is found

## Additional Debugging

If the parser still doesn't work after the fix, add logging to `lib/parsers.ts`:

```typescript
export const extractBOMFromMessage = (content: string): BOMData | null => {
    console.log("[Parser] Checking for BOM, content length:", content.length);
    const match = content.match(/<BOM_CONTAINER>([\s\S]*?)<\/BOM_CONTAINER>/);
    if (match && match[1]) {
        console.log("[Parser] ✅ BOM container found!");
        try {
            const cleanJson = match[1].replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            console.log("[Parser] ✅ BOM parsed successfully:", parsed);
            return parsed;
        } catch (e) {
            console.error("[Parser] ❌ Failed to parse BOM JSON:", e);
            console.log("[Parser] Raw JSON:", match[1]);
            return null;
        }
    }
    console.log("[Parser] ❌ No BOM container found in message");
    return null;
};
```

## Why This Matters

The parser is the bridge between AI responses and the UI drawers. Without proper formatting:
- ❌ BOM Drawer stays empty even when AI generates parts lists
- ❌ Code Drawer doesn't show generated firmware
- ❌ Context Drawer might not update with MVP/PRD

With the fix:
- ✅ AI responses are automatically extracted and displayed
- ✅ Users can view/copy BOM data
- ✅ Generated code appears in the Code Drawer
- ✅ MVP/PRD/Context populate correctly
