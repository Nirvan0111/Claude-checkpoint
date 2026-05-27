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
    <div className="space-y-2" data-testid="protected-files-panel">
      <p
        className="text-[12px] text-ink-500 leading-relaxed"
        data-testid="protected-files-help"
      >
        Locked files cannot be modified during this review session. Switching a
        file to <span className="text-ink-700 font-medium">Editable</span> lets
        the next run touch it.
      </p>

      {files.map((f) => {
        const locked = f.locked;
        return (
          <div
            key={f.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${
              locked ? 'bg-bubble/50 border-line-light' : 'bg-white border-line-light'
            }`}
            data-testid={`protected-file-${f.path}`}
          >
            <span
              className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center border ${
                locked
                  ? 'bg-white border-line text-ink-900'
                  : 'bg-line-light border-line-light text-ink-500'
              }`}
              aria-hidden
            >
              {locked ? (
                <Lock className="w-3.5 h-3.5" strokeWidth={1.75} />
              ) : (
                <Unlock className="w-3.5 h-3.5" strokeWidth={1.75} />
              )}
            </span>

            <div className="flex-1 min-w-0">
              <div className="font-mono text-[12.5px] text-ink-900 truncate">
                {f.path}
              </div>
              <div
                className={`text-[11px] mt-0.5 leading-snug ${
                  locked ? 'text-ink-500' : 'text-[#9A3412]'
                }`}
                data-testid={`protected-state-${f.path}`}
              >
                {locked
                  ? 'Locked · cannot be modified during this review session.'
                  : f.wasTouched
                    ? 'Editable · was modified in this run.'
                    : 'Editable · may be modified by future runs.'}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggle(f.path)}
              disabled={disabled}
              aria-pressed={locked}
              className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors duration-200 ${
                locked
                  ? 'bg-ink-900 text-white border-ink-900 hover:bg-ink-700'
                  : 'bg-white text-ink-700 border-line hover:bg-bubble'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              data-testid={`protected-toggle-${f.path}`}
            >
              {locked ? (
                <>
                  <Lock className="w-3 h-3" strokeWidth={2} />
                  Locked
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3" strokeWidth={2} />
                  Editable
                </>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ProtectedFilesPanel;
