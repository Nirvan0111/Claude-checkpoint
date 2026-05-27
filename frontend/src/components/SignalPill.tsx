import React from 'react';
import { SignalKind } from '../types';
import { Lightbulb, FileQuestion, ShieldAlert, BookOpenCheck } from 'lucide-react';

interface Props {
  kind: SignalKind;
  label: string;
  className?: string;
  size?: 'sm' | 'xs';
  /** Optional plain-text title for screen readers / native fallback. */
  title?: string;
  /** Rich hover/focus tooltip body. If provided, replaces native `title`. */
  detail?: string;
  /** Phrases that triggered this signal — rendered as small chips in tooltip. */
  triggers?: string[];
}

const KIND_STYLES: Record<SignalKind, string> = {
  assumption: 'bg-[#FFF6ED] text-[#9A3412] border-[#FED7AA]',
  context: 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]',
  verification: 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]',
  source: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
};

const KIND_ICON: Record<SignalKind, React.ElementType> = {
  assumption: Lightbulb,
  context: FileQuestion,
  verification: ShieldAlert,
  source: BookOpenCheck,
};

// One-line "why this fired" copy per kind. Kept generic so it complements the
// detail string without repeating it.
const KIND_REASON: Record<SignalKind, string> = {
  assumption: 'Triggered by hedging or recommendation-oriented language in this section.',
  context: 'Triggered because key context appears missing from the prompt.',
  verification: 'Triggered because this section contains a technical or operational claim.',
  source: 'Triggered because supporting reference material is available.',
};

export const SignalPill: React.FC<Props> = ({
  kind,
  label,
  className,
  size = 'sm',
  title,
  detail,
  triggers,
}) => {
  const Icon = KIND_ICON[kind];
  const sizeClass =
    size === 'xs'
      ? 'px-1.5 py-0.5 text-[10px] gap-1'
      : 'px-2.5 py-1 text-[11px] gap-1.5';
  const iconClass = size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  const hasRichTooltip = !!detail || (triggers && triggers.length > 0);

  // Accessible label combines kind + a compact reason for screen readers.
  // When no rich tooltip is provided, fall back to the plain `title` prop.
  const a11yLabel = hasRichTooltip
    ? `${label}. ${KIND_REASON[kind]}${triggers && triggers.length > 0 ? ` Triggers: ${triggers.join(', ')}.` : ''}`
    : title;

  return (
    <span
      className={`relative inline-flex group/pill ${className || ''}`}
      data-testid={`signal-pill-${kind}-wrapper`}
    >
      <span
        className={`inline-flex items-center rounded-full font-medium border ${sizeClass} ${KIND_STYLES[kind]} ${hasRichTooltip ? 'cursor-help focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-900/40' : ''}`}
        data-testid={`signal-pill-${kind}`}
        tabIndex={hasRichTooltip ? 0 : undefined}
        aria-label={a11yLabel}
        title={hasRichTooltip ? undefined : title}
      >
        <Icon className={iconClass} strokeWidth={1.75} />
        {label}
      </span>

      {hasRichTooltip && (
        <span
          role="tooltip"
          data-testid={`signal-tooltip-${kind}`}
          className="
            pointer-events-none absolute left-0 bottom-full mb-1.5 z-30
            w-64 max-w-[16rem]
            opacity-0 translate-y-1
            group-hover/pill:opacity-100 group-hover/pill:translate-y-0
            group-focus-within/pill:opacity-100 group-focus-within/pill:translate-y-0
            transition-all duration-150 ease-out
            bg-ink-900 text-white rounded-lg shadow-panel
            px-3 py-2.5
          "
        >
          <span className="block text-[11px] font-semibold tracking-wide">
            {label}
          </span>
          {detail && (
            <span className="block text-[11px] leading-snug text-white/85 mt-1">
              {KIND_REASON[kind]}
            </span>
          )}
          {triggers && triggers.length > 0 && (
            <span className="flex flex-wrap gap-1 mt-1.5">
              {triggers.slice(0, 6).map((t, i) => (
                <span
                  key={`${t}-${i}`}
                  className="inline-flex items-center bg-white/10 text-white/90 rounded px-1.5 py-0.5 text-[10px] font-mono"
                >
                  {t}
                </span>
              ))}
            </span>
          )}
        </span>
      )}
    </span>
  );
};

export default SignalPill;
