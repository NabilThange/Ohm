# User Level & Project Complexity Feature

## Overview
Added dynamic system prompt customization based on user experience level and project complexity. This allows the AI to tailor its responses, component selections, and code complexity to match the user's expertise and project scope.

## Changes Made

### 1. **Frontend - Build Page UI** (`components/text_area/ProjectCreator.tsx`)
- Added two new selector sections:
  - **User Experience Level**: Beginner, Intermediate, Advanced
  - **Project Complexity**: Simple, Moderate, Complex
- Updated the component to require all three selections (Category, User Level, Project Complexity) before enabling the "Start Building" button
- Modified the `onSubmit` callback to pass all four parameters

### 2. **Build Page State Management** (`app/build/page.tsx`)
- Added `userContext` state to store user level and project complexity
- Updated `handleProjectSubmit` to accept and store these new parameters
- Passed `userContext` to `AIAssistantUI` component

### 3. **AI Assistant UI** (`components/ai_chat/AIAssistantUI.jsx`)
- Added `userContext` prop to the component
- Passed `userContext` to the `useChat` hook
- Updated `handleCreateNewChat` to include `userContext` in API requests

### 4. **Chat Hook** (`lib/hooks/use-chat.ts`)
- Added `userContext` parameter to the `useChat` hook
- Included `userContext` in all API requests to `/api/agents/chat`

### 5. **Chat API Route** (`app/api/agents/chat/route.ts`)
- Extracted `userContext` from request body
- Passed `userContext` to `AssemblyLineOrchestrator` constructor

### 6. **Agent Configuration** (`lib/agents/config.ts`)
- Added `UserContext` interface defining user level and project complexity types
- Created helper functions:
  - `getUserLevelInstructions()`: Generates instructions based on user expertise
  - `getProjectComplexityInstructions()`: Generates instructions based on project scope
  - `getContextualSystemPrompt()`: Combines base prompt with contextual instructions
- Each user level provides different guidance:
  - **Beginner**: Simple explanations, step-by-step instructions, safety warnings
  - **Intermediate**: Standard terminology, balanced detail, best practices
  - **Advanced**: Precise technical language, optimization focus, trade-off discussions
- Each complexity level adjusts recommendations:
  - **Simple**: 3-5 components, single functionality, straightforward code
  - **Moderate**: 5-10 components, 2-3 features, modular design
  - **Complex**: 10+ components, advanced features, production-ready architecture

### 7. **Orchestrator** (`lib/agents/orchestrator.ts`)
- Updated `AssemblyLineOrchestrator` constructor to accept `userContext`
- Modified `AgentRunner.runAgent()` to accept and apply `userContext` to system prompts
- Updated the `chat()` method to pass `userContext` when running the conversational agent
- System prompts are now dynamically generated using `getContextualSystemPrompt()`

## How It Works

1. **User Input**: User selects their experience level and desired project complexity on the `/build` page
2. **Context Propagation**: These selections are passed through the component tree to the API
3. **Dynamic Prompts**: The orchestrator uses `getContextualSystemPrompt()` to enhance the base system prompt with user-specific instructions
4. **Tailored Responses**: The AI agent receives a customized system prompt that instructs it to:
   - Adjust technical language complexity
   - Provide appropriate level of detail
   - Recommend suitable components
   - Generate code with appropriate architecture

## Example

For a **Beginner** user building a **Simple** project:
- AI will explain concepts in simple terms
- Recommend 3-5 beginner-friendly components
- Provide detailed step-by-step instructions
- Include safety warnings and common pitfalls
- Generate straightforward, well-commented code

For an **Advanced** user building a **Complex** project:
- AI will use precise technical terminology
- Support 10+ components with multiple subsystems
- Focus on optimization and trade-offs
- Implement robust, production-ready architecture
- Include advanced features like OTA updates

## Benefits

1. **Personalized Experience**: Each user gets responses tailored to their skill level
2. **Appropriate Complexity**: Projects match user capabilities and goals
3. **Better Learning**: Beginners get more guidance, advanced users get more depth
4. **Efficient Communication**: No over-explanation for experts, no confusion for beginners
5. **Scalable Projects**: Complexity scales with user ambition and capability
