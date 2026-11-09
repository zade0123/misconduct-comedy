/**
 * replay.js
 * Replays a resolved template against an event submission website.
 * Handles CAPTCHA detection, missing selectors, and pre-submit review.
 */

"use strict";

const path = require("path");
const fsExtra = require("fs-extra");
const chalk = require("chalk");
const dayjs = require("dayjs");
const { chromium } = require("playwright");

const { findElement } = require("./selectors");
const { resolveStep } = require("./template");
const { askSubmitAction, waitForEnter } = require("./terminalPrompt");

const PROJECT_ROOT = path.resolve(__dirname, "../../..");

/** Phrases that suggest a CAPTCHA or bot-challenge page */
const CAPTCHA_SIGNALS = [
  /captcha/i,
  /are you a robot/i,
  /bot detection/i,
  /cloudflare/i,
  /i am not a robot/i,
  /human verification/i,
  /security check/i,
  /verify you are human/i,
];

/**
 * Check whether the current page looks like a CAPTCHA / challenge page.
 * @param {import('playwright').Page} page
 * @returns {Promise<boolean>}
 */
async function detectCaptcha(page) {
  const content = await page.content().catch(() => "");
  return CAPTCHA_SIGNALS.some((re) => re.test(content));
}

/**
 * Handle an unexpected state: take a screenshot, print a message, and
 * give the user a chance to fix things manually before continuing.
 *
 * @param {import('playwright').Page} page
 * @param {string}  reason         - Description of the problem
 * @param {string}  site
 * @param {object}  opts
 * @param {boolean} [opts.allowQuit] - If true, allow "q" to quit
 * @returns {Promise<"continue"|"quit">}
 */
async function handleUnexpected(page, reason, site, opts = {}) {
  const screenshotsDir = path.join(PROJECT_ROOT, "scripts/event-posting/screenshots");
  fsExtra.ensureDirSync(screenshotsDir);

  const screenshotPath = path.join(
    screenshotsDir,
    `${site}_issue_${Date.now()}.png`
  );
  await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});

  console.log(chalk.bold.red(`\n⚠️  Issue detected: ${reason}`));
  console.log(chalk.gray(`   Screenshot: ${screenshotPath}`));
  console.log(chalk.yellow("   Please fix the issue manually in the browser window."));

  await waitForEnter("   Press ENTER when ready to continue (or type q + ENTER to quit): ");

  return "continue";
}

/**
 * Execute a single template step against the page.
 *
 * @param {import('playwright').Page} page
 * @param {object}  step       - Resolved template step (has resolvedValue)
 * @param {string}  site
 * @param {object}  opts
 * @param {boolean} [opts.dryRun]
 * @returns {Promise<"ok"|"issue">}
 */
async function executeStep(page, step, site, opts = {}) {
  const { action, selectors, resolvedValue, label } = step;
  const { dryRun = false } = opts;

  const desc = label || selectors?.labelText || selectors?.id || action;

  if (dryRun) {
    console.log(
      chalk.gray(`  [dry-run] ${action.padEnd(14)} | ${desc.padEnd(40)} | ${String(resolvedValue).slice(0, 60)}`)
    );
    return "ok";
  }

  // Navigate action
  if (action === "navigate") {
    console.log(chalk.blue(`  → Navigate to: ${resolvedValue || step.url}`));
    await page.goto(resolvedValue || step.url, { waitUntil: "domcontentloaded" });

    if (await detectCaptcha(page)) {
      await handleUnexpected(page, "CAPTCHA or bot-challenge detected", site);
    }
    return "ok";
  }

  // Find the element
  const el = await findElement(page, selectors || {});

  if (!el) {
    console.log(chalk.red(`  ✗ Could not find element: ${desc}`));
    const result = await handleUnexpected(
      page,
      `Selector not found for field: ${desc}`,
      site
    );
    return result === "quit" ? "issue" : "ok";
  }

  try {
    switch (action) {
      case "fill": {
        await el.fill(String(resolvedValue || ""));
        console.log(chalk.green(`  ✓ fill     | ${desc.padEnd(40)} | ${String(resolvedValue).slice(0, 60)}`));
        break;
      }

      case "select": {
        await el.selectOption(String(resolvedValue || ""));
        console.log(chalk.green(`  ✓ select   | ${desc.padEnd(40)} | ${String(resolvedValue).slice(0, 60)}`));
        break;
      }

      case "check": {
        const shouldCheck = resolvedValue !== "false" && resolvedValue !== false;
        if (shouldCheck) {
          await el.check();
        } else {
          await el.uncheck();
        }
        console.log(chalk.green(`  ✓ check    | ${desc.padEnd(40)} | ${shouldCheck}`));
        break;
      }

      case "radio": {
        await el.check();
        console.log(chalk.green(`  ✓ radio    | ${desc.padEnd(40)} | ${resolvedValue}`));
        break;
      }

      case "click": {
        await el.click();
        console.log(chalk.green(`  ✓ click    | ${desc.padEnd(40)}`));
        break;
      }

      case "upload": {
        await el.setInputFiles(String(resolvedValue || ""));
        console.log(chalk.green(`  ✓ upload   | ${desc.padEnd(40)} | ${String(resolvedValue).slice(0, 60)}`));
        break;
      }

      case "contenteditable": {
        await el.fill(String(resolvedValue || ""));
        console.log(chalk.green(`  ✓ content  | ${desc.padEnd(40)} | ${String(resolvedValue).slice(0, 60)}`));
        break;
      }

      default:
        console.log(chalk.yellow(`  ? Unknown action "${action}" – skipping`));
    }
  } catch (err) {
    console.log(chalk.red(`  ✗ Error on "${desc}": ${err.message}`));
    await handleUnexpected(page, `Error executing step "${desc}": ${err.message}`, site);
  }

  // After each step, briefly check for unexpected popups/challenges
  if (await detectCaptcha(page)) {
    await handleUnexpected(page, "CAPTCHA appeared after a form step", site);
  }

  return "ok";
}

