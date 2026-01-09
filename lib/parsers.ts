
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

export const extractBOMFromMessage = (content: string): BOMData | null => {
    const match = content.match(/<BOM_CONTAINER>([\s\S]*?)<\/BOM_CONTAINER>/);
    if (match && match[1]) {
        try {
            // Remove markdown code blocks if present inside the tags
            const cleanJson = match[1].replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse BOM JSON", e);
            return null;
        }
    }
    return null;
};

export const extractCodeFromMessage = (content: string): CodeData | null => {
    const match = content.match(/<CODE_CONTAINER>([\s\S]*?)<\/CODE_CONTAINER>/);
    if (match && match[1]) {
        try {
            const cleanJson = match[1].replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error("Failed to parse Code JSON", e);
            return null;
        }
    }
    return null;
};

export const extractContextFromMessage = (content: string): ProjectContextData => {
    // console.log("[Parser] extractContextFromMessage called"); // Uncomment for verbose logging
    // Robust regex to capture content between tags, handling potential variations in markdown (bold, headers, different dashes)
    // Now supports streaming by allowing the match to end at the string end ($) if the closing tag isn't found yet
    // Robust regex to capture content between tags, handling potential variations in markdown (bold, headers, different dashes)
    // Matches patterns like `---CONTEXT_START---` followed by content, until `---CONTEXT_END---` or end of string.
    const contextPattern = /(?:[-*_#]{3,}|\*\*|##)\s*CONTEXT_START\s*(?:[-*_#]{3,}|\*\*|##)?\s*([\s\S]*?)\s*(?:(?:[-*_#]{3,}|\*\*|##)\s*CONTEXT_END|$)/i;
    const mvpPattern = /(?:[-*_#]{3,}|\*\*|##)\s*MVP_START\s*(?:[-*_#]{3,}|\*\*|##)?\s*([\s\S]*?)\s*(?:(?:[-*_#]{3,}|\*\*|##)\s*MVP_END|$)/i;
    const prdPattern = /(?:[-*_#]{3,}|\*\*|##)\s*PRD_START\s*(?:[-*_#]{3,}|\*\*|##)?\s*([\s\S]*?)\s*(?:(?:[-*_#]{3,}|\*\*|##)\s*PRD_END|$)/i;

    const contextMatch = content.match(contextPattern);
    const mvpMatch = content.match(mvpPattern);
    const prdMatch = content.match(prdPattern);

    return {
        context: contextMatch ? contextMatch[1].trim() : null,
        mvp: mvpMatch ? mvpMatch[1].trim() : null,
        prd: prdMatch ? prdMatch[1].trim() : null
    };
};
