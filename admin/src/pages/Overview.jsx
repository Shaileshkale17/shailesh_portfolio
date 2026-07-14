import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Mail,
  FolderKanban,
  Link2,
  Bell,
  ArrowUpRight,
  BarChart3,
  Rss,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import api from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationsContext";
import StatCard from "../components/ui/StatCard";
import Skeleton from "../components/ui/Skeleton";
import GrowthAreaChart from "../components/charts/GrowthAreaChart";
import { formatNumber, timeAgo } from "../lib/format";

const NOTIF_ICONS = {
  new_message: Mail,
  visitor_milestone: TrendingUp,
  integration_failed: AlertTriangle,
  system_alert: Rss,
};

const QUICK_LINKS = [
  { to: "/analytics", label: "View analytics", icon: BarChart3 },
  { to: "/messages", label: "Check messages", icon: Mail },
  { to: "/linked-projects", label: "Manage linked projects", icon: Link2 },
];

const Overview = () => {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/dashboard/summary")
      .then((res) => setSummary(res.data))
      .catch(() =>
        setError("Couldn't load the dashboard summary. Try refreshing."),
      )
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    {
      icon: Users,
      label: "Total visitors",
      value: formatNumber(summary?.analytics?.totalVisitors),
      hint: `${formatNumber(summary?.analytics?.todayVisitors)} today`,
    },
    {
      icon: Mail,
      label: "Messages",
      value: formatNumber(summary?.contacts?.total),
      hint: `${formatNumber(summary?.contacts?.unread)} unread`,
      accent: "accent",
    },
    {
      icon: FolderKanban,
      label: "Projects",
      value: formatNumber(summary?.projects?.total),
      accent: "success",
    },
    {
      icon: Link2,
      label: "Linked websites",
      value: formatNumber(summary?.linkedWebsites?.total),
    },
    {
      icon: Bell,
      label: "Notifications",
      value: formatNumber(summary?.notifications?.unread),
      hint: "unread",
      accent: "error",
    },
  ];

  return (
    <div>
      <h1 className="mb-1 font-heading text-xl font-bold">
        Welcome back{user?.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mb-6 text-sm text-text-secondary">
        Here's everything happening across your portfolio right now.
      </p>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <StatCard key={c.label} {...c} loading={loading} delay={i * 0.05} />
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              Visitor growth
            </h2>
            <Link
              to="/analytics"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              Full analytics <ArrowUpRight size={12} />
            </Link>
          </div>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : (
            <GrowthAreaChart
              data={summary?.analytics?.growth || []}
              height={220}
            />
          )}
        </div>

        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-heading text-base font-semibold">
              Recent notifications
            </h2>
            <Link
              to="/notifications"
              className="flex items-center gap-1 text-xs text-primary hover:underline"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          {notifications.length === 0 ? (
            <p className="py-8 text-center text-sm text-text-secondary">
              You're all caught up.
            </p>
          ) : (
            <ul className="space-y-3">
              {notifications?.slice(0, 5)?.map((n) => {
                const Icon = NOTIF_ICONS[n.type] || Rss;
                return (
                  <li key={n._id} className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-text">{n.title}</p>
                      <p className="text-xs text-text-secondary">
                        {timeAgo(n.createdAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-heading text-base font-semibold">
          Quick actions
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3 text-sm transition hover:border-primary/40"
            >
              <link.icon size={16} className="text-primary" />
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
