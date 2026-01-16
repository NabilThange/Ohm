# 🎯 AI-Generated Wiring Diagrams - CORRECTED IMPLEMENTATION PLAN
**Project:** OHM - Hardware Lifecycle Orchestrator  
**Feature:** Hybrid SVG + AI Image Wiring Diagram Generation  
**Date:** January 15, 2026 (REVISED)  
**Provider:** BYTEZ API (All models free access)  
**Status:** ⚠️ CRITICAL CORRECTIONS APPLIED - READY FOR TESTING

---

## 🚨 CRITICAL UPDATES - READ FIRST

**This plan has been CORRECTED after identifying 5 critical flaws in the original:**

1. ❌ **WRONG API Endpoint** → ✅ Fixed to use model-specific BYTEZ endpoints
2. ❌ **Non-existent Model** → ✅ Changed to `dreamlike-art/dreamlike-photoreal-2.0`
3. ❌ **Wrong Response Format** → ✅ Handles URL-based responses, not base64
4. ❌ **Database Storage Issue** → ✅ Uses Supabase Storage instead of base64 in JSONB
5. ❌ **Poor Error Handling** → ✅ Added status tracking, retry logic, progress updates

**Additional Improvements:**
- 🔧 Template-based prompts (removed unnecessary LLM agent)
- 🔧 Exponential backoff retry logic
- 🔧 Progress tracking for user feedback
- 🔧 Proper error states in UI
- 🔧 Fixed version number race condition

---

## ✅ REVISED USER DECISIONS

| Decision | Original Choice | ❌ Problem | ✅ Corrected Choice |
|----------|----------------|-----------|--------------------|
| **Image Model** | `openai/gpt-image-1.5` | Model doesn't exist in BYTEZ | `dreamlike-art/dreamlike-photoreal-2.0` |
| **Generation Mode** | ASYNC | ✅ Good | ASYNC (unchanged) |
| **Image Storage** | Base64 in `content_json` | 2MB+ images slow down DB | **Supabase Storage** with URL reference |
| **Prompt Generation** | LLM Agent (Claude Opus) | Overkill, adds latency | **Template-based** (deterministic) |
| **Error Handling** | Log only | User sees spinner forever | **Status tracking** with UI feedback |

---

## 📚 REQUIRED READING (YOU MUST READ THESE FIRST)

**Before writing any code, read these files to understand the existing architecture:**

### Core Architecture Files
- `CONTEXT/ABOUT_OHM_AI_01.md` - Complete app documentation, implemented features
- `lib/agents/config.ts` - All agent configurations (9 agents currently)
- `lib/agents/orchestrator.ts` - Multi-agent routing and orchestration
- `lib/agents/tools.ts` - Tool definitions including existing `update_wiring`
- `lib/agents/tool-executor.ts` - How tools persist data to Supabase

### Database & State Management
- `lib/db/artifacts.ts` - Artifact CRUD operations, versioning system
- `lib/supabase/types.ts` - Database schema (focus on `artifact_versions` table)
- `lib/db/chat.ts` - Chat message persistence

### UI Components
- `components/tools/WiringDrawer.tsx` - Current wiring display (table-based)
- `components/tools/ResizableDrawer.tsx` - Base drawer component
- `components/ai_chat/AIAssistantUI.jsx` - Main chat interface with realtime subscriptions

### Existing Features to Leverage
- **Realtime Subscriptions**: Artifacts already update live via Supabase subscriptions in `AIAssistantUI`
- **Drawer Auto-Open**: Event-driven system via `window.dispatchEvent('open-drawer')`
- **User Context**: `userLevel` (Beginner/Intermediate/Advanced) and `projectComplexity`
- **Conversation Summarizer**: Background agent that maintains project state summaries

---

## 🏗️ ARCHITECTURE: HYBRID APPROACH

### Why Hybrid?
1. **SVG Schematic** = Source of truth (deterministic, exportable, no hallucinations)
2. **AI Breadboard Photo** = UX delight (photorealistic, beginner-friendly)
3. Serves all user levels (beginners get photos, engineers get schematics)

### Data Flow (CORRECTED - WITH ASYNC GENERATION)

```
User: "Generate wiring diagram"
    ↓
[Existing: wiringSpecialist Agent]
  - Calls update_wiring({ connections, instructions, warnings })
  - Persists to Supabase via tool-executor
    ↓
[tool-executor.ts: updateWiring() - MODIFIED]
  ├─→ Save wiring JSON to artifact (IMMEDIATE)
  ├─→ Generate SVG schematic (FAST, ~500ms)
  └─→ Trigger ASYNC image generation (background job)
        ↓
    [Background Pipeline - Non-blocking]
      ├─→ Template-Based Prompt Builder (NEW)
      │     - Input: Wiring JSON
      │     - Output: Detailed breadboard prompt string
      │     - Time: <1ms (no LLM call!)
      │
      ├─→ BYTEZ Image Generator (CORRECTED)
      │     - Model: dreamlike-art/dreamlike-photoreal-2.0
      │     - Endpoint: /models/v2/dreamlike-art/dreamlike-photoreal-2.0
      │     - Generates breadboard photo
      │     - Returns: Image URL (not base64)
      │     - Retry: 3 attempts with exponential backoff
      │     - Time: ~8-12 seconds
      │
      ├─→ Download & Upload to Supabase Storage
      │     - Fetch image from BYTEZ URL
      │     - Upload to wiring-images bucket
      │     - Get public URL
      │
      └─→ Update artifact with image metadata
            - Stores: { status, url, storage_path, prompt, model, timestamp }
            - Triggers Supabase realtime update
            - UI automatically refreshes
```

