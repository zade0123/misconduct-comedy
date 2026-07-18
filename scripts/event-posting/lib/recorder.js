/**
 * recorder.js
 * Sets up a Playwright browser session that records all user interactions
 * with a form-based event submission website.
 */

"use strict";

const path = require("path");
const fsExtra = require("fs-extra");
const chalk = require("chalk");
const { chromium } = require("playwright");

const PROJECT_ROOT = path.resolve(__dirname, "../../..");

/**
 * Browser-side script injected into every page to capture form interactions.
 * Sends captured events back to Node via page.exposeFunction("__recordEvent").
 */
const BROWSER_CAPTURE_SCRIPT = `
(function() {
  if (window.__recordingInjected) return;
  window.__recordingInjected = true;

  function getSelectors(el) {
    const selectors = {};
    if (el.id)          selectors.id = el.id;
    if (el.name)        selectors.name = el.name;
    if (el.getAttribute('aria-label')) selectors.ariaLabel = el.getAttribute('aria-label');
    if (el.placeholder) selectors.placeholder = el.placeholder;

    // Label text
    if (el.id) {
      const label = document.querySelector('label[for="' + el.id + '"]');
      if (label) selectors.labelText = label.textContent.trim();
    }
    // Wrapping label
    const wrappingLabel = el.closest('label');
    if (wrappingLabel && !selectors.labelText) {
      const clone = wrappingLabel.cloneNode(true);
      clone.querySelectorAll('input,select,textarea').forEach(n => n.remove());
      const t = clone.textContent.trim();
      if (t) selectors.labelText = t;
    }

    // CSS path (simplified)
    try {
      selectors.css = getCssPath(el);
    } catch(e) {}

    return selectors;
  }

  function getCssPath(el) {
    const parts = [];
    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();
      if (el.id) {
        selector += '#' + el.id;
        parts.unshift(selector);
        break;
      }
      const siblings = Array.from(el.parentNode ? el.parentNode.children : []);
      const sameTag = siblings.filter(s => s.nodeName === el.nodeName);
      if (sameTag.length > 1) {
        selector += ':nth-child(' + (siblings.indexOf(el) + 1) + ')';
      }
      parts.unshift(selector);
      el = el.parentElement;
    }
    return parts.join(' > ');
  }

  function emit(eventObj) {
    if (typeof window.__recordEvent === 'function') {
      window.__recordEvent(JSON.stringify(eventObj));
    }
  }

  // Track input / change on form fields
  document.addEventListener('input', function(e) {
    const el = e.target;
    if (!el || !['INPUT','TEXTAREA','SELECT'].includes(el.tagName)) return;
    const selectors = getSelectors(el);
    emit({
      type: el.tagName === 'SELECT' ? 'select' : 'input',
      selectors,
      value: el.value,
      inputType: el.type || '',
      tagName: el.tagName,
      url: window.location.href,
      timestamp: Date.now()
    });
  }, true);

  // Track checkboxes and radio buttons
  document.addEventListener('change', function(e) {
    const el = e.target;
    if (!el) return;
    if (el.type === 'checkbox' || el.type === 'radio') {
      const selectors = getSelectors(el);
      emit({
        type: el.type === 'checkbox' ? 'checkbox' : 'radio',
        selectors,
        value: el.value,
        checked: el.checked,
        tagName: el.tagName,
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }, true);

  // Track clicks on buttons
  document.addEventListener('click', function(e) {
    const el = e.target.closest('button,[type="button"],[type="submit"],[role="button"]');
    if (!el) return;
    const selectors = getSelectors(el);
    const isSubmit = el.type === 'submit' ||
                     el.getAttribute('type') === 'submit' ||
                     (el.textContent || '').toLowerCase().includes('submit') ||
                     (el.textContent || '').toLowerCase().includes('post') ||
                     (el.textContent || '').toLowerCase().includes('publish');
    emit({
      type: isSubmit ? 'submit' : 'click',
      selectors,
      label: el.textContent.trim().slice(0, 100),
      url: window.location.href,
      timestamp: Date.now()
    });
  }, true);

  // Track contenteditable
  document.addEventListener('input', function(e) {
    const el = e.target;
    if (el && el.contentEditable === 'true') {
      const selectors = getSelectors(el);
      emit({
        type: 'contenteditable',
        selectors,
        value: el.innerText || el.textContent || '',
        url: window.location.href,
        timestamp: Date.now()
      });
    }
  }, true);
})();
`;

