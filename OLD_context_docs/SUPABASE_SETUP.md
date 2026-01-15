# 🚀 Supabase Setup Guide for OHM

This guide walks you through setting up Supabase for the OHM project.

---

## 📋 Prerequisites

- Supabase account (free tier is fine!)
- Node.js 18+ installed
- OHM project cloned locally

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in:
   - **Name**: `ohm-database`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (or Pro if needed)
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## Step 2: Run Database Schema

### Option A: Using Supabase Dashboard (Easiest)

1. In Supabase dashboard, go to **SQL Editor** (in left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `DATABASE_SCHEMA.sql`
4. Paste into the editor
5. Click **"Run"** (or press `Ctrl+Enter`)
6. ✅ You should see: "Success. No rows returned"

### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push
```

---

## Step 3: Configure Storage Buckets

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Create the following buckets:

### Bucket 1: `attachments`
- **Name**: `attachments`
- **Public**: ✅ Yes (for images to display)
- **File size limit**: 50MB
- **Allowed MIME types**: `image/*`, `application/pdf`

### Bucket 2: `circuit_verifications`
- **Name**: `circuit_verifications`
- **Public**: ❌ No (private analysis results)
- **File size limit**: 10MB

### Bucket 3: `exports`
- **Name**: `exports`
- **Public**: ❌ No
- **File size limit**: 100MB

---

## Step 4: Set Up Environment Variables

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:

```env
# .env.local (create this file in your OHM project root)

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Keep this SECRET!

# BYTEZ API (you already have this)
BYTEZ_API_KEY=your_bytez_key
```

⚠️ **IMPORTANT**: 
- Add `.env.local` to your `.gitignore`
- NEVER commit the service role key to Git!

---

## Step 5: Install Supabase Client

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## Step 6: Create Supabase Client Utilities

Create the following files:

### `lib/supabase/client.ts` (Client-side)

```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
```

### `lib/supabase/server.ts` (Server-side)

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors (cookies can't be set in Server Components)
          }
        },
      },
    }
  );
};
```

### `lib/supabase/middleware.ts` (For auth middleware)

```typescript
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if needed
  await supabase.auth.getUser();

  return supabaseResponse;
}
```

---

## Step 7: Generate TypeScript Types

### Option A: Using Supabase CLI

```bash
# Generate types from your live database
supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/supabase/types.ts
```

### Option B: Manual (if CLI doesn't work)

Create `lib/supabase/types.ts` (I'll generate this for you in the next step)

---

## Step 8: Test Database Connection

Create a test route to verify everything works:

### `app/api/test-db/route.ts`

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient();

  // Test query
  const { data, error } = await supabase
    .from('chats')
    .select('*')
    .limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Database connected!',
    data,
  });
}
```

**Test it**: Navigate to `http://localhost:3000/api/test-db`

---

## Step 9: Update Middleware (Optional - for auth)

If you want authentication, update `middleware.ts`:

```typescript
import { updateSession } from '@/lib/supabase/middleware';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

---

## Step 10: Set Up Row Level Security (RLS)

The schema already includes RLS policies, but you need to enable them:

1. In Supabase dashboard, go to **Authentication** → **Policies**
2. Verify that policies are enabled for:
   - `chats`
   - `messages`
   - `projects`
   - `artifacts`
   - etc.

3. For development/testing, you can temporarily disable RLS:

```sql
-- DISABLE RLS (ONLY FOR TESTING!)
ALTER TABLE chats DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
-- ... etc

-- Re-enable before production!
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
```

---

## Step 11: Seed Test Data (Optional)

Create some test data to work with:

```sql
-- Insert a test user profile (you'll need a real auth.users id)
INSERT INTO profiles (id, username, full_name)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'test_user',
  'Test User'
);

-- Create a test chat
INSERT INTO chats (id, user_id, title)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'Test ESP32 Project'
)
RETURNING id;

-- Add a test message
INSERT INTO messages (
  chat_id,
  role,
  content,
  sequence_number,
  agent_name,
  agent_icon
)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'user',
  'I want to build a weather station',
  1,
  NULL,
  NULL
);
```

---

## Step 12: Verify Everything Works

Run these queries in the SQL Editor:

```sql
-- Check tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should return: activity_log, artifact_versions, artifacts, 
-- attachments, chat_forks, chats, circuit_verifications, 
-- code_files, connections, datasheet_analyses, messages, 
-- parts, profiles, projects, shared_chats

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check triggers
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

## 🎉 You're All Set!

Your Supabase database is now ready for OHM!

### Next Steps:

1. ✅ Database schema created
2. ✅ Storage buckets configured
3. ✅ Environment variables set
4. ⏭️ **Build API routes** (I can help with this!)
5. ⏭️ **Integrate with multi-agent system**
6. ⏭️ **Build chat UI with real data**

---

## 🐛 Troubleshooting

### Issue: "relation does not exist"
- Make sure you ran the entire schema SQL
- Check which tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public'`

### Issue: "permission denied"
- Check RLS policies are correct
- For testing, you can disable RLS temporarily

### Issue: "CORS error"
- Make sure you're using the correct Supabase URL
- Check that your domain is allowed in Supabase → Settings → API → "Redirect URLs"

### Issue: Types not working
- Run `supabase gen types` again
- Make sure the import path is correct: `import type { Database } from '@/lib/supabase/types'`

---

## 📚 Useful Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**Ready to build? Let me know if you want me to help set this up!** 🚀
