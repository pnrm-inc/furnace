import {effect, val} from '../reactive';

function useComputed<T>(computedFunction: () => T) {
  const value = val(computedFunction());

  effect(() => {
    value.wrap(computedFunction());
  });

  return value;
}

export {
  useComputed
}
