/**
 * images.js
 * Resolves image paths and prepares/resizes images using sharp.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const fsExtra = require("fs-extra");

// sharp is optional – only needed for prepareImage
let sharp;
try {
  sharp = require("sharp");
} catch {
  sharp = null;
}

/** Root of the website project (two levels above scripts/event-posting/) */
const PROJECT_ROOT = path.resolve(__dirname, "../../..");

/**
 * Convert a website-relative image path like /photos/shows/PatrickS.webp
 * into an absolute local filesystem path.
 *
 * @param {string} webPath  - e.g. "/photos/shows/PatrickS.webp"
 * @returns {string} Absolute path inside src/
 */
function resolveImagePath(webPath) {
  // Strip leading slash and look inside src/
  const relative = webPath.replace(/^\//, "");
  return path.join(PROJECT_ROOT, "src", relative);
}

/**
 * Prepare (resize/crop) an image for a specific event listing site.
 *
 * @param {string}  sourcePath  - Absolute path to the source image.
 * @param {string}  site        - Site key (used for output subdirectory).
 * @param {object}  requirements
 * @param {number}  [requirements.width]
 * @param {number}  [requirements.height]
 * @param {string}  [requirements.fit]       - sharp fit value: cover|contain|fill|inside|outside
 * @param {string}  [requirements.format]    - output format: jpg|png|webp
 * @param {number}  [requirements.quality]
 * @param {boolean} [forceRegenerate]        - Skip cache and regenerate.
 * @returns {Promise<string>} Absolute path to the prepared image.
 */
async function prepareImage(sourcePath, site, requirements = {}, forceRegenerate = false) {
  if (!sharp) {
    throw new Error(
      "sharp is not installed. Run: npm install sharp"
    );
  }

  const {
    width,
    height,
    fit = "cover",
    format = "jpg",
    quality = 90,
  } = requirements;

  const basename = path.basename(sourcePath, path.extname(sourcePath));
  const suffix = width && height ? `_${width}x${height}` : "";
  const outputName = `${basename}${suffix}.${format}`;

  const outputDir = path.join(
    PROJECT_ROOT,
    "scripts/event-posting/prepared-images",
    site
  );
  const outputPath = path.join(outputDir, outputName);

  // Return cached file unless forced
  if (!forceRegenerate && fs.existsSync(outputPath)) {
    return outputPath;
  }

  fsExtra.ensureDirSync(outputDir);

  let pipeline = sharp(sourcePath);

  if (width || height) {
    pipeline = pipeline.resize(width || null, height || null, { fit });
  }

  switch (format) {
    case "jpg":
    case "jpeg":
      pipeline = pipeline.jpeg({ quality });
      break;
    case "png":
      pipeline = pipeline.png({ quality });
      break;
    case "webp":
      pipeline = pipeline.webp({ quality });
      break;
    default:
      pipeline = pipeline.jpeg({ quality });
  }

  await pipeline.toFile(outputPath);

  return outputPath;
}

module.exports = { resolveImagePath, prepareImage, PROJECT_ROOT };
