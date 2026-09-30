/**
 * markdown.js
 * Parses a show markdown file and returns a plain JS object of its frontmatter data.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

/**
 * Parse a show markdown file.
 * @param {string} filePath - Absolute or repo-relative path to the .md file.
 * @returns {object} Parsed frontmatter data as a plain JS object.
 */
function parseShow(filePath) {
  const absolute = path.resolve(process.cwd(), filePath);

  if (!fs.existsSync(absolute)) {
    throw new Error(`Show file not found: ${absolute}`);
  }

  const raw = fs.readFileSync(absolute, "utf8");
  const parsed = matter(raw);

  // Return only the frontmatter data (not the markdown body)
  return parsed.data;
}

module.exports = { parseShow };
