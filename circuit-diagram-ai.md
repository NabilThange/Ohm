# Circuit Diagram AI Generation - Implementation Plan

**Created:** 2026-01-24  
**Project Type:** FEATURE ENHANCEMENT (Web App)  
**Estimated Timeline:** 2.5 days  
**Primary Agent:** `backend-specialist`

---

## 📋 OVERVIEW

### What We're Building

Add AI-powered Fritzing-style circuit diagram generation to OHM's existing Wiring Specialist agent. When users describe circuits, the system will automatically generate professional breadboard diagrams using Google Imagen 4 via BYTEZ API.

### Why This Matters

- **User Value:** Visual breadboard diagrams help beginners understand circuit assembly
- **Differentiation:** Combines text instructions + schematic + realistic breadboard view
- **Low Risk:** Builds on existing infrastructure (BYTEZ API, Supabase, background processing)
- **Fast Delivery:** Leverages proven patterns already in codebase

### Current State

✅ **Already Working:**
- Wiring Specialist agent generates text instructions
- SVG schematic generation (fast, instant feedback)
- Background processing pattern (conversation summarizer)
- Supabase real-time subscriptions for live updates
- BYTEZ API integration with multi-key failover

❌ **Missing:**
- AI breadboard image generation
- Queue system for rate-limited API (1 req/sec)
- Frontend display for generated diagrams
- Caching for common circuits

---

## 🎯 SUCCESS CRITERIA

| Criterion | Measurement |
|-----------|-------------|
| **Functional** | User describes circuit → sees breadboard diagram within 2 minutes |
| **Quality** | 90%+ of diagrams are clear and usable (user feedback) |
| **Performance** | Respects 1 req/sec BYTEZ limit, no API errors |
| **Cost** | ~$0.05-0.08 per diagram (acceptable within existing budget) |
| **Reliability** | 95%+ generation success rate |
| **UX** | Loading states, error handling, retry functionality |

---

## 🛠️ TECH STACK

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **AI Image Generation** | Google Imagen 4 via BYTEZ API | Already integrated, supports image generation |
| **Queue System** | Supabase table + Vercel Cron | Serverless-compatible, uses existing infrastructure |
| **Storage** | Supabase Storage | Already configured, free tier sufficient |
| **Real-time Updates** | Supabase Realtime | Already implemented for artifacts |
| **Frontend** | React 19 + TypeScript | Existing stack |
| **Prompt Engineering** | Few-shot learning with reference images | Best quality for AI generation |

**Why NOT Custom Fritzing Renderer:**
- 15-20 days development time vs 2.5 days
- Complex wire routing algorithms
- Ongoing maintenance burden
- AI approach achieves 90% quality with 5% of effort

---

## 📁 FILE STRUCTURE

```
OHM/
├── lib/
│   ├── diagram-generation/
│   │   ├── prompt-builder.ts          # NEW - Builds AI prompts
│   │   ├── reference-library.ts       # NEW - Fritzing example images
│   │   └── circuit-formatter.ts       # NEW - JSON to text conversion
│   │
│   ├── services/
│   │   ├── diagram-generator.ts       # NEW - Main generation service
│   │   └── diagram-cache.ts           # NEW - Circuit hashing & caching
│   │
│   └── agents/
│       └── specialist-agents.ts       # MODIFY - Update Wiring Specialist prompt
│
├── app/api/
│   ├── diagram/
│   │   └── route.ts                   # NEW - Diagram generation endpoint
│   │
│   └── cron/
│       └── process-diagrams/
│           └── route.ts               # NEW - Vercel cron job
│
├── components/
│   └── diagrams/
│       └── DiagramDisplay.tsx         # NEW - Diagram UI component
│
└── migrations/
    └── add_diagram_queue.sql          # NEW - Database schema
```

---

## 📊 TASK BREAKDOWN

### PHASE 1: ANALYSIS ✅ COMPLETE

**Status:** Completed during brainstorming session

**Key Decisions Made:**
- ✅ Use AI generation (not custom renderer)
- ✅ Google Imagen 4 via BYTEZ API
- ✅ Vercel Cron for queue processing
- ✅ Supabase for queue and storage
- ✅ 2.5-day timeline validated

---

### PHASE 2: PLANNING ✅ COMPLETE

**Status:** This document

---

### PHASE 3: SOLUTIONING (Architecture & Design)

**Timeline:** 2 hours

#### Task 3.1: Database Schema Design
**Agent:** `database-architect`  
**Skill:** `database-design`  
**Priority:** P0 (Foundation)  
**Dependencies:** None

