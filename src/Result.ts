import { Failure, ResultValue, Success } from "./ResultValue";

export class Result<S, F> {
  constructor(private readonly maybe: ResultValue<S, F>) {}

  static success<S2, F2>(success: S2) {
    return new Result<S2, F2>(new Success(success));
  }

  static failure<S2, F2>(failure: F2) {
    return new Result<S2, F2>(new Failure(failure));
  }

  public isSuccess() {
    return this.maybe.isSuccess();
  }

  public isFailure() {
    return !this.maybe.isSuccess();
  }

  map<S2 = never>(map: (success: S) => S2): Result<S2, F> {
    return this.maybe.isSuccess()
      ? Result.success(map(this.maybe.value))
      : Result.failure(this.maybe.value);
  }

  flatMap<S2 = never>(map: (success: S) => Result<S2, F>): Result<S2, F> {
    return this.maybe.isSuccess()
      ? map(this.maybe.value)
      : Result.failure(this.maybe.value);
  }

  mapFailure<F2 = never>(map: (failure: F) => F2): Result<S, F2> {
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