/**
 * Main replay function.
 *
 * @param {object}  opts
 * @param {string}  opts.site
 * @param {object}  opts.showData       - Parsed markdown frontmatter
 * @param {Array}   opts.steps          - Resolved template steps
 * @param {object}  [opts.imageRequirements]
 * @param {boolean} [opts.dryRun]
 * @param {boolean} [opts.autoSubmit]   - Skip pre-submit prompt (not recommended)
 * @param {boolean} [opts.forceImage]
 * @returns {Promise<"submitted"|"skipped"|"manual"|"dry-run">}
 */
async function runReplay(opts = {}) {
  const {
    site,
    steps = [],
    dryRun = false,
    autoSubmit = false,
    forceImage = false,
  } = opts;

  if (!site) throw new Error("site is required");

  const profileDir = path.join(
    PROJECT_ROOT,
    "scripts/event-posting/browser-profiles",
    site
  );
  fsExtra.ensureDirSync(profileDir);

  if (dryRun) {
    console.log(chalk.bold.cyan(`\n🔍  DRY RUN for site: ${site}\n`));
    for (const step of steps) {
      await executeStep(null, step, site, { dryRun: true });
    }
    console.log(chalk.bold.cyan("\n✅  Dry run complete. No browser opened.\n"));
    return "dry-run";
  }

  console.log(chalk.bold.green(`\n🚀  Replaying steps for site: ${site}\n`));

  // Persistent context preserves login sessions
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    slowMo: 80,
  });

  const page = await context.newPage();

  const screenshotsDir = path.join(
    PROJECT_ROOT,
    "scripts/event-posting/screenshots"
  );
  fsExtra.ensureDirSync(screenshotsDir);

  // Execute all non-submit steps
  const submitStep = steps.find((s) => s.action === "submit");
  const regularSteps = steps.filter((s) => s.action !== "submit");

  for (const step of regularSteps) {
    await executeStep(page, step, site, { dryRun: false });

    // Small delay between steps for page stability
    await page.waitForTimeout(300).catch(() => {});
  }

  // Pre-submit screenshot
  const preScreenshot = path.join(
    screenshotsDir,
    `${site}_pre-submit_${Date.now()}.png`
  );
  await page.screenshot({ path: preScreenshot, fullPage: true }).catch(() => {});
  console.log(chalk.gray(`\n  Pre-submit screenshot: ${preScreenshot}`));

  // Ask the user what to do
  let action = "submit";
  if (!autoSubmit) {
    console.log(chalk.yellow("\n  The form has been filled. Please review it in the browser."));
    action = await askSubmitAction();
  }

  let outcome;

  if (action === "submit") {
    if (submitStep) {
      const el = await findElement(page, submitStep.selectors || {});
      if (el) {
        await el.click();
        console.log(chalk.bold.green("\n  ✅  Form submitted!"));
        await page.waitForTimeout(3000).catch(() => {});
      } else {
        console.log(chalk.red("  ✗ Submit button not found. Please submit manually."));
        await waitForEnter("  Press ENTER after submitting manually...");
      }
    } else {
      console.log(chalk.yellow("  No submit step found in template. Please submit manually."));
      await waitForEnter("  Press ENTER after submitting manually...");
    }

    // Post-submit screenshot
    const postScreenshot = path.join(
      screenshotsDir,
      `${site}_post-submit_${Date.now()}.png`
    );
    await page.screenshot({ path: postScreenshot, fullPage: true }).catch(() => {});
    console.log(chalk.gray(`  Post-submit screenshot: ${postScreenshot}`));

    outcome = "submitted";
  } else if (action === "skip") {
    console.log(chalk.yellow("\n  Skipped submission for this site."));
    outcome = "skipped";
  } else {
    console.log(chalk.yellow("\n  Saved as manual review."));
    outcome = "manual";
  }

  await context.close().catch(() => {});
  return outcome;
}

module.exports = { runReplay };
