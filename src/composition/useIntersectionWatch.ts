import { effect } from '../reactive';

type IntersectionWatchCallback =  (entry: IntersectionObserverEntry, observer: IntersectionObserver) => void;
type IntersectionWatchOptions =  IntersectionObserverInit & { observer?: IntersectionObserver};

function createIntersectionObserver(callback: IntersectionWatchCallback, options?: IntersectionWatchOptions) {
  return new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      callback(entry, observer);
    })
  }, options);
}

function useIntersectionWatch(refGet: () => (Element | Element[] | null), callback: IntersectionWatchCallback, options?: IntersectionWatchOptions) {

  const observer = options?.observer || createIntersectionObserver(callback, options);

  const observe = (targetOrTargets:Element | Element[]) => {
    if(Array.isArray(targetOrTargets)) {
      targetOrTargets.forEach((target) => {
        observe(target);
      });

      return;
    }

    observer.observe(targetOrTargets);
  }

  effect(() => {
    const targetOrTargets = refGet();

    if(targetOrTargets) {
      observe(targetOrTargets);
    }

    return () => {
      observer.disconnect();
    }
  });
}

export {
  useIntersectionWatch
}
