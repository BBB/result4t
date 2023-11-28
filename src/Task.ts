export class Task<Args extends any[], Return> {
  protected constructor(private fn: (...args: Args) => Promise<Return>) {}

  static of<
    Fn extends (...args: any[]) => Promise<any>,
    Args extends any[] = Fn extends (...args: infer R) => Promise<any>
      ? R
      : never,
    Return = Fn extends (...args: any[]) => Promise<infer R> ? R : never,
  >(fn: Fn) {
    return new Task<Args, Return>(fn);
  }

  map<Fn2 extends (...args: any) => Promise<any>>(
    predicate: (fn: (...args: Args) => Promise<Return>) => Fn2,
  ) {
    return Task.of(predicate(this.fn));
  }

  flatMap<
    Fn2 extends (...args: any) => Task<any, any>,
    Args2 extends any[] = Fn2 extends (...args: infer R) => Promise<any>
      ? R
      : never,
    Return2 = Fn2 extends (...args: any[]) => infer R ? R : never,
  >(
    predicate: (fn: (...args: Args) => Promise<Return>) => Task<Args2, Return2>,
  ) {
    return predicate(this.fn);
  }

  call(...args: Args): Promise<Return> {
    return this.fn(...args);
  }
}
