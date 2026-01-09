# OHM Multi-Agent System - Comprehensive Documentation

## 🚀 System Overview

OHM is a production-ready, multi-agent hardware engineering AI system designed for the Microsoft Azure AI Hackathon. It employs a **"Sequential Assembly Line"** architecture where specialized AI agents collaborate to guide a user from a vague idea to a fully verified hardware prototype.

Unlike generic chatbots, OHM assigns specific tasks to the AI model best and currently available for that job (e.g., using reasoning models for logic and coding models for firmware).

---

## 🏗️ Architecture & Workflow

The system operates on a linear, sequential flow to ensure logical dependency and maximize the "context" passed between agents.

### The Sequential Assembly Line

1.  **User Input**: "I want to build a weather station."
2.  **Agent 1: The Visionary (Chat & Ideation)**
    *   **Role**: Refines requirements, asks regarding power/budget/environment.
    *   **Output**: concrete project requirements.
3.  **Agent 2: The Systems Engineer (BOM & Logic)**
    *   **Role**: Validates voltage/current, selects real sourceable parts.
    *   **Output**: "Golden Blueprint" JSON (BOM, Pinout, Power Analysis).
4.  **Agent 3: The Firmware Developer (Code)**
    *   **Role**: Writes valid C++/Arduino code based *strictly* on the Blueprint.
    *   **Output**: Production-ready `.ino` firmware.
5.  **Agent 4: The QA Inspector (Vision Verification)**
    *   **Role**: Analyzes physical circuit photos against the Blueprint.
    *   **Output**: Pass/Fail report with wiring corrections.

---

## 🧠 Current Model Configuration (Live Status)

*As of the latest stable build (Final Fix), the system works with the following configuration to resolve model availability issues.*

| Agent Role | Model ID | Purpose |
| :--- | :--- | :--- |
| **Orchestrator** | `openai/gpt-4o` | Intent classification & routing. |
| **Conversational Agent** | `openai/gpt-4o` | Main user interaction. *(Replaced unavailable Opus model)* |
| **BOM Generator** | `openai/o1` | Advanced reasoning for component selection. |
| **Code Generator** | `anthropic/claude-3.5-sonnet` | SOTA code generation. |
| **Wiring Specialist** | `openai/gpt-4o` | Spatial reasoning for wiring instructions. |
| **Circuit Verifier** | `openai/gpt-4o` | Vision capabilities for circuit inspection. |
| **Datasheet Analyst** | `anthropic/claude-3.5-sonnet` | Technical document analysis. |
| **Budget Optimizer** | `openai/o1` | Cost optimization logic. |

> **Note**: Previous attempts to use `claude-opus-4` and `gemini-2.0-flash-exp` were reverted due to availability errors in the API catalog. The current setup is fully functional.

---

## 💻 Technical Implementation

### Frontend (`components/`)
*   **`AgentChatInterface.tsx`**: The main driver. Handles the chat loop, displays messages with Markdown formatting, and manages the state of the "Assembly Line".
*   **`AssemblyLineProgress.tsx`**: A visual stepper showing which agent is active.
*   **`Header.jsx`**: Revised to include a functional agent selector, allowing users to manually switch contexts if needed (though the Orchestrator handles this automatically).

### Backend (`lib/agents/` & `app/api/`)
*   **`config.ts`**: The central source of truth for System Prompts and Model IDs. Includes strict Markdown formatting rules to ensure agents output beautiful, readable text (bolding key terms, using code blocks).
*   **`orchestrator.ts`**: Manages the sequential logic. It handles the `max_completion_tokens` parameter fix to prevent OpenAI SDK conflicts.
*   **API Routes**:
    *   `/api/agents/chat`: Endpoints for the Visionary.
    *   `/api/agents/blueprint`: Endpoints for the Engineer.
    *   `/api/agents/code`: Endpoints for the Developer.
    *   `/api/agents/verify`: Endpoints for the Inspector.

### Integration (BYTEZ API)
*   **Base URL**: `https://api.bytez.com/models/v2/openai/v1`
*   **Authentication**: Uses `BYTEZ_API_KEY` in `.env.local`.
*   **Compatibility Fix**: The system manually constructs request parameters to avoid the conflict between `max_tokens` and `max_completion_tokens` present in some SDK versions.

---

## 📝 Data Formats

### The "Golden Blueprint" JSON
All agents align on this schema to ensure consistency:

```json
{
  "project_name": "Example Project",
  "bom": [
    { "name": "ESP32", "voltage": "3.3V", "part_number": "..." }
  ],
  "wiring": [
    { "from": "ESP32 GPIO21", "to": "DHT22 DATA", "wire_color": "Yellow" }
  ],
  "power_analysis": { "total_current": "150mA" }
}
```

---

## 🎨 User Experience Enhancements
1.  **Markdown Responses**: Agents now use rich formatting (Headers, **Bold**, `Inline Code`) for clarity.
2.  **No Mocks**: All interactions trigger real AI generation.
3.  **Visual Progress**: Users see exactly where they are in the "Assembly Line".
4.  **Cost Efficiency**: Current estimated cost per full project run is ~$0.10, utilizing high-reasoning models only when necessary.

---

## ✅ Usage Instructions

### 1. Prerequisites
Ensure you have a valid BYTEZ API key in your `.env.local` file:
```env
BYTEZ_API_KEY=your_actual_key_here
NEXT_PUBLIC_BYTEZ_API_KEY=your_actual_key_here
```

### 2. Running Locally
```bash
npm run dev
```
Access the application at `http://localhost:3000/build`.

### 3. Testing the Flow
1.  Type: *"I want to build a smart plant watering system."*
2.  Answer the Visionary's questions about power and budget.
3.  Click **"Lock Design"** when prompted.
4.  Watch the Systems Engineer generate the BOM.
5.  Wait for the Firmware Developer to write the code.
6.  (Optional) Upload a photo to test the Verifier.

---

## 🔧 Troubleshooting

*   **Model Not Found**: If you see this, check `lib/agents/config.ts`. Ensure you are using the models listed in the "Current Model Configuration" section above.
*   **Token Errors**: If you encounter `max_tokens` errors, ensure you are using the patched `orchestrator.ts` which correctly handles `max_completion_tokens`.
*   **Rate Limits**: The free tier of BYTEZ might limit concurrent requests. The sequential architecture helps mitigate this by running one agent at a time.
