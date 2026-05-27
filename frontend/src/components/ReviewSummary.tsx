import React from 'react';
import { Signal, SignalKind } from '../types';
import { Lightbulb, FileQuestion, ShieldAlert, BookOpenCheck } from 'lucide-react';

interface SummaryItem {
  kind: SignalKind;
  count: number;
  label: string;
  zeroLabel: string;
  icon: React.ElementType;
  accent: string;
}

interface Props {
  signals: Signal[];
}

const KIND_DEFS: Record<SignalKind, { icon: React.ElementType; accent: string; label: (n: number) => string; zeroLabel: string }> = {
  assumption: {
    icon: Lightbulb,
    accent: 'text-[#9A3412]',
    label: (n) => (n === 1 ? 'assumption found' : 'assumptions found'),
    zeroLabel: 'no assumptions flagged',
  },
  context: {
    icon: FileQuestion,
    accent: 'text-[#1E40AF]',
    label: (n) => (n === 1 ? 'context gap identified' : 'context gaps identified'),
    zeroLabel: 'no context gaps',
  },
  verification: {
    icon: ShieldAlert,
    accent: 'text-[#854D0E]',
    label: (n) => (n === 1 ? 'item requires verification' : 'items require verification'),
    zeroLabel: 'nothing requires verification',
  },
  source: {
    icon: BookOpenCheck,
    accent: 'text-[#166534]',
    label: (n) => (n === 1 ? 'supporting source available' : 'supporting sources available'),
    zeroLabel: 'no supporting sources',
  },
};

const ORDER: SignalKind[] = ['assumption', 'context', 'verification', 'source'];

export const ReviewSummary: React.FC<Props> = ({ signals }) => {
  const counts = signals.reduce<Record<SignalKind, number>>(
    (acc, s) => {
      acc[s.kind] = (acc[s.kind] || 0) + 1;
      return acc;
    },
    { assumption: 0, context: 0, verification: 0, source: 0 }
  );

  const items: SummaryItem[] = ORDER.map((k) => ({
    kind: k,
    count: counts[k],
    label: KIND_DEFS[k].label(counts[k]),
    zeroLabel: KIND_DEFS[k].zeroLabel,
    icon: KIND_DEFS[k].icon,
    accent: KIND_DEFS[k].accent,
  }));

  const totalFindings = signals.length;

  return (
    <section
      className="bg-bubble/40 border border-line-light rounded-xl px-4 py-3.5"
      data-testid="review-summary"
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium">
          Review summary
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium tabular-nums tracking-wide transition-colors duration-200 ${
            totalFindings > 0
              ? 'bg-white border-line text-ink-700'
              : 'bg-bubble/60 border-line-light text-ink-400'
          }`}
          data-testid="review-summary-findings-badge"
          aria-label={`${totalFindings} ${totalFindings === 1 ? 'finding' : 'findings'}`}
        >
          {totalFindings} {totalFindings === 1 ? 'finding' : 'findings'}
        </span>
      </div>
      <ul className="space-y-1.5">
        {items.map(({ kind, count, label, zeroLabel, icon: Icon, accent }) => (
          <li
            key={kind}
            className={`flex items-center gap-2.5 text-[13px] ${
              count > 0 ? 'text-ink-900' : 'text-ink-400'
            }`}
            data-testid={`review-summary-${kind}`}
          >
            <Icon
              className={`w-3.5 h-3.5 flex-shrink-0 ${count > 0 ? accent : 'text-ink-400'}`}
              strokeWidth={1.75}
            />
            {count > 0 ? (
              <>
                <span className="font-medium tabular-nums">{count}</span>
                <span className="text-ink-700">{label}</span>
              </>
            ) : (
              <span>{zeroLabel}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ReviewSummary;
