#!/usr/bin/env node
/**
 * post.js
 * Loads a show markdown file, resolves a site template, and replays
 * the form steps in a real browser to post an event listing.
 *
 * Usage:
 *   node scripts/event-posting/post.js --site goodthingsphl --show src/shows/2026-07-10-misconduct-comedy-showcase.md
 *   node scripts/event-posting/post.js --sites goodthingsphl,evvnts --show src/shows/...md
 *   node scripts/event-posting/post.js --site goodthingsphl --show src/shows/...md --dry-run
 *   node scripts/event-posting/post.js --site goodthingsphl --show src/shows/...md --force-image
 */

"use strict";

const path = require("path");
const fsExtra = require("fs-extra");
const chalk = require("chalk");
const dayjs = require("dayjs");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");

const { parseShow } = require("./lib/markdown");
const { resolveStep } = require("./lib/template");
const { runReplay } = require("./lib/replay");

const PROJECT_ROOT = path.resolve(__dirname, "../..");

const argv = yargs(hideBin(process.argv))
  .option("site", {
    alias: "s",
    type: "string",
    describe: "Single site key (e.g. goodthingsphl)",
  })
  .option("sites", {
    type: "string",
    describe: "Comma-separated list of site keys",
  })
  .option("show", {
    alias: "f",
    type: "string",
    describe: "Path to the show markdown file",
    demandOption: true,
  })
  .option("dry-run", {
    type: "boolean",
    describe: "Print resolved steps without opening a browser",
    default: false,
  })
  .option("force-image", {
    type: "boolean",
    describe: "Regenerate prepared images even if cached versions exist",
    default: false,
  })
  .option("auto-submit", {
    type: "boolean",
    describe: "Skip the pre-submit confirmation prompt (use with caution)",
    default: false,
  })
  .check((argv) => {
    if (!argv.site && !argv.sites) {
      throw new Error("Provide --site or --sites");
    }
    return true;
  })
  .help()
  .argv;

(async () => {
  // Collect list of sites to post to
  const sites = argv.sites
    ? argv.sites.split(",").map((s) => s.trim()).filter(Boolean)
    : [argv.site];

  const showData = parseShow(argv.show);

  console.log(chalk.bold(`\n🎭  Show: ${showData.title}`));
  console.log(chalk.gray(`    Date: ${showData.showDate || "N/A"}`));
  console.log(chalk.gray(`    Sites: ${sites.join(", ")}\n`));

  const logDir = path.join(PROJECT_ROOT, "scripts/event-posting/logs");
  fsExtra.ensureDirSync(logDir);

  const runLog = {
    show: argv.show,
    showTitle: showData.title,
    runAt: new Date().toISOString(),
    results: [],
  };

  for (const site of sites) {
    console.log(chalk.bold.blue(`\n━━━  Site: ${site}  ━━━\n`));

    const templatePath = path.join(
      PROJECT_ROOT,
      "scripts/event-posting/templates",
      `${site}.template.json`
    );

    if (!fsExtra.existsSync(templatePath)) {
      console.error(
        chalk.red(
          `  Template not found: ${templatePath}\n  Run record.js first to create a recording for this site.\n`
        )
      );
      runLog.results.push({ site, outcome: "error", error: "Template not found" });
      continue;
    }

    const template = await fsExtra.readJson(templatePath);
    const imageRequirements = template.imageRequirements || {};

    // Resolve all steps
    const context = {
      site,
      showData,
      forceImage: argv["force-image"] || false,
      imageRequirements,
    };

    const resolvedSteps = [];
    for (const step of template.steps || []) {
      const resolved = await resolveStep(step, showData, context);
      resolvedSteps.push(resolved);
    }

    // Run replay
    const outcome = await runReplay({
      site,
      showData,
      steps: resolvedSteps,
      imageRequirements,
      dryRun: argv["dry-run"],
      autoSubmit: argv["auto-submit"],
      forceImage: argv["force-image"],
    });

    runLog.results.push({ site, outcome });

    // Save run log
    const logFile = path.join(
      logDir,
      `${site}_${dayjs().format("YYYY-MM-DD_HHmmss")}.log.json`
    );
    await fsExtra.writeJson(logFile, {
      ...runLog,
      resolvedSteps: argv["dry-run"] ? resolvedSteps : undefined,
    }, { spaces: 2 });

    console.log(chalk.gray(`\n  Log saved: ${logFile}`));
  }

  console.log(chalk.bold("\n━━━  Summary  ━━━\n"));
  for (const r of runLog.results) {
    const icon =
      r.outcome === "submitted" ? "✅" :
      r.outcome === "skipped"   ? "⏭ " :
      r.outcome === "dry-run"   ? "🔍" :
      r.outcome === "manual"    ? "📋" : "❌";
    console.log(`  ${icon}  ${r.site.padEnd(20)} ${r.outcome}`);
  }
  console.log();
})().catch((err) => {
  console.error(chalk.red(`\nFatal: ${err.message}`));
  process.exit(1);
});
