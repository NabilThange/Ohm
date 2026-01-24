# OHM LinkedIn Content Calendar - Days 1-30

## Day 1

### Post 1 (Morning) - [Category: Founder Journey]
**Suggested Visual:** Screenshot of first working prototype

Shipped my first AI agent at 2am. It crashed 47 times.

Here's what I learned: building hardware is 10x harder than software. You can't just "git revert" a fried ESP32.

That's why I built OHM - an AI that actually understands the physical world. Not just code. Not just theory. Real circuits, real components, real voltage limits.

3 months of debugging later, we're live.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Comparison of before/after UI

Most AI coding assistants give you code.

OHM gives you a shopping cart.

Why? Because "build a temperature monitor" means nothing without:
- ESP32 DevKit ($6.50)
- DHT22 sensor ($4.50)
- Jumper wires ($2.95)

We generate BOMs with real part numbers, real prices, real supplier links.

Click. Buy. Build.

---

## Day 2

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Architecture diagram

We use 10 different AI models in OHM.

Not because it's trendy. Because each one is best at something specific:

- Claude Opus 4.5 → Component selection (needs deep reasoning)
- Claude Sonnet 4.5 → Code generation (SOTA at firmware)
- Gemini 2.5 Flash → Circuit verification (native vision)

One model can't do everything well.

So we built an assembly line.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** Error message screenshot

Deployed to prod on a Friday.

Worst. Decision. Ever.

Our API key rotation system failed at 11pm. All 3 backup keys exhausted. Users got error screens.

The fix? Added automatic failover with toast notifications. Now when a key fails, users see: "⚠️ Key 1 exhausted, switching to backup..."

Transparency > silence.

---

## Day 3

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** BOM card component

We spent 6 hours making a table look good.

Worth it.

When our AI generates a Bill of Materials, users don't see JSON. They see:
- Clean component cards
- One-click CSV export
- Direct purchase links
- Safety warnings highlighted

The data was always there. We just made it beautiful.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Late night coding setup

3am debugging session. Coffee #4. Bug still there.

The problem: messages saving to database but not showing in UI.

The cause: Supabase RLS policy blocking reads.

The lesson: Security is great until it blocks your own app.

Added logging everywhere. Found it in 10 minutes.

---

## Day 4

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Code snippet of orchestrator

Built an AI traffic controller.

Every user message hits our "orchestrator" first:
- "Create a BOM" → Routes to Component Specialist
- "Write code" → Routes to Software Engineer  
- "How do I wire this?" → Routes to Circuit Designer

One message. One agent. Zero confusion.

Temperature: 0.1 (we need consistent routing, not creativity)

---

### Post 2 (Evening) - [Category: Data/Results]
**Suggested Visual:** Cost comparison chart

Cut our AI costs by 67%.

How? Conversation summarization.

Instead of sending 50 messages (5,000 tokens) to the AI every time, we send:
- Summary of key decisions (500 tokens)
- Last 10 messages (1,000 tokens)

Same context. 1/3 the cost.

Math wins.

---

## Day 5

### Post 1 (Morning) - [Category: Behind-the-Scenes]
**Suggested Visual:** Wiring diagram generation pipeline

We generate wiring diagrams in 500ms.

Then spend 12 seconds making them pretty.

