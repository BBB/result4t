import { isError } from "../lib/isError";
import { TaskResult } from "../../../src/TaskResult";
import { NestedFailure } from "../lib/errors/NestedFailure";

export class FileSystemFailure extends NestedFailure {
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

export interface FileSystem {
  read(file: FilePath): TaskResult<Buffer, FileSystemFailure>;

  write(file: FilePath, content: Buffer): TaskResult<void, FileSystemFailure>;
}

export class FilePath {
  constructor(private path: string) {}

  static of(path: string) {
    return new FilePath(path);
  }

  toString() {
    return this.path;
  }
}
