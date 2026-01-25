/**
 * Circuit Diagram Prompt Builder
 * 
 * Generates AI prompts for creating Fritzing-style breadboard diagrams.
 * Uses few-shot learning with reference images for consistent quality.
 */

export interface CircuitComponent {
  id: string;
  type: string;
  properties?: Record<string, any>;
}

export interface CircuitConnection {
  from: string;
  to: string;
  color?: string;
}

export interface CircuitJson {
  components: CircuitComponent[];
  connections: CircuitConnection[];
}

export interface PromptResult {
  prompt: string;
  referenceType: 'simple' | 'moderate' | 'complex';
}

/**
 * Build a detailed prompt for Fritzing-style diagram generation
 */
export function buildFritzingPrompt(circuitJson: CircuitJson): PromptResult {
  const componentCount = circuitJson.components.length;
  const referenceType = selectReferenceType(componentCount);
  
  const prompt = `
Generate a professional breadboard circuit diagram in Fritzing style.

EXACT STYLE TO MATCH:
- Reference the attached Fritzing example images exactly
- Realistic breadboard with visible hole grid pattern (tan/beige color)
- Proper component graphics (Arduino boards, LEDs, resistors, sensors)
- Color-coded jumper wires: Red=5V, Black=GND, Yellow/Green=Signal
- Clean, organized layout with good spacing between components
- Professional quality suitable for electronics tutorials and documentation

CIRCUIT SPECIFICATIONS:
${formatComponents(circuitJson.components)}

WIRING CONNECTIONS:
${formatConnections(circuitJson.connections)}

LAYOUT REQUIREMENTS:
- Arduino/main board positioned at top-left of breadboard
- Power rails clearly visible on breadboard sides (red stripe=positive, blue stripe=negative)
- Components arranged left-to-right in logical signal flow order
- Wires should follow breadboard rows/columns, minimize crossing
- Clear spacing between components (at least 2-3 breadboard holes)
- All component labels clearly readable and properly positioned
- Wire routing should be neat and follow breadboard grid

COMPONENT PLACEMENT RULES:
- Arduino board: Top-left, straddling center divide of breadboard
- Power components (voltage regulators, capacitors): Near power rails
- Input components (buttons, sensors): Left side of breadboard
- Output components (LEDs, displays, motors): Right side of breadboard
- Resistors: Inline with components they protect

OUTPUT REQUIREMENTS:
- High resolution (1792x1024px minimum)
- Good lighting, no shadows or reflections
- All text labels clearly legible at full resolution
- Professional presentation quality matching reference images exactly
- Breadboard should be tan/beige color with white text markings
- Components should have realistic 3D appearance with proper shadows
- Wire colors must match the specified connection colors exactly
- Include component value labels (resistor values, LED colors, etc.)

STYLE NOTES:
- This should look indistinguishable from an actual Fritzing export
- Pay attention to component orientation (LED polarity, IC pin 1, etc.)
- Breadboard holes should be clearly visible in a regular grid pattern
- Power rails should have red and blue stripes running the length of the board
`;

  return { prompt, referenceType };
}

/**
 * Select reference image type based on circuit complexity
 */
function selectReferenceType(componentCount: number): 'simple' | 'moderate' | 'complex' {
  if (componentCount <= 3) return 'simple';
  if (componentCount <= 6) return 'moderate';
  return 'complex';
}

/**
 * Format components into readable list for prompt
 */
function formatComponents(components: CircuitComponent[]): string {
  if (components.length === 0) {
    return 'No components specified';
  }

  return components.map((c, i) => {
    const props = c.properties 
      ? Object.entries(c.properties)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ')
      : '';
    
    return `${i + 1}. ${c.type} (ID: ${c.id})${props ? ` - ${props}` : ''}`;
  }).join('\n');
}

/**
 * Format connections into readable list for prompt
 */
function formatConnections(connections: CircuitConnection[]): string {
  if (connections.length === 0) {
    return 'No connections specified';
  }

  return connections.map((conn, i) => {
    const wireColor = conn.color || 'any color';
    return `${i + 1}. ${wireColor.toUpperCase()} wire from ${conn.from} to ${conn.to}`;
  }).join('\n');
}

/**
 * Validate circuit JSON structure
 */
export function validateCircuitJson(circuitJson: any): circuitJson is CircuitJson {
  if (!circuitJson || typeof circuitJson !== 'object') {
    return false;
  }

  if (!Array.isArray(circuitJson.components) || !Array.isArray(circuitJson.connections)) {
    return false;
  }

  // Validate components
  for (const component of circuitJson.components) {
    if (!component.id || !component.type) {
      return false;
    }
  }

  // Validate connections
  for (const connection of circuitJson.connections) {
    if (!connection.from || !connection.to) {
      return false;
    }
  }

  return true;
}

/**
 * Get estimated diagram complexity for analytics
 */
export function getCircuitComplexity(circuitJson: CircuitJson): {
  level: 'simple' | 'moderate' | 'complex';
  componentCount: number;
  connectionCount: number;
} {
  return {
    level: selectReferenceType(circuitJson.components.length),
    componentCount: circuitJson.components.length,
    connectionCount: circuitJson.connections.length
  };
}
