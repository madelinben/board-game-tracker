import { ListOrdered, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { Leaderboard } from "./components/Leaderboard";
import { Play } from "./components/Play";
import { Setup } from "./components/Setup";
import type { Game } from "./lib/game";
import { load, save } from "./lib/storage";

const CURRENT_KEY = "bgs-current";
const HISTORY_KEY = "bgs-history";
type Tab = "play" | "leaderboard";

const TABS = [
  { id: "play", label: "Game", Icon: Swords },
  { id: "leaderboard", label: "Leaderboard", Icon: ListOrdered },
] as const;

export function BoardGamesApp() {
  const [tab, setTab] = useState<Tab>("play");
  const [game, setGame] = useState<Game | null>(null);
  const [history, setHistory] = useState<Game[]>([]);
  const [ready, setReady] = useState(false);

  // Load after mount: localStorage is unavailable during SSR and would cause a hydration mismatch.
  useEffect(() => {
    setGame(load<Game | null>(CURRENT_KEY, null));
    setHistory(load<Game[]>(HISTORY_KEY, []));
    setReady(true);
  }, []);

  const update = (g: Game | null) => {
    setGame(g);
    save(CURRENT_KEY, g);
  };

  const finish = (g: Game) => {
    const next = [...history, g];
    setHistory(next);
    save(HISTORY_KEY, next);
    update(null);
    setTab("leaderboard");
  };

  const clear = () => {
    setHistory([]);
    save(HISTORY_KEY, []);
  };

  if (!ready) return <div className="h-full animate-pulse bg-slate-100" />;

  return (
    <div className="flex h-full flex-col bg-slate-50 text-slate-900">
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "play" &&
          (game ? (
            <Play game={game} onChange={update} onFinish={finish} />
          ) : (
            <Setup onStart={update} />
          ))}
        {tab === "leaderboard" && <Leaderboard history={history} onClear={clear} />}
      </div>
      <nav className="grid grid-cols-2 gap-1 border-t border-slate-200 bg-white p-1.5">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-current={tab === id}
            onClick={() => setTab(id)}
            className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-sm font-extrabold transition active:scale-[0.97] ${
              tab === id ? "bg-indigo-600 text-white" : "text-slate-600"
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
