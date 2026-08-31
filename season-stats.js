/* WBFC goal & assist records.
 *
 * After each game, add ONE object to the relevant season's `matches` array:
 *   {
 *     date: "YYYY-MM-DD",
 *     label: "Matchday N",
 *     goals:   { "Player Name": <count>, ... },
 *     assists: { "Player Name": <count>, ... },
 *   }
 * Player names must match the card names in index.html (e.g. "Khell Magic").
 * Players without a card (guests / subs) can still be listed here.
 *
 * To start a new year, add another key under `seasons` and bump `currentSeason`.
 */
const SEASON_STATS = {
  currentSeason: 2026,
  seasons: {
    2026: {
      matches: [
        {
          date: "2026-08-30",
          label: "Matchday 1",
          goals:   { "Valo": 6, "Erinie": 4, "Isaac": 2, "Paulo": 1, "Khell Magic": 1, "Ismael": 1 },
          assists: { "Erinie": 1, "Ismael": 1 },
        },
      ],
    },
  },
};

/* Goals + assists for one player in a season. */
function seasonTotals(playerName, year) {
  year = year || SEASON_STATS.currentSeason;
  const season = SEASON_STATS.seasons[year];
  let goals = 0, assists = 0;
  if (season) {
    for (const m of season.matches) {
      goals += (m.goals && m.goals[playerName]) || 0;
      assists += (m.assists && m.assists[playerName]) || 0;
    }
  }
  return { goals, assists };
}

/* Ranked leaderboard for a season.
 * sortKey: "goals" (default) or "assists".
 * Only players with at least one of that stat are included. */
function seasonLeaderboard(year, sortKey) {
  year = year || SEASON_STATS.currentSeason;
  sortKey = sortKey || "goals";
  const season = SEASON_STATS.seasons[year];
  const tally = {};
  const bump = (name) => (tally[name] = tally[name] || { name, goals: 0, assists: 0 });
  if (season) {
    for (const m of season.matches) {
      for (const n in (m.goals || {})) bump(n).goals += m.goals[n];
      for (const n in (m.assists || {})) bump(n).assists += m.assists[n];
    }
  }
  return Object.values(tally)
    .map((r) => ({ ...r, ga: r.goals + r.assists }))
    .filter((r) => r[sortKey] > 0)
    .sort((a, b) =>
      b[sortKey] - a[sortKey] ||
      b.ga - a.ga ||
      a.name.localeCompare(b.name)
    );
}

/* Season-wide totals (goals, assists, matches played). */
function seasonMeta(year) {
  year = year || SEASON_STATS.currentSeason;
  const season = SEASON_STATS.seasons[year];
  if (!season) return { goals: 0, assists: 0, matches: 0 };
  let goals = 0, assists = 0;
  for (const m of season.matches) {
    for (const n in (m.goals || {})) goals += m.goals[n];
    for (const n in (m.assists || {})) assists += m.assists[n];
  }
  return { goals, assists, matches: season.matches.length };
}