**INPUT:**
- Current `artifact_versions` table schema
- Queue requirements (status tracking, retry logic)
- Caching requirements (circuit hash, URL storage)

**OUTPUT:**
```sql
-- Migration file: migrations/add_diagram_queue.sql
ALTER TABLE artifact_versions ADD COLUMN...
CREATE TABLE diagram_queue...
CREATE TABLE diagram_cache...
```

**VERIFY:**
- [ ] Run migration on local Supabase
- [ ] Verify columns exist: `fritzing_url`, `diagram_status`
- [ ] Verify indexes created for performance
- [ ] Test insert/update operations

---

#### Task 3.2: API Architecture Design
**Agent:** `backend-specialist`  
**Skill:** `api-patterns`  
**Priority:** P0 (Foundation)  
**Dependencies:** None

**INPUT:**
- BYTEZ API documentation
- Rate limit constraints (1 req/sec)
- Vercel serverless timeout limits

**OUTPUT:**
- API endpoint design document
- Request/response schemas
- Error handling strategy
- Rate limiting approach

**VERIFY:**
- [ ] Design reviewed for serverless compatibility
- [ ] Error cases documented
- [ ] Timeout handling strategy defined

---

#### Task 3.3: Prompt Engineering Strategy
**Agent:** `backend-specialist`  
**Skill:** `clean-code`  
**Priority:** P1 (Core)  
**Dependencies:** None

**INPUT:**
- Sample Fritzing diagrams (5-10 examples)
- Circuit JSON format from Wiring Specialist
- Google Imagen 4 capabilities

**OUTPUT:**
- Prompt template structure
- Reference image selection logic
- Component/connection formatting rules

**VERIFY:**
- [ ] Test prompt with 3 sample circuits
- [ ] Validate output quality (manual review)
- [ ] Iterate on prompt structure

---

### PHASE 4: IMPLEMENTATION

**Timeline:** 1.5 days (12 hours)

---

#### Task 4.1: Database Migration
**Agent:** `database-architect`  
**Skill:** `database-design`  
**Priority:** P0 (Foundation)  
**Dependencies:** Task 3.1  
**Estimated Time:** 30 minutes

**INPUT:**
- SQL migration file from Task 3.1
- Supabase project credentials

**OUTPUT:**
```sql
-- File: migrations/add_diagram_queue.sql

-- Add diagram fields to artifact_versions
ALTER TABLE artifact_versions 
ADD COLUMN IF NOT EXISTS fritzing_url TEXT,
ADD COLUMN IF NOT EXISTS diagram_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS generation_attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Create diagram queue table
CREATE TABLE IF NOT EXISTS diagram_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_json JSONB NOT NULL,
  artifact_id UUID NOT NULL REFERENCES artifact_versions(id),
  chat_id UUID NOT NULL REFERENCES chats(id),
  status TEXT DEFAULT 'queued', -- queued, processing, complete, failed
  created_at TIMESTAMP DEFAULT now(),
  processed_at TIMESTAMP,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_queue_status ON diagram_queue(status, created_at);

-- Create diagram cache table
CREATE TABLE IF NOT EXISTS diagram_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_hash TEXT UNIQUE NOT NULL,
  fritzing_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now(),
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_circuit_hash ON diagram_cache(circuit_hash);

-- Create Supabase Storage bucket (run via Supabase dashboard)
-- Bucket name: circuit-diagrams
-- Public: true
```

**VERIFY:**
- [ ] Run migration: `psql -f migrations/add_diagram_queue.sql`
- [ ] Verify tables exist: `\dt diagram_*`
- [ ] Verify columns added to artifact_versions
- [ ] Create Supabase Storage bucket via dashboard
- [ ] Test bucket public access

---

#### Task 4.2: Prompt Builder Service
**Agent:** `backend-specialist`  
**Skill:** `clean-code`  
**Priority:** P1 (Core)  
**Dependencies:** Task 3.3  
**Estimated Time:** 2 hours

**INPUT:**
- Circuit JSON format from Wiring Specialist
- Prompt engineering strategy from Task 3.3

**OUTPUT:**
```typescript
// File: lib/diagram-generation/prompt-builder.ts

export interface CircuitJson {
  components: Array<{
    id: string;
    type: string;
    properties?: Record<string, any>;
  }>;
  connections: Array<{
    from: string;
    to: string;
    color?: string;
  }>;
}

export function buildFritzingPrompt(circuitJson: CircuitJson): {
  prompt: string;
  referenceType: string;
} {
  const componentCount = circuitJson.components.length;
  const referenceType = selectReferenceType(componentCount);
  
  const prompt = `
Generate a professional breadboard circuit diagram in Fritzing style.

