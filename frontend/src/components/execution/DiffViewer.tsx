import React from 'react';
import { FileChange } from '../../types';
import ChangeSummary from './ChangeSummary';
import DiffSection from './DiffSection';

interface Props {
  file: FileChange;
}

export const DiffViewer: React.FC<Props> = ({ file }) => {
  return (
    <div className="space-y-3" data-testid={`diff-viewer-${file.path}`}>
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div className="font-mono text-[13px] text-ink-900">{file.path}</div>
        <div className="text-[11px] tabular-nums">
          <span className="text-[#166534]">+{file.additions} additions</span>
          <span className="text-ink-400 mx-1.5">·</span>
          <span className="text-[#991B1B]">-{file.deletions} deletions</span>
        </div>
      </div>
      <ChangeSummary bullets={file.summary} />
      <div className="space-y-2">
        {file.hunks.map((h, i) => (
          <DiffSection key={i} hunk={h} />
        ))}
      </div>
    </div>
  );
};

export default DiffViewer;
