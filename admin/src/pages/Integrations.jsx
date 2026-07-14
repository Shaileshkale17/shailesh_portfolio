import { useEffect, useState } from "react";
import {
  Github,
  Star,
  GitFork,
  Users,
  RefreshCw,
  Flame,
  Trophy,
  CheckCircle2,
} from "lucide-react";
import api from "../lib/api";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import ContributionGrid from "../components/charts/ContributionGrid";
import { useToast } from "../context/ToastContext";
import { formatNumber } from "../lib/format";

const useIntegration = (path) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    setError("");
    api
      .get(path)
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.message || "Failed to load"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [path]);

  return { data, error, loading, reload: load };
};

const GithubCard = ({ data, error, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="card">
        <EmptyState icon={Github} title="GitHub not connected" description={error} />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="card">
      <div className="mb-4 flex items-center gap-3">
        {data.profile?.avatarUrl && (
          <img src={data.profile.avatarUrl} alt={data.profile.username} className="h-12 w-12 rounded-full border border-border" />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Github size={15} className="text-text-secondary" />
            <p className="truncate font-heading font-semibold">{data.profile?.name || data.profile?.username}</p>
          </div>
          <a
            href={data.profile?.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-text-secondary hover:text-primary hover:underline"
          >
            @{data.profile?.username}
          </a>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-4 gap-2 text-center">
        <div>
          <p className="font-heading text-lg font-bold">{formatNumber(data.totalRepositories)}</p>
          <p className="text-[11px] text-text-secondary">Repos</p>
        </div>
        <div>
          <p className="font-heading text-lg font-bold">{formatNumber(data.profile?.followers)}</p>
          <p className="text-[11px] text-text-secondary">Followers</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-heading text-lg font-bold">
            <Star size={13} className="text-accent" /> {formatNumber(data.totalStars)}
          </p>
          <p className="text-[11px] text-text-secondary">Stars</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-heading text-lg font-bold">
            <GitFork size={13} className="text-accent" /> {formatNumber(data.totalForks)}
          </p>
          <p className="text-[11px] text-text-secondary">Forks</p>
        </div>
      </div>

      {data.mostUsedLanguages?.length > 0 && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">Most used languages</p>
          <div className="flex flex-wrap gap-2">
            {data.mostUsedLanguages.slice(0, 6).map((l) => (
              <span key={l.language} className="rounded-full bg-surface-raised px-2.5 py-1 text-xs text-text">
                {l.language} <span className="text-text-secondary">· {l.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {data.contributions ? (
        <div className="mb-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">
            {formatNumber(data.contributions.total)} contributions in the last year
          </p>
          <ContributionGrid days={data.contributions.days} />
        </div>
      ) : (
        <p className="mb-4 text-xs text-text-secondary">
          Contributions graph requires <code className="font-mono">GITHUB_TOKEN</code> to be configured on the backend.
        </p>
      )}

      {data.topRepositories?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">Top repositories</p>
          <ul className="space-y-2">
            {data.topRepositories.map((repo) => (
              <li key={repo.name} className="flex items-center justify-between gap-2 text-sm">
                <a href={repo.url} target="_blank" rel="noreferrer" className="min-w-0 truncate text-text hover:text-primary hover:underline">
                  {repo.name}
                </a>
                <span className="flex flex-shrink-0 items-center gap-1 text-xs text-text-secondary">
                  <Star size={11} /> {repo.stars}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.cachedAt && (
        <p className="mt-4 text-[11px] text-text-secondary">Last synced {new Date(data.cachedAt).toLocaleString()}</p>
      )}
    </div>
  );
};

const LeetcodeCard = ({ data, error, loading }) => {
  if (loading) {
    return (
      <div className="card">
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="card">
        <EmptyState icon={Trophy} title="LeetCode not connected" description={error} />
      </div>
    );
  }
  if (!data) return null;

  const difficultyRows = [
    { label: "Easy", value: data.easySolved, color: "bg-success" },
    { label: "Medium", value: data.mediumSolved, color: "bg-accent" },
    { label: "Hard", value: data.hardSolved, color: "bg-error" },
  ];
  const maxDifficulty = Math.max(...difficultyRows.map((d) => d.value), 1);

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={15} className="text-accent" />
          <p className="font-heading font-semibold">{data.username}</p>
        </div>
        {data.ranking && <span className="text-xs text-text-secondary">Rank #{formatNumber(data.ranking)}</span>}
      </div>

      <div className="mb-5 flex items-center gap-6">
        <div className="text-center">
          <p className="font-heading text-3xl font-bold">{formatNumber(data.totalSolved)}</p>
          <p className="text-xs text-text-secondary">Solved</p>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          {difficultyRows.map((row) => (
            <div key={row.label}>
              <div className="mb-0.5 flex justify-between text-[11px] text-text-secondary">
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-raised">
                <div className={`h-full rounded-full ${row.color}`} style={{ width: `${(row.value / maxDifficulty) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="font-heading text-lg font-bold">{data.contestRating ? Math.round(data.contestRating) : "—"}</p>
          <p className="text-[11px] text-text-secondary">Contest rating</p>
        </div>
        <div>
          <p className="font-heading text-lg font-bold">{data.contestGlobalRanking ? `#${formatNumber(data.contestGlobalRanking)}` : "—"}</p>
          <p className="text-[11px] text-text-secondary">Global rank</p>
        </div>
        <div>
          <p className="flex items-center justify-center gap-1 font-heading text-lg font-bold">
            <Flame size={14} className="text-error" /> {data.streak}
          </p>
          <p className="text-[11px] text-text-secondary">Day streak</p>
        </div>
      </div>

      {data.recentSubmissions?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-text-secondary">Recent submissions</p>
          <ul className="space-y-2">
            {data.recentSubmissions.slice(0, 5).map((s) => (
              <li key={`${s.titleSlug}-${s.timestamp}`} className="flex items-center gap-2 text-sm">
                <CheckCircle2
                  size={13}
                  className={s.statusDisplay === "Accepted" ? "flex-shrink-0 text-success" : "flex-shrink-0 text-text-secondary"}
                />
                <span className="min-w-0 truncate text-text">{s.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.cachedAt && (
        <p className="mt-4 text-[11px] text-text-secondary">Last synced {new Date(data.cachedAt).toLocaleString()}</p>
      )}
    </div>
  );
};

const Integrations = () => {
  const github = useIntegration("/integrations/github");
  const leetcode = useIntegration("/integrations/leetcode");
  const toast = useToast();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { data } = await api.post("/integrations/sync");
      toast(
        `Synced — GitHub: ${data.github}, LeetCode: ${data.leetcode}, linked projects: ${data.linkedProjects}`,
        data.github === "failed" || data.leetcode === "failed" ? "error" : "success"
      );
      github.reload();
      leetcode.reload();
    } catch (err) {
      toast(err.response?.data?.message || "Sync failed", "error");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="mb-1 font-heading text-xl font-bold">GitHub &amp; LeetCode</h1>
          <p className="text-sm text-text-secondary">Coding activity, pulled from your public profiles.</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="btn-secondary gap-2">
          <RefreshCw size={15} className={syncing ? "animate-spin" : ""} />
          {syncing ? "Syncing..." : "Sync now"}
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <GithubCard {...github} />
        <LeetcodeCard {...leetcode} />
      </div>
    </div>
  );
};

export default Integrations;
