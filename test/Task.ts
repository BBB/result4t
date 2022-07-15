import { describe, expect, it } from "vitest";
import { Either } from "../src/Either";
import { Task } from "../src/Task";

describe("map", () => {
  it("should transform a right value", async () => {
    const a = await new Task(() => Promise.resolve(Either.right(1)))
      .map((val) => "hello")
      .map((val) => true)
      .run();

    expect(a).toEqual(Either.right(true));
  });
});
describe("mapLeft", () => {
  it("should transform a left value", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const a = await new Task(() =>
      Promise.resolve(Either.left(new Error("Boo")))
    )
      .mapLeft((val) => booError)
      .run();

    expect(a).toEqual(Either.left(booError));
  });
});
