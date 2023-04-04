export class Failure<S, F> {
  constructor(public readonly value: F) {}
  isSuccess() {
    return false;
  }

  isFailure(): this is Failure<S, F> {
    return true;
  }
  map<S2 = never>(map: (success: S) => S2): Failure<S, F> {
    return this;
  }
  flatMap<S2 = never>(map: (success: S) => Result<S2, F>): Failure<S, F> {
    return this;
  }
  mapFailure<F2 = never>(map: (failure: F) => F2): Failure<S, F2> {
    return new Failure<S, F2>(map(this.value));
  }
  flatMapFailure<F2 = never>(
    map: (failure: F) => Failure<S, F2>
  ): Failure<S, F2> {
    return map(this.value);
  }
  fold<Out>(onSuccess: (success: S) => Out, onFailure: (failure: F) => Out) {
    return onFailure(this.value);
  }
  getOrElse<Out>(onFailure: (failure: F) => Out) {
    return onFailure(this.value);
  }

  get() {
    return this.value;
  }
}

export class Success<S, F> {
  constructor(public readonly value: S) {}

  isFailure() {
    return false;
  }

  isSuccess(): this is Success<S, F> {
    return true;
  }

  map<S2 = never>(map: (success: S) => S2) {
    return new Success<S2, F>(map(this.value));
  }
  flatMap<S2 = never>(map: (success: S) => Result<S2, F>) {
    return map(this.value);
  }
  mapFailure<F2 = never>(map: (failure: F) => F2) {
    return this;
  }
  flatMapFailure<F2 = never>(map: (failure: F) => Result<F, F2>) {
    return this;
  }
  fold<Out>(onSuccess: (success: S) => Out, onFailure: (failure: F) => Out) {
    return onSuccess(this.value);
  }
  getOrElse<Out>(onFailure: (failure: F) => Out) {
    return this.value;
  }

  get() {
    return this.value;
  }
}

export class Result<S, F> {
  static success<S2, F2>(success: S2) {
    return new Success<S2, F2>(success);
  }

  static failure<S2, F2>(failure: F2) {
    return new Failure<S2, F2>(failure);
  }
}
export type Results<S, F> = Success<S, F> | Failure<S, F>;
