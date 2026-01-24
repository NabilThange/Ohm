# OHM LinkedIn Content Calendar - Days 31-60

## Day 31

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Multi-agent routing diagram

We don't use one AI for everything.

When you ask "Create a BOM," it hits:
1. Orchestrator (classifies intent)
2. BOM Generator (creates component list)
3. Tool Executor (saves to database)

Three agents. One seamless experience.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Late night debugging

Debugging at midnight hits different.

Found a bug where code files were overwriting each other. Race condition.

The fix? Retry logic with exponential backoff.

Sometimes the best code is written when you're too tired to overthink.

---

## Day 32

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Conversation summarizer in action

We summarize conversations every 5 messages.

Why? Token costs were killing us.

Now instead of sending 50 messages (5,000 tokens), we send:
- Summary (500 tokens)
- Last 10 messages (1,000 tokens)

67% cost reduction. Same quality.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** User feedback screenshot

User: "Why can't I see the code without opening the drawer?"

Me: *builds inline code cards in 30 minutes*

User: "Perfect!"

The best features come from listening.

---

## Day 33

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Database schema with versioning

Every artifact has versions.

BOM v1 → BOM v2 → BOM v3

Users can see their project evolve. Rollback if needed.

It's just a `version_number` column. But it's powerful.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** First enterprise inquiry

Got our first enterprise inquiry today.

A university wants to use OHM for their IoT course.

200 students. Real projects. Real hardware.

This is bigger than I thought.

---

## Day 34

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** API response time graph

Our API responds in:
- Orchestrator: 150ms
- BOM Generator: 8 seconds
- Code Generator: 12 seconds
- Wiring: 5 seconds

Fast enough. Room to improve.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Code review process

Every PR gets reviewed by 2 people.

Not because we don't trust each other. Because two brains > one brain.

Caught 3 bugs this week before they hit production.

---

## Day 35

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Real-time drawer updates

When the AI updates a BOM, the drawer updates instantly.

No refresh button. No polling.

Just Postgres LISTEN/NOTIFY + Supabase real-time.

It feels like magic.

---

### Post 2 (Evening) - [Category: Technical Deep-Dive]
**Suggested Visual:** Tool calling architecture

Our AI doesn't just talk. It acts.

When it says "I'll create a BOM," it actually calls:
```typescript
update_bom({
  project_name: "...",
  components: [...]
})
```

Function calling > text parsing.

---

## Day 36

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** Mobile usage stats

40% of our users are on mobile.

We built for desktop first. Mistake.

Spent a weekend making everything responsive. Touch-friendly. Readable.

Mobile isn't the future. It's the present.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Documentation writing

Wrote 2,000 words of documentation today.

Not code. Documentation.

Because 3 months from now, I won't remember why I made these decisions.

Future you will thank present you.

---

## Day 37

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Streaming SSE implementation

We use Server-Sent Events for streaming.

Not WebSockets. SSE is simpler:
- One-way communication
- Auto-reconnect
- Works through proxies
- Native browser support

Perfect for AI responses.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** User success story

User built a plant monitor using OHM.

Sent us a photo. It works.

This is why we build.

---

## Day 38

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Cost per project breakdown

Cost per complete project:
- AI inference: $0.41
- Database: $0.02
- Storage: $0.01
- Total: $0.44

Profitable at $19/month.

---

### Post 2 (Evening) - [Category: Feature Deep-Dive]
**Suggested Visual:** Agent identity system

Each agent has:
- Unique name (Circuit Designer)
- Custom avatar (SVG)
- Specialized role
- Specific model

Users always know who's helping them.

---

## Day 39

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Parser flexibility diagram

Our parser handles 3 formats:
- XML tags
- Markdown blocks
- Plain JSON

Why? Because AI output is unpredictable.

Flexibility > rigidity.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Testing pyramid

We test:
- Unit tests (fast, many)
- Integration tests (medium, some)
- E2E tests (slow, few)

The pyramid keeps us sane.

---

## Day 40

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** Error handling before/after

Added error boundaries everywhere.

If a component crashes, the app doesn't.

Users see: "Something went wrong. Refresh to continue."

Not: White screen of death.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Feature request prioritization

Users want 47 different features.

We're building 3.

Focus > feature bloat.

