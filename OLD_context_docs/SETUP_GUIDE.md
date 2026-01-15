# Ohm MVP - Setup and Getting Started Guide

## 📋 Overview

This is the complete MVP (Minimum Viable Product) for **Ohm - Hardware Lifecycle Orchestrator**, created from scratch based on the reference implementations in the `Landing page`, `text_area`, and `ai_chat` folders.

## 🎯 What's Been Created

### ✅ Complete Application Structure

1. **Landing Page** (`/`) - Marketing homepage with:
   - Hero section with "path of least resistance" tagline
   - Feature showcase (Component Selection, Wiring, Code Generation, Compatibility Check)
   - How It Works section
   - Use case pills
   - Ohm branding (amber/blue color scheme)

2. **Prompt Input** (`/prompt` state) - Project initialization with:
   - Large, focused textarea for project description
   - Sample prompts for quick start
   - Project category selection (Sensor, Automation, Robotics, Communication, Display)
   - Clean, minimal design with smooth animations

3. **Build Interface** (`/build` state) - AI-assisted development with:
   - Chat interface with AI assistant "Ohm"
   - Mission phase stepper (Ideation → Parts → Wiring → Code → Test → Deploy)
   - Artifacts sidebar with tabs (Overview, BOM, Wiring, Code, Budget)
   - Smooth animations and transitions
   - Professional VS Code-inspired dark theme

### 🎨 Design System

