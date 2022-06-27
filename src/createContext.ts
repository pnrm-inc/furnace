import {ComponentContext, getComponentContextToBeConnectedWithHook} from './component/componentContext';

type Context<T> = Readonly<{
  provide: () => void,
  use: () => T
}>

function createContext<T extends Record<string, unknown> = Record<string, unknown>>(functionReturnsContextValue: () => T): Context<T> {
  const contextSymbol = Symbol();
  let contextValue:T;

  const provide = () => {
    const componentContext = getComponentContextToBeConnectedWithHook('createContext.provide');
    contextValue = functionReturnsContextValue();
    componentContext.contextIds.push(contextSymbol);
  };

  const use = () => {
    let targetContext:ComponentContext | null = getComponentContextToBeConnectedWithHook('createContext.use');

    while(targetContext) {
      if(targetContext.contextIds.includes(contextSymbol)) {
        return contextValue;
      }

      targetContext = targetContext.parent;
    }

    throw new Error('context not found');
  }

  return Object.freeze({
    provide,
    use
  });
}

export {
  createContext,
  Context
}
