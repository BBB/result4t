import { Result } from "./Result";
import { Failure, ResultValue, Success } from "./ResultValue";

type TaskMaybe<F, S> = () => Promise<ResultValue<F, S>>;

export class TaskResult<F = never, S = never>
  implements PromiseLike<Result<F, S>>
{
  constructor(private taskMaybe: TaskMaybe<F, S>) {}

  static success<F, S>(result: S) {
    return new TaskResult<F, S>(() => Promise.resolve(new Success(result)));
  }

  static failure<F, S>(result: F) {
    return new TaskResult<F, S>(() => Promise.resolve(new Failure(result)));
  }

  static fromPromise<F, S>(
    run: () => Promise<S>,
    mapError: (err: unknown) => F
  ) {
    return new TaskResult<F, S>(() =>
      run().then(
        (s) => new Success(s),
        (err) => new Failure(mapError(err))
      )
    );
  }

  map<R2 = never>(map: (success: S) => R2): TaskResult<F, R2> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) =>
        maybe.isSuccess() ? new Success(map(maybe.value)) : maybe
      )
    );
  }

  mapFailure<L2 = never>(map: (failure: F) => L2): TaskResult<L2, S> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) =>
        maybe.isFailure() ? new Failure(map(maybe.value)) : maybe
      )
    );
  }

  run() {
    return this.taskMaybe();
  }

  async runThrowFailure() {
    const result = await this.run();
    if (result.isFailure()) {
      throw result.value;
    }
    return result.value;
  }

  private toResult(maybe: ResultValue<F, S>) {
    return maybe.isSuccess()
      ? Result.success<F, S>(maybe.value)
      : Result.failure<F, S>(maybe.value);
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

  flatMap<S2>(param: (success: S) => TaskResult<F, S2>) {
    return new TaskResult<F, S2>(() =>
      this.taskMaybe().then((inner) => {
        if (inner.isSuccess()) {
          return param(inner.value).run();
        } else {
          return inner;
        }
      })
    );
  }
}
