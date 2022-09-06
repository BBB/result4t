import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";
import { TaskResult } from "../src/TaskResult";

describe("map", () => {
  it("should transform a success", async () => {
    const a = await TaskResult.success(1)
      .map(() => "hello")
      .map(() => true);

    expect(a).toEqual(Result.success(true));
  });
});

describe("mapFailure", () => {
  it("should transform a failure", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const a = await TaskResult.failure(new Error("Boo")).mapFailure(
      () => booError
    );

    expect(a).toEqual(Result.failure(booError));
  });
});

describe("PromiseLike", () => {
  it("should return the inner Either when awaited", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const a = await TaskResult.failure(new Error("Boo")).mapFailure(
      () => booError
    );

    expect(a).toEqual(Result.failure(booError));
  });

  it("should pass the inner to a then", async () => {
    expect(
      await TaskResult.success(true).then((a) => a.getOrElse(() => "woo"))
    ).toEqual(true);
  });
});

describe("runThrowLeft", () => {
  it("should return the success", async () => {
    await expect(TaskResult.success(true).runThrowFailure()).resolves.toEqual(
      true
    );
  });
  it("should throw the failure", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    await expect(
      TaskResult.failure(booError).runThrowFailure()
    ).rejects.toEqual(booError);
  });
});
