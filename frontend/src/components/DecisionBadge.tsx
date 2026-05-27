import React from 'react';
import { Check, X, MessageCircleQuestion } from 'lucide-react';
import { DecisionType, Message } from '../types';

interface Props {
  message: Message;
}

const STYLES: Record<DecisionType, string> = {
  approved: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]',
  rejected: 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]',
  challenged: 'bg-[#FFF6ED] border-[#FED7AA] text-[#9A3412]',
};

const LABEL: Record<DecisionType, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  challenged: 'Challenged',
};

const ICON: Record<DecisionType, React.ReactNode> = {
  approved: <Check className="w-3.5 h-3.5" strokeWidth={2} />,
  rejected: <X className="w-3.5 h-3.5" strokeWidth={2} />,
  challenged: <MessageCircleQuestion className="w-3.5 h-3.5" strokeWidth={1.75} />,
};

export const DecisionBadge: React.FC<Props> = ({ message }) => {
  if (!message.review) return null;
  const { decision, at } = message.review;
  const time = new Date(at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border mt-3 ${STYLES[decision]}`}
      data-testid={`decision-badge-${decision}`}
    >
      {ICON[decision]}
      <span>{LABEL[decision]} via Checkpoint</span>
      <span className="opacity-60 font-normal">· {time}</span>
    </div>
  );
};

export default DecisionBadge;
