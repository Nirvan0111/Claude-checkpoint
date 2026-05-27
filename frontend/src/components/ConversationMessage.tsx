import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Message } from '../types';
import DecisionBadge from './DecisionBadge';

interface Props {
  message: Message;
  onOpenCheckpoint?: (messageId: string) => void;
}

// Renders assistant text with paragraph breaks and basic bold markdown (**text**)
function renderAssistantContent(text: string) {
  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map((p, idx) => (
    <p key={idx} className="whitespace-pre-wrap">
      {p.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) => {
        if (chunk.startsWith('**') && chunk.endsWith('**')) {
          return (
            <strong key={i} className="font-semibold text-ink-900">
              {chunk.slice(2, -2)}
            </strong>
          );
        }
        return <React.Fragment key={i}>{chunk}</React.Fragment>;
      })}
    </p>
  ));
}

export const ConversationMessage: React.FC<Props> = ({ message, onOpenCheckpoint }) => {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <div
        className="flex justify-end message-enter"
        data-testid={`message-user-${message.id}`}
      >
        <div className="bg-bubble rounded-2xl rounded-tr-sm px-5 py-3.5 max-w-[85%] text-ink-900 text-[15px] leading-relaxed">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-start message-enter"
      data-testid={`message-assistant-${message.id}`}
    >
      <div className="bg-transparent rounded-2xl px-1 py-2 max-w-full text-ink-900 font-serif text-[17px] leading-[1.75] space-y-4">
        {renderAssistantContent(message.content)}
      </div>

      {/* Per-message checkpoint affordance */}
      <div className="flex items-center gap-3 mt-2 pl-1">
        {!message.review && onOpenCheckpoint && (
          <button
            type="button"
            onClick={() => onOpenCheckpoint(message.id)}
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-ink-900 transition-colors"
            data-testid={`open-checkpoint-inline-${message.id}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            Review with Checkpoint
          </button>
        )}
      </div>

      <DecisionBadge message={message} />
    </div>
  );
};

export default ConversationMessage;
