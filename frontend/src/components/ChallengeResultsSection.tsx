import React from 'react';
import { Compass, AlertTriangle, FileMinus2, CloudOff } from 'lucide-react';
import { ChallengeResults } from '../types';

interface Props {
  results: ChallengeResults;
}

interface Block {
  key: keyof ChallengeResults;
  title: string;
  icon: React.ElementType;
  accent: string;
  testid: string;
}

const BLOCKS: Block[] = [
  {
    key: 'alternativePerspective',
    title: 'Alternative perspective',
    icon: Compass,
    accent: 'text-[#1E40AF] bg-[#EFF6FF] border-[#BFDBFE]',
    testid: 'challenge-alternative',
  },
  {
    key: 'potentialWeakness',
    title: 'Potential weakness',
    icon: AlertTriangle,
    accent: 'text-[#9A3412] bg-[#FFF6ED] border-[#FED7AA]',
    testid: 'challenge-weakness',
  },
  {
    key: 'missingConsiderations',
    title: 'Missing considerations',
    icon: FileMinus2,
    accent: 'text-[#854D0E] bg-[#FEFCE8] border-[#FEF08A]',
    testid: 'challenge-missing',
  },
  {
    key: 'failureScenarios',
    title: 'Failure scenarios',
    icon: CloudOff,
    accent: 'text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]',
    testid: 'challenge-failure',
  },
];

export const ChallengeResultsSection: React.FC<Props> = ({ results }) => {
  return (
    <section
      className="space-y-3"
      data-testid="challenge-results-section"
      aria-label="Challenge results"
    >
      <div className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium">
        Challenge results
      </div>
      <ul className="space-y-2.5">
        {BLOCKS.map((b) => {
          const Icon = b.icon;
          return (
            <li
              key={b.key}
              className="border border-line-light rounded-xl px-4 py-3"
              data-testid={b.testid}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-md border ${b.accent}`}
                >
                  <Icon className="w-3 h-3" strokeWidth={1.75} />
                </span>
                <span className="text-[12px] font-medium text-ink-900">{b.title}</span>
              </div>
              <p className="text-[13px] text-ink-700 leading-relaxed">{results[b.key]}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ChallengeResultsSection;
