# Claude Checkpoint — Case Study Screenshot Index

All screenshots: **1920 × 1200 px, lossless PNG, desktop preview.**
Captured against the live preview build with realistic PM / coding / research
prompts. Drop them straight into the case study deck in the order below.

| # | File | What it shows |
|---|------|---------------|
| 1 | `01-home-with-plus-menu.png` | **Home Screen.** User has typed a real Postgres migration prompt. The `+` action menu is open, with **Claude Checkpoint** as the primary card and supporting placeholders (Attach files, Add image, Style preset). Status pill reads "Checkpoint inactive". |
| 2 | `02-checkpoint-activation.png` | **Checkpoint Activation.** Side panel has slid in; the body shows the brief **"Preparing review session…"** state with the three-dot indicator. Status pill flips to "Checkpoint active". |
| 3 | `03-review-overview.png` | **Review Overview.** Panel content loaded — header, **Review Summary** card with the dynamic **N findings** badge, Original Prompt block, Generated Output block. |
| 4 | `04-execution-review-timeline.png` | **Execution Review — Activity Timeline expanded.** Execution Summary KPIs (`3 files changed · 1 file created · 9 tests passed · 0 protected files modified`) above the full **8 of 8 events** timeline with color-coded left borders per action kind (Read / Analyzed / Modified / Created). |
| 5 | `05-file-explorer-diff.png` | **File Explorer + Diff Viewer.** Modified / Created file rows with additions/deletions counts, followed by the inline diff with `+` / `−` lines and the human-readable **"What changed?"** bullets. |
| 6 | `06-protected-files.png` | **Protected Files.** Both states visible — `etl.py` shown as **Locked** ("cannot be modified during this review session"), `schema.py` flipped to **Editable**. Each row carries an explicit Locked / Editable button. |
| 7 | `07-evaluation-layer-inline-pills.png` | **Evaluation Layer (inline annotations).** Assistant output with **Needs Verification**, **Context Required**, and **Assumption** pills anchored directly under the paragraphs they refer to — no separate signal list needed. |
| 8 | `08-tooltip-hover.png` | **Tooltip interaction.** Hovering the Assumption pill reveals a lightweight Claude-style tooltip with title, the "Triggered by hedging or recommendation-oriented language in this section." reason, and a `"preferred"` trigger chip. |
| 9 | `09-challenge-results.png` | **Challenge This Output.** First click on the action generates the alternative review — four dark-on-light blocks (**Alternative perspective**, **Potential weakness**, **Missing considerations**, **Failure scenarios**) with realistic mock content. |
| 10 | `10-decision-approved.png` | **Final decision — Approved.** Approve toast, panel closed, inline **"Approved via Checkpoint · HH:MM PM"** badge directly under the message. |
| 11 | `11-decision-rejected.png` | **Final decision — Rejected.** Warn toast ("Rejected — output discarded."), inline **"Rejected via Checkpoint · HH:MM PM"** badge under the message. |
| 12 | `12-decision-rollback.png` | **Rollback state.** Info toast ("Changes rolled back."), inline **"Rolled back via Checkpoint · HH:MM PM"** badge under the message. |

---

### Quick presentation order (for case-study deck)

> Screenshot 1 → Home Screen
> Screenshot 2 → Checkpoint Activation
> Screenshot 3 → Review Overview
> Screenshot 4 → Execution Review (timeline)
> Screenshot 5 → File Explorer + Diff
> Screenshot 6 → Protected Files
> Screenshot 7 → Evaluation Layer (inline annotations)
> Screenshot 8 → Tooltip interaction
> Screenshot 9 → Challenge This Output
> Screenshot 10 → Final state — Approved
> Screenshot 11 → Final state — Rejected
> Screenshot 12 → Rollback

### Reproduce locally

```bash
# from repo root, with frontend running at the preview URL
/opt/plugins-venv/bin/python /app/case_study/capture_screenshots.py
```

The script is deterministic: same suggestion → same mock reply → same engine
output → identical screenshots run-to-run.

### Prompts used (realistic, no lorem ipsum)

| Used in | Prompt |
|---------|--------|
| 1, 2–6, 9, 12 | *"Outline a careful migration plan from Postgres 14 to Postgres 16."* (coding / infra) |
| 7, 8, 10 | *"Draft a clear summary of last week's product changes for our stakeholders."* (PM) and Postgres migration (engineering) |
| 11 | *"Compare two pricing strategies for a small SaaS team launching in Q2."* (research / strategy) |
