/* WBFC goal, assist & appearance records.
 *
 * After each game, add ONE object to the relevant season's `matches` array:
 *   {
 *     date: "YYYY-MM-DD",
 *     label: "Matchday N",
 *     sportpaddy: "https://sportpaddy.com/game/<slug>/players",   // optional, for reference
 *     played:  ["Name", "Name", ...],          // the attendee roster (canonical names)
 *     goals:   { "Name": <count>, ... },
 *     assists: { "Name": <count>, ... },
 *   }
 *
 * Use the record.html helper to build this object from a Sport Paddy game URL.
 * Names should match the FIFA card names in index.html; anyone without a card is
 * carried as a guest (shows in the stats tables, not the squad).
 * Anyone who scored or assisted is counted as an appearance even if missing
 * from `played`.
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
            "Erinie", "Erons", "Paulo", "Bouncey", "Ismael", "Global K", "Starman",
            "Comet", "LSE", "Abba Ali Mamadi", "Kingfhad", "Sanusi",
            "Majeed", "Nur", "GRAND",
          ],
          goals:   { "Valo": 5, "Erinie": 3, "Isaac": 2, "Paulo": 1, "Khell Magic": 1, "Ismael": 1 },
          assists: { "Starman": 2, "Bouncey": 2, "Erinie": 1, "Ismael": 1, "Global K": 1 },
        },
      ],
    },
  },
};

function _season(year) {
  return SEASON_STATS.seasons[year || SEASON_STATS.currentSeason];
}

/* Did a player feature in a match? (on the roster, or scored / assisted) */
function playedInMatch(m, name) {
  if (m.played && m.played.includes(name)) return true;
  if (m.goals && m.goals[name]) return true;
  if (m.assists && m.assists[name]) return true;
  return false;
}

/* Appearances + goals + assists for one player in a season. */
function seasonTotals(playerName, year) {
  const season = _season(year);
  let apps = 0, goals = 0, assists = 0;
  if (season) {
    for (const m of season.matches) {
      if (playedInMatch(m, playerName)) apps++;
      goals += (m.goals && m.goals[playerName]) || 0;
      assists += (m.assists && m.assists[playerName]) || 0;
    }
  }
  return { apps, goals, assists };
}

/* Ranked leaderboard for a season.
 * sortKey: "goals" (default), "assists" or "apps".
 * For goals/assists, only players with at least one are included. */
function seasonLeaderboard(year, sortKey) {
  sortKey = sortKey || "goals";
  const season = _season(year);
  const tally = {};
  const row = (name) => (tally[name] = tally[name] || { name, apps: 0, goals: 0, assists: 0 });
  if (season) {
    const everyone = new Set();
    for (const m of season.matches) {
      (m.played || []).forEach((n) => everyone.add(n));
      for (const n in (m.goals || {})) everyone.add(n);
      for (const n in (m.assists || {})) everyone.add(n);
    }
    for (const m of season.matches) {
      for (const n of everyone) if (playedInMatch(m, n)) row(n).apps++;
      for (const n in (m.goals || {})) row(n).goals += m.goals[n];
      for (const n in (m.assists || {})) row(n).assists += m.assists[n];
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
  if (!season) return { goals: 0, assists: 0, matches: 0, players: 0 };
  let goals = 0, assists = 0;
  const players = new Set();
  for (const m of season.matches) {
    (m.played || []).forEach((n) => players.add(n));
    for (const n in (m.goals || {})) { goals += m.goals[n]; players.add(n); }
    for (const n in (m.assists || {})) { assists += m.assists[n]; players.add(n); }
  }
  return { goals, assists, matches: season.matches.length, players: players.size };
}