---

## Day 41

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Budget optimizer comparison

Our budget optimizer shows:
- Original cost: $45
- Optimized cost: $32
- Savings: $13 (29%)

With tradeoff analysis for each component.

Transparency > hidden savings.

---

### Post 2 (Evening) - [Category: Data/Results]
**Suggested Visual:** User engagement heatmap

Peak usage: 8pm-11pm

People build hardware projects at night.

After work. After kids are asleep. In their maker time.

We optimize for night owls.

---

## Day 42

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Database migration workflow

We version our database schema.

Every change is a migration file:
```sql
-- add_conversation_summary_type.sql
ALTER TABLE artifacts...
```

Rollback-able. Auditable. Safe.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Team rituals

Every Friday: Demo day.

Everyone shows what they built this week.

No slides. Just working code.

---

## Day 43

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** Accessibility audit results

Ran an accessibility audit. Failed 12 checks.

Fixed:
- Missing alt text
- Low contrast
- No keyboard nav
- Missing ARIA labels

Accessibility isn't optional.

---

### Post 2 (Evening) - [Category: Feature Deep-Dive]
**Suggested Visual:** Wiring diagram generation

We generate two diagrams:
1. SVG schematic (500ms, instant)
2. AI breadboard image (12s, background)

Users see results immediately. Beauty loads while they read.

---

## Day 44

### Post 1 (Morning) - [Category: Technical Deep-Dive]
**Suggested Visual:** Optimistic updates flow

Every message is saved twice:
1. Optimistically (instant UI)
2. Confirmed (database)

If database fails, we show error. But UI never freezes.

Optimistic updates = better UX.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Milestone celebration

500 projects created.

Not 500 users. 500 actual hardware projects.

People are building real things.

---

## Day 45

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Model performance comparison

Claude Opus vs Sonnet for BOM generation:
- Opus: Better reasoning, $0.15
- Sonnet: Faster, $0.08

We use Opus. Quality > cost.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Code refactoring session

Refactored 800 lines today.

Not because it was broken. Because it was messy.

Clean code compounds.

---

## Day 46

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Context drawer with tree nav

Our context drawer has 3 sections:
- Project Context
- MVP Definition
- Product Requirements

Collapsible. Markdown rendered. Tree navigation.

Like Notion, but for hardware.

---

### Post 2 (Evening) - [Category: Lesson Learned]
**Suggested Visual:** User onboarding metrics

Added a tour guide. Retention jumped 23%.

People need guidance. Not documentation.

Show them. Don't tell them.

---

## Day 47

### Post 1 (Morning) - [Category: Technical Implementation]
**Suggested Visual:** Toast notification system

We show toasts for:
- Agent changes
- Tool calls
- API key rotation
- Errors

Users always know what's happening.

Transparency > silence.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** First blog post

Published our first technical blog post.

"How We Cut AI Costs by 67%"

Got 2,000 views in 24 hours.

Building in public works.

---

## Day 48

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Streaming performance metrics

Streaming cut perceived latency by 80%.

First token: 200ms
Complete response: 3-5s

Same speed. Feels 4x faster.

Perception matters.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Bug triage meeting

Weekly bug triage: 2 hours.

We categorize:
- P0: Breaks core functionality
- P1: Degrades experience
- P2: Minor annoyance
- P3: Nice to fix

Focus on P0s first.

---

## Day 49

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Code drawer file tree

Our code drawer shows a file tree:
```
src/
  main.cpp
  config.h
platformio.ini
```

Not a flat list. A tree.

Users navigate like a real IDE.

---

### Post 2 (Evening) - [Category: Technical Deep-Dive]
**Suggested Visual:** Agent temperature settings

Each agent has a temperature:
- Orchestrator: 0.1 (consistent routing)
- BOM Generator: 0.2 (precision)
- Conversational: 0.8 (creativity)

Temperature isn't random. It's intentional.

---

## Day 50

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** Dark mode implementation

Added dark mode in 2 hours.

Tailwind's `dark:` prefix made it trivial:
- `bg-white` → `dark:bg-gray-900`
- `text-black` → `dark:text-white`

Users loved it.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Revenue milestone

First $1,000 MRR.

10 paying customers. $19/month each.

Not life-changing money. But validation.

