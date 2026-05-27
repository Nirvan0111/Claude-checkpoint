import { Signal, SignalKind } from '../../types';
import { Detection } from './types';

const KIND_LABEL: Record<SignalKind, string> = {
  assumption: 'Assumption',
  context: 'Context Required',
  verification: 'Needs Verification',
  source: 'Source Available',
};

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function capitalize(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toUpperCase() + s.slice(1);
}

function detailFor(d: Detection): string {
  switch (d.kind) {
    case 'assumption':
      return `Hedging or recommendation language (${joinList(
        d.matches
      )}) suggests this statement relies on conditions that were not explicitly grounded in the prompt.`;
    case 'context':
      return `${capitalize(
        joinList(d.matches)
      )} appears missing from the prompt — the recommendation may change depending on the actual values.`;
    case 'verification':
      return `Confirm ${joinList(
        d.matches
      )} against the version and stack currently in use before relying on this guidance.`;
    case 'source':
      // Phase 3 does not emit `source` signals, but the kind remains supported
      // for forward/backward compatibility with the existing type system.
      return d.matches.join('; ');
  }
}

// Convert raw detections into UI-ready Signals, clamping paragraphIndex to the
// number of paragraphs actually rendered.
export function mapDetectionsToSignals(
  detections: Detection[],
  paragraphCount: number
): Signal[] {
  const lastIdx = Math.max(paragraphCount - 1, 0);
  return detections.map((d) => ({
    kind: d.kind,
    label: KIND_LABEL[d.kind],
    detail: detailFor(d),
    paragraphIndex: Math.min(d.paragraphIndex, lastIdx),
  }));
}
