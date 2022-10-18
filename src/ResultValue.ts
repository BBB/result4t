abstract class ResultValueBase {
  isFailure() {
    return false;
  }

  isSuccess() {
    return false;
  }
}

export type ResultValue<S, F> = Success<S> | Failure<F>;

export class Failure<T> extends ResultValueBase {
  constructor(public readonly value: T) {
    super();
  }

  isFailure(): this is Failure<T> {
    return true;
  }
}

export class Success<T> extends ResultValueBase {
  constructor(public readonly value: T) {
    super();
  }

  isSuccess(): this is Success<T> {
    return true;
  }
}