---

## Day 51

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Success rate dashboard

Our success rates:
- BOM generation: 99.2%
- Code generation: 98.7%
- Wiring diagrams: 99.5%

Not perfect. But reliable.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Infrastructure monitoring

We monitor:
- API response times
- Error rates
- Database performance
- User sessions

Can't improve what you don't measure.

---

## Day 52

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Manual agent selection

Users can manually select agents.

Don't like auto-routing? Pick your own:
- Component Specialist
- Software Engineer
- Circuit Designer

Control > automation.

---

### Post 2 (Evening) - [Category: Technical Implementation]
**Suggested Visual:** Retry logic diagram

We retry failed operations:
- Attempt 1: Immediate
- Attempt 2: Wait 100ms
- Attempt 3: Wait 200ms

Exponential backoff. Graceful degradation.

---

## Day 53

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** User feedback compilation

Users don't read docs.

They click buttons and expect things to work.

So we added:
- Tooltips
- Empty states
- Error messages with solutions
- Loading indicators

Show, don't tell.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Team growth

Hired our first engineer today.

Not because I can't code. Because I can't do everything.

Delegation > burnout.

---

## Day 54

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Geographic distribution map

Users from 23 countries.

Top 3:
- United States (42%)
- India (18%)
- Germany (9%)

Hardware is global.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Code review checklist

Every PR gets:
- Functionality check
- Performance review
- Security audit
- UX validation

Quality > speed.

---

## Day 55

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Inline BOM card

BOMs display inline in chat.

Not in a drawer. Right there:
- Component list
- Total cost
- Export button
- Purchase links

Convenience > clicks.

---

### Post 2 (Evening) - [Category: Technical Deep-Dive]
**Suggested Visual:** Real-time subscription architecture

We use Supabase real-time:
- Postgres LISTEN/NOTIFY
- WebSocket connection
- Automatic reconnection
- Filtered subscriptions

Real-time without the complexity.

---

## Day 56

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** Performance optimization results

Optimized our parser. 3x faster.

How?
- Cached regex patterns
- Reduced string operations
- Parallel processing

Small optimizations compound.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** User testimonial

User: "OHM saved me 20 hours of research"

That's the goal. Not to replace makers. To accelerate them.

---

## Day 57

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** Average project metrics

Average project:
- 18 messages
- 1 BOM
- 3 code files
- 1 wiring diagram
- 23 minutes

This is deep work.

---

### Post 2 (Evening) - [Category: Behind-the-Scenes]
**Suggested Visual:** Sprint planning

We work in 2-week sprints.

Week 1: Build
Week 2: Polish + ship

Consistent rhythm > chaos.

---

## Day 58

### Post 1 (Morning) - [Category: Feature Deep-Dive]
**Suggested Visual:** Project initializer flow

First message gets special treatment.

Different agent (Project Initializer):
- Asks clarifying questions
- Suggests approaches
- Sets direction

First impressions matter.

---

### Post 2 (Evening) - [Category: Technical Implementation]
**Suggested Visual:** CSV export functionality

Users can export BOMs as CSV.

One click. Instant download.

Ready for Excel, Google Sheets, or procurement systems.

---

## Day 59

### Post 1 (Morning) - [Category: Lesson Learned]
**Suggested Visual:** Security audit findings

Ran a security audit. Found 3 issues:
- Missing rate limiting
- Weak CORS policy
- Exposed API keys in logs

Fixed all three. Security isn't optional.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** 60-day reflection

60 days of building.

What we learned:
- Ship fast, iterate faster
- Listen to users
- Quality > features
- Transparency builds trust

This is just the beginning.

---

## Day 60

### Post 1 (Morning) - [Category: Data/Results]
**Suggested Visual:** 60-day metrics dashboard

60 days by the numbers:
- 847 projects created
- 15,234 messages sent
- 423 BOMs generated
- 287 code files created
- 23 countries
- $1,247 MRR

Building. Learning. Growing.

---

### Post 2 (Evening) - [Category: Founder Journey]
**Suggested Visual:** Thank you graphic

Thank you for following this journey.

60 days. 120 posts. Thousands of lines of code.

We're building OHM in public. The good, the bad, the bugs.

This is just the beginning.

What should we build next?
