import React, { useEffect, useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { Message, DecisionType, Signal } from '../types';
import SignalPill from './SignalPill';
import ActionBar from './ActionBar';
import ExecutionReviewPanel from './execution/ExecutionReviewPanel';

interface Props {
  open: boolean;
  prompt?: Message;
  output?: Message;
  onClose: () => void;
  onDecide: (decision: DecisionType, note?: string) => void;
  onRollback?: () => void;
  onToggleProtected?: (path: string) => void;
}

const PREPARE_MS = 650;

export const ReviewPanel: React.FC<Props> = ({
  open,
  prompt,
  output,
  onClose,
  onDecide,
  onRollback,
  onToggleProtected,
}) => {
  const [note, setNote] = useState('');
  const [showNoteFor, setShowNoteFor] = useState<DecisionType | null>(null);
  const [preparing, setPreparing] = useState(false);

  // Reset note state whenever target changes or panel closes
  useEffect(() => {
    setNote('');
    setShowNoteFor(null);
  }, [output?.id, open]);

  // Activation transition: brief "Preparing review session..." state on open
  useEffect(() => {
    if (!open) {
      setPreparing(false);
      return;
    }
    setPreparing(true);
    const t = window.setTimeout(() => setPreparing(false), PREPARE_MS);
    return () => window.clearTimeout(t);
  }, [open, output?.id]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const decision = output?.review?.decision ?? null;
  const signals: Signal[] = output?.signals ?? [];
  const execution = output?.execution;

  const handleDecide = (d: DecisionType) => {
    if (d === 'challenged') {
      if (showNoteFor === 'challenged') {
        onDecide('challenged', note.trim() || undefined);
        setShowNoteFor(null);
      } else {
        setShowNoteFor('challenged');
      }
      return;
    }
    onDecide(d);
  };

  return (
    <>
      {/* Backdrop — subtle */}
      <div
        className={`fixed inset-0 bg-ink-900/10 z-30 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden
        data-testid="checkpoint-backdrop"
      />

      {/* Side panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full md:w-[480px] bg-panel border-l border-line shadow-panel z-40 transform transition-transform duration-300 ease-out flex flex-col ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Checkpoint review panel"
        aria-hidden={!open}
        data-testid="checkpoint-panel"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-line-light flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-ink-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" strokeWidth={1.75} />
            </span>
            <div>
              <div className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium">
                Claude Checkpoint
              </div>
              <h2 className="font-serif text-lg text-ink-900 leading-tight">Review output</h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink-500 hover:text-ink-900 rounded-lg hover:bg-bubble transition-colors duration-200"
            aria-label="Close checkpoint"
            data-testid="checkpoint-close-button"
          >
            <X className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </header>

        {/* Activation transition */}
        {preparing ? (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3 px-6"
            data-testid="checkpoint-preparing"
          >
            <div className="flex items-center gap-1.5" aria-hidden>
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-400 inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-400 inline-block" />
              <span className="typing-dot w-1.5 h-1.5 rounded-full bg-ink-400 inline-block" />
            </div>
            <p className="font-serif text-[15px] text-ink-700">
              Preparing review session…
            </p>
          </div>
        ) : (
          <>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-7">
              {/* Original Prompt */}
              <section data-testid="checkpoint-section-prompt">
                <div className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium mb-2">
                  Original prompt
                </div>
                <div className="bg-bubble/70 border border-line-light rounded-xl px-4 py-3 text-[14px] text-ink-900 leading-relaxed whitespace-pre-wrap">
                  {prompt?.content ?? '—'}
                </div>
              </section>

              {/* Generated Output */}
              <section data-testid="checkpoint-section-output">
                <div className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium mb-2">
                  Generated output
                </div>
                <div className="border border-line-light rounded-xl px-4 py-3.5 text-[14px] text-ink-900 leading-[1.7] font-serif whitespace-pre-wrap max-h-44 overflow-y-auto">
                  {output?.content ?? '—'}
                </div>
              </section>

              {/* Execution Review (before evaluation signals) */}
              {execution && (
                <ExecutionReviewPanel
                  execution={execution}
                  decided={!!decision}
                  onToggleProtected={(p) => onToggleProtected?.(p)}
                />
              )}

              {/* Evaluation Signals */}
              <section data-testid="checkpoint-section-signals">
                <div className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium mb-2">
                  Evaluation signals
                </div>
                <p className="text-[12px] text-ink-500 mb-3 leading-relaxed">
                  A lightweight read of where this response may need attention.
                </p>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {signals.map((s, i) => (
                    <SignalPill key={`${s.kind}-${i}`} kind={s.kind} label={s.label} />
                  ))}
                </div>
                <ul className="space-y-2.5 mt-3">
                  {signals.map((s, i) => (
                    <li
                      key={`detail-${i}`}
                      className="text-[13px] text-ink-700 leading-relaxed pl-3 border-l-2 border-line-light"
                      data-testid={`signal-detail-${s.kind}`}
                    >
                      <span className="text-ink-900 font-medium">{s.label}:</span>{' '}
                      <span className="text-ink-500">{s.detail}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Challenge note input */}
              {showNoteFor === 'challenged' && !decision && (
                <section data-testid="checkpoint-section-note">
                  <label
                    className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium mb-2 block"
                    htmlFor="challenge-note"
                  >
                    What should Claude reconsider? (optional)
                  </label>
                  <textarea
                    id="challenge-note"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="e.g. The third paragraph contradicts an assumption I haven't made…"
                    className="w-full bg-white border border-line rounded-xl px-3.5 py-2.5 text-[14px] text-ink-900 placeholder:text-ink-400 focus:border-ink-900 focus:outline-none resize-none transition-colors"
                    data-testid="challenge-note-input"
                  />
                </section>
              )}
            </div>

            {/* Footer actions */}
            <footer className="px-6 py-5 border-t border-line-light bg-panel flex-shrink-0">
              <ActionBar
                onApprove={() => handleDecide('approved')}
                onReject={() => handleDecide('rejected')}
                onChallenge={() => handleDecide('challenged')}
                onRollback={execution ? onRollback : undefined}
                disabledDecision={decision}
                rolledBack={!!execution?.rolledBack}
              />
            </footer>
          </>
        )}
      </aside>
    </>
  );
};

export default ReviewPanel;
