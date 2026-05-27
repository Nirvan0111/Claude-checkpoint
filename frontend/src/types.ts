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

export type DecisionType = 'approved' | 'rejected' | 'challenged' | 'rolled_back';

export interface ReviewDecision {
  id?: string;
  decision: DecisionType;
  at: string; // ISO
  note?: string;
}

// --- Phase 2: Execution Review ---

export type FileStatus = 'modified' | 'created' | 'deleted';
export type TimelineActionKind =
  | 'read'
  | 'analyzed'
  | 'modified'
  | 'created'
  | 'tests'
  | 'deleted';

export interface TimelineEvent {
  id: string;
  time: string; // formatted HH:MM:SS
  action: TimelineActionKind;
  target: string;
  description: string;
}

export type DiffLineKind = 'add' | 'remove' | 'context' | 'modified';

export interface DiffLine {
  kind: DiffLineKind;
  // Original (pre-change) line number, undefined for pure additions
  oldLine?: number;
  // New (post-change) line number, undefined for pure deletions
  newLine?: number;
  content: string;
}

export interface DiffHunk {
  header: string; // e.g. "@@ -12,7 +12,9 @@"
  lines: DiffLine[];
}

export interface FileChange {
  path: string;
  status: FileStatus;
  additions: number;
  deletions: number;
  summary: string[]; // human-readable bullets
  hunks: DiffHunk[];
}

export interface ProtectedFile {
  path: string;
  // `locked` true means the file is protected (cannot be modified).
  locked: boolean;
  // `wasTouched` indicates whether this run attempted to modify it.
  wasTouched?: boolean;
}

export interface ExecutionSummaryData {
  filesChanged: number;
  filesCreated: number;
  testsPassed: number;
  testsTotal: number;
  protectedModified: number;
}

export interface ExecutionData {
  summary: ExecutionSummaryData;
  timeline: TimelineEvent[];
  files: FileChange[];
  protectedFiles: ProtectedFile[];
  // Mutable flag flipped when user rolls back
  rolledBack?: boolean;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string; // ISO
  promptRef?: string;
  signals?: Signal[];
  review?: ReviewDecision;
  execution?: ExecutionData;
}

export interface CheckpointTarget {
  assistantMessageId: string;
  promptMessageId: string;
}