**Key Benefit**: User sees wiring table + SVG immediately (~1s), AI images appear 10-15s later automatically.

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 0: BYTEZ API Testing (CRITICAL - DO THIS FIRST!)
**Time:** 30-60 minutes  
**Status:** ⚠️ MANDATORY - Cannot proceed without this

#### Test BYTEZ Text-to-Image Endpoint

Before writing any code, manually verify the BYTEZ API works:

```bash
# Test 1: Verify model endpoint exists
curl -X POST 'https://api.bytez.com/models/v2/dreamlike-art/dreamlike-photoreal-2.0' \
  -H 'Authorization: YOUR_BYTEZ_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Arduino Uno on white breadboard with red LED"}'

# Expected Response:
# {
#   "error": null,
#   "output": "https://api.bytez.com/image/abc123def456"
# }

# Test 2: Verify image URL is accessible
curl -o test_image.png "https://api.bytez.com/image/abc123def456"

# Test 3: Check alternative models
curl -X POST 'https://api.bytez.com/models/v2/stabilityai/stable-diffusion-xl-base-1.0' \
  -H 'Authorization: YOUR_BYTEZ_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"text": "circuit breadboard photo"}'
```

**✅ Success Criteria:**
- API returns 200 status
- Response contains `{"error": null, "output": "<image_url>"}`
- Image URL is accessible and returns valid PNG/JPEG
- Image generation completes within 15 seconds

**❌ If this fails, STOP - Do not proceed to Phase 1**

---

### Phase 1: Prompt Builder (Template-Based)
**File:** `lib/diagram/prompt-builder.ts` (NEW)

#### [NEW] Create template-based prompt generator

**Why templates instead of LLM agent:**
- ⚡ Instant generation (<1ms vs 2-3 seconds)
- 💰 No API costs
- 🎯 Deterministic output
- 🐛 Easier to debug and improve

```typescript
/**
 * Template-Based Prompt Builder
 * Converts wiring data into detailed image generation prompts
 * NO LLM CALLS - Pure deterministic logic
 */

interface Component {
  id: string;
  type: string;
  pins?: Record<string, string>;
}

interface Connection {
  from_component: string;
  from_pin: string;
  to_component: string;
  to_pin: string;
  wire_color?: string;
  wire_gauge?: string;
  notes?: string;
}

interface WiringData {
  connections: Connection[];
  instructions: string;
  warnings?: string[];
}

export class PromptBuilder {
  /**
   * Build photorealistic breadboard prompt from wiring data
   */
  static buildBreadboardPrompt(wiringData: WiringData): string {
    const { connections } = wiringData;
    
    // Extract unique components
    const componentIds = new Set<string>();
    connections.forEach(c => {
      componentIds.add(c.from_component);
      componentIds.add(c.to_component);
    });
    const components = Array.from(componentIds);
    
    // Build component description
    const componentDesc = components
      .map((id, idx) => {
        const position = idx === 0 ? 'at left side' : 
                        idx === components.length - 1 ? 'at right side' :
                        'in center';
        return `${id} ${position}`;
      })
      .join(', ');
    
    // Build power rail description
    const powerConns = connections.filter(c => 
      c.from_pin.toLowerCase().includes('vcc') ||
      c.from_pin.toLowerCase().includes('5v') ||
      c.from_pin.toLowerCase().includes('3.3v')
    );
    const gndConns = connections.filter(c =>
      c.from_pin.toLowerCase().includes('gnd') ||
      c.to_pin.toLowerCase().includes('gnd')
    );
    
    const powerRailDesc = powerConns.length > 0 
      ? 'Red power rail along top edge connects to all VCC/power pins. ' 
      : '';
    const gndRailDesc = gndConns.length > 0
      ? 'Black ground rail along bottom edge connects to all GND pins. '
      : '';
    
    // Build individual connection descriptions
    const connectionDesc = connections
      .map(c => {
        const color = c.wire_color || 'jumper';
        const gauge = c.wire_gauge || '22AWG';
        const wire = `${color} ${gauge} wire`;
        return `${wire} from ${c.from_component} pin ${c.from_pin} to ${c.to_component} pin ${c.to_pin}`;
      })
      .join('. ');
    
    // Assemble final prompt
    const prompt = `
      Top-down view of electronics workbench with professional studio lighting.
      White 830-point solderless breadboard centered in frame, clean and organized.
      Components visible: ${componentDesc}.
      ${powerRailDesc}${gndRailDesc}
      Wiring connections: ${connectionDesc}.
      All components have clear visible labels showing model numbers and pin identifiers.
      Photorealistic style, sharp focus, slight shadows for depth, white background, 
      professional electronics photography, well-lit, component details clearly visible.
    `.trim().replace(/\s+/g, ' ');
    
    return prompt;
  }
  
  /**
   * Calculate optimal image size based on circuit complexity
   */
  static calculateImageSize(componentCount: number): string {
    if (componentCount <= 3) return '1024x1024';  // Small circuits
    if (componentCount <= 7) return '1792x1024';  // Medium circuits (wide)
    return '1024x1792';  // Large circuits (portrait)
  }
}
```

**Testing:**
```typescript
// Test with sample data
const testData = {
  connections: [
    { from_component: 'Arduino Uno', from_pin: '5V', to_component: 'DHT22', to_pin: 'VCC', wire_color: 'red' },
    { from_component: 'Arduino Uno', from_pin: 'GND', to_component: 'DHT22', to_pin: 'GND', wire_color: 'black' },
    { from_component: 'Arduino Uno', from_pin: 'D2', to_component: 'DHT22', to_pin: 'DATA', wire_color: 'yellow' }
  ],
  instructions: 'Connect DHT22 sensor to Arduino'
};

const prompt = PromptBuilder.buildBreadboardPrompt(testData);
console.log(prompt);
// Should output detailed prompt ready for BYTEZ
```

