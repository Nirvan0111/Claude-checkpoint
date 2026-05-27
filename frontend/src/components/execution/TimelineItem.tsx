import React from 'react';
import {
  BookOpen,
  Search,
  Pencil,
  Plus,
  CheckSquare,
  Trash2,
  LucideIcon,
} from 'lucide-react';
import { TimelineActionKind, TimelineEvent } from '../../types';

interface Props {
  event: TimelineEvent;
}

const KIND_ICON: Record<TimelineActionKind, LucideIcon> = {
  read: BookOpen,
  analyzed: Search,
  modified: Pencil,
  created: Plus,
  deleted: Trash2,
  tests: CheckSquare,
};

const KIND_ACCENT: Record<TimelineActionKind, string> = {
  read: 'text-ink-500 bg-line-light',
  analyzed: 'text-[#1E40AF] bg-[#EFF6FF]',
  modified: 'text-[#854D0E] bg-[#FEFCE8]',
  created: 'text-[#166534] bg-[#F0FDF4]',
  deleted: 'text-[#991B1B] bg-[#FEF2F2]',
  tests: 'text-[#166534] bg-[#F0FDF4]',
};

export const TimelineItem: React.FC<Props> = ({ event }) => {
  const Icon = KIND_ICON[event.action];
  return (
    <li
      className="flex items-start gap-3 py-2"
      data-testid={`timeline-item-${event.action}-${event.target}`}
    >
      <span
        className={`flex-shrink-0 mt-0.5 w-6 h-6 rounded-md flex items-center justify-center ${KIND_ACCENT[event.action]}`}
      >
        <Icon className="w-3 h-3" strokeWidth={1.75} />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-ink-900 font-mono">{event.target}</span>
          <span className="text-[11px] text-ink-400 capitalize">{event.action}</span>
          <span className="text-[11px] text-ink-400 tabular-nums ml-auto">{event.time}</span>
        </div>
        <p className="text-[12px] text-ink-500 leading-snug mt-0.5">{event.description}</p>
      </div>
    </li>
  );
};

export default TimelineItem;
