import { describe, expect, it } from "vitest";
import { Result } from "../src/Result";
import { TaskResult } from "../src/TaskResult";

describe("fromResult", () => {
  it("will map to a TaskResult", async () => {
    const out = await TaskResult.fromResult(Result.success(1))
      .map(() => "hello")
      .map(() => true);

    expect(out).toStrictEqual(Result.success(true));
  });
  it("will map to a TaskResult failure", async () => {
    const out = await TaskResult.fromResult(Result.failure(1))
      .map(() => "hello")
      .map(() => true);

    expect(out).toStrictEqual(Result.failure(1));
  });
});
describe("map", () => {
  it("should transform a success", async () => {
    const out = await TaskResult.success(1)
      .map(() => "hello")
      .map(() => true);

    expect(out).toStrictEqual(Result.success(true));
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

    expect(out).toStrictEqual(Result.failure(booError));
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

    expect(out).toStrictEqual(Result.failure(booError));
  });

  it("should pass a Result to a then", async () => {
    const out = await TaskResult.success(true).then((a) =>
      a.getOrElse(() => "woo")
    );
    expect(out).toStrictEqual(true);
  });
});

describe("runThrowFailure", () => {
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
    await expect(out).rejects.toStrictEqual(booError);
  });
});
