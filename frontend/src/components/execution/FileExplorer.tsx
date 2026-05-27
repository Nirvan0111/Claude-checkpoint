import React from 'react';
import { FileChange, ProtectedFile } from '../../types';
import FileRow from './FileRow';

interface Props {
  files: FileChange[];
  selected: string | null;
  onSelect: (path: string) => void;
  protectedFiles?: ProtectedFile[];
}

export const FileExplorer: React.FC<Props> = ({
  files,
  selected,
  onSelect,
  protectedFiles = [],
}) => {
  const isLocked = (path: string) =>
    protectedFiles.some((p) => p.path === path && p.locked);

  return (
    <div className="flex flex-col gap-1" data-testid="file-explorer">
      {files.map((f) => (
        <FileRow
          key={f.path}
          file={f}
          selected={selected === f.path}
          locked={isLocked(f.path)}
          onSelect={() => onSelect(f.path)}
        />
      ))}
    </div>
  );
};

export default FileExplorer;
