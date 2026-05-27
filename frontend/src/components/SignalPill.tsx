import React from 'react';
import { SignalKind } from '../types';
import { Lightbulb, FileQuestion, ShieldAlert, BookOpenCheck } from 'lucide-react';

interface Props {
  kind: SignalKind;
  label: string;
  className?: string;
}

const KIND_STYLES: Record<SignalKind, string> = {
  assumption: 'bg-[#FFF6ED] text-[#9A3412] border-[#FED7AA]',
  context: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  verification: 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]',
  source: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
};

const KIND_ICON: Record<SignalKind, React.ElementType> = {
  assumption: Lightbulb,
  context: FileQuestion,
  verification: ShieldAlert,
  source: BookOpenCheck,
};

export const SignalPill: React.FC<Props> = ({ kind, label, className }) => {
  const Icon = KIND_ICON[kind];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${KIND_STYLES[kind]} ${className || ''}`}
      data-testid={`signal-pill-${kind}`}
    >
      <Icon className="w-3 h-3" strokeWidth={1.75} />
      {label}
    </span>
  );
};

export default SignalPill;
