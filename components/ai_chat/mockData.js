import { makeId } from "@/lib/utils"

export const INITIAL_CONVERSATIONS = [
    {
        id: "c1",
        title: "Ohm Project Setup",
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        messageCount: 2,
        preview: "Initializing Ohm Hardware Orchestrator...",
        pinned: true,
        folder: "Work Projects",
        messages: [
            {
                id: makeId("m"),
                role: "assistant",
                content: "Welcome to Ohm. I am ready to help you build your hardware project. Describe what you want to build.",
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            }
        ],
    }
]

export const INITIAL_TEMPLATES = [
    {
        id: "t1",
        name: "Bug Report",
        content: `**Bug Report**

**Description:**
Brief description of the issue

**Steps to Reproduce:**
1. Step one
2. Step two
3. Step three

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Browser/OS:
- Version:
- Additional context:`,
        snippet: "Structured bug report template with steps to reproduce...",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
]

export const INITIAL_FOLDERS = [
    { id: "f1", name: "Work Projects" },
    { id: "f2", name: "Personal" },
    { id: "f3", name: "Code Reviews" },
]
