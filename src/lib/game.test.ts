import assert from "node:assert/strict";
import { test } from "node:test";
import {
  add,
  addRound,
  finish,
  type Game,
  knownMode,
  newGame,
  setCell,
  setResult,
  standings,
  tally,
  totals,
  winners,
} from "./game.ts";

const names = ["Al", "Bo", "Cy"];

test("highest wins: running total, ties share rank", () => {
  let g = newGame("Catan", "highest", names);
  g = add(add(add(g, 0, 5), 1, 9), 2, 9);
  assert.deepEqual(
    standings(g).map((r) => [r.name, r.rank]),
    [
      ["Bo", 1],
      ["Cy", 1],
      ["Al", 3],
    ]
  );
  assert.deepEqual(winners(g), ["Bo", "Cy"]);
});

test("lowest wins: fewest points first", () => {
  let g = newGame("Golf", "lowest", names);
  g = add(add(add(g, 0, 40), 1, 22), 2, 31);
  assert.equal(standings(g)[0].name, "Bo");
  assert.deepEqual(winners(g), ["Bo"]);
});

test("rounds: cells sum per player across rounds", () => {
  let g = newGame("Rummy", "rounds", names);
  g = addRound(setCell(setCell(g, 0, 0, 10), 0, 1, 4));
  g = setCell(setCell(g, 1, 0, 3), 1, 1, 20);
  assert.deepEqual(totals(g), [13, 24, 0]);
  assert.deepEqual(winners(g), ["Bo"]);
});

test("team: members score for their team, whole team wins", () => {
  let g = newGame("Codenames", "team", ["Al", "Bo", "Cy", "Di"], [0, 1, 0, 1]);
  g = add(add(add(add(g, 0, 3), 1, 5), 2, 4), 3, 1);
  assert.deepEqual(
    standings(g).map((r) => [r.name, r.total]),
    [
      ["Team A", 7],
      ["Team B", 6],
    ]
  );
  assert.deepEqual(winners(g), ["Al", "Cy"]);
});

test("co-op: win credits everyone, loss credits nobody", () => {
  const g = newGame("Pandemic", "coop", names);
  assert.deepEqual(winners(setResult(g, "won")), names);
  assert.deepEqual(winners(setResult(g, "lost")), []);
});

test("tally counts only finished games, wins first", () => {
  const a = finish(add(newGame("A", "highest", ["Al", "Bo"]), 0, 5), 1);
  const b = finish(add(newGame("B", "highest", ["Al", "Bo"]), 1, 5), 2);
  const c = add(newGame("C", "highest", ["Al", "Bo"]), 1, 9); // unfinished
  const t = tally([a, b, c, finish(add(newGame("D", "highest", ["Bo", "Cy"]), 0, 1), 3)]);
  assert.deepEqual(
    t.map((x) => [x.name, x.wins, x.played]),
    [
      ["Bo", 2, 3],
      ["Al", 1, 2],
      ["Cy", 0, 1],
    ]
  );
});

test("games saved as the retired quiz mode load as round by round", () => {
  // As read back from localStorage
  const old: Game = JSON.parse(
    JSON.stringify({ ...newGame("Quiz", "rounds", ["A"]), mode: "quiz" })
  );
  assert.equal(knownMode(old).mode, "rounds");
});
