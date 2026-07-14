import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";

const GITHUB_REST = "https://api.github.com";
const GITHUB_GRAPHQL = "https://api.github.com/graphql";

const authHeaders = () => ({
  Accept: "application/vnd.github+json",
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
});

const ghFetch = async (path) => {
  const res = await fetch(`${GITHUB_REST}${path}`, { headers: authHeaders(), signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new AppError(`GitHub API error (${res.status}) for ${path}`, 502);
  return res.json();
};

/**
 * Fetches the last year of daily contribution counts via GitHub's GraphQL
 * API. Requires `GITHUB_TOKEN` — the public REST API doesn't expose the
 * contributions graph at all.
 * @param {string} username
 */
const getContributionsGraph = async (username) => {
  const query = `
    query($login: String!) {
      user(login: $login) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
      }
    }
  `;

  const res = await fetch(GITHUB_GRAPHQL, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { login: username } }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new AppError(`GitHub GraphQL error (${res.status})`, 502);

  const json = await res.json();
  const calendar = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!calendar) return null;

  return {
    total: calendar.totalContributions,
    days: calendar.weeks.flatMap((week) => week.contributionDays),
  };
};

/**
 * Aggregates a GitHub profile summary: account info, repo/star/fork
 * totals, most-used languages (computed from each repo's primary
 * language, since language-bytes breakdown isn't in the repo list
 * response), top repositories by stars, and — if `GITHUB_TOKEN` is set —
 * the contributions graph.
 * @param {string} [username] - Defaults to `GITHUB_USERNAME` env var.
 */
const getProfile = async (username = process.env.GITHUB_USERNAME) => {
  if (!username) throw new AppError("GITHUB_USERNAME is not configured", 500);

  const [profile, repos] = await Promise.all([
    ghFetch(`/users/${username}`),
    ghFetch(`/users/${username}/repos?per_page=100&sort=updated`),
  ]);

  const languageCounts = repos.reduce((acc, repo) => {
    if (repo.language) acc[repo.language] = (acc[repo.language] || 0) + 1;
    return acc;
  }, {});
  const mostUsedLanguages = Object.entries(languageCounts)
    .map(([language, count]) => ({ language, count }))
    .sort((a, b) => b.count - a.count);

  const topRepositories = [...repos]
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
    }));

  let contributions = null;
  if (process.env.GITHUB_TOKEN) {
    contributions = await getContributionsGraph(username).catch((err) => {
      logger.warn("GitHub contributions graph fetch failed", err);
      return null;
    });
  }

  return {
    profile: {
      username: profile.login,
      name: profile.name,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      profileUrl: profile.html_url,
    },
    totalRepositories: repos.length,
    totalStars: repos.reduce((sum, repo) => sum + repo.stargazers_count, 0),
    totalForks: repos.reduce((sum, repo) => sum + repo.forks_count, 0),
    mostUsedLanguages,
    topRepositories,
    contributions, // null unless GITHUB_TOKEN is configured
  };
};

/**
 * Fetches recent public push activity (commit messages) for the configured
 * GitHub user, flattened to individual commits.
 * @param {string} [username] - Defaults to `GITHUB_USERNAME` env var.
 */
const getRecentActivity = async (username = process.env.GITHUB_USERNAME) => {
  if (!username) throw new AppError("GITHUB_USERNAME is not configured", 500);

  const events = await ghFetch(`/users/${username}/events/public?per_page=20`);

  return events
    .filter((event) => event.type === "PushEvent")
    .slice(0, 10)
    .flatMap((event) =>
      (event.payload.commits || []).map((commit) => ({
        repo: event.repo.name,
        message: commit.message,
        sha: commit.sha,
        date: event.created_at,
      }))
    );
};

export default { getProfile, getRecentActivity };
