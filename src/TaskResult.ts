import { Result } from "./Result";
import { Failure, ResultValue, Success } from "./ResultValue";

type TaskMaybe<S, F> = () => Promise<ResultValue<S, F>>;

export class TaskResult<S = never, F = never>
  implements PromiseLike<Result<S, F>>
{
  constructor(private taskMaybe: TaskMaybe<S, F>) {}

  static success<S, F>(result: S) {
    return new TaskResult<S, F>(() => Promise.resolve(new Success(result)));
  }

  static failure<S, F>(result: F) {
    return new TaskResult<S, F>(() => Promise.resolve(new Failure(result)));
  }

  static fromPromise<S, F>(
    run: () => Promise<S>,
    mapError: (err: unknown) => F
  ) {
    return new TaskResult<S, F>(() =>
      run().then(
        (s) => new Success(s),
        (err) => new Failure(mapError(err))
      )
    );
  }

  map<S2 = never>(map: (success: S) => S2): TaskResult<S2, F> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) =>
        maybe.isSuccess() ? new Success(map(maybe.value)) : maybe
      )
    );
  }

  mapFailure<F2 = never>(map: (failure: F) => F2): TaskResult<S, F2> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) =>
        maybe.isFailure() ? new Failure(map(maybe.value)) : maybe
      )
    );
  }

  flatMap<S2>(param: (success: S) => TaskResult<S2, F>) {
    return new TaskResult<S2, F>(() =>
      this.taskMaybe().then((inner) => {
        if (inner.isSuccess()) {
          return param(inner.value).run();
        }
        return inner;
      })
    );
  }

  flatMapFailure<F2>(param: (failure: F) => TaskResult<S, F2>) {
    return new TaskResult<S, F2>(() =>
      this.taskMaybe().then((inner) => {
        if (inner.isFailure()) {
          return param(inner.value).run();
        }
        return inner;
      })
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

  then<Out1 = Result<S, F>, Out2 = never>(
    onfulfilled?:
      | ((value: Result<S, F>) => PromiseLike<Out1> | Out1)
      | undefined
      | null,
    onrejected?: ((reason: any) => PromiseLike<Out2> | Out2) | undefined | null
  ): PromiseLike<Out1 | Out2> {
    return this.run().then(
      onfulfilled ? (inner) => onfulfilled(toResult(inner)) : onfulfilled,
      onrejected ? (inner) => onrejected(toResult(inner)) : onrejected
    );
  }
}

function toResult<S, F>(maybe: ResultValue<S, F>) {
  return maybe.isSuccess()
    ? Result.success<S, F>(maybe.value)
    : Result.failure<S, F>(maybe.value);
}
