/**
 * Small text-escaping helpers shared across services.
 */

/**
 * Escapes RegExp special characters so untrusted input (e.g. a search query
 * from the admin dashboard) can be safely interpolated into `new RegExp()`
 * without letting the caller inject regex syntax.
 * @param {string} str
 * @returns {string}
 */
export const escapeRegex = (str = "") => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const HTML_ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/**
 * Escapes HTML special characters. Used when interpolating user-supplied
 * text (contact form name/message) into outgoing email HTML, so a visitor
 * can't inject markup into the admin notification email.
 * @param {string} str
 * @returns {string}
 */
export const escapeHtml = (str = "") => str.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
