/**
 * Fritzing Reference Image Library
 * 
 * Stores reference images for AI diagram generation.
 * These examples help the AI understand the desired Fritzing style.
 */

export interface ReferenceImage {
    name: string;
    url: string;
    description: string;
    componentCount: number;
}

/**
 * Reference images for different circuit complexities
 * 
 * TODO: Upload actual Fritzing example images to Supabase Storage
 * and update these URLs. For now, these are placeholders.
 */
export const FRITZING_REFERENCES: Record<'simple' | 'moderate' | 'complex', ReferenceImage> = {
    simple: {
        name: 'Simple LED Circuit',
        url: 'https://your-supabase-url.supabase.co/storage/v1/object/public/circuit-diagrams/references/led-blink.png',
        description: 'Arduino Uno + LED + 220Ω Resistor - Basic blink circuit',
        componentCount: 3
    },
    moderate: {
        name: 'Sensor Circuit',
        url: 'https://your-supabase-url.supabase.co/storage/v1/object/public/circuit-diagrams/references/dht11-sensor.png',
        description: 'Arduino Uno + DHT11 Temperature Sensor + LCD Display',
        componentCount: 5
    },
    complex: {
        name: 'Multi-Component Circuit',
        url: 'https://your-supabase-url.supabase.co/storage/v1/object/public/circuit-diagrams/references/servo-ultrasonic.png',
        description: 'Arduino Uno + Servo Motor + Ultrasonic Sensor + LEDs + Buzzer',
        componentCount: 8
    }
};

/**
 * Get reference image URL for a given complexity type
 */
export function getReferenceImage(type: keyof typeof FRITZING_REFERENCES): string {
    return FRITZING_REFERENCES[type].url;
}

/**
 * Get all reference images (for batch upload or validation)
 */
export function getAllReferences(): ReferenceImage[] {
    return Object.values(FRITZING_REFERENCES);
}

/**
 * Validate that reference images are accessible
 * Call this during app initialization to ensure references are set up
 */
export async function validateReferences(): Promise<{
    valid: boolean;
    missing: string[];
}> {
    const missing: string[] = [];

    for (const [type, ref] of Object.entries(FRITZING_REFERENCES)) {
        try {
            const response = await fetch(ref.url, { method: 'HEAD' });
            if (!response.ok) {
                missing.push(type);
            }
        } catch (error) {
            missing.push(type);
        }
    }

    return {
        valid: missing.length === 0,
        missing
    };
}

/**
 * Instructions for setting up reference images
 */
export const SETUP_INSTRUCTIONS = `
# Reference Image Setup Instructions

## Step 1: Create Reference Images

You need 3 Fritzing example diagrams:

1. **Simple Circuit** (3 components)
   - Arduino Uno R3
   - Red LED (5mm)
   - 220Ω Resistor
   - Wiring: Arduino D13 → Resistor → LED → GND

2. **Moderate Circuit** (5-6 components)
   - Arduino Uno R3
   - DHT11 Temperature/Humidity Sensor
   - 16x2 LCD Display
   - 10kΩ Potentiometer
   - Wiring: Sensor to Arduino, LCD to Arduino with I2C

3. **Complex Circuit** (8+ components)
   - Arduino Uno R3
   - Servo Motor
   - HC-SR04 Ultrasonic Sensor
   - 2x LEDs (Red, Green)
   - 2x 220Ω Resistors
   - Buzzer
   - Wiring: Full sensor + actuator system

## Step 2: Export from Fritzing

1. Open Fritzing desktop application
2. Create each circuit in Breadboard view
3. Export as PNG: File → Export → Image → PNG
4. Settings: 1792x1024px, 300 DPI, transparent background OFF

## Step 3: Upload to Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create bucket: \`circuit-diagrams\` (if not exists)
3. Create folder: \`references\`
4. Upload images:
   - led-blink.png
   - dht11-sensor.png
   - servo-ultrasonic.png
5. Make bucket public (Settings → Public bucket: ON)

## Step 4: Update URLs

1. Get public URLs from Supabase Storage
2. Update FRITZING_REFERENCES in this file
3. Run validation: \`validateReferences()\`

## Alternative: Use AI-Generated Examples

If you don't have Fritzing desktop:

1. Use DALL-E 3 to generate example images
2. Prompt: "Professional Fritzing-style breadboard circuit diagram showing [circuit description]"
3. Use generated images as references
4. Upload to Supabase Storage
5. Update URLs in this file
`;
