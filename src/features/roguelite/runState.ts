export type PlayoffRound = "Wild Card" | "Division Series" | "Championship Series" | "Championship";
export type RunStatus = "active" | "eliminated" | "champion";

export interface SeriesState {
  round: PlayoffRound;
  bestOf: 3 | 5 | 7;
  opponent: string;
  wins: number;
  losses: number;
}

export interface RunState {
  version: 1;
  id: string;
  team: string;
  status: RunStatus;
  roundIndex: number;
  series: SeriesState;
  completedRounds: PlayoffRound[];
}

export const ROUNDS: ReadonlyArray<{ round: PlayoffRound; bestOf: 3 | 5 | 7 }> = [
  { round: "Wild Card", bestOf: 3 },
  { round: "Division Series", bestOf: 5 },
  { round: "Championship Series", bestOf: 7 },
  { round: "Championship", bestOf: 7 },
];

export const PLAYOFF_TEAMS = [
  "Baltimore Birds", "New York Empires", "Boston Green Monsters", "Tampa Bay Rays", "Toronto North",
  "Cleveland Guardians", "Detroit Motors", "Minnesota North Stars", "Kansas City Crowns", "Houston Space City",
  "Seattle Emeralds", "Texas Rangers", "Atlanta Peaches", "Philadelphia Bells", "New York Metros",
  "Milwaukee Brewers", "Chicago North Siders", "Los Angeles Stars", "San Diego Surf", "San Francisco Gold",
];

const opponentFor = (team: string, roundIndex: number) => {
  const pool = PLAYOFF_TEAMS.filter((name) => name !== team);
  const seed = [...team].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return pool[(seed + roundIndex * 7) % pool.length];
};

export function createRun(team: string): RunState {
  return {
    version: 1,
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    team,
    status: "active",
    roundIndex: 0,
    series: { ...ROUNDS[0], opponent: opponentFor(team, 0), wins: 0, losses: 0 },
    completedRounds: [],
  };
}

export function recordGame(state: RunState, won: boolean): RunState {
  if (state.status !== "active") return state;
  const series = { ...state.series, wins: state.series.wins + (won ? 1 : 0), losses: state.series.losses + (won ? 0 : 1) };
  const needed = Math.ceil(series.bestOf / 2);
  if (series.losses >= needed) return { ...state, series, status: "eliminated" };
  if (series.wins < needed) return { ...state, series };
  const completedRounds = [...state.completedRounds, series.round];
  const nextIndex = state.roundIndex + 1;
  if (nextIndex >= ROUNDS.length) return { ...state, series, completedRounds, status: "champion" };
  const next = ROUNDS[nextIndex];
  return { ...state, roundIndex: nextIndex, completedRounds, series: { ...next, opponent: opponentFor(state.team, nextIndex), wins: 0, losses: 0 } };
}

const STORAGE_KEY = "ballgame-playoff-roguelite-run-v1";
export const saveRun = (run: RunState) => localStorage.setItem(STORAGE_KEY, JSON.stringify(run));
export const loadRun = (): RunState | null => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? (JSON.parse(raw) as RunState) : null; } catch { return null; }
};
export const clearRun = () => localStorage.removeItem(STORAGE_KEY);
