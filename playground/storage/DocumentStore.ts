import { FileNotFound, FilePath, FileSystem } from "../file-system/FileSystem";
import { UserId } from "../lib/domain/UserId";

class NoInvoiceRecordFound {
  constructor(public userId: UserId) {}
}

export class DocumentStore {
  constructor(private fileSystem: FileSystem) {}

  invoiceRecordFor(userId: UserId) {
    return this.fileSystem
      .read(new FilePath(`invoices/${userId}/records.txt`))
      .mapFailure((failure) =>
        failure instanceof FileNotFound
          ? new NoInvoiceRecordFound(userId)
          : failure
      );
  }
}
