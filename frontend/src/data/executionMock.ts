import {
  DiffHunk,
  ExecutionData,
  ExecutionSummaryData,
  FileChange,
  ProtectedFile,
  TimelineEvent,
} from '../types';

// Three deterministic execution scenarios. Selection by prompt char-sum so
// the same prompt always shows the same execution payload.

function fmt(d: Date): string {
  return d.toTimeString().slice(0, 8); // HH:MM:SS
}

function buildTimeline(base: Date, events: Array<Omit<TimelineEvent, 'id' | 'time'>>): TimelineEvent[] {
  return events.map((e, i) => {
    const t = new Date(base.getTime() + i * 1400);
    return {
      id: `${i}-${e.action}-${e.target}`,
      time: fmt(t),
      ...e,
    };
  });
}

// ---------- Scenario A: Auth refactor ----------

const AUTH_HUNKS: Record<string, DiffHunk[]> = {
  'auth.py': [
    {
      header: '@@ -8,12 +8,15 @@ class AuthService:',
      lines: [
        { kind: 'context', oldLine: 8, newLine: 8, content: 'class AuthService:' },
        { kind: 'context', oldLine: 9, newLine: 9, content: '    def __init__(self, settings):' },
        { kind: 'context', oldLine: 10, newLine: 10, content: '        self.settings = settings' },
        { kind: 'remove', oldLine: 11, content: '        self.token_ttl = 3600' },
        { kind: 'add', newLine: 11, content: '        self.token_ttl = settings.session_ttl_seconds' },
        { kind: 'add', newLine: 12, content: '        self.validator = TokenValidator(settings)' },
        { kind: 'context', oldLine: 12, newLine: 13, content: '' },
        { kind: 'context', oldLine: 13, newLine: 14, content: '    def issue(self, user_id: str) -> str:' },
        { kind: 'remove', oldLine: 14, content: '        # local duplicate check' },
        { kind: 'remove', oldLine: 15, content: '        if self._already_active(user_id):' },
        { kind: 'remove', oldLine: 16, content: '            raise AuthError("active session exists")' },
        { kind: 'add', newLine: 15, content: '        self.validator.assert_no_active_session(user_id)' },
        { kind: 'context', oldLine: 17, newLine: 16, content: '        return self._build_token(user_id)' },
      ],
    },
  ],
  'session.py': [
    {
      header: '@@ -22,6 +22,10 @@ def expires_at(session):',
      lines: [
        { kind: 'context', oldLine: 22, newLine: 22, content: 'def expires_at(session):' },
        { kind: 'remove', oldLine: 23, content: '    return session.created_at + timedelta(hours=1)' },
        { kind: 'add', newLine: 23, content: '    ttl = session.ttl_override or DEFAULT_TTL' },
        { kind: 'add', newLine: 24, content: '    return session.created_at + timedelta(seconds=ttl)' },
        { kind: 'context', oldLine: 24, newLine: 25, content: '' },
        { kind: 'add', newLine: 26, content: 'def is_expired(session, now=None):' },
        { kind: 'add', newLine: 27, content: '    now = now or datetime.now(timezone.utc)' },
        { kind: 'add', newLine: 28, content: '    return now >= expires_at(session)' },
      ],
    },
  ],
  'auth_utils.py': [
    {
      header: '@@ -0,0 +1,18 @@',
      lines: [
        { kind: 'add', newLine: 1, content: '"""Centralised token validation helpers."""' },
        { kind: 'add', newLine: 2, content: 'from dataclasses import dataclass' },
        { kind: 'add', newLine: 3, content: 'from typing import Optional' },
        { kind: 'add', newLine: 4, content: '' },
        { kind: 'add', newLine: 5, content: '@dataclass' },
        { kind: 'add', newLine: 6, content: 'class TokenValidator:' },
        { kind: 'add', newLine: 7, content: '    settings: object' },
        { kind: 'add', newLine: 8, content: '' },
        { kind: 'add', newLine: 9, content: '    def assert_no_active_session(self, user_id: str) -> None:' },
        { kind: 'add', newLine: 10, content: '        active = self._lookup_active(user_id)' },
        { kind: 'add', newLine: 11, content: '        if active is not None:' },
        { kind: 'add', newLine: 12, content: '            raise AuthError("active session exists")' },
        { kind: 'add', newLine: 13, content: '' },
        { kind: 'add', newLine: 14, content: '    def _lookup_active(self, user_id: str) -> Optional[str]:' },
        { kind: 'add', newLine: 15, content: '        # delegate to storage layer' },
        { kind: 'add', newLine: 16, content: '        return self.settings.store.find_active(user_id)' },
      ],
    },
  ],
  'test_auth.py': [
    {
      header: '@@ -40,3 +40,11 @@ def test_issue_succeeds():',
      lines: [
        { kind: 'context', oldLine: 40, newLine: 40, content: 'def test_issue_succeeds():' },
        { kind: 'context', oldLine: 41, newLine: 41, content: '    svc = AuthService(settings)' },
        { kind: 'context', oldLine: 42, newLine: 42, content: '    assert svc.issue("u1")' },
        { kind: 'add', newLine: 43, content: '' },
        { kind: 'add', newLine: 44, content: 'def test_issue_blocks_duplicate():' },
        { kind: 'add', newLine: 45, content: '    settings.store.find_active.return_value = "old"' },
        { kind: 'add', newLine: 46, content: '    svc = AuthService(settings)' },
        { kind: 'add', newLine: 47, content: '    with pytest.raises(AuthError):' },
        { kind: 'add', newLine: 48, content: '        svc.issue("u1")' },
      ],
    },
  ],
};

