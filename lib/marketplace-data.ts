export interface Template {
    id: string
    name: string
    description: string
    longDescription?: string
    category: string
    tags: string[]
    author: string
    downloads: number
    rating: number
    reviews?: number
    price: string
    thumbnail: string
    components: Component[]
    difficulty: string
    estimatedTime?: string
    features?: string[]
    whatYouLearn?: string[]
    image?: string
}

export interface Component {
    name: string
    quantity: number
    price: string
}

export const MOCK_TEMPLATES: Template[] = [
    {
        id: "1",
        name: "Arduino LED Blinker",
        description: "Simple LED blinking project perfect for beginners. Includes complete BOM, wiring diagram, and Arduino code.",
        longDescription: "This beginner-friendly project teaches you the fundamentals of Arduino programming and circuit building. You'll learn how to control an LED using digital output pins, understand current-limiting resistors, and write your first Arduino sketch. Perfect for those just starting their hardware journey!",
        category: "Beginner",
        tags: ["Arduino", "LED", "Beginner"],
        author: "OhmAI Community",
        downloads: 1234,
        rating: 4.8,
        reviews: 156,
        price: "Free",
        thumbnail: "🔴",
        components: [
            { name: "Arduino Uno", quantity: 1, price: "$25.00" },
            { name: "Red LED (5mm)", quantity: 1, price: "$0.50" },
            { name: "220Ω Resistor", quantity: 1, price: "$0.10" },
            { name: "Breadboard", quantity: 1, price: "$5.00" },
            { name: "Jumper Wires", quantity: 3, price: "$2.00" }
        ],
        difficulty: "Easy",
        estimatedTime: "30 minutes",
        features: [
            "Complete step-by-step guide",
            "Wiring diagram included",
            "Commented Arduino code",
            "Troubleshooting tips",
            "Video tutorial"
        ],
        whatYouLearn: [
            "Arduino IDE setup",
            "Digital output control",
            "Basic circuit design",
            "LED current limiting",
            "Code upload process"
        ],
        image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800&h=600&fit=crop"
    },
    {
        id: "2",
        name: "ESP32 Weather Station",
        description: "IoT weather monitoring system with temperature, humidity, and pressure sensors. Includes cloud integration.",
        longDescription: "Build a professional-grade weather station that monitors temperature, humidity, and atmospheric pressure. This project uses the ESP32's WiFi capabilities to send data to the cloud, where you can view real-time graphs and historical data. Perfect for learning IoT development!",
        category: "IoT",
        tags: ["ESP32", "IoT", "Sensors", "WiFi"],
        author: "TechMaker",
        downloads: 856,
        rating: 4.9,
        reviews: 89,
        price: "Free",
        thumbnail: "🌤️",
        components: [
            { name: "ESP32 DevKit", quantity: 1, price: "$12.00" },
            { name: "BME280 Sensor", quantity: 1, price: "$8.00" },
            { name: "0.96\" OLED Display", quantity: 1, price: "$6.00" },
            { name: "Breadboard", quantity: 1, price: "$5.00" },
            { name: "USB Cable", quantity: 1, price: "$3.00" }
        ],
        difficulty: "Intermediate",
        estimatedTime: "2-3 hours",
        features: [
            "Real-time sensor readings",
            "Cloud data logging",
            "OLED display output",
            "WiFi connectivity",
            "Mobile app integration"
        ],
        whatYouLearn: [
            "ESP32 programming",
            "I2C communication",
            "WiFi setup and usage",
            "Cloud API integration",
            "Sensor calibration"
        ],
        image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop"
    },
    {
        id: "3",
        name: "Raspberry Pi Smart Mirror",
        description: "Build an interactive smart mirror with weather, calendar, and news display. Full setup guide included.",
        longDescription: "Transform a regular mirror into a smart display that shows weather, calendar events, news, and more. This advanced project combines hardware assembly with software configuration, using a Raspberry Pi to power a sleek, futuristic interface behind a two-way mirror.",
        category: "Advanced",
        tags: ["Raspberry Pi", "Display", "Smart Home"],
        author: "MirrorMaker",
        downloads: 2341,
        rating: 4.7,
        reviews: 234,
        price: "Premium",
        thumbnail: "🪞",
        components: [
            { name: "Raspberry Pi 4 (4GB)", quantity: 1, price: "$55.00" },
            { name: "Two-way Mirror (24\")", quantity: 1, price: "$45.00" },
            { name: "24\" Monitor", quantity: 1, price: "$120.00" },
            { name: "Wooden Frame", quantity: 1, price: "$30.00" },
            { name: "Power Supply", quantity: 1, price: "$15.00" }
        ],
        difficulty: "Advanced",
        estimatedTime: "6-8 hours",
        features: [
            "Customizable modules",
            "Voice control ready",
            "Weather forecasts",
            "Calendar integration",
            "News feed display"
        ],
        whatYouLearn: [
            "Raspberry Pi setup",
            "Linux configuration",
            "Display calibration",
            "Frame construction",
            "Software customization"
        ],
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop"
    },
    {
        id: "4",
        name: "Robot Car Starter Kit",
        description: "Build your first autonomous robot car with obstacle avoidance and line following capabilities.",
        longDescription: "Create an intelligent robot car that can navigate autonomously, avoid obstacles, and follow lines. This project teaches robotics fundamentals including motor control, sensor integration, and autonomous navigation algorithms.",
        category: "Robotics",
        tags: ["Arduino", "Motors", "Sensors", "Robotics"],
        author: "RoboBuilder",
        downloads: 1567,
        rating: 4.6,
        reviews: 178,
        price: "Free",
        thumbnail: "🤖",
        components: [
            { name: "Arduino Nano", quantity: 1, price: "$8.00" },
            { name: "DC Motors (with wheels)", quantity: 2, price: "$12.00" },
            { name: "Ultrasonic Sensor", quantity: 1, price: "$4.00" },
            { name: "Motor Driver L298N", quantity: 1, price: "$6.00" },
            { name: "Chassis Kit", quantity: 1, price: "$15.00" }
        ],
        difficulty: "Intermediate",
        estimatedTime: "3-4 hours",
        features: [
            "Obstacle avoidance",
            "Line following mode",
            "Remote control option",
            "Speed control",
            "Multiple sensors"
        ],
        whatYouLearn: [
            "Motor control basics",
            "Sensor integration",
            "Autonomous navigation",
            "PWM speed control",
            "Robot assembly"
        ],
        image: "https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?w=800&h=600&fit=crop"
    },
    {
        id: "5",
        name: "Home Automation Hub",
        description: "Central control system for smart home devices. Control lights, temperature, and security from one place.",
        longDescription: "Build a comprehensive home automation system that controls lights, monitors temperature, and manages security devices. Uses MQTT protocol for reliable communication and features a touchscreen interface for easy control.",
        category: "Smart Home",
        tags: ["ESP32", "MQTT", "Home Automation"],
        author: "SmartHome Pro",
        downloads: 3421,
        rating: 4.9,
        reviews: 412,
        price: "Premium",
        thumbnail: "🏠",
        components: [
            { name: "ESP32 DevKit", quantity: 1, price: "$12.00" },
            { name: "4-Channel Relay Module", quantity: 1, price: "$8.00" },
            { name: "3.5\" Touch Display", quantity: 1, price: "$25.00" },
            { name: "DHT22 Sensor", quantity: 1, price: "$5.00" },
            { name: "Enclosure Box", quantity: 1, price: "$10.00" }
        ],
        difficulty: "Advanced",
        estimatedTime: "5-6 hours",
        features: [
            "MQTT communication",
            "Touchscreen control",
            "Multiple device support",
            "Scheduling system",
            "Mobile app integration"
        ],
        whatYouLearn: [
            "MQTT protocol",
            "Touch display programming",
            "Relay control",
            "Home automation concepts",
            "System integration"
        ],
        image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&h=600&fit=crop"
    },
    {
        id: "6",
        name: "Digital Thermometer",
        description: "Accurate temperature monitoring with LCD display. Great for learning sensor integration.",
        longDescription: "Build a precise digital thermometer using the DS18B20 temperature sensor and a 16x2 LCD display. This project teaches sensor interfacing and LCD control, perfect for beginners moving beyond basic LED projects.",
        category: "Beginner",
        tags: ["Arduino", "Temperature", "LCD"],
        author: "SensorLab",
        downloads: 987,
        rating: 4.5,
        reviews: 123,
        price: "Free",
        thumbnail: "🌡️",
        components: [
            { name: "Arduino Uno", quantity: 1, price: "$25.00" },
            { name: "DS18B20 Sensor", quantity: 1, price: "$3.00" },
            { name: "16x2 LCD Display", quantity: 1, price: "$7.00" },
            { name: "10kΩ Resistor", quantity: 1, price: "$0.10" },
            { name: "Breadboard", quantity: 1, price: "$5.00" }
        ],
        difficulty: "Easy",
        estimatedTime: "1 hour",
        features: [
            "Real-time temperature",
            "LCD display output",
            "Celsius/Fahrenheit toggle",
            "High accuracy",
            "Low power consumption"
        ],
        whatYouLearn: [
            "Sensor interfacing",
            "LCD control",
            "One-Wire protocol",
            "Data formatting",
            "Temperature conversion"
        ],
        image: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=800&h=600&fit=crop"
    },
    {
        id: "7",
        name: "Bluetooth Speaker System",
        description: "Build a custom Bluetooth speaker with amplifier and battery management. High-quality audio output.",
        longDescription: "Create a portable Bluetooth speaker with professional audio quality. This project covers audio amplification, Bluetooth connectivity, and battery management, resulting in a fully functional wireless speaker system.",
        category: "Audio",
        tags: ["Bluetooth", "Audio", "Amplifier"],
        author: "AudioTech",
        downloads: 1876,
        rating: 4.8,
        reviews: 201,
        price: "Premium",
        thumbnail: "🔊",
        components: [
            { name: "Bluetooth Audio Module", quantity: 1, price: "$15.00" },
            { name: "PAM8403 Amplifier", quantity: 1, price: "$5.00" },
            { name: "3\" Speakers (pair)", quantity: 2, price: "$20.00" },
            { name: "18650 Battery", quantity: 2, price: "$12.00" },
            { name: "Battery Charger Module", quantity: 1, price: "$6.00" }
        ],
        difficulty: "Intermediate",
        estimatedTime: "4-5 hours",
        features: [
            "Wireless Bluetooth",
            "Rechargeable battery",
            "Volume control",
            "Stereo output",
            "Portable design"
        ],
        whatYouLearn: [
            "Audio amplification",
            "Bluetooth pairing",
            "Battery management",
            "Speaker wiring",
            "Enclosure design"
        ],
        image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&h=600&fit=crop"
    },
    {
        id: "8",
        name: "Solar Power Monitor",
        description: "Track solar panel performance with real-time voltage, current, and power monitoring.",
        longDescription: "Monitor your solar panel's performance with this comprehensive tracking system. Measures voltage, current, and calculates power output in real-time, with data logging capabilities for performance analysis.",
        category: "Energy",
        tags: ["Solar", "Monitoring", "ESP32"],
        author: "GreenTech",
        downloads: 654,
        rating: 4.7,
        reviews: 87,
        price: "Free",
        thumbnail: "☀️",
        components: [
            { name: "ESP32 DevKit", quantity: 1, price: "$12.00" },
            { name: "INA219 Current Sensor", quantity: 1, price: "$6.00" },
            { name: "Solar Panel (5W)", quantity: 1, price: "$15.00" },
            { name: "OLED Display", quantity: 1, price: "$6.00" },
            { name: "Enclosure", quantity: 1, price: "$8.00" }
        ],
        difficulty: "Intermediate",
        estimatedTime: "2-3 hours",
        features: [
            "Real-time monitoring",
            "Power calculation",
            "Data logging",
            "WiFi connectivity",
            "Graph visualization"
        ],
        whatYouLearn: [
            "Current sensing",
            "Power calculations",
            "Solar panel basics",
            "Data visualization",
            "Energy monitoring"
        ],
        image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&h=600&fit=crop"
    }
]

export const CATEGORIES = ["All", "Beginner", "IoT", "Robotics", "Smart Home", "Audio", "Energy", "Advanced"]
export const DIFFICULTY_LEVELS = ["All", "Easy", "Intermediate", "Advanced"]

export function getTemplateById(id: string): Template | undefined {
    return MOCK_TEMPLATES.find(template => template.id === id)
}
