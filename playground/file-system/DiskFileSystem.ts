import { FilePath, FileSystem, FileSystemFailure } from "./FileSystem";
import { TaskResult } from "../../src";
import * as fs from "node:fs/promises";
import { isError } from "../lib/isError";

export class DiskFileSystem implements FileSystem {
  read(file: FilePath) {
    return TaskResult.fromPromise(
      async () => fs.readFile(file.toString()),
      (err) =>
        isError(err) && err.message.includes("File not found")
          ? FileSystemFailure.notFound(file)
          : FileSystemFailure.unknownReadIssue(file, err),
    );
  }

  write(file: FilePath, content: Buffer) {
    return TaskResult.fromPromise(
      async () => fs.writeFile(file.toString(), content),
      (err) => FileSystemFailure.unknownWriteIssue(file, err),
    );
  }
}
