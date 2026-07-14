#!/usr/bin/env node
/**
 * record.js
 * Records a manual browser session on an event listing site and produces:
 *   recordings/[site].recording.json   – raw event log
 *   templates/[site].template.json     – editable template with placeholder values
 *
 * Usage:
 *   node scripts/event-posting/record.js --site goodthingsphl
 *   node scripts/event-posting/record.js --site goodthingsphl --url https://goodthingsphl.com/submit
 */

"use strict";

const path = require("path");
const fsExtra = require("fs-extra");
const chalk = require("chalk");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { runRecordingSession } = require("./lib/recorder");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const argv = yargs(hideBin(process.argv))
  .option("site", {
    alias: "s",
    type: "string",
    describe: "Site key (e.g. goodthingsphl)",
    demandOption: true,
  })
  .option("url", {
    alias: "u",
    type: "string",
    describe: "Optional starting URL to open",
  })
  .help()
  .argv;

(async () => {
  try {
    const recording = await runRecordingSession({
      site: argv.site,
      startUrl: argv.url,
    });

    // Generate an editable template from the recording
    const template = buildTemplate(recording);

    const templatesDir = path.join(PROJECT_ROOT, "scripts/event-posting/templates");
    fsExtra.ensureDirSync(templatesDir);

    const templatePath = path.join(templatesDir, `${argv.site}.template.json`);
    await fsExtra.writeJson(templatePath, template, { spaces: 2 });

    console.log(chalk.bold.green(`📝  Template saved: ${templatePath}`));
    console.log(
      chalk.gray(
        "    Edit the template to replace recordedValue strings with {{variable}} expressions.\n"
      )
    );
  } catch (err) {
    console.error(chalk.red(`\nFatal error: ${err.message}`));
    process.exit(1);
  }
})();

/**
 * Convert a raw recording into an editable template.
 * Groups events by URL/page and collapses rapid input events into a single fill step.
 *
 * @param {object} recording
 * @returns {object} Template object
 */
function buildTemplate(recording) {
  const steps = [];

  // Start with a navigate step to the first visited URL
  if (recording.visitedUrls && recording.visitedUrls.length > 0) {
    steps.push({
      action: "navigate",
      url: recording.visitedUrls[0],
      value: recording.visitedUrls[0],
      comment: "Opening the event submission page",
    });
  }

  // Collapse input events: keep only the last value per selector key
  const lastInputBySelector = new Map();

  for (const evt of recording.events || []) {
    const key = selectorKey(evt.selectors);

    switch (evt.type) {
      case "input":
      case "contenteditable": {
        lastInputBySelector.set(key, evt);
        break;
      }
      case "select": {
        lastInputBySelector.set(key, evt);
        break;
      }
      case "checkbox":
      case "radio": {
        // These are discrete events – keep all
        steps.push({
          action: evt.type,
          label: evt.selectors?.labelText || evt.selectors?.id || "",
          selectors: evt.selectors,
          recordedValue: evt.type === "checkbox" ? evt.checked : evt.value,
          value: evt.type === "checkbox" ? evt.checked : evt.value,
          url: evt.url,
        });
        break;
      }
      case "click":
      case "submit": {
        // Flush pending inputs first
        for (const [, inputEvt] of lastInputBySelector) {
          steps.push(makeInputStep(inputEvt));
        }
        lastInputBySelector.clear();

        steps.push({
          action: evt.type,
          label: evt.label || "",
          selectors: evt.selectors,
          url: evt.url,
          comment: evt.type === "submit" ? "Submit the form" : undefined,
        });
        break;
      }
    }
  }

  // Flush any remaining input events
  for (const [, inputEvt] of lastInputBySelector) {
    steps.push(makeInputStep(inputEvt));
  }

  return {
    site: recording.site,
    generatedAt: new Date().toISOString(),
    recordingFile: `recordings/${recording.site}.recording.json`,
    imageRequirements: {
      comment: "Optional. Define image size requirements for this site.",
      width: 1200,
      height: 675,
      aspectRatio: "16:9",
      fit: "cover",
      format: "jpg",
      quality: 90,
    },
    steps,
  };
}

function makeInputStep(evt) {
  const action =
    evt.type === "contenteditable"
      ? "contenteditable"
      : evt.type === "select"
      ? "select"
      : "fill";

  return {
    action,
    label: evt.selectors?.labelText || evt.selectors?.ariaLabel || evt.selectors?.placeholder || evt.selectors?.id || "",
    selectors: evt.selectors,
    recordedValue: evt.value,
    value: evt.value,
    comment: "Replace recordedValue with a {{variable}} expression",
  };
}

function selectorKey(selectors = {}) {
  return selectors.id || selectors.name || selectors.ariaLabel || selectors.placeholder || selectors.css || Math.random().toString();
}
