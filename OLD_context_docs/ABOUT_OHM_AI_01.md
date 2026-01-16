    # 🔌 OHM - Hardware Lifecycle Orchestrator
    ## Complete Application Documentation v3.1 (Verified from Codebase)
    **Last Updated: January 15, 2026**

    ---

    # 📋 TABLE OF CONTENTS

    1. [What is OHM?](#what-is-ohm)
    2. [Technology Stack](#technology-stack)
    3. [Multi-Agent AI System](#multi-agent-ai-system)
    4. [✅ IMPLEMENTED FEATURES](#implemented-features)
    5. [⚠️ PLANNED FEATURES (NOT YET IMPLEMENTED)](#planned-features-not-yet-implemented)
    6. [User Flow](#user-flow)
    7. [Project Architecture](#project-architecture)
    8. [How to Run](#how-to-run)

    ---

    # 🎯 What is OHM?

    **OHM** (named after "The path of least resistance") is an **AI-powered IoT/Hardware Development IDE** that bridges the gap between a **"Vague IoT Idea"** and a **"Working Physical Prototype"**.

    Unlike standard AI IDEs that focus solely on code, **OHM manages the complex dependencies of the physical world**: hardware parts, electrical wiring, and software logic.

    ### The Problem OHM Solves
    The **"Debug Wall"** in IoT is high: users often don't know if a project failed because of:
    - A code bug
    - A loose wire
    - A blown sensor
    - A power mismatch

    **OHM removes these barriers** by acting as a **Lead Systems Engineer** that guides the user through a turn-based, "Mission-Based" progression.

    ---

    # ⚙️ Technology Stack

    | Category | Technology | Verified |
    |----------|------------|----------|
    | **Frontend Framework** | Next.js 15.1.6 with React 19 | ✅ |
    | **Language** | TypeScript | ✅ |
    | **Styling** | Tailwind CSS 3.4.17 | ✅ |
    | **UI Components** | Radix UI + Ark UI | ✅ |
    | **Animations** | Framer Motion | ✅ |
    | **Icons** | Lucide React | ✅ |
    | **Content Rendering** | React Markdown + remark-gfm | ✅ |
    | **Database** | Supabase (PostgreSQL) | ✅ |
    | **AI Integration** | BYTEZ API (OpenAI-compatible) | ✅ |
    | **AI SDK** | OpenAI SDK v6.15.0 | ✅ |

    ---

    # 🤖 Multi-Agent AI System

    ## Architecture Overview

    OHM employs a **"Sequential Assembly Line"** architecture where specialized AI agents collaborate to guide a user from a vague idea to a fully verified hardware prototype.

    **Verified from `lib/agents/config.ts`:**

    ```
    User Query
        ↓
    [Claude Sonnet 4.5] Orchestrator → Routes to:
        ↓
        ├─ [Claude Opus 4.5] ────────→ Project Initializer (first message)
        ├─ [Claude Opus 4.5] ────────→ Conversational Agent (subsequent)
        ├─ [Claude Opus 4.5] ────────→ BOM Generator
        ├─ [Claude Sonnet 4.5] ──────→ Code Generator
        ├─ [Claude Sonnet 4.5] ──────→ Wiring Specialist
        ├─ [Gemini 2.5 Flash] ───────→ Circuit Verifier (vision)
        ├─ [Claude Opus 4.5] ────────→ Datasheet Analyzer
        └─ [Claude Sonnet 4.5] ──────→ Budget Optimizer
    ```

    ## Agent Details (Verified from Config)

    ### 1. Orchestrator
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-sonnet-4-5` |
    | **Temperature** | 0.1 (low for consistent routing) |
    | **Max Tokens** | 150 |
    | **Role** | Intent classification - routes to: CHAT, BOM, CODE, WIRING, CIRCUIT_VERIFY, DATASHEET, BUDGET |

    ### 2. Project Initializer (First Message Only)
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-opus-4-5` |
    | **Temperature** | 0.7 |
    | **Max Tokens** | 2000 |
    | **Role** | Quick-start wizard - transforms vague ideas into concrete project direction |
    | **Tools** | `update_context`, `update_mvp`, `update_prd` |

    ### 3. Conversational Agent (Subsequent Messages)
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-opus-4-5` |
    | **Temperature** | 0.8 (higher for creative conversation) |
    | **Max Tokens** | 3000 |
    | **Role** | The idea-to-blueprint translator - guides user through requirements |
    | **Tools** | `update_context`, `update_mvp`, `update_prd` |

    ### 4. BOM Generator
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-opus-4-5` |
    | **Temperature** | 0.2 (low for precision) |
    | **Max Tokens** | 25000 |
    | **Role** | Creates validated Bill of Materials with voltage/current checks |
    | **Tools** | `update_bom` |

    ### 5. Code Generator
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-sonnet-4-5` |
    | **Temperature** | 0.2 (low for consistent code) |
    | **Max Tokens** | 16000 |
    | **Role** | Writes production-ready firmware (Arduino C++, MicroPython) |
    | **Tools** | `add_code_file` |

    ### 6. Wiring Specialist
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-sonnet-4-5` |
    | **Temperature** | 0.15 (very low for precision) |
    | **Max Tokens** | 4000 |
    | **Role** | Creates step-by-step wiring instructions with safety warnings |
    | **Tools** | `update_wiring` |

    ### 7. Circuit Verifier (Vision Agent)
    | Property | Value |
    |----------|-------|
    | **Model** | `google/gemini-2.5-flash` |
    | **Temperature** | 0.3 |
    | **Max Tokens** | 3000 |
    | **Role** | Analyzes circuit photos to catch wiring mistakes |
    | **Tools** | None (outputs JSON analysis) |

    ### 8. Datasheet Analyzer
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-opus-4-5` |
    | **Temperature** | 0.25 |
    | **Max Tokens** | 6000 |
    | **Role** | Extracts critical specs from component datasheets |
    | **Tools** | None (outputs JSON) |

    ### 9. Budget Optimizer
    | Property | Value |
    |----------|-------|
    | **Model** | `anthropic/claude-sonnet-4-5` |
    | **Temperature** | 0.3 |
    | **Max Tokens** | 25000 |
    | **Role** | Finds cost savings without sacrificing quality |
    | **Tools** | `update_budget` |

    ---

    # ✅ IMPLEMENTED FEATURES

    ## 1. 🎨 UI & Design System
    **Verified Components:**
    - **Landing Page** (`components/LandingPage.tsx`)
    - **Project Creator** (`components/text_area/ProjectCreator.tsx`) - with user level/complexity selection
    - **AI Chat Interface** (`components/ai_chat/AIAssistantUI.jsx`) - full chat UI
    - **Sidebar** with conversation history, folders, templates
    - **Header** with agent dropdown selector
    - **Theme Toggle** (dark/light mode with localStorage persistence)
    - **Mesh Gradient** background effects
    - **Faulty Terminal** animation component

    ## 2. 🤖 Real AI Integration (Fully Working)
    **Verified from `lib/agents/orchestrator.ts` and API routes:**
    - ✅ **BYTEZ API Integration** via OpenAI-compatible endpoint
    - ✅ **Multi-Agent Orchestration** - automatic routing based on intent
    - ✅ **Streaming Responses** - real-time token-by-token updates
    - ✅ **API Key Failover** - automatic rotation on quota errors (`lib/agents/key-manager.ts`)
    - ✅ **Tool Calling** - agents can call structured tools
    - ✅ **SSE (Server-Sent Events)** for streaming (`app/api/agents/chat/route.ts`)

    ## 3. 🛠️ Tool System (Fully Implemented)
    **Verified from `lib/agents/tools.ts` and `lib/agents/tool-executor.ts`:**

    | Tool | Description | Used By |
    |------|-------------|---------|
    | `update_context` | Project context (Overview, Background, Constraints) | Conversational, ProjectInitializer |
    | `update_mvp` | MVP specification (Core Features, Success Metrics) | Conversational, ProjectInitializer |
    | `update_prd` | Product Requirements Document | Conversational, ProjectInitializer |
    | `update_bom` | Bill of Materials with components and pricing | BOM Generator |
    | `add_code_file` | Add code files (accumulates multiple files) | Code Generator |
    | `update_wiring` | Wiring connections and instructions | Wiring Specialist |
    | `update_budget` | Budget optimization recommendations | Budget Optimizer |

    ## 4. 📦 Drawer System (Fully Implemented)
    **Verified from `components/tools/` directory:**

    | Drawer | File | Status |
    |--------|------|--------|
    | **Context Drawer** | `ContextDrawer.tsx` | ✅ Full - Displays Context/MVP/PRD with tree navigation |
    | **BOM Drawer** | `BOMDrawer.tsx` | ✅ Full - Component list with pricing and warnings |
    | **Code Drawer** | `CodeDrawer.tsx` | ✅ Full - File tree with syntax highlighting |
    | **Wiring Drawer** | `WiringDrawer.tsx` | ✅ Full - Connection table and instructions |
    | **Budget Drawer** | `BudgetDrawer.tsx` | ✅ Full - Cost comparison and recommendations |
    | **Resizable Drawer** | `ResizableDrawer.tsx` | ✅ Base component for drawer resizing |

    **Auto-Open Behavior:**
    - Drawers automatically open when agents call their corresponding tools
    - User can close drawers; they won't auto-reopen until chat restart
    - Event-driven via `window.dispatchEvent('open-drawer')`

    ## 5. 💾 Database Integration (Supabase)
    **Verified from `lib/db/` and realtime subscriptions:**
    - ✅ **Chat Persistence** (`lib/db/chat.ts`)
    - `createChat()`, `getMessages()`, `addMessage()`
    - `updateSession()`, `getNextSequenceNumber()`
    - ✅ **Artifact Storage** (`lib/db/artifacts.ts`)
    - `createArtifact()`, `createVersion()`, `getLatestArtifact()`
    - Git-style versioning for all artifacts
    - ✅ **Realtime Subscriptions**
    - Messages update live via Postgres changes
    - Artifacts refresh when new versions are created
    - ✅ **Tables Used**: `chats`, `chat_sessions`, `messages`, `artifacts`, `artifact_versions`

    ## 6. 🔔 Toast Notification System
    **Verified from `lib/agents/toast-notifications.ts`:**
    - ✅ **Agent Change Toasts** - "🤖 [Agent Name] is handling this"
    - ✅ **Tool Call Toasts** - "🔧 Agent called [tool_name]"
    - ✅ **API Key Failure Toasts** - "⚠️ Key [X] exhausted"
    - ✅ **API Key Rotation Toasts** - "✅ Switched to backup key [X]"

    ## 7. 👤 User Context System
    **Verified from `components/text_area/ProjectCreator.tsx` and agent config:**
    - ✅ **User Experience Level Selection**: Beginner, Intermediate, Advanced
    - ✅ **Project Complexity Selection**: Simple, Moderate, Complex
    - ✅ **Dynamic System Prompt Customization** via `getContextualSystemPrompt()`

    **How it adapts:**
    | Level | Communication Style |
    |-------|---------------------|
    | Beginner | Simple terms, explain concepts, be encouraging |
    | Intermediate | Standard terminology, best practices |
    | Advanced | Technical language, tradeoffs, optimizations |

    | Complexity | Project Scope |
    |------------|---------------|
    | Simple | 3-5 components, prioritize ease |
    | Moderate | 5-10 components, balanced |
    | Complex | 10+ components, production-ready |

    ## 8. 🏷️ Dynamic Chat Titles
    **Verified from `app/api/agents/title/route.ts`:**
    - ✅ AI-generated titles (3-6 words) from first user message
    - ✅ Background generation after chat creation
    - ✅ Uses orchestrator agent for fast generation

    ## 9. 📊 Message & Artifact Rendering
    **Verified from `components/ai_chat/Message.jsx`:**
    - ✅ **Markdown Rendering** with ReactMarkdown
    - ✅ **BOM Inline Display** - BOMCard component renders when BOM tool is called
    - ✅ **Code Block Parsing** - Syntax highlighted code blocks
    - ✅ **Drawer Link Buttons** - "Open [X] Drawer >" buttons appear after tool calls

    ## 10. 🔄 Streaming Architecture
    **Verified from `lib/hooks/use-chat.ts` and API route:**
    - ✅ **SSE Stream Parsing** with proper event handling
    - ✅ **Event Types**: `text`, `agent_selected`, `tool_call`, `metadata`, `error`
    - ✅ **Optimistic Updates** - User messages appear immediately
    - ✅ **Real-time AI Response** - Characters stream as generated

    ---

    # ⚠️ PLANNED FEATURES (NOT YET IMPLEMENTED)

    > **🚨 WARNING: The features listed below are from OLD documentation and have NOT been fully wired up or tested. The infrastructure exists but end-to-end functionality is incomplete.**

    ---

    ## 🔌 WIRING DIAGRAM VISUAL GENERATION (PARTIAL)
    > ⚠️ **STATUS: TOOL EXISTS, VISUAL GENERATION NOT IMPLEMENTED**

    **What EXISTS:**
    - ✅ `update_wiring` tool defined in `tools.ts`
    - ✅ `WiringDrawer.tsx` component with table UI
    - ✅ Tool executor persists wiring data to database

    **What's MISSING:**
    - ❌ No SVG/visual diagram generation (only text-based connection table)
    - ❌ No interactive diagram component
    - ❌ No breadboard/schematic visualization

    ---

    ## 💰 BUDGET OPTIMIZATION (PARTIAL)
    > ⚠️ **STATUS: TOOL EXISTS, OPTIMIZATION LOGIC NOT FULLY TESTED**

    **What EXISTS:**
    - ✅ `update_budget` tool defined
    - ✅ `BudgetDrawer.tsx` component
    - ✅ Budget Optimizer agent configured

    **What's MISSING:**
    - ❌ No actual supplier API integration for real pricing
    - ❌ No automated bulk discount calculation
    - ❌ End-to-end flow not thoroughly tested

    ---

    ## 👁️ CIRCUIT VERIFICATION (PARTIAL)
    > ⚠️ **STATUS: AGENT EXISTS, NO UI FOR PHOTO UPLOAD**

    **What EXISTS:**
    - ✅ `circuitVerifier` agent configured with Gemini 2.5 Flash
    - ✅ `runVisionAgent()` method in orchestrator
    - ✅ System prompt for circuit analysis

    **What's MISSING:**
    - ❌ No photo upload UI in the chat interface
    - ❌ No `/api/agents/verify/route.ts` implementation for frontend
    - ❌ Cannot trigger vision verification from user action

    ---

    ## 📄 DATASHEET ANALYSIS (PARTIAL)
    > ⚠️ **STATUS: AGENT EXISTS, NO FILE UPLOAD**

    **What EXISTS:**
    - ✅ `datasheetAnalyzer` agent configured
    - ✅ System prompt for extraction

    **What's MISSING:**
    - ❌ No PDF/file upload UI
    - ❌ No integration with document parsing
    - ❌ Not triggerable from user action

    ---

    ## 🔗 RIPPLE EFFECT ENGINE (NOT IMPLEMENTED)
    > ⚠️ **STATUS: OLD DOCUMENTATION - CONCEPT ONLY**

    **What's MISSING:**
    - ❌ No dependency monitoring between parts
    - ❌ No automatic conflict detection when parts change
    - ❌ No cascading update system

    ---

    ## 🔒 LOCKED PROJECT BLUEPRINT (PARTIAL)
    > ⚠️ **STATUS: CONCEPT EXISTS, NOT ENFORCED**

    **What EXISTS:**
    - ✅ Agents mention "Lock" in responses
    - ✅ `isReadyToLock` flag returned from orchestrator

    **What's MISSING:**
    - ❌ No actual "lock" action that freezes project state
    - ❌ No "Golden Blueprint" JSON generation as single source of truth
    - ❌ Parts can be changed after "locking"

    ---

    # 🚶 User Flow

    ## Phase 1: Landing Page (`/`)
    - Hero section with "The path of least resistance"
    - Feature showcase
    - "Start Building" button → navigates to `/build`

    ## Phase 2: Project Creator (`/build`)
    - **User selects**: Experience Level + Project Complexity
    - **User enters**: Project description
    - **User clicks**: "Start Building"
    - → Creates chat in Supabase
    - → Navigates to `/build/[chatId]`

    ## Phase 3: AI Chat (`/build/[chatId]`)
    1. **First Message**: Handled by `projectInitializer` agent
    - Suggests 2-3 approaches (Simple/IoT/Advanced)
    - Asks 2-3 critical questions
    
    2. **Subsequent Messages**: Routed by `orchestrator`
    - Intent detection → routes to appropriate specialist
    - Tools are called → drawers auto-open

    3. **Artifacts Generated**:
    - Context/MVP/PRD → Context Drawer
    - BOM → BOM Drawer
    - Code → Code Drawer
    - Wiring → Wiring Drawer
    - Budget → Budget Drawer

    ---

    # 🏗️ Project Architecture

    ## Directory Structure

    ```
    OHM/
    ├── app/
    │   ├── api/agents/
    │   │   ├── chat/route.ts      # Main chat endpoint (SSE streaming)
    │   │   ├── blueprint/route.ts # BOM generation endpoint
    │   │   ├── code/route.ts      # Code generation endpoint
    │   │   ├── title/route.ts     # Dynamic title generation
    │   │   └── verify/route.ts    # Circuit verification endpoint
    │   ├── build/
    │   │   └── page.tsx           # Build page with chat ID routing
    │   ├── globals.css
    │   ├── layout.tsx
    │   └── page.tsx               # Landing page
    │
    ├── components/
    │   ├── ai_chat/
    │   │   ├── AIAssistantUI.jsx  # Main chat interface
    │   │   ├── Message.jsx        # Message rendering with BOM/code
    │   │   ├── Sidebar.jsx        # Conversation list
    │   │   ├── Header.jsx         # Agent dropdown
    │   │   ├── Composer.jsx       # Message input
    │   │   └── ChatPane.jsx       # Chat area wrapper
    │   │
    │   ├── tools/
    │   │   ├── BOMDrawer.tsx      # Bill of Materials display
    │   │   ├── CodeDrawer.tsx     # Code file browser
    │   │   ├── ContextDrawer.tsx  # Context/MVP/PRD display
    │   │   ├── WiringDrawer.tsx   # Wiring connections table
    │   │   ├── BudgetDrawer.tsx   # Budget optimization
    │   │   └── ResizableDrawer.tsx # Base drawer component
    │   │
    │   ├── text_area/
    │   │   └── ProjectCreator.tsx # Initial project setup form
    │   │
    │   └── ui/                    # Radix-based UI primitives
    │
    ├── lib/
    │   ├── agents/
    │   │   ├── config.ts          # Agent configurations & prompts
    │   │   ├── orchestrator.ts    # Multi-agent orchestration
    │   │   ├── tools.ts           # Tool definitions
    │   │   ├── tool-executor.ts   # Tool execution & DB persistence
    │   │   ├── key-manager.ts     # API key rotation
    │   │   └── toast-notifications.ts
    │   │
    │   ├── db/
    │   │   ├── chat.ts            # Chat CRUD operations
    │   │   └── artifacts.ts       # Artifact CRUD operations
    │   │
    │   ├── hooks/
    │   │   ├── use-chat.ts        # Chat state & streaming
    │   │   └── use-chat-list.ts   # Chat list for sidebar
    │   │
    │   ├── supabase/
    │   │   ├── client.ts          # Supabase client
    │   │   └── types.ts           # Generated types
    │   │
    │   └── parsers.ts             # BOM/Code/Context parsing utilities
    │
    └── context_docs/              # Documentation
    ```

    ---

    # 🚀 How to Run

    ### Prerequisites
    - Node.js 18+
    - Supabase project (for database)
    - BYTEZ API key

    ### 1. Install Dependencies
    ```bash
    npm install
    ```

    ### 2. Configure Environment
    Create `.env.local` with:
    ```bash
    # BYTEZ API Keys (supports multiple for failover)
    BYTEZ_API_KEY=your_key_1
    BYTEZ_API_KEY_2=your_key_2
    BYTEZ_API_KEY_3=your_key_3

    # Supabase
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

    ### 3. Run Development Server
    ```bash
    npm run dev
    ```

    ### 4. Access the Application
    - **Landing**: http://localhost:3000
    - **Build**: http://localhost:3000/build

    ---

    # 📊 Agent Model Summary

    | Agent | Model | Purpose |
    |-------|-------|---------|
    | Orchestrator | `anthropic/claude-sonnet-4-5` | Fast intent routing |
    | Project Initializer | `anthropic/claude-opus-4-5` | First message handling |
    | Conversational | `anthropic/claude-opus-4-5` | General conversation |
    | BOM Generator | `anthropic/claude-opus-4-5` | Component selection |
    | Code Generator | `anthropic/claude-sonnet-4-5` | Firmware generation |
    | Wiring Specialist | `anthropic/claude-sonnet-4-5` | Connection instructions |
    | Circuit Verifier | `google/gemini-2.5-flash` | Vision analysis |
    | Datasheet Analyzer | `anthropic/claude-opus-4-5` | Document extraction |
    | Budget Optimizer | `anthropic/claude-sonnet-4-5` | Cost optimization |

    ---

    # ✅ Summary

    **What's Fully Working:**
    - Multi-agent AI system with 9 specialized agents
    - Streaming chat with real-time responses
    - Tool calling with auto-opening drawers
    - Full database persistence (Supabase)
    - Context/MVP/PRD generation
    - BOM generation with inline display
    - Code generation with file tree
    - Wiring instructions (table-based)
    - Budget optimization display
    - Toast notifications
    - Dynamic chat titles
    - User level/complexity customization
    - API key failover

    **What Needs Work:**
    - Visual wiring diagram generation (SVG)
    - Photo upload for circuit verification
    - PDF upload for datasheet analysis
    - Project locking mechanism
    - Ripple effect engine
    - Real supplier pricing integration

    ---

    *Documentation verified from codebase on January 15, 2026*

    **Happy Building with OHM! ⚡🔌**
