
export interface BOMComponent {
    name: string;
    partNumber: string;
    quantity: number;
    voltage?: string;
    current?: string;
    estimatedCost?: number;
    supplier?: string;
    link?: string;
    notes?: string;
}

export interface BOMData {
    project_name?: string;
    summary?: string;
    components: BOMComponent[];
    totalCost?: number;
    powerAnalysis?: {
        totalCurrent?: string;
        recommendedSupply?: string;
    };
    warnings?: string[];
}

export interface CodeFile {
    path: string;
    content: string;
}

export interface CodeData {
    files: CodeFile[];
}

export interface ProjectContextData {
    context: string | null;
    mvp: string | null;
    prd: string | null;
}

/**
 * Enhanced BOM Parser - Handles multiple formats
 * 1. XML-style tags: <BOM_CONTAINER>...</BOM_CONTAINER>
 * 2. Markdown code blocks with BOM labels
 * 3. Plain JSON with project_name field
 */
export const extractBOMFromMessage = (content: string): BOMData | null => {
    // Pattern 1: XML-style tags <BOM_CONTAINER>...</BOM_CONTAINER>
    let match = content.match(/<BOM_CONTAINER>([\s\S]*?)<\/BOM_CONTAINER>/);

    // Pattern 2: Markdown code block with BOM/Bill of Materials label
    if (!match) {
        match = content.match(/(?:BOM|Bill of Materials)[\s\S]*?```(?:json)?\s*(\{[\s\S]*?"components"\s*:[\s\S]*?\})\s*```/i);
    }

    // Pattern 3: Just look for JSON with "project_name" and "components" (last resort)
    if (!match) {
        match = content.match(/(\{\s*"project_name"[\s\S]*?"components"\s*:[\s\S]*?\})/);
    }

    if (match && match[1]) {
        try {
            // Remove markdown code blocks if present
            const cleanJson = match[1].replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            console.log("[Parser] ✅ BOM extracted successfully");
            return parsed;
        } catch (e) {
            console.error("[Parser] ❌ Failed to parse BOM JSON", e);
            console.log("[Parser] Raw content:", match[1].substring(0, 200));
            return null;
        }
    }
    return null;
};

/**
 * Enhanced Code Parser - Handles multiple formats
 * 1. XML-style tags: <CODE_CONTAINER>...</CODE_CONTAINER>
 * 2. Markdown code blocks with Code/Firmware labels
 * 3. Plain JSON with "files" array
 */
export const extractCodeFromMessage = (content: string): CodeData | null => {
    // Pattern 1: XML-style tags <CODE_CONTAINER>...</CODE_CONTAINER>
    let match = content.match(/<CODE_CONTAINER>([\s\S]*?)<\/CODE_CONTAINER>/);

    // Pattern 2: Markdown code block with Code/Firmware label
    if (!match) {
        match = content.match(/(?:Code|Firmware)[\s\S]*?```(?:json)?\s*(\{[\s\S]*?"files"\s*:[\s\S]*?\})\s*```/i);
    }

    // Pattern 3: Just look for JSON with "files" array (last resort)
    if (!match) {
        match = content.match(/(\{\s*"files"\s*:\s*\[[\s\S]*?\]\s*\})/);
    }

    if (match && match[1]) {
        try {
            const cleanJson = match[1].replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            console.log("[Parser] ✅ Code extracted successfully");
            return parsed;
        } catch (e) {
            console.error("[Parser] ❌ Failed to parse Code JSON", e);
            console.log("[Parser] Raw content:", match[1].substring(0, 200));
            return null;
        }
    }
    return null;
};

/**
 * ULTRA-FLEXIBLE Context Parser
 * Handles ALL possible variations:
 * - Markdown code blocks: ```...```
 * - Various delimiters: ---, ***, ___, ###, or none
 * - With/without spaces around markers
 * - With/without line breaks
 * - Case insensitive
 */
export const extractContextFromMessage = (content: string): ProjectContextData => {
    console.log("[Parser] Extracting Context/MVP/PRD from message...");

    // Helper function to try multiple patterns for each artifact type
    const extractArtifact = (artifactName: string): string | null => {
        const patterns = [
            // Pattern 1: Markdown code block with markers
            new RegExp(`\`\`\`[\\s\\S]*?${artifactName}_START[\\s\\S]*?\`\`\`[\\s\\S]*?\`\`\`([\\s\\S]*?)\`\`\`[\\s\\S]*?${artifactName}_END`, 'i'),

            // Pattern 2: Standard markers with various delimiters (---, ***, ___, ###)
            new RegExp(`(?:[-*_#]{2,}|\\*\\*|##)?\\s*${artifactName}[_\\s-]*START\\s*(?:[-*_#]{2,}|\\*\\*|##)?\\s*([\\s\\S]*?)\\s*(?:[-*_#]{2,}|\\*\\*|##)?\\s*${artifactName}[_\\s-]*END`, 'i'),

            // Pattern 3: Without delimiters, just the markers
            new RegExp(`${artifactName}[_\\s-]*START\\s*([\\s\\S]*?)\\s*${artifactName}[_\\s-]*END`, 'i'),

            // Pattern 4: With line breaks and spaces
            new RegExp(`${artifactName}\\s*START\\s*\\n+([\\s\\S]*?)\\n+\\s*${artifactName}\\s*END`, 'i'),

            // Pattern 5: Compact (no line breaks)
            new RegExp(`${artifactName}START\\s*([\\s\\S]*?)\\s*${artifactName}END`, 'i'),

            // Pattern 6: Inside markdown code block (entire block)
            new RegExp(`\`\`\`\\s*${artifactName}[\\s\\S]*?\\n([\\s\\S]*?)\\n\`\`\``, 'i'),

            // Pattern 7: Markdown headers (## CONTEXT, etc.)
            new RegExp(`##\\s*${artifactName}\\s*\\n([\\s\\S]*?)(?=\\n##|$)`, 'i'),
        ];

        for (const pattern of patterns) {
            const match = content.match(pattern);
            if (match && match[1]) {
                const extracted = match[1].trim();
                if (extracted.length > 0) {
                    console.log(`[Parser] ✅ ${artifactName} found using pattern ${patterns.indexOf(pattern) + 1}`);
                    return extracted;
                }
            }
        }

        console.log(`[Parser] ⚠️ ${artifactName} not found`);
        return null;
    };

    const context = extractArtifact('CONTEXT');
    const mvp = extractArtifact('MVP');
    const prd = extractArtifact('PRD');

    if (context || mvp || prd) {
        console.log(`[Parser] ✅ Extracted - Context: ${!!context}, MVP: ${!!mvp}, PRD: ${!!prd}`);
    } else {
        console.log("[Parser] ❌ No Context/MVP/PRD artifacts found");
    }

    return {
        context,
        mvp,
        prd
    };
};