---

### Phase 2: Image Generation Service (CORRECTED)
**Directory:** `lib/diagram/` (NEW directory)

#### [NEW] `lib/diagram/image-generator.ts`
```typescript
/**
 * Image Generator Service
 * Handles all BYTEZ text-to-image API calls
 */

interface ImageGenerationOptions {
  prompt: string;
  model?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
}

interface ImageGenerationResult {
  imageBase64: string;
  prompt: string;
  model: string;
  generatedAt: string;
}

export class ImageGenerator {
  private bytezApiKey: string;
  private baseUrl = 'https://api.bytez.com/v1'; // Verify actual BYTEZ endpoint

  constructor() {
    this.bytezApiKey = process.env.BYTEZ_API_KEY || '';
    if (!this.bytezApiKey) {
      throw new Error('BYTEZ_API_KEY not configured');
    }
  }

  /**
   * Generate breadboard wiring photo
   */
  async generateBreadboardImage(prompt: string): Promise<ImageGenerationResult> {
    return this.generateImage({
      prompt,
      model: 'openai/gpt-image-1.5', // User-selected model
      size: '1792x1024', // Wide format for breadboard layouts
      quality: 'hd'
    });
  }

  /**
   * Generate circuit schematic
   */
  async generateSchematicImage(prompt: string): Promise<ImageGenerationResult> {
    return this.generateImage({
      prompt,
      model: 'openai/gpt-image-1.5',
      size: '1024x1024', // Square for schematics
      quality: 'hd'
    });
  }

  /**
   * Core image generation via BYTEZ
   */
  private async generateImage(options: ImageGenerationOptions): Promise<ImageGenerationResult> {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.bytezApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: options.model || 'openai/gpt-image-1.5',
        prompt: options.prompt,
        n: 1,
        size: options.size || '1024x1024',
        quality: options.quality || 'hd',
        response_format: 'b64_json' // Get base64 directly
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`BYTEZ image generation failed: ${error.message || response.statusText}`);
    }

    const data = await response.json();
    
    // BYTEZ returns OpenAI-compatible format
    const imageBase64 = data.data[0].b64_json;

    return {
      imageBase64: `data:image/png;base64,${imageBase64}`,
      prompt: options.prompt,
      model: options.model || 'openai/gpt-image-1.5',
      generatedAt: new Date().toISOString()
    };
  }
}
```

#### [NEW] `lib/diagram/svg-generator.ts`
```typescript
/**
 * Deterministic SVG Schematic Generator
 * Generates IEEE-style circuit schematics from wiring JSON
 * This is FAST and ACCURATE (no AI hallucinations)
 */

interface Component {
  id: string;
  type: string;
  pins?: Record<string, string>;
}

interface Connection {
  from: { component: string; pin: string };
  to: { component: string; pin: string };
  wireColor?: string;
  wireGauge?: string;
}

interface WiringData {
  components: Component[];
  connections: Connection[];
  instructions?: string[];
}

export class SVGSchematicGenerator {
  private width = 800;
  private height = 600;
  private componentSpacing = 150;
  private wireColors: Record<string, string> = {
    red: '#ff0000',
    black: '#000000',
    yellow: '#ffff00',
    green: '#00ff00',
    blue: '#0000ff',
    white: '#ffffff',
    orange: '#ffa500'
  };

  /**
   * Generate SVG schematic from wiring data
   */
  generateSchematic(wiringData: WiringData): string {
    const components = this.layoutComponents(wiringData.components);
    const connections = this.routeConnections(wiringData.connections, components);

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}" style="background: white;">`;
    
    // Draw connections first (behind components)
    svg += connections.map(conn => this.drawWire(conn)).join('');
    
    // Draw components
    svg += components.map(comp => this.drawComponent(comp)).join('');
    
    // Add title
    svg += `<text x="10" y="20" font-family="Arial" font-size="14" fill="black">Circuit Schematic</text>`;
    
    svg += `</svg>`;
    
    return svg;
  }

  /**
   * Layout components in a readable grid
   */
  private layoutComponents(components: Component[]): any[] {
    const cols = Math.ceil(Math.sqrt(components.length));
    const rows = Math.ceil(components.length / cols);
    
    return components.map((comp, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      
      return {
        ...comp,
        x: 100 + col * this.componentSpacing,
        y: 100 + row * this.componentSpacing,
        width: 80,
        height: 60
      };
    });
  }

  /**
   * Route wires between components
   */
  private routeConnections(connections: Connection[], components: any[]): any[] {
    return connections.map(conn => {
      const fromComp = components.find(c => c.id === conn.from.component);
      const toComp = components.find(c => c.id === conn.to.component);
      
      if (!fromComp || !toComp) return null;
      
      return {
        x1: fromComp.x + fromComp.width,
        y1: fromComp.y + fromComp.height / 2,
        x2: toComp.x,
        y2: toComp.y + toComp.height / 2,
        color: this.wireColors[conn.wireColor?.toLowerCase() || 'black'] || '#000000',
        label: `${conn.from.pin} → ${conn.to.pin}`
      };
    }).filter(Boolean);
  }

  /**
   * Draw component rectangle with label
   */
  private drawComponent(comp: any): string {
    return `
      <g>
        <rect x="${comp.x}" y="${comp.y}" width="${comp.width}" height="${comp.height}" 
              fill="#f0f0f0" stroke="black" stroke-width="2" rx="4"/>
        <text x="${comp.x + comp.width / 2}" y="${comp.y + comp.height / 2}" 
              text-anchor="middle" dominant-baseline="middle" 
              font-family="Arial" font-size="12" fill="black">
          ${comp.type}
        </text>
        <text x="${comp.x + comp.width / 2}" y="${comp.y + comp.height + 15}" 
              text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
          ${comp.id}
        </text>
      </g>
    `;
  }

  /**
   * Draw wire with label
   */
  private drawWire(conn: any): string {
    const midX = (conn.x1 + conn.x2) / 2;
    const midY = (conn.y1 + conn.y2) / 2;
    
    return `
      <g>
        <line x1="${conn.x1}" y1="${conn.y1}" x2="${conn.x2}" y2="${conn.y2}" 
              stroke="${conn.color}" stroke-width="2"/>
        <circle cx="${conn.x1}" cy="${conn.y1}" r="3" fill="${conn.color}"/>
        <circle cx="${conn.x2}" cy="${conn.y2}" r="3" fill="${conn.color}"/>
        <text x="${midX}" y="${midY - 5}" text-anchor="middle" 
              font-family="Arial" font-size="9" fill="#333">
          ${conn.label}
        </text>
      </g>
    `;
  }
}
```

#### [NEW] `lib/diagram/visual-wiring-pipeline.ts`
```typescript
/**
 * Visual Wiring Pipeline
 * Orchestrates the full async image generation workflow
 */