/**
 * Run a recording session for a site.
 *
 * @param {object} opts
 * @param {string} opts.site         - Site key, e.g. "goodthingsphl"
 * @param {string} [opts.startUrl]   - Optional URL to open immediately
 */
async function runRecordingSession(opts = {}) {
  const { site, startUrl } = opts;

  if (!site) throw new Error("--site is required");

  const recordingsDir = path.join(PROJECT_ROOT, "scripts/event-posting/recordings");
  const screenshotsDir = path.join(PROJECT_ROOT, "scripts/event-posting/screenshots");
  const profileDir = path.join(PROJECT_ROOT, "scripts/event-posting/browser-profiles", site);

  fsExtra.ensureDirSync(recordingsDir);
  fsExtra.ensureDirSync(screenshotsDir);
  fsExtra.ensureDirSync(profileDir);

  console.log(chalk.bold.green(`\n🎬  Starting recording session for: ${site}`));
  console.log(chalk.gray("  Navigate to the event submission form and fill it out as normal."));
  console.log(chalk.gray("  When done, close the browser window to save the recording.\n"));

  // Use persistent context so login sessions are preserved
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    viewport: { width: 1280, height: 900 },
    slowMo: 50,
  });

  const events = [];
  const visitedUrls = new Set();

  /**
   * Attach recording hooks to any page (initial or popup/new tab).
   * Safe to call multiple times — guards against double-exposure.
   */
  async function setupPage(p) {
    // exposeFunction throws if the name is already exposed on this page
    await p.exposeFunction("__recordEvent", (jsonStr) => {
      try {
        const evt = JSON.parse(jsonStr);
        events.push(evt);
      } catch { /* ignore malformed */ }
    }).catch(() => {});

    // addInitScript runs on every navigation within this page
    await p.addInitScript(BROWSER_CAPTURE_SCRIPT).catch(() => {});

    // Track URLs visited on this page
    p.on("framenavigated", (frame) => {
      if (frame === p.mainFrame()) {
        visitedUrls.add(frame.url());
      }
    });

    // If the page already has content (e.g. persistent context restored a tab),
    // manually run the capture script now so it covers the current load.
    await p.evaluate(BROWSER_CAPTURE_SCRIPT).catch(() => {});
  }

  // Set up any pages that already exist in the persistent context
  // (restored from a previous session, e.g. after login)
  for (const existingPage of context.pages()) {
    await setupPage(existingPage);
  }

  // Set up every new page / popup that opens during the session
  context.on("page", (newPage) => {
    setupPage(newPage).catch(() => {});
    console.log(chalk.gray(`  [recorder] New page/tab detected: will record interactions there too.`));
  });

  // Open a fresh tab if none exist yet (persistent context may have restored tabs)
  let page;
  if (context.pages().length === 0) {
    page = await context.newPage();
    await setupPage(page);
  } else {
    page = context.pages()[0];
  }

  // Optionally navigate to a starting URL
  if (startUrl) {
    await page.goto(startUrl, { waitUntil: "domcontentloaded" }).catch(() => {});
  }

  console.log(chalk.yellow("Waiting for browser to close…\n"));
  console.log(chalk.gray("  Tip: You can open new tabs and popups freely — all will be recorded.\n"));

  // Wait until the context closes (user shuts the browser).
  // We use a polling loop instead of waitForEvent so that navigation
  // errors or popup openings never accidentally resolve the wait early.
  await new Promise((resolve) => {
    context.once("close", resolve);
  });

  // Take final screenshot if page is still open
  const pages = context.pages();
  if (pages.length > 0) {
    const screenshotPath = path.join(
      screenshotsDir,
      `${site}_recording_final_${Date.now()}.png`
    );
    await pages[0].screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    console.log(chalk.gray(`  Screenshot saved: ${screenshotPath}`));
  }

  await context.close().catch(() => {});

  // Build the recording object
  const recording = {
    site,
    recordedAt: new Date().toISOString(),
    visitedUrls: Array.from(visitedUrls),
    events,
  };

  // Save recording JSON
  const recordingPath = path.join(recordingsDir, `${site}.recording.json`);
  await fsExtra.writeJson(recordingPath, recording, { spaces: 2 });
  console.log(chalk.green(`\n✅  Recording saved: ${recordingPath}`));
  console.log(chalk.bold(`  Total events captured: ${events.length}\n`));

  return recording;
}

module.exports = { runRecordingSession };
