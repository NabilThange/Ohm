import { ArtifactService } from '@/lib/db/artifacts';
import type { ToolCall } from './tools';
import { Database } from '@/lib/supabase/types';

type ArtifactType = Database['public']['Tables']['artifacts']['Row']['type'];

/**
 * ToolExecutor - Handles execution of tool calls and persists data to database
 * Each tool call creates or updates an artifact in the artifacts/artifact_versions tables
 */
export class ToolExecutor {
    private chatId: string;

    constructor(chatId: string) {
        this.chatId = chatId;
    }

    /**
     * Helper to get or create an artifact, returning consistent { id, currentVersion, existingVersion } structure
     */
    private async getOrCreateArtifact(type: ArtifactType, title: string): Promise<{
        id: string;
        currentVersion: number;
        existingVersion: any | null;
    }> {
        const existing = await ArtifactService.getLatestArtifact(this.chatId, type);

        if (existing && existing.artifact) {
            return {
                id: existing.artifact.id,
                currentVersion: existing.artifact.current_version || 0,
                existingVersion: existing.version
            };
        }

        // Create new artifact
        console.log(`[ToolExecutor] Creating new ${type} artifact`);
        const created = await ArtifactService.createArtifact("system", {
            chat_id: this.chatId,
            type: type,
            title: title
        });

        return {
            id: created.id,
            currentVersion: 0,
            existingVersion: null
        };
    }

    /**
     * Execute a tool call by routing to the appropriate handler
     */
    async executeToolCall(toolCall: ToolCall): Promise<any> {
        console.log(`🔧 [ToolExecutor] Executing tool: ${toolCall.name}`);

        try {
            switch (toolCall.name) {
                // ========================================
                // DRAWER OPENING TOOLS
                // ========================================
                case 'open_context_drawer':
                    return { success: true, action: 'open_drawer', drawer: 'context' };

                case 'open_bom_drawer':
                    return { success: true, action: 'open_drawer', drawer: 'bom' };

                case 'open_code_drawer':
                    return { success: true, action: 'open_drawer', drawer: 'code' };

                case 'open_wiring_drawer':
                    return { success: true, action: 'open_drawer', drawer: 'wiring' };

                case 'open_budget_drawer':
                    return { success: true, action: 'open_drawer', drawer: 'budget' };

                // ========================================
                // CONTENT UPDATE TOOLS
                // ========================================
                case 'update_context':
                    return await this.updateContext(toolCall.arguments.context);

                case 'update_mvp':
                    return await this.updateMVP(toolCall.arguments.mvp);

                case 'update_prd':
                    return await this.updatePRD(toolCall.arguments.prd);

                case 'update_bom':
                    return await this.updateBOM(toolCall.arguments);

                case 'add_code_file':
                    return await this.addCodeFile(toolCall.arguments as { filename: string; language: string; content: string; description?: string });

                case 'update_wiring':
                    return await this.updateWiring(toolCall.arguments as { connections: any[]; instructions: string; warnings?: string[] });

                case 'update_budget':
                    return await this.updateBudget(toolCall.arguments as { originalCost: number; optimizedCost: number; savings?: string; recommendations: any[]; bulkOpportunities?: string[]; qualityWarnings?: string[] });

                default:
                    throw new Error(`Unknown tool: ${toolCall.name}`);
            }
        } catch (error: any) {
            console.error(`❌ [ToolExecutor] Failed to execute ${toolCall.name}:`, error.message);
            throw error;
        }
    }

