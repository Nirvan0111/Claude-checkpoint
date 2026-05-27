import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { TimelineEvent } from '../../types';
import TimelineItem from './TimelineItem';

interface Props {
  events: TimelineEvent[];
  compactCount?: number;
}

export const ActivityTimeline: React.FC<Props> = ({ events, compactCount = 3 }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? events : events.slice(-compactCount);
  const hiddenCount = events.length - visible.length;

  return (
    <div data-testid="activity-timeline">
      {!expanded && hiddenCount > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-[12px] text-ink-500 hover:text-ink-900 transition-colors mb-1 inline-flex items-center gap-1"
          data-testid="timeline-expand"
        >
          <ChevronDown className="w-3 h-3" strokeWidth={1.75} />
          Show {hiddenCount} earlier {hiddenCount === 1 ? 'event' : 'events'}
        </button>
      )}
      <ul className="divide-y divide-line-light">
        {visible.map((e) => (
          <TimelineItem key={e.id} event={e} />
        ))}
      </ul>
      {expanded && (
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[12px] text-ink-500 hover:text-ink-900 transition-colors mt-1"
          data-testid="timeline-collapse"
        >
          Collapse
        </button>
      )}
    </div>
  );
};

export default ActivityTimeline;
