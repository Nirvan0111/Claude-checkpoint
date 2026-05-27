// Domain types for Claude Checkpoint

export type Role = 'user' | 'assistant';

export type SignalKind =
  | 'assumption'
  | 'context'
  | 'verification'
  | 'source';

export interface Signal {
  kind: SignalKind;
  label: string;
  detail: string;
}

export type DecisionType = 'approved' | 'rejected' | 'challenged';

export interface ReviewDecision {
  id?: string;
  decision: DecisionType;
  at: string; // ISO
  note?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string; // ISO
  promptRef?: string; // for assistant messages: id of user prompt being answered
  signals?: Signal[]; // attached evaluation signals (mocked)
  review?: ReviewDecision; // populated after a checkpoint decision
}

export interface CheckpointTarget {
  assistantMessageId: string;
  promptMessageId: string;
}
