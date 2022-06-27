import {effect, val} from '../reactive';

function useTick(handler: () => void, props = { autoStart: false}) {
  let rafId = 0;
  const runsTick = val(props.autoStart);

  const start = () => {
    runsTick.wrap(true);
  };
  const stop = () => {
    runsTick.wrap(false);
  };

  const tick = () => {
    rafId = requestAnimationFrame(tick);
    handler();
  }

  effect((noDep) => {
    if(!runsTick.unwrap()) {
      return;
    }

    tick();

    return () => cancelAnimationFrame(rafId);
  });

  return {
    start,
    stop
  }
}

export {
  useTick
}