const AUTH_FILES: FileChange[] = [
  {
    path: 'auth.py',
    status: 'modified',
    additions: 6,
    deletions: 4,
    summary: [
      'Replaced hard-coded token TTL with the value from settings.',
      'Delegated duplicate-session detection to TokenValidator.',
      'Removed inline duplicate-session check now handled centrally.',
    ],
    hunks: AUTH_HUNKS['auth.py'],
  },
  {
    path: 'session.py',
    status: 'modified',
    additions: 5,
    deletions: 1,
    summary: [
      'Honoured per-session TTL override when computing expiration.',
      'Added is_expired() helper for callers that only need a boolean.',
    ],
    hunks: AUTH_HUNKS['session.py'],
  },
  {
    path: 'auth_utils.py',
    status: 'created',
    additions: 16,
    deletions: 0,
    summary: [
      'Introduced TokenValidator as the single point for active-session checks.',
      'Encapsulated storage lookup so AuthService no longer reaches into the store directly.',
    ],
    hunks: AUTH_HUNKS['auth_utils.py'],
  },
  {
    path: 'test_auth.py',
    status: 'modified',
    additions: 6,
    deletions: 0,
    summary: [
      'Added coverage for the duplicate-session rejection path.',
    ],
    hunks: AUTH_HUNKS['test_auth.py'],
  },
];

const AUTH_PROTECTED: ProtectedFile[] = [
  { path: '.env', locked: true },
  { path: 'config.py', locked: true },
  { path: 'auth.py', locked: false, wasTouched: true },
];

const AUTH_TIMELINE_INPUT: Array<Omit<TimelineEvent, 'id' | 'time'>> = [
  { action: 'read', target: 'auth.py', description: 'Read current AuthService implementation.' },
  { action: 'read', target: 'session.py', description: 'Read session expiration helpers.' },
  { action: 'analyzed', target: 'session.py', description: 'Identified duplicate logic between AuthService and session module.' },
  { action: 'modified', target: 'auth.py', description: 'Refactored AuthService to delegate validation.' },
  { action: 'created', target: 'auth_utils.py', description: 'Added centralised TokenValidator helper.' },
  { action: 'modified', target: 'session.py', description: 'Honoured per-session TTL override and added is_expired().' },
  { action: 'modified', target: 'test_auth.py', description: 'Extended tests to cover duplicate-session rejection.' },
  { action: 'tests', target: 'pytest', description: 'Ran 7 tests · 7 passed · 0 failed.' },
];

