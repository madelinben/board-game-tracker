import { Skull, Trophy } from "lucide-react";
import { type CoopResult as Result, type Game, setResult } from "../lib/game";

const OPTIONS: { value: Exclude<Result, null>; label: string; Icon: typeof Trophy }[] = [
  { value: "won", label: "We won", Icon: Trophy },
  { value: "lost", label: "We lost", Icon: Skull },
];

export function CoopResult({ game, onChange }: { game: Game; onChange: (g: Game) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-slate-600">{game.players.join(", ")} play together against the game.</p>
      <div className="grid grid-cols-2 gap-3">
        {OPTIONS.map(({ value, label, Icon }) => (
          <button
            key={value}
            type="button"
            aria-pressed={game.result === value}
            onClick={() => onChange(setResult(game, value))}
            className={`flex min-h-20 flex-col items-center justify-center gap-1 rounded-2xl text-lg font-extrabold transition active:scale-[0.97] ${
              game.result === value
                ? value === "won"
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Icon size={24} />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
