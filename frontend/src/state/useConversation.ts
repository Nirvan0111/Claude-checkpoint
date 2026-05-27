import { useCallback, useMemo, useRef, useState } from 'react';
import { ChallengeResults, CheckpointTarget, DecisionType, ExecutionData, Message, ProtectedFile } from '../types';
import { generateMockChallenge, generateMockReply } from '../data/mockData';
import { generateMockExecution } from '../data/executionMock';
import { evaluate } from '../lib/evaluation';

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
  toggleProtected: (assistantMessageId: string, path: string) => void;
  markRolledBack: (assistantMessageId: string) => void;
  generateChallenge: (assistantMessageId: string) => ChallengeResults | undefined;
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
      const { content } = generateMockReply(trimmed);
      // Phase 3: evaluation signals are produced by the EvaluationEngine from
      // the generated output + the original prompt. This replaces the
      // previously-hardcoded per-reply signal sets.
      const signals = evaluate({ prompt: trimmed, output: content });
      const execution: ExecutionData = generateMockExecution(trimmed);
      const assistantMsg: Message = {
        id: newId(),
        role: 'assistant',
        content,
        createdAt: nowIso(),
        promptRef: userMsg.id,
        signals,
        execution,
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

  const toggleProtected = useCallback(
    (assistantMessageId: string, path: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== assistantMessageId || !m.execution) return m;
          const nextProtected: ProtectedFile[] = m.execution.protectedFiles.map((p) =>
            p.path === path ? { ...p, locked: !p.locked } : p
          );
          return {
            ...m,
            execution: { ...m.execution, protectedFiles: nextProtected },
          };
        })
      );
    },
    []
  );

  const markRolledBack = useCallback(
    (assistantMessageId: string) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== assistantMessageId || !m.execution) return m;
          return {
            ...m,
            execution: { ...m.execution, rolledBack: true },
          };
        })
      );
    },
    []
  );

  const generateChallenge = useCallback(
    (assistantMessageId: string): ChallengeResults | undefined => {
      const m = messageMap.get(assistantMessageId);
      if (!m) return undefined;
      if (m.challenge) return m.challenge;
      const challenge = generateMockChallenge(m.content);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === assistantMessageId ? { ...msg, challenge } : msg))
      );
      return challenge;
    },
    [messageMap]
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
    toggleProtected,
    markRolledBack,
    generateChallenge,
    getMessage,
    getPromptFor,
  };
}
