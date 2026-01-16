"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
    ArrowLeft, 
    Search, 
    Star, 
    Download, 
    TrendingUp, 
    Zap, 
    Code, 
    Cpu, 
    Lightbulb,
    Filter,
    ChevronDown
} from "lucide-react"

// Mock template data
const MOCK_TEMPLATES = [
    {
        id: "1",
        name: "Arduino LED Blinker",
        description: "Simple LED blinking project perfect for beginners. Includes complete BOM, wiring diagram, and Arduino code.",
        category: "Beginner",
        tags: ["Arduino", "LED", "Beginner"],
        author: "OhmAI Community",
        downloads: 1234,
        rating: 4.8,
        price: "Free",
        thumbnail: "🔴",
        components: ["Arduino Uno", "LED", "220Ω Resistor", "Breadboard"],
        difficulty: "Easy"
    },
    {
        id: "2",
        name: "ESP32 Weather Station",
        description: "IoT weather monitoring system with temperature, humidity, and pressure sensors. Includes cloud integration.",
        category: "IoT",
        tags: ["ESP32", "IoT", "Sensors", "WiFi"],
        author: "TechMaker",
        downloads: 856,
        rating: 4.9,
        price: "Free",
        thumbnail: "🌤️",
        components: ["ESP32", "BME280", "OLED Display"],
        difficulty: "Intermediate"
    },
    {
        id: "3",
        name: "Raspberry Pi Smart Mirror",
        description: "Build an interactive smart mirror with weather, calendar, and news display. Full setup guide included.",
        category: "Advanced",
        tags: ["Raspberry Pi", "Display", "Smart Home"],
        author: "MirrorMaker",
        downloads: 2341,
        rating: 4.7,
        price: "Premium",
        thumbnail: "🪞",
        components: ["Raspberry Pi 4", "Two-way Mirror", "Monitor"],
        difficulty: "Advanced"
    },
    {
        id: "4",
        name: "Robot Car Starter Kit",
        description: "Build your first autonomous robot car with obstacle avoidance and line following capabilities.",
        category: "Robotics",
        tags: ["Arduino", "Motors", "Sensors", "Robotics"],
        author: "RoboBuilder",
        downloads: 1567,
        rating: 4.6,
        price: "Free",
        thumbnail: "🤖",
        components: ["Arduino Nano", "DC Motors", "Ultrasonic Sensor"],
        difficulty: "Intermediate"
    },
    {
        id: "5",
        name: "Home Automation Hub",
        description: "Central control system for smart home devices. Control lights, temperature, and security from one place.",
        category: "Smart Home",
        tags: ["ESP32", "MQTT", "Home Automation"],
        author: "SmartHome Pro",
        downloads: 3421,
        rating: 4.9,
        price: "Premium",
        thumbnail: "🏠",
        components: ["ESP32", "Relay Module", "Touch Display"],
        difficulty: "Advanced"
    },
    {
        id: "6",
        name: "Digital Thermometer",
        description: "Accurate temperature monitoring with LCD display. Great for learning sensor integration.",
        category: "Beginner",
        tags: ["Arduino", "Temperature", "LCD"],
        author: "SensorLab",
        downloads: 987,
        rating: 4.5,
        price: "Free",
        thumbnail: "🌡️",
        components: ["Arduino Uno", "DS18B20", "16x2 LCD"],
        difficulty: "Easy"
    },
    {
        id: "7",
        name: "Bluetooth Speaker System",
        description: "Build a custom Bluetooth speaker with amplifier and battery management. High-quality audio output.",
        category: "Audio",
        tags: ["Bluetooth", "Audio", "Amplifier"],
        author: "AudioTech",
        downloads: 1876,
        rating: 4.8,
        price: "Premium",
        thumbnail: "🔊",
        components: ["Bluetooth Module", "Amplifier", "Speakers"],
        difficulty: "Intermediate"
    },
    {
        id: "8",
        name: "Solar Power Monitor",
        description: "Track solar panel performance with real-time voltage, current, and power monitoring.",
        category: "Energy",
        tags: ["Solar", "Monitoring", "ESP32"],
        author: "GreenTech",
        downloads: 654,
        rating: 4.7,
        price: "Free",
        thumbnail: "☀️",
        components: ["ESP32", "INA219", "Solar Panel"],
        difficulty: "Intermediate"
    }
]

