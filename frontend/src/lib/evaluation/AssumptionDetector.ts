import { DetectorContext, Detection } from './types';

// Hedging + recommendation-oriented language that signals the statement
// relies on conditions that may not be explicitly grounded.
const PATTERNS: { regex: RegExp; label: string }[] = [
  // Hedging language
  { regex: /\bshould\b/i, label: 'should' },
  { regex: /\blikely\b/i, label: 'likely' },
  { regex: /\btypically\b/i, label: 'typically' },
  { regex: /\bgenerally\b/i, label: 'generally' },
  { regex: /\bcomfortably\b/i, label: 'comfortably' },
  { regex: /\bwithout downtime\b/i, label: '"without downtime"' },
  { regex: /\bassume[sd]?\b/i, label: '"assume"' },
  // Recommendation-oriented language
  { regex: /\brecommended\b/i, label: '"recommended"' },
  { regex: /\bbest[- ]practice\b/i, label: '"best practice"' },
  { regex: /\bideal(?:ly)?\b/i, label: '"ideal"' },
  { regex: /\boptimal(?:ly)?\b/i, label: '"optimal"' },
  { regex: /\bpreferred\b/i, label: '"preferred"' },
  { regex: /\bcommonly used\b/i, label: '"commonly used"' },
];

export function detectAssumptions(ctx: DetectorContext): Detection[] {
  const out: Detection[] = [];
  ctx.paragraphs.forEach((para, idx) => {
    const matched = new Set<string>();
    for (const { regex, label } of PATTERNS) {
      if (regex.test(para)) matched.add(label);
    }
    if (matched.size > 0) {
      out.push({ kind: 'assumption', paragraphIndex: idx, matches: Array.from(matched) });
    }
  });
  return out;
}
