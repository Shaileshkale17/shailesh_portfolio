/**
 * Converts an array of Mongoose documents/plain objects into a CSV string.
 * Minimal hand-rolled implementation — fine for admin-only exports of a few
 * hundred/thousand rows; swap for a streaming CSV library if exports ever
 * need to scale beyond that.
 */

const escapeCsvValue = (value) => {
  if (value === undefined || value === null) return "";
  const str = value instanceof Date ? value.toISOString() : String(value);
  // Quote (and escape internal quotes) any value containing a comma, quote, or newline.
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

/**
 * @param {Array<object>} rows - Documents/objects to export.
 * @param {string[]} columns - Field names to include, in column order.
 * @returns {string} CSV text, header row first.
 */
export const toCsv = (rows, columns) => {
  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => escapeCsvValue(row[col])).join(","));
  return [header, ...lines].join("\n");
};