EXACT STYLE TO MATCH:
- Reference the attached Fritzing example images
- Realistic breadboard with visible hole grid pattern
- Proper component graphics (Arduino boards, LEDs, resistors, sensors)
- Color-coded jumper wires: Red=5V, Black=GND, Yellow/Green=Signal
- Clean, organized layout with good spacing
- Professional quality suitable for electronics tutorials

CIRCUIT SPECIFICATIONS:
${formatComponents(circuitJson.components)}

CONNECTIONS:
${formatConnections(circuitJson.connections)}

LAYOUT REQUIREMENTS:
- Arduino/main board positioned at top-left of breadboard
- Power rails clearly visible on breadboard sides (red=positive, blue=negative)
- Components arranged left-to-right in logical signal flow order
- Wires should follow breadboard rows/columns, minimal crossing
- Clear spacing between components (at least 2-3 holes)
- All component labels clearly readable

OUTPUT REQUIREMENTS:
- High resolution (1792x1024px minimum)
- Good lighting, no shadows or reflections
- All text labels clearly legible
- Professional presentation quality matching reference images
- Breadboard should be tan/beige color with white text
- Components should have realistic 3D appearance
`;

  return { prompt, referenceType };
}

function selectReferenceType(componentCount: number): string {
  if (componentCount <= 3) return 'simple';
  if (componentCount <= 6) return 'moderate';
  return 'complex';
}

function formatComponents(components: CircuitJson['components']): string {
  return components.map((c, i) => 
    `${i + 1}. ${c.type} (ID: ${c.id})${
      c.properties ? ` - ${JSON.stringify(c.properties)}` : ''
    }`
  ).join('\n');
}

function formatConnections(connections: CircuitJson['connections']): string {
  return connections.map((conn, i) =>
    `${i + 1}. ${conn.color || 'Wire'} from ${conn.from} to ${conn.to}`
  ).join('\n');
}
```

**VERIFY:**
- [ ] TypeScript compiles without errors
- [ ] Test with sample circuit JSON
- [ ] Validate prompt output format
- [ ] Check prompt length (< 4000 chars)

---

#### Task 4.3: Reference Library Setup
**Agent:** `backend-specialist`  
**Skill:** `clean-code`  
**Priority:** P1 (Core)  
**Dependencies:** None  
**Estimated Time:** 1 hour

**INPUT:**
- 5-10 Fritzing example diagrams (download from Fritzing website or create)

**OUTPUT:**
```typescript
// File: lib/diagram-generation/reference-library.ts

export const FRITZING_REFERENCES = {
  simple: {
    name: 'Simple LED Circuit',
    url: 'https://your-supabase-storage/references/led-blink.png',
    description: 'Arduino + LED + Resistor'
  },
  moderate: {
    name: 'Sensor Circuit',
    url: 'https://your-supabase-storage/references/dht11-sensor.png',
    description: 'Arduino + DHT11 + LCD'
  },
  complex: {
    name: 'Multi-Component Circuit',
    url: 'https://your-supabase-storage/references/servo-ultrasonic.png',
    description: 'Arduino + Servo + Ultrasonic + LEDs'
  }
};

export function getReferenceImage(type: keyof typeof FRITZING_REFERENCES): string {
  return FRITZING_REFERENCES[type].url;
}
```

**VERIFY:**
- [ ] Upload 3-5 reference images to Supabase Storage
- [ ] Verify public URLs work
- [ ] Test image loading in browser

---

#### Task 4.4: Diagram Generator Service
**Agent:** `backend-specialist`  
**Skill:** `clean-code`  
**Priority:** P1 (Core)  
**Dependencies:** Task 4.2, Task 4.3  
**Estimated Time:** 3 hours

**INPUT:**
- BYTEZ API credentials
- Prompt builder from Task 4.2
- Reference library from Task 4.3

