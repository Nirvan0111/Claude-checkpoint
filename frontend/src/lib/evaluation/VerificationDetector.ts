import { DetectorContext, Detection } from './types';

// Markers of factual, technical, or implementation claims that benefit from
// being checked against the user's actual stack before being acted on.
const PATTERNS: { regex: RegExp; label: string }[] = [
  { regex: /\bapi\b/i, label: 'API behaviour' },
  { regex: /\b(?:v?\d+(?:\.\d+){1,2})\b/, label: 'version-specific guidance' },
  { regex: /\bversion(?:s)?\b/i, label: 'version compatibility' },
  { regex: /\b(framework|library|package|sdk|dependency)\b/i, label: 'framework or library compatibility' },
  {
    regex:
      /\b(react|django|postgres(?:ql)?|redis|node(?:\.?js)?|next(?:\.?js)?|kubernetes|docker|mongo(?:db)?|kafka|fastapi|flask|rails|spring|express|vue|angular|svelte|typescript|python|go|rust)\b/i,
    label: 'tool-specific behaviour',
  },
  { regex: /\bcompatib(?:le|ility)\b/i, label: 'compatibility' },
  { regex: /\bsupports?\b/i, label: 'support claim' },
  { regex: /\bmigrat(?:e|ion|ing)\b/i, label: 'migration steps' },
  { regex: /\bdeprecat(?:ed|ion)\b/i, label: 'deprecation status' },
  { regex: /\b(tests?\s+pass|regression|spec\b|schema|backward[- ]compatible)\b/i, label: 'operational claim' },
];

export function detectVerificationNeeds(ctx: DetectorContext): Detection[] {
  const out: Detection[] = [];
  ctx.paragraphs.forEach((para, idx) => {
    const matched = new Set<string>();
    for (const { regex, label } of PATTERNS) {
      if (regex.test(para)) matched.add(label);
    }
    if (matched.size > 0) {
      out.push({ kind: 'verification', paragraphIndex: idx, matches: Array.from(matched) });
    }
  });
  return out;
}
