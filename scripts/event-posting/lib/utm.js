/**
 * utm.js
 * Appends UTM tracking parameters to a URL.
 */

"use strict";

const { URL } = require("url");

/**
 * Append UTM parameters to a URL.
 *
 * @param {string} rawUrl       - The original ticket URL.
 * @param {string} site         - The event listing site key (utm_source).
 * @param {string} showDate     - ISO date string for the show (utm_campaign).
 * @param {string} titleSlug    - URL-safe show title slug (utm_content suffix).
 * @returns {string} URL with UTM parameters appended.
 */
function appendUtm(rawUrl, site, showDate, titleSlug) {
  if (!rawUrl) return rawUrl;

  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    // Not a valid URL – return as-is
    return rawUrl;
  }

  // Campaign date: just the YYYY-MM-DD portion
  const campaignDate =
    showDate ? String(showDate).slice(0, 10) : "unknown-date";

  parsed.searchParams.set("utm_source", site);
  parsed.searchParams.set("utm_medium", "event_listing");
  parsed.searchParams.set("utm_campaign", campaignDate);
  parsed.searchParams.set(
    "utm_content",
    `${site}-${titleSlug || "show"}`
  );

  return parsed.toString();
}

/**
 * Slugify a string into a URL-safe identifier.
 * @param {string} str
 * @returns {string}
 */
function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

module.exports = { appendUtm, slugify };
