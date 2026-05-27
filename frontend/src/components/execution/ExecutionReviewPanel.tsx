import React, { useMemo, useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { ExecutionData } from '../../types';
import ExecutionSummary from './ExecutionSummary';
import ActivityTimeline from './ActivityTimeline';
import FileExplorer from './FileExplorer';
import DiffViewer from './DiffViewer';
import ProtectedFilesPanel from './ProtectedFilesPanel';

interface Props {
  execution: ExecutionData;
  decided: boolean;
  onToggleProtected: (path: string) => void;
}

const SectionHeader: React.FC<{ children: React.ReactNode; testid: string }> = ({
  children,
  testid,
}) => (
  <div
    className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium mb-2"
    data-testid={testid}
  >
    {children}
  </div>
);

const Collapsible: React.FC<{
  title: string;
  testid: string;
  defaultOpen?: boolean;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, testid, defaultOpen = true, rightSlot, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div data-testid={testid}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 mb-2 group"
        data-testid={`${testid}-toggle`}
      >
        <SectionHeader testid={`${testid}-header`}>{title}</SectionHeader>
        <div className="flex items-center gap-2">
          {rightSlot}
          <ChevronDown
            className={`w-3.5 h-3.5 text-ink-400 transition-transform duration-200 ${
              open ? 'rotate-0' : '-rotate-90'
            }`}
            strokeWidth={1.75}
          />
        </div>
      </button>
      {open && <div className="space-y-2">{children}</div>}
    </div>
  );
};

export const ExecutionReviewPanel: React.FC<Props> = ({
  execution,
  decided,
  onToggleProtected,
}) => {
  const firstModifiable = useMemo(() => {
    const lockedPaths = new Set(
      execution.protectedFiles.filter((p) => p.locked).map((p) => p.path)
    );
    return execution.files.find((f) => !lockedPaths.has(f.path))?.path ?? null;
  }, [execution]);

  const [selectedPath, setSelectedPath] = useState<string | null>(firstModifiable);

  const selectedFile = useMemo(
    () => execution.files.find((f) => f.path === selectedPath) ?? null,
    [execution, selectedPath]
  );

  return (
    <section className="space-y-7" data-testid="execution-review">
      {/* Title row */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-ink-500" strokeWidth={1.75} />
        <h3 className="font-serif text-[16px] text-ink-900 leading-none">
          Execution Review
        </h3>
        {execution.rolledBack && (
          <span
            className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-bubble text-[10px] uppercase tracking-[0.08em] text-ink-500 font-medium"
            data-testid="execution-rolled-back-flag"
          >
            Rolled back
          </span>
        )}
      </div>

      {/* Summary */}
      <div>
        <SectionHeader testid="execution-summary-header">Execution summary</SectionHeader>
        <ExecutionSummary data={execution.summary} />
      </div>

      {/* Timeline */}
      <Collapsible title="Activity timeline" testid="activity-timeline-section">
        <ActivityTimeline events={execution.timeline} />
      </Collapsible>

      {/* File explorer */}
      <Collapsible title="File changes" testid="file-changes-section">
        <FileExplorer
          files={execution.files}
          selected={selectedPath}
          onSelect={(p) => setSelectedPath((cur) => (cur === p ? null : p))}
          protectedFiles={execution.protectedFiles}
        />
        {selectedFile && (
          <div className="pt-4 mt-2 border-t border-line-light">
            <DiffViewer file={selectedFile} />
          </div>
        )}
      </Collapsible>

      {/* Protected files */}
      <Collapsible title="Protected files" testid="protected-files-section">
        <ProtectedFilesPanel
          files={execution.protectedFiles}
          onToggle={onToggleProtected}
          disabled={decided}
        />
      </Collapsible>
    </section>
  );
};

export default ExecutionReviewPanel;
