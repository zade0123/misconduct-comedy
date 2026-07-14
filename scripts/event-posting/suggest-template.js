#!/usr/bin/env node
/**
 * suggest-template.js
 * Compares a recorded template's values against a show's markdown data,
 * suggests {{variable}} mappings, and optionally writes an updated template.
 *
 * Usage:
 *   node scripts/event-posting/suggest-template.js \
 *     --site goodthingsphl \
 *     --show src/shows/2026-07-10-misconduct-comedy-showcase.md
 *
 *   Add --write to save the suggestions back to the template file.
 */

"use strict";

const path = require("path");
const fsExtra = require("fs-extra");
const chalk = require("chalk");
const dayjs = require("dayjs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { parseShow } = require("./lib/markdown");
const { slugify } = require("./lib/utm");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const argv = yargs(hideBin(process.argv))
  .option("site", {
    alias: "s",
    type: "string",
    describe: "Site key",
    demandOption: true,
  })
  .option("show", {
    alias: "f",
    type: "string",
    describe: "Path to the show markdown file",
    demandOption: true,
  })
  .option("write", {
    alias: "w",
    type: "boolean",
    describe: "Write suggestions back to the template file",
    default: false,
  })
  .help()
  .argv;

(async () => {
  try {
    const templatePath = path.join(
      PROJECT_ROOT,
      "scripts/event-posting/templates",
      `${argv.site}.template.json`
    );

    if (!fsExtra.existsSync(templatePath)) {
      console.error(
        chalk.red(
          `Template not found: ${templatePath}\nRun record.js first to create a recording.`
        )
      );
      process.exit(1);
    }

    const template = await fsExtra.readJson(templatePath);
    const showData = parseShow(argv.show);

    console.log(
      chalk.bold.cyan(
        `\n🔍  Suggesting variable mappings for: ${argv.site}\n`
      )
    );

    // Build a flat map of all comparable values from the show data
    const valueMap = buildValueMap(showData);

    const COL = { label: 30, recorded: 40, suggested: 40, conf: 8 };
    const header =
      chalk.bold(
        "Field".padEnd(COL.label) +
          "Recorded Value".padEnd(COL.recorded) +
          "Suggested Variable".padEnd(COL.suggested) +
          "Conf".padEnd(COL.conf) +
          "Preview"
      );
    const divider = "─".repeat(160);

    console.log(header);
    console.log(divider);

    const updatedSteps = [];

    for (const step of template.steps || []) {
      if (!step.recordedValue && !step.value) {
        updatedSteps.push(step);
        continue;
      }

      const recordedStr = String(step.recordedValue || step.value || "");
      const suggestion = suggestMapping(recordedStr, valueMap, showData);
      const label = (step.label || step.action || "").slice(0, COL.label - 2);

      const confColor =
        suggestion.confidence === "high"
          ? chalk.green
          : suggestion.confidence === "medium"
          ? chalk.yellow
          : chalk.gray;

      console.log(
        label.padEnd(COL.label) +
          chalk.gray(recordedStr.slice(0, COL.recorded - 2).padEnd(COL.recorded)) +
          chalk.cyan((suggestion.variable || "(no match)").padEnd(COL.suggested)) +
          confColor((suggestion.confidence || "none").padEnd(COL.conf)) +
          chalk.white(String(suggestion.preview || "").slice(0, 60))
      );

      const updatedStep = { ...step };
      if (suggestion.variable && suggestion.confidence !== "none") {
        updatedStep.suggestedValue = suggestion.variable;
        if (argv.write) {
          updatedStep.value = suggestion.variable;
        }
      }
      updatedSteps.push(updatedStep);
    }

    console.log(divider + "\n");

    if (argv.write) {
      const updatedTemplate = { ...template, steps: updatedSteps };
      await fsExtra.writeJson(templatePath, updatedTemplate, { spaces: 2 });
      console.log(chalk.green(`✅  Template updated: ${templatePath}\n`));
    } else {
      console.log(
        chalk.gray(
          "  Tip: Run with --write to save suggestions to the template file.\n"
        )
      );
    }
  } catch (err) {
    console.error(chalk.red(`\nFatal: ${err.message}`));
    process.exit(1);
  }
})();

/**
 * Build a flat lookup map of { "stringValue": "{{variable}}" } from show data.
 * Includes date/time formatted variants.
 *
 * @param {object} showData
 * @returns {Map<string, { variable: string, preview: string }>}
 */
function buildValueMap(showData) {
  const map = new Map();

  const add = (variable, rawValue, preview) => {
    const str = String(rawValue ?? "").trim();
    if (!str) return;
    // Store both original and lowercase for case-insensitive matching
    map.set(str, { variable, preview: preview || str });
    map.set(str.toLowerCase(), { variable, preview: preview || str });
  };

  // Scalar fields
  add("{{title}}", showData.title);
  add("{{subtitle}}", showData.subtitle);
  add("{{showDate}}", showData.showDate);
  add("{{description}}", showData.description);
  add("{{ageRestriction}}", showData.ageRestriction);
  add("{{organizerName}}", showData.organizerName);
  add("{{organizerUrl}}", showData.organizerUrl);
  add("{{showType}}", showData.showType);

  // Location
  const loc = showData.location || {};
  add("{{location.name}}", loc.name);
  add("{{location.streetAddress}}", loc.streetAddress);
  add("{{location.city}}", loc.city);
  add("{{location.state}}", loc.state);
  add("{{location.postalCode}}", loc.postalCode);

  // Combined address variants
  if (loc.streetAddress && loc.city && loc.state) {
    add(
      "{{location.streetAddress}}",
      `${loc.streetAddress}, ${loc.city}, ${loc.state}`
    );
  }

  // Showtime
  const st = (showData.showtimes || [])[0] || {};
  if (st.ticketUrl) add("{{showtimes.0.ticketUrl}}", st.ticketUrl);
  if (st.ticketPrice) {
    add("{{showtimes.0.ticketPrice}}", st.ticketPrice);
    add("{{showtimes.0.ticketPrice}}", `$${st.ticketPrice}`);
    add("{{showtimes.0.ticketPrice}}", `${st.ticketPrice}.00`);
  }

  // Date formats
  if (st.startDate) {
    const d = dayjs(st.startDate);
    if (d.isValid()) {
      add(`{{showtimes.0.startDate | date:MM/DD/YYYY}}`, d.format("MM/DD/YYYY"));
      add(`{{showtimes.0.startDate | date:YYYY-MM-DD}}`, d.format("YYYY-MM-DD"));
      add(`{{showtimes.0.startDate | date:MMMM D, YYYY}}`, d.format("MMMM D, YYYY"));
      add(`{{showtimes.0.startDate | date:M/D/YYYY}}`, d.format("M/D/YYYY"));
      add(`{{showtimes.0.startDate | time:h:mm A}}`, d.format("h:mm A"));
      add(`{{showtimes.0.startDate | time:HH:mm}}`, d.format("HH:mm"));
    }
  }
  if (st.endDate) {
    const d = dayjs(st.endDate);
    if (d.isValid()) {
      add(`{{showtimes.0.endDate | date:MM/DD/YYYY}}`, d.format("MM/DD/YYYY"));
      add(`{{showtimes.0.endDate | date:YYYY-MM-DD}}`, d.format("YYYY-MM-DD"));
      add(`{{showtimes.0.endDate | time:h:mm A}}`, d.format("h:mm A"));
      add(`{{showtimes.0.endDate | time:HH:mm}}`, d.format("HH:mm"));
    }
  }

  // Image
  const img = (showData.images || [])[0] || {};
  if (img.src) {
    add("{{images.0.src}}", img.src);
    // Also match just the filename
    add("{{images.0.src | imagePath}}", img.src.split("/").pop() || img.src);
  }

  return map;
}

/**
 * Suggest a variable mapping for a recorded value string.
 *
 * @param {string} recordedStr
 * @param {Map}    valueMap
 * @param {object} showData
 * @returns {{ variable: string|null, confidence: string, preview: string }}
 */
function suggestMapping(recordedStr, valueMap, showData) {
  if (!recordedStr) return { variable: null, confidence: "none", preview: "" };

  // Exact match
  const exact = valueMap.get(recordedStr) || valueMap.get(recordedStr.toLowerCase());
  if (exact) {
    return { variable: exact.variable, confidence: "high", preview: exact.preview };
  }

  // Partial / substring match
  for (const [val, mapping] of valueMap) {
    if (val && recordedStr.includes(val) && val.length > 4) {
      return { variable: mapping.variable, confidence: "medium", preview: mapping.preview };
    }
    if (val && val.includes(recordedStr) && recordedStr.length > 4) {
      return { variable: mapping.variable, confidence: "medium", preview: mapping.preview };
    }
  }

  // Check for URL-like ticket URL (utm suggestion)
  const st = (showData.showtimes || [])[0] || {};
  if (
    st.ticketUrl &&
    recordedStr.startsWith("http") &&
    recordedStr.includes(st.ticketUrl.split("?")[0])
  ) {
    return {
      variable: "{{showtimes.0.ticketUrl | utm}}",
      confidence: "high",
      preview: st.ticketUrl,
    };
  }

  // Check for title slug
  const titleSlug = slugify(showData.title || "");
  if (titleSlug && recordedStr.toLowerCase().includes(titleSlug.slice(0, 10))) {
    return { variable: "{{title | slug}}", confidence: "low", preview: titleSlug };
  }

  return { variable: null, confidence: "none", preview: "" };
}
