# Dual System Prompt Implementation Guide

## Overview
This document explains how the OHM application implements a dual system prompt strategy where:
- **First user prompt on `/build`** → Uses **System Prompt 1** (Project Initializer)
- **All subsequent prompts on `/build/abc`** → Uses **System Prompt 2** (Conversational Agent)

## Architecture

### 1. Agent Configuration (`lib/agents/config.ts`)

#### System Prompt 1: Project Initializer
**Purpose:** Quick project initialization and idea validation
**Agent Type:** `projectInitializer`
**Model:** `anthropic/claude-opus-4-5`
**When Used:** First message in any chat (message count = 0)

**Key Characteristics:**
- Fast and concise responses
- Provides 2-3 concrete project approaches
- Asks only 2-3 critical questions
- Builds excitement and confidence
- Transitions user to full build interface quickly

**Example Interaction:**
```
User: "I want to build a smart plant watering system"

AI (Project Initializer): "Awesome idea! 🌱 Here are three ways to approach this:

• Simple & Reliable ($15-25): Soil moisture sensor + relay + timer
  → Waters when soil is dry, runs on batteries
  
• IoT Connected ($30-45): ESP32 + moisture sensor + WiFi app control
  → Schedule watering, get notifications, view moisture levels
  
• Advanced Automation ($60-80): Camera + ML + multi-zone control
  → Detects plant health, adjusts watering per plant type

Quick questions:
1. Indoor or outdoor plants?
2. What's your budget range?
3. Have you worked with Arduino/ESP32 before?"
```

#### System Prompt 2: Conversational Agent
**Purpose:** Detailed project development and documentation
**Agent Type:** `conversational`
**Model:** `anthropic/claude-opus-4-5`
**When Used:** All subsequent messages (message count > 0)

**Key Characteristics:**
- Comprehensive project analysis
- Gathers detailed requirements naturally
- Generates Context, MVP, and PRD documents
- Adapts voice to user skill level
- Balances ambition with practical reality

**Output Format:**
```
---CONTEXT_START---
# Project Context
## Overview | Background | Success Criteria | Constraints | About User
---CONTEXT_END---

---MVP_START---
# MVP
## Core Features (with why) | Out of Scope | Success Metrics | Tech Stack
---MVP_END---

---PRD_START---
# PRD
## Vision | Hardware/Software Reqs | User Stories | BOM Preview | Timeline | Risks
---PRD_END---
```

### 2. Dynamic Agent Selection (`lib/agents/config.ts`)

The `getChatAgentType()` helper function determines which agent to use:

```typescript
export function getChatAgentType(messageCount: number): AgentType {
  return messageCount === 0 ? 'projectInitializer' : 'conversational';
}
```

**Logic:**
- `messageCount === 0` → First message → Use `projectInitializer`
- `messageCount > 0` → Subsequent messages → Use `conversational`

### 3. Orchestrator Integration (`lib/agents/orchestrator.ts`)

The `AssemblyLineOrchestrator.chat()` method implements the dynamic selection:

```typescript
async chat(userMessage: string, onStream?: (chunk: string) => void) {
    // 1. Get message count BEFORE adding new message
    const historyBeforeNewMessage = await this.getHistory();
    const messageCount = historyBeforeNewMessage.length;
    
    // 2. Determine which agent to use
    const agentType = getChatAgentType(messageCount);
    
    console.log(`📊 Message count: ${messageCount}, Using agent: ${agentType}`);
    
    // 3. Persist user message
    // 4. Get updated history
    // 5. Run selected agent
    const response = await this.runner.runAgent(
        agentType,  // Dynamic: 'projectInitializer' or 'conversational'
        history,
        { stream: true, onStream, userContext: this.userContext }
    );
    
    // 6. Persist response with agent name
    // 7. Return response
}
```

**Key Implementation Details:**
1. **Message count is checked BEFORE adding the new message** to accurately determine if this is the first interaction
2. **Agent type is logged** for debugging and monitoring
3. **Agent name is persisted** in the database for tracking which agent handled each response
4. **Seamless transition** - users don't notice the agent switch

### 4. User Flow

#### Flow Diagram
```
User visits /build
    ↓
Enters project idea
    ↓
Creates new chat → /build/abc
    ↓
[First Message] → messageCount = 0
    ↓
Uses projectInitializer (System Prompt 1)
    ↓
Quick validation & direction
    ↓
[Second Message] → messageCount = 1
    ↓
Uses conversational (System Prompt 2)
    ↓
Detailed requirements gathering
    ↓
[All subsequent messages] → messageCount > 1
    ↓
Continues with conversational (System Prompt 2)
    ↓
Generates Context, MVP, PRD documents
```

