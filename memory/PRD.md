# Claude Checkpoint — PRD

## Original Problem Statement
Build a web application called Claude Checkpoint that helps users review and evaluate AI-generated outputs before accepting or acting on them. This is Phase 1 (Foundation MVP). Focus on clean, production-ready frontend architecture and UX. The interface should closely follow Anthropic Claude's design philosophy: clean, minimal, conversation-first, large whitespace, soft neutral palette, subtle borders, rounded corners, low visual noise. Avoid enterprise dashboards, gaming UI, futuristic effects, excessive animations.

## User Personas
- **Knowledge worker / operator** who relies on AI outputs for high-stakes decisions and wants a calm gate to check assumptions, missing context, and verification needs before acting.
- **Design / product reviewer** evaluating Claude-like UX patterns who needs a faithful, polished reference implementation.

## Core Requirements (Static)
- Claude-style conversation UI (user + assistant messages, prompt input, "+" action menu)
- "+" menu must include "Claude Checkpoint" with the spec description; other items can be placeholders
- Checkpoint review (Side Panel per user choice) must show: Original Prompt, Generated Output, Evaluation Signals (Assumption / Additional Context Required / Needs Verification / Source Available) as pills, and Review Actions (Approve / Reject / Challenge Answer)
- Pills must be visually lightweight and non-intrusive; action buttons clear but not dominant
- Reusable components: ConversationMessage, SignalPill, ReviewPanel, ActionBar, CheckpointModal (implemented as side panel)
- Separated layers: UI / Review Logic / State
- Mock data for now — no AI evaluation
- Architecture: React + TypeScript

## User Choices (this session)
- Stack: React + TypeScript ✓
- Mock scope: Welcome state, then mock assistant reply when user sends ✓
- Checkpoint presentation: Side panel (right) ✓
- Backend: Minimal FastAPI to persist review decisions ✓
- Action feedback: Both toast and inline decision badge ✓

## What's Been Implemented (2026-05-27)
- Backend (FastAPI + MongoDB / Motor):
  - `GET /api/health`
  - `POST /api/reviews` — persists a checkpoint decision (approved / rejected / challenged) with prompt, output, signals, optional note
  - `GET /api/reviews?conversation_id=` — list decisions (sorted by created_at desc)
  - `GET /api/reviews/{id}` — single decision (404/400 handled)
  - BaseDocument with PyObjectId; responses return `id` (not `_id`)
- Frontend (React + TypeScript + Tailwind):
  - Calm paper-like theme (Spectral serif + Figtree sans), soft neutral palette per design guidelines
  - Welcome state with three suggestion prompts
  - Chat input with auto-resizing textarea, send button, and "+" action menu (Claude Checkpoint primary; Attach / Image / Style as placeholders)
  - "Arm Checkpoint" flow: selecting the menu item shows a banner and auto-opens the side panel after the next assistant reply
  - Inline `Review with Checkpoint` trigger on every assistant message
  - Mock assistant replies (~900 ms typing delay) with deterministic signal generation
  - Side panel: Original prompt, generated output, evaluation pills + detail bullets, Approve / Challenge (two-step note) / Reject
  - Toast (top-of-flow feedback) + inline DecisionBadge under the message
  - All interactive elements carry `data-testid` (kebab-case)
- Testing: Backend 10/10 pytest; Frontend full E2E (welcome, mock reply, action menu, armed checkpoint, side panel sections, approve/reject/challenge two-step, ESC/close, inline triggers, decision badges, toasts, backend persistence)

## Prioritized Backlog

### P0 (next session candidates)
- None blocking — Phase 1 MVP complete.

### P1
- Wire real LLM (e.g., Claude via Anthropic API) for assistant replies behind a feature flag
- Wire real evaluation signals (LLM-graded) replacing the deterministic mock
- Persisted conversation history (load past sessions by `conversation_id`)
- Per-message edit / regenerate

### P2
- Multi-conversation sidebar (kept lightweight — not enterprise)
- Export approved outputs (markdown / clipboard)
- Keyboard shortcuts (Cmd+K to open Checkpoint on last assistant message)
- Auth (deferred — explicitly not in Phase 1)

## Next Tasks
1. Decide whether to swap mock signals for an LLM-graded evaluation in Phase 2
2. Add a "Decisions" timeline view fed from `/api/reviews`
3. Optional: surface review-rate analytics for the user's own session
