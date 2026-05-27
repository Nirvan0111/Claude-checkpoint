import React from 'react';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { FileChange, FileStatus } from '../../types';

interface Props {
  file: FileChange;
  selected?: boolean;
  onSelect: () => void;
  locked?: boolean;
}

const STATUS_ICON: Record<FileStatus, React.ElementType> = {
  modified: Pencil,
  created: Plus,
  deleted: Trash2,
};

const STATUS_ACCENT: Record<FileStatus, string> = {
  modified: 'text-[#854D0E] bg-[#FEFCE8] border-[#FEF08A]',
  created: 'text-[#166534] bg-[#F0FDF4] border-[#BBF7D0]',
  deleted: 'text-[#991B1B] bg-[#FEF2F2] border-[#FECACA]',
};

const STATUS_LABEL: Record<FileStatus, string> = {
  modified: 'modified',
  created: 'created',
  deleted: 'deleted',
};

export const FileRow: React.FC<Props> = ({ file, selected, onSelect, locked }) => {
  const Icon = STATUS_ICON[file.status];
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={locked}
      className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
        selected
          ? 'bg-bubble border border-line'
          : 'bg-white border border-transparent hover:bg-bubble/60'
      } ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
      data-testid={`file-row-${file.path}`}
      aria-pressed={selected}
    >
      <FileText className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" strokeWidth={1.75} />
      <span className="font-mono text-[12.5px] text-ink-900 truncate flex-1">{file.path}</span>
      <span
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${STATUS_ACCENT[file.status]}`}
      >
        <Icon className="w-2.5 h-2.5" strokeWidth={2} />
        {STATUS_LABEL[file.status]}
      </span>
      <span className="text-[10px] text-ink-400 tabular-nums w-14 text-right">
        <span className="text-[#166534]">+{file.additions}</span>{' '}
        <span className="text-[#991B1B]">-{file.deletions}</span>
      </span>
    </button>
  );
};

export default FileRow;
