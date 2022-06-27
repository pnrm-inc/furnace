import { domRefs, Refs } from '../component/domRefs';
import { dict, effect } from '../reactive';

function useDomRef<T>(refObject:Refs<T>) {
  const refs = domRefs(refObject);
  const reactiveRefs = dict<Refs<T>>(refs.get());

  const validate = () => {
    refs.validate((newRefs:Refs<T>) => {
      reactiveRefs.wrap(newRefs);
    });
  };

  effect(() => {
    validate();
  });

  return { refs: reactiveRefs, validate };
}

export { useDomRef };
