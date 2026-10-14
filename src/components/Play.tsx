import { Flag } from "lucide-react";
import { finish, type Game, standings } from "../lib/game";
import { CoopResult } from "./CoopResult";
import { RoundsGrid } from "./RoundsGrid";
import { ScorePad } from "./ScorePad";

interface PlayProps {
  game: Game;
  onChange: (g: Game) => void;
  onFinish: (g: Game) => void;
}

function Entry({ game, onChange }: Pick<PlayProps, "game" | "onChange">) {
  switch (game.mode) {
    case "highest":
    case "lowest":
    case "team":
      return <ScorePad game={game} onChange={onChange} />;
    case "rounds":
      return <RoundsGrid game={game} onChange={onChange} />;
    case "coop":
      return <CoopResult game={game} onChange={onChange} />;
    default:
      return game.mode satisfies never;
  }
}

export function Play({ game, onChange, onFinish }: PlayProps) {
  const canFinish = game.mode !== "coop" || game.result !== null;
  const standing = standings(game);

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4 p-4">
      <h2 className="text-xl font-black text-slate-900">{game.name}</h2>
      {game.mode === "team" && (
        <ul className="grid grid-cols-2 gap-2">
          {standing.map((r) => (
            <li key={r.name} className="rounded-xl bg-orange-50 p-3 text-center">
              <div className="text-xs font-bold uppercase text-orange-700">{r.name}</div>
              <div className="text-2xl font-black tabular-nums">{r.total}</div>
            </li>
          ))}
        </ul>
      )}
      <Entry game={game} onChange={onChange} />
      <button
        type="button"
        disabled={!canFinish}
        onClick={() => onFinish(finish(game, Date.now()))}
        className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-lg font-extrabold text-white shadow-lg transition active:scale-[0.98] disabled:opacity-40"
      >
        <Flag size={20} /> Finish game
      </button>
    </div>
  );
}
