# 🎯 OHM Database Quick Reference

One-page cheat sheet for the OHM database architecture.

---

## 📁 Files You Have

| File | Lines | Purpose |
|------|-------|---------|
| `DATABASE_SCHEMA.sql` | 750+ | Complete PostgreSQL schema - run this in Supabase |
| `DATABASE_ARCHITECTURE.md` | Full guide | How everything works |
| `SUPABASE_SETUP.md` | Step-by-step | How to set it up |
| `DATABASE_COMPARISON.md` | Comparison | OHM vs Claude/ChatGPT |
| `DATABASE_VISUAL_GUIDE.md` | Visual | ERD + data flow |
| `DATABASE_SUMMARY.md` | Executive summary | TL;DR + next steps |

---

## 🗂️ Core Tables (15 Total)

```
👤 profiles          - User data
💬 chats             - Conversation containers (unique URLs!)
📨 messages          - All conversation history
🎨 artifacts         - Versioned outputs (BOM, code, wiring)
📝 artifact_versions - Git-style version history
🔧 projects          - Hardware specifications
📦 parts             - BOM components
🔌 connections       - Wiring diagrams
💻 code_files        - Generated firmware
👁️ circuit_verifications - AI vision analysis
📄 datasheet_analyses     - AI document parsing
📎 attachments       - User uploads
🔗 shared_chats      - Public sharing
🍴 chat_forks        - Collaboration tracking
📊 activity_log      - Event tracking
```

---

## 🔗 Key Relationships

```
profiles (1) ────────────────> (N) chats
chats (1) ───────────────────> (N) messages
chats (1) ───────────────────> (N) artifacts
artifacts (1) ───────────────> (N) artifact_versions
chats (1) ───────────────────> (1) projects
projects (1) ────────────────> (N) parts
projects (1) ────────────────> (N) connections
projects (1) ────────────────> (N) code_files
```

---

## 🎯 Unique URLs

```
Chat URL:    /chat/550e8400-e29b-41d4-a716-446655440000
             └────┬────┘ └────────────────┬──────────────┘
              Route            chat.id (UUID)

Share URL:   /share/abc123xyz
             └────┬────┘ └──┬──┘
              Route    share_token

Project URL: /project/660f9500-e29b-41d4-a716-446655440000
             └────┬────┘ └────────────────┬──────────────┘
              Route            project.id (UUID)
```

---

## 💾 Storage Strategy

```
PostgreSQL (15 tables)
├── All structured data
├── Chat history, artifacts, projects
└── Full-text search enabled

Supabase Storage (3 buckets)
├── attachments/         (Circuit photos, user uploads)
├── circuit_verifications/ (AI analysis results)
└── exports/             (Project exports: BOM CSV, code ZIP)
```

---

## 🤖 Multi-Agent Tracking

```typescript
message {
  agent_name: 'bomGenerator'     // Which agent
  agent_model: 'openai/o1'       // Which model
  agent_icon: '📦'               // UI display
  intent: 'BOM'                  // What user wanted
  input_tokens: 2500             // Cost tracking
  output_tokens: 1800
}
```

**Agents**: orchestrator, conversational, bomGenerator, codeGenerator, wiringDiagram, circuitVerifier, datasheetAnalyzer, budgetOptimizer

---

## 📊 Example Queries

### Load Chat with Everything

```typescript
const { data } = await supabase
  .from('chats')
  .select(`
    *,
    messages (*),
    artifacts (
      *,
      artifact_versions!inner (*)
    ),
    project:projects (
      *,
      parts (*),
      connections (*)
    )
  `)
  .eq('id', chatId)
  .single();
```

### Create New Chat

```typescript
const { data } = await supabase
  .from('chats')
  .insert({ user_id: userId, title: 'New Project' })
  .select()
  .single();

// Navigate to: /chat/${data.id}
```

### Send Message

```typescript
await supabase
  .from('messages')
  .insert({
    chat_id: chatId,
    role: 'user',
    content: 'Build ESP32 weather station',
    sequence_number: nextSeq
  });
```

### Create Artifact with Version

```typescript
const { data: artifact } = await supabase.rpc(
  'create_artifact_with_version',
  {
    p_chat_id: chatId,
    p_project_id: projectId,
    p_type: 'bom',
    p_title: 'Weather Station BOM',
    p_content_json: { components: [...] }
  }
);
```

### Search Chats

```typescript
const { data } = await supabase
  .rpc('search_chats', {
    p_user_id: userId,
    p_query: 'ESP32 weather',
    p_limit: 10
  });
```

---

## 🎨 Artifact Types

```typescript
type ArtifactType = 
  | 'context'           // Project Context Document
  | 'mvp'              // MVP Specification
  | 'prd'              // Product Requirements Document
  | 'bom'              // Bill of Materials
  | 'code'             // Generated code file
  | 'wiring'           // Wiring diagram/instructions
  | 'circuit_diagram'  // Visual circuit diagram
  | 'budget'           // Budget analysis
  | 'datasheet_analysis' // Parsed datasheet
  | 'overview';        // Project overview
```

---

## 🔐 Row-Level Security

```sql
-- Users can only see their own chats or public ones
CREATE POLICY "view_accessible_chats" ON chats
FOR SELECT USING (
  auth.uid() = user_id OR is_public = true
);

-- Users can only insert messages in their own chats
CREATE POLICY "insert_own_messages" ON messages
FOR INSERT WITH CHECK (
  chat_id IN (SELECT id FROM chats WHERE user_id = auth.uid())
);
```

