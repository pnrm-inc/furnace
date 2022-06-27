
interface IReactiveValue<T = unknown> {
  wrap(fn: (value:T) => T): void
  wrap(newValue: T): void;
  unwrap(): T;
}

export type {
  IReactiveValue
}
