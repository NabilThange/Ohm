# 🚨 CRITICAL CORRECTIONS APPLIED TO VISUAL_WIRING_DIAGRAM_IMPROVED.md

**Date:** January 15, 2026  
**Status:** Plan has been partially corrected - Manual review required

---

## ✅ CORRECTIONS ALREADY APPLIED

### 1. Updated Header Section
- Changed status from "READY TO IMPLEMENT" to "CRITICAL CORRECTIONS APPLIED"
- Added critical updates warning section
- Created comparison table showing original vs corrected decisions

### 2. Corrected Data Flow Diagram
- Removed Visual Prompt Engineer Agent (LLM-based)
- Added Template-Based Prompt Builder (deterministic)
- Fixed BYTEZ model name: `dreamlike-art/dreamlike-photoreal-2.0`
- Changed storage from base64 to Supabase Storage
- Added retry logic and status tracking

### 3. Added Phase 0 (API Testing)
- MANDATORY testing phase before any coding
- Curl commands to verify BYTEZ endpoint
- Success criteria checklist

### 4. Rewrote Phase 1 (Prompt Builder)
- Complete template-based implementation
- No LLM calls needed
- Deterministic prompt generation
- Dynamic image size calculation

---

## ⚠️ REMAINING SECTIONS TO UPDATE MANUALLY

### Phase 2: Image Generation Service
**File Location:** Lines ~302-400

**Current Issues:**
```typescript
// ❌ WRONG - Lines need to be replaced
private baseUrl = 'https://api.bytez.com/v1';
model: 'openai/gpt-image-1.5'
response_format: 'b64_json'
const imageBase64 = data.data[0].b64_json;
```

**Required Fix:**
```typescript
// ✅ CORRECT
private readonly BYTEZ_MODELS = {
  dreamlikePhotoreal: 'dreamlike-art/dreamlike-photoreal-2.0',
  sdxl: 'stabilityai/stable-diffusion-xl-base-1.0'
};

async generateImage(prompt: string, retries = 3): Promise<string> {
  const model = this.BYTEZ_MODELS.dreamlikePhotoreal;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(
        `https://api.bytez.com/models/v2/${model}`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.bytezApiKey, // No "Bearer" prefix!
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ text: prompt }) // "text" not "prompt"!
        }
      );

      if (!response.ok) {
        throw new Error(`BYTEZ API error: ${response.status}`);
      }

      const { error, output: imageUrl } = await response.json();
      
      if (error) {
        throw new Error(`Image generation failed: ${error}`);
      }

      // Fetch image from URL
      const imageResponse = await fetch(imageUrl);
      const imageBlob = await imageResponse.blob();
      
      // Upload to Supabase Storage
      const storagePath = `${Date.now()}-breadboard.png`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('wiring-images')
        .upload(storagePath, imageBlob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('wiring-images')
        .getPublicUrl(storagePath);

      return publicUrl;
      
    } catch (error) {
      if (attempt === retries) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  
  throw new Error('Image generation failed after retries');
}
```

---

### Phase 3: Visual Wiring Pipeline
**File Location:** Lines ~400-554

**Key Changes Needed:**

1. **Remove Agent Call** (lines ~458-467)
```typescript
// ❌ DELETE THIS:
const promptResult = await runAgent('visualPromptEngineer', { ... });
const prompts = JSON.parse(promptResult.content);

// ✅ REPLACE WITH:
import { PromptBuilder } from './prompt-builder';
const prompt = PromptBuilder.buildBreadboardPrompt(wiringData);
```

2. **Add Status Tracking**
```typescript
// Update artifact with status: 'generating'
await ArtifactService.createVersion({
  artifact_id: artifactId,
  version_number: currentVersion + 1,
  content_json: {
    ...wiringData,
    ai_images: {
      status: 'generating',
      progress: 0,
      current_step: 'Building prompt...'
    }
  },
  change_summary: 'Starting image generation'
});

// Update progress during generation
await updateProgress(artifactId, 'Generating image...', 50);

// Final update with image
await ArtifactService.createVersion({
  artifact_id: artifactId,
  version_number: currentVersion + 2,
  content_json: {
    ...wiringData,
    ai_images: {
      status: 'completed',
      progress: 100,
      breadboard: {
        url: publicUrl,
        storage_path: storagePath,
        prompt: prompt,
        model: 'dreamlike-art/dreamlike-photoreal-2.0',
        generated_at: new Date().toISOString()
      }
    }
  },
  change_summary: 'Added AI breadboard image'
});
```

3. **Add Error Handling**
```typescript
catch (error) {
  // Don't silently fail!
  await ArtifactService.createVersion({
    artifact_id: artifactId,
    version_number: currentVersion + 2,
    content_json: {
      ...wiringData,
      ai_images: {
        status: 'failed',
        error: error.message,
        retry_count: 3,
        failed_at: new Date().toISOString()
      }
    },
    change_summary: 'Image generation failed'
  });
}
```

---

### Phase 4: WiringDrawer UI Updates
**File Location:** Lines ~650-870

**Key Changes:**

1. **Update Status Detection** (lines ~682-684)
```typescript
// ❌ OLD:
const isGenerating = diagramMetadata?.ai_images === undefined && diagramSvg !== null;

