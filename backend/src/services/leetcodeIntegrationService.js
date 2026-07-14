import AppError from "../utils/AppError.js";

const LEETCODE_GRAPHQL = "https://leetcode.com/graphql";

/**
 * LeetCode has no official public API. This uses the same (unofficial,
 * undocumented) GraphQL endpoint leetcode.com's own frontend calls. It has
 * historically been stable, but isn't guaranteed — if it breaks, swap in a
 * third-party wrapper such as `leetcode-stats-api` without touching
 * `integrationController`/`dashboardService`, which only depend on the
 * shape returned by `getProfile` below.
 */
const QUERY = `
  query userProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile { ranking realName }
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      submissionCalendar
    }
    userContestRanking(username: $username) {
      rating
      globalRanking
      attendedContestsCount
    }
    recentSubmissionList(username: $username, limit: 10) {
      title
      titleSlug
      timestamp
      statusDisplay
    }
  }
`;

const lcFetch = async (variables) => {
  const res = await fetch(LEETCODE_GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Referer: "https://leetcode.com" },
    body: JSON.stringify({ query: QUERY, variables }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new AppError(`LeetCode API error (${res.status})`, 502);

  const json = await res.json();
  if (json.errors) throw new AppError(json.errors[0]?.message || "LeetCode API error", 502);
  return json.data;
};

/** Counts consecutive days (ending today or yesterday) with at least one accepted submission. */
const computeCurrentStreak = (solvedGraph) => {
  const solvedDates = new Set(solvedGraph.filter((day) => day.count > 0).map((day) => day.date));
  const toDateKey = (date) => date.toISOString().slice(0, 10);

  let streak = 0;
  const cursor = new Date();
  // Allow the streak to still count if today has no submission yet but yesterday does.
  if (!solvedDates.has(toDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);

  while (solvedDates.has(toDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

/**
 * Fetches solved-problem breakdown, contest rating/rank, recent
 * submissions, and a daily solved-problems graph (with current streak)
 * for a LeetCode username.
 * @param {string} [username] - Defaults to `LEETCODE_USERNAME` env var.
 */
const getProfile = async (username = process.env.LEETCODE_USERNAME) => {
  if (!username) throw new AppError("LEETCODE_USERNAME is not configured", 500);

  const data = await lcFetch({ username });
  if (!data.matchedUser) throw new AppError(`No LeetCode user found for "${username}"`, 404);

  const acStats = data.matchedUser.submitStatsGlobal?.acSubmissionNum || [];
  const byDifficulty = Object.fromEntries(acStats.map((stat) => [stat.difficulty.toLowerCase(), stat.count]));

  // `submissionCalendar` is a JSON string of { unixTimestamp: count }; used to derive
  // a solved-problems graph and the current streak.
  const calendarRaw = data.matchedUser.submissionCalendar;
  const calendar = calendarRaw ? JSON.parse(calendarRaw) : {};
  const solvedGraph = Object.entries(calendar)
    .map(([timestamp, count]) => ({ date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10), count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    username: data.matchedUser.username,
    ranking: data.matchedUser.profile?.ranking ?? null,
    totalSolved: byDifficulty.all || 0,
    easySolved: byDifficulty.easy || 0,
    mediumSolved: byDifficulty.medium || 0,
    hardSolved: byDifficulty.hard || 0,
    contestRating: data.userContestRanking?.rating ?? null,
    contestGlobalRanking: data.userContestRanking?.globalRanking ?? null,
    contestsAttended: data.userContestRanking?.attendedContestsCount ?? null,
    recentSubmissions: data.recentSubmissionList || [],
    solvedGraph,
    streak: computeCurrentStreak(solvedGraph),
  };
};

export default { getProfile };
