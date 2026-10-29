import { Check, Mic, Plus, SkipForward, Trash2, Trophy } from "lucide-react";
import { useState } from "react";
import { queue, type Song, topPerformances } from "../lib/karaoke";

const field =
  "min-h-11 w-full min-w-0 rounded-xl border-2 border-slate-200 bg-white px-3 text-base outline-none focus-visible:border-indigo-600";

/** Karaoke night: fair singer rotation, optional scores from the room, best performances */
export function Karaoke({ songs, onChange }: { songs: Song[]; onChange: (s: Song[]) => void }) {
  const [singer, setSinger] = useState("");
  const [title, setTitle] = useState("");
  const [score, setScore] = useState("");
  const [now, ...next] = queue(songs);
  const best = topPerformances(songs);

  function add(e: React.FormEvent) {
    e.preventDefault();
    if (!singer.trim() || !title.trim()) return;
    onChange([...songs, { id: crypto.randomUUID(), singer: singer.trim().slice(0, 24), title: title.trim().slice(0, 80), score: null, done: false, addedAt: Date.now() }]);
    setTitle("");
  }

  function finish(song: Song, scored: boolean) {
    const n = Number(score);
    onChange(songs.map((s) => (s.id === song.id ? { ...s, done: true, score: scored && n >= 1 && n <= 10 ? n : null } : s)));
    setScore("");
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-4">
      <form onSubmit={add} className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <h2 className="font-extrabold">Add to the queue</h2>
        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            Singer
            <input value={singer} onChange={(e) => setSinger(e.target.value)} className={field} required />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
            Song
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Mr Brightside" className={field} required />
          </label>
        </div>
        <button type="submit" className="flex min-h-11 items-center justify-center gap-1 rounded-xl bg-indigo-600 text-sm font-bold text-white active:scale-[0.98]">
          <Plus size={16} aria-hidden="true" /> Add song
        </button>
      </form>

      <section aria-labelledby="now-h" aria-live="polite" className="rounded-2xl bg-indigo-600 p-5 text-white shadow-lg">
        <h2 id="now-h" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-indigo-100">
          <Mic size={16} aria-hidden="true" /> Now singing
        </h2>
        {now ? (
          <>
            <p className="mt-1 text-2xl font-black">{now.singer}</p>
            <p className="text-lg">{now.title}</p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Room score (1 to 10)
                <input
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={10}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="min-h-11 w-24 rounded-xl bg-white px-3 text-lg font-bold text-slate-900"
                />
              </label>
              <button type="button" onClick={() => finish(now, true)} className="flex min-h-11 items-center gap-1 rounded-xl bg-white px-4 text-sm font-bold text-indigo-800 active:scale-[0.98]">
                <Check size={16} aria-hidden="true" /> Done
              </button>
              <button type="button" onClick={() => finish(now, false)} className="flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-white ring-1 ring-white/60 active:scale-[0.98]">
                <SkipForward size={16} aria-hidden="true" /> Skip
              </button>
            </div>
          </>
        ) : (
          <p className="mt-1 text-lg">Queue is empty. Who's first?</p>
        )}
      </section>

      {next.length > 0 && (
        <section aria-labelledby="next-h">
          <h3 id="next-h" className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-600">
            Up next
          </h3>
          <ol className="flex flex-col gap-1">
            {next.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 rounded-xl bg-white py-1 pl-3 pr-1 ring-1 ring-slate-200">
                <span className="w-5 text-sm tabular-nums text-slate-500">{i + 1}</span>
                <span className="min-w-0 flex-1 truncate">
                  <span className="font-bold">{s.singer}</span> · {s.title}
                </span>
                <button
                  type="button"
                  onClick={() => onChange(songs.filter((x) => x.id !== s.id))}
                  aria-label={`Remove ${s.title} by ${s.singer}`}
                  className="grid size-11 place-items-center rounded-xl text-rose-700 hover:bg-rose-50"
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ol>
        </section>
      )}

      {best.length > 0 && (
        <section aria-labelledby="best-h">
          <h3 id="best-h" className="mb-2 flex items-center gap-1 text-sm font-semibold uppercase tracking-wide text-slate-600">
            <Trophy size={14} aria-hidden="true" /> Best performances
          </h3>
          <ol className="flex flex-col gap-1">
            {best.map((s) => (
              <li key={s.id} className="flex justify-between rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-200">
                <span>
                  <span className="font-bold">{s.singer}</span> · {s.title}
                </span>
                <span className="font-black tabular-nums text-indigo-700">{s.score}/10</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {songs.some((s) => s.done) && (
        <button
          type="button"
          onClick={() => {
            if (confirm("Clear the night? Every song and score goes.")) onChange([]);
          }}
          className="flex min-h-11 items-center justify-center gap-1 rounded-xl text-sm font-semibold text-rose-700"
        >
          <Trash2 size={16} aria-hidden="true" /> Clear karaoke night
        </button>
      )}
    </div>
  );
}