**OUTPUT:**
```typescript
// File: lib/services/diagram-generator.ts

import { createClient } from '@supabase/supabase-js';
import { buildFritzingPrompt, CircuitJson } from '../diagram-generation/prompt-builder';
import { getReferenceImage } from '../diagram-generation/reference-library';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function generateFritzingDiagram(
  circuitJson: CircuitJson,
  artifactId: string,
  chatId: string
): Promise<string> {
  try {
    // 1. Build prompt
    const { prompt, referenceType } = buildFritzingPrompt(circuitJson);
    
    // 2. Call BYTEZ API for image generation
    const imageUrl = await callBytezImageAPI(prompt, referenceType);
    
    // 3. Download image from temporary URL
    const imageBuffer = await fetch(imageUrl).then(r => r.arrayBuffer());
    
    // 4. Upload to Supabase Storage
    const filename = `diagrams/${artifactId}-${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from('circuit-diagrams')
      .upload(filename, imageBuffer, {
        contentType: 'image/png',
        cacheControl: '3600'
      });
    
    if (uploadError) throw uploadError;
    
    // 5. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('circuit-diagrams')
      .getPublicUrl(filename);
    
    // 6. Update artifact_versions
    await supabase
      .from('artifact_versions')
      .update({
        fritzing_url: publicUrl,
        diagram_status: 'complete',
        updated_at: new Date().toISOString()
      })
      .eq('id', artifactId);
    
    return publicUrl;
    
  } catch (error) {
    console.error('Diagram generation failed:', error);
    
    // Mark as failed
    await supabase
      .from('artifact_versions')
      .update({
        diagram_status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
      .eq('id', artifactId);
    
    throw error;
  }
}

async function callBytezImageAPI(prompt: string, referenceType: string): Promise<string> {
  const response = await fetch('https://api.bytez.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.BYTEZ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'google/imagen-4',  // Verify exact model name with BYTEZ docs
      prompt: prompt,
      n: 1,
      size: '1792x1024',
      quality: 'hd'
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`BYTEZ API error: ${error}`);
  }
  
  const data = await response.json();
  return data.data[0].url;  // Temporary URL valid for 1 hour
}
```

**VERIFY:**
- [ ] Test with sample circuit JSON
- [ ] Verify image uploaded to Supabase Storage
- [ ] Check public URL works
- [ ] Validate database update
- [ ] Test error handling (invalid API key, network failure)

---

#### Task 4.5: Circuit Caching Service
**Agent:** `backend-specialist`  
**Skill:** `clean-code`  
**Priority:** P2 (Optimization)  
**Dependencies:** Task 4.4  
**Estimated Time:** 1 hour

**INPUT:**
- Circuit JSON format
- Diagram cache table schema

**OUTPUT:**
```typescript
// File: lib/services/diagram-cache.ts

import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { CircuitJson } from '../diagram-generation/prompt-builder';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export function hashCircuit(circuitJson: CircuitJson): string {
  // Normalize JSON (sort keys, remove whitespace)
  const normalized = JSON.stringify(
    circuitJson,
    Object.keys(circuitJson).sort()
  );
  return crypto.createHash('md5').update(normalized).digest('hex');
}

export async function getCachedDiagram(circuitHash: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('diagram_cache')
    .select('fritzing_url')
    .eq('circuit_hash', circuitHash)
    .single();
  
  if (error || !data) return null;
  
  // Update access count and timestamp
  await supabase
    .from('diagram_cache')
    .update({
      access_count: supabase.rpc('increment', { row_id: data.id }),
      last_accessed_at: new Date().toISOString()
    })
    .eq('circuit_hash', circuitHash);
  
  return data.fritzing_url;
}

export async function cacheDiagram(
  circuitHash: string,
  fritzingUrl: string
): Promise<void> {
  await supabase
    .from('diagram_cache')
    .insert({
      circuit_hash: circuitHash,
      fritzing_url: fritzingUrl
    })
    .onConflict('circuit_hash')
    .ignore();  // Don't overwrite if already exists
}
```

**VERIFY:**
- [ ] Test circuit hashing (same circuit = same hash)
- [ ] Test cache retrieval
- [ ] Test cache insertion
- [ ] Verify access count increments

---

#### Task 4.6: Vercel Cron Job for Queue Processing
**Agent:** `backend-specialist`  
**Skill:** `server-management`  
**Priority:** P1 (Core)  
**Dependencies:** Task 4.1, Task 4.4  
**Estimated Time:** 2 hours

**INPUT:**
- Diagram queue table
- Diagram generator service
- Vercel cron configuration

**OUTPUT:**
```typescript
// File: app/api/cron/process-diagrams/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateFritzingDiagram } from '@/lib/services/diagram-generator';
import { hashCircuit, getCachedDiagram, cacheDiagram } from '@/lib/services/diagram-cache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: Request) {
  // Verify cron secret (security)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  try {
    // Get pending diagrams (limit to 60 per minute = 1 per second)
    const { data: pending, error } = await supabase
      .from('diagram_queue')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(60);
    
    if (error) throw error;
    if (!pending || pending.length === 0) {
      return NextResponse.json({ message: 'Queue empty', processed: 0 });
    }
    
    let processed = 0;
    
    // Process each job with 1-second delay
    for (let i = 0; i < pending.length; i++) {
      const job = pending[i];
      
      try {
        // Mark as processing
        await supabase
          .from('diagram_queue')
          .update({ status: 'processing' })
          .eq('id', job.id);
        
        // Check cache first
        const circuitHash = hashCircuit(job.circuit_json);
        let diagramUrl = await getCachedDiagram(circuitHash);
        
        if (diagramUrl) {
          // Use cached diagram
          await supabase
            .from('artifact_versions')
            .update({
              fritzing_url: diagramUrl,
              diagram_status: 'complete'
            })
            .eq('id', job.artifact_id);
        } else {
          // Generate new diagram
          diagramUrl = await generateFritzingDiagram(
            job.circuit_json,
            job.artifact_id,
            job.chat_id
          );
          
          // Cache it
          await cacheDiagram(circuitHash, diagramUrl);
        }
        
        // Mark job complete
        await supabase
          .from('diagram_queue')
          .update({
            status: 'complete',
            processed_at: new Date().toISOString()
          })
          .eq('id', job.id);
        
        processed++;
        
        // Wait 1 second before next request (rate limit)
        if (i < pending.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`Job ${job.id} failed:`, error);
        
        // Mark as failed
        await supabase
          .from('diagram_queue')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error'
          })
          .eq('id', job.id);
      }
    }
    
    return NextResponse.json({
      success: true,
      processed,
      total: pending.length
    });
    
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

