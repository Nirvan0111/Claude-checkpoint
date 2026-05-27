import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { Message, Signal } from '../types';
import DecisionBadge from './DecisionBadge';
import SignalPill from './SignalPill';
import ChallengeResultsSection from './ChallengeResultsSection';

interface Props {
  message: Message;
  onOpenCheckpoint?: (messageId: string) => void;
}

// Renders assistant text with paragraph breaks, basic bold (**text**) and
// signals attached inline next to the paragraph they refer to.
function renderAssistantParagraph(text: string, key: number, signalsForParagraph: Signal[]) {
  return (
    <div key={key} className="space-y-1.5">
      <p className="whitespace-pre-wrap">
        {text.split(/(\*\*[^*]+\*\*)/g).map((chunk, i) => {
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
      {signalsForParagraph.length > 0 && (
        <div
          className="flex flex-wrap gap-1 -ml-0.5"
          data-testid={`inline-signals-paragraph-${key}`}
        >
          {signalsForParagraph.map((s, idx) => (
            <SignalPill
              key={`${s.kind}-${idx}`}
              kind={s.kind}
              label={s.label}
              size="xs"
              title={s.detail}
            />
          ))}
        </div>
      )}
    </div>
  );
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

  const paragraphs = message.content.split(/\n\n+/);
  const signalsByParagraph = new Map<number, Signal[]>();
  (message.signals ?? []).forEach((s) => {
    if (typeof s.paragraphIndex !== 'number') return;
    const idx = Math.min(s.paragraphIndex, paragraphs.length - 1);
    const arr = signalsByParagraph.get(idx) ?? [];
    arr.push(s);
    signalsByParagraph.set(idx, arr);
  });

  return (
    <div
      className="flex flex-col items-start message-enter"
      data-testid={`message-assistant-${message.id}`}
    >
      <div className="bg-transparent rounded-2xl px-1 py-2 max-w-full text-ink-900 font-serif text-[17px] leading-[1.75] space-y-4">
        {paragraphs.map((p, idx) =>
          renderAssistantParagraph(p, idx, signalsByParagraph.get(idx) ?? [])
        )}
      </div>

      {/* Per-message checkpoint affordance */}
      <div className="flex items-center gap-3 mt-2 pl-1">
        {!message.review && onOpenCheckpoint && (
          <button
            type="button"
            onClick={() => onOpenCheckpoint(message.id)}
            className="inline-flex items-center gap-1.5 text-[12px] text-ink-500 hover:text-ink-900 transition-colors duration-200"
            data-testid={`open-checkpoint-inline-${message.id}`}
          >
            <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            Review with Checkpoint
          </button>
        )}
      </div>

      <DecisionBadge message={message} />

      {/* Inline challenge results once a challenge has been generated */}
      {message.challenge && (
        <div
          className="mt-4 w-full max-w-2xl"
          data-testid={`inline-challenge-${message.id}`}
        >
          <ChallengeResultsSection results={message.challenge} />
        </div>
      )}
    </div>
  );
};

export default ConversationMessage;
