import { Result } from "./Result";
import { Failure, ResultValue, Success } from "./ResultValue";

type TaskMaybe<S, F> = () => Promise<ResultValue<S, F>>;

export class TaskResult<S = never, F = never>
  implements PromiseLike<Result<S, F>>
{
  constructor(private taskMaybe: TaskMaybe<S, F>) {}

  /**
   * Creates a new instance of a successful `TaskResult` based on the value
   * @param result
   */
  static success<S, F>(result: S) {
    return new TaskResult<S, F>(() => Promise.resolve(new Success(result)));
  }

  /**
   * Creates a new instance of a failed `TaskResult` based on the value
   * @param result
   */
  static failure<S, F>(result: F) {
    return new TaskResult<S, F>(() => Promise.resolve(new Failure(result)));
  }

  /**
   * Upgrades a `Result` to a `TaskResult`
   */
  static fromResult<S, F>(result: Result<S, F>) {
    return new TaskResult<S, F>(async () =>
      result.isSuccess()
        ? new Success(result.get())
        : new Failure(result.get() as F)
    );
  }

  /**
   * Converts a `Promise` to a `TaskResult`
   */
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

  /**
   * Runs the tasks sequentially
   */
  static fold = <S, F>(
    tasks: TaskResult<S, F>[]
  ): TaskResult<readonly S[], F> => {
    const first = tasks.shift();
    return tasks.reduce(
      (prev, it) => prev.flatMap((all) => it.map((res) => [...all, res])),
      first!.map((res) => [res])
    );
  };


  /**
   * Use to transform the success value inside the `TaskResult`
   */
  map<S2 = never>(map: (success: S) => S2): TaskResult<S2, F> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) =>
        maybe.isSuccess() ? new Success(map(maybe.value)) : maybe
      )
    );
  }

  /**
   * Use to transform the failure value inside the `TaskResult`
   */
  mapFailure<F2 = never>(map: (failure: F) => F2): TaskResult<S, F2> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) =>
        maybe.isFailure() ? new Failure(map(maybe.value)) : maybe
      )
    );
  }

  /**
   * Read the success value in the `TaskResult`, useful for sideeffects, or logging
   */
  peek(peekSuccess: (success: S) => void): TaskResult<S, F> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) => {
        if (maybe.isSuccess()) {
          peekSuccess(maybe.value);
        }
        return maybe;
      })
    );
  }

  /**
   * Read the failure value in the `TaskResult`, useful for sideeffects, or logging
   */
  peekFailure(peekFailure: (failure: F) => void): TaskResult<S, F> {
    return new TaskResult(() =>
      this.taskMaybe().then((maybe) => {
        if (maybe.isFailure()) {
          peekFailure(maybe.value);
        }
        return maybe;
      })
    );
  }

  /**
   * Join a `TaskResult` into this `TaskResult` on success
   */
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

  /**
   * Join a `TaskResult` into this `TaskResult` on failure
   */
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

  /**
   * Execute the computation
   */
  run() {
    return this.taskMaybe();
  }

  /**
   * Execute the computation, throwing the failure case, rather than returning a Result
   */
  async runThrowFailure() {
    const result = await this.run();
    if (result.isFailure()) {
      throw result.value;
    }
    return result.value;
  }

  /**
   * Allows the `TaskResult` to be `await`ed like a `Promise`
   */
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
