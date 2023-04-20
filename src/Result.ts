interface ResultBase<S, F> {
  isSuccess(): boolean;

  isFailure(): boolean;

  map<S2 = never>(map: (success: S) => S2): Result<S2, any>;

  flatMap<S2 = never>(map: (success: S) => Result<S2, any>): Result<S2, F>;

  get(): S | F;

  mapFailure<F2 = never>(map: (failure: F) => F2): Result<S, F2>;

  flatMapFailure<F2 = never>(map: (failure: F) => Result<S, F2>): Result<S, F2>;

  fold<Out>(
    onSuccess: (success: S) => Out,
    onFailure: (failure: F) => Out
  ): Out;

  getOrElse<Out>(onFailure: (failure: F) => Out): S | Out;
}

export type Result<S, F> = Success<S, F> | Failure<S, F>;

export class Success<S, F> implements ResultBase<S, F> {
  constructor(private readonly value: S) {}
  isSuccess(): this is Success<S, F> {
    return true;
  }
  isFailure(): this is Failure<S, F> {
    return false;
  }

  map<S2 = never>(map: (success: S) => S2): Result<S2, F> {
    return Result.success(map(this.get()));
  }

  flatMap<S2 = never>(map: (success: S) => Result<S2, F>): Result<S2, F> {
    return map(this.get());
  }

  get(): S {
    return this.value;
  }
  mapFailure<F2 = never>(map: (failure: F) => F2): Result<S, F2> {
    return new Success<S, F2>(this.value);
  }

  flatMapFailure<F2 = never>(
    map: (failure: F) => Result<S, F2>
  ): Result<S, F2> {
    return new Success<S, F2>(this.value);
  }

  fold<Out>(
    onSuccess: (success: S) => Out,
    onFailure: (failure: F) => Out
  ): Out {
    return onSuccess(this.get());
  }

  getOrElse<Out>(onFailure: (failure: F) => Out): S {
    return this.get();
  }
}

export class Failure<S, F> {
  constructor(public value: F) {}
  isSuccess(): this is Success<S, F> {
    return false;
  }
  isFailure(): this is Failure<S, F> {
    return true;
  }

  get(): F {
    return this.value;
  }

  map<S2 = never>(map: (success: S) => S2): Result<S2, F> {
    return new Failure<S2, F>(this.value);
  }

  flatMap<S2 = never>(map: (success: any) => Result<S2, F>): Result<S2, F> {
    return new Failure<S2, F>(this.value);
  }

  mapFailure<F2 = never>(map: (failure: F) => F2): Result<S, F2> {
    return Result.failure(map(this.value));
  }

  flatMapFailure<F2 = never>(
    map: (failure: F) => Result<S, F2>
  ): Result<S, F2> {
    return map(this.get());
  }

  fold<Out>(onSuccess: (success: S) => Out, onFailure: (failure: F) => Out) {
    return onFailure(this.get());
  }

  getOrElse<Out>(onFailure: (failure: F) => Out) {
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
