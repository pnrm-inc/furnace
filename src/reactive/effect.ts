import { createHighPriorityEffectScheduler, createMidPriorityEffectScheduler, EffectScheduler } from './scheduler';
import { getComponentContextToBeConnectedWithHook } from '../component/componentContext';

type EffectDeps = Set<Effect>;
type EffectHandler = (noDep: (process: () => void) => void) => (EffectCleanUp | void);
type EffectCleanUp = (() => void);

function setCurrentEffectContext(effect:Effect | null) {
  Effect.currentHandled = effect;
}

function getCurrentEffectContext():Effect | null {
  return Effect.currentHandled;
}

const reactiveValueMap = new WeakMap<object, Map<string | symbol, EffectDeps>>();

function noopCleanUp() { /* do nothing */ }

const highPriorityScheduler = createHighPriorityEffectScheduler();
const midPriorityScheduler = createMidPriorityEffectScheduler();

function dontCaptureDep(activeEffect: Effect): ((process: () => void) => void) {
  return (process) => {
    setCurrentEffectContext(null);
    const cleanup = process();
    setCurrentEffectContext(activeEffect);

    return cleanup;
  }
}

class Effect {
  /*
   * 現在処理対象になっているエフェクトを保持する
   */
  public static currentHandled: Effect | null = null;

  private _shouldDispatch: boolean;

  public readonly handler: EffectHandler;
  public cleanUp: EffectCleanUp;
  public callerDeps: Set<EffectDeps>
  public scheduler:EffectScheduler | null;

  constructor(effectHandler: EffectHandler) {
    this._shouldDispatch = false;
    this.handler = effectHandler;
    this.cleanUp = noopCleanUp;
    this.callerDeps = new Set<EffectDeps>();
    this.scheduler = null;
  }

  get shouldDispatch() {
    return this._shouldDispatch;
  }

  willDispatch() {
    this._shouldDispatch = true;
  }

  dispatch() {
    if(!this.shouldDispatch) {
      return;
    }

    this.cleanUp = this.handler(dontCaptureDep(this)) || noopCleanUp;

    this._shouldDispatch = false;
  }

  delete () {
    this.callerDeps.forEach((deps) => {
      deps.delete(this);
    });
    this.callerDeps.clear();

    this.cleanUp();
    this.cleanUp = noopCleanUp;

    this._shouldDispatch = false;
  }
}

type EffectOption = {
  priority?: 1 | 2 | 3
}

const EffectPriority = {
  HIGH: 1,
  MIDDLE: 2,
  LOW: 3
} as const

function effect(effectHandler: EffectHandler, effectOption:EffectOption = { priority: EffectPriority.MIDDLE }): void {
  const callerComponent = getComponentContextToBeConnectedWithHook('effect');

  if(!callerComponent) {
    throw new Error('effect must be called in top level of Function Component');
  }

  const activeEffect = new Effect(effectHandler);

  if(!effectOption.priority) {
    effectOption.priority = EffectPriority.MIDDLE;
  }

  switch (effectOption.priority) {
    case EffectPriority.HIGH: {
      highPriorityScheduler.assign(activeEffect);
      break;
    }
    case EffectPriority.MIDDLE: {
      midPriorityScheduler.assign(activeEffect);
      break;
    }
    default: {
      throw new Error('Unknown priority');
    }
  }

  callerComponent.effectUnsubscriptionHandlers.push(() => {
    activeEffect.delete();
  });
}

function capture(target:object, key: string | symbol) {
  const effect = getCurrentEffectContext();

  if(!effect) {
    return;
  }

  const deps = captureEffectDep(effect, target, key);
  captureEffectCaller(effect, deps);
}

function captureEffectDep(effect:Effect, target:object, key: string | symbol): Set<Effect> {
  let depsMap = reactiveValueMap.get(target);

  if(!depsMap) {
    depsMap = new Map();
    reactiveValueMap.set(target, depsMap);
  }

  let deps = depsMap.get(key);

  if(!deps) {
    deps = new Set();
    depsMap.set(key, deps);
  }

  deps.add(effect);

  return deps;
}

function captureEffectCaller(effect:Effect, deps:EffectDeps) {
  effect.callerDeps.add(deps);
}

function dispatch(target:object, key: string | symbol) {
  const depsMap = reactiveValueMap.get(target);

  if(!depsMap) {
    return;
  }

  depsMap.get(key)?.forEach((effect) => {
    if(effect.scheduler) {
      effect.scheduler.assign(effect);
    }
  });
}

export {
  effect,
  setCurrentEffectContext,
  getCurrentEffectContext,
  capture,
  dispatch,
  EffectPriority
};

export type {
  Effect
}
