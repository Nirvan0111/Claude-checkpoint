import { ChallengeResults, Signal } from '../types';

// Each mock reply now carries its own contextual signal set, anchored to
// specific paragraphs so the UI can render pills inline alongside the
// statements they refer to.

interface MockReply {
  content: string;
  signals: Signal[];
}

const REPLIES: MockReply[] = [
  {
    content: `Here is a concise take on your question. I've outlined the main considerations and a recommended path forward.

1. Start with the simplest version that produces a measurable result.
2. Validate the assumptions in your environment before expanding scope.
3. Iterate based on the signals you collect.

Let me know if you'd like a deeper breakdown of any step.`,
    signals: [
      {
        kind: 'assumption',
        label: 'Assumption',
        detail:
          '"Simplest version" assumes you can ship behind a feature flag — that may not match your current rollout process.',
        paragraphIndex: 1,
      },
      {
        kind: 'verification',
        label: 'Needs Verification',
        detail:
          'Confirm the metric you intend to use is already instrumented before relying on it as the success signal.',
        paragraphIndex: 1,
      },
      {
        kind: 'context',
        label: 'Context Required',
        detail:
          'No timeline or team-size constraint was provided; "iterate" may take days or weeks depending on cycle time.',
        paragraphIndex: 1,
      },
      {
        kind: 'source',
        label: 'Source Available',
        detail:
          'The Lean Startup pattern of "build → measure → learn" maps cleanly to these three steps if you want a canonical reference.',
        paragraphIndex: 1,
      },
    ],
  },
  {
    content: `A few thoughts on this:

• The most important variable is likely how strict your accuracy requirements are.
• If precision matters, lean toward verification-heavy workflows.
• If speed matters, accept a higher tolerance and review at the end.

Happy to explore either direction in more depth.`,
    signals: [
      {
        kind: 'assumption',
        label: 'Assumption',
        detail:
          '"Precision vs. speed" is framed as a binary — many production systems actually need a calibrated mix per workflow.',
        paragraphIndex: 0,
      },
      {
        kind: 'assumption',
        label: 'Assumption',
        detail:
          'Assumes accuracy is the dominant axis. For regulated domains, auditability or reversibility often matters more.',
        paragraphIndex: 1,
      },
      {
        kind: 'context',
        label: 'Context Required',
        detail:
          'Cost-of-error and cost-of-delay were not provided; without them the tradeoff cannot be priced for your case.',
        paragraphIndex: 1,
      },
      {
        kind: 'verification',
        label: 'Needs Verification',
        detail:
          'Confirm "review at the end" is acceptable to downstream consumers — many integrations need fail-fast feedback.',
        paragraphIndex: 1,
      },
    ],
  },
  {
    content: `Short answer — yes, with caveats.

The approach you described should work for the common case, but it relies on a couple of assumptions that aren't always true in practice. I'd suggest documenting them clearly and adding a lightweight check before each run so you'll notice quickly if the conditions change.`,
    signals: [
      {
        kind: 'assumption',
        label: 'Assumption',
        detail:
          'The "common case" is treated as the default; verify it actually represents the majority of your traffic.',
        paragraphIndex: 1,
      },
      {
        kind: 'verification',
        label: 'Needs Verification',
        detail:
          'The "lightweight check" is unspecified — confirm it can run in your hot path without adding meaningful latency.',
        paragraphIndex: 1,
      },
      {
        kind: 'context',
        label: 'Context Required',
        detail:
          'The exact assumptions referenced ("aren\'t always true") were not enumerated. Ask for the specific list before approving.',
        paragraphIndex: 1,
      },
    ],
  },
  {
    content: `Here's a structured response:

— **Context**: The question touches on tradeoffs between flexibility and consistency.
— **Recommendation**: Pick the option that protects the more expensive mistake. If consistency is the costlier failure, constrain. If flexibility is, leave room.
— **Next step**: Define what "expensive" means for your team in one sentence, and the answer becomes clear.`,
    signals: [
      {
        kind: 'assumption',
        label: 'Assumption',
        detail:
          'Assumes one failure mode is materially more expensive than the other; in many teams the two are within the same order of magnitude.',
        paragraphIndex: 2,
      },
      {
        kind: 'context',
        label: 'Context Required',
        detail:
          'No information about your team\'s current pain point — constraining or loosening may be the right move depending on what already hurts.',
        paragraphIndex: 2,
      },
      {
        kind: 'verification',
        label: 'Needs Verification',
        detail:
          'Before adopting the recommendation, validate the cost of each failure mode with a recent incident, not a hypothetical.',
        paragraphIndex: 2,
      },
      {
        kind: 'source',
        label: 'Source Available',
        detail:
          'The "expensive failure" framing comes from reversible/irreversible decision literature — useful for justifying the tradeoff internally.',
        paragraphIndex: 1,
      },
    ],
  },
];

export function generateMockReply(prompt: string): {
  content: string;
  signals: Signal[];
} {
  const sum = Array.from(prompt).reduce((a, c) => a + c.charCodeAt(0), 0);
  const pick = REPLIES[sum % REPLIES.length];
  return { content: pick.content, signals: pick.signals.map((s) => ({ ...s })) };
}

/**
 * @deprecated kept for any external callers. Prefer the object form returned
 * by `generateMockReply`.
 */
export function generateMockSignals(prompt: string): Signal[] {
  return generateMockReply(prompt).signals;
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
