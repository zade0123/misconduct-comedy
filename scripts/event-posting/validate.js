#!/usr/bin/env node
/**
 * validate.js
 * Validates a show markdown file and previews how it would be posted.
 *
 * Usage:
 *   node scripts/event-posting/validate.js --show src/shows/2026-07-10-misconduct-comedy-showcase.md
 */

"use strict";

const path = require("path");
const fs = require("fs");
const fsExtra = require("fs-extra");
const chalk = require("chalk");
const dayjs = require("dayjs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { parseShow } = require("./lib/markdown");
const { resolveString, getNestedValue } = require("./lib/template");
const { appendUtm, slugify } = require("./lib/utm");
const { resolveImagePath } = require("./lib/images");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const argv = yargs(hideBin(process.argv))
  .option("show", {
    alias: "f",
    type: "string",
    describe: "Path to the show markdown file",
    demandOption: true,
  })
  .help()
  .argv;

(async () => {
  try {
    const showData = parseShow(argv.show);
    let hasErrors = false;
    let hasWarnings = false;

    const err = (msg) => { console.log(chalk.red(`  ✗  ${msg}`)); hasErrors = true; };
    const warn = (msg) => { console.log(chalk.yellow(`  ⚠  ${msg}`)); hasWarnings = true; };
    const ok = (msg) => console.log(chalk.green(`  ✓  ${msg}`));
    const info = (msg) => console.log(chalk.gray(`     ${msg}`));

    console.log(chalk.bold.cyan(`\n🔎  Validating show file: ${argv.show}\n`));

    // ─── Required fields ───────────────────────────────────────────────────
    console.log(chalk.bold("Required Fields"));
    const required = ["title", "showDate", "description", "organizerName"];
    for (const field of required) {
      if (showData[field]) {
        ok(`${field}: ${String(showData[field]).slice(0, 80)}`);
      } else {
        err(`Missing required field: ${field}`);
      }
    }

    // ─── Showtimes ─────────────────────────────────────────────────────────
    console.log(chalk.bold("\nShowtimes"));
    const showtimes = showData.showtimes || [];
    if (showtimes.length === 0) {
      err("No showtimes defined");
    } else {
      for (let i = 0; i < showtimes.length; i++) {
        const st = showtimes[i];
        const startD = dayjs(st.startDate);
        const endD = dayjs(st.endDate);

        if (!st.startDate) {
          err(`showtimes[${i}].startDate is missing`);
        } else if (!startD.isValid()) {
          err(`showtimes[${i}].startDate is not a valid date: ${st.startDate}`);
        } else {
          ok(`showtimes[${i}].startDate: ${startD.format("MMMM D, YYYY h:mm A")}`);
        }

        if (!st.endDate) {
          warn(`showtimes[${i}].endDate is missing`);
        } else if (!endD.isValid()) {
          err(`showtimes[${i}].endDate is not a valid date: ${st.endDate}`);
        } else {
          ok(`showtimes[${i}].endDate: ${endD.format("MMMM D, YYYY h:mm A")}`);
          // Warn if end is before start
          if (startD.isValid() && endD.isBefore(startD)) {
            warn(`showtimes[${i}].endDate (${endD.format("MMMM D, YYYY")}) appears EARLIER than startDate (${startD.format("MMMM D, YYYY")}) — is this correct?`);
          }
        }

        if (!st.ticketUrl) {
          warn(`showtimes[${i}].ticketUrl is missing`);
        } else {
          ok(`showtimes[${i}].ticketUrl: ${st.ticketUrl}`);
        }

        if (st.ticketPrice == null) {
          warn(`showtimes[${i}].ticketPrice is missing`);
        } else {
          ok(`showtimes[${i}].ticketPrice: $${st.ticketPrice}`);
        }
      }
    }

    // ─── Location ──────────────────────────────────────────────────────────
    console.log(chalk.bold("\nLocation"));
    const loc = showData.location || {};
    const locFields = ["name", "streetAddress", "city", "state", "postalCode"];
    for (const field of locFields) {
      if (loc[field]) {
        ok(`location.${field}: ${loc[field]}`);
      } else {
        warn(`location.${field} is missing`);
      }
    }

    // ─── Images ────────────────────────────────────────────────────────────
    console.log(chalk.bold("\nImages"));
    const images = showData.images || [];
    if (images.length === 0) {
      warn("No images defined");
    } else {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        if (!img.src) {
          warn(`images[${i}].src is missing`);
          continue;
        }
        const localPath = resolveImagePath(img.src);
        if (fs.existsSync(localPath)) {
          ok(`images[${i}].src: ${img.src} (file exists)`);
        } else {
          err(`images[${i}].src: ${img.src} — LOCAL FILE NOT FOUND at: ${localPath}`);
        }
      }
    }

    // ─── UTM preview per template ──────────────────────────────────────────
    const templatesDir = path.join(PROJECT_ROOT, "scripts/event-posting/templates");
    if (fsExtra.existsSync(templatesDir)) {
      const templateFiles = fs.readdirSync(templatesDir).filter((f) => f.endsWith(".template.json"));

      if (templateFiles.length > 0) {
        console.log(chalk.bold("\nUTM Link Previews"));

        for (const tmplFile of templateFiles) {
          const site = tmplFile.replace(".template.json", "");
          const st0 = (showData.showtimes || [])[0] || {};
          const showDate = st0.startDate || showData.showDate || "";
          const titleSlug = slugify(showData.title || "");

          if (st0.ticketUrl) {
            const utmUrl = appendUtm(st0.ticketUrl, site, showDate, titleSlug);
            info(`[${site}] ${utmUrl}`);
          }
        }

        // ─── Image requirements preview ──────────────────────────────────
        console.log(chalk.bold("\nImage Requirements Preview"));

        for (const tmplFile of templateFiles) {
          const site = tmplFile.replace(".template.json", "");
          const tmpl = await fsExtra.readJson(path.join(templatesDir, tmplFile));
          if (tmpl.imageRequirements && images[0]) {
            const req = tmpl.imageRequirements;
            info(
              `[${site}] ${req.width}x${req.height} ${req.fit} ${req.format} quality:${req.quality}`
            );
          }
        }
      }
    }

    // ─── Summary ───────────────────────────────────────────────────────────
    console.log();
    if (hasErrors) {
      console.log(chalk.bold.red("  ❌  Validation failed with errors. Fix them before posting.\n"));
      process.exit(1);
    } else if (hasWarnings) {
      console.log(chalk.bold.yellow("  ⚠️   Validation passed with warnings. Review before posting.\n"));
    } else {
      console.log(chalk.bold.green("  ✅  All checks passed. Ready to post.\n"));
    }
  } catch (err) {
    console.error(chalk.red(`\nFatal: ${err.message}`));
    process.exit(1);
  }
})();
