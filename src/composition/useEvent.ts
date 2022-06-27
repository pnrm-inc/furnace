import {effect, val} from '../reactive';

function addEventListener<T extends EventTarget>(targetOrTargets:T | T[], eventType: string, listener:EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean):void {
  if(Array.isArray(targetOrTargets)) {
    targetOrTargets.forEach((target) => {
      addEventListener(target, eventType, listener, options);
    });

    return;
  }

  targetOrTargets.addEventListener(eventType, listener, options);
}

function removeEventListener<T extends EventTarget>(targetOrTargets:T | T[], eventType: string, listener:EventListenerOrEventListenerObject, options?: AddEventListenerOptions | boolean):void {
  if(Array.isArray(targetOrTargets)) {
    targetOrTargets.forEach((target) => {
      removeEventListener(target, eventType, listener, options);
    });

    return;
  }

  targetOrTargets.removeEventListener(eventType, listener, options);
}

type EventHandle = {
  suspend: () => void,
  resume: () => void
};

type EventListener<T extends EventTarget> = (evt:Event, target:T) => void;

function useEvent<T extends EventTarget>(refGet: () => (T | T[] | null), eventType:string, listener:EventListener<T>, options?: AddEventListenerOptions | boolean): EventHandle {

  const shouldDispatch = val(true);

  const suspend = () => { shouldDispatch.wrap(false); };
  const resume = () => { shouldDispatch.wrap(true); };

  effect(() => {
    const element = refGet();
    const dispatches = shouldDispatch.unwrap();

    if(!element || !dispatches) {
      return;
    }

    const wrapListener = (evt:Event) => {
      listener(evt, evt.currentTarget as T);
    };

    addEventListener(element, eventType, wrapListener, options);

    return () => {
      removeEventListener(element, eventType, wrapListener, options);
    }
  });

  return { suspend, resume };
}

export {
  useEvent,
  EventListener
}