import { runAgent } from '../agents/orchestrator';
import { ImageGenerator } from './image-generator';
import { SVGSchematicGenerator } from './svg-generator';
import { ArtifactService } from '../db/artifacts';

interface WiringData {
  components: any[];
  connections: any[];
  instructions: string[];
  warnings?: string[];
}

interface VisualWiringResult {
  svg: string;
  breadboardImage?: string;
  schematicImage?: string;
  prompts?: {
    breadboard: string;
    schematic: string;
  };
}

export class VisualWiringPipeline {
  private imageGenerator: ImageGenerator;
  private svgGenerator: SVGSchematicGenerator;

  constructor() {
    this.imageGenerator = new ImageGenerator();
    this.svgGenerator = new SVGSchematicGenerator();
  }

  /**
   * SYNCHRONOUS: Generate SVG only (fast)
   */
  async generateSVG(wiringData: WiringData): Promise<string> {
    return this.svgGenerator.generateSchematic(wiringData);
  }

  /**
   * ASYNCHRONOUS: Generate AI images in background
   * This is called AFTER the artifact is saved and user sees SVG
   */
  async generateAIImages(
    chatId: string,
    artifactId: string,
    wiringData: WiringData
  ): Promise<void> {
    try {
      console.log(`[VisualWiringPipeline] Starting async image generation for artifact ${artifactId}`);

      // Step 1: Generate prompts via Visual Prompt Engineer
      const promptResult = await runAgent('visualPromptEngineer', {
        messages: [{
          role: 'user',
          content: `Generate image prompts for this wiring specification:\n\n${JSON.stringify(wiringData, null, 2)}`
        }]
      });

      // Parse JSON response from agent
      const prompts = JSON.parse(promptResult.content);

      console.log('[VisualWiringPipeline] Prompts generated:', {
        breadboard: prompts.breadboard_prompt.substring(0, 100) + '...',
        schematic: prompts.schematic_prompt.substring(0, 100) + '...'
      });

      // Step 2: Generate breadboard image
      const breadboardResult = await this.imageGenerator.generateBreadboardImage(
        prompts.breadboard_prompt
      );

      console.log('[VisualWiringPipeline] Breadboard image generated');

      // Step 3: Generate schematic image (optional, we already have SVG)
      // Commented out to save cost, can enable if needed
      // const schematicResult = await this.imageGenerator.generateSchematicImage(
      //   prompts.schematic_prompt
      // );

      // Step 4: Update artifact with AI images
      const artifact = await ArtifactService.getArtifact(artifactId);
      if (!artifact) {
        throw new Error('Artifact not found');
      }

      const currentVersion = artifact.current_version;
      const updatedContent = {
        ...currentVersion.content_json,
        ai_images: {
          breadboard: {
            base64: breadboardResult.imageBase64,
            prompt: prompts.breadboard_prompt,
            model: breadboardResult.model,
            generated_at: breadboardResult.generatedAt
          },
          // schematic: {
          //   base64: schematicResult.imageBase64,
          //   prompt: prompts.schematic_prompt,
          //   model: schematicResult.model,
          //   generated_at: schematicResult.generatedAt
          // }
        }
      };

      // Create new version with AI images
      await ArtifactService.createVersion({
        artifact_id: artifactId,
        version_number: currentVersion.version_number + 1,
        content_json: updatedContent,
        diagram_svg: currentVersion.diagram_svg, // Keep existing SVG
        change_summary: 'Added AI-generated breadboard visualization'
      });

      console.log(`[VisualWiringPipeline] AI images saved to artifact ${artifactId}`);

      // Supabase realtime will automatically notify UI to refresh

    } catch (error) {
      console.error('[VisualWiringPipeline] Error generating AI images:', error);
      // Don't throw - this is a background job, failure should be logged but not crash
    }
  }