- **Color Palette:**
  - Primary: Amber (#f59e0b) - represents electrical energy
  - Accent: Blue (#3b82f6) - represents circuits and connectivity
  - Background: Dark (#0a0a0a) - professional, minimal
  - Text: Light (#e4e4e7) - high contrast for readability

- **Typography:**
  - Sans: Inter (from Google Fonts)
  - Mono: JetBrains Mono (for code and technical elements)

- **Effects:**
  - Glassmorphism (frosted glass effect)
  - Ambient glows (subtle pulsing lights)
  - Dashed borders (technical, engineering feel)
  - Smooth 60fps animations

### 📁 File Structure

```
OHM/
├── app/
│   ├── layout.tsx              # Root layout with fonts and metadata
│   ├── page.tsx                # Main orchestrator (3 view states)
│   ├── globals.css             # Global styles + animations
│   └── fonts/                  # Font files directory
├── components/
│   ├── LandingPage.tsx         # Landing/marketing page
│   ├── PromptInput.tsx         # Project input form
│   ├── BuildInterface.tsx      # AI chat + artifacts
│   └── ui/
│       ├── button.tsx          # Button component
│       └── textarea.tsx        # Textarea component
├── lib/
│   └── utils.ts                # Utility functions (cn)
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind configuration
├── postcss.config.mjs          # PostCSS for Tailwind
├── next.config.mjs             # Next.js config
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

## 🚀 Installation & Running

### Step 1: Install Dependencies

```bash
npm install
# or if you prefer pnpm
pnpm install
```

This will install all required packages:
- Next.js 15.1.6
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI components
- Lucide React icons
- And all utilities

### Step 2: Run Development Server

```bash
npm run dev
# or
pnpm dev
```

The app will be available at **http://localhost:3000**

### Step 3: Build for Production (Optional)

```bash
npm run build
npm start
```

## 🎮 User Flow

### 1. Landing Page (Initial State)
- User arrives and sees the hero section
- Reads about features and how it works
- Clicks **"Start Building"** button

### 2. Prompt Input (Transition #1)
- Smooth fade-in animation
- User sees textarea with sample prompts
- User describes their IoT project
- User selects project category
- Clicks **"Start Building"** (or ⌘+Enter)

### 3. Build Interface (Transition #2)
- Animated slide-in transition
- AI greeting appears after 800ms
- Chat interface becomes active
- User answers AI's questions:
  - What's the primary goal?
  - Where will this be deployed?
  - What's your budget range?
- After ~4 messages, artifacts sidebar smoothly animates in
- Mission phases progress from "Ideation" → "Parts"

## 🎯 Key Features Implemented

### Navigation & Transitions
- ✅ Smooth view transitions (opacity + scale)
- ✅ Back navigation on each screen
- ✅ Keyboard shortcuts (⌘+Enter to submit)

### Landing Page
- ✅ Ohm branding and tagline
- ✅ Feature cards with hover effects
- ✅ Use case pills
- ✅ How It Works section
- ✅ Ambient background effects

### Prompt Input
- ✅ Large, focused textarea
- ✅ 4 sample prompts (clickable)
- ✅ 5 project categories with descriptions
- ✅ Visual feedback on selection
- ✅ Smooth animations

### Build Interface
- ✅ Real-time chat with AI
- ✅ Mission phase tracker (6 phases)
- ✅ Artifacts sidebar (5 tabs)
- ✅ Typing indicators
- ✅ Message timestamps
- ✅ Responsive layout
- ✅ Auto-scroll to latest message

## 🔑 Key Changes from Reference Code

### From "Gorren" Landing Page:
- Changed all branding to "Ohm"
- Replaced "autonomous builder" with "hardware orchestrator"
- Updated feature list to hardware-specific items
- Changed color scheme to amber/blue
- Added Ohm logo (Ω symbol)

### From "VIBE" Text Area:
- Removed video ad generation focus
- Changed to IoT project description
- Updated project styles to hardware categories
- Simplified UI to focus on text input
- Added hardware-specific sample prompts

### From AI Chat Interface:
- Adapted conversation flow for hardware projects
- Added mission phase stepper (6 phases)
- Changed artifacts to hardware-specific tabs
- Updated AI persona to "Ohm, your hardware assistant"
- Added project overview in artifacts

## 🎨 Customization Guide

### Change Colors

Edit `app/globals.css`:

```css
.dark {
  --primary: #f59e0b;    /* Ohm amber */
  --accent: #3b82f6;     /* Ohm blue */
  --background: #0a0a0a; /* Dark background */
}
```

### Add New Project Categories

Edit `components/PromptInput.tsx`:

```typescript
const projectStyles = [
  { value: 'your-category', label: 'Your Label', description: '...', examples: '...' },
  // ... add more
]
```

### Modify AI Greeting

Edit `components/BuildInterface.tsx`:

```typescript
const greetingMessage = {
  content: `Your custom greeting here...`
}
```

## 🐛 Known Limitations (MVP)

- ❌ No real AI integration (simulated responses with setTimeout)
- ❌ No backend/database (all client-side state)
- ❌ No actual BOM generation (placeholder content)
- ❌ No wiring diagram rendering (placeholder)
- ❌ No code generation (placeholder)
- ❌ No project persistence (refresh loses state)
- ❌ No user authentication

## 🚀 Next Steps for Full Implementation

1. **Azure Integration:**
   - Connect to Azure OpenAI Service for real AI responses
   - Implement Azure AI Vision for circuit verification
   - Set up Azure Cosmos DB for project storage

2. **Hardware Database:**
   - Build comprehensive component database
   - Add pricing, specifications, suppliers
   - Implement compatibility checking logic

3. **Visual Features:**
   - Generate actual wiring diagrams
   - Render pin-mapping visualizations
   - Add schematic export (PDF/PNG)

4. **Code Generation:**
   - Real code generation for Arduino/ESP32
   - Library management
   - Syntax highlighting with Prism.js

5. **User Features:**
   - Authentication (Azure AD B2C)
   - Project saving/loading
   - Export functionality
   - Share projects

## 📞 Support

This is an MVP created for Microsoft Imagine Cup 2026. For questions or issues, refer to the `about_app.txt` and `about_app_v2.txt` files for the full product vision.

## 📜 License

Created for Microsoft Imagine Cup 2026 - Educational purposes

---

**Happy Building with Ohm! ⚡**
