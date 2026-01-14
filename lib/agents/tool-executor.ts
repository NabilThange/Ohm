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
     */
    private async addCodeFile(fileData: { filename: string; language: string; content: string; description?: string }) {
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
            console.log(`[ToolExecutor] Adding new file: ${fileData.filename}`);
        }

        // Create new version with updated file list
        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content_json: { files: existingFiles },
            change_summary: `${fileIndex >= 0 ? 'Updated' : 'Added'} ${fileData.filename}`
        });

        console.log(`✅ [ToolExecutor] Code file processed: ${fileData.filename} (${existingFiles.length} total files)`);
        return { success: true, artifact_id: artifactId, version: version.version_number, file_count: existingFiles.length };
    }

    /**
     * Update wiring diagram artifact
     */
    private async updateWiring(wiringData: { connections: any[]; instructions: string; warnings?: string[] }) {
        const { id: artifactId, currentVersion } = await this.getOrCreateArtifact('wiring', 'Wiring Diagram');

        const version = await ArtifactService.createVersion({
            artifact_id: artifactId,
            version_number: currentVersion + 1,
            content_json: wiringData,
            content: wiringData.instructions, // Store markdown instructions in content field
            change_summary: "Updated via tool call"
        });

        console.log(`✅ [ToolExecutor] Wiring updated: ${wiringData.connections?.length || 0} connections`);
        return { success: true, artifact_id: artifactId, version: version.version_number };
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
