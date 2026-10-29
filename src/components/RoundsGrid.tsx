import { Plus } from "lucide-react";
import { addRound, type Game, setCell, setJoker, totals } from "../lib/game";

export function RoundsGrid({ game, onChange }: { game: Game; onChange: (g: Game) => void }) {
  const t = totals(game);
  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="w-full text-center">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="p-2 text-left">Round</th>
              {game.players.map((name, p) => (
                <th key={name + p} className="p-2">
                  {name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {game.rounds.map((row, r) => (
              <tr key={r} className="border-t border-slate-100">
                <td className="p-2 text-left text-sm font-semibold text-slate-500">{r + 1}</td>
                {row.map((v, p) => (
                  <td key={p} className="p-1">
                    <input
                      type="number"
                      inputMode="numeric"
                      aria-label={`Round ${r + 1} ${game.players[p]}`}
                      value={v === 0 ? "" : v}
                      placeholder="0"
                      onChange={(e) => onChange(setCell(game, r, p, Number(e.target.value) || 0))}
                      className="min-h-11 w-full min-w-14 rounded-lg border border-slate-200 text-center"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            {game.mode === "quiz" && (
              <tr className="border-t border-slate-100">
                <th className="p-2 text-left text-sm">Joker</th>
                {game.players.map((name, p) => (
                  <td key={name + p} className="p-1">
                    <select
                      aria-label={`${name} joker round (doubles that round)`}
                      value={game.jokers?.[p] ?? -1}
                      onChange={(e) => onChange(setJoker(game, p, Number(e.target.value)))}
                      className="min-h-11 w-full rounded-lg border border-slate-200 bg-white text-sm"
                    >
                      <option value={-1}>None</option>
                      {game.rounds.map((_, r) => (
                        <option key={r} value={r}>
                          Round {r + 1} ×2
                        </option>
                      ))}
                    </select>
                  </td>
                ))}
              </tr>
            )}
            <tr className="border-t-2 border-slate-200 bg-slate-50">
              <th className="p-2 text-left text-sm">Total</th>
              {t.map((v, p) => (
                <td key={p} className="p-2 text-xl font-black tabular-nums text-indigo-700">
                  {v}
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
      <button
        type="button"
        onClick={() => onChange(addRound(game))}
        className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-slate-100 text-sm font-bold active:scale-[0.98]"
      >
        <Plus size={16} /> Add round
      </button>
    </div>
  );
}
