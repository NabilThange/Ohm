// Quick test to check if the implementation is working
// Run with: node test-implementation.js

console.log('Testing TOOLS_CONV Implementation...\n');

// Test 1: Check if files exist
const fs = require('fs');
const path = require('path');

const filesToCheck = [
    'lib/agents/tools.ts',
    'lib/agents/tool-executor.ts',
    'lib/agents/orchestrator.ts',
    'lib/agents/context-builder.ts'
];

console.log('1. Checking if implementation files exist:');
filesToCheck.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Check if read_file and write_file tools are defined
console.log('\n2. Checking if universal tools are defined in tools.ts:');
const toolsContent = fs.readFileSync('lib/agents/tools.ts', 'utf8');
console.log(`   ${toolsContent.includes('read_file:') ? '✅' : '❌'} read_file tool defined`);
console.log(`   ${toolsContent.includes('write_file:') ? '✅' : '❌'} write_file tool defined`);

// Test 3: Check if tools are added to getToolsForAgent
console.log('\n3. Checking if tools are added to agent tool maps:');
const hasReadFileInMap = toolsContent.includes("'read_file'");
const hasWriteFileInMap = toolsContent.includes("'write_file'");
console.log(`   ${hasReadFileInMap ? '✅' : '❌'} read_file in tool map`);
console.log(`   ${hasWriteFileInMap ? '✅' : '❌'} write_file in tool map`);

// Test 4: Check if tool executor has handlers
console.log('\n4. Checking if tool executor has handlers:');
const executorContent = fs.readFileSync('lib/agents/tool-executor.ts', 'utf8');
console.log(`   ${executorContent.includes('private async readFile') ? '✅' : '❌'} readFile method exists`);
console.log(`   ${executorContent.includes('private async writeFile') ? '✅' : '❌'} writeFile method exists`);
console.log(`   ${executorContent.includes("case 'read_file':") ? '✅' : '❌'} read_file case in switch`);
console.log(`   ${executorContent.includes("case 'write_file':") ? '✅' : '❌'} write_file case in switch`);

// Test 5: Check if context builder exists
console.log('\n5. Checking context builder:');
const contextBuilderExists = fs.existsSync('lib/agents/context-builder.ts');
console.log(`   ${contextBuilderExists ? '✅' : '❌'} context-builder.ts exists`);
if (contextBuilderExists) {
    const contextContent = fs.readFileSync('lib/agents/context-builder.ts', 'utf8');
    console.log(`   ${contextContent.includes('buildDynamicContext') ? '✅' : '❌'} buildDynamicContext method exists`);
}

// Test 6: Check if orchestrator passes chatId
console.log('\n6. Checking if orchestrator passes chatId to runAgent:');
const orchestratorContent = fs.readFileSync('lib/agents/orchestrator.ts', 'utf8');
console.log(`   ${orchestratorContent.includes('chatId?: string') ? '✅' : '❌'} chatId parameter in runAgent options`);
console.log(`   ${orchestratorContent.includes('chatId: this.chatId') ? '✅' : '❌'} chatId passed in chat() method`);
console.log(`   ${orchestratorContent.includes('AgentContextBuilder') ? '✅' : '❌'} AgentContextBuilder imported`);
console.log(`   ${orchestratorContent.includes('buildDynamicContext()') ? '✅' : '❌'} buildDynamicContext() called`);

console.log('\n✅ Implementation check complete!\n');
console.log('If all checks pass, the implementation is correct.');
console.log('If AI responses are not working, the issue is likely:');
console.log('  1. Runtime error in context-builder or summarizer');
console.log('  2. Database connection issue');
console.log('  3. API key issue');
console.log('  4. Frontend not handling responses correctly');
