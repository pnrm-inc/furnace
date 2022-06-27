import {FunctionalComponent} from './component/functionalComponent';
import {Context} from './createContext';


function composeWithContext<Props, ContextProps = Record<string, unknown>>(functionalComponent:FunctionalComponent<Props>, context:Context<ContextProps>) {
  const wrappedFunctionalComponent:FunctionalComponent<Props> = (props:Props) => {
    context.provide();
    functionalComponent(props);
  };

  wrappedFunctionalComponent.tag = functionalComponent.tag;
  wrappedFunctionalComponent.defaultProps = functionalComponent.defaultProps;

  return wrappedFunctionalComponent;
}

function withContext<Props, ContextProps extends object>(functionalComponent:FunctionalComponent<Props>, context:Context<ContextProps>) {
  return composeWithContext(functionalComponent, context);
}

export { withContext };
