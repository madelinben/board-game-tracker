import { Plus, X } from "lucide-react";
import { useState } from "react";
import { type Game, MODES, type Mode, newGame, TEAM_NAMES } from "../lib/game";

const MAX_PLAYERS = 8;

export function Setup({ onStart }: { onStart: (g: Game) => void }) {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("highest");
  const [players, setPlayers] = useState(["Player 1", "Player 2"]);
  const [teams, setTeams] = useState([0, 1]);

  const minPlayers = mode === "coop" ? 1 : 2;
  const valid = players.length >= minPlayers && players.every((p) => p.trim());
  const hint = MODES.find((m) => m.id === mode)?.hint;

  const addPlayer = () => {
    setPlayers((p) => [...p, `Player ${p.length + 1}`]);
    setTeams((t) => [...t, t.length % 2]);
  };
  const removePlayer = (i: number) => {
    setPlayers((p) => p.filter((_, j) => j !== i));
    setTeams((t) => t.filter((_, j) => j !== i));
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-4">
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Game name
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
          placeholder="e.g. Catan, Ticket to Ride"
          className="min-h-11 rounded-xl border-2 border-slate-200 px-3 text-base font-normal outline-none focus:border-indigo-500"
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-sm font-semibold text-slate-700">How is it scored?</legend>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className={`min-h-11 rounded-xl px-3 text-sm font-bold transition active:scale-[0.97] ${
                mode === m.id ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500">{hint}</p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold text-slate-700">Players</span>
        {players.map((p, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              value={p}
              maxLength={16}
              aria-label={`Player ${i + 1} name`}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setPlayers((a) => a.map((x, j) => (j === i ? e.target.value : x)))}
              className="min-h-11 min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-3 text-base outline-none focus:border-indigo-500"
            />
            {mode === "team" && (
              <select
                value={teams[i]}
                aria-label={`Player ${i + 1} team`}
                onChange={(e) =>
                  setTeams((t) => t.map((x, j) => (j === i ? Number(e.target.value) : x)))
                }
                className="min-h-11 rounded-xl border-2 border-slate-200 bg-white px-2 text-sm font-semibold"
              >
                {TEAM_NAMES.map((t, id) => (
                  <option key={t} value={id}>
                    {t}
                  </option>
                ))}
              </select>
            )}
            {players.length > minPlayers && (
              <button
                type="button"
                aria-label={`Remove player ${i + 1}`}
                onClick={() => removePlayer(i)}
                className="grid size-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600 active:scale-[0.97]"
              >
                <X size={18} />
              </button>
            )}
          </div>
        ))}
        {players.length < MAX_PLAYERS && (
          <button
            type="button"
            onClick={addPlayer}
            className="flex min-h-11 items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 text-sm font-bold text-slate-600 active:scale-[0.98]"
          >
            <Plus size={16} /> Add player
          </button>
        )}
      </div>

      <button
        type="button"
        disabled={!valid}
        onClick={() =>
          onStart(
            newGame(
              name,
              mode,
              players.map((p) => p.trim()),
              teams
            )
          )
        }
        className="min-h-14 rounded-2xl bg-indigo-600 text-lg font-extrabold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-40"
      >
        Start game
      </button>
    </div>
  );
}
