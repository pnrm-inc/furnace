import { effect } from '../reactive';

type WatchCleanup = (() => void) | void;

function useWatch<T>(reactiveGet: () => T, handler: (value:T, prevValue?:T) => WatchCleanup):void {
  let prevValue:T;

  effect((noDep) => {
    const currentValue = reactiveGet();

    if(prevValue === currentValue) {
      return;
    }

    return noDep(() => {
      const cleanup = handler(currentValue, prevValue);
      prevValue = currentValue;

      return cleanup;
    });
  });
}

export {
  useWatch
}
