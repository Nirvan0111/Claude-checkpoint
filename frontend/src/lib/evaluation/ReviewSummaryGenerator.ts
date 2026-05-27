import { Signal, SignalKind } from '../../types';

export type SummaryCounts = Record<SignalKind, number>;

// Pure count of detected signals per kind. The presentational ReviewSummary
// component computes the same shape internally; this function is exposed so
// non-UI consumers (tests, analytics, future evaluators) can rely on a single
// counting rule.
export function summarize(signals: Signal[]): SummaryCounts {
  const counts: SummaryCounts = {
    assumption: 0,
    context: 0,
    verification: 0,
    source: 0,
  };
  for (const s of signals) {
    counts[s.kind] = (counts[s.kind] || 0) + 1;
  }
  return counts;
}
