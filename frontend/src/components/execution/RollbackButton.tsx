import React from 'react';
import { Undo2 } from 'lucide-react';

interface Props {
  onClick: () => void;
  disabled?: boolean;
  rolledBack?: boolean;
}

export const RollbackButton: React.FC<Props> = ({ onClick, disabled, rolledBack }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || rolledBack}
      className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium transition-colors w-full ${
        rolledBack
          ? 'bg-bubble text-ink-500 border border-line-light cursor-default'
          : 'bg-white text-ink-900 border border-line hover:bg-bubble disabled:opacity-50 disabled:cursor-not-allowed'
      }`}
      data-testid="rollback-action-button"
    >
      <Undo2 className="w-4 h-4" strokeWidth={1.75} />
      {rolledBack ? 'Changes rolled back' : 'Rollback Changes'}
    </button>
  );
};

export default RollbackButton;
