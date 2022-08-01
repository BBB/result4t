abstract class Side {
  isLeft() {
    return false;
  }
  isRight() {
    return false;
  }
}

class Failure<T> extends Side {
  constructor(public readonly value: T) {
    super();
  }

  isLeft(): this is Failure<T> {
    return true;
  }
}

class Success<T> extends Side {
  constructor(public readonly value: T) {
    super();
  }

  isRight(): this is Success<T> {
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

  map<R2 = never>(param: (a: S) => R2): Result<F, R2> {
    return this.inner.isRight()
      ? Result.success(param(this.inner.value))
      : Result.failure(this.inner.value);
  }

  mapLeft<L2 = never>(param: (a: F) => L2): Result<L2, S> {
    return this.inner.isLeft()
      ? Result.failure(param(this.inner.value))
      : Result.success(this.inner.value);
  }

  fold<Out>(onLeft: (a: F) => Out, onRight: (a: S) => Out) {
    return this.inner.isLeft()
      ? onLeft(this.inner.value)
      : onRight(this.inner.value);
  }

  getOrElse<Out>(onLeft: (a: F) => Out) {
    return this.inner.isLeft() ? onLeft(this.inner.value) : this.inner.value;
  }

  flatten() {
    return this.inner.value;
  }
}