    /**
     * Update project context artifact
     */
    private async updateContext(context: string) {
        const { id: artifactId, currentVersion } = await this.getOrCreateArtifact('context', 'Project Context');

        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content: context,
            change_summary: "Updated via tool call"
        });

        console.log(`✅ [ToolExecutor] Context updated (version ${version.version_number})`);
        return { success: true, artifact_id: artifactId, version: version.version_number };
    }

    /**
     * Update MVP specification artifact
     */
    private async updateMVP(mvp: string) {
        const { id: artifactId, currentVersion } = await this.getOrCreateArtifact('mvp', 'MVP Specification');

        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content: mvp,
            change_summary: "Updated via tool call"
        });

        console.log(`✅ [ToolExecutor] MVP updated (version ${version.version_number})`);
        return { success: true, artifact_id: artifactId, version: version.version_number };
    }

    /**
     * Update PRD artifact
     */
    private async updatePRD(prd: string) {
        const { id: artifactId, currentVersion } = await this.getOrCreateArtifact('prd', 'Product Requirements');

        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content: prd,
            change_summary: "Updated via tool call"
        });

        console.log(`✅ [ToolExecutor] PRD updated (version ${version.version_number})`);
        return { success: true, artifact_id: artifactId, version: version.version_number };
    }

    /**
     * Update BOM artifact with structured JSON data
     */
    private async updateBOM(bomData: any) {
        const { id: artifactId, currentVersion } = await this.getOrCreateArtifact('bom', bomData.project_name || 'Bill of Materials');

        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content_json: bomData,
            change_summary: "Updated via tool call"
        });

        console.log(`✅ [ToolExecutor] BOM updated: ${bomData.components?.length || 0} components, $${bomData.totalCost}`);
        return { success: true, artifact_id: artifactId, version: version.version_number };
    }

    /**
     * Add a code file to the code artifact
     * Multiple files are accumulated in the same artifact's content_json.files array
     * Includes retry logic to handle version conflicts when multiple files are added concurrently
     */
    private async addCodeFile(
        fileData: { filename: string; language: string; content: string; description?: string },
        retryCount = 0,
        maxRetries = 3
    ): Promise<{ success: boolean; artifact_id: string; version: number; file_count: number }> {
        try {
            const { id: artifactId, currentVersion, existingVersion } = await this.getOrCreateArtifact('code', 'Generated Code');

            // Get existing files from the latest version
            const contentJson = existingVersion?.content_json as { files?: any[] } | null;
            const existingFiles = contentJson?.files || [];

            // Add or update the file
            const fileIndex = existingFiles.findIndex((f: any) => f.path === fileData.filename);
            const newFile = {
                path: fileData.filename,
                language: fileData.language,
                content: fileData.content,
                description: fileData.description || ''
            };

            if (fileIndex >= 0) {
                existingFiles[fileIndex] = newFile;
                console.log(`[ToolExecutor] Updating existing file: ${fileData.filename}`);
            } else {
                existingFiles.push(newFile);
                console.log(`[ToolExecutor] Adding new file: ${fileData.filename} (attempt ${retryCount + 1}/${maxRetries + 1})`);
            }

            // Create new version with updated file list
            const version = await ArtifactService.createVersion({
                artifact_id: artifactId,
                version_number: currentVersion + 1,
                content_json: { files: existingFiles },
                change_summary: `${fileIndex >= 0 ? 'Updated' : 'Added'} ${fileData.filename}`
            });

            console.log(`✅ [ToolExecutor] Code file processed: ${fileData.filename} (${existingFiles.length} total files, version ${version.version_number})`);
            return { success: true, artifact_id: artifactId, version: version.version_number, file_count: existingFiles.length };

        } catch (error: any) {
            // Check if it's a duplicate version error
            const isDuplicateVersion = error.message?.includes('duplicate key value') &&
                error.message?.includes('artifact_versions_artifact_id_version_number_key');

            if (isDuplicateVersion && retryCount < maxRetries) {
                console.warn(`[ToolExecutor] ⚠️ Version conflict for ${fileData.filename}, retrying... (attempt ${retryCount + 1}/${maxRetries})`);

                // Wait a bit before retrying (exponential backoff)
                const delayMs = Math.pow(2, retryCount) * 100; // 100ms, 200ms, 400ms
                await new Promise(resolve => setTimeout(resolve, delayMs));

                // Retry with fresh version number
                return this.addCodeFile(fileData, retryCount + 1, maxRetries);
            }

            // If not a version conflict or max retries exceeded, throw the error
            console.error(`❌ [ToolExecutor] Failed to add code file ${fileData.filename}:`, error.message);
            throw error;
        }
    }

    /**
     * Update wiring diagram artifact with visual generation
     * Generates SVG schematic (sync) and triggers AI breadboard image (async)
     */
    private async updateWiring(wiringData: { connections: any[]; instructions: string; warnings?: string[] }) {
        const { id: artifactId, currentVersion } = await this.getOrCreateArtifact('wiring', 'Wiring Diagram');

        // Step 1: Save wiring JSON to artifact (IMMEDIATE)
        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content_json: wiringData,
            content: wiringData.instructions, // Store markdown instructions in content field
            change_summary: "Updated wiring connections"
        });

        console.log(`✅ [ToolExecutor] Wiring updated: ${wiringData.connections?.length || 0} connections`);

        // Step 2: Generate visual diagrams (SVG sync + AI async)
        try {
            const { VisualWiringPipeline } = await import('@/lib/diagram/visual-wiring-pipeline');
            const pipeline = new VisualWiringPipeline();

            // Generate SVG synchronously (fast, ~500ms)
            console.log('[ToolExecutor] Generating SVG schematic...');
            const svg = await pipeline.generateSVG(wiringData);

            // Re-fetch artifact to get latest version number (avoid race condition)
            const refreshed = await ArtifactService.getLatestArtifact(this.chatId, 'wiring');
            const latestVersion = refreshed?.artifact?.current_version || currentVersion + 1;

            // Update artifact with SVG immediately
            await ArtifactService.createVersion({
                artifact_id: artifactId,
                version_number: latestVersion + 1,
                content_json: wiringData,
                content: wiringData.instructions,
                diagram_svg: svg,
                change_summary: 'Added SVG schematic'
            });

            console.log('[ToolExecutor] ✅ SVG schematic generated and saved');

            // Trigger async AI image generation (don't await - runs in background)
            if (pipeline.isAIGenerationAvailable()) {
                console.log('[ToolExecutor] Starting background AI image generation...');
                pipeline.generateAIImages(this.chatId, artifactId, wiringData)
                    .then(() => {
                        console.log('[ToolExecutor] ✅ Background AI image generation completed');
                    })
                    .catch(err => {
                        console.error('[ToolExecutor] ❌ Background AI image generation failed:', err.message);
                    });
            } else {
                console.log('[ToolExecutor] ⚠️  AI image generation not available (BYTEZ_API_KEY not configured)');
            }

        } catch (error: any) {
            console.error('[ToolExecutor] ❌ Error in visual wiring pipeline:', error.message);
            // Don't fail the whole tool call if visual generation fails
            // User still gets the wiring table and instructions
        }

        return {
            success: true,
            artifact_id: artifactId,
            version: version.version_number,
            message: 'Wiring diagram updated successfully. Visual diagrams are being generated.'
        };
    }

    /**
     * Update budget optimization artifact
     */
    private async updateBudget(budgetData: { originalCost: number; optimizedCost: number; savings?: string; recommendations: any[]; bulkOpportunities?: string[]; qualityWarnings?: string[] }) {
        const { id: artifactId, currentVersion } = await this.getOrCreateArtifact('budget', 'Budget Optimization');

        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content_json: budgetData,
            change_summary: "Updated via tool call"
        });

        const savings = budgetData.originalCost - budgetData.optimizedCost;
        console.log(`✅ [ToolExecutor] Budget updated: $${budgetData.originalCost} → $${budgetData.optimizedCost} (save $${savings.toFixed(2)})`);
        return { success: true, artifact_id: artifactId, version: version.version_number };
    }
}
