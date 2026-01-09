const content = `Excellent! I've locked the design. Here are the Project Context, MVP definitions, and PRD.

---CONTEXT_START---
# Project Context
## Overview
A smart garden monitoring system that tracks soil moisture and temperature to optimize watering.

## Success Criteria
- Battery life > 1 month
- Reliable WiFi connection
- Accurate moisture readings
---CONTEXT_END---

---MVP_START---
# MVP Definition
## Core Features
1. Real-time moisture data logging
2. Basic dashboard
3. Low battery alert

## Tech Stack
- ESP32
- React Native App
- Supabase
---MVP_END---

---PRD_START---
# Product Requirements Document
## Hardware Requirements
- Waterproof casing (IP67)
- LiPo battery support
- Capacitive sensor (corrosion resistant)

## User Stories
- As a user, I want to see a graph of moisture levels over time.
- As a user, I want to be notified when the plant needs water.
---PRD_END---

I've populated the **Context Drawer** with these documents.`;

// Regex from lib/parsers.ts (Step 150)
const contextPattern = /(?:[-*_#]{3,}|\*\*|##)\s*CONTEXT_START\s*(?:[-*_#]{3,}|\*\*|##)?([\s\S]*?)(?:(?:[-*_#]{3,}|\*\*|##)\s*CONTEXT_END|$)/i;
const mvpPattern = /(?:[-*_#]{3,}|\*\*|##)\s*MVP_START\s*(?:[-*_#]{3,}|\*\*|##)?([\s\S]*?)(?:(?:[-*_#]{3,}|\*\*|##)\s*MVP_END|$)/i;
const prdPattern = /(?:[-*_#]{3,}|\*\*|##)\s*PRD_START\s*(?:[-*_#]{3,}|\*\*|##)?([\s\S]*?)(?:(?:[-*_#]{3,}|\*\*|##)\s*PRD_END|$)/i;

const contextMatch = content.match(contextPattern);
const mvpMatch = content.match(mvpPattern);
const prdMatch = content.match(prdPattern);

console.log('Context Found:', !!contextMatch);
if (contextMatch) console.log('Context Length:', contextMatch[1].trim().length);

console.log('MVP Found:', !!mvpMatch);
if (mvpMatch) console.log('MVP Length:', mvpMatch[1].trim().length);

console.log('PRD Found:', !!prdMatch);
if (prdMatch) console.log('PRD Length:', prdMatch[1].trim().length);
