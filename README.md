# WBFC — Weekly Ballers Football Club

A single-page site showing the squad's FIFA-style ratings cards.

- Click any card to open an enlarged view with the full stat breakdown.
- The "Reading the Card" section explains the six face stats, alternate positions,
  preferred/weak foot, PlayStyles, Team Chemistry and Chemistry Styles.

## Files

```
index.html      the whole site (no build step, no dependencies)
logo.jpg        WBFC crest
cards/          one PNG per player
```

## Deploy to Vercel (free)

This is a static site — no framework, no config needed.

**Option A — drag & drop**
1. Go to https://vercel.com/new
2. Drag the `wbfc-site` folder onto the page.
3. Deploy.

**Option B — CLI**
```bash
npm i -g vercel
cd wbfc-site
vercel
```

**Option C — Git**
Push this folder to a GitHub repo and "Import Project" on Vercel.
Framework preset: **Other**. Build command: none. Output directory: `./`.

## Editing the squad

All player data lives in the `players` array near the bottom of `index.html`.
Add a card image to `cards/` and a matching object to the array.
