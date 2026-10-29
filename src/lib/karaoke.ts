export interface Song {
  id: string;
  singer: string;
  title: string;
  /** Optional 1-10 from the room */
  score: number | null;
  done: boolean;
  addedAt: number;
}

/**
 * Fair rotation: a singer's second song waits until everyone queued has had a first turn.
 * Turn = how many of that singer's songs were added before this one.
 */
export function queue(songs: readonly Song[]): Song[] {
  const byTime = [...songs].sort((a, b) => a.addedAt - b.addedAt);
  const turn = new Map<string, number>();
  const seen = new Map<string, number>();
  for (const s of byTime) {
    const key = s.singer.toLowerCase();
    const n = seen.get(key) ?? 0;
    turn.set(s.id, n);
    seen.set(key, n + 1);
  }
  return byTime
    .filter((s) => !s.done)
    .sort((a, b) => (turn.get(a.id) ?? 0) - (turn.get(b.id) ?? 0) || a.addedAt - b.addedAt);
}

/** Best scored performances, highest first */
export function topPerformances(songs: readonly Song[], limit = 5): Song[] {
  return songs
    .filter((s) => s.done && s.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, limit);
}
