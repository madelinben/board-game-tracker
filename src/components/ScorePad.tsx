import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { add, type Game, standings, totals } from "../lib/game";

const STEPS = [1, 5, 10];

/** Running-total scoring (highest / lowest / team): quick +/- buttons and a custom amount per player. */
export function ScorePad({ game, onChange }: { game: Game; onChange: (g: Game) => void }) {
  const [custom, setCustom] = useState<Record<number, string>>({});
  const t = totals(game);
  const rank = new Map(standings(game).map((r) => [r.name, r.rank]));

  return (
    <ul className="flex flex-col gap-3">
      {game.players.map((name, p) => {
        const amount = Number(custom[p]);
        return (
          <li key={name + p} className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-slate-900">{name}</span>
              <span className="text-3xl font-black tabular-nums text-orange-700">{t[p]}</span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {STEPS.map((s) => (
                <span key={s} className="flex gap-1">
                  <button
                    type="button"
                    aria-label={`${name} minus ${s}`}
                    onClick={() => onChange(add(game, p, -s))}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold active:scale-[0.97]"
                  >
                    <Minus size={12} />
                    {s}
                  </button>
                  <button
                    type="button"
                    aria-label={`${name} plus ${s}`}
                    onClick={() => onChange(add(game, p, s))}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-xl bg-orange-100 text-sm font-bold text-orange-800 active:scale-[0.97]"
                  >
                    <Plus size={12} />
                    {s}
                  </button>
                </span>
              ))}
              <input
                type="number"
                inputMode="numeric"
                aria-label={`${name} custom points`}
                value={custom[p] ?? ""}
                onChange={(e) => setCustom((c) => ({ ...c, [p]: e.target.value }))}
                placeholder="±"
                className="min-h-11 w-20 rounded-xl border-2 border-slate-200 px-2 text-center"
              />
              <button
                type="button"
                disabled={!Number.isFinite(amount) || amount === 0}
                onClick={() => {
                  onChange(add(game, p, amount));
                  setCustom((c) => ({ ...c, [p]: "" }));
                }}
                className="min-h-11 rounded-xl bg-slate-800 px-3 text-sm font-bold text-white disabled:opacity-30"
              >
                Add
              </button>
            </div>
            {game.mode !== "team" && <span className="sr-only">Rank {rank.get(name)}</span>}
          </li>
        );
      })}
    </ul>
  );
}
