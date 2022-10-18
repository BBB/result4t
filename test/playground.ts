import { TaskResult } from "../src/TaskResult";
import { expect, it } from "vitest";
import { Result } from "../src/Result";

abstract class Nested {
  protected constructor(public message: string, public inner?: unknown) {}
}

class FileSystemFailure extends Nested {
  constructor(public message: string, inner?: unknown) {
    super(message, inner);
  }

  static unknownReadIssue(filePath: FilePath, inner: unknown) {
    return new FileSystemFailure(`Unable to readFile at "${filePath}"`, inner);
  }

  static notFound(filePath: FilePath) {
    return new FileSystemFailure(`File not found at "${filePath}"`);
  }

  static fromNodeError(err: unknown, filePath: FilePath) {
    return isError(err)
      ? err.message.includes("File not found")
        ? FileSystemFailure.notFound(filePath)
        : FileSystemFailure.unknownReadIssue(filePath, err)
      : FileSystemFailure.unknownReadIssue(filePath, err);
  }
}

class PrinterFailure extends Nested {
  constructor(message: string, inner?: unknown) {
    super(message, inner);
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

const readFile = (filePath: FilePath): TaskResult<Buffer, FileSystemFailure> =>
  TaskResult.fromPromise(
    async () => Buffer.from(`contents:${filePath}`),
    (err) => FileSystemFailure.fromNodeError(err, filePath)
  );

const printFile = (_: Buffer) =>
  TaskResult.fromPromise(
    async () => undefined,
    (err) => new PrinterFailure("Can't connect to printer", err)
  );

it("should allow for flatMap across failures with the same supertype", async () => {
  const out = await readFile(FilePath.of("./woo"))
    .flatMap(printFile)
    .map(() => "all done");
  expect(out).toStrictEqual(Result.success("all done"));
});
