import { useState } from "react";
import { Bell, Rss, AlertTriangle, Mail, TrendingUp, Trash2, CheckCheck } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";
import EmptyState from "../components/ui/EmptyState";
import { timeAgo } from "../lib/format";

const ICONS = {
  new_message: Mail,
  visitor_milestone: TrendingUp,
  integration_failed: AlertTriangle,
  system_alert: Rss,
};

const FILTERS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
];

const Notifications = () => {
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications();
  const [filter, setFilter] = useState("all");

  const visible = filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-heading text-xl font-bold">Notifications</h1>
          <p className="text-sm text-text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="btn-secondary gap-2">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="mb-4 flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${
              filter === f.key ? "bg-primary/15 text-text" : "text-text-secondary hover:bg-surface-raised"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card p-0">
        {visible.length === 0 ? (
          <EmptyState icon={Bell} title="Nothing here" description="Notifications will show up as things happen." />
        ) : (
          <ul>
            {visible.map((n) => {
              const Icon = ICONS[n.type] || Rss;
              return (
                <li
                  key={n._id}
                  className={`flex items-start gap-3 border-b border-border px-6 py-4 last:border-0 ${n.read ? "opacity-60" : ""}`}
                >
                  <div className="mt-0.5 grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Icon size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text">{n.title}</p>
                    {n.body && <p className="mt-0.5 text-sm text-text-secondary">{n.body}</p>}
                    <p className="mt-1 text-xs text-text-secondary">{timeAgo(n.createdAt)}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3 text-xs">
                    {!n.read && (
                      <button onClick={() => markRead(n._id)} className="text-primary hover:underline">
                        Mark read
                      </button>
                    )}
                    <button onClick={() => remove(n._id)} className="text-text-secondary hover:text-error">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