The trick? Two-phase generation:
1. SVG schematic (instant, deterministic)
2. AI breadboard image (background, doesn't block)

Users see results immediately. Beauty loads while they read.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** First user feedback screenshot

First user message: "This is magic"

Second user message: "Why is the code in JSON?"

Turns out, showing raw JSON to users is... not great UX.

Built inline code cards in 30 minutes. Now code looks professional.

Listen to users. Ship fast.

---

## Day 6

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Database schema diagram

We version everything like Git.

Every BOM update? New version.
Every code change? New version.
Every wiring tweak? New version.

Users can see their project evolve. Rollback if needed.

It's just a `version_number` column. But it changes everything.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** Before/after of streaming implementation

Streaming responses feel 10x faster.

Even when they're not.

We switched from "wait for complete response" to "show tokens as they arrive."

Same backend speed. Completely different user perception.

Perceived performance > actual performance.

---

## Day 7

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Tool calling diagram

Our AI can call functions.

Not just generate text. Actually execute actions:
- `update_bom()` → Saves components to database
- `add_code_file()` → Creates firmware files
- `update_wiring()` → Generates circuit diagrams

It's like giving the AI hands.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Weekend coding session photo

Built the conversation summarizer on a Sunday.

Why? Our context windows were exploding. 50-message conversations = 5,000 tokens per request.

Now we summarize every 5 messages. Agents get:
- Project summary (300 tokens)
- Recent messages (1,000 tokens)

Shipped in 4 hours. Saved thousands in API costs.

---

## Day 8

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Agent identity system

10 AI agents. 10 different avatars.

Each agent has:
- Unique name (Circuit Designer, Cost Engineer)
- Custom avatar (SVG illustrations)
- Specialized role
- Specific model

Users always know who's helping them.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Error log screenshot

Spent 3 hours debugging. Found the issue.

It was a typo.

`agent_name` vs `agent_id` in the database.

The lesson? TypeScript would've caught this. But we were moving fast.

Sometimes fast = bugs. That's okay.

---

## Day 9

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Drawer system in action

We built resizable drawers.

Not because it's fancy. Because users need to see:
- Chat on the left
- BOM on the right
- Code below
- Wiring diagram above

All at once. Resizable. Persistent.

It's just better UX.

---

### Post 2 (Evening) - [Category: Data/Results]
**Suggested Visual:** Performance metrics

Our BOM parser handles 99% of cases.

The 1% that fail? Usually malformed JSON from the AI.

We added retry logic with exponential backoff:
- Try 1: Parse immediately
- Try 2: Wait 100ms, retry
- Try 3: Wait 200ms, retry

Failure rate dropped to 0.1%.

---

## Day 10

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Real-time subscription code

We use Supabase real-time subscriptions.

When the AI updates an artifact, the UI updates instantly. No polling. No refresh button.

It's just Postgres LISTEN/NOTIFY under the hood.

But it feels like magic.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** Dark mode comparison

Added dark mode in 2 hours.

How? Tailwind's `dark:` prefix.

Every component already had light mode classes. Just added dark variants:
- `bg-white` → `dark:bg-gray-900`
- `text-black` → `dark:text-white`

Shipped. Users loved it.

---

## Day 11

### Post 1 (Morning) - [Category: Behind-the-Scenes]
**Suggested Visual:** API key rotation system

We rotate API keys automatically.

When one key hits quota:
1. Mark as failed
2. Switch to backup
3. Notify user with toast
4. Keep working

Users never see downtime.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** First BOM generation

First time our AI generated a real BOM, I cried.

Not because it was perfect. Because it was REAL.

Real part numbers. Real prices. Real suppliers.

You could actually buy these components and build the thing.

That's when I knew we had something.

---

## Day 12

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Parser code snippet

We parse 3 different artifact formats:
- XML tags: `<BOM_CONTAINER>...</BOM_CONTAINER>`
- Markdown blocks: ` ```json ... ``` `
- Plain JSON: `{"project_name": ...}`

Why? Because AI output is unpredictable.

Flexibility > rigidity.

---

### Post 2 (Evening) - [Category: Feature Deep-Dive]
**Suggested Visual:** Code drawer with file tree

Our code drawer shows a file tree.

Not a flat list. A tree:
```
src/
  main.cpp
  config.h
platformio.ini
README.md
```

Users can navigate like a real IDE.

---

## Day 13

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Response time graph

Streaming cut perceived latency by 80%.

Users see the first token in 200ms. Complete response in 3-5 seconds.

Before: Wait 5 seconds, see everything.
After: See tokens immediately, done in 5 seconds.

Same speed. Feels 4x faster.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Debugging session screenshot

Found a race condition at 1am.

Multiple code files being added simultaneously. Version numbers colliding.

The fix? Retry logic with exponential backoff.

Attempt 1: Immediate
Attempt 2: Wait 100ms
Attempt 3: Wait 200ms

Collisions dropped to zero.

---

## Day 14

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Tool executor architecture

Our tool executor is a router.

AI calls `update_bom()` → We:
1. Validate the data
2. Save to database
3. Create new version
4. Notify UI via real-time
5. Return success

It's the bridge between AI and database.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** User feedback compilation

Users don't read documentation.

They click buttons and expect things to work.

So we added:
- Tooltips everywhere
- Empty states with instructions
- Error messages with solutions
- Loading indicators

Show, don't tell.

---

## Day 15

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Context drawer with tree navigation

We built a context drawer with 3 sections:
- Project Context
- MVP Definition
- Product Requirements

Each section is collapsible. Markdown rendered. Tree navigation.

It's like Notion, but for hardware projects.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Milestone celebration

Hit 100 projects created today.

Not 100 users. 100 actual hardware projects.

People are building:
- Plant monitors
- Weather stations
- LED displays
- Home automation

This is real.

---

## Day 16

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Agent config code

Each agent has a temperature setting.

Orchestrator: 0.1 (need consistent routing)
BOM Generator: 0.2 (precision matters)
Conversational: 0.8 (creativity welcome)

Temperature isn't random. It's intentional.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Supabase dashboard

We use Supabase for everything:
- PostgreSQL database
- Real-time subscriptions
- Row-level security
- File storage

One service. Zero DevOps.

---

## Day 17

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Cost breakdown chart

Our AI costs per project:
- Orchestrator: $0.01
- Conversational: $0.15
- BOM Generator: $0.08
- Code Generator: $0.12
- Wiring: $0.05

Total: ~$0.41 per complete project.

Affordable. Scalable.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** Before/after of error handling

Added try-catch blocks everywhere.

Not because we expected errors. Because we KNEW they'd happen.

Now when something fails:
- Log the error
- Show user-friendly message
- Provide recovery action
- Continue working

Graceful degradation > crashes.

---

## Day 18

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Wiring diagram with SVG

We generate SVG schematics in real-time.

Not images. SVG. Which means:
- Infinite zoom
- Crisp on any screen
- Tiny file size
- Searchable text

It's just better.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Code review session

Code reviews take 2 hours minimum.

Not because we're slow. Because we care.

Every PR gets:
- Functionality check
- Performance review
- Security audit
- UX validation

Quality > speed.

---

## Day 19

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Message persistence flow

Every message is saved twice:
1. Optimistically (instant UI update)
2. Confirmed (database write)

If the database fails, we show an error. But the UI never freezes.

Optimistic updates = better UX.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Bug fix celebration

Fixed the "messages not saving" bug.

Took 6 hours. Added 50 lines of logging.

Found it: RLS policy blocking service role.

The fix? One line:
```sql
USING (true)
```

Sometimes the simplest bugs are the hardest.

---

## Day 20

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Budget optimizer in action

Our budget optimizer finds savings without sacrificing quality.

Example:
- Official ESP32: $12
- Generic clone: $6
- Tradeoff: "LOW - Same chip, different PCB"

We show the math. Users decide.

---

### Post 2 (Evening) - [Category: Data/Results]
**Suggested Visual:** User engagement metrics

Average session: 23 minutes.

Not because our app is slow. Because hardware projects take time.

Users are:
- Chatting with AI
- Reviewing BOMs
- Reading code
- Planning builds

This is deep work.

---

## Day 21

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Toast notification system

We built a toast notification system.

Not for fun. For transparency:
- "🤖 BOM Generator is handling this"
- "🔧 Agent called update_bom"
- "⚠️ API key exhausted, switching..."

Users always know what's happening.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Testing checklist

We test 3 scenarios for every feature:
1. Happy path (everything works)
2. Edge cases (weird inputs)
3. Failure modes (things break)

If it can fail, it will fail.

Be ready.

---

## Day 22

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** Mobile responsive design

Built for desktop first. Big mistake.

40% of users are on mobile.

Spent a weekend making everything responsive:
- Collapsible drawers
- Touch-friendly buttons
- Readable text sizes

Mobile isn't optional.

---

### Post 2 (Evening) - [Category: Feature Deep-Dive]
**Suggested Visual:** Agent dropdown selector

Users can manually select which agent to use.

Don't like auto-routing? Pick your own:
- Project Architect
- Component Specialist
- Software Engineer
- Circuit Designer

Control > automation.

---

## Day 23

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Streaming architecture diagram

Our streaming uses Server-Sent Events (SSE).

Not WebSockets. SSE is simpler:
- One-way (server → client)
- Auto-reconnect
- Works through proxies
- Native browser support

Perfect for AI responses.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** First paying customer

First paying customer today.

Not a big company. Just a maker who wanted to build a weather station.

Paid $19/month for premium features.

This is validation.

---

## Day 24

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Performance benchmarks

Our BOM generation:
- Average time: 8 seconds
- Token usage: 2,500 tokens
- Success rate: 99.2%
- Cost: $0.08

Fast. Reliable. Affordable.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Documentation writing session

Spent 4 hours writing documentation.

Not code. Documentation.

Because future me (and future teammates) will forget how this works.

Document everything.

---

## Day 25

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Inline code display

Code now displays inline in chat.

Not in a separate drawer. Right there:
- File name
- Language
- Line count
- Copy button

Convenience > clicks.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** Accessibility audit results

Ran an accessibility audit. Failed 12 checks.

Fixed:
- Missing alt text
- Low contrast colors
- No keyboard navigation
- Missing ARIA labels

Accessibility isn't optional.

---

## Day 26

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Database migration script

We version our database schema.

Every change is a migration:
```sql
-- Migration: add_agent_id_to_messages.sql
ALTER TABLE messages ADD COLUMN agent_id TEXT;
```

Rollback-able. Auditable. Safe.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Team collaboration tools

We use:
- GitHub for code
- Linear for tasks
- Notion for docs
- Discord for chat

Simple stack. No complexity.

---

## Day 27

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** User retention graph

Week 1 retention: 68%

Not amazing. But honest.

We're learning:
- What keeps users coming back
- What frustrates them
- What features matter

Iterate. Improve.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Feature request board

Users want:
- Circuit simulation
- 3D PCB preview
- Component alternatives
- Price tracking

We're listening. Building.

---

## Day 28

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Project initializer flow

First message gets special treatment.

We use a different agent (Project Initializer) that:
- Asks clarifying questions
- Suggests approaches
- Sets project direction

First impressions matter.

---

### Post 2 (Evening) - [Category: Technical Deep-Dive]
**Suggested Visual:** Error boundary implementation

We wrapped everything in error boundaries.

If a component crashes, the app doesn't.

Users see: "Something went wrong. Refresh to continue."

Not: White screen of death.

---

## Day 29

### Post 1 (Morning) - [Category: Behind-the-Scenes]
**Suggested Visual:** Code refactoring session

Refactored the orchestrator today.

Not because it was broken. Because it was messy.

Clean code > clever code.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** User onboarding flow

Added a tour guide for new users.

Highlights:
- Where to type
- How to use drawers
- What each agent does

Onboarding = retention.

---

## Day 30

### Post 1 (Morning) - [Category: Founder Journey]
**Suggested Visual:** 30-day milestone graphic

30 days of building in public.

What we shipped:
- 10 AI agents
- 6 drawer types
- Real-time updates
- Streaming responses
- Cost optimization
- Mobile support

This is just the beginning.

---

### Post 2 (Evening) - [Category: Data/Results]
**Suggested Visual:** Month 1 metrics dashboard

Month 1 by the numbers:
- 247 projects created
- 1,842 messages sent
- 156 BOMs generated
- 89 code files created
- 67% cost reduction
- 99.2% uptime

Building. Learning. Growing.