// ---------- Scenario B: Data pipeline ----------

const PIPE_HUNKS: Record<string, DiffHunk[]> = {
  'etl.py': [
    {
      header: '@@ -14,8 +14,11 @@ def run_pipeline(source):',
      lines: [
        { kind: 'context', oldLine: 14, newLine: 14, content: 'def run_pipeline(source):' },
        { kind: 'remove', oldLine: 15, content: '    rows = list(source)' },
        { kind: 'add', newLine: 15, content: '    rows = list(stream_in_batches(source, batch_size=500))' },
        { kind: 'context', oldLine: 16, newLine: 16, content: '    cleaned = transform(rows)' },
        { kind: 'add', newLine: 17, content: '    validate(cleaned, schema=PIPELINE_SCHEMA)' },
        { kind: 'context', oldLine: 17, newLine: 18, content: '    return load(cleaned)' },
      ],
    },
  ],
  'transformer.py': [
    {
      header: '@@ -3,5 +3,8 @@ def transform(rows):',
      lines: [
        { kind: 'context', oldLine: 3, newLine: 3, content: 'def transform(rows):' },
        { kind: 'remove', oldLine: 4, content: '    return [normalise(r) for r in rows]' },
        { kind: 'add', newLine: 4, content: '    cleaned = (normalise(r) for r in rows)' },
        { kind: 'add', newLine: 5, content: '    deduped = drop_duplicates(cleaned, key="external_id")' },
        { kind: 'add', newLine: 6, content: '    return list(deduped)' },
      ],
    },
  ],
  'schema.py': [
    {
      header: '@@ -0,0 +1,8 @@',
      lines: [
        { kind: 'add', newLine: 1, content: 'PIPELINE_SCHEMA = {' },
        { kind: 'add', newLine: 2, content: '    "external_id": str,' },
        { kind: 'add', newLine: 3, content: '    "amount": float,' },
        { kind: 'add', newLine: 4, content: '    "occurred_at": "datetime",' },
        { kind: 'add', newLine: 5, content: '}' },
      ],
    },
  ],
  'test_etl.py': [
    {
      header: '@@ -10,2 +10,8 @@ def test_run_pipeline():',
      lines: [
        { kind: 'context', oldLine: 10, newLine: 10, content: 'def test_run_pipeline():' },
        { kind: 'context', oldLine: 11, newLine: 11, content: '    assert run_pipeline(SAMPLE) == EXPECTED' },
        { kind: 'add', newLine: 12, content: '' },
        { kind: 'add', newLine: 13, content: 'def test_dedupes_external_id():' },
        { kind: 'add', newLine: 14, content: '    out = run_pipeline(DUPES)' },
        { kind: 'add', newLine: 15, content: '    assert len({r["external_id"] for r in out}) == len(out)' },
      ],
    },
  ],
};

const PIPE_FILES: FileChange[] = [
  {
    path: 'etl.py',
    status: 'modified',
    additions: 3,
    deletions: 1,
    summary: [
      'Switched the source ingestion to batched streaming to avoid loading large inputs into memory.',
      'Added schema validation before loading.',
    ],
    hunks: PIPE_HUNKS['etl.py'],
  },
  {
    path: 'transformer.py',
    status: 'modified',
    additions: 3,
    deletions: 1,
    summary: [
      'Normalised rows lazily and deduplicated by external_id.',
    ],
    hunks: PIPE_HUNKS['transformer.py'],
  },
  {
    path: 'schema.py',
    status: 'created',
    additions: 6,
    deletions: 0,
    summary: [
      'Introduced a single source of truth for the pipeline schema.',
    ],
    hunks: PIPE_HUNKS['schema.py'],
  },
  {
    path: 'test_etl.py',
    status: 'modified',
    additions: 4,
    deletions: 0,
    summary: [
      'Added a regression test for external_id deduplication.',
    ],
    hunks: PIPE_HUNKS['test_etl.py'],
  },
];

const PIPE_PROTECTED: ProtectedFile[] = [
  { path: '.env', locked: true },
  { path: 'pipeline_config.yaml', locked: true },
  { path: 'etl.py', locked: false, wasTouched: true },
];

