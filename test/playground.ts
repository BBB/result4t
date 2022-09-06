import { TaskResult } from "../src/TaskResult";
import { it, expect } from "vitest";
import { Result } from "../src/Result";

class NestedError<Err extends Error = Error> extends Error {
  name = "NestedError";

  constructor(message: string, public innerError?: Err) {
    super(message);
  }
}

class FileSystemError extends NestedError {
  name = "FileSystemError";

  constructor(public method: string, innerError?: Error) {
    super(`Unable to call ${method}`, innerError);
  }
}

class PrinterError extends NestedError {
  name = "PrinterError";

  constructor(message: string, innerError?: Error) {
    super(message, innerError);
  }
}

class FilePath {
  constructor(private path: string) {}

  static of(path: string) {
    return new FilePath(path);
  }

  toString() {
    return this.path;
  }
}

const isError = (maybeError: unknown): maybeError is Error =>
  maybeError instanceof Error;

const readFile = (filePath: FilePath) =>
  TaskResult.ofPromise(
    async () => Buffer.from(`contents:${filePath}`),
    (err) =>
      isError(err)
        ? new FileSystemError(`Unable to readFile at "${filePath}"`, err)
        : new FileSystemError(`Unable to readFile at "${filePath}"`)
  );

const printFile = (contents: Buffer) =>
  TaskResult.ofPromise(
    async () => undefined,
    (err) =>
      isError(err)
        ? new PrinterError("Can't connect to printer", err)
        : new PrinterError("Can't connect to printer")
  );

it("should allow for flatMap across failures with the same supertype", async () => {
  const task = TaskResult.success<Error, undefined>(undefined).flatMap(() =>
    readFile(FilePath.of("./woo"))
  );
  const out = await task
    .mapFailure((err) => err)
    .flatMap((fileContents) => printFile(fileContents))
    .map(() => "all done");
  expect(out).toStrictEqual(Result.success("all done"));
});
