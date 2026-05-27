import React from 'react';
import { DiffHunk, DiffLine } from '../../types';

interface Props {
  hunk: DiffHunk;
}

const LINE_STYLES: Record<DiffLine['kind'], string> = {
  add: 'bg-[#F0FDF4] text-[#166534]',
  remove: 'bg-[#FEF2F2] text-[#991B1B]',
  modified: 'bg-[#FFFBEB] text-[#854D0E]',
  context: 'bg-transparent text-ink-700',
};

const LINE_GUTTER: Record<DiffLine['kind'], string> = {
  add: '+',
  remove: '-',
  modified: '~',
  context: ' ',
};

export const DiffSection: React.FC<Props> = ({ hunk }) => {
  return (
    <div
      className="border border-line-light rounded-xl overflow-hidden"
      data-testid="diff-section"
    >
      <div className="px-3 py-1.5 bg-bubble/70 border-b border-line-light font-mono text-[11px] text-ink-500">
        {hunk.header}
      </div>
      <pre className="font-mono text-[12px] leading-[1.55] overflow-x-auto">
        {hunk.lines.map((line, idx) => (
          <div
            key={idx}
            className={`flex ${LINE_STYLES[line.kind]}`}
            data-testid={`diff-line-${line.kind}`}
          >
            <span className="select-none w-10 text-right pr-2 tabular-nums text-ink-400 flex-shrink-0">
              {line.oldLine ?? ''}
            </span>
            <span className="select-none w-10 text-right pr-2 tabular-nums text-ink-400 flex-shrink-0">
              {line.newLine ?? ''}
            </span>
            <span className="select-none w-5 text-center text-ink-400 flex-shrink-0">
              {LINE_GUTTER[line.kind]}
            </span>
            <span className="whitespace-pre flex-1 pr-3">{line.content || ' '}</span>
          </div>
        ))}
      </pre>
    </div>
  );
};

export default DiffSection;
