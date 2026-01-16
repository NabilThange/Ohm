/**
 * BYTEZ Image Generator Service
 * Handles text-to-image generation via BYTEZ API with:
 * - Correct endpoint structure (model-specific URLs)
 * - Exponential backoff retry logic
 * - Supabase Storage upload
 * - Proper error handling
 * - KeyManager integration for API key rotation
 */

import { supabase } from '@/lib/supabase/client';
import { KeyManager } from '@/lib/agents/key-manager';

interface ImageGenerationResult {
  url: string;
  storagePath: string;
  model: string;
  prompt: string;
  generatedAt: string;
}

export class ImageGenerator {
  private readonly keyManager: KeyManager;
  private readonly models = {
    dreamlikePhotoreal: 'dreamlike-art/dreamlike-photoreal-2.0',
    stableDiffusionXL: 'stabilityai/stable-diffusion-xl-base-1.0',
    stableDiffusion21: 'stabilityai/stable-diffusion-2-1'
  };

  constructor() {
    // Use KeyManager instead of reading env vars directly
    this.keyManager = KeyManager.getInstance();
    console.log(`[ImageGenerator] Initialized with KeyManager (${this.keyManager.getTotalKeys()} keys available)`);
  }

  /**
   * Generate breadboard wiring photo using BYTEZ API
   * Includes retry logic and uploads to Supabase Storage
   */
  async generateBreadboardImage(
    prompt: string,
    chatId: string
  ): Promise<ImageGenerationResult> {
    const model = this.models.dreamlikePhotoreal; // Best for photorealistic electronics

    console.log(`[ImageGenerator] Starting generation with model: ${model}`);
    console.log(`[ImageGenerator] Prompt length: ${prompt.length} chars`);

    return this.generateWithRetry(prompt, model, chatId);
  }

  /**
   * Generate image with exponential backoff retry logic
   */
  private async generateWithRetry(
    prompt: string,
    model: string,
    chatId: string,
    maxRetries = 3
  ): Promise<ImageGenerationResult> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[ImageGenerator] Attempt ${attempt}/${maxRetries}`);

        // Call BYTEZ API with CORRECT endpoint structure
        const imageUrl = await this.callBytezAPI(prompt, model);

        // Download image from BYTEZ URL
        console.log('[ImageGenerator] Downloading image from BYTEZ...');
        const imageBlob = await this.downloadImage(imageUrl);

        // Upload to Supabase Storage
        console.log('[ImageGenerator] Uploading to Supabase Storage...');
        const { storagePath, publicUrl } = await this.uploadToStorage(imageBlob, chatId);

        console.log('[ImageGenerator] ✅ Image generation successful!');
        console.log(`[ImageGenerator] Storage path: ${storagePath}`);
        console.log(`[ImageGenerator] Public URL: ${publicUrl}`);

        return {
          url: publicUrl,
          storagePath,
          model,
          prompt,
          generatedAt: new Date().toISOString()
        };

      } catch (error: any) {
        console.error(`[ImageGenerator] Attempt ${attempt} failed:`, error.message);

        // Don't retry on certain errors
        if (this.isNonRetriableError(error)) {
          throw error;
        }

        // If this was the last attempt, throw
        if (attempt === maxRetries) {
          throw new Error(`Image generation failed after ${maxRetries} attempts: ${error.message}`);
        }

        // Exponential backoff: 2s, 4s, 8s
        const delayMs = Math.pow(2, attempt) * 1000;
        console.log(`[ImageGenerator] Retrying in ${delayMs}ms...`);
        await this.sleep(delayMs);
      }
    }

    throw new Error('Image generation failed - max retries exceeded');
  }

  /**
   * Call BYTEZ API with CORRECT endpoint structure
   * Returns the image URL (not base64!)
   * Uses KeyManager for automatic key rotation on failures
   */
  private async callBytezAPI(prompt: string, model: string): Promise<string> {
    // Get current API key from KeyManager
    const apiKey = this.keyManager.getCurrentKey();

    if (!apiKey) {
      throw new Error('No BYTEZ API keys available');
    }

    // CORRECT: Model-specific endpoint, NOT /v1/images/generations
    const endpoint = `https://api.bytez.com/models/v2/${model}`;

    console.log(`[ImageGenerator] Calling ${endpoint} with key #${this.keyManager.getTotalKeys()}`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': apiKey, // NO "Bearer" prefix!
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: prompt  // "text" not "prompt"!
        })
      });

      if (!response.ok) {
        const errorText = await response.text();

        // Check if it's an auth error (bad API key)
        if (response.status === 401 || response.status === 403) {
          console.error(`[ImageGenerator] API key failed with ${response.status}`);
          this.keyManager.markCurrentKeyAsFailed();

          // Try to rotate to next key
          if (this.keyManager.rotateKey()) {
            console.log('[ImageGenerator] Retrying with next API key...');
            // Recursive retry with new key
            return this.callBytezAPI(prompt, model);
          } else {
            throw new Error('All BYTEZ API keys exhausted');
          }
        }

        throw new Error(`BYTEZ API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // BYTEZ returns: { error: string | null, output: string }
      if (data.error) {
        throw new Error(`BYTEZ generation error: ${data.error}`);
      }

      if (!data.output) {
        throw new Error('BYTEZ response missing output field');
      }

      // Record successful API call
      this.keyManager.recordSuccess();

      console.log(`[ImageGenerator] Received image URL: ${data.output}`);
      return data.output;
    } catch (error: any) {
      // If it's a network error or other non-auth error, just throw
      if (!error.message?.includes('exhausted')) {
        console.error('[ImageGenerator] API call failed:', error.message);
      }
      throw error;
    }
  }

  /**
   * Download image from URL to blob
   */
  private async downloadImage(url: string): Promise<Blob> {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log(`[ImageGenerator] Downloaded image: ${(blob.size / 1024).toFixed(2)} KB`);

    return blob;
  }

  /**
   * Upload image blob to Supabase Storage
   * Returns storage path and public URL
   */
  private async uploadToStorage(
    blob: Blob,
    chatId: string
  ): Promise<{ storagePath: string; publicUrl: string }> {
    const timestamp = Date.now();
    const storagePath = `${chatId}/wiring-${timestamp}.png`;

    const { data, error } = await supabase.storage
      .from('wiring-images')
      .upload(storagePath, blob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase Storage upload failed: ${error.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('wiring-images')
      .getPublicUrl(storagePath);

    return { storagePath, publicUrl };
  }

  /**
   * Check if error should not be retried
   */
  private isNonRetriableError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';

    // Don't retry on:
    // - Invalid API key
    // - Malformed request
    // - Content policy violations
    return message.includes('unauthorized') ||
      message.includes('invalid key') ||
      message.includes('api key') ||
      message.includes('forbidden') ||
      message.includes('content policy');
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if service is properly configured
   */
  isConfigured(): boolean {
    return this.keyManager.getHealthyKeyCount() > 0;
  }

  /**
   * Get available models
   */
  getAvailableModels(): typeof this.models {
    return { ...this.models };
  }
}
