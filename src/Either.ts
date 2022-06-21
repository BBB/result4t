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
  constructor(private readonly value: Left<L> | Right<R>) {}

  static right<NewL, NewR>(r: NewR) {
    return new Either<NewL, NewR>(new Right(r));
  }

  static left<NewL, NewR>(l: NewL) {
    return new Either<NewL, NewR>(new Left(l));
  }

  map<R2 = never>(param: (a: R) => R2): Either<L, R2> {
    return this.value.isRight()
      ? Either.right(param(this.value.value))
      : Either.left(this.value.value);
  }

  mapLeft<L2 = never>(param: (a: L) => L2): Either<L2, R> {
    return this.value.isLeft()
      ? Either.left(param(this.value.value))
      : Either.right(this.value.value);
  }

  fold<Out>(onLeft: (a: L) => Out, onRight: (a: R) => Out) {
    return this.value.isLeft()
      ? onLeft(this.value.value)
      : onRight(this.value.value);
  }
}