const CATEGORIES = ["All", "Beginner", "IoT", "Robotics", "Smart Home", "Audio", "Energy", "Advanced"]
const DIFFICULTY_LEVELS = ["All", "Easy", "Intermediate", "Advanced"]

export default function MarketplacePage() {
    const router = useRouter()
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [selectedDifficulty, setSelectedDifficulty] = useState("All")
    const [showFilters, setShowFilters] = useState(false)

    const filteredTemplates = MOCK_TEMPLATES.filter(template => {
        const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        
        const matchesCategory = selectedCategory === "All" || template.category === selectedCategory
        const matchesDifficulty = selectedDifficulty === "All" || template.difficulty === selectedDifficulty

        return matchesSearch && matchesCategory && matchesDifficulty
    })

    const handleUseTemplate = (template: any) => {
        // In the future, this will load the template into a new chat
        console.log("Using template:", template)
        alert(`Template "${template.name}" will be loaded into a new project. (Feature coming soon!)`)
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push('/build')}
                                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            >
                                <ArrowLeft className="h-5 w-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                                    Project Marketplace
                                </h1>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Browse and use community templates to kickstart your projects
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                {filteredTemplates.length} templates
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Search and Filters */}
            <div className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        {/* Search Bar */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search templates..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-zinc-800 dark:bg-zinc-950"
                            />
                        </div>

                        {/* Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-4 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                        >
                            <Filter className="h-4 w-4" />
                            Filters
                            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Filter Options */}
                    {showFilters && (
                        <div className="mt-4 flex flex-wrap gap-4">
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                    CATEGORY
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                                selectedCategory === cat
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                                    DIFFICULTY
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DIFFICULTY_LEVELS.map(level => (
                                        <button
                                            key={level}
                                            onClick={() => setSelectedDifficulty(level)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                                                selectedDifficulty === level
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300'
                                            }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Featured Section */}
            <div className="border-b border-zinc-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:border-zinc-800 dark:from-purple-950/20 dark:to-blue-950/20">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="h-5 w-5 text-purple-600" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                            Featured This Week
                        </h2>
                    </div>
                    <div className="grid gap-4 md:grid-cols-3">
                        {MOCK_TEMPLATES.slice(0, 3).map(template => (
                            <div
                                key={template.id}
                                className="rounded-lg border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="mb-2 text-4xl">{template.thumbnail}</div>
                                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                                    {template.name}
                                </h3>
                                <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                                    {template.downloads.toLocaleString()} downloads
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Templates Grid */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        All Templates
                    </h2>
                </div>

                {filteredTemplates.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-zinc-300 p-12 text-center dark:border-zinc-700">
                        <p className="text-zinc-600 dark:text-zinc-400">
                            No templates found matching your criteria.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredTemplates.map(template => (
                            <div
                                key={template.id}
                                className="group rounded-lg border border-zinc-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
                            >
                                <div className="mb-4 flex items-start justify-between">
                                    <div className="text-5xl">{template.thumbnail}</div>
                                    <div className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                        <Star className="h-3 w-3 fill-current" />
                                        {template.rating}
                                    </div>
                                </div>

                                <h3 className="mb-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                                    {template.name}
                                </h3>

                                <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                                    {template.description}
                                </p>

                                <div className="mb-4 flex flex-wrap gap-1">
                                    {template.tags.slice(0, 3).map(tag => (
                                        <span
                                            key={tag}
                                            className="rounded-full bg-zinc-100 px-2 py-1 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mb-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
                                    <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-400">
                                        <span className="flex items-center gap-1">
                                            <Download className="h-3 w-3" />
                                            {template.downloads.toLocaleString()}
                                        </span>
                                        <span className={`font-medium ${
                                            template.difficulty === 'Easy' ? 'text-green-600' :
                                            template.difficulty === 'Intermediate' ? 'text-yellow-600' :
                                            'text-red-600'
                                        }`}>
                                            {template.difficulty}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => handleUseTemplate(template)}
                                    className="w-full rounded-lg bg-secondary text-secondary-foreground px-4 py-2 text-sm font-medium transition hover:bg-secondary/80"
                                >
                                    Use Template
                                </button>

                                <div className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-500">
                                    by {template.author}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
