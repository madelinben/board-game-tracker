import { ListOrdered, Mic, Swords } from "lucide-react";
import { useEffect, useState } from "react";
import { DataBackup } from "./components/DataBackup";
import { Karaoke } from "./components/Karaoke";
import { Leaderboard } from "./components/Leaderboard";
import { Play } from "./components/Play";
import { Setup } from "./components/Setup";
import { type Game, knownMode } from "./lib/game";
import type { Song } from "./lib/karaoke";
import { type BeforeExport, load, save } from "./lib/storage";

const CURRENT_KEY = "bgs-current";
const HISTORY_KEY = "bgs-history";
const KARAOKE_KEY = "bgs-karaoke";
type Tab = "play" | "leaderboard" | "karaoke";

interface Backup {
  version: 1;
  history: Game[];
  karaoke: Song[];
}

const parseBackup = (raw: unknown): Backup | null => {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Partial<Backup>;
  return d.version === 1 && Array.isArray(d.history)
    ? { version: 1, history: d.history.map(knownMode), karaoke: d.karaoke ?? [] }
    : null;
};

const TABS = [
  { id: "play", label: "Game", Icon: Swords },
  { id: "leaderboard", label: "Leaderboard", Icon: ListOrdered },
  { id: "karaoke", label: "Karaoke", Icon: Mic },
] as const;

export function BoardGamesApp({ beforeExport }: { beforeExport?: BeforeExport }) {
  const [tab, setTab] = useState<Tab>("play");
  const [game, setGame] = useState<Game | null>(null);
  const [history, setHistory] = useState<Game[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [ready, setReady] = useState(false);

  // Load after mount: localStorage is unavailable during SSR and would cause a hydration mismatch.
  useEffect(() => {
    const current = load<Game | null>(CURRENT_KEY, null);
    setGame(current && knownMode(current));
    setHistory(load<Game[]>(HISTORY_KEY, []).map(knownMode));
    setSongs(load<Song[]>(KARAOKE_KEY, []));
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

  const updateSongs = (next: Song[]) => {
    setSongs(next);
    save(KARAOKE_KEY, next);
  };

  const restore = (b: Backup) => {
    setHistory(b.history);
    save(HISTORY_KEY, b.history);
    updateSongs(b.karaoke);
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
        {tab === "leaderboard" && (
          <>
            <Leaderboard history={history} onClear={clear} />
            <div className="mx-auto max-w-xl px-4 pb-4">
              <DataBackup
                filename="board-game-tracker.json"
                data={{ version: 1, history, karaoke: songs }}
                parse={parseBackup}
                onRestore={restore}
                beforeExport={beforeExport}
              />
            </div>
          </>
        )}
        {tab === "karaoke" && <Karaoke songs={songs} onChange={updateSongs} />}
      </div>
      <nav
        aria-label="Board Game Tracker"
        className="grid grid-cols-3 gap-1 border-t border-slate-200 bg-white p-1.5"
      >
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