#### Route Mapping
- **`/build`** - Initial project creation page (ProjectCreator component)
- **`/build/abc`** - Chat interface with dynamic agent selection
  - First message: Project Initializer
  - Subsequent messages: Conversational Agent

### 5. Database Integration

The system tracks which agent handled each message:

**Messages Table:**
```sql
{
  chat_id: "abc",
  role: "assistant",
  content: "...",
  agent_name: "projectInitializer" | "conversational",  // Tracked!
  sequence_number: 1
}
```

**Session Tracking:**
```sql
{
  current_agent: "projectInitializer" | "conversational",  // Updated per message
  last_active_at: "2026-01-11T12:00:00Z"
}
```

## Benefits of This Approach

### 1. **Optimized User Experience**
- **Fast initial response** - Project Initializer gets users started quickly
- **Detailed follow-up** - Conversational Agent provides comprehensive support
- **Seamless transition** - Users don't notice the agent switch

### 2. **Efficient Resource Usage**
- **Shorter initial prompts** - Project Initializer uses fewer tokens
- **Focused context** - Each agent optimized for its specific task

### 3. **Better Conversation Quality**
- **Clear separation of concerns** - Initialization vs. detailed planning
- **Appropriate tone** - Energetic start, then thorough development

### 4. **Maintainability**
- **Modular design** - Each agent can be updated independently
- **Clear logic** - Simple message count-based selection
- **Trackable** - Agent names logged in database

## Testing the Implementation

### Test Case 1: First Message
```
1. Visit /build
2. Enter: "I want to build a temperature monitor"
3. Submit
4. Expected: Project Initializer responds with 2-3 options and quick questions
5. Check console: "📊 Message count: 0, Using agent: projectInitializer"
```

### Test Case 2: Second Message
```
1. Continue from Test Case 1
2. Reply: "I want the IoT version, indoor use, $40 budget, beginner level"
3. Expected: Conversational Agent provides detailed analysis
4. Check console: "📊 Message count: 2, Using agent: conversational"
```

### Test Case 3: Subsequent Messages
```
1. Continue conversation
2. All further messages should use conversational agent
3. Check database: agent_name alternates between user messages and "conversational"
```

## Customization Options

### Adjusting the Transition Point
To change when the agent switches (e.g., after 2 messages instead of 1):

```typescript
// In lib/agents/config.ts
export function getChatAgentType(messageCount: number): AgentType {
  return messageCount < 2 ? 'projectInitializer' : 'conversational';
}
```

### Adding More Agents
To add additional specialized agents:

```typescript
export function getChatAgentType(messageCount: number, context?: string): AgentType {
  if (messageCount === 0) return 'projectInitializer';
  if (context?.includes('budget')) return 'budgetOptimizer';
  return 'conversational';
}
```

### User Context Integration
The system already supports user context (skill level, project complexity):

```typescript
const response = await this.runner.runAgent(
    agentType,
    history,
    { 
        stream: true, 
        onStream, 
        userContext: this.userContext  // Passed to both agents
    }
);
```

## Troubleshooting

### Issue: Agent not switching
**Symptom:** Always uses same agent
**Check:** Console logs for message count
**Solution:** Verify `getChatAgentType()` is imported and called

### Issue: First message uses wrong agent
**Symptom:** Conversational agent used for first message
**Check:** Message count calculation timing
**Solution:** Ensure history is fetched BEFORE adding new message

### Issue: Database shows wrong agent_name
**Symptom:** agent_name doesn't match expected agent
**Check:** Variable `agentType` value in orchestrator
**Solution:** Verify `agentType` is used (not hardcoded "conversational")

## Summary

The dual system prompt implementation provides:

✅ **Seamless user experience** - Automatic agent switching based on conversation stage
✅ **Optimized responses** - Right agent for the right task
✅ **Full tracking** - Database records which agent handled each message
✅ **Easy maintenance** - Clear separation of concerns
✅ **Extensible design** - Easy to add more agents or modify logic

The system automatically uses:
- **Project Initializer** (System Prompt 1) for the first message on `/build`
- **Conversational Agent** (System Prompt 2) for all subsequent messages on `/build/abc`

No user intervention required - the transition is completely automatic and transparent!
