/**
 * Minimal User-Agent parser — good enough to bucket visitors into
 * device/browser categories for the analytics dashboard without pulling in
 * a full dependency like `ua-parser-js`. Not exhaustive; falls back to
 * sensible defaults for anything unrecognized.
 *
 * @param {string} [userAgent]
 * @returns {{ device: "desktop"|"mobile"|"tablet"|"other", browser: string }}
 */
export const parseUserAgent = (userAgent = "") => {
  const ua = userAgent || "";

  if (!ua) return { device: "other", browser: "Unknown" };

  let device = "desktop";
  if (/ipad|tablet(?!.*mobile)/i.test(ua)) device = "tablet";
  else if (/mobi|android|iphone|ipod/i.test(ua)) device = "mobile";

  let browser = "Unknown";
  if (/edg\//i.test(ua)) browser = "Edge";
  else if (/opr\/|opera/i.test(ua)) browser = "Opera";
  else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) browser = "Chrome";
  else if (/firefox\//i.test(ua)) browser = "Firefox";
  else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) browser = "Safari";

  return { device, browser };
};
