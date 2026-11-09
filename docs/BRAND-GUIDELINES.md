# Misconduct Comedy — Brand Guidelines

> Reference doc for AI-assisted design (Claude, etc.) when producing print media — posters, flyers, menus, table tents, postcards, social/print crossover pieces — for Misconduct Comedy, a Philadelphia indie stand-up show.

---

## 1. Brand Essence

- **What it is:** An indie, comedian-run stand-up comedy show in Philadelphia featuring handpicked lineups of Philly & NYC's best comics.
- **Personality:** Playful, a little cheeky/mischievous ("misconduct"), confident, high-energy, nightlife-adjacent — think "the fun bar show your friend dragged you to that turned out to be the best night out you've had in months."
- **Positioning line:** *"Philly's Funniest Night Out."*
- **Tone of voice:** Punchy, informal, exclamation-light but confident. Short declarative sentences. Uses urgency/scarcity language ("Shows sell out fast," "Selling fast," "Tickets sell out — don't wait"). Not corporate, not try-hard edgy — warm and inviting with a wink.
- **Taglines / copy snippets to reuse or riff on:**
  - "Philly's Funniest Night Out."
  - "Standup Comedy · Philadelphia"
  - "5–7 of Philly & NYC's Best Comics"
  - "Shows sell out fast — grab your tickets"
  - "An indie stand-up show run by local comedians featuring handpicked lineups that promise an unforgettable night."

---

## 2. Logo & Mascot

**Primary mark:** A circular vintage-badge logo featuring an orange octopus "captain" mascot — wearing a white nautical captain's hat with gold anchor emblem, holding a frothy beer mug in one tentacle and a microphone in another. The badge is ringed by a two-tone rope circle (gold/tan twisted rope), with "MISCONDUCT" arced across the top and "COMEDY" arced across the bottom in a cream, bold vintage serif/slab display lettering. Set on a deep navy/near-black background.

- Full badge logo: `src/images/Logo Final 1000px.png`, `Misconduct Comedy Logo with Border - 500px.png` / `750px.png`
- Icon-only mark (no text, used in nav/header): `src/images/logonotext.svg`
- Bordered variants: `src/svgs/misconduct logo.svg`, `misconduct logo border.svg`

**Usage rules:**
- The mascot badge is the hero mark for posters, merch, stickers, and anywhere the brand needs a standalone stamp of identity.
- The icon-only octopus mark is for compact/small-space use (nav bars, corners, watermarks, favicons).
- Always give the badge clear space around it equal to roughly the height of the octopus's head; don't crowd it with text or photos.
- Preserve the circular badge shape — don't stretch, distort, or crop into an oval/square.
- Works best on dark backgrounds (near-black navy `#080e10` / `#040709`) or the octopus's own navy backdrop. Avoid placing on busy photos without a solid-color plate behind it.
- Don't recolor the octopus (keep it warm orange), don't remove the rope ring, don't swap the display lettering for a generic sans-serif.

---

## 3. Color Palette

| Token | Hex / Value | Role |
|---|---|---|
| **Accent Orange** | `#F17E3C` | Primary accent — CTAs, ticket buttons, links, section "toppers," scarcity/urgency callouts, headline accent words |
| **Gold** | `#c9a96e` | Secondary accent — star ratings, price highlights, premium/decorative details (matches rope color in logo) |
| **Background (Base)** | `#080e10` | Primary dark background |
| **Background (Deep)** | `#040709` | Deepest black — page shell, nav bar, footer |
| **Surface** | `rgba(255,255,255,0.04)` | Card/panel fills on dark background |
| **Border** | `rgba(255,255,255,0.09)` | Hairline dividers/borders on dark surfaces |
| **Cream** | `#f0e8d0` | Primary text color on dark backgrounds; also logo lettering color |
| **Muted Cream** | `rgba(240,232,208,0.55)` | Secondary/supporting text, taglines, captions |

**Palette logic for print:** Dark, moody navy/black base (like a late-night comedy club) + one hot accent (burnt orange) for energy/urgency + gold as a warm, slightly premium secondary + cream for high-contrast readable text. Avoid introducing new hues (no blues, greens, purples) — stick to this warm, low-key-nightlife palette. When printing, treat `#080e10`/`#040709` as near-black rather than true black to keep the octopus's navy consistent.

**Contrast pairings that work:**
- Cream text / muted cream captions on navy or black backgrounds.
- Orange accent for CTAs, buttons, price tags, "get tickets" language, urgency badges.
- Gold reserved for stars, ratings, price numbers, and decorative rope/line flourishes — don't overuse as a second CTA color.

---

## 4. Typography