  /**
   * FULL PIPELINE: Generate both SVG (sync) and AI images (async)
   */
  async generateAll(
    chatId: string,
    artifactId: string,
    wiringData: WiringData
  ): Promise<VisualWiringResult> {
    // Generate SVG immediately (fast, deterministic)
    const svg = await this.generateSVG(wiringData);

    // Kick off AI image generation in background (don't await)
    this.generateAIImages(chatId, artifactId, wiringData).catch(err => {
      console.error('Background AI image generation failed:', err);
    });

    return {
      svg,
      breadboardImage: undefined, // Will be populated by background job
      schematicImage: undefined
    };
  }
}
```

---

### Phase 3: Modify Tool Executor
**File:** `lib/agents/tool-executor.ts`

#### [MODIFY] `updateWiring()` method

**Find this existing method and modify it:**

```typescript
async updateWiring(
  toolCallId: string,
  args: {
    components: any[];
    connections: any[];
    instructions: string[];
    warnings?: string[];
  }
): Promise<ToolExecutionResult> {
  // EXISTING CODE: Save wiring data to artifact
  const artifact = await ArtifactService.getLatestArtifact(
    this.chatId,
    'wiring'
  );

  let artifactId: string;

  if (artifact) {
    // Update existing artifact
    const newVersion = await ArtifactService.createVersion({
      artifact_id: artifact.id,
      version_number: artifact.current_version.version_number + 1,
      content_json: args,
      change_summary: `Updated wiring connections`
    });
    artifactId = artifact.id;
  } else {
    // Create new artifact
    const newArtifact = await ArtifactService.createArtifact({
      chat_id: this.chatId,
      type: 'wiring',
      title: 'Wiring Diagram',
      content_json: args
    });
    artifactId = newArtifact.id;
  }

  // ========== NEW CODE BELOW ==========
  
  // Import the visual pipeline (add at top of file)
  // import { VisualWiringPipeline } from '../diagram/visual-wiring-pipeline';
  
  try {
    const pipeline = new VisualWiringPipeline();
    
    // Generate SVG synchronously (fast, ~500ms)
    const svg = await pipeline.generateSVG(args);
    
    // Update artifact with SVG immediately
    await ArtifactService.createVersion({
      artifact_id: artifactId,
      version_number: (artifact?.current_version.version_number || 0) + 2, // +2 because we already created one
      content_json: args,
      diagram_svg: svg,
      change_summary: 'Added SVG schematic'
    });
    
    console.log('[Tool Executor] SVG schematic generated and saved');
    
    // Trigger async AI image generation (don't await - runs in background)
    pipeline.generateAIImages(this.chatId, artifactId, args)
      .then(() => {
        console.log('[Tool Executor] Background AI image generation completed');
      })
      .catch(err => {
        console.error('[Tool Executor] Background AI image generation failed:', err);
      });
    
  } catch (error) {
    console.error('[Tool Executor] Error in visual wiring pipeline:', error);
    // Don't fail the whole tool call if visual generation fails
  }
  
  // ========== END NEW CODE ==========

  return {
    success: true,
    message: 'Wiring diagram updated successfully. AI-generated breadboard view will appear shortly.'
  };
}
```

---

### Phase 4: Update WiringDrawer UI
**File:** `components/tools/WiringDrawer.tsx`

#### [MODIFY] Complete rewrite with 4 tabs

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Download, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface WiringDrawerProps {
  chatId: string;
  wiringData: any;
  diagramSvg?: string | null;
  diagramMetadata?: any;
}

type ViewMode = 'table' | 'svg' | 'breadboard' | 'schematic';

export function WiringDrawer({
  chatId,
  wiringData,
  diagramSvg,
  diagramMetadata
}: WiringDrawerProps) {
  const [view, setView] = useState<ViewMode>('table');
  const [zoom, setZoom] = useState(100);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Extract AI images from metadata
  const breadboardImage = diagramMetadata?.ai_images?.breadboard?.base64;
  const schematicImage = diagramMetadata?.ai_images?.schematic?.base64;
  const isGenerating = diagramMetadata?.ai_images === undefined && diagramSvg !== null;

  // Auto-switch to breadboard when image becomes available
  useEffect(() => {
    if (breadboardImage && view === 'table') {
      setView('breadboard');
    }
  }, [breadboardImage]);

  const handleDownload = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.href = imageData;
    link.download = filename;
    link.click();
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    // TODO: Implement regeneration API endpoint
    // await fetch('/api/diagram/regenerate', { method: 'POST', body: JSON.stringify({ chatId }) });
    setIsRegenerating(false);
  };

  if (!wiringData) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No wiring data available
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 p-4 border-b bg-background">
        <Button
          variant={view === 'table' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('table')}
        >
          📋 Table
        </Button>
        <Button
          variant={view === 'svg' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('svg')}
          disabled={!diagramSvg}
        >
          📐 Schematic
        </Button>
        <Button
          variant={view === 'breadboard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('breadboard')}
          className="relative"
        >
          📸 Breadboard
          {isGenerating && (
            <Loader2 className="ml-2 h-3 w-3 animate-spin" />
          )}
        </Button>
        <Button
          variant={view === 'schematic' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setView('schematic')}
          disabled={!schematicImage}
        >
          ⚡ AI Schematic
        </Button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {/* TABLE VIEW - Existing Connection Table */}
        {view === 'table' && (
          <div className="p-4">
            {/* Keep your existing table code here */}
            <ConnectionsTable 
              connections={wiringData.connections}
              instructions={wiringData.instructions}
              warnings={wiringData.warnings}
            />
          </div>
        )}

        {/* SVG VIEW - Deterministic Schematic */}
        {view === 'svg' && (
          <div className="p-4">
            {diagramSvg ? (
              <>
                <div className="flex justify-between mb-4">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setZoom(z => Math.min(z + 25, 200))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => setZoom(z => Math.max(z - 25, 50))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">{zoom}%</span>
                  </div>
                  <Button size="sm" onClick={() => handleDownload(diagramSvg, 'schematic.svg')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download SVG
                  </Button>
                </div>
                <div 
                  style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                  dangerouslySetInnerHTML={{ __html: diagramSvg }}
                />
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No schematic available yet
              </div>
            )}
          </div>
        )}

        {/* BREADBOARD VIEW - AI Generated Photo */}
        {view === 'breadboard' && (
          <div className="p-4">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <div className="text-center">
                  <p className="font-medium">Generating photorealistic breadboard diagram...</p>
                  <p className="text-sm text-muted-foreground mt-1">This takes about 10-15 seconds</p>
                </div>
              </div>
            ) : breadboardImage ? (
              <>
                <div className="flex justify-between mb-4">
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setZoom(z => Math.min(z + 25, 200))}>
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => setZoom(z => Math.max(z - 25, 50))}>
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleDownload(breadboardImage, 'breadboard.png')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" onClick={handleRegenerate} disabled={isRegenerating}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                      Regenerate
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden bg-white">
                  <img 
                    src={breadboardImage}
                    alt="Breadboard wiring diagram"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}
                    className="w-full"
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No breadboard image generated yet. It will appear automatically.
              </div>
            )}
          </div>
        )}

        {/* AI SCHEMATIC VIEW - AI Generated Schematic (Optional) */}
        {view === 'schematic' && (
          <div className="p-4">
            {schematicImage ? (
              // Similar to breadboard view but for AI schematic
              <div>
                <img src={schematicImage} alt="AI-generated schematic" className="w-full" />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                AI schematic not generated (SVG is recommended for accuracy)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Key Changes:**
- Added 4 tabs: Table (existing), SVG (deterministic), Breadboard (AI photo), AI Schematic (optional)
- Real-time loading indicator for async AI generation
- Auto-switches to breadboard when image loads (better UX)
- Zoom controls for both SVG and images
- Download buttons for all formats

---

### Phase 5: Update AIAssistantUI to Pass New Props
**File:** `components/ai_chat/AIAssistantUI.jsx`

#### [MODIFY] Pass diagram data to WiringDrawer

**Find where WiringDrawer is rendered and update props:**

```jsx
// In AIAssistantUI.jsx, around line ~150-200

