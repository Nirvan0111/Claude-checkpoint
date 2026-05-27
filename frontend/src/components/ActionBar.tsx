import React from 'react';
import { Check, X, MessageCircleQuestion, Undo2 } from 'lucide-react';
import { DecisionType } from '../types';

interface Props {
  onApprove: () => void;
  onReject: () => void;
  onChallenge: () => void;
  onRollback?: () => void;
  disabledDecision?: DecisionType | null;
  rolledBack?: boolean;
}

const DECISION_LABEL: Record<DecisionType, string> = {
  approved: 'approved',
  rejected: 'rejected',
  challenged: 'challenged',
  rolled_back: 'rolled back',
};

export const ActionBar: React.FC<Props> = ({
  onApprove,
  onReject,
  onChallenge,
  onRollback,
  disabledDecision,
  rolledBack,
}) => {
  const disabled = !!disabledDecision;

  return (
    <div className="flex flex-col gap-2.5" data-testid="action-bar">
      <button
        type="button"
        onClick={onApprove}
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-ink-900 text-white hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 w-full"
        data-testid="approve-action-button"
      >
        <Check className="w-4 h-4" strokeWidth={2} />
        Approve
      </button>

      <button
        type="button"
        onClick={onChallenge}
        disabled={disabled}
        className="flex items-center justify-center gap-2 bg-white text-[#9A3412] border border-[#FED7AA] hover:bg-[#FFF6ED] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-5 py-2.5 text-sm font-medium transition-colors duration-200 w-full"
        data-testid="challenge-action-button"
      >
        <MessageCircleQuestion className="w-4 h-4" strokeWidth={1.75} />
        Challenge Answer
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={onReject}
          disabled={disabled}
          className="flex items-center justify-center gap-2 bg-white text-ink-900 border border-line hover:bg-bubble disabled:opacity-50 disabled:cursor-not-allowed rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200"
          data-testid="reject-action-button"
        >
          <X className="w-4 h-4" strokeWidth={1.75} />
          Reject
        </button>

        {onRollback && (
          <button
            type="button"
            onClick={onRollback}
            disabled={disabled || rolledBack}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
              rolledBack
                ? 'bg-bubble text-ink-500 border border-line-light cursor-default'
                : 'bg-white text-ink-900 border border-line hover:bg-bubble disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
            data-testid="rollback-action-button"
          >
            <Undo2 className="w-4 h-4" strokeWidth={1.75} />
            {rolledBack ? 'Rolled back' : 'Rollback'}
          </button>
        )}
      </div>

      {disabledDecision && (
        <p
          className="text-xs text-ink-500 text-center mt-1"
          data-testid="action-bar-decision-recorded"
        >
          Decision recorded:{' '}
          <span className="font-medium text-ink-900">{DECISION_LABEL[disabledDecision]}</span>
        </p>
      )}
    </div>
  );
};

export default ActionBar;
