import React from 'react';
import { Check, X, MessageCircleQuestion } from 'lucide-react';
import { DecisionType } from '../types';

interface Props {
  onApprove: () => void;
  onReject: () => void;
  onChallenge: () => void;
  disabledDecision?: DecisionType | null;
}

export const ActionBar: React.FC<Props> = ({
  onApprove,
  onReject,
  onChallenge,
  disabledDecision,
}) => {
  const disabled = !!disabledDecision;

  return (
    <div className="flex flex-col gap-2.5" data-testid="action-bar">
      <button
        type="button"
        onClick={onApprove}
        disabled={disabled}
        className="group flex items-center justify-center gap-2 bg-ink-900 text-white hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-2.5 text-sm font-medium transition-colors w-full"
        data-testid="approve-action-button"
      >
        <Check className="w-4 h-4" strokeWidth={2} />
        Approve
      </button>

      <button
        type="button"
        onClick={onChallenge}
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-white text-[#9A3412] border border-[#FED7AA] hover:bg-[#FFF6ED] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-2.5 text-sm font-medium transition-colors w-full"
        data-testid="challenge-action-button"
      >
        <MessageCircleQuestion className="w-4 h-4" strokeWidth={1.75} />
        Challenge Answer
      </button>

      <button
        type="button"
        onClick={onReject}
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-white text-ink-900 border border-line hover:bg-bubble disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-2.5 text-sm font-medium transition-colors w-full"
        data-testid="reject-action-button"
      >
        <X className="w-4 h-4" strokeWidth={1.75} />
        Reject
      </button>

      {disabledDecision && (
        <p
          className="text-xs text-ink-500 text-center mt-1"
          data-testid="action-bar-decision-recorded"
        >
          Decision recorded: <span className="font-medium text-ink-900">{disabledDecision}</span>
        </p>
      )}
    </div>
  );
};

export default ActionBar;