---

## ⚡ Performance Features

### Indexes (30+)
```sql
idx_chats_user_recent       - Fast chat loading
idx_messages_chat_seq       - Fast message ordering
idx_messages_search         - Full-text search
idx_artifacts_chat_id       - Fast artifact lookup
idx_parts_project_id        - Fast BOM loading
```

### Triggers (10+)
```sql
update_chat_last_message()  - Auto-update chat timestamp
auto_generate_chat_title()  - First message → title
update_updated_at_column()  - Auto-update timestamps
```

### Functions (3)
```sql
create_new_chat()                    - Create chat with initial message
create_artifact_with_version()       - Create artifact + v1
search_chats()                       - Full-text search
```

---

## 📈 Scaling Path

```
0-10K messages:     Works perfectly out of the box
10K-100K:           Still great, no changes needed
100K-1M:            Add query optimization, caching
1M-10M:             Add monthly partitioning
10M+:               Add read replicas, cold storage
```

---

## 💰 Supabase Costs

```
FREE TIER (Perfect for MVP/Hackathon):
├── 500 MB database storage
├── 2 GB file storage
├── 50K monthly active users
└── $0/month

PRO TIER (When you grow):
├── 8 GB database storage
├── 100 GB file storage
├── 250K monthly active users
└── $25/month
```

---

## 🚀 Setup in 3 Steps

### 1. Create Supabase Project
```bash
1. Go to supabase.com
2. Click "New Project"
3. Wait 2 minutes
```

### 2. Run Schema
```sql
-- In Supabase SQL Editor
-- Paste entire DATABASE_SCHEMA.sql
-- Click "Run"
```

### 3. Set Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**That's it! You're ready to go.** 🎉

---

## 🔧 TypeScript Types

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase';

const supabase = createClient<Database>(url, key);

// Auto-complete for all tables! 
// ✅ chats, messages, artifacts, parts, etc.
```

Generate types:
```bash
supabase gen types typescript --project-id YOUR_ID > lib/supabase/types.ts
```

---

## 📊 Common Patterns

### Pattern 1: Create Chat → Send Message → Get Response

```typescript
// 1. Create chat
const { data: chat } = await supabase
  .from('chats')
  .insert({ user_id })
  .select()
  .single();

// 2. Send message
await supabase.from('messages').insert({
  chat_id: chat.id,
  role: 'user',
  content: userInput,
  sequence_number: 1
});

// 3. Call agent, then store response
await supabase.from('messages').insert({
  chat_id: chat.id,
  role: 'assistant',
  content: agentResponse,
  agent_name: 'conversational',
  sequence_number: 2
});
```

### Pattern 2: Create Artifact → Add Version

```typescript
// 1. Create artifact
const { data: artifact } = await supabase
  .from('artifacts')
  .insert({
    chat_id,
    type: 'bom',
    title: 'My BOM',
    current_version: 1
  })
  .select()
  .single();

// 2. Add version 1
await supabase.from('artifact_versions').insert({
  artifact_id: artifact.id,
  version_number: 1,
  content_json: bomData
});
```

### Pattern 3: Update Artifact → New Version

```typescript
// 1. Get current version
const current = await supabase
  .from('artifact_versions')
  .select('*')
  .eq('artifact_id', artifactId)
  .eq('version_number', currentVersion)
  .single();

// 2. Create new version
await supabase.from('artifact_versions').insert({
  artifact_id: artifactId,
  version_number: currentVersion + 1,
  content_json: updatedData,
  parent_version_id: current.data.id,
  change_summary: 'What changed'
});

// 3. Update artifact pointer
await supabase
  .from('artifacts')
  .update({ 
    current_version: currentVersion + 1,
    total_versions: currentVersion + 1 
  })
  .eq('id', artifactId);
```

---

## 🎯 What Makes This Special

| Feature | Traditional | OHM Supabase |
|---------|-------------|--------------|
| **Databases** | PostgreSQL + MongoDB + Redis | PostgreSQL only |
| **Complexity** | High | Low |
| **ACID Transactions** | Partial | Full |
| **JOINs** | Limited | Unlimited |
| **Cost (MVP)** | ~$50/month | $0/month |
| **Real-time** | Custom WebSocket | Built-in |
| **Full-text Search** | ElasticSearch | Built-in |
| **File Storage** | S3 | Built-in |
| **Auth** | Custom | Built-in |
| **Setup Time** | Days | 15 minutes |

---

## ✅ Checklist

```
□ Read DATABASE_SUMMARY.md
□ Create Supabase project
□ Run DATABASE_SCHEMA.sql
□ Set up storage buckets
□ Add environment variables
□ Generate TypeScript types
□ Test with sample queries
□ Integrate with agents
□ Build UI components
□ Deploy! 🚀
```

---

## 🆘 Quick Troubleshooting

**Problem**: "relation does not exist"  
**Fix**: Run the schema SQL again

**Problem**: "permission denied"  
**Fix**: Check RLS policies or disable RLS for testing

**Problem**: Types not working  
**Fix**: `supabase gen types typescript --project-id XXX > lib/supabase/types.ts`

**Problem**: CORS errors  
**Fix**: Check Supabase URL is correct

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

**You're all set! Time to build! 🛠️**
