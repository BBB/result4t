import { TaskResult } from "../../src/TaskResult";
import { NestedFailure } from "../lib/errors/NestedFailure";

export type FileSystemFailure = FileNotFound;
export const FileSystemFailure = {
  unknownReadIssue(filePath: FilePath, inner: unknown) {
    return new UnknownSystemFailure("read", filePath, inner);
  },
  unknownWriteIssue(filePath: FilePath, inner: unknown) {
    return new UnknownSystemFailure("write", filePath, inner);
  },
  notFound(file: FilePath) {
    return new FileNotFound(file);
  },
};

export class UnknownSystemFailure extends NestedFailure {
  constructor(action: string, public file: FilePath, inner: unknown) {
    super(`Unable to ${action}`, inner);
  }
}

export class FileNotFound {
  constructor(public file: FilePath) {}
}

export interface FileSystem {
  read(file: FilePath): TaskResult<Buffer, FileNotFound | UnknownSystemFailure>;

  write(
    file: FilePath,
    content: Buffer
  ): TaskResult<void, UnknownSystemFailure>;
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
