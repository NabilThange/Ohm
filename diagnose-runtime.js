// Diagnostic script to test the runtime behavior
// This simulates what happens when a message is sent

console.log('🔍 Diagnosing TOOLS_CONV Runtime Behavior\n');

// Simulate the flow
console.log('FLOW:');
console.log('1. User sends message');
console.log('2. API route receives message + chatId');
console.log('3. Orchestrator.chat() is called');
console.log('4. Orchestrator determines agent (projectInitializer for first message)');
console.log('5. Orchestrator calls runner.runAgent() with chatId in options');
console.log('6. runAgent() checks if options.chatId exists');
console.log('7. If chatId exists, creates AgentContextBuilder');
console.log('8. AgentContextBuilder.buildDynamicContext() is called');
console.log('9. buildDynamicContext() calls summarizer.getSummaryForContext()');
console.log('10. getSummaryForContext() queries database for summary');
console.log('11. If no summary or messageCount === 0, returns "New conversation - no prior context"');
console.log('12. buildDynamicContext() checks if summaryText includes "New conversation"');
console.log('13. If yes, returns empty string (no context injection)');
console.log('14. runAgent() prepends system prompt (with or without context)');
console.log('15. Agent processes request and returns response\n');

console.log('POTENTIAL ISSUES:');
console.log('❌ Issue 1: Database query fails (no connection, wrong table)');
console.log('❌ Issue 2: getSummaryForContext() throws error');
console.log('❌ Issue 3: buildDynamicContext() throws error');
console.log('❌ Issue 4: Error is caught but not logged properly');
console.log('❌ Issue 5: Context injection breaks the system prompt format');
console.log('❌ Issue 6: Agent receives malformed messages array\n');

console.log('MOST LIKELY CULPRIT:');
console.log('The implementation is correct, but there might be:');
console.log('1. A runtime error in buildDynamicContext() that\'s being silently caught');
console.log('2. The context injection is breaking the message format');
console.log('3. The agent is receiving the context but not responding correctly\n');

console.log('DEBUGGING STEPS:');
console.log('1. Check browser console for errors');
console.log('2. Check server logs for errors');
console.log('3. Add console.log in buildDynamicContext() to see if it\'s called');
console.log('4. Add console.log in runAgent() to see the final messages array');
console.log('5. Check if the agent is actually receiving the messages\n');

console.log('QUICK FIX:');
console.log('Add try-catch with detailed logging in buildDynamicContext():');
console.log(`
async buildDynamicContext(): Promise<string> {
    try {
        console.log('[ContextBuilder] Building dynamic context for chatId:', this.chatId);
        const summarizer = new ConversationSummarizer(this.chatId);
        const summaryText = await summarizer.getSummaryForContext();
        console.log('[ContextBuilder] Summary text:', summaryText);
        
        if (summaryText.includes('New conversation')) {
            console.log('[ContextBuilder] New conversation detected, skipping context injection');
            return '';
        }
        
        console.log('[ContextBuilder] Injecting context');
        return \`...\`;
    } catch (error) {
        console.error('[ContextBuilder] ERROR:', error);
        return ''; // Fail gracefully
    }
}
`);
