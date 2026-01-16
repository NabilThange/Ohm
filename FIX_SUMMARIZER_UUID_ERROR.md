# Summarizer UUID Error Fix - Issue #3

## Problem Summary
Summarizer was failing with a UUID validation error:

```
[Summarizer] Failed to initialize summary: {
  code: '22P02',
  details: null,
  hint: null,
  message: 'invalid input syntax for type uuid: "system"'
}
```

**Error Code:** `22P02` = Invalid text representation for UUID
**Error Message:** The string `"system"` cannot be used as a UUID

## Root Cause

### What Was Happening

1. ✅ **Orchestrator** calls `summarizer.updateSummary('system')`
2. ✅ **Summarizer** receives `userId = 'system'`
3. ❌ **Summarizer** tries to insert `'system'` into `created_by` UUID column
4. ❌ **Database** rejects: `'system'` is not a valid UUID format
5. ❌ **Summarization** fails completely

### The Code Problem

**File:** `lib/agents/orchestrator.ts` (line 616)
```typescript
summarizer.updateSummary('system').catch(err => {
    console.error('[Orchestrator] Background summarization failed:', err);
});
```

**File:** `lib/agents/summarizer.ts` (lines 84-86, before fix)
```typescript
// Only add created_by if userId is provided
if (userId) {  // ❌ 'system' is truthy, so this passes!
    versionData.created_by = userId;  // ❌ Inserts 'system' as UUID
}
```

**Problem:** The string `'system'` is truthy, so it passes the `if (userId)` check and gets inserted into a UUID column, causing a database error.

## Solution Implemented

### Added UUID Validation

**File:** `lib/agents/summarizer.ts`

#### 1. Added UUID Validation Helper
```typescript
/**
 * Validate if a string is a valid UUID format
 */
private isValidUUID(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
}
```

#### 2. Updated initializeSummary Method
**Before:**
```typescript
if (userId) {
    versionData.created_by = userId;  // ❌ Accepts 'system'
}
```

**After:**
```typescript
if (userId && this.isValidUUID(userId)) {
    versionData.created_by = userId;  // ✅ Only valid UUIDs
} else if (userId === 'system') {
    console.log('[Summarizer] Skipping created_by for system-generated summary');
    // Don't add created_by for system messages
}
```

#### 3. Updated updateSummary Method
Applied the same validation logic to ensure consistency.

## How It Works Now

### Validation Flow

```
Input: userId = 'system'
  ↓
Check: isValidUUID('system')
  ↓
Regex Test: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  ↓
Result: false (not a UUID format)
  ↓
Check: userId === 'system'
  ↓
Result: true
  ↓
Action: Skip created_by field
  ↓
Insert: { artifact_id, version_number, content } (no created_by)
  ↓
Database: ✅ Success!
```

### Valid UUID Example

```
Input: userId = '123e4567-e89b-12d3-a456-426614174000'
  ↓
Check: isValidUUID('123e4567-e89b-12d3-a456-426614174000')
  ↓
Regex Test: Matches UUID format
  ↓
Result: true
  ↓
Action: Add created_by field
  ↓
Insert: { artifact_id, version_number, content, created_by: '123e4567...' }
  ↓
Database: ✅ Success!
```

## Expected Logs

### Before Fix (Error)
```
[Summarizer] Failed to initialize summary: {
  code: '22P02',
  message: 'invalid input syntax for type uuid: "system"'
}
```

### After Fix (Success)
```
[Summarizer] Skipping created_by for system-generated summary
✅ [Summarizer] Summary updated to v1 (5 messages processed)
```

## UUID Validation Rules

### Valid UUIDs ✅
```
123e4567-e89b-12d3-a456-426614174000
550e8400-e29b-41d4-a716-446655440000
6ba7b810-9dad-11d1-80b4-00c04fd430c8
```

### Invalid Inputs ❌
```
'system'           → Skipped (special case)
'user123'          → Skipped (not UUID format)
'invalid-uuid'     → Skipped (not UUID format)
''                 → Skipped (empty string)
null               → Skipped (null)
undefined          → Skipped (undefined)
```

## Files Modified

**Modified:**
1. `lib/agents/summarizer.ts`
   - Added `isValidUUID()` helper method
   - Updated `initializeSummary()` with UUID validation
   - Updated `updateSummary()` with UUID validation

## Testing

### Test 1: System-Generated Summary
1. Start new chat
2. Send first message
3. Wait for summarization (after 5 messages)
4. **Verify no UUID errors** in console

**Expected:**
```
[Summarizer] Skipping created_by for system-generated summary
✅ [Summarizer] Summary updated to v1 (5 messages processed)
```

### Test 2: User-Generated Summary (Future)
If you later add user authentication:
1. Login as user
2. Send messages
3. Wait for summarization
4. **Verify created_by is set** with user's UUID

**Expected:**
```
✅ [Summarizer] Summary updated to v1 (5 messages processed)
(created_by field contains user UUID)
```

### Test 3: Invalid UUID String
If code accidentally passes invalid string:
1. Code calls `summarizer.updateSummary('invalid-id')`
2. **Verify it's skipped** gracefully

**Expected:**
```
(No created_by field added, no error thrown)
✅ [Summarizer] Summary updated to v1 (5 messages processed)
```

## Database Schema

### artifact_versions Table

```sql
CREATE TABLE artifact_versions (
    id UUID PRIMARY KEY,
    artifact_id UUID NOT NULL,
    version_number INTEGER NOT NULL,
    content TEXT,
    content_json JSONB,
    created_by UUID REFERENCES auth.users(id),  -- ✅ Now optional (nullable)
    created_at TIMESTAMP DEFAULT NOW(),
    ...
);
```

**Important:** The `created_by` column is **nullable**, so it's perfectly fine to omit it for system-generated summaries.

## Alternative Solutions Considered

### Option 1: Create System User UUID (Not Implemented)
```sql
INSERT INTO auth.users (id, email) 
VALUES ('00000000-0000-0000-0000-000000000000', 'system@ohm.internal');
```
Then use this UUID for all system messages.

**Pros:** Consistent user tracking
**Cons:** Requires auth.users table modification, fake user account

### Option 2: Make created_by Required (Not Implemented)
Force all operations to have a user.

**Pros:** Enforced user tracking
**Cons:** Doesn't work for system-generated content

### Option 3: UUID Validation (✅ Implemented)
Validate UUID format and skip for 'system'.

**Pros:** Simple, works with existing schema, graceful handling
**Cons:** created_by is null for system messages

**Chosen:** Option 3 because it's the simplest and works with the existing architecture.

## Comparison: Before vs After

### Before (Broken)
```typescript
if (userId) {
    versionData.created_by = userId;  // ❌ 'system' inserted as UUID
}
// Result: Database error 22P02
```

### After (Fixed)
```typescript
if (userId && this.isValidUUID(userId)) {
    versionData.created_by = userId;  // ✅ Only valid UUIDs
} else if (userId === 'system') {
    // Skip created_by for system messages
}
// Result: Success, created_by is null for system messages
```

## Performance Impact

- ✅ **Minimal overhead** - Regex validation is very fast (~0.001ms)
- ✅ **No extra database calls** - Validation happens in-memory
- ✅ **Prevents errors** - Avoids database exceptions
- ✅ **Graceful degradation** - Works with or without created_by column

---

**Result**: Summarizer now properly validates UUIDs before inserting into the database, preventing the 'invalid input syntax for type uuid: "system"' error! 🎉

System-generated summaries work correctly with `created_by` set to NULL, while user-generated summaries (when implemented) will have proper UUID tracking.