const PIPE_TIMELINE_INPUT: Array<Omit<TimelineEvent, 'id' | 'time'>> = [
  { action: 'read', target: 'etl.py', description: 'Read the existing pipeline entry point.' },
  { action: 'read', target: 'transformer.py', description: 'Reviewed the row transformer.' },
  { action: 'analyzed', target: 'etl.py', description: 'Detected unbounded memory growth on large sources.' },
  { action: 'modified', target: 'etl.py', description: 'Adopted batched streaming and schema validation.' },
  { action: 'modified', target: 'transformer.py', description: 'Made normalisation lazy and added deduping.' },
  { action: 'created', target: 'schema.py', description: 'Added a centralised schema definition.' },
  { action: 'modified', target: 'test_etl.py', description: 'Added regression test for external_id dedupe.' },
  { action: 'tests', target: 'pytest', description: 'Ran 9 tests · 9 passed · 0 failed.' },
];

// ---------- Scenario C: API endpoint ----------

const API_HUNKS: Record<string, DiffHunk[]> = {
  'routes.py': [
    {
      header: '@@ -18,4 +18,8 @@ def create_order():',
      lines: [
        { kind: 'context', oldLine: 18, newLine: 18, content: 'def create_order():' },
        { kind: 'remove', oldLine: 19, content: '    data = request.get_json()' },
        { kind: 'add', newLine: 19, content: '    data = OrderIn.parse_obj(request.get_json())' },
        { kind: 'context', oldLine: 20, newLine: 20, content: '    order = orders.create(data)' },
        { kind: 'add', newLine: 21, content: '    audit.record("order.created", order.id)' },
        { kind: 'context', oldLine: 21, newLine: 22, content: '    return jsonify(order.dict())' },
      ],
    },
  ],
  'models.py': [
    {
      header: '@@ -6,3 +6,9 @@ class Order(BaseModel):',
      lines: [
        { kind: 'context', oldLine: 6, newLine: 6, content: 'class Order(BaseModel):' },
        { kind: 'context', oldLine: 7, newLine: 7, content: '    id: str' },
        { kind: 'context', oldLine: 8, newLine: 8, content: '    amount: float' },
        { kind: 'add', newLine: 9, content: '' },
        { kind: 'add', newLine: 10, content: 'class OrderIn(BaseModel):' },
        { kind: 'add', newLine: 11, content: '    amount: float' },
        { kind: 'add', newLine: 12, content: '    customer_id: str' },
      ],
    },
  ],
  'validators.py': [
    {
      header: '@@ -0,0 +1,6 @@',
      lines: [
        { kind: 'add', newLine: 1, content: 'def validate_amount(value: float) -> float:' },
        { kind: 'add', newLine: 2, content: '    if value <= 0:' },
        { kind: 'add', newLine: 3, content: '        raise ValueError("amount must be positive")' },
        { kind: 'add', newLine: 4, content: '    return round(value, 2)' },
      ],
    },
  ],
  'test_routes.py': [
    {
      header: '@@ -22,3 +22,9 @@ def test_create_order_ok():',
      lines: [
        { kind: 'context', oldLine: 22, newLine: 22, content: 'def test_create_order_ok():' },
        { kind: 'context', oldLine: 23, newLine: 23, content: '    resp = client.post("/orders", json=VALID)' },
        { kind: 'context', oldLine: 24, newLine: 24, content: '    assert resp.status_code == 200' },
        { kind: 'add', newLine: 25, content: '' },
        { kind: 'add', newLine: 26, content: 'def test_create_order_rejects_negative():' },
        { kind: 'add', newLine: 27, content: '    resp = client.post("/orders", json={**VALID, "amount": -1})' },
        { kind: 'add', newLine: 28, content: '    assert resp.status_code == 422' },
      ],
    },
  ],
};

