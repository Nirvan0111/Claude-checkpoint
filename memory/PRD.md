# Claude Checkpoint — PRD

## Original Problem Statement
Build a web application called Claude Checkpoint that helps users review and evaluate AI-generated outputs before accepting or acting on them. Multi-phase build:
- **Phase 1 (Foundation MVP)** — Claude-style conversation with a Checkpoint side panel showing original prompt, generated output, evaluation signals (Assumption / Additional Context Required / Needs Verification / Source Available) and Approve / Reject / Challenge actions.
- **Phase 1 Refinements** — Remove dev labels, add status pill, hero secondary line, "+" menu best-for line, refined footer copy, subtle Claude-style hovers, brief "Preparing review session…" activation transition.
- **Phase 2 (Execution Review)** — Add an Execution Review section inside Checkpoint that shows what Claude did before approval: summary row, expandable activity timeline, file explorer with status pills, diff viewer with human-readable change summary, protected files panel with toggle controls, and a Rollback Changes action.

Constraints throughout: Claude-inspired calm, paper-like aesthetic; no enterprise dashboards, no AI scoring / confidence percentages, no GitHub-style diff styling, no excessive animation.

## User Personas
- **Knowledge worker / operator** who relies on AI outputs for high-stakes decisions and wants a calm gate to check assumptions, missing context, and verification needs before acting.
- **Developer reviewing Claude's code changes** who needs visibility into reads, writes, created files, diffs, and protected-file boundaries before approving — with a rollback option.
- **Design / product reviewer** evaluating Claude-like UX patterns who needs a faithful, polished reference implementation.

## Core Requirements (Static)
- Claude-style conversation UI with "+" action menu including Claude Checkpoint (primary), other placeholders
- Side-panel review experience with Original Prompt, Generated Output, Evaluation Signals (pills), Approve / Reject / Challenge
- Phase 2: Execution Review BEFORE Evaluation Signals — Execution Summary, Activity Timeline (expandable), File Explorer, Diff Viewer with "What changed?" summary, Protected Files panel, Rollback Changes button
- Reusable components per spec: ConversationMessage, SignalPill, ReviewPanel, ActionBar, plus ExecutionSummary, ActivityTimeline, TimelineItem, FileExplorer, FileRow, DiffViewer, DiffSection, ChangeSummary, ProtectedFilesPanel, RollbackButton, ExecutionReviewPanel
- Separated layers: UI / Review Logic / State
- Mock data only; no AI scoring or confidence percentages
- React + TypeScript

## User Choices (across sessions)
- Stack: React + TypeScript ✓
- Mock scope: Welcome state then mock assistant reply when user sends ✓
- Checkpoint presentation: Side panel (right) ✓
- Backend: Minimal FastAPI to persist review decisions ✓
- Action feedback: Both toast and inline decision badge ✓

## What's Been Implemented

### Phase 1 — 2026-05-27
- Backend (FastAPI + Motor + MongoDB):
  - `GET /api/health`
  - `POST /api/reviews`, `GET /api/reviews?conversation_id=`, `GET /api/reviews/{id}` (404/400 handled)
  - BaseDocument with PyObjectId; responses return `id` (not `_id`)
- Frontend (React + TypeScript + Tailwind):
  - Paper-like theme (Spectral serif + Figtree sans), soft neutrals per design guidelines
  - Welcome state with three suggestion prompts
  - Chat input with "+" action menu, armed-checkpoint banner, inline checkpoint trigger on assistant messages
  - Mock assistant replies (~900 ms typing delay) with deterministic signal generation
  - Side panel: prompt, output, signal pills + detail bullets, Approve / Challenge (two-step note) / Reject, ESC + backdrop close
  - Toast + inline DecisionBadge
  - All interactive elements carry `data-testid` (kebab-case)

### Phase 1 Refinements + Phase 2 Execution Review — 2026-05-27
- Header: removed "Phase 1 · Foundation" subtitle; replaced session id with a status pill (`Checkpoint inactive` / `Checkpoint active`) tied to armed + open states
- Welcome state: added secondary line "Checkpoint adds a review step before outputs are accepted or applied."
- "+" menu Checkpoint card: added supporting text "Best for coding, research and planning tasks."
- Footer text: "For important outputs, use Checkpoint to review assumptions and verification needs."
- Activation transition: 650ms "Preparing review session…" state on panel open
- Subtle hover refinements (duration-200) on suggestions and menu items
- New types: ExecutionData / TimelineEvent / FileChange / DiffHunk / DiffLine / ProtectedFile / ExecutionSummaryData; DecisionType extends with `rolled_back`
- New mock data: three deterministic scenarios (auth refactor, data pipeline, API endpoint) selected by prompt char-sum, with realistic file changes, hunks, timeline events, and protected files
- New components (under `/components/execution/`):
  - ExecutionSummary (inline KPI row)
  - ActivityTimeline + TimelineItem (compact-by-default with expand/collapse)
  - FileExplorer + FileRow (status pills, additions/deletions counts, locks files visually)
  - DiffViewer + DiffSection + ChangeSummary (added/removed/modified line highlights, "What changed?" bullets)
  - ProtectedFilesPanel (Claude-style toggle switches; visually locked state)
  - RollbackButton (also wired into ActionBar)
  - ExecutionReviewPanel (orchestrator with collapsible sections)
- ActionBar: added Rollback in a 2-column row with Reject; supports `rolled_back` decision
- Backend: DecisionType literal now accepts `rolled_back`; review persistence covers all four decisions

### Testing
- Iteration 1: Backend 10/10, full E2E green (after fixing `_id` → `id` response leak)
- Iteration 2: Backend 11/11 (adds `rolled_back` test), full E2E green on all new Phase 1 refinements and Phase 2 Execution Review surfaces

## Prioritized Backlog

### P1
- Real LLM assistant replies (Claude via Anthropic API) behind a flag
- Real evaluation signals (LLM-graded) replacing the deterministic mock
- Real execution payloads from a runner that emits the same `ExecutionData` shape so the panel becomes live
- Persisted conversation history (load past sessions by `conversation_id`)
- Per-message edit / regenerate

### P2
- Decisions timeline view fed from `/api/reviews`
- Multi-conversation sidebar (lightweight)
- Cmd+K to open Checkpoint on last reply; arrow-key file navigation in explorer
- Export approved outputs / diffs (markdown / patch file)
- Auth (deferred — not in scope yet)

## Next Tasks
1. Decide Phase 3 scope: live execution payloads vs. real LLM responses vs. decisions analytics
2. Optionally add a 'Decisions' tab/section powered by `/api/reviews`
3. Surface per-file expand/collapse memory across panel opens
