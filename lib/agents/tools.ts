/**
 * Tool Call Definitions for OHM Multi-Agent System
 * OpenAI-compatible function schemas for drawer updates
 */

export interface ToolCall {
    name: string;
    arguments: Record<string, any>;
}

export const DRAWER_TOOLS = {
    update_context: {
        name: "update_context",
        description: "Update the project context drawer with overview, background, success criteria, and constraints. Use this when you've gathered enough information about the user's project to create comprehensive context documentation.",
        parameters: {
            type: "object",
            properties: {
                context: {
                    type: "string",
                    description: "The full project context in markdown format. Should include: ## Overview, ## Background, ## Success Criteria, ## Constraints, ## About User"
                }
            },
            required: ["context"]
        }
    },

    update_mvp: {
        name: "update_mvp",
        description: "Update the MVP (Minimum Viable Product) specification drawer. Use this to define the core features that must be built first.",
        parameters: {
            type: "object",
            properties: {
                mvp: {
                    type: "string",
                    description: "MVP specification in markdown format with: ## Core Features (with why), ## Out of Scope, ## Success Metrics, ## Tech Stack"
                }
            },
            required: ["mvp"]
        }
    },

    update_prd: {
        name: "update_prd",
        description: "Update the Product Requirements Document drawer. Use this to provide comprehensive project requirements and timeline.",
        parameters: {
            type: "object",
            properties: {
                prd: {
                    type: "string",
                    description: "Full PRD in markdown format with: ## Vision, ## Hardware Requirements, ## Software Requirements, ## User Stories, ## BOM Preview, ## Timeline, ## Risks"
                }
            },
            required: ["prd"]
        }
    },

    update_bom: {
        name: "update_bom",
        description: "Update the Bill of Materials drawer with validated component list, costs, and power analysis. CRITICAL: Use exact part numbers from real distributors (DigiKey, Mouser, SparkFun). Verify voltage compatibility to prevent component damage.",
        parameters: {
            type: "object",
            properties: {
                project_name: {
                    type: "string",
                    description: "Name of the project"
                },
                summary: {
                    type: "string",
                    description: "One-sentence project description"
                },
                components: {
                    type: "array",
                    description: "List of all required components with specifications",
                    items: {
                        type: "object",
                        properties: {
                            name: {
                                type: "string",
                                description: "Human-readable component name (e.g., 'ESP32 DevKit')"
                            },
                            partNumber: {
                                type: "string",
                                description: "Exact manufacturer part number for ordering"
                            },
                            quantity: {
                                type: "number",
                                description: "Quantity needed"
                            },
                            voltage: {
                                type: "string",
                                description: "Operating voltage (e.g., '3.3V', '5V', '3.0-3.6V')"
                            },
                            current: {
                                type: "string",
                                description: "Current consumption (e.g., '50mA active, 10µA sleep')"
                            },
                            estimatedCost: {
                                type: "number",
                                description: "Price per unit in USD"
                            },
                            supplier: {
                                type: "string",
                                description: "Distributor name (DigiKey, Mouser, SparkFun, etc.)"
                            },
                            link: {
                                type: "string",
                                description: "Direct product URL"
                            },
                            notes: {
                                type: "string",
                                description: "Important warnings (polarity, voltage limits, pull-up requirements, etc.)"
                            },
                            alternatives: {
                                type: "array",
                                items: {
                                    type: "string"
                                },
                                description: "Alternative compatible parts with reasoning"
                            }
                        },
                        required: ["name", "partNumber", "quantity"]
                    }
                },
                totalCost: {
                    type: "number",
                    description: "Total project cost in USD"
                },
                powerAnalysis: {
                    type: "object",
                    description: "Power consumption analysis",
                    properties: {
                        peakCurrent: {
                            type: "string",
                            description: "Maximum simultaneous current draw"
                        },
                        batteryLife: {
                            type: "string",
                            description: "Estimated runtime on battery (if applicable)"
                        },
                        recommendedSupply: {
                            type: "string",
                            description: "Recommended power supply specification (e.g., '5V 2A USB')"
                        }
                    }
                },
                warnings: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "Critical warnings (voltage mismatches, polarity issues, etc.)"
                },
                assemblyNotes: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "Pro tips for assembly"
                }
            },
            required: ["project_name", "components", "totalCost"]
        }
    },

    add_code_file: {
        name: "add_code_file",
        description: "Add a single code file to the code drawer. Call this multiple times to create a complete project with multiple files (main.cpp, config.h, platformio.ini, etc.). Use non-blocking code patterns (millis() instead of delay()).",
        parameters: {
            type: "object",
            properties: {
                filename: {
                    type: "string",
                    description: "Full file path with extension (e.g., 'src/main.cpp', 'platformio.ini', 'include/config.h')"
                },
                language: {
                    type: "string",
                    description: "Programming language identifier (cpp, python, javascript, html, css, ini, json, etc.)"
                },
                content: {
                    type: "string",
                    description: "Complete file content with proper formatting, comments, and error handling"
                },
                description: {
                    type: "string",
                    description: "Brief description of the file's purpose (e.g., 'Main firmware with sensor reading logic')"
                }
            },
            required: ["filename", "language", "content"]
        }
    },

    update_wiring: {
        name: "update_wiring",
        description: "Update the wiring diagram drawer with pin-to-pin connections and step-by-step instructions. CRITICAL: Specify exact GPIO pins, wire colors (RED for VCC, BLACK for GND mandatory), and voltage warnings to prevent component damage.",
        parameters: {
            type: "object",
            properties: {
                connections: {
                    type: "array",
                    description: "List of all wire connections between components",
                    items: {
                        type: "object",
                        properties: {
                            from_component: {
                                type: "string",
                                description: "Source component name (e.g., 'ESP32', 'DHT22 Sensor')"
                            },
                            from_pin: {
                                type: "string",
                                description: "Source pin identifier (e.g., 'GPIO21', 'VCC', 'GND')"
                            },
                            to_component: {
                                type: "string",
                                description: "Destination component name"
                            },
                            to_pin: {
                                type: "string",
                                description: "Destination pin identifier"
                            },
                            wire_color: {
                                type: "string",
                                description: "Wire color for easy identification (RED for power, BLACK for ground, other colors for signals)"
                            },
                            notes: {
                                type: "string",
                                description: "Special notes (polarity warnings, pull-up resistor requirements, voltage level shifters needed, etc.)"
                            }
                        },
                        required: ["from_component", "from_pin", "to_component", "to_pin"]
                    }
                },
                instructions: {
                    type: "string",
                    description: "Step-by-step wiring instructions in markdown format with safety warnings. Include: 1) Tools needed, 2) Power rails setup, 3) Component connections, 4) Testing procedure, 5) Troubleshooting"
                },
                warnings: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "Critical safety warnings (reverse polarity, voltage mismatches, shorts, etc.)"
                }
            },
            required: ["connections", "instructions"]
        }
    },

    update_budget: {
        name: "update_budget",
        description: "Update the budget optimization drawer with cost analysis and money-saving recommendations. Provide alternative components that maintain quality while reducing cost.",
        parameters: {
            type: "object",
            properties: {
                originalCost: {
                    type: "number",
                    description: "Original BOM total cost in USD"
                },
                optimizedCost: {
                    type: "number",
                    description: "Optimized total cost after applying recommendations in USD"
                },
                savings: {
                    type: "string",
                    description: "Savings description (e.g., '$13.00 (29%)')"
                },
                recommendations: {
                    type: "array",
                    description: "List of cost optimization recommendations with tradeoff analysis",
                    items: {
                        type: "object",
                        properties: {
                            component: {
                                type: "string",
                                description: "Component name being optimized"
                            },
                            original: {
                                type: "string",
                                description: "Original component and price (e.g., 'Official ESP32 DevKit - $12')"
                            },
                            alternative: {
                                type: "string",
                                description: "Cheaper alternative and price (e.g., 'Generic ESP32 clone - $6')"
                            },
                            costSavings: {
                                type: "number",
                                description: "Money saved in USD"
                            },
                            reasoning: {
                                type: "string",
                                description: "Why this alternative is acceptable and what's different"
                            },
                            tradeoff: {
                                type: "string",
                                description: "Risk level: LOW (safe), MEDIUM (minor issues possible), HIGH (significant compromises)"
                            }
                        },
                        required: ["component", "original", "alternative", "costSavings", "reasoning", "tradeoff"]
                    }
                },
                bulkOpportunities: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "Bulk purchase opportunities to save money (e.g., '10x resistor pack vs individual - save $3')"
                },
                qualityWarnings: {
                    type: "array",
                    items: {
                        type: "string"
                    },
                    description: "Components where cheaper alternatives are NOT recommended due to quality/reliability issues"
                }
            },
            required: ["originalCost", "optimizedCost", "recommendations"]
        }
    }
};

/**
 * Get available tools for a specific agent type
 */
export function getToolsForAgent(agentType: string): any[] {
    const toolMap: Record<string, string[]> = {
        conversational: ['update_context', 'update_mvp', 'update_prd'],
        projectInitializer: ['update_context', 'update_mvp', 'update_prd'],
        bomGenerator: ['update_bom'],
        codeGenerator: ['add_code_file'],
        wiringDiagram: ['update_wiring'],
        budgetOptimizer: ['update_budget'],
        // Agents that don't use tools
        orchestrator: [],
        circuitVerifier: [],
        datasheetAnalyzer: []
    };

    const toolNames = toolMap[agentType] || [];
    return toolNames.map(name => DRAWER_TOOLS[name as keyof typeof DRAWER_TOOLS]);
}