const API_FILES: FileChange[] = [
  {
    path: 'routes.py',
    status: 'modified',
    additions: 3,
    deletions: 1,
    summary: [
      'Validated input with OrderIn schema before creating an order.',
      'Recorded an audit event on order creation.',
    ],
    hunks: API_HUNKS['routes.py'],
  },
  {
    path: 'models.py',
    status: 'modified',
    additions: 4,
    deletions: 0,
    summary: [
      'Added OrderIn, the request-only schema separating wire data from domain model.',
    ],
    hunks: API_HUNKS['models.py'],
  },
  {
    path: 'validators.py',
    status: 'created',
    additions: 4,
    deletions: 0,
    summary: [
      'Introduced a shared amount validator used by request schemas.',
    ],
    hunks: API_HUNKS['validators.py'],
  },
  {
    path: 'test_routes.py',
    status: 'modified',
    additions: 4,
    deletions: 0,
    summary: [
      'Added a regression test for rejection of negative amounts.',
    ],
    hunks: API_HUNKS['test_routes.py'],
  },
];

const API_PROTECTED: ProtectedFile[] = [
  { path: '.env', locked: true },
  { path: 'settings.py', locked: true },
  { path: 'routes.py', locked: false, wasTouched: true },
];

const API_TIMELINE_INPUT: Array<Omit<TimelineEvent, 'id' | 'time'>> = [
  { action: 'read', target: 'routes.py', description: 'Read the orders router.' },
  { action: 'read', target: 'models.py', description: 'Reviewed the existing Order schema.' },
  { action: 'analyzed', target: 'routes.py', description: 'Found missing input validation on create-order.' },
  { action: 'modified', target: 'routes.py', description: 'Wired OrderIn validation and audit event.' },
  { action: 'modified', target: 'models.py', description: 'Added OrderIn request schema.' },
  { action: 'created', target: 'validators.py', description: 'Added shared validate_amount helper.' },
  { action: 'modified', target: 'test_routes.py', description: 'Extended tests to cover negative amount rejection.' },
  { action: 'tests', target: 'pytest', description: 'Ran 6 tests · 6 passed · 0 failed.' },
];

// ---------- Composition ----------

interface Scenario {
  files: FileChange[];
  protectedFiles: ProtectedFile[];
  timelineInput: Array<Omit<TimelineEvent, 'id' | 'time'>>;
  testsPassed: number;
  testsTotal: number;
}

const SCENARIOS: Scenario[] = [
  {
    files: AUTH_FILES,
    protectedFiles: AUTH_PROTECTED,
    timelineInput: AUTH_TIMELINE_INPUT,
    testsPassed: 7,
    testsTotal: 7,
  },
  {
    files: PIPE_FILES,
    protectedFiles: PIPE_PROTECTED,
    timelineInput: PIPE_TIMELINE_INPUT,
    testsPassed: 9,
    testsTotal: 9,
  },
  {
    files: API_FILES,
    protectedFiles: API_PROTECTED,
    timelineInput: API_TIMELINE_INPUT,
    testsPassed: 6,
    testsTotal: 6,
  },
];

function computeSummary(scenario: Scenario): ExecutionSummaryData {
  const filesChanged = scenario.files.filter((f) => f.status === 'modified').length;
  const filesCreated = scenario.files.filter((f) => f.status === 'created').length;
  const protectedModified = 0; // none in the mock scenarios
  return {
    filesChanged,
    filesCreated,
    testsPassed: scenario.testsPassed,
    testsTotal: scenario.testsTotal,
    protectedModified,
  };
}

export function generateMockExecution(seed: string): ExecutionData {
  const sum = Array.from(seed).reduce((a, c) => a + c.charCodeAt(0), 0);
  const scenario = SCENARIOS[sum % SCENARIOS.length];
  // Anchor timeline at a stable wall-clock minute so timestamps look real
  // but stay deterministic per-seed.
  const base = new Date();
  base.setSeconds(0, 0);
  // Spread by seed so different prompts produce different timestamps.
  base.setSeconds(sum % 50);
  return {
    summary: computeSummary(scenario),
    timeline: buildTimeline(base, scenario.timelineInput),
    files: scenario.files.map((f) => ({ ...f })),
    protectedFiles: scenario.protectedFiles.map((p) => ({ ...p })),
  };
}
