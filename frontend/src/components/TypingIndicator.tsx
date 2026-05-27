import React from 'react';

export const TypingIndicator: React.FC = () => {
  return (
    <div
      className="flex items-center gap-1.5 px-1 py-2 text-ink-400"
      data-testid="typing-indicator"
    >
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-400 inline-block" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-400 inline-block" />
      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-400 inline-block" />
    </div>
  );
};

export default TypingIndicator;
