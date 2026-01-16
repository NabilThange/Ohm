/**
 * Agent Identity Configuration
 * Maps each agent to its display name, avatar, icon, and role description
 */

export interface AgentIdentity {
  name: string;
  avatar: string;
  icon: string;
  role: string;
  model: string;
}

export const AGENT_IDENTITIES: Record<string, AgentIdentity> = {
  orchestrator: {
    name: "Traffic Controller",
    avatar: "/avatar/orchestator.svg",
    icon: "🎯",
    role: "Routes queries to the right specialist",
    model: "Claude Sonnet 4.5"
  },
  projectInitializer: {
    name: "Project Architect",
    avatar: "/avatar/Project_Architect.svg",
    icon: "🏛️",
    role: "Transforms ideas into structured project plans",
    model: "Claude Opus 4.5"
  },
  conversational: {
    name: "Lead Engineer",
    avatar: "/avatar/Lead_Engineer.svg",
    icon: "🧑‍💼",
    role: "Guides you through the entire build process",
    model: "Claude Opus 4.5"
  },
  bomGenerator: {
    name: "Component Specialist",
    avatar: "/avatar/Component_Specialist.svg",
    icon: "🔧",
    role: "Selects and sources the perfect components",
    model: "Claude Opus 4.5"
  },
  codeGenerator: {
    name: "Software Engineer",
    avatar: "/avatar/software_engineer.svg",
    icon: "💻",
    role: "Writes clean, production-ready code",
    model: "Claude Sonnet 4.5"
  },
  wiringSpecialist: {
    name: "Circuit Designer",
    avatar: "/avatar/circuit_designer.svg",
    icon: "⚡",
    role: "Creates precise wiring diagrams",
    model: "Claude Sonnet 4.5"
  },
  circuitVerifier: {
    name: "Quality Assurance",
    avatar: "/avatar/Quality_Assurance.svg",
    icon: "✅",
    role: "Validates circuits for safety and correctness",
    model: "Gemini 2.5 Flash"
  },
  datasheetAnalyzer: {
    name: "Technical Analyst",
    avatar: "/avatar/Technical_Analyst.svg",
    icon: "📊",
    role: "Analyzes datasheets and specifications",
    model: "Claude Opus 4.5"
  },
  budgetOptimizer: {
    name: "Cost Engineer",
    avatar: "/avatar/Cost_Engineer.svg",
    icon: "💰",
    role: "Optimizes costs without compromising quality",
    model: "Claude Sonnet 4.5"
  },
  conversationSummarizer: {
    name: "Project Historian",
    avatar: "/avatar/Project_Historian.svg",
    icon: "📋",
    role: "Summarizes and documents project progress",
    model: "Claude Sonnet 4.5"
  }
};

/**
 * Get agent identity by agent ID or name
 * Returns fallback identity if agent not found
 */
export function getAgentIdentity(agentId: string | null | undefined): AgentIdentity {
  if (!agentId || agentId === 'thinking...' || !AGENT_IDENTITIES[agentId]) {
    return {
      name: "AI Assistant",
      avatar: "/avatar/orchestator.svg",  // Use orchestrator avatar as default (not default.svg)
      icon: "🤖",
      role: "General AI Assistant",
      model: "Claude"
    };
  }
  return AGENT_IDENTITIES[agentId];
}

/**
 * Find agent ID by display name (reverse lookup)
 * Useful when we have agent name but need the ID
 */
export function findAgentIdByName(name: string | null | undefined): string | null {
  if (!name) return null;
  
  for (const [id, identity] of Object.entries(AGENT_IDENTITIES)) {
    if (identity.name.toLowerCase() === name.toLowerCase()) {
      return id;
    }
  }
  return null;
}

/**
 * Get all agent identities as an array
 */
export function getAllAgentIdentities(): Array<{ id: string; identity: AgentIdentity }> {
  return Object.entries(AGENT_IDENTITIES).map(([id, identity]) => ({
    id,
    identity
  }));
}

/**
 * Check if an agent ID is valid
 */
export function isValidAgentId(agentId: string): boolean {
  return agentId in AGENT_IDENTITIES;
}
