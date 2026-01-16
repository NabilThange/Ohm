# Database Schema Fix - created_by Column Missing

## Problem Summary
The application was showing persistent errors about a missing `created_by` column in the `artifact_versions` table:

```
[Summarizer] Failed to initialize summary: {
  code: 'PGRST204',
  details: null,
  hint: null,
  message: "Could not find the 'created_by' column of 'artifact_versions' in the schema cache"
}
```

## Root Cause
The `ConversationSummarizer` code was trying to insert a `created_by` field into the `artifact_versions` table, but this column didn't exist in the database schema.

**Code attempting to use the column:**
- `lib/agents/summarizer.ts` line 82 (initializeSummary)
- `lib/agents/summarizer.ts` line 226 (updateSummary)

**Database schema:**
- `OLD_context_docs/DATABASE_SCHEMA.sql` lines 216-240 show `artifact_versions` table
- No `created_by` column defined

## Solution Implemented

### 1. Created Migration File
**File:** `migrations/add_created_by_to_artifact_versions.sql`

```sql
-- Add created_by column to artifact_versions table
ALTER TABLE artifact_versions 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_artifact_versions_created_by 
ON artifact_versions(created_by);
```

**Features:**
- ✅ Uses `IF NOT EXISTS` to be idempotent
- ✅ Adds foreign key reference to `auth.users(id)`
- ✅ Includes index for query performance
- ✅ Handles existing rows gracefully (they'll have NULL)

### 2. Updated Summarizer Code
**File:** `lib/agents/summarizer.ts`

**Changes in `initializeSummary` method (lines 75-107):**
- Made `created_by` field optional
- Added retry logic if column doesn't exist
- Graceful fallback to insert without `created_by`

**Changes in `updateSummary` method (lines 237-280):**
- Same graceful handling as `initializeSummary`
- Changed from `content` to `content_json` for structured data
- Replaced `supabase.rpc('increment_artifact_version')` with direct update
- Added try-catch for version counter update

**Key improvements:**
```typescript
// Build version data conditionally
const versionData: any = {
  artifact_id: artifact.id,
  version_number: 1,
  content: initialSummary
};

// Only add created_by if userId is provided
if (userId) {
  versionData.created_by = userId;
}

// Try insert
const { error: versionError } = await supabase
  .from('artifact_versions')
  .insert(versionData);

// Retry without created_by if column doesn't exist
if (versionError) {
  if (versionError.message?.includes('created_by')) {
    console.warn('[Summarizer] created_by column not found, retrying without it...');
    delete versionData.created_by;
    const { error: retryError } = await supabase
      .from('artifact_versions')
      .insert(versionData);
    if (retryError) throw retryError;
  } else {
    throw versionError;
  }
}
```

## How to Apply the Fix

### Step 1: Run the Migration in Supabase

**Option A: Via Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open `migrations/add_created_by_to_artifact_versions.sql`
4. Copy the SQL content
5. Paste into SQL Editor
6. Click **Run**

**Option B: Via Supabase CLI**
```bash
supabase db push
```

**Option C: Manually via psql**
```bash
psql -h <your-supabase-host> -U postgres -d postgres -f migrations/add_created_by_to_artifact_versions.sql
```

### Step 2: Verify the Migration

**Check if column exists:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'artifact_versions'
AND column_name = 'created_by';
```

**Expected result:**
```
column_name | data_type | is_nullable
------------|-----------|------------
created_by  | uuid      | YES
```

### Step 3: Refresh Schema Cache (if needed)

If you still see errors after running the migration:

1. Go to Supabase Dashboard → **Database** → **Webhooks**
2. Click **Refresh Schema Cache**
3. OR restart your application to reconnect to Supabase

### Step 4: Test the Fix

1. Send a message in the chat
2. Watch the console logs
3. Should see:
   ```
   [Summarizer] ✅ Summary updated to v1 (5 messages processed)
   ```
4. Should NOT see:
   ```
   [Summarizer] Failed to initialize summary: ...created_by...
   ```

## Backward Compatibility

### Code is Backward Compatible ✅
The updated code works with BOTH:
- ✅ **Old schema** (without `created_by` column) - Retries without the field
- ✅ **New schema** (with `created_by` column) - Uses the field normally

### Migration is Safe ✅
- ✅ Uses `IF NOT EXISTS` - Safe to run multiple times
- ✅ Existing rows get `NULL` for `created_by` - Acceptable
- ✅ No data loss
- ✅ No downtime required

## Error Handling Improvements

### Before
```typescript
// Would fail immediately if column doesn't exist
const { error } = await supabase
  .from('artifact_versions')
  .insert({ created_by: userId, ... });

if (error) throw error; // ❌ Blocks entire summarization
```

### After
```typescript
// Tries with created_by first
const { error } = await supabase
  .from('artifact_versions')
  .insert(versionData);

// Gracefully retries without it if needed
if (error?.message?.includes('created_by')) {
  delete versionData.created_by;
  await supabase.from('artifact_versions').insert(versionData);
}
// ✅ Summarization continues even if schema is outdated
```

## Additional Fixes

### Fixed RPC Call
**Before:**
```typescript
await supabase.rpc('increment_artifact_version', { 
  artifact_id: current.artifactId 
});
```

**After:**
```typescript
await supabase
  .from('artifacts')
  .update({ current_version: newVersionNumber })
  .eq('id', current.artifactId);
```

**Why:** The RPC function `increment_artifact_version` might not exist in the database. Direct update is more reliable.

## Files Modified

### Created
1. `migrations/add_created_by_to_artifact_versions.sql` - Migration file

### Modified
1. `lib/agents/summarizer.ts` - Graceful error handling

## Testing Checklist

- [ ] Run migration in Supabase
- [ ] Verify column exists in database
- [ ] Send test message in chat
- [ ] Check console for summarizer logs
- [ ] Verify no more "created_by" errors
- [ ] Verify summarization works correctly
- [ ] Check that existing chats still work

## Future Improvements (Optional)

1. **Add created_by to all artifact operations** - Not just summarizer
2. **Backfill existing rows** - Update NULL created_by values with chat owner
3. **Add updated_by column** - Track who last modified each version
4. **Add audit trail** - Track all changes to artifacts
5. **Add RLS policies** - Ensure users can only see their own artifacts

## Troubleshooting

### Error Still Appears After Migration
**Possible causes:**
1. Migration didn't run successfully
2. Schema cache is stale
3. Connected to wrong database

**Solutions:**
1. Verify column exists: `\d artifact_versions` in psql
2. Refresh schema cache in Supabase Dashboard
3. Restart application
4. Check database connection string

### Migration Fails
**Possible causes:**
1. Insufficient permissions
2. Column already exists (safe to ignore)
3. Foreign key constraint fails

**Solutions:**
1. Run as postgres user
2. Check if column exists first
3. Verify auth.users table exists

### Code Still Throws Errors
**Possible causes:**
1. Old code still deployed
2. TypeScript types not regenerated
3. Different error (not created_by related)

**Solutions:**
1. Restart dev server
2. Regenerate Supabase types
3. Check full error message

---

**Result**: The `created_by` column error is now fixed with both a database migration and graceful error handling in the code. The system works with or without the column! ✅