// ✅ NEW:
const imageStatus = diagramMetadata?.ai_images?.status;
const isGenerating = imageStatus === 'generating';
const hasFailed = imageStatus === 'failed';
const imageUrl = diagramMetadata?.ai_images?.breadboard?.url; // Not base64!
const errorMessage = diagramMetadata?.ai_images?.error;
const progress = diagramMetadata?.ai_images?.progress || 0;
```

2. **Add Error State UI** (after line ~812)
```tsx
{hasFailed && (
  <div className="flex flex-col items-center justify-center py-12 gap-4">
    <AlertTriangle className="h-12 w-12 text-red-500" />
    <div className="text-center">
      <p className="font-medium text-red-500">Image generation failed</p>
      <p className="text-sm text-muted-foreground mt-1">{errorMessage}</p>
      <Button 
        className="mt-4" 
        onClick={handleRegenerate}
        disabled={isRegenerating}
      >
        Try Again
      </Button>
    </div>
  </div>
)}
```

3. **Add Progress Bar** (lines ~806-812)
```tsx
{isGenerating && (
  <div className="flex flex-col items-center justify-center py-12 gap-4">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <div className="text-center w-full max-w-md">
      <p className="font-medium">Generating photorealistic breadboard diagram...</p>
      <p className="text-sm text-muted-foreground mt-1">
        {diagramMetadata?.ai_images?.current_step || 'Processing...'}
      </p>
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{progress}%</p>
      </div>
    </div>
  </div>
)}
```

4. **Fix Image Source** (line ~837)
```tsx
// ❌ OLD:
<img src={breadboardImage} alt="..." />

// ✅ NEW:
<img src={imageUrl} alt="Breadboard wiring diagram" />
```

---

### Phase 3 (Tool Executor): Fix Version Conflict
**File Location:** Lines ~565-645

**Critical Fix for Race Condition:**

```typescript
// ❌ WRONG (lines ~615-621):
await ArtifactService.createVersion({
  artifact_id: artifactId,
  version_number: (artifact?.current_version.version_number || 0) + 2, // BAD!
  content_json: args,
  diagram_svg: svg,
  change_summary: 'Added SVG schematic'
});

// ✅ CORRECT:
// Re-fetch artifact to get latest version number
const refreshedArtifact = await ArtifactService.getLatestArtifact(
  this.chatId,
  'wiring'
);

const currentVersionNum = refreshedArtifact?.artifact?.current_version || 0;

await ArtifactService.createVersion({
  artifact_id: artifactId,
  version_number: currentVersionNum + 1, // Always use latest!
  content_json: args,
  diagram_svg: svg,
  change_summary: 'Added SVG schematic'
});
```

---

## 📋 UPDATED TIMELINE

| Phase | Original | Corrected | Reason |
|-------|----------|-----------|--------|
| **Phase 0: API Testing** | 0 hrs | **2 hrs** | NEW - Critical validation |
| Phase 1: Prompt Builder | 30 min (agent) | **1 hr** | Template-based approach |
| Phase 2: Image Generator | 2 hrs | **4 hrs** | Complete BYTEZ rewrite + storage |
| Phase 3: Pipeline | 1 hr | **2 hrs** | Remove agent, add status tracking |
| Phase 4: UI Updates | 2 hrs | **3 hrs** | Error states, progress bars |
| Phase 5: AIAssistantUI | 30 min | 30 min | Unchanged |
| Phase 6: Env Vars | 10 min | 10 min | Unchanged |
| Phase 7: Setup Storage | 0 hrs | **1 hr** | NEW - Supabase bucket config |
| Testing & Fixes | 3 hrs | **5 hrs** | More edge cases |
| **TOTAL** | **10-12 hrs** | **18-20 hrs** | Nearly 2x original estimate |

---

## 🎯 IMMEDIATE NEXT STEPS

1. **Review VISUAL_WIRING_DIAGRAM_IMPROVED.md** - First 300 lines have been corrected
2. **Manually update remaining sections** using the corrections above
3. **Test BYTEZ API** using Phase 0 curl commands
4. **Create Supabase Storage bucket** named `wiring-images` with public access
5. **Implement in order**: Phase 1 → Phase 2 → Phase 3 → Phase 4

---

## 🔧 SUPABASE STORAGE SETUP

Before coding, configure storage:

```sql
-- 1. Create storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('wiring-images', 'wiring-images', true);

-- 2. Set upload policy (allow authenticated users)
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'wiring-images');

-- 3. Set public read policy
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'wiring-images');
```

Test in Supabase Dashboard → Storage → Create new bucket → wiring-images → Public

---

## ✅ WHAT'S STILL GOOD

The original plan got these things RIGHT:
- ✅ Hybrid SVG + AI approach
- ✅ Async generation pattern
- ✅ Realtime updates via Supabase
- ✅ 4-tab drawer UI design
- ✅ Overall architecture and data flow

---

*Corrections applied: January 15, 2026*  
*Status: 30% complete - Manual updates required for remaining 70%*