```json
// File: vercel.json (add to project root)
{
  "crons": [{
    "path": "/api/cron/process-diagrams",
    "schedule": "* * * * *"
  }]
}
```

**VERIFY:**
- [ ] Add `CRON_SECRET` to `.env.local` and Vercel dashboard
- [ ] Test cron endpoint locally: `curl -H "Authorization: Bearer SECRET" http://localhost:3000/api/cron/process-diagrams`
- [ ] Verify queue processing logic
- [ ] Test rate limiting (1 req/sec)
- [ ] Deploy to Vercel and check cron logs

---

#### Task 4.7: Update Wiring Specialist Agent
**Agent:** `backend-specialist`  
**Skill:** `clean-code`  
**Priority:** P1 (Core)  
**Dependencies:** None  
**Estimated Time:** 1 hour

**INPUT:**
- Current Wiring Specialist system prompt
- Circuit JSON format requirements

**OUTPUT:**
```typescript
// File: lib/agents/specialist-agents.ts (MODIFY)

// Find wiringSpecialist configuration and update systemPrompt:

export const wiringSpecialist = {
  name: 'Wiring Specialist',
  model: 'anthropic/claude-sonnet-4-5',
  temperature: 0.15,
  maxTokens: 4000,
  systemPrompt: `You are a hardware wiring expert who creates clear, safe wiring instructions.

Your role:
1. Analyze circuit requirements
2. Generate step-by-step wiring instructions
3. Identify potential safety issues
4. Output structured circuit JSON for diagram generation

CRITICAL: After providing wiring instructions, ALWAYS output a circuit JSON block:

<circuit_json>
{
  "components": [
    {"id": "unique_id", "type": "Arduino Uno R3"},
    {"id": "unique_id", "type": "LED", "properties": {"color": "red"}},
    {"id": "unique_id", "type": "Resistor", "properties": {"value": "220Ω"}}
  ],
  "connections": [
    {"from": "arduino1.D13", "to": "r1.pin1", "color": "yellow"},
    {"from": "r1.pin2", "to": "led1.anode", "color": "yellow"},
    {"from": "led1.cathode", "to": "arduino1.GND", "color": "black"}
  ]
}
</circuit_json>

Component ID rules:
- Use descriptive IDs: arduino1, led1, r1, sensor1
- Pin format: component_id.PIN_NAME (e.g., "arduino1.D13", "led1.anode")

Wire color conventions:
- Red: 5V power
- Black: Ground (GND)
- Yellow/Green: Signal wires
- Blue: 3.3V power (if applicable)

This JSON will be used to generate a professional breadboard diagram automatically.`,
  
  tools: ['update_wiring']
};
```

**VERIFY:**
- [ ] Test agent response includes `<circuit_json>` block
- [ ] Validate JSON format
- [ ] Check component IDs are descriptive
- [ ] Verify wire colors follow conventions

---

#### Task 4.8: Diagram Queue API Endpoint
**Agent:** `backend-specialist`  
**Skill:** `api-patterns`  
**Priority:** P1 (Core)  
**Dependencies:** Task 4.1, Task 4.7  
**Estimated Time:** 1 hour

**INPUT:**
- Circuit JSON from Wiring Specialist
- Diagram queue table

