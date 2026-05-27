import { useCallback, useMemo, useRef, useState } from 'react';
import { CheckpointTarget, DecisionType, Message, Signal } from '../types';
import { generateMockReply, generateMockSignals } from '../data/mockData';

const newId = () => Math.random().toString(36).slice(2, 10);
const nowIso = () => new Date().toISOString();

interface UseConversationReturn {
  conversationId: string;
  messages: Message[];
  isTyping: boolean;
  sendPrompt: (text: string) => void;
  openCheckpoint: (assistantMessageId: string) => void;
  closeCheckpoint: () => void;
  checkpointTarget: CheckpointTarget | null;
  applyDecision: (
    assistantMessageId: string,
    decision: DecisionType,
    note?: string
  ) => void;
  getMessage: (id: string) => Message | undefined;
  getPromptFor: (assistantMessageId: string) => Message | undefined;
}

export function useConversation(): UseConversationReturn {
  const conversationIdRef = useRef<string>(newId());
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [checkpointTarget, setCheckpointTarget] = useState<CheckpointTarget | null>(null);

  const messageMap = useMemo(() => {
    const m = new Map<string, Message>();
    messages.forEach((msg) => m.set(msg.id, msg));
    return m;
  }, [messages]);

  const getMessage = useCallback((id: string) => messageMap.get(id), [messageMap]);

  const getPromptFor = useCallback(
    (assistantMessageId: string) => {
      const a = messageMap.get(assistantMessageId);
      if (!a || !a.promptRef) return undefined;
      return messageMap.get(a.promptRef);
    },
    [messageMap]
  );

  const sendPrompt = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const userMsg: Message = {
      id: newId(),
      role: 'user',
      content: trimmed,
      createdAt: nowIso(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    // Simulate Claude generating a reply (mock).
    window.setTimeout(() => {
      const signals: Signal[] = generateMockSignals(trimmed);
      const assistantMsg: Message = {
        id: newId(),
        role: 'assistant',
        content: generateMockReply(trimmed),
        createdAt: nowIso(),
        promptRef: userMsg.id,
        signals,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 900);
  }, []);

  const openCheckpoint = useCallback(
    (assistantMessageId: string) => {
      const assistant = messageMap.get(assistantMessageId);
      if (!assistant || assistant.role !== 'assistant' || !assistant.promptRef) return;
      setCheckpointTarget({
        assistantMessageId,
        promptMessageId: assistant.promptRef,
      });
    },
    [messageMap]
  );

  const closeCheckpoint = useCallback(() => {
    setCheckpointTarget(null);
  }, []);

  const applyDecision = useCallback(
    (assistantMessageId: string, decision: DecisionType, note?: string) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMessageId
            ? {
                ...m,
                review: {
                  decision,
                  at: nowIso(),
                  note,
                },
              }
            : m
        )
      );
    },
    []
  );

  return {
    conversationId: conversationIdRef.current,
    messages,
    isTyping,
    sendPrompt,
    openCheckpoint,
    closeCheckpoint,
    checkpointTarget,
    applyDecision,
    getMessage,
    getPromptFor,
  };
}
