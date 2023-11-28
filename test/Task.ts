import { describe, expect, it } from "vitest";
import utils from "node:util";
import { Failure, Result, Success } from "../src/Result.js";
import { TaskResult } from "../src/TaskResult.js";
import { Task } from "../src/Task.js";

class Failed {}

const sleep = (ms: number) =>
  TaskResult.fromPromise(
    () => utils.promisify(setTimeout)(ms),
    () => new Error("never"),
  );

describe("instance", () => {
  describe("map", () => {
    it("should allow for wrapping a value", async () => {
      const out = await Task.of(async (input: number) => input > 0)
        .map((prev) => (input: number) => prev(input - 1))
        .call(1);

      expect(out).toStrictEqual(false);
    });
  });
});
