import React from 'react';
import { Lock, Unlock } from 'lucide-react';
import { ProtectedFile } from '../../types';

interface Props {
  files: ProtectedFile[];
  onToggle: (path: string) => void;
  disabled?: boolean;
}

export const ProtectedFilesPanel: React.FC<Props> = ({ files, onToggle, disabled }) => {
  return (
    <div className="space-y-1.5" data-testid="protected-files-panel">
      {files.map((f) => (
        <div
          key={f.path}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg border ${
            f.locked
              ? 'bg-bubble/60 border-line-light'
              : 'bg-white border-line-light'
          }`}
          data-testid={`protected-file-${f.path}`}
        >
          <button
            type="button"
            role="switch"
            aria-checked={f.locked}
            onClick={() => onToggle(f.path)}
            disabled={disabled}
            className={`relative w-8 h-[18px] rounded-full transition-colors duration-200 flex-shrink-0 ${
              f.locked ? 'bg-ink-900' : 'bg-line'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            data-testid={`protected-toggle-${f.path}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200 ${
                f.locked ? 'translate-x-[14px]' : 'translate-x-0'
              }`}
            />
          </button>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[12.5px] text-ink-900 truncate">{f.path}</div>
            {f.wasTouched && !f.locked && (
              <div className="text-[11px] text-[#9A3412] mt-0.5">
                Modified in this run
              </div>
            )}
          </div>
          {f.locked ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-500">
              <Lock className="w-3 h-3" strokeWidth={1.75} />
              Locked
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-ink-400">
              <Unlock className="w-3 h-3" strokeWidth={1.75} />
              Unlocked
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProtectedFilesPanel;
