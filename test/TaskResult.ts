import { describe, expect, it } from "vitest";
import utils from "node:util";
import { Failure, Result, Success } from "../src/Result.js";
import { TaskResult } from "../src/TaskResult.js";

class Failed {}

const sleep = (ms: number) =>
  TaskResult.fromPromise(
    () => utils.promisify(setTimeout)(ms),
    () => new Error("never"),
  );

describe("static", () => {
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
  describe("fromNullable", () => {
    it("will map to a TaskResult", async () => {
      const out = await TaskResult.fromNullable("hello", new Failed());

      expect(out).toStrictEqual(Result.success("hello"));
    });
    it("will map to a TaskResult failure", async () => {
      const out = await TaskResult.fromNullable(null, new Failed());

      expect(out).toStrictEqual(Result.failure(new Failed()));
    });
  });
  describe("fromPromise", () => {
    it("will convert the Promise<T> to a TaskResult<T>", async () => {
      const out = await TaskResult.fromPromise(
        () => Promise.resolve(1),
        (err) => new Failed(),
      ).map((int) => int + 1);

      expect(out).toStrictEqual(Result.success(2));
    });

    it("will convert the error to TaskResult<never,E>", async () => {
      const out = await TaskResult.fromPromise(
        () => Promise.reject(1),
        (err) => new Failed(),
      ).map((int) => int + 1);

      expect(out).toStrictEqual(Result.failure(new Failed()));
    });
  });

  describe("fold", () => {
    it("runs the tasks in sequence and returns an ordered array of results", async () => {
      const out = await TaskResult.fold([
        sleep(2).map(() => "first"),
        sleep(1).map(() => "second"),
        sleep(0).map(() => "third"),
      ]);
      expect(out).toStrictEqual(Result.success(["first", "second", "third"]));
    });

    it("responds with a failure if one fails", async () => {
      const error = new Error("Boom");
      const out = await TaskResult.fold([
        sleep(2).map(() => "first"),
        TaskResult.failure(error),
        sleep(0).map(() => "third"),
      ]);
      expect(out).toStrictEqual(Result.failure(error));
    });
  });

  describe("foldChunks", () => {
    it("runs the tasks in sequence and returns an ordered array of results", async () => {
      const out = await TaskResult.foldChunks(1, [
        sleep(2).map(() => "first"),
        sleep(1).map(() => "second"),
        sleep(0).map(() => "third"),
      ]);
      expect(out).toStrictEqual(Result.success(["first", "second", "third"]));
    });

    it("responds with a failure if one fails", async () => {
      const error = new Error("Boom");
      const out = await TaskResult.foldChunks(1, [
        sleep(2).map(() => "first"),
        TaskResult.failure(error),
        sleep(0).map(() => "third"),
      ]);
      expect(out).toStrictEqual(Result.failure(error));
    });
  });

  describe("map", () => {
    it("runs the tasks in sequence and returns an ordered array of results", async () => {
      const out = await TaskResult.map([
        sleep(2).map(() => "first"),
        sleep(1).map(() => "second"),
        sleep(0).map(() => "third"),
      ]);
      expect(out).toStrictEqual(Result.success(["first", "second", "third"]));
    });

    it("responds with a failure if one fails", async () => {
      const error = new Error("Boom");
      const out = await TaskResult.map([
        sleep(2).map(() => "first"),
        TaskResult.failure(error),
        sleep(0).map(() => "third"),
      ]);
      expect(out).toStrictEqual(Result.failure(error));
    });
  });
});
describe("instance", () => {
  describe("map", () => {
    it("should transform a success", async () => {
      const out = await TaskResult.success(1)
        .map(() => "hello")
        .map(() => true);

      expect(out).toStrictEqual(Result.success(true));
    });

    it("always responds with a Result", async () => {
      const resultSuccess = await TaskResult.success(1)
        .map(() => {})
        .run();
      const resultFailure = await TaskResult.failure(1)
        .map(() => {})
        .run();

      expect(resultSuccess).toBeInstanceOf(Success);
      expect(resultFailure).toBeInstanceOf(Failure);
    });
  });

  describe("fold", () => {
    it("should transform a success and failure", async () => {
      const out = await TaskResult.success(1).fold(
        () => TaskResult.success("hello" as const),
        (err) =>
          err instanceof Failed
            ? TaskResult.success("waa" as const)
            : TaskResult.failure("oh-no" as const),
      );

      expect(out).toStrictEqual(Result.success("hello"));
    });
  });

  describe("mapFailure", () => {
    it("should transform a failure", async () => {
      class BooError {
        name = "BooError";
      }
      const booError = new BooError();
      const out = await TaskResult.failure(new Error("Boo")).mapFailure(
        () => booError,
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
        () => booError,
      );

      expect(out).toStrictEqual(Result.failure(booError));
    });

    it("should pass a Result to a then", async () => {
      const out = await TaskResult.success(true).then((a) =>
        a.getOrElse(() => "woo"),
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
});
