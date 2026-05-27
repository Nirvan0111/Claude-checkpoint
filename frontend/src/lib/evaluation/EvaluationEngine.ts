import { Signal, SignalKind } from '../../types';
import { Detection, DetectorContext } from './types';
import { detectAssumptions } from './AssumptionDetector';
import { detectMissingContext } from './ContextDetector';
import { detectVerificationNeeds } from './VerificationDetector';
import { mapDetectionsToSignals } from './AnnotationMapper';

// Phase 3 cap rules:
//  - At most one signal per (kind, paragraph) — enforced by dedupeAndMerge.
//  - Total visible signals capped at MAX_SIGNALS_PER_OUTPUT.
//  - Priority when culling: Context Required → Needs Verification → Assumption.
const MAX_SIGNALS_PER_OUTPUT = 5;
const PRIORITY: SignalKind[] = ['context', 'verification', 'assumption'];

export interface EvaluateInput {
  prompt: string;
  output: string;
}

// Merge detections that share (kind, paragraphIndex). The matches arrays are
// unioned so the eventual signal detail mentions every triggering phrase.
function dedupeAndMerge(detections: Detection[]): Detection[] {
  const map = new Map<string, Detection>();
  for (const d of detections) {
    const key = `${d.kind}:${d.paragraphIndex}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...d, matches: [...d.matches] });
    } else {
      existing.matches = Array.from(new Set([...existing.matches, ...d.matches]));
    }
  }
  return Array.from(map.values());
}

function applyCap(detections: Detection[]): Detection[] {
  const sorted = [...detections].sort((a, b) => {
    const pa = PRIORITY.indexOf(a.kind);
    const pb = PRIORITY.indexOf(b.kind);
    if (pa !== pb) return pa - pb;
    return a.paragraphIndex - b.paragraphIndex;
  });
  return sorted.slice(0, MAX_SIGNALS_PER_OUTPUT);
}

// Public entry point. Pure function: same input → same output, no side effects.
// Designed to be drop-in replaceable by a Claude-graded evaluator that returns
// the same Signal[] shape.
export function evaluate({ prompt, output }: EvaluateInput): Signal[] {
  const paragraphs = output.split(/\n\n+/);
  const ctx: DetectorContext = { prompt, output, paragraphs };

  const raw: Detection[] = [
    ...detectMissingContext(ctx),
    ...detectVerificationNeeds(ctx),
    ...detectAssumptions(ctx),
  ];

  const deduped = dedupeAndMerge(raw);
  const capped = applyCap(deduped);
  return mapDetectionsToSignals(capped, paragraphs.length);
}