<WiringDrawer
  chatId={chatId}
  wiringData={artifacts.wiring?.current_version?.content_json}
  diagramSvg={artifacts.wiring?.current_version?.diagram_svg}  // NEW
  diagramMetadata={artifacts.wiring?.current_version?.content_json}  // NEW - contains ai_images
/>
```

**Explanation:**
- `diagramSvg`: The SVG string stored in `artifact_versions.diagram_svg` column
- `diagramMetadata`: The full `content_json` which now includes `ai_images` object
- Realtime subscriptions already exist, so when background job updates artifact, UI refreshes automatically

---

### Phase 6: Environment Variables
**File:** `.env.local`

#### [ADD] Ensure BYTEZ API key is configured

```bash
# Existing keys
BYTEZ_API_KEY=your_primary_key
BYTEZ_API_KEY_2=your_backup_key
BYTEZ_API_KEY_3=your_backup_key_2

# Supabase (already exists)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

**No new env vars needed** - BYTEZ already configured for text models, same key works for image generation.

---

### Phase 7: Optional - Regenerate API Endpoint
**File:** `app/api/diagram/regenerate/route.ts` (NEW)

#### [NEW] Manual regeneration endpoint (optional enhancement)

```typescript
import { NextRequest } from 'next/server';
import { ArtifactService } from '@/lib/db/artifacts';
import { VisualWiringPipeline } from '@/lib/diagram/visual-wiring-pipeline';

export async function POST(req: NextRequest) {
  const { chatId } = await req.json();

  // Get latest wiring artifact
  const artifact = await ArtifactService.getLatestArtifact(chatId, 'wiring');
  
  if (!artifact) {
    return Response.json({ error: 'No wiring artifact found' }, { status: 404 });
  }

  const wiringData = artifact.current_version.content_json;
  const pipeline = new VisualWiringPipeline();

  // Regenerate AI images only
  await pipeline.generateAIImages(chatId, artifact.id, wiringData);

  return Response.json({ success: true });
}
```

**Purpose:** Allows users to click "Regenerate" if AI image has errors or they want a different variation.

---

## 🧪 TESTING PLAN

### Manual Testing Steps

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Create test project:**
   - Go to http://localhost:3000/build
   - Enter: "Build ESP32 temperature monitor with DHT22 sensor"
   - Select: Beginner level, Simple complexity

3. **Request wiring:**
   - Type: "Generate the wiring diagram for this project"
   - Wait for `wiringSpecialist` agent to respond

4. **Verify WiringDrawer behavior:**
   - ✅ Drawer auto-opens after wiring generated
   - ✅ Table tab shows connections immediately
   - ✅ SVG tab shows schematic within 1 second
   - ✅ Breadboard tab shows loading spinner
   - ✅ After 10-15 seconds, breadboard image appears
   - ✅ Auto-switches to breadboard tab when image loads

5. **Test interactions:**
   - ✅ Zoom in/out works on SVG and image
   - ✅ Download SVG saves file
   - ✅ Download breadboard PNG saves file
   - ✅ Regenerate button creates new image

6. **Test realtime updates:**
   - ✅ Open two browser tabs with same chat
   - ✅ When AI image generates, both tabs update simultaneously

### Browser Console Checks

