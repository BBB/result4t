export type Result<S, F> = Success<S> | Failure<F>;

export class Success<S> {
  constructor(private readonly value: S) {}
  isSuccess(): this is Success<S> {
    return true;
  }
  isFailure(): this is Failure<any> {
    return false;
  }

  map<SIn, S2 = never>(map: (success: S) => S2): Result<S2, any> {
    return Result.success(map(this.get()));
  }

  flatMap<F, S2 = never>(map: (success: S) => Result<S2, any>): Result<S2, F> {
    return map(this.get());
  }

  get(): S {
    return this.value;
  }
  mapFailure<F, F2 = never>(map: (failure: F) => F2): Result<S, F2> {
    return this;
  }

  fold<F, Out>(onSuccess: (success: S) => Out, onFailure: (failure: F) => Out) {
    return onSuccess(this.get());
  }

  getOrElse<F, Out>(onFailure: (failure: F) => Out) {
    return this.get();
  }
}
export class Failure<F> {
  constructor(public value: F) {}
  isSuccess(): this is Success<any> {
    return false;
  }
  isFailure(): this is Failure<F> {
    return true;
  }

  get(): F {
    return this.value;
  }

  map<S, S2 = never>(map: (success: S) => S2): Result<S2, F> {
    return this;
  }

  flatMap<FIn, S2 = never>(
    map: (success: any) => Result<S2, F>
  ): Result<S2, F> {
    return this;
  }

  mapFailure<S, F2 = never>(map: (failure: F) => F2): Result<S, F2> {
    return Result.failure(map(this.value));
  }
  fold<S, Out>(onSuccess: (success: S) => Out, onFailure: (failure: F) => Out) {
    return onFailure(this.get());
  }

  getOrElse<FIn, Out>(onFailure: (failure: F) => Out) {
    return onFailure(this.value);
  }
}

export const Result = {
  success<S, F>(s: S): Result<S, F> {
    return new Success(s);
  },
  failure<S, F>(f: F): Result<S, F> {
    return new Failure(f);
  },
};
