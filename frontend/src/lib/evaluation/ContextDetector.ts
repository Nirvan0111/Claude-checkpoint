import { DetectorContext, Detection } from './types';

// A "dimension" of context that, if absent from the prompt, may make the
// generated recommendation conditional. Each dimension has:
//   - promptCheck: regex that, if it matches the prompt, means the
//     dimension WAS provided (so it's NOT missing).
//   - outputAnchor: regex used to find which output paragraph the
//     dimension most relates to, so we can anchor the signal inline.
//   - label: human-readable name used in the signal detail.
interface ContextDimension {
  promptCheck: RegExp;
  outputAnchor: RegExp;
  label: string;
}

const DIMENSIONS: ContextDimension[] = [
  {
    promptCheck: /\b(traffic|qps|rps|requests?\s*per|users?\s*\/?\s*sec|load|throughput|volume|concurrent)\b/i,
    outputAnchor: /\b(scale|scaling|traffic|throughput|load|users?|requests?|capacity|workload|performance)\b/i,
    label: 'expected traffic volume',
  },
  {
    promptCheck: /\b(budget|cost|spend|\$|dollar|price|cheap|expensive)\b/i,
    outputAnchor: /\b(cost|expensive|cheap|price|pay|spend|paid|free|tier)\b/i,
    label: 'budget constraints',
  },
  {
    promptCheck: /\b(production|staging|development|environment|cloud|aws|gcp|azure|on[- ]prem|self[- ]host)\b/i,
    outputAnchor: /\b(deploy|environment|production|staging|cloud|server|host|infrastructure)\b/i,
    label: 'deployment environment',
  },
  {
    promptCheck: /\b(audience|stakeholders?|customers?|engineers?|executives?|investors?|readers?)\b/i,
    outputAnchor: /\b(team|stakeholders?|customers?|audience|reader|consumer)\b/i,
    label: 'audience',
  },
  {
    promptCheck: /\b(timeline|deadline|by\s+(?:next|tomorrow|monday|tuesday|wednesday|thursday|friday|month|quarter|q[1-4])|weeks?|months?|days?\b)\b/i,
    outputAnchor: /\b(iterate|phase|step|next|then|after|first|begin|start|cycle|sprint)\b/i,
    label: 'timeline',
  },
  {
    promptCheck: /\b(constraint|requirement|must|cannot|can'?t|restrict|sla|compliance|regulat)\b/i,
    outputAnchor: /\b(recommend|approach|option|pick|choose|select|prefer|strategy)\b/i,
    label: 'specific requirements or constraints',
  },
  {
    promptCheck: /\b(team\s+(?:of|size)|engineers?\b|people\b|headcount)\b/i,
    outputAnchor: /\b(team|engineers?|people|review|approve|owner)\b/i,
    label: 'team size',
  },
];

export function detectMissingContext(ctx: DetectorContext): Detection[] {
  const missing = DIMENSIONS.filter((d) => !d.promptCheck.test(ctx.prompt));
  if (missing.length === 0) return [];

  const out: Detection[] = [];

  ctx.paragraphs.forEach((para, idx) => {
    const matched = new Set<string>();
    for (const dim of missing) {
      if (dim.outputAnchor.test(para)) matched.add(dim.label);
    }
    if (matched.size > 0) {
      out.push({ kind: 'context', paragraphIndex: idx, matches: Array.from(matched) });
    }
  });

  // Fallback: if no paragraph anchored a missing dimension but the prompt
  // is clearly under-specified, attach a single signal to the last paragraph
  // referencing the two most relevant gaps. This keeps the surface useful
  // for short outputs that don't repeat the prompt's vocabulary.
  if (out.length === 0 && ctx.paragraphs.length > 0) {
    const lastIdx = ctx.paragraphs.length - 1;
    out.push({
      kind: 'context',
      paragraphIndex: lastIdx,
      matches: missing.slice(0, 2).map((d) => d.label),
    });
  }

  return out;
}
