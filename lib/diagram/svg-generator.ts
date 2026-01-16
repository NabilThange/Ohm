/**
 * Deterministic SVG Schematic Generator
 * Generates IEEE-style circuit schematics from wiring JSON
 * Fast, accurate, no AI hallucinations
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

interface PositionedComponent {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPower?: boolean;
  isGround?: boolean;
}

interface RoutedConnection {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  color: string;
  label: string;
  isPower?: boolean;
  isGround?: boolean;
}

export class SVGSchematicGenerator {
  private readonly width = 1000;
  private readonly height = 700;
  private readonly componentSpacing = 180;
  private readonly margin = 60;
  
  private readonly wireColors: Record<string, string> = {
    red: '#dc2626',
    black: '#000000',
    yellow: '#eab308',
    green: '#16a34a',
    blue: '#2563eb',
    white: '#e5e7eb',
    orange: '#ea580c',
    purple: '#9333ea',
    brown: '#92400e',
    gray: '#6b7280'
  };

  /**
   * Generate SVG schematic from wiring data
   */
  generateSchematic(wiringData: WiringData): string {
    if (!wiringData.connections || wiringData.connections.length === 0) {
      return this.generateEmptySchematic();
    }

    // Layout components in logical groups
    const components = this.layoutComponents(wiringData.connections);
    
    // Route connections between components
    const connections = this.routeConnections(wiringData.connections, components);

    // Build SVG
    let svg = this.buildSVGHeader();
    
    // Background
    svg += `<rect width="${this.width}" height="${this.height}" fill="#ffffff"/>`;
    
    // Grid (optional, subtle)
    svg += this.drawGrid();
    
    // Draw connections first (behind components)
    connections.forEach(conn => {
      svg += this.drawWire(conn);
    });
    
    // Draw components
    components.forEach(comp => {
      svg += this.drawComponent(comp);
    });
    
    // Add title and metadata
    svg += this.drawTitle();
    
    // Add legend
    svg += this.drawLegend(connections);
    
    svg += `</svg>`;
    
    return svg;
  }

  /**
   * Layout components in a logical arrangement
   * Groups: Power supplies, microcontrollers, sensors, actuators
   */
  private layoutComponents(connections: Connection[]): PositionedComponent[] {
    // Extract unique components
    const componentMap = new Map<string, { isPower: boolean; isGround: boolean }>();
    
    connections.forEach(conn => {
      if (!componentMap.has(conn.from_component)) {
        componentMap.set(conn.from_component, {
          isPower: this.isPowerComponent(conn.from_component),
          isGround: this.isGroundComponent(conn.from_component)
        });
      }
      if (!componentMap.has(conn.to_component)) {
        componentMap.set(conn.to_component, {
          isPower: this.isPowerComponent(conn.to_component),
          isGround: this.isGroundComponent(conn.to_component)
        });
      }
    });

    const components = Array.from(componentMap.entries());
    
    // Separate by type
    const powerComponents = components.filter(([_, info]) => info.isPower);
    const groundComponents = components.filter(([_, info]) => info.isGround);
    const regularComponents = components.filter(([_, info]) => !info.isPower && !info.isGround);

    const positioned: PositionedComponent[] = [];
    let yOffset = this.margin + 50;

    // Layout power components at top
    powerComponents.forEach(([id, info], idx) => {
      positioned.push({
        id,
        x: this.margin + idx * this.componentSpacing,
        y: yOffset,
        width: 100,
        height: 60,
        isPower: true
      });
    });

    if (powerComponents.length > 0) yOffset += 120;

    // Layout regular components in center
    const cols = Math.ceil(Math.sqrt(regularComponents.length));
    regularComponents.forEach(([id, info], idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      positioned.push({
        id,
        x: this.margin + col * this.componentSpacing,
        y: yOffset + row * 120,
        width: 120,
        height: 70
      });
    });

    if (regularComponents.length > 0) yOffset += Math.ceil(regularComponents.length / cols) * 120 + 50;

    // Layout ground components at bottom
    groundComponents.forEach(([id, info], idx) => {
      positioned.push({
        id,
        x: this.margin + idx * this.componentSpacing,
        y: this.height - this.margin - 60,
        width: 100,
        height: 60,
        isGround: true
      });
    });

    return positioned;
  }

  /**
   * Route wires between components using Manhattan routing
   */
  private routeConnections(
    connections: Connection[],
    components: PositionedComponent[]
  ): RoutedConnection[] {
    const routed = connections
      .map(conn => {
        const fromComp = components.find(c => c.id === conn.from_component);
        const toComp = components.find(c => c.id === conn.to_component);

        if (!fromComp || !toComp) {
          return null;
        }

        const color = this.getWireColor(conn.wire_color);
        const label = `${conn.from_pin} → ${conn.to_pin}`;
        const isPower = conn.wire_color?.toLowerCase() === 'red';
        const isGround = conn.wire_color?.toLowerCase() === 'black';

        return {
          x1: fromComp.x + fromComp.width / 2,
          y1: fromComp.y + fromComp.height,
          x2: toComp.x + toComp.width / 2,
          y2: toComp.y,
          color,
          label,
          isPower,
          isGround
        } as RoutedConnection;
      })
      .filter((conn): conn is RoutedConnection => conn !== null);
    
    return routed;
  }

  /**
   * Build SVG header with namespace
   */
  private buildSVGHeader(): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 ${this.width} ${this.height}" 
      width="${this.width}" 
      height="${this.height}"
      style="font-family: system-ui, -apple-system, sans-serif;">`;
  }

  /**
   * Draw subtle background grid
   */
  private drawGrid(): string {
    let grid = '<g opacity="0.1">';
    const gridSize = 50;
    
    // Vertical lines
    for (let x = 0; x <= this.width; x += gridSize) {
      grid += `<line x1="${x}" y1="0" x2="${x}" y2="${this.height}" stroke="#cbd5e1" stroke-width="0.5"/>`;
    }
    
    // Horizontal lines
    for (let y = 0; y <= this.height; y += gridSize) {
      grid += `<line x1="0" y1="${y}" x2="${this.width}" y2="${y}" stroke="#cbd5e1" stroke-width="0.5"/>`;
    }
    
    grid += '</g>';
    return grid;
  }

  /**
   * Draw a component rectangle with label
   */
  private drawComponent(comp: PositionedComponent): string {
    const fillColor = comp.isPower ? '#fee2e2' : comp.isGround ? '#dbeafe' : '#f3f4f6';
    const strokeColor = comp.isPower ? '#dc2626' : comp.isGround ? '#2563eb' : '#6b7280';
    const strokeWidth = comp.isPower || comp.isGround ? 3 : 2;

    return `
      <g>
        <rect 
          x="${comp.x}" 
          y="${comp.y}" 
          width="${comp.width}" 
          height="${comp.height}" 
          fill="${fillColor}" 
          stroke="${strokeColor}" 
          stroke-width="${strokeWidth}" 
          rx="6"
        />
        <text 
          x="${comp.x + comp.width / 2}" 
          y="${comp.y + comp.height / 2}" 
          text-anchor="middle" 
          dominant-baseline="middle" 
          font-size="13" 
          font-weight="600"
          fill="#1f2937"
        >
          ${this.escapeXML(this.truncateText(comp.id, 14))}
        </text>
        ${comp.isPower ? this.drawPowerSymbol(comp) : ''}
        ${comp.isGround ? this.drawGroundSymbol(comp) : ''}
      </g>
    `;
  }

  /**
   * Draw power symbol (+ icon)
   */
  private drawPowerSymbol(comp: PositionedComponent): string {
    const cx = comp.x + comp.width - 15;
    const cy = comp.y + 15;
    return `
      <circle cx="${cx}" cy="${cy}" r="10" fill="#dc2626" opacity="0.9"/>
      <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="middle" 
        font-size="14" font-weight="bold" fill="white">+</text>
    `;
  }

  /**
   * Draw ground symbol (⏚)
   */
  private drawGroundSymbol(comp: PositionedComponent): string {
    const cx = comp.x + comp.width - 15;
    const cy = comp.y + 15;
    return `
      <g transform="translate(${cx}, ${cy})">
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#2563eb" stroke-width="2"/>
        <line x1="-4" y1="3" x2="4" y2="3" stroke="#2563eb" stroke-width="2"/>
        <line x1="-2" y1="6" x2="2" y2="6" stroke="#2563eb" stroke-width="2"/>
      </g>
    `;
  }

  /**
   * Draw a wire connection with label
   */
  private drawWire(conn: RoutedConnection): string {
    const midX = (conn.x1 + conn.x2) / 2;
    const midY = (conn.y1 + conn.y2) / 2;
    const strokeWidth = conn.isPower || conn.isGround ? 3 : 2;

    return `
      <g>
        <line 
          x1="${conn.x1}" 
          y1="${conn.y1}" 
          x2="${conn.x2}" 
          y2="${conn.y2}" 
          stroke="${conn.color}" 
          stroke-width="${strokeWidth}"
          stroke-linecap="round"
        />
        <circle cx="${conn.x1}" cy="${conn.y1}" r="4" fill="${conn.color}"/>
        <circle cx="${conn.x2}" cy="${conn.y2}" r="4" fill="${conn.color}"/>
        <text 
          x="${midX}" 
          y="${midY - 8}" 
          text-anchor="middle" 
          font-size="10" 
          fill="#374151"
          style="background: white; padding: 2px;"
        >
          ${this.escapeXML(conn.label)}
        </text>
      </g>
    `;
  }

  /**
   * Draw title and metadata
   */
  private drawTitle(): string {
    const date = new Date().toLocaleDateString();
    return `
      <g>
        <text x="20" y="30" font-size="18" font-weight="700" fill="#111827">
          Circuit Schematic
        </text>
        <text x="20" y="50" font-size="11" fill="#6b7280">
          Generated: ${date} | OHM Hardware Orchestrator
        </text>
      </g>
    `;
  }

  /**
   * Draw legend showing wire colors
   */
  private drawLegend(connections: RoutedConnection[]): string {
    const uniqueColors = new Set(connections.map(c => c.color));
    const colors = Array.from(uniqueColors).slice(0, 5); // Show max 5 colors
    
    let legend = `<g transform="translate(${this.width - 180}, ${this.height - 60})">`;
    legend += `<text x="0" y="0" font-size="11" font-weight="600" fill="#374151">Wire Colors:</text>`;
    
    colors.forEach((color, idx) => {
      const y = 15 + idx * 18;
      legend += `
        <line x1="0" y1="${y}" x2="30" y2="${y}" stroke="${color}" stroke-width="3"/>
        <text x="35" y="${y + 4}" font-size="10" fill="#6b7280">
          ${this.getColorName(color)}
        </text>
      `;
    });
    
    legend += `</g>`;
    return legend;
  }

  /**
   * Generate empty schematic for circuits with no connections
   */
  private generateEmptySchematic(): string {
    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${this.width} ${this.height}">
        <rect width="${this.width}" height="${this.height}" fill="#ffffff"/>
        <text x="${this.width / 2}" y="${this.height / 2}" 
          text-anchor="middle" 
          font-size="16" 
          fill="#9ca3af"
          font-family="system-ui, sans-serif">
          No connections to display
        </text>
      </svg>
    `;
  }

  /**
   * Get wire color from name
   */
  private getWireColor(colorName?: string): string {
    if (!colorName) return '#6b7280';
    return this.wireColors[colorName.toLowerCase()] || '#6b7280';
  }

  /**
   * Get color name from hex
   */
  private getColorName(hex: string): string {
    const entry = Object.entries(this.wireColors).find(([_, h]) => h === hex);
    return entry ? entry[0].charAt(0).toUpperCase() + entry[0].slice(1) : 'Wire';
  }

  /**
   * Check if component is a power source
   */
  private isPowerComponent(name: string): boolean {
    const nameLower = name.toLowerCase();
    return nameLower.includes('power') || 
           nameLower.includes('vcc') || 
           nameLower.includes('supply') ||
           nameLower.includes('battery');
  }

  /**
   * Check if component is ground
   */
  private isGroundComponent(name: string): boolean {
    const nameLower = name.toLowerCase();
    return nameLower.includes('ground') || 
           nameLower.includes('gnd') ||
           nameLower === 'gnd';
  }

  /**
   * Escape XML special characters
   */
  private escapeXML(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  /**
   * Truncate text to max length
   */
  private truncateText(text: string, maxLength: number): string {
    return text.length > maxLength ? text.substring(0, maxLength - 1) + '…' : text;
  }
}
