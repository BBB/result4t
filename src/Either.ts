abstract class Side {
  isLeft() {
    return false;
  }
  isRight() {
    return false;
  }
}

class Left<T> extends Side {
  constructor(public readonly value: T) {
    super();
  }

  isLeft(): this is Left<T> {
    return true;
  }
}

class Right<T> extends Side {
  constructor(public readonly value: T) {
    super();
  }

  isRight(): this is Right<T> {
    return true;
  }
}

export class Either<L, R> {
  constructor(private readonly inner: Left<L> | Right<R>) {}

  static right<NewL, NewR>(r: NewR) {
    return new Either<NewL, NewR>(new Right(r));
  }

  static left<NewL, NewR>(l: NewL) {
    return new Either<NewL, NewR>(new Left(l));
  }

  map<R2 = never>(param: (a: R) => R2): Either<L, R2> {
    return this.inner.isRight()
      ? Either.right(param(this.inner.value))
      : Either.left(this.inner.value);
  }

  mapLeft<L2 = never>(param: (a: L) => L2): Either<L2, R> {
    return this.inner.isLeft()
      ? Either.left(param(this.inner.value))
      : Either.right(this.inner.value);
  }

  fold<Out>(onLeft: (a: L) => Out, onRight: (a: R) => Out) {
    return this.inner.isLeft()
      ? onLeft(this.inner.value)
      : onRight(this.inner.value);
  }

  getOrElse<Out>(onLeft: (a: L) => Out) {
    return this.inner.isLeft() ? onLeft(this.inner.value) : this.inner.value;
  }

  flatten() {
    return this.inner.value;
  }
}
