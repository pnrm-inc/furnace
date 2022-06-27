import {ComponentProps, connectWithDOM, disconnectFromDOM, FunctionalComponent} from './functionalComponent';
import {
  ComponentContext,
  ContextState,
  getComponentContextToBeConnectedWithHook,
  getCurrentComponentContext,
  setCurrentComponentContext
} from './componentContext';

type AddChildOptions = {
  tag?: string,
}

const addChildDefaultOptions:AddChildOptions = {}

function internallyAddChild<Props>(context:ComponentContext, functionalComponent: FunctionalComponent<Props>, props?:ComponentProps<Props>, addChildOptions?: AddChildOptions) {
  const options = Object.assign({}, addChildDefaultOptions, addChildOptions || {});
  const tag = options.tag ?? (functionalComponent.tag || functionalComponent.name);

  if(context.contextState < ContextState.READY) {
    context.onConnected.push(({el}) => {
      const prevContext = getCurrentComponentContext();
      setCurrentComponentContext(context);
      connectWithDOM(tag, functionalComponent, props, el);
      setCurrentComponentContext(prevContext);
    });
  } else if(context.contextState < ContextState.DISCONNECTING) {
    const prevContext = getCurrentComponentContext();
    setCurrentComponentContext(context);
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    connectWithDOM(tag, functionalComponent, props, context.element!);
    setCurrentComponentContext(prevContext);
  } else {
    throw new Error('Component is disconnecting or already disconnected');
  }

  context.onDisconnected.push(() => {
    internallyRemoveChild(tag, context);
  });
}

function internallyRemoveChild(tag:string, from:ComponentContext) {
  from.children
    .filter(context => context.tag === tag)
    .forEach(context => disconnectFromDOM(context));
}

function childHandle() {
  const context = getComponentContextToBeConnectedWithHook('childHandle');

  return {
    addChild: <Props>(functionalComponent: FunctionalComponent<Props>, props?:ComponentProps<Props>, options?: AddChildOptions) => {
      internallyAddChild(context, functionalComponent, props, options);
    },
    removeChild: (tag: string) => {
      internallyRemoveChild(tag, context);
    }
  }
}

export { childHandle };
