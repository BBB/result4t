import { DiskFileSystem } from "./file-system/DiskFileSystem";
import { LaserPrinter } from "./printer/LaserPrinter";
import { TaskResult } from "../src";
import { NestedFailure } from "./lib/errors/NestedFailure";
import { DocumentStore } from "./storage/DocumentStore";
import { UserId } from "./lib/domain/UserId";

class DocumentPrintingFailure extends NestedFailure {
  constructor(public userId: UserId, inner: unknown) {
    super("Unable to print document", inner);
  }
}

const documents = new DocumentStore(new DiskFileSystem());
const printer = new LaserPrinter();

function main(userId: UserId): TaskResult<void, DocumentPrintingFailure> {
  return documents
    .invoiceRecordFor(userId)
    .mapFailure((failure) => new DocumentPrintingFailure(userId, failure))
    .flatMap((file) =>
      printer
        .print(file)
        .mapFailure((failure) => new DocumentPrintingFailure(userId, failure))
    );
}

main("123")
  .run()
  .catch((err) => console.error(err));
