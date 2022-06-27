import {OnConnectedHandler, OnDestroyedHandler, OnDisconnectedHandler} from './lifecycle';
import {throwIfHookUsedIllegally} from '../errors/IllegalHookUseError';
import {RefElement} from './domRefs';

function getComponentContextToBeConnectedWithHook(hookName: string):ComponentContext {
  const context = ComponentContext.currentHandled;

  if(!context) {
    throwIfHookUsedIllegally(hookName);
  }

  return context;
}

function getCurrentComponentContext(): ComponentContext | null {
  return ComponentContext.currentHandled;
}

function setCurrentComponentContext(context: ComponentContext | null) {
  ComponentContext.currentHandled = context;
}


const ContextState = {
  NEW: 0,
  INITIALIZE: 1,
  CONNECTING: 2,
  READY: 3,
  DISCONNECTING: 4,
  DESTROYED: 5
} as const;

class ComponentContext {
  /*
   * 現在処理対象になっているコンポーネントを保持する
   */
  public static currentHandled:ComponentContext | null = null;

  /*
   * コンポーネントがDOMと接続された時に実行される関数
   */
  public onConnected: OnConnectedHandler[];

  /*
   * コンポーネントがDOMから切り離された時に実行される関数
   */
  public onDisconnected: OnDisconnectedHandler[];

  /*
   * コンポーネントが破棄された時に実行される関数
   */
  public onDestroyed: OnDestroyedHandler[];

  /*
   * 親コンポーネントへの参照
   */
  public parent:ComponentContext | null;

  /*
   * 子供コンポーネントへの参照
   */
  public children: ComponentContext[];

  /*
   * コンポーネントのルート要素への参照
   */
  public element:RefElement | Document | null;

  /*
   * コンポーネントの識別名
   */
  public tag: string | null;

  /*
   * コンポーネントがどの状態にあるか
   */
  public contextState: number;

  /*
   * 所持している Context の識別子
   */
  public contextIds:symbol[];

  public effectUnsubscriptionHandlers: (()=>void)[]

  constructor() {
    this.element = null;
    this.tag = null;

    this.onConnected = [];
    this.onDisconnected = [];
    this.onDestroyed = [];
    this.parent = null;
    this.children = [];
    this.contextState = ContextState.NEW;

    this.contextIds = [];

    this.effectUnsubscriptionHandlers = [];
  }

  addChild(child:ComponentContext) {
    this.children.push(child);
    child.parent = this;
  }

  removeChild(child:ComponentContext) {
    const index = this.children.indexOf(child);

    if(index === -1) {
      return;
    }

    this.children.splice(index, 1);
    child.parent = null;
  }
}

function createComponentContext():ComponentContext {
  return new ComponentContext();
}

export { createComponentContext, ContextState, getComponentContextToBeConnectedWithHook, getCurrentComponentContext, setCurrentComponentContext }
export type { ComponentContext }
