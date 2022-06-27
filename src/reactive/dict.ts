import { IReactiveValue } from '../interface/IReactiveValue';
import { capture, dispatch } from './effect';

function makeProxy<T extends object>(rawValue: T) {
  const proxied = { ...rawValue };

  return new Proxy<T>(proxied, {
    get(target, key, receiver) {
      const value = Reflect.get(target, key, receiver);
      capture(target, key);
      return value;
    },

    set(target, key, value, receiver) {
      const currentValue = target[key];
      const result = Reflect.set(target, key, value, receiver);

      if(result && currentValue !== value) {
        rawValue[key] = value;
        dispatch(target, key);
      }

      return result;
    }
  });
}

// どんな型でも受け入れて検査したい
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDict(value: any): boolean {
  return !!value?.__isDict;
}

class Dict<T extends object> implements IReactiveValue<T> {
  private readonly _proxiedValue: T;
  private readonly _rawValue: T;

  get __isDict():boolean {
    return true
  }

  constructor(value: T) {
    this._rawValue = { ...value };
    this._proxiedValue = makeProxy(this._rawValue);
  }

  wrap(fn: (value:T) => T): void
  wrap(newValue: T): void
  wrap(newValue: T | ((value:T) => T)): void {
    if(newValue instanceof Function) {
      this.wrap(newValue(this._rawValue));
      return;
    }

    Object.assign(this._rawValue, newValue);
    Object.assign(this._proxiedValue, this._rawValue);
  }

  unwrap(): T {
    return this._proxiedValue;
  }
}

function dict<T extends object>(value: T) {
  return new Dict(value);
}

export {
  dict,
  isDict
}

export type {
  Dict
}

