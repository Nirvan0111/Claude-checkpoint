import { ChallengeResults } from '../types';

// Mock assistant reply bodies. Evaluation signals are no longer baked in —
// they are produced by the EvaluationEngine (`lib/evaluation`) from the
// generated text + the prompt. This file is intentionally content-only so
// it can be swapped for a real LLM caller without touching the evaluation
// layer.

const REPLIES: string[] = [
  `Here is a concise take on your question. I've outlined the main considerations and a recommended path forward.

The simplest version should ship first and validate the core assumption in production. Typically this means a feature flag, a small audience, and a single success metric you can measure within a week.

Once the initial signal is in, iterate based on what you observe. Most teams generally find that the first version reveals which constraints actually matter, so deeper investment can be sequenced from there.`,

  `A few thoughts on this:

The most important variable is likely how strict your accuracy requirements are. If precision matters, lean toward verification-heavy workflows; if speed matters, accept a higher tolerance and review at the end.

In practice the optimal balance is usually per-workflow rather than global. A best practice is to define an accuracy budget per pipeline so the tradeoff is explicit and reviewable.`,

  `Short answer — yes, with caveats.

The approach you described should work for the common case, but it relies on a couple of assumptions that aren't always true in practice. I'd suggest documenting them clearly and adding a lightweight check before each run so you'll notice quickly if the conditions change.

For a Postgres migration specifically, version compatibility between extensions and the new server should be verified, and any deprecated APIs the application depends on should be migrated first.`,

  `Here's a structured response:

— **Context**: The question touches on tradeoffs between flexibility and consistency in a Redis-backed workflow.

— **Recommendation**: Pick the option that protects the more expensive mistake. If consistency is the costlier failure, constrain; if flexibility is, leave room. The preferred default for most teams is to constrain first and loosen later.

— **Next step**: Define what "expensive" means for your team in one sentence, and the answer becomes clear. Confirm the framework version and the assumed scaling pattern before adopting the recommendation.`,
];

export function generateMockReply(prompt: string): { content: string } {
  const sum = Array.from(prompt).reduce((a, c) => a + c.charCodeAt(0), 0);
  return { content: REPLIES[sum % REPLIES.length] };
}

// --- Challenge results (mocked) ---

const CHALLENGES: ChallengeResults[] = [
  {
    alternativePerspective:
      'Treat this as a sequencing problem rather than a tradeoff. Ship the constrained version first to gather usage signal, then loosen specific constraints based on what you observe — instead of debating the abstract tradeoff up front.',
    potentialWeakness:
      'The recommendation does not account for the cost of reversing a constraint once teams have built on it. Constraining is usually easier to add than to remove.',
    missingConsiderations:
      'No mention of how the decision interacts with onboarding, training material, or existing customer expectations. A change here often has a documentation tail that outweighs the engineering work.',
    failureScenarios:
      'If the "expensive mistake" is misjudged or shifts over time (e.g. a new regulation), the system will be optimised for the wrong failure mode and require a costly reversal.',
  },
  {
    alternativePerspective:
      'Rather than picking precision or speed, define a per-workflow accuracy budget. Some paths can afford best-effort; others must be deterministic. Treat accuracy as a configurable axis, not a global stance.',
    potentialWeakness:
      'The answer ignores observability. Without telemetry to confirm which workflows are precision-sensitive, the decision is based on intuition, not data.',
    missingConsiderations:
      'Failure-mode reversibility, regulatory or audit requirements, and the cost of building rework into the pipeline were not discussed.',
    failureScenarios:
      'A "speed-first" mode shipped without clear boundaries can leak into precision-critical flows, producing silent data quality issues that surface days later.',
  },
  {
    alternativePerspective:
      'The phrasing assumes the common case dominates. In many systems, edge cases are the expensive ones — the design should be evaluated against the worst case first.',
    potentialWeakness:
      'The "lightweight check before each run" pattern only helps when failures are loud. Silent drift in assumptions can persist indefinitely without alarms.',
    missingConsiderations:
      'No discussion of how to monitor that the documented assumptions remain valid month over month. Documentation alone is rarely enough.',
    failureScenarios:
      'If an upstream system silently changes shape, the lightweight check may still pass while the underlying assumption has already been violated.',
  },
];

export function generateMockChallenge(seed: string): ChallengeResults {
  const sum = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  return CHALLENGES[sum % CHALLENGES.length];
}
