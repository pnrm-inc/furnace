import { capture, dispatch } from './effect';
import { IReactiveValue } from '../interface/IReactiveValue';


class Value<T> implements IReactiveValue<T> {
  private readonly _rawValue: { value: T };

  get __isValue():boolean {
    return true;
  }

  constructor(value: T) {
    this._rawValue = { value };
  }

  wrap(fn: (value:T) => T): void
  wrap(newValue: T): void
  wrap(value: T | ((value:T) => T)): void {
    if(value instanceof Function) {
      value = value(this._rawValue.value);
    }

    if(this._rawValue.value !== value) {
      this._rawValue.value = value;
      dispatch(this._rawValue, 'value');
    }
  }

  unwrap() {
    capture(this._rawValue, 'value');
    return this._rawValue.value;
  }
}

function val<T = undefined>(): Value<T | undefined>;
function val<T>(rawValue:T): Value<T>;
function val<T>(rawValue?:T):Value<T | undefined> {
  return new Value(rawValue);
}

// どんな型でも受け入れて検査したい
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isVal(value: any) {
  return !!value?.__isValue;
}

export {
  val,
  isVal
}

export type {
  Value
}
