import React from 'react';

interface Props {
  bullets: string[];
}

export const ChangeSummary: React.FC<Props> = ({ bullets }) => {
  return (
    <section
      className="bg-bubble/50 border border-line-light rounded-xl px-4 py-3"
      data-testid="change-summary"
    >
      <div className="text-[11px] tracking-[0.08em] uppercase text-ink-500 font-medium mb-1.5">
        What changed?
      </div>
      <ul className="space-y-1">
        {bullets.map((b, i) => (
          <li key={i} className="text-[13px] text-ink-700 leading-relaxed flex gap-2">
            <span aria-hidden className="text-ink-400 mt-0.5">·</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ChangeSummary;
