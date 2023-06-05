import { FilePath, FileSystem, FileSystemFailure } from "./FileSystem";
import { TaskResult } from "../../../src";
import * as fs from "node:fs/promises";

export class DiskFileSystem implements FileSystem {
  read(file: FilePath): TaskResult<Buffer, FileSystemFailure> {
    return TaskResult.fromPromise(
      async () => fs.readFile(file.toString()),
      (err) => FileSystemFailure.fromNodeError(err, file)
    );
  }

  write(file: FilePath, content: Buffer): TaskResult<void, FileSystemFailure> {
    return TaskResult.fromPromise(
      async () => fs.writeFile(file.toString(), content),
      (err) => FileSystemFailure.fromNodeError(err, file)
    );
  }
}
