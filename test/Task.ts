import { describe, expect, it } from "vitest";
import { Task } from "../src/Task.js";
1;
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
