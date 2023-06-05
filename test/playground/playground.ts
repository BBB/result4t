import { TaskResult } from "../../src/TaskResult";
import { expect, it } from "vitest";
import { Result } from "../../src/Result";
import { FilePath } from "./file-system/FileSystem";
import { NestedFailure } from "./lib/errors/NestedFailure";
import { DiskFileSystem } from "./file-system/DiskFileSystem";

class PrinterFailure extends NestedFailure {
  constructor(message: string, inner?: unknown) {
    super(message, inner);
  }
}

const printFile = (_: Buffer) =>
  TaskResult.fromPromise(
    async () => undefined,
    (err) => new PrinterFailure("Can't connect to printer", err)
  );

it("should allow for flatMap across failures with the same supertype", async () => {
  const fs = new DiskFileSystem();
  const out = await fs
    .read(FilePath.of("./woo"))
    .flatMap(printFile)
    .map(() => "all done");
  expect(out).toStrictEqual(Result.success("all done"));
});
