abstract class Maybe {
  isFailure() {
    return false;
  }

  isSuccess() {
    return false;
  }
}

export class Failure<T> extends Maybe {
  constructor(public readonly value: T) {
    super();
  }

  isFailure(): this is Failure<T> {
    return true;
  }
}

export class Success<T> extends Maybe {
  constructor(public readonly value: T) {
    super();
  }

  isSuccess(): this is Success<T> {
    return true;
  }
}
