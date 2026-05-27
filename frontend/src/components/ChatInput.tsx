import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  ArrowUp,
  ShieldCheck,
  Paperclip,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

interface Props {
  onSend: (text: string) => void;
  onActivateCheckpointHint?: () => void;
  onCancelArmed?: () => void;
  disabled?: boolean;
}

interface MenuItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  bestFor?: string;
  onClick?: () => void;
  testid: string;
  highlighted?: boolean;
  disabled?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon: Icon,
  title,
  description,
  bestFor,
  onClick,
  testid,
  highlighted,
  disabled,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left flex items-start gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 ${
      disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-bubble cursor-pointer'
    } ${highlighted ? 'bg-bubble/60 hover:bg-bubble' : ''}`}
    data-testid={testid}
  >
    <span
      className={`flex-shrink-0 mt-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${
        highlighted ? 'bg-ink-900 text-white' : 'bg-line-light text-ink-700'
      }`}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={1.75} />
    </span>
    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-medium text-ink-900 leading-snug">{title}</div>
      {description && (
        <div className="text-[12px] text-ink-500 leading-snug mt-0.5">{description}</div>
      )}
      {bestFor && (
        <div
          className="text-[11px] text-ink-400 leading-snug mt-1.5"
          data-testid={`${testid}-best-for`}
        >
          {bestFor}
        </div>
      )}
    </div>
  </button>
);

export const ChatInput: React.FC<Props> = ({
  onSend,
  onActivateCheckpointHint,
  onCancelArmed,
  disabled,
}) => {
  const [value, setValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [checkpointArmed, setCheckpointArmed] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 192) + 'px';
  }, [value]);

  // Click outside to close menu
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const handleSend = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
    if (checkpointArmed) {
      setCheckpointArmed(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-app via-app to-transparent pb-6 pt-10 px-4 z-30">
      <div className="relative w-full max-w-3xl mx-auto">
        {checkpointArmed && (
          <div
            className="flex items-center justify-between gap-2 mb-2 mx-1 px-3 py-1.5 rounded-lg bg-bubble/70 border border-line-light text-[12px] text-ink-700"
            data-testid="checkpoint-armed-banner"
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
              Checkpoint will open after Claude responds.
            </span>
            <button
              type="button"
              onClick={() => {
                setCheckpointArmed(false);
                onCancelArmed?.();
              }}
              className="text-ink-500 hover:text-ink-900 transition-colors text-[12px]"
              data-testid="checkpoint-armed-cancel"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="relative flex items-end gap-2 bg-white border border-line rounded-2xl p-2.5 shadow-sm focus-within:border-ink-900 transition-all duration-200">
          {/* + Action menu trigger */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="p-2 text-ink-500 hover:text-ink-900 rounded-xl hover:bg-bubble transition-colors flex-shrink-0"
              aria-label="Open action menu"
              data-testid="action-menu-trigger"
            >
              <Plus className="w-4 h-4" strokeWidth={1.75} />
            </button>

            {menuOpen && (
              <div
                className="absolute bottom-12 left-0 w-[300px] bg-white border border-line rounded-2xl shadow-panel p-1.5 z-40"
                data-testid="action-menu"
              >
                <MenuItem
                  icon={ShieldCheck}
                  title="Claude Checkpoint"
                  description="Review assumptions, context gaps and verification needs before acting on important outputs."
                  bestFor="Best for coding, research and planning tasks."
                  highlighted
                  onClick={() => {
                    setCheckpointArmed(true);
                    setMenuOpen(false);
                    onActivateCheckpointHint?.();
                    textareaRef.current?.focus();
                  }}
                  testid="action-menu-checkpoint"
                />
                <div className="h-px bg-line-light my-1.5" />
                <MenuItem
                  icon={Paperclip}
                  title="Attach files"
                  description="Add documents to ground the conversation."
                  disabled
                  testid="action-menu-attach"
                />
                <MenuItem
                  icon={ImageIcon}
                  title="Add image"
                  description="Share an image for Claude to analyze."
                  disabled
                  testid="action-menu-image"
                />
                <MenuItem
                  icon={Sparkles}
                  title="Style preset"
                  description="Apply a tone or format template."
                  disabled
                  testid="action-menu-style"
                />
              </div>
            )}
          </div>

          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Claude"
            rows={1}
            className="w-full bg-transparent border-none focus:ring-0 focus:outline-none resize-none py-2 px-1 text-[15px] max-h-48 text-ink-900 placeholder:text-ink-400"
            data-testid="chat-input-textarea"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="p-2 text-white bg-ink-900 hover:bg-ink-700 rounded-xl transition-colors flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Send"
            data-testid="chat-send-button"
          >
            <ArrowUp className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        <p className="text-[11px] text-ink-400 text-center mt-2">
          For important outputs, use Checkpoint to review assumptions and verification needs.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
