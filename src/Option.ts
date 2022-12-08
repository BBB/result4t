abstract class OptionValueBase {
  isNone() {
    return false;
  }
  isSome() {
    return false;
  }
}
export class None extends OptionValueBase {
  isNone(): this is None {
    return true;
  }
  orElse<V>(value: V) {
    return value;
  }
}

export class Some<T> extends OptionValueBase {
  constructor(public value: T) {
    super();
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