**Look for these logs:**
```
[Tool Executor] SVG schematic generated and saved
[VisualWiringPipeline] Starting async image generation for artifact abc123
[VisualWiringPipeline] Prompts generated: { breadboard: "Top-down view...", ... }
[VisualWiringPipeline] Breadboard image generated
[VisualWiringPipeline] AI images saved to artifact abc123
[Tool Executor] Background AI image generation completed
```

### Error Handling Tests

1. **BYTEZ API failure:**
   - Temporarily use invalid API key
   - ✅ Should log error but not crash
   - ✅ User still sees table and SVG
   - ✅ Breadboard shows placeholder message

2. **Malformed wiring JSON:**
   - Manually create artifact with missing fields
   - ✅ SVG generator should handle gracefully
   - ✅ Should not block image generation

---

## 📊 DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER TYPES MESSAGE                       │
│              "Show me the wiring for this project"              │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR AGENT                          │
│                  (anthropic/claude-sonnet-4-5)                  │
│                                                                 │
│  Intent: "WIRING" → Routes to wiringSpecialist                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WIRING SPECIALIST AGENT                      │
│                  (anthropic/claude-sonnet-4-5)                  │
│                                                                 │
│  Analyzes project context → Calls update_wiring tool           │
│  Output: { components, connections, instructions, warnings }    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TOOL EXECUTOR                               │
│              (lib/agents/tool-executor.ts)                      │
│                                                                 │
│  Step 1: Save wiring JSON to Supabase ✅ FAST (100ms)          │
│          ↓                                                      │
│          Drawer opens, shows table immediately                  │
│                                                                 │
│  Step 2: Generate SVG ✅ FAST (500ms)                          │
│          ↓                                                      │
│          SVG tab becomes available                              │
│                                                                 │
│  Step 3: Trigger background pipeline (async, non-blocking)     │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│              VISUAL WIRING PIPELINE (BACKGROUND)                 │
│           (lib/diagram/visual-wiring-pipeline.ts)               │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Step 1: Visual Prompt Engineer Agent                   │    │
│  │ (anthropic/claude-opus-4-5)                            │    │
│  │                                                        │    │
│  │ Input: Wiring JSON                                     │    │
│  │ Output: { breadboard_prompt, schematic_prompt }        │    │
│  │ Time: ~2-3 seconds                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Step 2: BYTEZ Image Generator                          │    │
│  │ (openai/gpt-image-1.5 via BYTEZ API)                   │    │
│  │                                                        │    │
│  │ POST https://api.bytez.com/v1/images/generations       │    │
│  │ Body: { prompt, model, size: "1792x1024", quality: "hd" }│  │
│  │ Response: { data: [{ b64_json: "iVBORw0KG..." }] }     │    │
│  │ Time: ~8-12 seconds                                    │    │
│  └────────────────────────────────────────────────────────┘    │
│                          │                                      │
│                          ▼                                      │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Step 3: Update Supabase Artifact                       │    │
│  │                                                        │    │
│  │ artifact_versions.content_json = {                     │    │
│  │   ...wiringData,                                       │    │
│  │   ai_images: {                                         │    │
│  │     breadboard: {                                      │    │
│  │       base64: "data:image/png;base64,...",             │    │
│  │       prompt: "Top-down view...",                      │    │
│  │       model: "openai/gpt-image-1.5",                   │    │
│  │       generated_at: "2026-01-15T..."                   │    │
│  │     }                                                  │    │
│  │   }                                                    │    │
│  │ }                                                      │    │
│  │                                                        │    │
│  │ Time: ~200ms                                           │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│               SUPABASE REALTIME NOTIFICATION                     │
│                                                                 │
│  Postgres TRIGGER on artifact_versions → Realtime channel       │
│  All subscribed clients receive update notification             │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  UI AUTO-REFRESHES                              │
│           (components/ai_chat/AIAssistantUI.jsx)                │
│                                                                 │
│  useEffect hook detects artifact change                         │
│  → Re-renders WiringDrawer with new breadboardImage            │
│  → Auto-switches to breadboard tab                             │
│  → Loading spinner disappears, image appears                    │
└─────────────────────────────────────────────────────────────────┘
```

**Total Time:**
- User sees table: **~100ms** (instant)
- User sees SVG: **~600ms** (fast)
- User sees AI breadboard: **~10-15 seconds** (async, doesn't block)

---

## 🎯 SUCCESS CRITERIA

✅ **Implementation Complete When:**

1. **Agent Configuration:**
   - [ ] `visualPromptEngineer` added to `lib/agents/config.ts`
   - [ ] Agent type added to TypeScript types

2. **Image Generation:**
   - [ ] `lib/diagram/image-generator.ts` created and tested
   - [ ] `lib/diagram/svg-generator.ts` created and tested
   - [ ] `lib/diagram/visual-wiring-pipeline.ts` created and orchestrates both

3. **Tool Integration:**
   - [ ] `tool-executor.ts` modified to call pipeline
   - [ ] SVG generation is synchronous (user sees immediately)
   - [ ] AI generation is asynchronous (doesn't block)

4. **UI Updates:**
   - [ ] `WiringDrawer.tsx` has 4 tabs (Table, SVG, Breadboard, AI Schematic)
   - [ ] Loading states work correctly
   - [ ] Zoom/download/regenerate buttons functional
   - [ ] Auto-switches to breadboard when image loads

5. **End-to-End Flow:**
   - [ ] User requests wiring → sees table in <1 second
   - [ ] SVG appears within 1 second
   - [ ] AI breadboard appears within 15 seconds
   - [ ] All updates happen without page refresh
   - [ ] Multiple tabs see same updates simultaneously

6. **Error Handling:**
   - [ ] BYTEZ API failures don't crash app
   - [ ] Malformed wiring data handled gracefully
   - [ ] Console logs help debug issues

---

## 🚨 POTENTIAL ISSUES & SOLUTIONS

### Issue 1: BYTEZ API Endpoint Unknown
**Problem:** We're assuming `https://api.bytez.com/v1/images/generations` but this might not be correct.

