import { Result } from "./Result";

type TaskResult<F, S> = () => Promise<Result<F, S>>;

export class Task<F = never, S = never> implements PromiseLike<Result<F, S>> {
  constructor(private inner: TaskResult<F, S>) {}

  static success<S>(result: S) {
    return new Task(() => Promise.resolve(Result.success(result)));
  }

  static failure<F>(result: F) {
    return new Task(() => Promise.resolve(Result.failure(result)));
  }

  map<R2 = never>(param: (a: S) => R2): Task<F, R2> {
    return new Task(() => this.inner().then((result) => result.map(param)));
  }

  flatMap<S2>(param: (a: Task<F,S>) => Task<F, S2>) {
    return param(this)
  }

  mapLeft<L2 = never>(param: (a: F) => L2): Task<L2, S> {
    return new Task(() => this.inner().then((result) => result.mapLeft(param)));
  }

  run() {
    return this.inner();
  }

  async runThrowFailure() {
    const result = await this.run();
    return result.getOrElse((err) => {
      throw err;
    });
  }

  then<Out1 = Result<F, S>, Out2 = never>(
    onfulfilled?:
      | ((value: Result<F, S>) => PromiseLike<Out1> | Out1)
      | undefined
      | null,
    onrejected?: ((reason: any) => PromiseLike<Out2> | Out2) | undefined | null
  ): PromiseLike<Out1 | Out2> {
    return this.run().then(onfulfilled, onrejected);
  }
}
