import React from 'react';
import {
  ShieldCheck,
  SquarePen,
  MessageSquare,
  Settings,
  Sparkles,
} from 'lucide-react';

interface RecentChat {
  id: string;
  title: string;
  // Bucket label is computed in groups[], not stored per chat.
}

interface ChatGroup {
  label: string;
  items: RecentChat[];
}

// Realistic mock conversation history — PM / coding / research mix that mirrors
// the kinds of prompts the rest of the demo uses. No state/persistence wired
// in; this is purely a visual surface to make the app feel native to Claude.
const RECENT_CHATS: ChatGroup[] = [
  {
    label: 'Today',
    items: [
      { id: 'pg-migration', title: 'Postgres 14 → 16 migration plan' },
      { id: 'pricing-q2', title: 'Q2 SaaS pricing comparison' },
    ],
  },
  {
    label: 'Yesterday',
    items: [
      { id: 'stakeholder-summary', title: 'Stakeholder summary draft' },
      { id: 'cache-strategy', title: 'Cache invalidation approach' },
    ],
  },
  {
    label: 'Previous 7 days',
    items: [
      { id: 'auth-refactor', title: 'Auth refactor review notes' },
      { id: 'feature-flag-rollout', title: 'Feature-flag rollout checklist' },
      { id: 'incident-postmortem', title: 'Incident retro — payment outage' },
    ],
  },
];

interface Props {
  onNewChat: () => void;
}

export const Sidebar: React.FC<Props> = ({ onNewChat }) => {
  // The first chat in "Today" is treated as the active session — purely a
  // visual selection so the surface doesn't look static.
  const activeId = RECENT_CHATS[0]?.items[0]?.id;

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-screen flex-shrink-0 bg-bubble/40 border-r border-line-light"
      aria-label="Conversation history"
      data-testid="sidebar"
    >
      {/* Brand */}
      <div className="px-4 pt-5 pb-3 flex items-center gap-2">
        <span className="w-7 h-7 rounded-lg bg-ink-900 text-white flex items-center justify-center">
          <ShieldCheck className="w-3.5 h-3.5" strokeWidth={1.75} />
        </span>
        <div className="font-serif text-[15px] text-ink-900 leading-none">
          Claude Checkpoint
        </div>
      </div>

      {/* New chat */}
      <div className="px-3 pt-2 pb-3">
        <button
          type="button"
          onClick={onNewChat}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white border border-line-light hover:border-line hover:bg-white text-ink-900 text-[13px] font-medium transition-colors duration-200 shadow-sm"
          data-testid="sidebar-new-chat"
        >
          <SquarePen className="w-3.5 h-3.5" strokeWidth={1.75} />
          New chat
        </button>
      </div>

      {/* Recents */}
      <nav className="flex-1 overflow-y-auto px-2 pb-2" data-testid="sidebar-recents">
        {RECENT_CHATS.map((group) => (
          <div key={group.label} className="mb-3">
            <div className="px-2 pt-2 pb-1 text-[10.5px] tracking-[0.08em] uppercase text-ink-400 font-medium">
              {group.label}
            </div>
            <ul className="space-y-0.5">
              {group.items.map((chat) => {
                const isActive = chat.id === activeId;
                return (
                  <li key={chat.id}>
                    <button
                      type="button"
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-left text-[13px] leading-tight transition-colors duration-200 truncate ${
                        isActive
                          ? 'bg-bubble text-ink-900'
                          : 'text-ink-700 hover:bg-bubble/70 hover:text-ink-900'
                      }`}
                      data-testid={`sidebar-chat-${chat.id}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <MessageSquare
                        className="w-3 h-3 flex-shrink-0 text-ink-400"
                        strokeWidth={1.75}
                      />
                      <span className="truncate">{chat.title}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer / profile */}
      <div
        className="border-t border-line-light px-2 py-2.5 flex items-center justify-between"
        data-testid="sidebar-footer"
      >
        <div className="flex items-center gap-2 min-w-0 px-1.5">
          <span
            className="flex-shrink-0 w-7 h-7 rounded-full bg-ink-900 text-white text-[11px] font-semibold flex items-center justify-center"
            aria-hidden
          >
            CC
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-[12.5px] font-medium text-ink-900 truncate">
              Your account
            </div>
            <div className="text-[10.5px] text-ink-500 inline-flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" strokeWidth={1.75} />
              Free plan
            </div>
          </div>
        </div>
        <button
          type="button"
          className="p-1.5 text-ink-500 hover:text-ink-900 rounded-md hover:bg-bubble transition-colors duration-200"
          aria-label="Settings"
          data-testid="sidebar-settings"
        >
          <Settings className="w-3.5 h-3.5" strokeWidth={1.75} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