**OUTPUT:**
```typescript
// File: app/api/diagram/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: Request) {
  try {
    const { circuitJson, artifactId, chatId } = await req.json();
    
    // Validate input
    if (!circuitJson || !artifactId || !chatId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Mark artifact as queued
    await supabase
      .from('artifact_versions')
      .update({ diagram_status: 'queued' })
      .eq('id', artifactId);
    
    // Add to queue
    const { data, error } = await supabase
      .from('diagram_queue')
      .insert({
        circuit_json: circuitJson,
        artifact_id: artifactId,
        chat_id: chatId,
        status: 'queued'
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json({
      success: true,
      jobId: data.id,
      status: 'queued',
      message: 'Diagram generation queued. Will be ready within 1-2 minutes.'
    });
    
  } catch (error) {
    console.error('Queue API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```

**VERIFY:**
- [ ] Test POST request with sample circuit JSON
- [ ] Verify queue entry created
- [ ] Check artifact status updated to 'queued'
- [ ] Test error handling (missing fields, invalid JSON)

---

#### Task 4.9: Extract Circuit JSON from Agent Response
**Agent:** `backend-specialist`  
**Skill:** `clean-code`  
**Priority:** P1 (Core)  
**Dependencies:** Task 4.7, Task 4.8  
**Estimated Time:** 30 minutes

**INPUT:**
- Wiring Specialist response format
- Diagram queue API endpoint

**OUTPUT:**
```typescript
// File: lib/agents/orchestrator.ts (MODIFY)

// Add this helper function:

function extractCircuitJson(response: string): any | null {
  const match = response.match(/<circuit_json>(.*?)<\/circuit_json>/s);
  if (!match) return null;
  
  try {
    return JSON.parse(match[1].trim());
  } catch (error) {
    console.error('Failed to parse circuit JSON:', error);
    return null;
  }
}

// In the Wiring Specialist response handler, add:

if (selectedAgent === 'wiringSpecialist') {
  // ... existing code ...
  
  // After agent responds, extract circuit JSON
  const circuitJson = extractCircuitJson(fullResponse);
  
  if (circuitJson) {
    // Trigger diagram generation (don't wait)
    fetch('/api/diagram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        circuitJson,
        artifactId: currentArtifactId,  // Get from tool execution
        chatId: chatId
      })
    }).catch(err => console.error('Failed to queue diagram:', err));
  }
}
```

**VERIFY:**
- [ ] Test with Wiring Specialist response
- [ ] Verify circuit JSON extracted correctly
- [ ] Check diagram queue API called
- [ ] Validate error handling (malformed JSON)

---

#### Task 4.10: Diagram Display Component
**Agent:** `frontend-specialist`  
**Skill:** `react-patterns`  
**Priority:** P2 (UI)  
**Dependencies:** Task 4.4  
**Estimated Time:** 2 hours

**INPUT:**
- Diagram URL from artifact_versions
- Diagram status (queued, generating, complete, failed)

