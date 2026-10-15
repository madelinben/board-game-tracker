import { Trash2, Trophy } from "lucide-react";
import { type Game, tally, winners } from "../lib/game";

export function Leaderboard({ history, onClear }: { history: Game[]; onClear: () => void }) {
  const rows = tally(history);
  const recent = [...history].reverse().slice(0, 10);

  if (rows.length === 0) {
    return (
      <p className="p-8 text-center text-slate-500">
        Finish a game and the leaderboard appears here.
      </p>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-4">
      <ol className="flex flex-col gap-2">
        {rows.map((r, i) => (
          <li
            key={r.name}
            className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200"
          >
            <span className="grid size-8 place-items-center rounded-full bg-indigo-100 font-black text-indigo-800">
              {i === 0 ? <Trophy size={16} /> : i + 1}
            </span>
            <span className="flex-1 font-bold">{r.name}</span>
            <span className="text-sm text-slate-500">{r.played} played</span>
            <span className="w-14 text-right text-xl font-black tabular-nums text-indigo-700">
              {r.wins}
            </span>
          </li>
        ))}
      </ol>

      <section>
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recent games
        </h3>
        <ul className="flex flex-col gap-1 text-sm">
          {recent.map((g) => (
            <li key={g.id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-semibold">{g.name}</span>
              <span className="text-slate-600">{winners(g).join(", ") || "No winner"}</span>
            </li>
          ))}
        </ul>
      </section>

      <button
        type="button"
        onClick={onClear}
        className="flex min-h-11 items-center justify-center gap-1 rounded-xl text-sm font-semibold text-rose-600 active:scale-[0.98]"
      >
        <Trash2 size={16} /> Clear history
      </button>
    </div>
  );
}
