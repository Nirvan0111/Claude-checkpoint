import React from 'react';
import { ExecutionSummaryData } from '../../types';

interface Props {
  data: ExecutionSummaryData;
}

const Item: React.FC<{ value: number | string; label: string; testid: string }> = ({
  value,
  label,
  testid,
}) => (
  <span className="inline-flex items-baseline gap-1.5" data-testid={testid}>
    <span className="font-medium text-ink-900 tabular-nums">{value}</span>
    <span className="text-ink-500">{label}</span>
  </span>
);

const Separator: React.FC = () => (
  <span aria-hidden className="text-ink-400">·</span>
);

export const ExecutionSummary: React.FC<Props> = ({ data }) => {
  const { filesChanged, filesCreated, testsPassed, protectedModified } = data;
  return (
    <div
      className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] leading-relaxed"
      data-testid="execution-summary"
    >
      <Item
        value={filesChanged}
        label={filesChanged === 1 ? 'file changed' : 'files changed'}
        testid="summary-files-changed"
      />
      <Separator />
      <Item
        value={filesCreated}
        label={filesCreated === 1 ? 'file created' : 'files created'}
        testid="summary-files-created"
      />
      <Separator />
      <Item
        value={testsPassed}
        label={testsPassed === 1 ? 'test passed' : 'tests passed'}
        testid="summary-tests-passed"
      />
      <Separator />
      <Item
        value={protectedModified}
        label="protected files modified"
        testid="summary-protected-modified"
      />
    </div>
  );
};

export default ExecutionSummary;
