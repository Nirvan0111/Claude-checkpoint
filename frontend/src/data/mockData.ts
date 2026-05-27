import { Signal } from '../types';

// Curated mock signal pools so any generated response gets a believable
// review payload. Phase 1 is mock-only; no AI evaluation.

const SIGNAL_POOL: Signal[] = [
  {
    kind: 'assumption',
    label: 'Assumption',
    detail:
      'The answer assumes the user is operating in a production context with stable internet and modern browsers.',
  },
  {
    kind: 'assumption',
    label: 'Assumption',
    detail:
      'Pricing and availability are treated as static, though they may have shifted recently.',
  },
  {
    kind: 'context',
    label: 'Additional Context Required',
    detail:
      'Team size, timeline, and existing tooling were not specified — recommendations may not fit constraints.',
  },
  {
    kind: 'context',
    label: 'Additional Context Required',
    detail:
      'The intended audience for the output was not provided; tone may need adjustment.',
  },
  {
    kind: 'verification',
    label: 'Needs Verification',
    detail:
      'Specific figures cited here should be cross-checked against an authoritative source before publishing.',
  },
  {
    kind: 'verification',
    label: 'Needs Verification',
    detail:
      'API endpoints and parameter names referenced in the response may have changed in recent versions.',
  },
  {
    kind: 'source',
    label: 'Source Available',
    detail:
      'A canonical reference exists for this topic in the official documentation and can be linked directly.',
  },
];

export function generateMockSignals(seed: string): Signal[] {
  // Deterministic-ish selection so the same prompt yields the same signals.
  const sum = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  const picks = [
    SIGNAL_POOL[sum % SIGNAL_POOL.length],
    SIGNAL_POOL[(sum + 2) % SIGNAL_POOL.length],
    SIGNAL_POOL[(sum + 4) % SIGNAL_POOL.length],
    SIGNAL_POOL[(sum + 6) % SIGNAL_POOL.length],
  ];
  // Dedupe while preserving order
  const seen = new Set<string>();
  return picks.filter((s) => {
    const key = s.kind + s.label;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const REPLIES = [
  `Here is a concise take on your question. I've outlined the main considerations and a recommended path forward.\n\n1. Start with the simplest version that produces a measurable result.\n2. Validate the assumptions in your environment before expanding scope.\n3. Iterate based on the signals you collect.\n\nLet me know if you'd like a deeper breakdown of any step.`,
  `A few thoughts on this:\n\n• The most important variable is likely how strict your accuracy requirements are.\n• If precision matters, lean toward verification-heavy workflows.\n• If speed matters, accept a higher tolerance and review at the end.\n\nHappy to explore either direction in more depth.`,
  `Short answer — yes, with caveats.\n\nThe approach you described should work for the common case, but it relies on a couple of assumptions that aren't always true in practice. I'd suggest documenting them clearly and adding a lightweight check before each run so you'll notice quickly if the conditions change.`,
  `Here's a structured response:\n\n— **Context**: The question touches on tradeoffs between flexibility and consistency.\n— **Recommendation**: Pick the option that protects the more expensive mistake. If consistency is the costlier failure, constrain. If flexibility is, leave room.\n— **Next step**: Define what "expensive" means for your team in one sentence, and the answer becomes clear.`,
];

export function generateMockReply(prompt: string): string {
  const sum = Array.from(prompt).reduce((a, c) => a + c.charCodeAt(0), 0);
  return REPLIES[sum % REPLIES.length];
}
