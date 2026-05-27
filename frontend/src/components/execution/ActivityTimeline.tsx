import React, { useState } from 'react';
import { ChevronsUpDown, ChevronsDownUp } from 'lucide-react';
import { TimelineActionKind, TimelineEvent } from '../../types';
import TimelineItem from './TimelineItem';

interface Props {
  events: TimelineEvent[];
  compactCount?: number;
}

const GROUP_ACCENT: Record<TimelineActionKind, string> = {
  read: 'border-l-line',
  analyzed: 'border-l-[#BFDBFE]',
  modified: 'border-l-[#FEF08A]',
  created: 'border-l-[#BBF7D0]',
  deleted: 'border-l-[#FECACA]',
  tests: 'border-l-[#BBF7D0]',
};

export const ActivityTimeline: React.FC<Props> = ({ events, compactCount = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(-compactCount);
  const hidden = events.length - visible.length;

  return (
    <div data-testid="activity-timeline">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span
          className="text-[12px] text-ink-500 tabular-nums"
          data-testid="timeline-counter"
        >
          {visible.length} of {events.length} {events.length === 1 ? 'event' : 'events'}
        </span>
        {events.length > compactCount && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="inline-flex items-center gap-1 text-[12px] text-ink-500 hover:text-ink-900 transition-colors duration-200"
            data-testid={expanded ? 'timeline-collapse-all' : 'timeline-expand-all'}
            aria-expanded={expanded}
          >
            {expanded ? (
              <>
                <ChevronsDownUp className="w-3.5 h-3.5" strokeWidth={1.75} />
                Collapse all
              </>
            ) : (
              <>
                <ChevronsUpDown className="w-3.5 h-3.5" strokeWidth={1.75} />
                Expand all
              </>
            )}
          </button>
        )}
      </div>
      {!expanded && hidden > 0 && (
        <p
          className="text-[11px] text-ink-400 mb-1"
          data-testid="timeline-hidden-hint"
        >
          {hidden} earlier {hidden === 1 ? 'event' : 'events'} hidden — expand to view.
        </p>
      )}
      <ul className="space-y-0.5">
        {visible.map((e) => (
          <li
            key={e.id}
            className={`pl-2 border-l-2 ${GROUP_ACCENT[e.action]}`}
          >
            <TimelineItem event={e} />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityTimeline;
