export abstract class NestedFailure {
  protected constructor(
    public message: string,
    public inner?: unknown,
  ) {}
}
