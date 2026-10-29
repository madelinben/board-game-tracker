# Board Game Score

Track scores for any board game or karaoke night, and keep a running leaderboard. Quiz nights live in [Quiz Tracker](https://github.com/madelinben/quiz-tracker).

- Scoring modes: **highest wins**, **lowest wins**, **round by round** table, **teams**, **co-op** (win/lose together)
- **Karaoke**: queue songs, fair singer rotation (nobody sings twice until everyone queued has sung), optional room score out of 10, best performances
- Data stays in the browser (localStorage). Download a backup file and restore it on any device; `<BoardGamesApp beforeExport={gate} />` runs a host hook (e.g. an ad gate) first.

Two ways this repo ships, from the same `src/`:

| Target | How |
|---|---|
| **GitHub Pages** (`madelinben.github.io/board-game-tracker/`) | `pnpm build:demo` builds `demo/` into `docs/` (Pages source: `main` / `/docs`) |
| **get-out-there** (Cloudflare) | imported as workspace package `@get-out-there/board-games` (`BoardGamesApp`) |

```bash
pnpm install
pnpm dev          # demo at http://localhost:3102/board-game-tracker/
pnpm test         # scoring logic unit tests
pnpm build:demo   # static site -> docs/
```

Package rules: no router/auth/app imports; Tailwind default palette only (no custom tokens); host must `@source` this folder. Peer deps: react, react-dom, lucide-react.
