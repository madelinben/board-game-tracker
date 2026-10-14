// Pure board-game scoring logic. One Game = one session; history of finished games feeds the leaderboard.
export type Mode = "highest" | "lowest" | "rounds" | "coop" | "team";
export type CoopResult = "won" | "lost" | null;

export const MODES: { id: Mode; label: string; hint: string }[] = [
  { id: "highest", label: "Highest wins", hint: "Running points total. Most points wins." },
  { id: "lowest", label: "Lowest wins", hint: "Golf-style. Fewest points wins." },
  { id: "rounds", label: "Round by round", hint: "Score table, one row per round. Most points wins." },
  { id: "team", label: "Teams", hint: "Players score for a team. Best team total wins." },
  { id: "coop", label: "Co-op", hint: "Everyone wins or loses together." },
];

export type Game = {
  id: string;
  name: string;
  mode: Mode;
  players: string[];
  teams: number[]; // team index per player (team mode), else []
  rounds: number[][]; // rounds[r][p]; running-total modes keep a single round
  result: CoopResult;
  endedAt: number | null;
};

export type Row = { name: string; total: number; rank: number };

export const TEAM_NAMES = ["Team A", "Team B", "Team C", "Team D"];

function assertNever(x: never): never {
  throw new Error(`Unhandled mode: ${String(x)}`);
}

export function newGame(name: string, mode: Mode, players: string[], teams: number[] = []): Game {
  return {
    id: crypto.randomUUID(),
    name: name.trim() || "Board game",
    mode,
    players,
    teams: mode === "team" ? teams : [],
    rounds: [players.map(() => 0)],
    result: null,
    endedAt: null,
  };
}

/** Add points to a player in the running total (single round). */
export function add(g: Game, p: number, delta: number): Game {
  return setCell(g, 0, p, g.rounds[0][p] + delta);
}

export function setCell(g: Game, r: number, p: number, value: number): Game {
  return { ...g, rounds: g.rounds.map((row, i) => (i === r ? row.map((v, j) => (j === p ? value : v)) : row)) };
}

export const addRound = (g: Game): Game => ({ ...g, rounds: [...g.rounds, g.players.map(() => 0)] });

export const setResult = (g: Game, result: CoopResult): Game => ({ ...g, result });

export const finish = (g: Game, now: number): Game => ({ ...g, endedAt: now });

/** Per-player totals across all rounds. */
export const totals = (g: Game): number[] => g.players.map((_, p) => g.rounds.reduce((s, row) => s + row[p], 0));

/** Scoring entities: teams in team mode, players otherwise (co-op has no ranking). */
function entities(g: Game): { name: string; total: number; members: number[] }[] {
  const t = totals(g);
  switch (g.mode) {
    case "highest":
    case "lowest":
    case "rounds":
      return g.players.map((name, p) => ({ name, total: t[p], members: [p] }));
    case "team": {
      const ids = [...new Set(g.teams)].sort();
      return ids.map((id) => ({
        name: TEAM_NAMES[id],
        total: t.reduce((s, v, p) => (g.teams[p] === id ? s + v : s), 0),
        members: g.players.flatMap((_, p) => (g.teams[p] === id ? [p] : [])),
      }));
    }
    case "coop":
      return [];
    default:
      return assertNever(g.mode);
  }
}

const lowWins = (mode: Mode) => mode === "lowest";

/** Ranked rows, best first. Ties share a rank. */
export function standings(g: Game): Row[] {
  const low = lowWins(g.mode);
  const rows = entities(g).sort((a, b) => (low ? a.total - b.total : b.total - a.total));
  return rows.map((r, i) => ({
    name: r.name,
    total: r.total,
    rank: i > 0 && rows[i - 1].total === r.total ? rows.findIndex((x) => x.total === r.total) + 1 : i + 1,
  }));
}

/** Names of winning players (team mode: every member of the winning team(s)). Empty for a lost co-op game. */
export function winners(g: Game): string[] {
  if (g.mode === "coop") return g.result === "won" ? g.players : [];
  const low = lowWins(g.mode);
  const ents = entities(g);
  const best = ents.reduce((m, e) => (low ? Math.min(m, e.total) : Math.max(m, e.total)), low ? Infinity : -Infinity);
  return ents.filter((e) => e.total === best).flatMap((e) => e.members.map((p) => g.players[p]));
}

export type Tally = { name: string; played: number; wins: number };

/** Leaderboard over finished games: wins first, then fewer games played. */
export function tally(history: Game[]): Tally[] {
  const map = new Map<string, Tally>();
  for (const g of history) {
    if (g.endedAt === null) continue;
    const won = new Set(winners(g));
    for (const name of g.players) {
      const t = map.get(name) ?? { name, played: 0, wins: 0 };
      t.played += 1;
      if (won.has(name)) t.wins += 1;
      map.set(name, t);
    }
  }
  return [...map.values()].sort((a, b) => b.wins - a.wins || a.played - b.played || a.name.localeCompare(b.name));
}
