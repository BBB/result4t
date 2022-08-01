import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";
import { Task } from "../src/Task";

describe("map", () => {
  it("should transform a right value", async () => {
    const a = await Task.success(1)
      .map(() => "hello")
      .map(() => true);

    expect(a).toEqual(Result.success(true));
  });
});

describe("mapLeft", () => {
  it("should transform a left value", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const a = await Task.failure(new Error("Boo")).mapLeft(() => booError);

    expect(a).toEqual(Result.failure(booError));
  });
});

describe("PromiseLike", () => {
  it("should return the inner Either when awaited", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const a = await Task.failure(new Error("Boo")).mapLeft(() => booError);

    expect(a).toEqual(Result.failure(booError));
  });
});
describe("runThrowLeft", () => {
  it("should return the right side", async () => {
    await expect(Task.success(true).runThrowLeft()).resolves.toEqual(true);
  });
  it("should throw the left side", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    await expect(Task.failure(booError).runThrowLeft()).rejects.toEqual(
      booError
    );
  });
});
