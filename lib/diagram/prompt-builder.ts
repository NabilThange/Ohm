/**
 * Template-Based Prompt Builder
 * Converts wiring data into detailed image generation prompts
 * NO LLM CALLS - Pure deterministic logic for instant generation
 */

interface Connection {
  from_component: string;
  from_pin: string;
  to_component: string;
  to_pin: string;
  wire_color?: string;
  wire_gauge?: string;
  notes?: string;
}

interface WiringData {
  connections: Connection[];
  instructions: string;
  warnings?: string[];
}

export class PromptBuilder {
  /**
   * Build photorealistic breadboard prompt from wiring data
   * Returns a detailed prompt optimized for BYTEZ/Stable Diffusion models
   */
  static buildBreadboardPrompt(wiringData: WiringData): string {
    const { connections } = wiringData;
    
    if (!connections || connections.length === 0) {
      return this.getDefaultPrompt();
    }
    
    // Extract unique components
    const componentIds = new Set<string>();
    connections.forEach(c => {
      componentIds.add(c.from_component);
      componentIds.add(c.to_component);
    });
    const components = Array.from(componentIds);
    
    // Build component description with spatial positioning
    const componentDesc = components
      .map((id, idx) => {
        const position = idx === 0 ? 'on the left side' : 
                        idx === components.length - 1 ? 'on the right side' :
                        'in the center';
        return `${id} positioned ${position}`;
      })
      .join(', ');
    
    // Analyze power connections
    const powerConns = connections.filter(c => 
      this.isPowerPin(c.from_pin) || this.isPowerPin(c.to_pin)
    );
    const gndConns = connections.filter(c =>
      this.isGroundPin(c.from_pin) || this.isGroundPin(c.to_pin)
    );
    
    // Build power rail description
    const powerRailDesc = powerConns.length > 0 
      ? 'Red power rail along the top edge of breadboard connecting to all VCC and power pins. ' 
      : '';
    const gndRailDesc = gndConns.length > 0
      ? 'Black ground rail along the bottom edge connecting to all GND pins. '
      : '';
    
    // Build individual connection descriptions
    const connectionDescs: string[] = [];
    connections.forEach(c => {
      const color = c.wire_color || 'wire';
      const gauge = c.wire_gauge || '22AWG';
      const fromDesc = `${c.from_component} ${c.from_pin} pin`;
      const toDesc = `${c.to_component} ${c.to_pin} pin`;
      
      connectionDescs.push(
        `${color} ${gauge} jumper wire connecting ${fromDesc} to ${toDesc}`
      );
    });
    
    const connectionDesc = connectionDescs.join('. ');
    
    // Assemble final prompt with quality descriptors
    const prompt = `
      Top-down view of professional electronics workbench with studio lighting.
      White 830-point solderless breadboard centered in frame, clean and well-organized.
      Electronic components arranged on breadboard: ${componentDesc}.
      ${powerRailDesc}${gndRailDesc}
      Wiring connections visible: ${connectionDesc}.
      All components display clear, readable labels showing model numbers and pin identifiers.
      Photorealistic style, sharp focus with slight depth of field, professional product photography lighting,
      white clean background, component details clearly visible, slight shadows for three-dimensional depth,
      high-resolution electronics documentation photo, well-lit from above, no glare or reflections.
    `.trim().replace(/\s+/g, ' ');
    
    return prompt;
  }
  
  /**
   * Calculate optimal image size based on circuit complexity
   */
  static calculateImageSize(componentCount: number): '1024x1024' | '1792x1024' | '1024x1792' {
    if (componentCount <= 3) return '1024x1024';  // Small circuits - square
    if (componentCount <= 7) return '1792x1024';  // Medium circuits - wide landscape
    return '1024x1792';  // Large/complex circuits - tall portrait
  }
  
  /**
   * Check if a pin name indicates a power connection
   */
  private static isPowerPin(pin: string): boolean {
    const pinLower = pin.toLowerCase();
    return pinLower.includes('vcc') ||
           pinLower.includes('5v') ||
           pinLower.includes('3.3v') ||
           pinLower.includes('3v3') ||
           pinLower.includes('v+') ||
           pinLower.includes('power') ||
           pinLower.includes('vin');
  }
  
  /**
   * Check if a pin name indicates a ground connection
   */
  private static isGroundPin(pin: string): boolean {
    const pinLower = pin.toLowerCase();
    return pinLower.includes('gnd') ||
           pinLower.includes('ground') ||
           pinLower === 'g' ||
           pinLower === '-';
  }
  
  /**
   * Get default prompt for circuits with no connections
   */
  private static getDefaultPrompt(): string {
    return `
      Top-down view of clean white 830-point solderless breadboard on electronics workbench.
      Professional product photography with studio lighting, sharp focus, slight shadows for depth,
      white background, photorealistic style, high-resolution documentation photo.
    `.trim().replace(/\s+/g, ' ');
  }
  
  /**
   * Estimate prompt quality score (for testing/debugging)
   */
  static evaluatePrompt(prompt: string): {
    score: number;
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 100;
    
    // Check length (optimal: 200-400 chars)
    if (prompt.length < 150) {
      score -= 20;
      feedback.push('Prompt too short - add more descriptive details');
    } else if (prompt.length > 500) {
      score -= 10;
      feedback.push('Prompt may be too long - consider condensing');
    }
    
    // Check for quality keywords
    const qualityKeywords = ['photorealistic', 'sharp focus', 'well-lit', 'professional'];
    const hasQualityKeywords = qualityKeywords.some(kw => prompt.toLowerCase().includes(kw));
    if (!hasQualityKeywords) {
      score -= 15;
      feedback.push('Missing quality descriptors (photorealistic, sharp focus, etc.)');
    }
    
    // Check for spatial descriptions
    const spatialKeywords = ['top-down', 'positioned', 'left', 'right', 'center'];
    const hasSpatialInfo = spatialKeywords.some(kw => prompt.toLowerCase().includes(kw));
    if (!hasSpatialInfo) {
      score -= 10;
      feedback.push('Missing spatial positioning information');
    }
    
    // Check for component specificity
    const hasComponents = /arduino|esp32|sensor|led|resistor/i.test(prompt);
    if (!hasComponents) {
      score -= 15;
      feedback.push('Missing specific component names');
    }
    
    if (feedback.length === 0) {
      feedback.push('Excellent prompt quality!');
    }
    
    return { score: Math.max(0, score), feedback };
  }
}
