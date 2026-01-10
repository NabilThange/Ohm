// Test the ultra-flexible Context/MVP/PRD parser
import { extractContextFromMessage } from './parsers';

console.log("=== TESTING CONTEXT/MVP/PRD PARSER ===\n");

// Test 1: Standard format with delimiters
const test1 = `
---CONTEXT_START---
# Project Context
This is the context
---CONTEXT_END---

---MVP_START---
# MVP Definition
This is the MVP
---MVP_END---

---PRD_START---
# PRD
This is the PRD
---PRD_END---
`;

console.log("Test 1: Standard format with delimiters");
const result1 = extractContextFromMessage(test1);
console.log("Result:", result1);
console.log("\n");

// Test 2: Inside markdown code blocks
const test2 = `
Here's your project plan:

\`\`\`
---CONTEXT_START---
# Project Context
This is the context
---CONTEXT_END---
\`\`\`

\`\`\`
---MVP_START---
# MVP Definition
This is the MVP
---MVP_END---
\`\`\`
`;

console.log("Test 2: Inside markdown code blocks");
const result2 = extractContextFromMessage(test2);
console.log("Result:", result2);
console.log("\n");

// Test 3: No delimiters, just markers
const test3 = `
CONTEXT_START
# Project Context
This is the context
CONTEXT_END

MVP_START
# MVP Definition
This is the MVP
MVP_END
`;

console.log("Test 3: No delimiters");
const result3 = extractContextFromMessage(test3);
console.log("Result:", result3);
console.log("\n");

// Test 4: With spaces instead of underscores
const test4 = `
CONTEXT START
# Project Context
This is the context
CONTEXT END

MVP START
# MVP Definition
This is the MVP
MVP END
`;

console.log("Test 4: With spaces");
const result4 = extractContextFromMessage(test4);
console.log("Result:", result4);
console.log("\n");

// Test 5: Markdown headers
const test5 = `
## CONTEXT
# Project Context
This is the context

## MVP
# MVP Definition
This is the MVP

## PRD
# PRD
This is the PRD
`;

console.log("Test 5: Markdown headers");
const result5 = extractContextFromMessage(test5);
console.log("Result:", result5);
console.log("\n");

console.log("=== ALL TESTS COMPLETE ===");
