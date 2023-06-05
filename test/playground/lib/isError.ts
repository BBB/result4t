export const isError = (maybeError: unknown): maybeError is Error =>
  maybeError instanceof Error;
