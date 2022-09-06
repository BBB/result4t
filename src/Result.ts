abstract class Maybe {
  isFailure() {
    return false;
  }
  isSuccess() {
    return false;
  }
}

class Failure<T> extends Maybe {
  constructor(public readonly value: T) {
    super();
  }

  isFailure(): this is Failure<T> {
    return true;
  }
}

class Success<T> extends Maybe {
  constructor(public readonly value: T) {
    super();
  }

  isSuccess(): this is Success<T> {
    return true;
  }
}

export class Result<F, S> {
  constructor(private readonly inner: Failure<F> | Success<S>) {}

  static success<F2, S2>(r: S2) {
    return new Result<F2, S2>(new Success(r));
  }

  static failure<F2, S2>(l: F2) {
    return new Result<F2, S2>(new Failure(l));
  }

  map<S2 = never>(param: (a: S) => S2): Result<F, S2> {
    return this.inner.isSuccess()
      ? Result.success(param(this.inner.value))
      : Result.failure(this.inner.value);
  }

  flatMap<S2 = never>(param: (a: S) => Result<F, S2>): Result<F, S2> {
    return this.inner.isSuccess()
      ? param(this.inner.value)
      : Result.failure(this.inner.value);
  }

  mapFailure<F2 = never>(param: (a: F) => F2): Result<F2, S> {
    return this.inner.isFailure()
      ? Result.failure(param(this.inner.value))
      : Result.success(this.inner.value);
  }

  fold<Out>(onFailure: (a: F) => Out, onSuccess: (a: S) => Out) {
    return this.inner.isFailure()
      ? onFailure(this.inner.value)
      : onSuccess(this.inner.value);
  }

  getOrElse<Out>(onFailure: (a: F) => Out) {
    return this.inner.isFailure()
      ? onFailure(this.inner.value)
      : this.inner.value;
  }

  get() {
    return this.inner.value;
  }
}
