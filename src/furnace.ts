import {ComponentContext} from './component/componentContext';
import {RefElement} from './component/domRefs';
import {ComponentProps, FunctionalComponent} from './component/functionalComponent';
import {
  connectComponent,
  createComponent,
  destroyComponent,
  disconnectComponent,
  readyComponent
} from './component/lifecycle';

const rootContexts:ComponentContext[] = [];

export function create<Props>(element:RefElement, rootComponent: FunctionalComponent, props?:ComponentProps<Props>) {
  const context = createComponent(rootComponent, Object.assign({}, rootComponent.defaultProps, props || {}));
  context.element = element;
  context.tag = 'root';

  connectComponent(context, {
    el: element
  });

  readyComponent(context);

  rootContexts.push(context);

  return {
    destroy() {
      const index = rootContexts.indexOf(context);

      disconnectComponent(context);
      destroyComponent(context);

      if(index === -1) {
        return;
      }

      rootContexts.splice(index, 1);
    }
  }
}
