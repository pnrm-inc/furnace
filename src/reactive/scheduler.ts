import {Effect, setCurrentEffectContext} from './effect';


abstract class EffectScheduler {
  protected $dispatcher:EffectQueueDispatcher;

  protected constructor(dispatcher: EffectQueueDispatcher) {
    this.$dispatcher = dispatcher;
  }

  scheduleDispatch() {
    throw new Error('scheduleDispatch method must be implemented');
  }

  assign(effect: Effect) {
    this.$dispatcher.assign(effect);
    effect.scheduler = this;
    this.scheduleDispatch();
  }
}

class HighPriorityEffectScheduler extends EffectScheduler {
  constructor(dispatcher:EffectQueueDispatcher) {
    super(dispatcher);
  }

  scheduleDispatch() {
    this.$dispatcher.dispatch();
  }
}

class MidPriorityEffectScheduler extends EffectScheduler {
  private _raf:number | null;

  constructor(dispatcher: EffectQueueDispatcher) {
    super(dispatcher);
    this._raf = null;
  }

  public scheduleDispatch() {
    if(this._raf) {
      return;
    }

    this._raf = requestAnimationFrame(() => {
      this.$dispatcher.dispatch();
      this._raf = null;

      if(this.$dispatcher.remains) {
        this.scheduleDispatch();
      }
    });
  }
}

// class LowPriorityEffectScheduler extends EffectScheduler {
//   constructor(dispatcher: EffectQueueDispatcher) {
//     super(dispatcher);
//   }
// }

class EffectQueueDispatcher {
  private _effectQueue: Effect[] = [];

  get remains():boolean {
    return !!this._effectQueue.length;
  }

  assign(effect:Effect):void {
    effect.willDispatch();
    this._effectQueue.push(effect);
  }

  dispatch():void {
    this._effectQueue.slice().forEach((effect) => {
      if(effect.shouldDispatch) {
        effect.cleanUp();

        setCurrentEffectContext(effect);
        effect.dispatch();
        setCurrentEffectContext(null);
      }
    });

    this._effectQueue = this._effectQueue.filter((effect) => {
      return effect.shouldDispatch;
    });
  }
}

function createMidPriorityEffectScheduler():EffectScheduler {
  const dispatcher = new EffectQueueDispatcher();
  return new MidPriorityEffectScheduler(dispatcher);
}

function createHighPriorityEffectScheduler():EffectScheduler {
  const dispatcher = new EffectQueueDispatcher();
  return new HighPriorityEffectScheduler(dispatcher);
}

export {
  createHighPriorityEffectScheduler,
  createMidPriorityEffectScheduler
}

export type {
  EffectScheduler
}
