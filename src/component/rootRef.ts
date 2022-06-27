import { RefElement } from './domRefs';
import { val } from '../reactive';
import {getComponentContextToBeConnectedWithHook} from './componentContext';

function rootRef<T extends RefElement = RefElement>() {
  const context = getComponentContextToBeConnectedWithHook('useEl');
  const ref = val<T | null>(null);

  context.onConnected.push((props) => {
    ref.wrap(props.el as T);
  });

  return ref;
}

export { rootRef };
