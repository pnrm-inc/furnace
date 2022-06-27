import {
  ComponentContext,
  ContextState, createComponentContext,
  getComponentContextToBeConnectedWithHook,
  getCurrentComponentContext, setCurrentComponentContext
} from './componentContext';
import { RefElement } from './domRefs';
import {ComponentProps, FunctionalComponent} from './functionalComponent';

export type OnConnectedProps = {
  el: RefElement
};
export type OnConnectedHandler = (props: OnConnectedProps) => void;
export type OnDisconnectedHandler = () => void;
export type OnDestroyedHandler = () => void;

export function onConnected(handleOnConnected:OnConnectedHandler):void {
  const context = getComponentContextToBeConnectedWithHook('onConnected');
  context.onConnected.push(handleOnConnected);
}

export function onDisconnected(handleOnDisconnected:OnDisconnectedHandler):void {
  const context = getComponentContextToBeConnectedWithHook('onDisconnected');
  context.onDisconnected.push(handleOnDisconnected);
}

export function onDestroyed(handleOnDestroyed:OnDestroyedHandler):void {
  const context = getComponentContextToBeConnectedWithHook('onDestroyed');
  context.onDestroyed.push(handleOnDestroyed);
}

export function createComponent<Props>(component: FunctionalComponent<Props>, props:ComponentProps<Props>) {
  return initializeFunctionalComponent(component, props);
}

function initializeFunctionalComponent<Props>(component: FunctionalComponent<Props>, props:ComponentProps<Props>): ComponentContext {
  const parent = getCurrentComponentContext();
  const context = createComponentContext();

  context.contextState = ContextState.INITIALIZE;

  setCurrentComponentContext(context);

  parent?.addChild(context);

  component(props);

  setCurrentComponentContext(parent);

  return context;
}

export function connectComponent(context:ComponentContext, onConnectedProps:OnConnectedProps): void {
  context.contextState = ContextState.CONNECTING;
  context.onConnected.forEach(handler => handler(onConnectedProps));
}

export function readyComponent(context: ComponentContext) {
  context.contextState = ContextState.READY;
}

export function disconnectComponent(context:ComponentContext): void {
  context.contextState = ContextState.DISCONNECTING;
  context.onDisconnected.forEach(handler => handler());
}

export function destroyComponent(context: ComponentContext) {
  context.parent?.removeChild(context);
  context.effectUnsubscriptionHandlers.forEach(handler => handler());
  context.contextState = ContextState.DESTROYED;
}
