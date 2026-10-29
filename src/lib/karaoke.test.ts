import assert from "node:assert/strict";
import { test } from "node:test";
import { queue, type Song, topPerformances } from "./karaoke.ts";

const s = (
  id: string,
  singer: string,
  addedAt: number,
  done = false,
  score: number | null = null
): Song => ({ id, singer, title: id, score, done, addedAt });

test("queue rotates singers fairly", () => {
  const songs = [s("a1", "Al", 1), s("a2", "Al", 2), s("b1", "Bo", 3), s("c1", "Cy", 4)];
  assert.deepEqual(
    queue(songs).map((x) => x.id),
    ["a1", "b1", "c1", "a2"]
  );
  assert.deepEqual(
    queue([{ ...songs[0], done: true } as Song, ...songs.slice(1)]).map((x) => x.id),
    ["b1", "c1", "a2"]
  );
});

test("topPerformances ignores unscored songs", () => {
  assert.deepEqual(
    topPerformances([
      s("x", "Al", 1, true, 7),
      s("y", "Bo", 2, true, 9),
      s("z", "Cy", 3, true),
    ]).map((x) => x.id),
    ["y", "x"]
  );
});
