import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Rss, AlertTriangle, Mail, TrendingUp } from "lucide-react";
import { useNotifications } from "../context/NotificationsContext";
import { timeAgo } from "../lib/format";

const ICONS = {
  new_message: Mail,
  visitor_milestone: TrendingUp,
  integration_failed: AlertTriangle,
  system_alert: Rss,
};

const NotificationBell = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 text-text-secondary transition hover:bg-surface-raised hover:text-text"
        aria-label="Notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <span className="text-sm font-semibold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-text-secondary">You're all caught up.</p>
            ) : (
              notifications.slice(0, 8).map((n) => {
                const Icon = ICONS[n.type] || Rss;
                return (
                  <button
                    key={n._id}
                    onClick={() => !n.read && markRead(n._id)}
                    className={`flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left last:border-0 hover:bg-surface-raised ${
                      n.read ? "opacity-60" : ""
                    }`}
                  >
                    <div className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">{n.title}</p>
                      <p className="mt-0.5 text-xs text-text-secondary">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-accent" />}
                  </button>
                );
              })
            )}
          </div>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="block border-t border-border px-4 py-3 text-center text-sm text-primary hover:bg-surface-raised"
          >
            View all
          </Link>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
