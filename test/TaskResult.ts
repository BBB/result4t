import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";
import { TaskResult } from "../src/TaskResult";

describe("map", () => {
  it("should transform a success", async () => {
    const out = await TaskResult.success(1)
      .map(() => "hello")
      .map(() => true);

    expect(out).toEqual(Result.success(true));
  });
});

describe("mapFailure", () => {
  it("should transform a failure", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const out = await TaskResult.failure(new Error("Boo")).mapFailure(
      () => booError
    );

    expect(out).toEqual(Result.failure(booError));
  });
});

describe("PromiseLike", () => {
  it("should return a Result when awaited", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const out = await TaskResult.failure(new Error("Boo")).mapFailure(
      () => booError
    );

    expect(out).toEqual(Result.failure(booError));
  });

  it("should pass a Result to a then", async () => {
    const out = await TaskResult.success(true).then((a) =>
      a.getOrElse(() => "woo")
    );
    expect(out).toEqual(true);
  });
});

describe("runThrowLeft", () => {
  it("should return the success", async () => {
    const out = TaskResult.success(true).runThrowFailure();
    await expect(out).resolves.toEqual(true);
  });
  it("should throw the failure", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const out = TaskResult.failure(booError).runThrowFailure();
    await expect(out).rejects.toEqual(booError);
  });
});
