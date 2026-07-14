import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  TrendingUp,
  Globe2,
  Download,
  MousePointerClick,
} from "lucide-react";
import api from "../lib/api";
import StatCard from "../components/ui/StatCard";
import Skeleton from "../components/ui/Skeleton";
import GrowthAreaChart from "../components/charts/GrowthAreaChart";
import BreakdownDonut from "../components/charts/BreakdownDonut";
import HorizontalBarList from "../components/charts/HorizontalBarList";
import { formatNumber } from "../lib/format";

const EVENT_LABELS = {
  resume_download: "Resume downloads",
  project_click: "Project clicks",
  social_click: "Social clicks",
  contact_click: "Contact clicks",
  email_click: "Email clicks",
  phone_click: "Phone clicks",
};

const Analytics = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/analytics/summary")
      .then((res) => setData(res.data.data))
      .catch(() => setError("Couldn't load analytics. Try refreshing."))
      .finally(() => setLoading(false));
  }, []);

  const toDonutData = (rows, key) =>
    (rows || []).map((r) => ({ name: r[key], value: r.count }));

  return (
    <div>
      <h1 className="mb-1 font-heading text-xl font-bold">Analytics</h1>
      <p className="mb-6 text-sm text-text-secondary">
        Visitors, engagement, and where your traffic comes from.
      </p>

      {error && <p className="mb-4 text-sm text-error">{error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total visitors"
          value={formatNumber(data?.totalVisitors)}
          loading={loading}
          delay={0}
        />
        <StatCard
          icon={CalendarDays}
          label="Today"
          value={formatNumber(data?.todayVisitors)}
          loading={loading}
          accent="accent"
          delay={0.05}
        />
        <StatCard
          icon={TrendingUp}
          label="This week"
          value={formatNumber(data?.weeklyVisitors)}
          loading={loading}
          accent="success"
          delay={0.1}
        />
        <StatCard
          icon={Globe2}
          label="This month"
          value={formatNumber(data?.monthlyVisitors)}
          loading={loading}
          delay={0.15}
        />
      </div>

      <div className="mb-6 card">
        <h2 className="mb-4 font-heading text-base font-semibold">
          Visitor growth (last 30 days)
        </h2>
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <GrowthAreaChart data={data?.growth || []} />
        )}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-heading text-base font-semibold">
            Top pages
          </h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <HorizontalBarList
              data={(data?.topPages || []).map((p) => ({
                label: p.page,
                value: p.views,
              }))}
            />
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 font-heading text-base font-semibold">
            Referral sources
          </h2>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : (
            <HorizontalBarList
              data={(data?.referralStats || []).map((r) => ({
                label: r.source,
                value: r.count,
              }))}
            />
          )}
        </div>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        <div className="card">
          <h2 className="mb-4 font-heading text-base font-semibold">Devices</h2>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <BreakdownDonut
              data={toDonutData(data?.deviceStats, "device")}
              height={160}
            />
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 font-heading text-base font-semibold">
            Browsers
          </h2>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <BreakdownDonut
              data={toDonutData(data?.browserStats, "browser")}
              height={160}
            />
          )}
        </div>
        <div className="card">
          <h2 className="mb-4 font-heading text-base font-semibold">
            Countries
          </h2>
          {loading ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <HorizontalBarList
              data={(data?.countryStats || [])
                .slice(0, 6)
                .map((c) => ({ label: c.country, value: c.count }))}
            />
          )}
        </div>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <MousePointerClick size={16} className="text-primary" />
          <h2 className="font-heading text-base font-semibold">
            Portfolio engagement
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (data?.portfolioEvents || []).length === 0 ? (
          <p className="py-6 text-center text-sm text-text-secondary">
            No engagement events tracked yet — these populate once the public
            site starts sending{" "}
            <code className="font-mono text-xs">resume_download</code>,{" "}
            <code className="font-mono text-xs">project_click</code>, etc. to{" "}
            <code className="font-mono text-xs">POST /api/analytics/track</code>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {(data?.portfolioEvents || []).map((e) => (
              <div
                key={e.eventName}
                className="rounded-xl border border-border bg-surface-raised p-4 text-center"
              >
                <div className="flex items-center justify-center gap-1 text-text-secondary">
                  <Download size={12} />
                </div>
                <div className="mt-1 font-heading text-xl font-bold">
                  {formatNumber(e.count)}
                </div>
                <div className="mt-1 text-xs text-text-secondary">
                  {EVENT_LABELS[e.eventName] || e.eventName}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
