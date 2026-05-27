import React, { useEffect, useRef } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ToastProvider, useToast } from './components/Toast';
import { useConversation } from './state/useConversation';
import ConversationMessage from './components/ConversationMessage';
import ChatInput from './components/ChatInput';
import ReviewPanel from './components/ReviewPanel';
import WelcomeState from './components/WelcomeState';
import TypingIndicator from './components/TypingIndicator';
import { DecisionType } from './types';
import { postReview, signalsToStrings } from './lib/api';

const DECISION_COPY: Record<DecisionType, string> = {
  approved: 'Approved — output accepted.',
  rejected: 'Rejected — output discarded.',
  challenged: 'Challenge sent back to Claude.',
};

const Shell: React.FC = () => {
  const {
    conversationId,
    messages,
    isTyping,
    sendPrompt,
    openCheckpoint,
    closeCheckpoint,
    checkpointTarget,
    applyDecision,
    getMessage,
    getPromptFor,
  } = useConversation();

  const toast = useToast();
  const armedRef = useRef(false);
  const lastMessageId = messages.length ? messages[messages.length - 1].id : null;
  const scrollAnchor = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollAnchor.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isTyping]);

  // If user armed checkpoint, auto-open it on the next assistant reply
  useEffect(() => {
    if (!armedRef.current) return;
    const last = messages[messages.length - 1];
    if (last && last.role === 'assistant') {
      openCheckpoint(last.id);
      armedRef.current = false;
    }
  }, [messages, openCheckpoint]);

  const checkpointOutput = checkpointTarget
    ? getMessage(checkpointTarget.assistantMessageId)
    : undefined;
  const checkpointPrompt = checkpointTarget
    ? getPromptFor(checkpointTarget.assistantMessageId)
    : undefined;

  const handleDecision = async (decision: DecisionType, note?: string) => {
    if (!checkpointTarget || !checkpointOutput || !checkpointPrompt) return;
    const messageId = checkpointTarget.assistantMessageId;

    // Optimistic UI: inline decision badge
    applyDecision(messageId, decision, note);

    // Toast feedback
    toast.show(DECISION_COPY[decision], decision === 'rejected' ? 'warn' : 'success');

    // Close panel
    closeCheckpoint();

    // Persist
    try {
      await postReview({
        message_id: messageId,
        conversation_id: conversationId,
        decision,
        prompt: checkpointPrompt.content,
        output: checkpointOutput.content,
        signals: signalsToStrings(checkpointOutput.signals ?? []),
        note,
      });
    } catch (e) {
      // Non-blocking — UI already updated
      // eslint-disable-next-line no-console
      console.warn('Failed to persist review decision', e);
    }
  };

  return (
    <div className="min-h-screen bg-app flex flex-col">
      {/* Top bar */}
      <header
        className="sticky top-0 z-20 bg-app/85 backdrop-blur-sm border-b border-line-light"
        data-testid="top-bar"
      >
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-ink-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
            </span>
            <div className="leading-tight">
              <div className="font-serif text-[15px] text-ink-900">Claude Checkpoint</div>
              <div className="text-[10px] tracking-[0.08em] uppercase text-ink-400 font-medium">
                Phase 1 · Foundation
              </div>
            </div>
          </div>
          <div className="text-[12px] text-ink-500" data-testid="conversation-id">
            Session · {conversationId.slice(0, 6)}
          </div>
        </div>
      </header>

      {/* Conversation */}
      <main className="flex-1 w-full">
        <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 flex flex-col gap-8 py-2 pb-44">
          {messages.length === 0 && (
            <WelcomeState onSuggestion={(s) => sendPrompt(s)} />
          )}

          {messages.map((m) => (
            <ConversationMessage
              key={m.id}
              message={m}
              onOpenCheckpoint={
                m.role === 'assistant' && m.id === lastMessageId
                  ? openCheckpoint
                  : m.role === 'assistant'
                    ? openCheckpoint
                    : undefined
              }
            />
          ))}

          {isTyping && (
            <div className="flex flex-col items-start" data-testid="assistant-typing">
              <TypingIndicator />
            </div>
          )}

          <div ref={scrollAnchor} />
        </div>
      </main>

      <ChatInput
        onSend={sendPrompt}
        onActivateCheckpointHint={() => {
          armedRef.current = true;
        }}
      />

      <ReviewPanel
        open={!!checkpointTarget}
        prompt={checkpointPrompt}
        output={checkpointOutput}
        onClose={closeCheckpoint}
        onDecide={handleDecision}
      />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <Shell />
    </ToastProvider>
  );
};

export default App;
