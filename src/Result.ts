import { Failure, ResultValue, Success } from "./ResultValue";

export class Result<S, F> {
  constructor(private readonly value: ResultValue<S, F>) {}

  static success<S2, F2>(success: S2) {
    return new Result<S2, F2>(new Success(success));
  }

  static failure<S2, F2>(failure: F2) {
    return new Result<S2, F2>(new Failure(failure));
  }

  public isSuccess(): this is Result<S, never> {
    return this.value.isSuccess();
  }

  public isFailure(): this is Result<never, F> {
    return !this.value.isSuccess();
  }

  map<S2 = never>(map: (success: S) => S2): Result<S2, F> {
    return this.value.isSuccess()
      ? Result.success(map(this.value.value))
      : Result.failure(this.value.value);
  }

  flatMap<S2 = never>(map: (success: S) => Result<S2, F>): Result<S2, F> {
    return this.value.isSuccess()
      ? map(this.value.value)
      : Result.failure(this.value.value);
  }

  mapFailure<F2 = never>(map: (failure: F) => F2): Result<S, F2> {
    return this.value.isFailure()
      ? Result.failure(map(this.value.value))
      : Result.success(this.value.value);
  }

  fold<Out>(onSuccess: (success: S) => Out, onFailure: (failure: F) => Out) {
    return this.value.isFailure()
      ? onFailure(this.value.value)
      : onSuccess(this.value.value);
  }

  getOrElse<Out>(onFailure: (failure: F) => Out) {
    return this.value.isFailure()
      ? onFailure(this.value.value)
      : this.value.value;
  }

  get() {
    return this.value.value;
  }
}
