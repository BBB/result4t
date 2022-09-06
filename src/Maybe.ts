abstract class MaybeValue {
  isFailure() {
    return false;
  }

  isSuccess() {
    return false;
  }
}

export type Maybe<F, S> = Failure<F> | Success<S>;

export class Failure<T> extends MaybeValue {
  constructor(public readonly value: T) {
    super();
  }

  isFailure(): this is Failure<T> {
    return true;
  }
}

export class Success<T> extends MaybeValue {
  constructor(public readonly value: T) {
    super();
  }

  isSuccess(): this is Success<T> {
    return true;
  }
}
