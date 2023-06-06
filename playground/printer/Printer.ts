import { NestedFailure } from "../lib/errors/NestedFailure";

import { TaskResult } from "../../src/TaskResult";
export class PrinterFailure extends NestedFailure {
  name = "PrinterFailure" as const;
  constructor(message: string, inner?: unknown) {
    super(message, inner);
  }
}
export interface Printer {
  print(file: Buffer): TaskResult<void, PrinterFailure>;
}
