export class Task<Args extends any[], Return> {
  protected constructor(private fn: (...args: Args) => Return) {}

  static of<
    Fn extends (...args: any[]) => any,
    Args extends any[] = Fn extends (...args: infer R) => any ? R : never,
    Return = Fn extends (...args: any[]) => infer R ? R : never,
  >(fn: Fn) {
    return new Task<Args, Return>(fn);
  }

  map<Fn2 extends (...args: any) => any>(
    predicate: (fn: (...args: Args) => Return) => Fn2,
  ) {
    return Task.of(predicate(this.fn));
  }

  flatMap<
    Fn2 extends (...args: any) => Task<any, any>,
    Args2 extends any[] = Fn2 extends (...args: infer R) => any ? R : never,
    Return2 = Fn2 extends (...args: any[]) => infer R ? R : never,
  >(predicate: (fn: (...args: Args) => Return) => Task<Args2, Return2>) {
    return predicate(this.fn);
  }

  call(...args: Args): Return {
    return this.fn(...args);
  }
}