| Font | Style | Use |
|---|---|---|
| **Fontdiner Swanky** | Bold, playful vintage display/cursive slab | Headlines, big statement type, section titles ("A Look Inside," "Upcoming Shows," hero headline "Philly's Funniest Night Out."). This is the loudest, most "brand" font — use it for the biggest words on a poster. |
| **DM Sans** (weights 300–700, incl. italic) | Clean modern sans-serif | Body copy, UI labels, nav, dates/times, ticket prices, fine print, eyebrow/label text (uppercase, letter-spaced) |
| **Oregano** (normal + italic) | Casual script/cursive | Secondary decorative script accent (used for CMS-facing headers today; available as a softer script alternative to Fontdiner Swanky for smaller flourish text, e.g. a handwritten-style callout or signature line) |
| **Smythe** | Playful rounded display script | Used on the drinks/menu page — good option for menu-style or "tavern"/bar-adjacent print pieces (drink menus, table tents) as a fun secondary display font distinct from the main show branding |

**Type pairing recipe for posters/flyers:**
1. **Hero headline** → Fontdiner Swanky, large, cream or accent-orange for an emphasized word/phrase.
2. **Eyebrow / topper label** → DM Sans, small, bold, uppercase, wide letter-spacing (~0.10–0.12em), accent orange, often paired with a short horizontal rule.
3. **Body/details (date, venue, price, lineup)** → DM Sans regular/medium, cream or muted cream.
4. **Call to action** → DM Sans bold, uppercase or title case, on a solid accent-orange button/pill shape.

---

## 5. Signature Design Motifs (reuse these on print)

- **"Topper" label:** a short horizontal rule (~24px) + small bold uppercase orange label (e.g. "STANDUP COMEDY · PHILADELPHIA," "LIVE STAND-UP"). Great as a poster kicker above the main headline.
- **Date/Price pill:** a bordered two-cell pill showing "NEXT SHOW" (day, date, time) divided from "PRICE" ($XX). Good motif for flyers/menus that need to show show info at a glance.
- **Scarcity/urgency badge:** a small pulsing dot + short urgency phrase ("Shows sell out fast," "Selling fast") in a soft orange-tinted pill (`rgba(212,98,42,0.08)` fill, `rgba(212,98,42,0.27)` border). Reinforces FOMO — useful on posters promoting ticket sales.
- **Ticket button:** solid accent-orange, bold white/cream label, rounded corners (~9–11px radius), soft orange drop shadow. This is the brand's "buy now" shape — replicate as a CTA button on flyers.
- **Star rating + quote:** 5 gold stars + short italic quote in muted tone (e.g. "Perfect date night" — Jess K.). Use as a trust/social-proof element on posters/flyers.
- **Comedian headshot cluster:** overlapping circular headshots (avatar row, slight overlap, thin light border) — good for lineup/bill announcements.
- **Photo collage / grid:** dense grid of candid comedian/audience photos (mix of 4:5 and 9:16 crops), slightly rotated/skewed perspective, dark vignette fading to the navy background at edges. Useful as a full-bleed poster background texture behind the CTA content.
- **Rope circle (from the logo):** twisted gold/tan rope forming a ring — can be reused as a framing device around show announcements or as a badge border on flyers/stickers.

---

## 6. Imagery Style

- Real, candid, high-energy photos of comedians performing and audiences laughing — not posed/corporate stock photography.
- Crops: primarily 4:5 (portrait) and 9:16 (vertical/reel) aspect ratios.
- Photos are desaturated slightly by the dark vignette overlay when used as backgrounds — keep photos legible but let them recede behind text via a navy/black gradient or semi-opaque dark panel (`rgba(10,22,35,0.55)` blurred panel is the web equivalent — for print, a solid or gradient dark plate behind text works the same way).
- Venue/show photography should feel like a lively, intimate bar/club room — warm string lights, brick, dim stage lighting.

---

## 7. Voice & Messaging for Print Copy

- Lead with urgency and value: date, price, "sells out fast."
- Keep headlines short and punchy; let Fontdiner Swanky carry the personality.
- Use real social proof language (short quotes, star ratings) when space allows.
- Standard info hierarchy for any show-promo piece (poster, flyer, table tent):
  1. Eyebrow/kicker ("LIVE STAND-UP" / "STANDUP COMEDY · PHILADELPHIA")
  2. Headline (show name or "Philly's Funniest Night Out.")
  3. Date, time, venue
  4. Lineup / comedian names (+ headshots if available)
  5. Price + urgency line
  6. CTA ("Get Tickets →")
  7. Logo badge + social handles

---

## 8. Print Production Notes

- Because the palette is dark-background-first, default to **dark/navy or black stock backgrounds** with cream/orange ink for posters and flyers — this matches the web brand most closely.
- If a light/paper-white background is required (e.g. handbills, menus printed on cream stock), keep the navy (`#080e10`) and orange (`#F17E3C`) as ink colors and use the cream (`#f0e8d0`) as the paper/base tone instead of pure white, to preserve the warm, vintage-bar feel.
- Reserve gold (`#c9a96e`) for accents/details, not large fill areas.
- Always include the octopus badge logo somewhere on the piece (bottom corner or center) as the trust/recognition mark; use the icon-only mark when space is tight.
