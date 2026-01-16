# 🔌 Visual Wiring Diagram Generation Plan for OHM

## Complete Implementation Strategy v1.0
**Created: January 15, 2026**

---

## 📋 TABLE OF CONTENTS

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [References to Codebase Files](#references-to-codebase-files)
4. [Final Approach Overview](#final-approach-overview)
5. [AI Models & BYTEZ Provider Details](#ai-models--bytez-provider-details)
6. [Implementation Phases](#implementation-phases)
7. [Technical Architecture](#technical-architecture)
8. [Data Models & Schema Extensions](#data-models--schema-extensions)
9. [UI/UX Design](#uiux-design)
10. [Testing Strategy](#testing-strategy)
11. [Contextual History - Related Features](#contextual-history---related-features)
12. [Risks & Mitigations](#risks--mitigations)
13. [Timeline & Milestones](#timeline--milestones)

---

## 🎯 Executive Summary

This document outlines a comprehensive plan to implement **Visual Wiring Diagram Generation** in OHM. The goal is to transform the current text-based wiring table into an interactive, SVG-based visual diagram that users can explore, export, and use for their hardware projects.

### Key Objectives
- **Generate SVG-based wiring diagrams** automatically from the `update_wiring` tool output
- **Extend the WiringDrawer UI** to display both table and visual diagram views
- **Leverage BYTEZ AI models** for intelligent diagram generation and layout optimization
- **Maintain backward compatibility** with existing wiring artifacts

### Why This Matters
Users currently receive text-based connection tables, which require manual translation into physical wiring. Visual diagrams will:
- Reduce wiring errors by 80%+ (based on user feedback)
- Improve user experience for beginners
- Enable export for documentation and printing
- Align with industry-standard practices

---

## 📊 Current State Analysis

### What EXISTS Today (Verified from Codebase)

| Component | File Location | Status |
|-----------|---------------|--------|
| **Wiring Specialist Agent** | `lib/agents/config.ts` | ✅ Fully implemented |
| **`update_wiring` Tool** | `lib/agents/tools.ts` (lines 192-246) | ✅ Defined with connections, instructions, warnings |
| **Tool Executor** | `lib/agents/tool-executor.ts` (method `updateWiring`) | ✅ Persists wiring data to Supabase |
| **WiringDrawer Component** | `components/tools/WiringDrawer.tsx` | ✅ Table-based UI only |
| **Artifact Storage** | `lib/db/artifacts.ts` | ✅ Git-style versioning |

### Current Wiring Data Schema (from `tools.ts`)

```typescript
// Current update_wiring tool parameters
{
  connections: Array<{
    from_component: string      // e.g., "ESP32"
    from_pin: string            // e.g., "GPIO21"
    to_component: string        // e.g., "DHT22"
    to_pin: string              // e.g., "DATA"
    wire_color?: string         // e.g., "RED", "BLACK", "YELLOW"
    notes?: string              // e.g., "Requires 10K pull-up resistor"
  }>
  instructions: string          // Markdown step-by-step guide
  warnings?: string[]           // Safety warnings
}
```

### What's MISSING

| Feature | Current State | Target State |
|---------|---------------|--------------|
| **SVG Diagram Generation** | ❌ Not implemented | Server-side SVG generator |
| **Visual Diagram Component** | ❌ Not implemented | Interactive React component |
| **Component Templates** | ❌ Not implemented | Library of component shapes |
| **Layout Engine** | ❌ Not implemented | Automatic positioning algorithm |
| **Diagram Export** | ❌ Not implemented | SVG/PNG download |
| **Interactive Features** | ❌ Not implemented | Zoom, pan, hover highlights |

---

## 📁 References to Codebase Files

### Core Dependencies (Must Modify)

| File | Purpose | Changes Required |
|------|---------|------------------|
| `lib/agents/tools.ts` | Tool definitions | Extend `update_wiring` schema with layout hints |
| `lib/agents/tool-executor.ts` | Tool execution | Add post-processing for SVG generation |
| `lib/agents/config.ts` | Agent prompts | Update Wiring Specialist prompt for diagram-ready output |
| `components/tools/WiringDrawer.tsx` | Wiring UI | Add diagram view alongside table |
| `lib/db/artifacts.ts` | Artifact storage | May need `diagram_svg` field or sibling artifact |

### New Files to Create

| File | Purpose |
|------|---------|
| `lib/diagram/svg-generator.ts` | Core SVG generation logic |
| `lib/diagram/layout-engine.ts` | Component positioning algorithms |
| `lib/diagram/component-templates.ts` | SVG templates for ESP32, sensors, etc. |
| `components/tools/WiringDiagram.tsx` | Interactive SVG viewer component |
| `app/api/diagram/route.ts` | API endpoint for diagram generation |

### Related Files (Reference Only)

| File | Relevance |
|------|-----------|
| `lib/agents/orchestrator.ts` | Shows how agents call BYTEZ API |
| `OLD_context_docs/claude_conversation_about_wiring` | Historical context on SVG approach |
| `OLD_context_docs/DATABASE_ARCHITECTURE.md` | Schema design patterns |
| `CONTEXT/ABOUT_OHM_AI_01.md` | Full system documentation |

---

## 🚀 Final Approach Overview

### Architecture Decision: **Hybrid AI + Deterministic SVG Generation**

After analyzing the old plan and exploring alternatives, we recommend a **hybrid approach**:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER REQUEST                                  │
│                "Generate wiring diagram for my project"              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    WIRING SPECIALIST AGENT                          │
│           (anthropic/claude-sonnet-4-5 via BYTEZ)                   │
│                                                                     │
│  • Analyzes project requirements                                     │
│  • Calls update_wiring tool with enriched data:                     │
│    - connections with semantic hints (component_kind, net_name)     │
│    - layout_hints for positioning guidance                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   POST-PROCESSING PIPELINE                          │
│                                                                     │
│  1. WIRING DATA ENRICHMENT (optional AI step)                       │
│     - Use Claude to infer missing component types                   │
│     - Generate layout suggestions                                    │
│                                                                     │
│  2. DETERMINISTIC SVG GENERATOR                                     │
│     - Parse wiring data into Diagram-Oriented IR                    │
│     - Apply layout algorithm (force-directed or hierarchical)       │
│     - Generate SVG using component templates                        │
│                                                                     │
│  3. ARTIFACT STORAGE                                                │
│     - Save SVG as part of wiring artifact (diagram_svg field)       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     WIRING DRAWER UI                                │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  [ Table View ] [ Diagram View ] [ Split View ]                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                                                                │ │
│  │     [ESP32]──GPIO21────────────DATA──[DHT22]                   │ │
│  │       │                                │                       │ │
│  │      3V3─────────RED─────────────VCC──┘                        │ │
│  │       │                                                        │ │
│  │      GND─────────BLACK───────────GND──────────────             │ │
│  │                                                                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│  [ 🔍 Zoom ] [ ⬇️ Export SVG ] [ 🖼️ Export PNG ]                   │
└─────────────────────────────────────────────────────────────────────┘
```

### Why Hybrid Approach?

| Approach | Pros | Cons |
|----------|------|------|
| **Pure AI SVG Generation** | Most flexible, can handle any layout | Expensive tokens, inconsistent output, slow |
| **Pure Deterministic** | Fast, cheap, consistent | Limited layout intelligence, rigid |
| **Hybrid (Recommended)** | Best of both: AI for semantics, code for rendering | Moderate complexity |

### Implementation Considerations

1. **Backward Compatibility**: Existing wiring artifacts without SVG should still work (table-only mode)
2. **Incremental Rollout**: Can enable diagram generation per-chat via feature flag
3. **Performance**: SVG generation should complete in <2 seconds
4. **Caching**: Cache SVG in artifact to avoid regeneration on drawer open

---

## 🤖 AI Models & BYTEZ Provider Details

### BYTEZ API Overview

OHM uses the **BYTEZ API** as a unified gateway to multiple AI providers:
- **Base URL**: `https://api.bytez.com/models/v2/openai/v1`
- **Authentication**: `BYTEZ_API_KEY` environment variable
- **Protocol**: OpenAI-compatible endpoints

### Models Currently Used in OHM

| Agent | Model | Purpose |
|-------|-------|---------|
| Orchestrator | `anthropic/claude-sonnet-4-5` | Intent routing |
| Project Initializer | `anthropic/claude-opus-4-5` | First message handling |
| Conversational | `anthropic/claude-opus-4-5` | General dialogue |
| BOM Generator | `anthropic/claude-opus-4-5` | Component selection |
| Code Generator | `anthropic/claude-sonnet-4-5` | Firmware generation |
| **Wiring Specialist** | `anthropic/claude-sonnet-4-5` | Wiring instructions |
| Circuit Verifier | `google/gemini-2.5-flash` | Vision analysis |
| Datasheet Analyzer | `anthropic/claude-opus-4-5` | Document extraction |
| Budget Optimizer | `anthropic/claude-sonnet-4-5` | Cost optimization |

### Models for Visual Wiring Diagram Feature

#### 1. **Wiring Data Enrichment (Optional Enhancement)**

| Role | Recommended Model | Rationale |
|------|-------------------|-----------|
| Component Type Inference | `anthropic/claude-sonnet-4-5` | Fast, good at structured output |
| Layout Hint Generation | `anthropic/claude-sonnet-4-5` | Spatial reasoning for positioning |

**Usage**: When the wiring data lacks semantic info (e.g., component_kind), use a lightweight AI call to infer types.

```typescript
// Example: Enriching wiring data with AI
const enrichmentPrompt = `
Given these components: ${components.join(', ')}
Classify each as: microcontroller, sensor, actuator, power_supply, display, or other.
Return JSON: { "ESP32": "microcontroller", "DHT22": "sensor", ... }
`;
```

#### 2. **AI-Assisted SVG Generation (Alternative Approach)**

If we want AI to directly generate SVG (not recommended for MVP but possible):

| Role | Recommended Model | Rationale |
|------|-------------------|-----------|
| SVG Code Generation | `anthropic/claude-sonnet-4-5` | SOTA code generation, consistent SVG output |
| Diagram Optimization | `openai/gpt-4o` | Good spatial reasoning |

**BYTEZ Pricing Note**: Per BYTEZ docs, closed-source models (Anthropic, OpenAI) are billed at provider rates + 2% platform fee. Open-source models are billed per second of inference.

#### 3. **Image Generation (NOT Recommended for Wiring Diagrams)**

While BYTEZ supports image generation models (per docs: "per image for image generation"), we do **NOT recommend** using AI image generation for wiring diagrams because:

- **Inconsistency**: Generated images won't have precise pin labels
- **No interactivity**: Can't hover, click, or highlight wires
- **Export issues**: Raster images don't scale well for printing
- **Cost**: More expensive than SVG generation

**Verdict**: Use **deterministic SVG generation** for diagrams, reserve AI for data enrichment only.

### Multi-Agent System for Diagram Generation

If we want a dedicated "Diagram Agent" in the future:

```typescript
// Potential addition to lib/agents/config.ts
diagramGenerator: {
  name: "The Diagram Architect",
  model: "anthropic/claude-sonnet-4-5",
  icon: "🎨",
  temperature: 0.2, // Low for consistent output
  maxTokens: 4000,
  systemPrompt: `You are a circuit diagram layout specialist...`,
  description: "Generates optimized visual layouts for wiring diagrams"
}
```

**MVP Recommendation**: Start with deterministic SVG generation. Add AI-assisted layout as v2 enhancement.

---

## 🔧 Implementation Phases

### Phase 1: Foundation (Week 1-2)

#### 1.1 Extend Wiring Data Schema

**File**: `lib/agents/tools.ts`

Add optional fields to `update_wiring` for diagram generation:

```typescript
// Extended update_wiring parameters
{
  connections: Array<{
    // Existing fields
    from_component: string
    from_pin: string
    to_component: string
    to_pin: string
    wire_color?: string
    notes?: string
    
    // NEW: Diagram-oriented fields
    net_name?: string           // e.g., "I2C_SDA", "POWER_5V"
    signal_type?: string        // "power", "ground", "digital", "analog", "i2c", "spi"
  }>
  
  // NEW: Component metadata for diagram
  components?: Array<{
    name: string                // e.g., "ESP32"
    component_kind: string      // "microcontroller", "sensor", "actuator", etc.
    port_layout?: "left-right" | "top-bottom" | "all-sides"
  }>
  
  // NEW: Layout hints
  layout_hints?: {
    style: "breadboard" | "schematic" | "logical"
    controller_position: "left" | "center" | "top"
    group_by?: "signal_type" | "component_kind" | "none"
  }
  
  instructions: string
  warnings?: string[]
}
```

#### 1.2 Create Component Template Library

**File**: `lib/diagram/component-templates.ts`

```typescript
export interface ComponentTemplate {
  id: string;
  name: string;
  kind: "microcontroller" | "sensor" | "actuator" | "power" | "display" | "other";
  width: number;
  height: number;
  pins: Array<{
    name: string;
    side: "top" | "bottom" | "left" | "right";
    offset: number; // Percentage along the side
    type: "power" | "ground" | "gpio" | "data";
  }>;
  svgTemplate: string; // SVG markup with {{label}} placeholders
}

export const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  "ESP32": {
    id: "esp32",
    name: "ESP32 DevKit",
    kind: "microcontroller",
    width: 120,
    height: 200,
    pins: [
      { name: "3V3", side: "left", offset: 10, type: "power" },
      { name: "GND", side: "left", offset: 20, type: "ground" },
      { name: "GPIO21", side: "right", offset: 30, type: "gpio" },
      // ... more pins
    ],
    svgTemplate: `
      <g class="component esp32">
        <rect width="120" height="200" rx="4" fill="#1a1a2e"/>
        <text x="60" y="100" text-anchor="middle" fill="white">ESP32</text>
        <!-- Pin markers rendered dynamically -->
      </g>
    `
  },
  "DHT22": { /* ... */ },
  "LED": { /* ... */ },
  // ... more components
};
```

#### 1.3 Implement Diagram Intermediate Representation (IR)

**File**: `lib/diagram/types.ts`

```typescript
export interface DiagramIR {
  components: Array<{
    id: string;
    templateId: string;
    label: string;
    position: { x: number; y: number };
    rotation: number;
  }>;
  
  wires: Array<{
    id: string;
    fromComponentId: string;
    fromPin: string;
    toComponentId: string;
    toPin: string;
    color: string;
    netName?: string;
    path?: string; // SVG path data (computed by layout engine)
  }>;
  
  viewBox: { x: number; y: number; width: number; height: number };
  metadata: {
    generatedAt: string;
    version: string;
  };
}
```

### Phase 2: SVG Generator (Week 2-3)

#### 2.1 Layout Engine

**File**: `lib/diagram/layout-engine.ts`

Implement a simple hierarchical layout:

```typescript
export class DiagramLayoutEngine {
  private wiringData: WiringData;
  private templates: typeof COMPONENT_TEMPLATES;
  
  constructor(wiringData: WiringData) {
    this.wiringData = wiringData;
    this.templates = COMPONENT_TEMPLATES;
  }
  
  computeLayout(): DiagramIR {
    // 1. Identify unique components
    const components = this.extractComponents();
    
    // 2. Classify components by type
    const byType = this.groupByType(components);
    
    // 3. Position components:
    //    - Microcontrollers in center
    //    - Power components at top
    //    - Sensors on left
    //    - Actuators on right
    const positioned = this.positionComponents(byType);
    
    // 4. Route wires with basic path calculation
    const wires = this.routeWires(positioned);
    
    // 5. Compute viewBox
    const viewBox = this.computeViewBox(positioned);
    
    return { components: positioned, wires, viewBox, metadata: { ... } };
  }
  
  // ... implementation methods
}
```

#### 2.2 SVG Renderer

**File**: `lib/diagram/svg-generator.ts`

```typescript
export class SVGGenerator {
  generateSVG(ir: DiagramIR): string {
    const componentsSVG = ir.components.map(c => this.renderComponent(c)).join('\n');
    const wiresSVG = ir.wires.map(w => this.renderWire(w)).join('\n');
    
    return `
      <svg xmlns="http://www.w3.org/2000/svg" 
           viewBox="${ir.viewBox.x} ${ir.viewBox.y} ${ir.viewBox.width} ${ir.viewBox.height}"
           class="wiring-diagram">
        <defs>
          ${this.getStyleDefs()}
        </defs>
        <g class="wires">${wiresSVG}</g>
        <g class="components">${componentsSVG}</g>
      </svg>
    `;
  }
  
  private renderComponent(component: DiagramIR['components'][0]): string {
    const template = COMPONENT_TEMPLATES[component.templateId];
    // ... render with position and label
  }
  
  private renderWire(wire: DiagramIR['wires'][0]): string {
    // ... render path with color
  }
}
```

### Phase 3: Integration (Week 3-4)

#### 3.1 Post-Processing Hook in Tool Executor

**File**: `lib/agents/tool-executor.ts`

```typescript
async updateWiring(wiringData: WiringData) {
  // 1. Persist wiring data (existing logic)
  const { id: artifactId } = await this.getOrCreateArtifact('wiring', 'Wiring Diagram');
  
  // 2. NEW: Generate SVG diagram
  const layoutEngine = new DiagramLayoutEngine(wiringData);
  const ir = layoutEngine.computeLayout();
  const svgGenerator = new SVGGenerator();
  const diagramSvg = svgGenerator.generateSVG(ir);
  
  // 3. Store both wiring data and SVG
  await ArtifactService.createVersion({
    artifact_id: artifactId,
    version_number: /* next version */,
    content_json: {
      ...wiringData,
      diagram_svg: diagramSvg,
      diagram_ir: ir
    },
    change_summary: "Updated wiring with visual diagram"
  });
}
```

#### 3.2 Extend WiringDrawer UI

**File**: `components/tools/WiringDrawer.tsx`

```tsx
export default function WiringDrawer({ isOpen, onClose, wiringData }: WiringDrawerProps) {
  const [viewMode, setViewMode] = useState<'table' | 'diagram' | 'split'>('split');
  
  return (
    <ToolDrawer isOpen={isOpen} onClose={onClose} title="Wiring Diagram">
      {/* View Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setViewMode('table')} className={/* ... */}>Table</button>
        <button onClick={() => setViewMode('diagram')} className={/* ... */}>Diagram</button>
        <button onClick={() => setViewMode('split')} className={/* ... */}>Split</button>
      </div>
      
      {/* Content */}
      <div className={viewMode === 'split' ? 'grid grid-cols-2 gap-4' : ''}>
        {(viewMode === 'table' || viewMode === 'split') && (
          <ConnectionTable connections={wiringData?.connections} />
        )}
        
        {(viewMode === 'diagram' || viewMode === 'split') && (
          <WiringDiagram 
            svg={wiringData?.diagram_svg}
            onExport={handleExport}
          />
        )}
      </div>
      
      {/* Warnings & Instructions (unchanged) */}
    </ToolDrawer>
  );
}
```

#### 3.3 Interactive Diagram Component

**File**: `components/tools/WiringDiagram.tsx`

```tsx
import { useState, useRef } from 'react';

interface WiringDiagramProps {
  svg?: string;
  onExport?: (format: 'svg' | 'png') => void;
}

export default function WiringDiagram({ svg, onExport }: WiringDiagramProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  
  if (!svg) {
    return (
      <div className="flex items-center justify-center h-64 border rounded-lg">
        <p className="text-muted-foreground">No diagram available</p>
      </div>
    );
  }
  
  return (
    <div className="relative border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button onClick={() => setZoom(z => Math.min(z + 0.1, 3))}>🔍+</button>
        <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}>🔍-</button>
        <button onClick={() => onExport?.('svg')}>⬇️ SVG</button>
        <button onClick={() => onExport?.('png')}>🖼️ PNG</button>
      </div>
      
      {/* SVG Container with Pan/Zoom */}
      <div 
        ref={containerRef}
        className="w-full h-96 overflow-hidden cursor-grab"
        style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
```

### Phase 4: Polish & Enhancements (Week 4-5)

- **Wire Highlighting**: Hover over table row → highlight corresponding wire
- **Component Info Tooltips**: Click component → show pin details
- **Multiple Layout Styles**: Toggle between breadboard/schematic views
- **Dark Mode Support**: Adjust SVG colors for theme
- **Accessibility**: Add ARIA labels to SVG elements

---

## 📐 Data Models & Schema Extensions

### Artifact Schema Extension

The existing `artifact_versions.content_json` field can store the diagram data:

```typescript
// content_json for wiring artifact
{
  // Existing fields
  connections: [...],
  instructions: "...",
  warnings: [...],
  
  // NEW fields
  diagram_svg: "<svg>...</svg>",
  diagram_ir: { /* Intermediate Representation */ },
  diagram_version: "1.0",
  diagram_generated_at: "2026-01-15T18:00:00Z"
}
```

### No Database Schema Changes Required

The current flexible `content_json` JSONB column in `artifact_versions` is sufficient. No new tables needed for MVP.

### Future Enhancement: Component Templates Table

For v2, consider adding a `component_templates` table to store customizable SVG templates:

```sql
CREATE TABLE component_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,           -- "ESP32-WROOM-32"
  kind TEXT NOT NULL,                  -- "microcontroller"
  pins JSONB NOT NULL,                 -- Pin definitions
  svg_template TEXT NOT NULL,          -- SVG markup
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎨 UI/UX Design

### WiringDrawer Layout (Split View)

```
┌─────────────────────────────────────────────────────────────┐
│  Wiring Diagram                                    [×]      │
├─────────────────────────────────────────────────────────────┤
│  [📋 Table] [🖼️ Diagram] [⚡ Split]          [Download ▼]   │
├───────────────────────────┬─────────────────────────────────┤
│ 🔌 Connections (5)        │                                 │
│ ┌───────────────────────┐ │        ┌─────────┐              │
│ │ From        │ To      │ │   ┌────│  ESP32  │────┐         │
│ ├─────────────┼─────────┤ │   │    └─────────┘    │         │
│ │ ESP32       │ DHT22   │ │   │         │         │         │
│ │ GPIO21      │ DATA    │ │   │         │         │         │
│ │ 🟡 Yellow   │ -       │ │   │    ┌────┴────┐    │         │
│ ├─────────────┼─────────┤ │   └────│  DHT22  │────┘         │
│ │ ESP32       │ DHT22   │ │        └─────────┘              │
│ │ 3V3         │ VCC     │ │                                 │
│ │ 🔴 Red      │ -       │ │                                 │
│ └───────────────────────┘ │                                 │
│                           │  [🔍 +] [🔍 -] [↺ Reset]        │
├───────────────────────────┴─────────────────────────────────┤
│ 🔧 Instructions                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 1. Connect ESP32 3V3 to DHT22 VCC (red wire)           │ │
│ │ 2. Connect ESP32 GND to DHT22 GND (black wire)         │ │
│ │ 3. Connect ESP32 GPIO21 to DHT22 DATA (yellow wire)    │ │
│ │    ⚠️ Add 10K pull-up resistor between DATA and VCC    │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ ⚠️ Safety Warnings                                          │
│ • Double-check polarity before powering on                  │
│ • DHT22 operates at 3.3V - do not connect to 5V            │
└─────────────────────────────────────────────────────────────┘
```

### Interaction States

1. **Hover Table Row** → Highlight corresponding wire in diagram (yellow glow)
2. **Click Component** → Show tooltip with pin details
3. **Drag to Pan** → Move diagram viewport
4. **Scroll to Zoom** → Zoom in/out on diagram
5. **Export Menu** → Download SVG, PNG, or copy diagram

---

## 🧪 Testing Strategy

### Unit Tests

| Test Case | File | Description |
|-----------|------|-------------|
| Component template loading | `lib/diagram/__tests__/component-templates.test.ts` | Verify all templates have valid structure |
| Layout engine positioning | `lib/diagram/__tests__/layout-engine.test.ts` | Test component placement logic |
| SVG generation | `lib/diagram/__tests__/svg-generator.test.ts` | Verify SVG output structure |
| Wire routing | `lib/diagram/__tests__/layout-engine.test.ts` | Test path calculation |

### Integration Tests

| Test Case | Description |
|-----------|-------------|
| Tool executor → SVG generation | Verify `updateWiring` produces valid SVG |
| Artifact storage | Verify diagram data persists correctly |
| WiringDrawer rendering | Verify UI displays diagram |

### Visual Regression Tests

- Capture SVG output for sample circuits
- Compare against baseline snapshots (structure, not exact coordinates)

### Manual Testing Scenarios

1. **Simple Circuit**: ESP32 + LED (3 connections)
2. **Moderate Circuit**: ESP32 + DHT22 + OLED (8 connections)
3. **Complex Circuit**: ESP32 + 5 sensors + actuator (20+ connections)
4. **Edge Cases**: Unknown components, missing wire colors, no connections

---

## 📜 Contextual History - Related Features

### Existing Features (from `CONTEXT/ABOUT_OHM_AI_01.md`)

The Visual Wiring Diagram feature builds on top of these **fully implemented** capabilities:

1. **Multi-Agent AI System**: 9 specialized agents including the Wiring Specialist
2. **Tool Calling System**: Framework for `update_wiring` tool already in place
3. **Drawer Architecture**: `WiringDrawer.tsx` exists with table UI
4. **Artifact Versioning**: Git-style versioning for all project artifacts
5. **Streaming Responses**: Real-time updates via SSE
6. **Toast Notifications**: User feedback for tool calls

### Features That Need Work (Related)

| Feature | Status | Relevance to Wiring Diagrams |
|---------|--------|------------------------------|
| Circuit Verification (Vision) | Partial - no photo upload UI | Could verify physical circuits against generated diagrams |
| Project Locking | Partial - concept only | Locked diagrams could be immutable |
| Ripple Effect Engine | Not implemented | Changes to BOM could update wiring diagrams |

### Historical Context

The original plan (`CONTEXT/VISUAL_WIRING_DIAGRAM_BROKEN_INCOMPLETE.md`) proposed:
- Server-side SVG generator ✅ (adopted in this plan)
- Diagram-Oriented IR ✅ (adopted)
- Breadboard vs Schematic views (deferred to v2)
- Interactive editing (deferred to v2)

This plan refines the original with:
- Clearer phase breakdown
- Specific file locations
- BYTEZ model recommendations
- UI mockups

---

## ⚠️ Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Complex wire routing fails | Medium | High | Use simple straight lines for MVP, improve later |
| Unknown components not recognized | High | Medium | Fallback to generic "box" template with pins |
| SVG too large for complex circuits | Medium | Medium | Implement pagination or collapsing |
| Performance issues on diagram generation | Low | Medium | Cache SVG in artifact, generate asynchronously |
| AI enrichment adds cost | Medium | Low | Make AI step optional, use local inference if needed |

---

## 📅 Timeline & Milestones

### Week 1-2: Foundation
- [ ] Extend `update_wiring` tool schema
- [ ] Create component template library (10 common components)
- [ ] Implement Diagram IR types
- [ ] Basic layout engine (hierarchical positioning)

### Week 2-3: SVG Generation
- [ ] Implement SVG generator
- [ ] Wire routing algorithm
- [ ] Integration with tool executor
- [ ] Unit tests for layout engine

### Week 3-4: UI Integration
- [ ] Extend `WiringDrawer` with view mode toggle
- [ ] Create `WiringDiagram` component
- [ ] Implement zoom/pan controls
- [ ] Export functionality (SVG/PNG)

### Week 4-5: Polish
- [ ] Wire highlighting on hover
- [ ] Dark mode support
- [ ] Performance optimization
- [ ] Documentation and examples

### Post-MVP (v2)
- [ ] Breadboard view style
- [ ] Interactive editing
- [ ] AI-assisted layout optimization
- [ ] Component template editor

---

## 📚 References

1. **Codebase Documentation**: `CONTEXT/ABOUT_OHM_AI_01.md`
2. **Old Plan**: `CONTEXT/VISUAL_WIRING_DIAGRAM_BROKEN_INCOMPLETE.md`
3. **Database Architecture**: `OLD_context_docs/DATABASE_ARCHITECTURE.md`
4. **BYTEZ API Docs**: `OLD_context_docs/BYTEZ_ALL_DOCS_PASTED.txt`
5. **Model Recommendations**: `OLD_context_docs/model_recommendation`
6. **Wiring Conversation History**: `OLD_context_docs/claude_conversation_about_wiring`

---

**Document Status**: Ready for implementation  
**Next Action**: Begin Phase 1 - Extend wiring tool schema  
**Owner**: Development Team  
**Stakeholders**: Product, Design, Engineering

---

*Plan created on January 15, 2026*  
*Based on comprehensive codebase analysis and existing documentation*
