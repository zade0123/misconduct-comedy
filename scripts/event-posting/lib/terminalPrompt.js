/**
 * terminalPrompt.js
 * Helpers for interactive terminal prompts using inquirer.
 */

"use strict";

const inquirer = require("inquirer");
const chalk = require("chalk");
const readline = require("readline");

/**
 * Ask a yes/no/skip question before final form submission.
 * @returns {Promise<"submit"|"skip"|"manual">}
 */
async function askSubmitAction() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: chalk.bold.yellow(
        "Review the page in the browser. What would you like to do?"
      ),
      choices: [
        { name: "✅  Submit the form", value: "submit" },
        { name: "⏭   Skip this site", value: "skip" },
        { name: "📋  Save as manual review (needs attention)", value: "manual" },
      ],
    },
  ]);
  return action;
}

/**
 * Wait for the user to press Enter after manually resolving an issue.
 * @param {string} message
 * @returns {Promise<void>}
 */
async function waitForEnter(message) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(
      chalk.cyan(message || "Press ENTER when ready to continue..."),
      () => {
        rl.close();
        resolve();
      }
    );
  });
}

/**
 * Ask yes/no.
 * @param {string} message
 * @returns {Promise<boolean>}
 */
async function askYesNo(message) {
  const { confirmed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmed",
      message,
      default: false,
    },
  ]);
  return confirmed;
}

module.exports = { askSubmitAction, waitForEnter, askYesNo };
