# Event Posting Automation Tool

A Node.js + Playwright automation tool for submitting Misconduct Comedy shows to event listing websites. It uses a **record → template → replay** workflow so you never have to manually write site configurations from scratch.

---

## Table of Contents

1. [How it Works](#how-it-works)
2. [Installation](#installation)
3. [Recording a New Site](#recording-a-new-site)
4. [Editing a Template](#editing-a-template)
5. [Variable Mappings](#variable-mappings)
6. [Filters](#filters)
7. [UTM Links](#utm-links)
8. [Image Resizing](#image-resizing)
9. [Suggesting Mappings Automatically](#suggesting-mappings-automatically)
10. [Validating a Show File](#validating-a-show-file)
11. [Posting a Show](#posting-a-show)
12. [Posting to Multiple Sites](#posting-to-multiple-sites)
13. [Handling CAPTCHAs & Manual Review](#handling-captchas--manual-review)
14. [Troubleshooting Changed Selectors](#troubleshooting-changed-selectors)
15. [Adding a New Event Listing Site](#adding-a-new-event-listing-site)
16. [CLI Reference](#cli-reference)
17. [Project Structure](#project-structure)

---

## How it Works

1. **Record** — You open a browser and fill out the event submission form normally. The tool records every field you touch, the selector for each field, and the value you typed.

2. **Template** — After recording, a template JSON file is generated. You replace the hardcoded values with `{{variable}}` expressions that pull data from your show's markdown file.

3. **Replay** — When you want to post a show, run `post.js`. The tool loads your show's markdown file, resolves all variables, fills in the form automatically, and pauses for your review before submitting.

---

## Installation

Dependencies are already installed via `npm install`. Playwright's Chromium browser is also installed automatically.

If you need to reinstall manually:

```bash
npm install
npx playwright install chromium
```

---

## Recording a New Site

```bash
node scripts/event-posting/record.js --site goodthingsphl
```

Or with a starting URL:

```bash
node scripts/event-posting/record.js --site goodthingsphl --url https://goodthingsphl.com/login
```

What happens:
- A real Chrome browser opens.
- You navigate to the event submission form and fill it out as you normally would.
- **If the site requires login**, log in now — your session is saved in `browser-profiles/goodthingsphl/` for future runs.
- Every field you touch (text inputs, dropdowns, checkboxes, file uploads, button clicks) is captured.
- **Close the browser window** when you're done filling out the form.

Two files are created:
- `scripts/event-posting/recordings/goodthingsphl.recording.json` — full raw event log
- `scripts/event-posting/templates/goodthingsphl.template.json` — editable template

---

## Editing a Template

Open `scripts/event-posting/templates/goodthingsphl.template.json`.

Each step looks like this after recording:

```json
{
  "action": "fill",
  "label": "Event Title",
  "selectors": { "id": "event-title", "labelText": "Event Title" },
  "recordedValue": "Misconduct Comedy Showcase",
  "value": "Misconduct Comedy Showcase",
  "comment": "Replace recordedValue with a {{variable}} expression"
}
```

Change the `"value"` field to use a variable:

```json
{
  "action": "fill",
  "label": "Event Title",
  "selectors": { "id": "event-title", "labelText": "Event Title" },
  "recordedValue": "Misconduct Comedy Showcase",
  "value": "{{title}}"
}
```

For a ticket URL with UTM tracking:

```json
{
  "action": "fill",
  "label": "Ticket URL",
  "selectors": { "id": "ticket-url" },
  "recordedValue": "https://www.eventbrite.com/e/...",
  "value": "{{showtimes.0.ticketUrl | utm}}"
}
```

For an image upload with auto-resize:

```json
{
  "action": "upload",
  "label": "Event Image",
  "selectors": { "css": "input[type='file']" },
  "recordedValue": "/photos/shows/PatrickS.webp",
  "value": "{{images.0.src | imagePath | prepareImage}}"
}
```

### Image Requirements

At the top of the template, configure what image size the site needs:

```json
"imageRequirements": {
  "width": 1200,
  "height": 675,
  "aspectRatio": "16:9",
  "fit": "cover",
  "format": "jpg",
  "quality": 90
}
```

---

## Variable Mappings

Variables use double curly brace syntax: `{{variablePath}}`.

| Variable | Description |
|---|---|
| `{{title}}` | Show title |
| `{{subtitle}}` | Show subtitle |
| `{{showDate}}` | Formatted show date string |
| `{{description}}` | Show description |
| `{{ageRestriction}}` | Age restriction (e.g. `21+`) |
| `{{organizerName}}` | Organizer name |
| `{{organizerUrl}}` | Organizer URL |
| `{{showType}}` | Show type (e.g. `Showcase`) |
| `{{showtimes.0.startDate}}` | ISO start date/time |
| `{{showtimes.0.endDate}}` | ISO end date/time |
| `{{showtimes.0.ticketUrl}}` | Ticket URL |
| `{{showtimes.0.ticketPrice}}` | Ticket price |
| `{{location.name}}` | Venue name |
| `{{location.streetAddress}}` | Street address |
| `{{location.city}}` | City |
| `{{location.state}}` | State |
| `{{location.postalCode}}` | ZIP code |
| `{{images.0.src}}` | Web-relative image path |

---

## Filters

Append filters after a `|` pipe character.

### `| utm`
Adds UTM tracking parameters to a URL.

```json
"value": "{{showtimes.0.ticketUrl | utm}}"
```

### `| imagePath`
Converts a website-relative image path (`/photos/shows/image.webp`) to a local filesystem path.

```json
"value": "{{images.0.src | imagePath}}"
```

### `| prepareImage`
Resolves the image path AND resizes/crops the image using the template's `imageRequirements`. Use this for upload fields.

```json
"value": "{{images.0.src | imagePath | prepareImage}}"
```

### `| date:FORMAT`
Formats a date using [Day.js format tokens](https://day.js.org/docs/en/display/format).

```json
"value": "{{showtimes.0.startDate | date:MM/DD/YYYY}}"
"value": "{{showtimes.0.startDate | date:MMMM D, YYYY}}"
```

### `| time:FORMAT`
Formats a time.

```json
"value": "{{showtimes.0.startDate | time:h:mm A}}"
```

### `| stripHtml`
Removes HTML tags from a string.

```json
"value": "{{description | stripHtml}}"
```

### `| truncate:N`
Truncates to a maximum of N characters.

```json
"value": "{{description | truncate:500}}"
```

### `| slug`
Creates a URL-safe slug.

```json
"value": "{{title | slug}}"
```

---

## UTM Links

When you use `| utm`, the tool appends:

- `utm_source` = site key (e.g. `goodthingsphl`)
- `utm_medium` = `event_listing`
- `utm_campaign` = show date (e.g. `2026-07-10`)
- `utm_content` = `[site]-[show-title-slug]`

Example output:

```
https://www.eventbrite.com/e/...?utm_source=goodthingsphl&utm_medium=event_listing&utm_campaign=2026-07-10&utm_content=goodthingsphl-misconduct-comedy-showcase
```

Existing query parameters are preserved. Existing UTM parameters are overwritten.

---

## Image Resizing

When a template uses `| prepareImage`, the tool:

1. Resolves the web-relative image path to a local file.
2. Resizes/crops it using `sharp` according to `imageRequirements`.
3. Saves the result to `scripts/event-posting/prepared-images/[site]/`.
4. Returns the local path for use in the file upload step.
5. Reuses the cached prepared image on subsequent runs unless you pass `--force-image`.

```bash
node scripts/event-posting/post.js --site goodthingsphl --show src/shows/...md --force-image
```

---

## Suggesting Mappings Automatically

After recording, run `suggest-template.js` to automatically compare your recorded values against the show's markdown data and suggest `{{variable}}` expressions:

```bash
node scripts/event-posting/suggest-template.js \
  --site goodthingsphl \
  --show src/shows/2026-07-10-misconduct-comedy-showcase.md
```

This prints a table like:

```
Field                Recorded Value                Suggested Variable              Conf    Preview
────────────────────────────────────────────────────────────────────────────────
Event Title          Misconduct Comedy Showcase    {{title}}                       high    Misconduct Comedy Showcase
Ticket URL           https://www.eventbrite...     {{showtimes.0.ticketUrl | utm}} high    https://...
Start Date           07/10/2026                    {{showtimes.0.startDate | ...}} high    07/10/2026
```

To write the suggestions back to the template file:

```bash
node scripts/event-posting/suggest-template.js \
  --site goodthingsphl \
  --show src/shows/2026-07-10-misconduct-comedy-showcase.md \
  --write
```

---

## Validating a Show File

Before posting, validate the show markdown file:

```bash
node scripts/event-posting/validate.js --show src/shows/2026-07-10-misconduct-comedy-showcase.md
```

This checks:
- Required fields are present
- Dates are valid
- `endDate` is not earlier than `startDate` (warns you if it is)
- Ticket URL is present
- Image files exist locally
- Previews UTM URLs for each configured site template
- Previews image prep requirements for each template

---

## Posting a Show

```bash
node scripts/event-posting/post.js \
  --site goodthingsphl \
  --show src/shows/2026-07-10-misconduct-comedy-showcase.md
```

What happens:
1. The show markdown file is parsed.
2. The site template is loaded and all `{{variables}}` are resolved.
3. A Chrome browser opens (using your saved login session if available).
4. The form is filled out step by step.
5. **The tool pauses before submitting** and asks:
   - ✅ Submit the form
   - ⏭  Skip this site
   - 📋  Save as manual review
6. Screenshots are saved before and after submission.
7. A log file is saved in `scripts/event-posting/logs/`.

### Dry Run

Preview all resolved values without opening a browser:

```bash
node scripts/event-posting/post.js \
  --site goodthingsphl \
  --show src/shows/2026-07-10-misconduct-comedy-showcase.md \
  --dry-run
```

---

## Posting to Multiple Sites

```bash
node scripts/event-posting/post.js \
  --sites goodthingsphl,evvnts,visitpa \
  --show src/shows/2026-07-10-misconduct-comedy-showcase.md
```

The tool processes each site in sequence, pausing before submission for each one.

---

## Handling CAPTCHAs & Manual Review

The tool **never bypasses CAPTCHAs or bot protections**.

If the tool detects a CAPTCHA, a login wall, a missing field selector, a changed form, or any unexpected page state, it will:

1. Take a screenshot (saved to `scripts/event-posting/screenshots/`).
2. Print a clear message in the terminal.
3. **Pause and wait for you to fix the issue manually in the open browser.**
4. Once you press Enter, it continues from where it left off.

You can also choose to quit and save the run as "needs manual review."

### Login

- During **record mode**, log into the site normally in the browser. The session is saved.
- During **replay mode**, the same saved session is reused automatically.
- **Passwords are never stored in code or config files.**

---

## Troubleshooting Changed Selectors

If a form field can't be found (the site updated its HTML), the tool will pause and let you fix it.

To permanently fix a broken selector:

1. Open the template file: `scripts/event-posting/templates/[site].template.json`
2. Find the step with the broken field.
3. Update the `selectors` object with the new values.

The tool tries selectors in this priority order:
1. `id` — `#element-id`
2. `name` — `[name="field-name"]`
3. `ariaLabel` — `[aria-label="..."]`
4. `placeholder` — `[placeholder="..."]`
5. `labelText` — label text via `getByLabel()`
6. `css` — CSS path fallback
7. `xpath` — XPath fallback

You can also re-record the site from scratch to regenerate fresh selectors:

```bash
node scripts/event-posting/record.js --site goodthingsphl
```

---

## Adding a New Event Listing Site

1. Record the site:
   ```bash
   node scripts/event-posting/record.js --site newsitename
   ```
2. Run the suggestion tool against a show file:
   ```bash
   node scripts/event-posting/suggest-template.js --site newsitename --show src/shows/...md --write
   ```
3. Open `scripts/event-posting/templates/newsitename.template.json` and review/finalize the variable mappings.
4. Run a dry run to verify:
   ```bash
   node scripts/event-posting/post.js --site newsitename --show src/shows/...md --dry-run
   ```
5. Post for real:
   ```bash
   node scripts/event-posting/post.js --site newsitename --show src/shows/...md
   ```

---

## CLI Reference

| Command | Description |
|---|---|
| `node scripts/event-posting/record.js --site [site]` | Record a new site |
| `node scripts/event-posting/record.js --site [site] --url [url]` | Record starting at a specific URL |
| `node scripts/event-posting/suggest-template.js --site [site] --show [file]` | Suggest variable mappings |
| `node scripts/event-posting/suggest-template.js --site [site] --show [file] --write` | Suggest + save mappings |
| `node scripts/event-posting/validate.js --show [file]` | Validate a show file |
| `node scripts/event-posting/post.js --site [site] --show [file]` | Post one show to one site |
| `node scripts/event-posting/post.js --sites [a,b,c] --show [file]` | Post one show to multiple sites |
| `node scripts/event-posting/post.js --site [site] --show [file] --dry-run` | Preview without posting |
| `node scripts/event-posting/post.js --site [site] --show [file] --force-image` | Regenerate prepared images |

Or use the npm shortcuts:

```bash
npm run event:record -- --site goodthingsphl
npm run event:suggest -- --site goodthingsphl --show src/shows/...md
npm run event:post -- --site goodthingsphl --show src/shows/...md
npm run event:validate -- --show src/shows/...md
```

---

## Project Structure

```
scripts/event-posting/
├── record.js               # Record mode entry point
├── suggest-template.js     # Template suggestion entry point
├── post.js                 # Replay/post entry point
├── validate.js             # Show file validation
├── lib/
│   ├── markdown.js         # Parse show markdown files
│   ├── recorder.js         # Playwright recording session
│   ├── template.js         # Variable resolution & filters
│   ├── replay.js           # Form replay & submission
│   ├── selectors.js        # Multi-selector fallback logic
│   ├── utm.js              # UTM parameter generation
│   ├── images.js           # Image path resolution & resizing
│   └── terminalPrompt.js   # Terminal prompts (submit/skip/manual)
├── recordings/             # Raw recordings ([site].recording.json)
├── templates/              # Editable templates ([site].template.json)
├── logs/                   # Post run logs
├── screenshots/            # Auto-saved screenshots
├── prepared-images/        # Resized images ready for upload
└── browser-profiles/       # Persistent login sessions ([site]/)
```
