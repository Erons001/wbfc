/* WBFC goal, assist, clean-sheet & appearance records.
 *
 * After each game, add ONE object to the relevant season's `matches` array:
 *   {
 *     date: "YYYY-MM-DD",
 *     label: "Matchday N",
 *     sportpaddy: "https://sportpaddy.com/game/<slug>/players",   // optional, for reference
 *     played:      ["Name", "Name", ...],       // the attendee roster (canonical names)
 *     goals:       { "Name": <count>, ... },
 *     assists:     { "Name": <count>, ... },
 *     cleanSheets: { "Name": <count>, ... },    // sets kept out (defenders / keepers)
 *   }
 *
 * Use the record.html helper to build this object from a Sport Paddy game URL.
 * Names should match the FIFA card names in index.html; anyone without a card is
 * carried as a guest (shows in the stats tables, not the squad).
 * Anyone who scored, assisted or kept a clean sheet counts as an appearance even
 * if missing from `played`.
 *
 * New year: add another key under `seasons` and bump `currentSeason`.
 */
const SEASON_STATS = {
  currentSeason: 2026,
  seasons: {
    2026: {
      matches: [
        {
          date: "2026-08-30",
          label: "Matchday 1",
          sportpaddy: "https://sportpaddy.com/game/sunday-evening-sets-2026-08-30/players",
          // From the Sport Paddy roster (18 attended). Regulars who turned up under
          // nicknames are mapped here: Joga = Bouncey, KM10 = Khell Magic,
          // Tinubu = Valo, ISMA'EL HOES = Ismael.
          played: [
            "Valo", "Isaac", "Khell Magic",
            "Erinie", "Erons", "Paulo", "Bouncey", "Ismael", "Global K", "Starman", "Beks",
            "Comet", "Joseph LSE", "Abba Ali Mamadi", "Kingfhad", "Sanusi",
            "Majeed", "Nur", "Grand",
          ],
          goals:       { "Valo": 5, "Erinie": 3, "Isaac": 2, "Paulo": 1, "Khell Magic": 1, "Ismael": 1 },
          assists:     { "Starman": 2, "Bouncey": 2, "Erinie": 1, "Ismael": 1, "Global K": 1 },
          cleanSheets: {},
        },
        {
          date: "2026-09-06",
          label: "Matchday 2",
          sportpaddy: "https://sportpaddy.com/game/3-hours-of-fun-football-2026-09-06/players",
          played: [
            "Erons", "Khell Magic", "Erinie", "Dornu", "Hanafi", "Ghidorah", "Valo", "Ismael",
            "Majid", "Bouncey", "Isaac", "Sanz", "Pelumi", "Paulo", "Michael", "Fahad",
            "Simaye", "Ojoche", "Angel", "Pizma", "Flo", "Beks", "Grand", "Adams", "Global K",
            "Abdulrasaq zulqornain", "Feleb", "Starman",
          ],
          goals:       { "Erons": 2, "Erinie": 3, "Hanafi": 2, "Valo": 3, "Ismael": 2, "Bouncey": 2, "Isaac": 1, "Paulo": 1, "Fahad": 1, "Angel": 1, "Pizma": 4, "Beks": 1 },
          assists:     { "Erinie": 1, "Ghidorah": 2, "Valo": 2, "Ismael": 3, "Bouncey": 1, "Sanz": 1, "Paulo": 2, "Pizma": 1, "Flo": 2, "Adams": 1 },
          // Gomene = Beks (same player, different Sport Paddy handle).
          cleanSheets: { "Beks": 5, "Paulo": 4, "Erons": 3 },
        },
      ],
    },
  },
};

const STAT_KEYS = ["goals", "assists", "cleanSheets"];

function _season(year) {
  return SEASON_STATS.seasons[year || SEASON_STATS.currentSeason];
}

/* Did a player feature in a match? (on the roster, or recorded any stat) */
function playedInMatch(m, name) {
  if (m.played && m.played.includes(name)) return true;
  return STAT_KEYS.some((k) => m[k] && m[k][name]);
}

/* Appearances + goals + assists + clean sheets for one player in a season. */
function seasonTotals(playerName, year) {
  const season = _season(year);
  const t = { apps: 0, goals: 0, assists: 0, cleanSheets: 0 };
  if (season) {
    for (const m of season.matches) {
      if (playedInMatch(m, playerName)) t.apps++;
      for (const k of STAT_KEYS) t[k] += (m[k] && m[k][playerName]) || 0;
    }
  }
  return t;
}

/* Ranked leaderboard for a season.
 * sortKey: "goals" (default), "assists", "cleanSheets" or "apps".
 * For a stat key, only players with at least one are included. */
function seasonLeaderboard(year, sortKey) {
  sortKey = sortKey || "goals";
  const season = _season(year);
  const tally = {};
  const row = (name) =>
    (tally[name] = tally[name] || { name, apps: 0, goals: 0, assists: 0, cleanSheets: 0 });
  if (season) {
    const everyone = new Set();
    for (const m of season.matches) {
      (m.played || []).forEach((n) => everyone.add(n));
      for (const k of STAT_KEYS) for (const n in (m[k] || {})) everyone.add(n);
    }
    for (const m of season.matches) {
      for (const n of everyone) if (playedInMatch(m, n)) row(n).apps++;
      for (const k of STAT_KEYS) for (const n in (m[k] || {})) row(n)[k] += m[k][n];
    }
  }
  return Object.values(tally)
    .map((r) => ({ ...r, ga: r.goals + r.assists }))
    .filter((r) => (sortKey === "apps" ? r.apps > 0 : r[sortKey] > 0))
    .sort((a, b) =>
      b[sortKey] - a[sortKey] ||
      b.ga - a.ga ||
      b.apps - a.apps ||
      a.name.localeCompare(b.name)
    );
}

/* Season-wide totals. */
function seasonMeta(year) {
  const season = _season(year);
  if (!season) return { goals: 0, assists: 0, cleanSheets: 0, matches: 0, players: 0 };
  const totals = { goals: 0, assists: 0, cleanSheets: 0 };
  const players = new Set();
  for (const m of season.matches) {
    (m.played || []).forEach((n) => players.add(n));
    for (const k of STAT_KEYS) {
      for (const n in (m[k] || {})) { totals[k] += m[k][n]; players.add(n); }
    }
  }
  return { ...totals, matches: season.matches.length, players: players.size };
}
