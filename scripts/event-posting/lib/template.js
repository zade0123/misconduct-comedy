/**
 * template.js
 * Resolves template variable expressions against show data.
 *
 * Syntax:   {{variablePath}}
 *           {{variablePath | filter}}
 *           {{variablePath | filter:arg}}
 *
 * Supported filters:
 *   utm           – append UTM parameters (requires site context)
 *   imagePath     – convert web-relative path to local filesystem path
 *   prepareImage  – resolve + resize image (async)
 *   date:FORMAT   – format a date using dayjs
 *   time:FORMAT   – format a time using dayjs
 *   stripHtml     – strip HTML tags
 *   truncate:N    – truncate to N characters
 *   slug          – URL-safe slug
 */

"use strict";

const dayjs = require("dayjs");
const utcPlugin = require("dayjs/plugin/utc");
const timezonePlugin = require("dayjs/plugin/timezone");
const advancedFormat = require("dayjs/plugin/advancedFormat");
const customParseFormat = require("dayjs/plugin/customParseFormat");

dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

const { appendUtm, slugify } = require("./utm");
const { resolveImagePath, prepareImage } = require("./images");

/**
 * Safely get a nested value from an object using dot-notation.
 * Supports array index notation: "showtimes.0.ticketUrl"
 *
 * @param {object} obj
 * @param {string} path
 * @returns {*}
 */
function getNestedValue(obj, path) {
  return path.split(".").reduce((current, key) => {
    if (current == null) return undefined;
    return current[key];
  }, obj);
}

/**
 * Apply a single filter to a value.
 *
 * @param {string}  filterExpr  - e.g. "utm", "date:MM/DD/YYYY", "truncate:500"
 * @param {*}       value       - Resolved raw value
 * @param {object}  context     - { site, showData, forceImage, imageRequirements }
 * @returns {string|Promise<string>}
 */
async function applyFilter(filterExpr, value, context = {}) {
  const [filterName, filterArg] = filterExpr.split(":").map((s) => s.trim());

  switch (filterName) {
    case "utm": {
      const showData = context.showData || {};
      const site = context.site || "unknown";
      const showDate =
        getNestedValue(showData, "showtimes.0.startDate") ||
        showData.showDate ||
        "";
      const titleSlug = slugify(showData.title || "show");
      return appendUtm(String(value || ""), site, showDate, titleSlug);
    }

    case "imagePath": {
      return resolveImagePath(String(value || ""));
    }

    case "prepareImage": {
      const localPath = resolveImagePath(String(value || ""));
      return prepareImage(
        localPath,
        context.site || "unknown",
        context.imageRequirements || {},
        context.forceImage || false
      );
    }

    case "date": {
      const fmt = filterArg || "MMMM D, YYYY";
      const d = dayjs(value);
      return d.isValid() ? d.format(fmt) : String(value || "");
    }

    case "time": {
      const fmt = filterArg || "h:mm A";
      const d = dayjs(value);
      return d.isValid() ? d.format(fmt) : String(value || "");
    }

    case "stripHtml": {
      return String(value || "").replace(/<[^>]*>/g, "");
    }

    case "truncate": {
      const max = parseInt(filterArg, 10) || 500;
      const str = String(value || "");
      return str.length > max ? str.slice(0, max) : str;
    }

    case "slug": {
      return slugify(String(value || ""));
    }

    default:
      return String(value || "");
  }
}

/**
 * Resolve a single template expression like "{{title}}" or "{{showtimes.0.ticketUrl | utm}}".
 *
 * @param {string}  expr      - The full expression including {{ }}
 * @param {object}  showData  - Parsed frontmatter data
 * @param {object}  context   - Extra context: { site, forceImage, imageRequirements }
 * @returns {Promise<string>}
 */
async function resolveExpression(expr, showData, context = {}) {
  // Strip {{ and }}
  const inner = expr.replace(/^\{\{/, "").replace(/\}\}$/, "").trim();

  // Split on | to get variable path and optional filters
  const parts = inner.split("|").map((s) => s.trim());
  const varPath = parts[0];
  const filters = parts.slice(1);

  // Get raw value from show data
  let value = getNestedValue(showData, varPath);

  // Apply each filter in sequence
  for (const filter of filters) {
    value = await applyFilter(filter, value, { ...context, showData });
  }

  return value != null ? String(value) : "";
}

/**
 * Resolve all template expressions in a string.
 *
 * @param {string}  str       - String potentially containing {{...}} expressions
 * @param {object}  showData
 * @param {object}  context
 * @returns {Promise<string>}
 */
async function resolveString(str, showData, context = {}) {
  if (typeof str !== "string") return str;

  const exprPattern = /\{\{[^}]+\}\}/g;
  const matches = str.match(exprPattern);
  if (!matches) return str;

  let result = str;
  for (const match of matches) {
    const resolved = await resolveExpression(match, showData, context);
    result = result.replace(match, resolved);
  }
  return result;
}

/**
 * Resolve all variable expressions in a template step object.
 *
 * @param {object}  step      - A single template step
 * @param {object}  showData
 * @param {object}  context
 * @returns {Promise<object>} Step with value resolved
 */
async function resolveStep(step, showData, context = {}) {
  const resolved = { ...step };

  if (typeof resolved.value === "string") {
    resolved.resolvedValue = await resolveString(
      resolved.value,
      showData,
      context
    );
  } else {
    resolved.resolvedValue = resolved.value;
  }

  return resolved;
}

module.exports = {
  resolveString,
  resolveStep,
  resolveExpression,
  getNestedValue,
};
