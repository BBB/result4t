import { Printer, PrinterFailure } from "./Printer";
import { TaskResult } from "../../src";

export class LaserPrinter implements Printer {
  print(file: Buffer) {
    return TaskResult.fromPromise(
      async () => undefined,
      (err) => new PrinterFailure("Can't connect to printer", err),
    );
  }
}
