interface Side {
  isLeft(): boolean;
  isRight(): boolean;
}

class Left<T> implements Side {
  constructor(public readonly value: T) {}

  isLeft(): this is Left<T> {
    return true;
  }

  isRight() {
    return false;
  }
}

class Right<T> implements Side {
  constructor(public readonly value: T) {}

  isLeft() {
    return false;
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
    return this.value.isRight()
      ? Either.right(this.value.value)
      : Either.left(param(this.value.value));
  }

  fold<Out>(onLeft: (a: L) => Out, onRight: (a: R) => Out) {
    return this.value.isRight()
      ? onRight(this.value.value)
      : onLeft(this.value.value);
  }
}
