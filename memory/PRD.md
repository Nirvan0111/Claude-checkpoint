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

### Phase 3 — Evaluation Layer MVP — 2026-05-27
- New `frontend/src/lib/evaluation/` module (pure logic, no UI):
  - `EvaluationEngine.ts` — public `evaluate({prompt, output}): Signal[]`. Pure, deterministic, replaceable later by a real Claude-graded evaluator with identical signature.
  - `AssumptionDetector.ts` — hedging language (should, likely, typically, generally, comfortably, without downtime, assume) + recommendation language (recommended, best practice, ideal, optimal, preferred, commonly used).
  - `ContextDetector.ts` — 7 dimensions checked against the prompt for absence (traffic volume, budget, deployment env, audience, timeline, requirements/constraints, team size). Signals anchored to the matching output paragraph; last-paragraph fallback when no anchor.
  - `VerificationDetector.ts` — technical claim markers (API, version numbers, framework/library names, compatibility, migration, deprecation, operational claims).
  - `AnnotationMapper.ts` — Detection → Signal mapping with merged-`matches`-to-detail-string composition.
  - `ReviewSummaryGenerator.ts` — pure `summarize(signals)` counts function (UI summary component unchanged).
  - `types.ts` + `index.ts` — internal types and public exports.
- Dedup rule: at most 1 signal per (kind, paragraph); multiple regex matches in the same detector merge into one signal with combined detail.
- Density caps: max 1 Assumption + 1 Context Required + 1 Needs Verification per paragraph; total ≤ 5 per output.
- Priority order when culling: Context Required → Needs Verification → Assumption.
- `data/mockData.ts` simplified — `generateMockReply` returns only `{ content }`; hardcoded per-reply signal arrays removed. `generateMockChallenge` untouched.
- `state/useConversation.ts` — calls `evaluate({prompt, output})` after generating mock reply text; engine is the sole source of signals.
- ZERO changes to UI components, ReviewSummary layout (4-row layout including "no supporting sources" zero-state preserved by design), Execution Review, Challenge flow, sticky ActionBar, or backend.

### Testing — Iteration 4
- Backend: 11/11 pytest pass.
- Frontend build: 84.23 kB main.js gzipped, zero TS errors, zero ESLint failures.
- Phase 3 assertions (20/20): all three Phase 3 signal kinds produced; total signals ≤ 5; dedup per (kind, paragraph) enforced; priority order (context → verification → assumption) verified in panel; dynamic ReviewSummary counts match panel detail counts; "no supporting sources" zero-state preserved; recommendation language correctly triggers Assumption signals; inline annotations render under correct paragraphs via paragraphIndex.
- Phase 1+2 regression: Approve / Challenge two-step / Rollback all confirmed working; sticky footer + ESC close work; backend POST /api/reviews succeeds for all four decisions.

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
1. Swap deterministic `lib/evaluation` engine for a real Claude-graded evaluator (same `Signal[]` signature, no UI changes needed).
2. Address carryover non-blocking warning: `<li>` inside `<li>` in `components/execution/ActivityTimeline.tsx` (change outer wrapper to `<div>`).
3. Optionally tighten `VerificationDetector` version regex to avoid false positives on bare numbers in noisy LLM output.
4. Decide whether to add a 'Decisions' tab/section powered by `/api/reviews`.
5. Surface per-file expand/collapse memory across panel opens.
