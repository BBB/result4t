import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";
import { Task } from "../src/Task";

describe("map", () => {
  it("should transform a success", async () => {
    const a = await Task.success(1)
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
    const a = await Task.failure(new Error("Boo")).mapFailure(() => booError);

    expect(a).toEqual(Result.failure(booError));
  });
});

describe("PromiseLike", () => {
  it("should return the inner Either when awaited", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    const a = await Task.failure(new Error("Boo")).mapFailure(() => booError);

    expect(a).toEqual(Result.failure(booError));
  });

  it("should pass the inner to a then", async () => {
    expect(
      await Task.success(true).then((a) => a.getOrElse(() => "woo"))
    ).toEqual(true);
  });
});

describe("runThrowLeft", () => {
  it("should return the success", async () => {
    await expect(Task.success(true).runThrowFailure()).resolves.toEqual(true);
  });
  it("should throw the failure", async () => {
    class BooError extends Error {
      name = "BooError";
    }
    const booError = new BooError();
    await expect(Task.failure(booError).runThrowFailure()).rejects.toEqual(
      booError
    );
  });
});
