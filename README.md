# WBFC — Weekly Ballers Football Club

A small static site (no build step, no dependencies) with two pages:

- **`index.html`** — the squad as FIFA-style ratings cards. Tap a card for the full
  breakdown: six stats (or six keeper stats for GKs), season goals & assists,
  a short bio, positions and a chemistry tip. The "Reading the Card" section
  explains every number and badge.
- **`stats.html`** — goals & assists by season. Top Scorers table, Top Assists
  table, and a match-by-match log.

Left sidebar navigation switches between the two (collapses to a drawer on mobile).

## Files

```
index.html        squad / ratings-card page
stats.html        player stats page (goals & assists)
style.css         shared styles for both pages
nav.js            shared sidebar-drawer toggle
season-stats.js   ← the goal/assist data (edit this after each game)
logo.jpg          WBFC crest
favicon*.png      tab icons
cards/            one PNG per player
```

## Recording a game

Open **`season-stats.js`** and add one object to the current season's `matches`
array, newest last:

```js
{
  date: "2026-09-06",
  label: "Matchday 2",
  goals:   { "Valo": 2, "Erinie": 1 },
  assists: { "Ismael": 1 },
}
```

- Player names must match the card names in `index.html` (e.g. `"Khell Magic"`).
- Guests/subs without a card can still be listed — they show up in the stats
  tables but not the squad.
- Both the stats page and every player card update automatically.
- New season: add another key under `seasons` and bump `currentSeason`.

## Editing the squad

Player data is the `players` array near the bottom of `index.html`. Add a card
image to `cards/` and a matching object. Goalkeepers use a `gk: { div, han, kic,
ref, spd, pos }` block instead of the outfield `pac/sho/...` fields.

The rating-trend arrows are built but parked — set `SHOW_TREND = true` in
`index.html` to switch them on.

## Deploy

Connected to GitHub → Vercel: every push to `main` auto-deploys to
`wbfc.vercel.app`. It's a plain static site (framework preset **Other**, no
build command, output `./`).
