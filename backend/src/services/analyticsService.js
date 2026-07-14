import AnalyticsEvent from "../models/AnalyticsEvent.js";
import AppError from "../utils/AppError.js";
import logger from "../utils/logger.js";
import { parseUserAgent } from "../utils/parseUserAgent.js";
import notificationService from "./notificationService.js";

// Unique-visitor counts that trigger a "visitor_milestone" notification.
const MILESTONES = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];

/**
 * Records a pageview or an engagement event from the public site.
 *
 * `device`/`browser` are derived server-side from the User-Agent header
 * (never trusted from the client body). `country` prefers Vercel's
 * `x-vercel-ip-country` edge header when deployed there; otherwise falls
 * back to whatever the client supplied (e.g. from a client-side
 * geolocation API), or "Unknown" — this API doesn't bundle a GeoIP
 * database, so accuracy off Vercel depends on what the frontend sends.
 *
 * @param {object} payload - req.body: { type, page, eventName, meta, sessionId, referrer, country }
 * @param {import("express").Request} req
 */
const track = async (payload, req) => {
  const { type, page, eventName, meta, sessionId, referrer, country: clientCountry } = payload;

  if (!sessionId) throw new AppError("sessionId is required", 400);
  if (type === "pageview" && !page) throw new AppError("page is required for pageview events", 400);
  if (type === "event" && !eventName) throw new AppError("eventName is required for event tracking", 400);
  if (!["pageview", "event"].includes(type)) throw new AppError("type must be 'pageview' or 'event'", 400);

  const { device, browser } = parseUserAgent(req.headers["user-agent"]);
  const country = req.headers["x-vercel-ip-country"] || clientCountry || "Unknown";

  const doc = await AnalyticsEvent.create({
    type,
    page,
    eventName,
    meta,
    sessionId,
    referrer: referrer || "",
    country,
    device,
    browser,
  });

  if (type === "pageview") {
    // Fire-and-forget: a milestone-check failure must never affect the tracking request itself.
    checkVisitorMilestone().catch((err) => logger.error("Visitor milestone check failed", err));
  }

  return doc;
};

/**
 * Checks whether the current unique-visitor count exactly matches one of
 * `MILESTONES` and, if so, raises a notification.
 *
 * Note: this re-counts distinct sessionIds on every pageview, which is
 * O(n) over the collection — acceptable at portfolio-site traffic levels,
 * but a high-traffic site should switch to a maintained counter instead of
 * a live aggregate.
 */
const checkVisitorMilestone = async () => {
  const [result] = await AnalyticsEvent.aggregate([
    { $match: { type: "pageview" } },
    { $group: { _id: "$sessionId" } },
    { $count: "count" },
  ]);
  const count = result?.count || 0;
  if (!MILESTONES.includes(count)) return;

  await notificationService.create({
    type: "visitor_milestone",
    title: `${count.toLocaleString()} unique visitors reached!`,
    body: `Your portfolio just crossed ${count.toLocaleString()} unique visitors.`,
  });
};

/**
 * Full analytics summary for the dashboard's Analytics section: visitor
 * totals across a few windows, growth trend, top pages, country/device/
 * browser breakdowns, referral sources, and portfolio engagement-event
 * counts (resume downloads, project clicks, etc.).
 */
const getSummary = async () => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [pageviewStats] = await AnalyticsEvent.aggregate([
    { $match: { type: "pageview" } },
    {
      $facet: {
        totalVisitors: [{ $group: { _id: "$sessionId" } }, { $count: "count" }],
        todayVisitors: [
          { $match: { createdAt: { $gte: startOfToday } } },
          { $group: { _id: "$sessionId" } },
          { $count: "count" },
        ],
        weeklyVisitors: [
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          { $group: { _id: "$sessionId" } },
          { $count: "count" },
        ],
        monthlyVisitors: [
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          { $group: { _id: "$sessionId" } },
          { $count: "count" },
        ],
        topPages: [
          { $group: { _id: "$page", views: { $sum: 1 } } },
          { $sort: { views: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, page: "$_id", views: 1 } },
        ],
        growth: [
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              visitors: { $addToSet: "$sessionId" },
            },
          },
          { $project: { _id: 0, date: "$_id", visitors: { $size: "$visitors" } } },
          { $sort: { date: 1 } },
        ],
        countryStats: [
          { $group: { _id: "$country", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, country: "$_id", count: 1 } },
        ],
        deviceStats: [
          { $group: { _id: "$device", count: { $sum: 1 } } },
          { $project: { _id: 0, device: "$_id", count: 1 } },
        ],
        browserStats: [
          { $group: { _id: "$browser", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, browser: "$_id", count: 1 } },
        ],
        referralStats: [
          {
            $project: {
              source: {
                $cond: [{ $or: [{ $eq: ["$referrer", ""] }, { $eq: ["$referrer", null] }] }, "Direct", "$referrer"],
              },
            },
          },
          { $group: { _id: "$source", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $project: { _id: 0, source: "$_id", count: 1 } },
        ],
      },
    },
  ]);

  const eventCounts = await AnalyticsEvent.aggregate([
    { $match: { type: "event" } },
    { $group: { _id: "$eventName", count: { $sum: 1 } } },
    { $project: { _id: 0, eventName: "$_id", count: 1 } },
  ]);

  const unwrapCount = (arr) => arr?.[0]?.count ?? 0;

  return {
    totalVisitors: unwrapCount(pageviewStats.totalVisitors),
    todayVisitors: unwrapCount(pageviewStats.todayVisitors),
    weeklyVisitors: unwrapCount(pageviewStats.weeklyVisitors),
    monthlyVisitors: unwrapCount(pageviewStats.monthlyVisitors),
    topPages: pageviewStats.topPages,
    growth: pageviewStats.growth,
    countryStats: pageviewStats.countryStats,
    deviceStats: pageviewStats.deviceStats,
    browserStats: pageviewStats.browserStats,
    referralStats: pageviewStats.referralStats,
    portfolioEvents: eventCounts,
  };
};

export default { track, getSummary };
