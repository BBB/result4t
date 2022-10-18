import { Failure, ResultValue, Success } from "./ResultValue";

export class Result<F, S> {
  constructor(private readonly maybe: ResultValue<F, S>) {}

  static success<F2, S2>(success: S2) {
    return new Result<F2, S2>(new Success(success));
  }

  static failure<F2, S2>(failure: F2) {
    return new Result<F2, S2>(new Failure(failure));
  }

  map<S2 = never>(map: (success: S) => S2): Result<F, S2> {
    return this.maybe.isSuccess()
      ? Result.success(map(this.maybe.value))
      : Result.failure(this.maybe.value);
  }

  flatMap<S2 = never>(map: (success: S) => Result<F, S2>): Result<F, S2> {
    return this.maybe.isSuccess()
      ? map(this.maybe.value)
      : Result.failure(this.maybe.value);
  }

  mapFailure<F2 = never>(map: (failure: F) => F2): Result<F2, S> {
    return this.maybe.isFailure()
      ? Result.failure(map(this.maybe.value))
      : Result.success(this.maybe.value);
  }

  fold<Out>(onFailure: (failure: F) => Out, onSuccess: (success: S) => Out) {
    return this.maybe.isFailure()
      ? onFailure(this.maybe.value)
      : onSuccess(this.maybe.value);
  }

  getOrElse<Out>(onFailure: (failure: F) => Out) {
    return this.maybe.isFailure()
      ? onFailure(this.maybe.value)
      : this.maybe.value;
  }

  get() {
    return this.maybe.value;
  }
}
