import { Failure, Result, Results, Success } from "./Result";

type Task<A> = () => Promise<A>;

type TaskMaybe<S, F> = Task<Results<S, F>>;

export class TaskResult<S = never, F = never>
  implements PromiseLike<Result<S, F>>
{
  constructor(private taskMaybe: TaskMaybe<S, F>) {}

  /**
   * Creates a new instance of a successful `TaskResult` based on the value
   * @param result
   */
  static success<S, F>(result: S) {
    return new TaskResult<S, F>(() =>
      Promise.resolve(Result.success<S, F>(result))
    );
  }

  /**
   * Creates a new instance of a failed `TaskResult` based on the value
   * @param result
   */
  static failure<S, F>(result: F) {
    return new TaskResult<S, F>(() =>
      Promise.resolve(Result.failure<S, F>(result))
    );
  }

  /**
   * Upgrades a `Result` to a `TaskResult`
   */
  static fromResult<S, F>(result: Results<S, F>) {
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
   * A new TaskResult from a nullable value
   */
  static fromNullable<S, F>(
    value: S | undefined | null,
    rejection: F
  ): TaskResult<S, F> {
    return value ? TaskResult.success(value) : TaskResult.failure(rejection);
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
   * Runs the tasks in parallel groups, sequentially
   */
  static foldChunks = <S, F>(
    size: number,
    tasks: TaskResult<S, F>[]
  ): TaskResult<readonly S[], F> => {
    const split = chunksOf(size);
    return split(tasks).reduce(
      (prev, it) =>
        prev.flatMap((r1) => TaskResult.map(it).map((r2) => r1.concat(r2))),
      TaskResult.success<S[], F>([])
    );
  };

  /**
   * Runs the tasks in parallel much like `Promise.all([])`
   * fails if one errors with a single failure, otherwise
   * returns an array of the Success
   */
  static map = <S, F>(tasks: TaskResult<S, F>[]): TaskResult<S[], F> => {
    return TaskResult.fromPromise<Results<S, F>[], F>(
      () => Promise.all(tasks.map((t) => t.run())),
      (e) => {
        throw e;
      }
    ).flatMap((v) => {
      if (v.every((it) => it.isSuccess())) {
        return TaskResult.success<S[], F>(v.map((it) => it.value) as S[]);
      }
      return TaskResult.failure<S[], F>(
        v.find((it) => it.isFailure())!.value as F
      );
    });
  };

  /**
   * Use to transform the success value inside the `TaskResult`
   */
  map<S2 = never>(map: (success: S) => S2): TaskResult<S2, F> {
    return new TaskResult(() =>
      this.taskMaybe().then(
        (maybe): Results<S2, F> =>
          maybe.isSuccess()
            ? new Success(map(maybe.value))
            : new Failure(maybe.value)
      )
    );
  }

  /**
   * Use to transform the failure value inside the `TaskResult`
   */
  mapFailure<F2 = never>(map: (failure: F) => F2): TaskResult<S, F2> {
    return new TaskResult(() =>
      this.taskMaybe().then(
        (maybe): Results<S, F2> =>
          maybe.isFailure()
            ? new Failure(map(maybe.value))
            : new Success(maybe.value)
      )
    );
  }

  /**
   * Use to transform both the success and failure values inside the `TaskResult`
   */
  fold<S2, F2>(
    onSuccess: (success: S) => TaskResult<S2, F2>,
    onFailure: (failure: F) => TaskResult<S2, F2>
  ): TaskResult<S2, F2> {
    return new TaskResult<S2, F2>(() =>
      this.taskMaybe().then((maybe) =>
        maybe.isSuccess()
          ? onSuccess(maybe.value).taskMaybe()
          : onFailure(maybe.value).taskMaybe()
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
      this.taskMaybe().then((inner): Promise<Results<S2, F>> => {
        if (inner.isSuccess()) {
          return param(inner.value).run();
        }
        return Promise.resolve(Result.failure(inner.value));
      })
    );
  }

  /**
   * Join a `TaskResult` into this `TaskResult` on failure
   */
  flatMapFailure<F2>(param: (failure: F) => TaskResult<S, F2>) {
    return new TaskResult<S, F2>(() =>
      this.taskMaybe().then((inner): Promise<Results<S, F2>> => {
        if (inner.isFailure()) {
          return param(inner.value).run();
        }
        return Promise.resolve(Result.success(inner.value));
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

function toResult<S, F>(maybe: Results<S, F>) {
  return maybe.isSuccess()
    ? Result.success<S, F>(maybe.value)
    : Result.failure<S, F>(maybe.value);
}

function chunksOf(size: number) {
  return <T>(inputArray: Array<T>) =>
    inputArray.reduce((resultArray, item, index) => {
      const chunkIndex = Math.floor(index / size);

      if (!resultArray[chunkIndex]) {
        resultArray[chunkIndex] = []; // start a new chunk
      }

      resultArray[chunkIndex].push(item);

      return resultArray;
    }, [] as Array<T[]>);
}
