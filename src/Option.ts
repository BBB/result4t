export class None {
  isNone(): this is None {
    return true;
  }
  isSome() {
    return false;
  }

  orElse<V>(value: V) {
    return value;
  }
}

class Some<T> {
  constructor(public value: T) {}
  isNone() {
    return false;
  }
  isSome(): this is Some<T> {
    return true;
  }
  orElse<V>(_: V) {
    return this.value;
  }
}

export type Option<T> = Some<T> | None;
export const optional = <T>(value: T | null | undefined): Option<T> =>
  typeof value === "undefined" || value == null ? new None() : new Some(value);