**OUTPUT:**
```typescript
// File: components/diagrams/DiagramDisplay.tsx

'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Loader2, Download, RefreshCw } from 'lucide-react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface DiagramDisplayProps {
  artifactId: string;
  initialUrl?: string;
  initialStatus?: string;
}

export function DiagramDisplay({
  artifactId,
  initialUrl,
  initialStatus = 'pending'
}: DiagramDisplayProps) {
  const [url, setUrl] = useState(initialUrl);
  const [status, setStatus] = useState(initialStatus);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to artifact updates
    const subscription = supabase
      .channel(`artifact-${artifactId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artifact_versions',
          filter: `id=eq.${artifactId}`
        },
        (payload) => {
          const newData = payload.new as any;
          setUrl(newData.fritzing_url);
          setStatus(newData.diagram_status);
          setError(newData.error_message);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [artifactId]);

  const handleDownload = async () => {
    if (!url) return;
    
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `circuit-diagram-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleRetry = async () => {
    // Re-queue the diagram generation
    setStatus('queued');
    setError(null);
    
    // Call retry API endpoint (implement if needed)
    // For now, user can refresh page
  };

  if (status === 'queued' || status === 'generating') {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        <div>
          <p className="font-medium text-blue-900 dark:text-blue-100">
            Generating professional breadboard diagram...
          </p>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This may take 1-2 minutes. The diagram will appear automatically.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <p className="font-medium text-red-900 dark:text-red-100 mb-2">
          Diagram generation failed
        </p>
        {error && (
          <p className="text-sm text-red-700 dark:text-red-300 mb-3">
            {error}
          </p>
        )}
        <button
          onClick={handleRetry}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Retry Generation
        </button>
      </div>
    );
  }

  if (status === 'complete' && url) {
    return (
      <div className="space-y-3">
        <div className="relative rounded-lg overflow-hidden border border-border">
          <img
            src={url}
            alt="Circuit breadboard diagram"
            className="w-full h-auto"
          />
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download High-Res Diagram
        </button>
      </div>
    );
  }

  return null;
}
```

**VERIFY:**
- [ ] Test loading state display
- [ ] Test complete state with image
- [ ] Test failed state with retry
- [ ] Verify real-time updates work
- [ ] Test download functionality

---

#### Task 4.11: Integrate Diagram Display into WiringDrawer
**Agent:** `frontend-specialist`  
**Skill:** `react-patterns`  
**Priority:** P2 (UI)  
**Dependencies:** Task 4.10  
**Estimated Time:** 30 minutes

**INPUT:**
- Existing WiringDrawer component
- DiagramDisplay component

**OUTPUT:**
```typescript
// File: components/tools/WiringDrawer.tsx (MODIFY)

import { DiagramDisplay } from '@/components/diagrams/DiagramDisplay';

// In the WiringDrawer component, add after wiring instructions:

export function WiringDrawer({ chatId, isOpen, onClose }) {
  // ... existing code ...
  
  return (
    <ResizableDrawer isOpen={isOpen} onClose={onClose} title="Wiring Instructions">
      {/* Existing wiring instructions */}
      <div className="prose dark:prose-invert">
        {artifact?.content?.instructions}
      </div>
      
      {/* SVG Schematic (if exists) */}
      {artifact?.content?.diagram_svg && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Schematic Diagram</h3>
          <div dangerouslySetInnerHTML={{ __html: artifact.content.diagram_svg }} />
        </div>
      )}
      
      {/* NEW: Fritzing-style Breadboard Diagram */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3">Breadboard Diagram</h3>
        <DiagramDisplay
          artifactId={artifact?.id}
          initialUrl={artifact?.content?.fritzing_url}
          initialStatus={artifact?.content?.diagram_status}
        />
      </div>
    </ResizableDrawer>
  );
}
```

**VERIFY:**
- [ ] Test drawer displays diagram section
- [ ] Verify loading states show correctly
- [ ] Check real-time updates work
- [ ] Test on mobile viewport

---

### PHASE X: VERIFICATION

**Timeline:** 2 hours

---

#### Task X.1: Environment Configuration
**Priority:** P0  
**Dependencies:** All implementation tasks  
**Estimated Time:** 15 minutes

**CHECKLIST:**
- [ ] Add to `.env.local`:
  ```bash
  BYTEZ_API_KEY=your_key
  CRON_SECRET=random_secret_string
  SUPABASE_SERVICE_KEY=your_service_key
  ```
- [ ] Add same variables to Vercel dashboard (Settings → Environment Variables)
- [ ] Verify Supabase Storage bucket `circuit-diagrams` exists and is public

---

#### Task X.2: Database Verification
**Priority:** P0  
**Dependencies:** Task 4.1  
**Estimated Time:** 10 minutes

**CHECKLIST:**
- [ ] Run migration: `psql -f migrations/add_diagram_queue.sql`
- [ ] Verify tables exist:
  ```sql
  SELECT * FROM diagram_queue LIMIT 1;
  SELECT * FROM diagram_cache LIMIT 1;
  ```
- [ ] Verify artifact_versions columns:
  ```sql
  \d artifact_versions
  ```
- [ ] Test insert/update operations

---

#### Task X.3: API Endpoint Testing
**Priority:** P1  
**Dependencies:** Task 4.8  
**Estimated Time:** 20 minutes

**CHECKLIST:**
- [ ] Test diagram queue API:
  ```bash
  curl -X POST http://localhost:3000/api/diagram \
    -H "Content-Type: application/json" \
    -d '{
      "circuitJson": {"components": [], "connections": []},
      "artifactId": "test-id",
      "chatId": "test-chat"
    }'
  ```
- [ ] Verify queue entry created in database
- [ ] Test error handling (missing fields, invalid JSON)

---

#### Task X.4: Cron Job Testing
**Priority:** P1  
**Dependencies:** Task 4.6  
**Estimated Time:** 30 minutes

**CHECKLIST:**
- [ ] Test cron endpoint locally:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" \
    http://localhost:3000/api/cron/process-diagrams
  ```
- [ ] Add test job to queue manually
- [ ] Verify job processed and diagram generated
- [ ] Check rate limiting (1 req/sec)
- [ ] Deploy to Vercel and check cron logs

---

#### Task X.5: End-to-End User Flow
**Priority:** P1  
**Dependencies:** All tasks  
**Estimated Time:** 30 minutes

**CHECKLIST:**
- [ ] Start dev server: `npm run dev`
- [ ] Create new chat in OHM
- [ ] Ask Wiring Specialist: "Create wiring for Arduino with LED on pin 13"
- [ ] Verify wiring instructions appear
- [ ] Verify circuit JSON extracted
- [ ] Check diagram status shows "Generating..."
- [ ] Wait 1-2 minutes
- [ ] Verify diagram appears automatically
- [ ] Test download button
- [ ] Test retry on failure

---

#### Task X.6: Error Handling Verification
**Priority:** P1  
**Dependencies:** All tasks  
**Estimated Time:** 20 minutes

**CHECKLIST:**
- [ ] Test with invalid BYTEZ API key (should show error)
- [ ] Test with malformed circuit JSON (should handle gracefully)
- [ ] Test with network timeout (should retry)
- [ ] Test with Supabase Storage failure (should show error)
- [ ] Verify all errors logged to console

---

#### Task X.7: Performance Testing
**Priority:** P2  
**Dependencies:** All tasks  
**Estimated Time:** 15 minutes

**CHECKLIST:**
- [ ] Generate 5 diagrams in quick succession
- [ ] Verify queue processes them sequentially (1/sec)
- [ ] Check no API rate limit errors
- [ ] Verify caching works (same circuit = cached diagram)
- [ ] Monitor Supabase Storage usage

---

#### Task X.8: Code Quality
**Priority:** P1  
**Dependencies:** All tasks  
**Estimated Time:** 10 minutes

**CHECKLIST:**
- [ ] Run TypeScript check: `npx tsc --noEmit`
- [ ] Run linter: `npm run lint`
- [ ] Fix any warnings/errors
- [ ] Verify no console errors in browser

---

#### Task X.9: Documentation
**Priority:** P2  
**Dependencies:** All tasks  
**Estimated Time:** 10 minutes

**CHECKLIST:**
- [ ] Update `CONTEXT/ABOUT_OHM_AI_01.md` with diagram feature
- [ ] Add diagram generation to feature list
- [ ] Document BYTEZ API usage
- [ ] Add troubleshooting section

---

## ✅ PHASE X COMPLETE

**Final Checklist:**
- [ ] All tasks marked complete
- [ ] End-to-end flow tested successfully
- [ ] No critical errors in logs
- [ ] Feature deployed to production
- [ ] User documentation updated

**Completion Date:** _____________

---

## 🚀 DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] All environment variables added to Vercel
- [ ] Database migrations run on production Supabase
- [ ] Supabase Storage bucket created and public
- [ ] BYTEZ API key tested and working

### Deployment
- [ ] Push to main branch: `git push origin main`
- [ ] Verify Vercel auto-deploy succeeds
- [ ] Check Vercel cron job is scheduled
- [ ] Test production endpoint

### Post-Deployment
- [ ] Monitor Vercel logs for errors
- [ ] Check BYTEZ API usage/costs
- [ ] Monitor Supabase Storage usage
- [ ] Collect user feedback

---

## 📊 SUCCESS METRICS (Week 1)

| Metric | Target | Actual |
|--------|--------|--------|
| Generation Success Rate | >95% | ___% |
| Average Generation Time | <2 minutes | ___ seconds |
| User Satisfaction | >80% positive | ___% |
| API Cost per Diagram | <$0.10 | $____ |
| Cache Hit Rate | >20% | ___% |

---

## 🐛 KNOWN LIMITATIONS

1. **Rate Limit:** 1 diagram per second (acceptable for current scale)
2. **Quality Variance:** AI may produce inconsistent results (iterate on prompts)
3. **Cron Delay:** Up to 1-minute delay before processing starts
4. **No Real-time Processing:** Not instant like SVG schematic

**Future Enhancements:**
- Real-time queue processing (upgrade from cron to webhook)
- Custom post-processing (overlay labels, annotations)
- Multiple diagram styles (breadboard, schematic, PCB)
- Interactive diagram editor

---

## 📞 SUPPORT

**If issues arise:**
1. Check Vercel logs: `vercel logs`
2. Check Supabase logs in dashboard
3. Verify BYTEZ API status
4. Check cron job execution logs
5. Review error messages in `diagram_queue` table

**Common Issues:**
- **Diagrams not generating:** Check cron job is running
- **API errors:** Verify BYTEZ API key and quota
- **Storage errors:** Check Supabase Storage bucket permissions
- **Slow generation:** Normal for first few diagrams (cache builds up)

---

**END OF PLAN**
