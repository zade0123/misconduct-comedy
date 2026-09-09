/**
 * selectors.js
 * Utilities for building and trying multiple selector candidates in Playwright.
 */

"use strict";

/**
 * Priority order for trying selectors during replay.
 * Most specific/stable selectors first.
 */
const SELECTOR_PRIORITY = ["id", "name", "ariaLabel", "placeholder", "labelText", "css", "xpath"];

/**
 * Try each selector candidate in priority order.
 * Returns the first locator that resolves to at least one element.
 *
 * @param {import('playwright').Page} page
 * @param {object} selectorCandidates  - { id, name, ariaLabel, placeholder, labelText, css, xpath }
 * @param {object} [opts]
 * @param {number} [opts.timeout]
 * @returns {Promise<import('playwright').Locator|null>}
 */
async function findElement(page, selectorCandidates, opts = {}) {
  const timeout = opts.timeout || 5000;

  for (const key of SELECTOR_PRIORITY) {
    const candidate = selectorCandidates[key];
    if (!candidate) continue;

    let locator;

    try {
      switch (key) {
        case "id":
          locator = page.locator(`#${CSS.escape(candidate)}`);
          break;
        case "name":
          locator = page.locator(`[name="${candidate}"]`);
          break;
        case "ariaLabel":
          locator = page.getByRole("textbox", { name: candidate, exact: false });
          // Fallback to generic aria-label if role-based fails
          if (!(await locator.count().catch(() => 0))) {
            locator = page.locator(`[aria-label="${candidate}"]`);
          }
          break;
        case "placeholder":
          locator = page.locator(`[placeholder="${candidate}"]`);
          break;
        case "labelText":
          locator = page.getByLabel(candidate, { exact: false });
          break;
        case "css":
          locator = page.locator(candidate);
          break;
        case "xpath":
          locator = page.locator(`xpath=${candidate}`);
          break;
        default:
          continue;
      }

      const count = await locator.count();
      if (count > 0) {
        return locator.first();
      }
    } catch {
      // Selector failed – try next
      continue;
    }
  }

  return null;
}

/**
 * Build a CSS.escape polyfill (Node has no DOM CSS object).
 * @param {string} value
 * @returns {string}
 */
// Polyfill CSS.escape if not present (Node.js environment)
if (typeof CSS === "undefined") {
  global.CSS = {
    escape(value) {
      return value.replace(/([^\w-])/g, "\\$1");
    },
  };
}

module.exports = { findElement, SELECTOR_PRIORITY };
