import React from 'react';
import { ShieldCheck } from 'lucide-react';

interface Props {
  onSuggestion?: (text: string) => void;
}

const SUGGESTIONS = [
  'Draft a clear summary of last week\'s product changes for our stakeholders.',
  'Compare two pricing strategies for a small SaaS team launching in Q2.',
  'Outline a careful migration plan from Postgres 14 to Postgres 16.',
];

export const WelcomeState: React.FC<Props> = ({ onSuggestion }) => {
  return (
    <div
      className="flex flex-col items-start gap-6 pt-24 pb-10"
      data-testid="welcome-state"
    >
      <div className="inline-flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
        Claude Checkpoint
      </div>

      <div className="space-y-3">
        <h1 className="font-serif text-3xl md:text-4xl tracking-tight text-ink-900 leading-tight">
          A calm space to think with Claude.
        </h1>
        <p className="text-ink-500 text-[15px] leading-relaxed max-w-xl">
          Ask anything. When the answer matters, open Checkpoint from the{' '}
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-bubble text-ink-900 text-[11px] font-medium align-[-2px]">
            +
          </span>{' '}
          menu to surface assumptions, missing context, and verification needs
          before you act.
        </p>
      </div>

      <div className="w-full mt-2">
        <div className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium mb-3">
          Try one of these
        </div>
        <div className="grid gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSuggestion?.(s)}
              className="text-left w-full px-4 py-3 rounded-xl border border-line-light bg-white hover:bg-bubble/60 hover:border-line transition-all duration-200 text-[14px] text-ink-700 hover:text-ink-900"
              data-testid={`welcome-suggestion-${i}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeState;
