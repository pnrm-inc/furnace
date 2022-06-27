import {ComponentContext} from './componentContext';
import {RefElement} from './domRefs';
import {connectComponent, createComponent, destroyComponent, disconnectComponent, readyComponent} from './lifecycle';

type ComponentOption<Props> = {
  props?: Props
};
type ComponentProps<Props> = Readonly<Props>;

interface FunctionalComponent<Props = Record<string, unknown>> {
  (props: ComponentProps<Props>): void
  tag?: string;
  defaultProps: Partial<Props>;
}

function connectWithDOM<Props>(tag: string, component: FunctionalComponent<Props>, props?: ComponentProps<Props>, scope:RefElement | Document = document) {
  const matches = Array.from(scope.querySelectorAll<RefElement>(`[data-component="${tag}"]`));
  const elements = matches.filter((el) => {
    let parent = el.parentNode;
    while(parent) {
      if(parent === document || (parent as Element).matches('[data-component]')) {
        break;
      }
      parent = parent.parentNode;
    }

    return parent === document || parent === scope;
  });

  if(!elements.length) {
    return;
  }

  elements.forEach(element => {
    const propsFromDOM = JSON.parse(element.dataset.componentProps || '{}') as Partial<Props>;
    const newProps = Object.assign({}, component.defaultProps, props || {}, propsFromDOM) as ComponentProps<Props>;

    const context = createComponent(component, newProps);

    context.element = element;
    context.tag = tag;

    connectComponent(context, {
      el: element
    });

    readyComponent(context);
  });
}

function disconnectFromDOM(context:ComponentContext) {
  disconnectComponent(context);
  destroyComponent(context);
}

export {
  connectWithDOM,
  disconnectFromDOM,
  ComponentOption,
  FunctionalComponent,
  ComponentProps
}
