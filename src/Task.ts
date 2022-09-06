import { Result } from "./Result";
import { Failure, Success } from "./Maybe";

type TaskResult<F, S> = () => Promise<Failure<F> | Success<S>>;

export class Task<F = never, S = never> implements PromiseLike<Result<F, S>> {
  constructor(private inner: TaskResult<F, S>) {}

  static success<S>(result: S) {
    return new Task(() => Promise.resolve(new Success(result)));
  }

  static failure<F>(result: F) {
    return new Task(() => Promise.resolve(new Failure(result)));
  }

  static ofPromise<F, S>(run: () => Promise<S>, onError: (err: unknown) => F) {
    return new Task<F, S>(() =>
      run().then(
        (s) => new Success(s),
        (err) => new Failure(onError(err))
      )
    );
  }

  map<R2 = never>(param: (a: S) => R2): Task<F, R2> {
    return new Task(() =>
      this.inner().then((result) =>
        result.isSuccess() ? new Success(param(result.value)) : result
      )
    );
  }

  mapFailure<L2 = never>(param: (a: F) => L2): Task<L2, S> {
    return new Task(() =>
      this.inner().then((result) =>
        result.isFailure() ? new Failure(param(result.value)) : result
      )
    );
  }

  run() {
    return this.inner();
  }

  async runThrowFailure() {
    const result = await this.run();
    if (result.isFailure()) {
      throw result.value;
    }
    return result.value;
  }

  private toResult(inner: Failure<F> | Success<S>) {
    return inner.isSuccess()
      ? Result.success<F, S>(inner.value)
      : Result.failure<F, S>(inner.value);
  }

  then<Out1 = Result<F, S>, Out2 = never>(
    onfulfilled?:
      | ((value: Result<F, S>) => PromiseLike<Out1> | Out1)
      | undefined
      | null,
    onrejected?: ((reason: any) => PromiseLike<Out2> | Out2) | undefined | null
  ): PromiseLike<Out1 | Out2> {
    return this.run().then(
      onfulfilled ? (inner) => onfulfilled(this.toResult(inner)) : onfulfilled,
      onrejected ? (inner) => onrejected(this.toResult(inner)) : onrejected
    );
  }
}