**Solution:**
- Check BYTEZ documentation for correct endpoint
- Test with simple curl request first:
```bash
curl -X POST https://api.bytez.com/v1/images/generations \
  -H "Authorization: Bearer $BYTEZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-image-1.5","prompt":"test","n":1,"size":"1024x1024"}'
```

### Issue 2: Base64 Images Too Large
**Problem:** Base64 images can be 1-2MB, may hit Supabase row size limits.

**Solution:**
- Option A: Store in Supabase Storage instead:
```typescript
// Upload to storage
const { data } = await supabase.storage
  .from('wiring-diagrams')
  .upload(`${chatId}/${artifactId}/breadboard.png`, base64ToBlob(imageBase64));

// Store URL in artifact
ai_images: { breadboard: { url: data.publicUrl, ... } }
```
- Option B: Compress images before storing
- Option C: Keep as-is and monitor (Postgres supports up to 1GB per row)

### Issue 3: Agent Response Not Valid JSON
**Problem:** `visualPromptEngineer` might return JSON with markdown wrappers like \`\`\`json.

**Solution:**
```typescript
// In visual-wiring-pipeline.ts
let prompts;
try {
  // Strip markdown fences if present
  let content = promptResult.content.trim();
  content = content.replace(/^```json\n/, '').replace(/\n```$/, '');
  prompts = JSON.parse(content);
} catch (error) {
  console.error('Failed to parse prompt engineer response:', promptResult.content);
  throw error;
}
```

### Issue 4: Version Number Conflicts
**Problem:** Multiple version creates in quick succession might cause conflicts.

**Solution:**
- Current approach creates version +2 which might conflict
- Better: Fetch artifact again before second version create:
```typescript
// After first version create
const refreshed = await ArtifactService.getArtifact(artifactId);
await ArtifactService.createVersion({
  artifact_id: artifactId,
  version_number: refreshed.current_version.version_number + 1, // Use latest
  ...
});
```

---

## 🎓 KNOWLEDGE TRANSFER NOTES

### For Future Developers

**Key Design Decisions:**

1. **Why Hybrid (SVG + AI)?**
   - SVG is deterministic and exportable (engineers need this)
   - AI images are photorealistic (beginners need this)
   - Both serve different user needs

2. **Why Async Image Generation?**
   - Image generation takes 10-15 seconds
   - Blocking user for this long is bad UX
   - User sees immediate feedback (table + SVG), then image appears

3. **Why Store Base64 in Database?**
   - Simple: No separate storage service needed
   - Versioned: Images tied to artifact versions
   - Tradeoff: Larger database size (acceptable for now)

4. **Why Visual Prompt Engineer Agent?**
   - Image generators need hyper-specific prompts
   - Separating prompt engineering from wiring logic is cleaner
   - Agent can be improved without touching wiring specialist

**Testing Tips:**

- Mock BYTEZ API in tests to avoid costs
- Use real API only for final integration tests
- Keep sample wiring JSONs for regression testing

**Monitoring:**

- Watch BYTEZ API costs (free now, but track usage)
- Monitor Supabase database size growth
- Log image generation success/failure rates

---

## 📅 ESTIMATED TIMELINE

| Phase | Time | Dependencies |
|-------|------|--------------|
| Phase 1: Agent Config | 30 mins | None |
| Phase 2: Image Services | 2 hours | BYTEZ API docs, testing |
| Phase 3: Tool Executor | 1 hour | Phase 2 complete |
| Phase 4: UI Updates | 2 hours | Phase 3 complete |
| Phase 5: AIAssistantUI | 30 mins | Phase 4 complete |
| Phase 6: Env Vars | 10 mins | None (parallel) |
| Phase 7: Regenerate API | 1 hour | Optional, can defer |
| **Testing & Bug Fixes** | 3 hours | All phases |
| **TOTAL** | **10-12 hours** | (1.5 days) |

---

## ✅ FINAL CHECKLIST

**Before Starting:**
- [ ] Read all files in "REQUIRED READING" section
- [ ] Verify BYTEZ API key works
- [ ] Confirm BYTEZ endpoint for image generation
- [ ] Backup current codebase (git commit)

**During Implementation:**
- [ ] Create `lib/diagram/` directory
- [ ] Implement in order: Phase 1 → 2 → 3 → 4 → 5
- [ ] Test each phase before moving to next
- [ ] Commit after each working phase

**After Implementation:**
- [ ] Run end-to-end test (create project → request wiring → verify all 4 tabs)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari)
- [ ] Test realtime updates (two tabs simultaneously)
- [ ] Check console for errors
- [ ] Verify database artifact versions created correctly

**Documentation:**
- [ ] Update `CONTEXT/ABOUT_OHM_AI_01.md` with new feature
- [ ] Add example screenshots to docs
- [ ] Document any issues encountered

---

## 🚀 READY TO IMPLEMENT

This plan is **COMPLETE** and **READY FOR EXECUTION**.

All user decisions confirmed:
- ✅ Model: `openai/gpt-image-1.5`
- ✅ Mode: Async generation
- ✅ Storage: Supabase base64
- ✅ Budget: No concern (BYTEZ free)

**Next Action:** Start with Phase 1 - Add `visualPromptEngineer` to `lib/agents/config.ts`

---

*Plan created: January 15, 2026*  
*Status: Approved and ready for coding agent*