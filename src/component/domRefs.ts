import {ComponentContext, getComponentContextToBeConnectedWithHook} from './componentContext';

type RefElement = HTMLElement | SVGElement;
type DefaultRefs = {
  [p: string]: RefElement | RefElement[] | null
};

type Refs<T> = T extends DefaultRefs ? T : never;

const refsMap = new Map<ComponentContext, DOMRef>();

class DOMRef<T = unknown> {
  get refs() {
    return this._refs;
  }
  private readonly _refs: Refs<T>;

  get currentScope() {
    return this._currentScope;
  }
  private _currentScope:RefElement | null;

  constructor(refs: Refs<T>) {
    this._refs = refs;
    this._currentScope = null;
  }

  private _resolveRef(key: keyof T) {

    if(!this._currentScope) {
      return;
    }

    const descendantRefs = [...this._currentScope.querySelectorAll<RefElement>(`[data-ref="${key}"]`)];

    /*
     * 取得したrefを上方向に捜査し、scope で指定されているコンポーネントルートに属しているか確認する
     * 間に別のコンポーネントルートが存在する場合、その ref は scope に含まれない。
     */
    const childRefs = descendantRefs.filter((ref) => {
      const closestTagged = ref.closest('[data-component]')
      return closestTagged == null || closestTagged === this._currentScope;
    });

    if(Array.isArray(this._refs[key])) {
      this._refs[key] = childRefs as Refs<T>[typeof key];
    }
    else {
      this._refs[key] = childRefs[0] as Refs<T>[typeof key];
    }
  }

  validate(scope: RefElement) {
    this._currentScope = scope;

    (Object.keys(this._refs) as (keyof T)[]).forEach((refKey) => {
      this._resolveRef(refKey);
    });
  }
}

function createDOMRefs<T>(refsObject:Refs<T>) {
  return new DOMRef(refsObject);
}

function registerRefs(context:ComponentContext, domRef:DOMRef) {
  if(refsMap.has(context)) {
    // TODO: warning message;
    return;
  }

  refsMap.set(context, domRef);
}

function deleteRefs(context:ComponentContext){
  refsMap.delete(context);
}

/*
 * コンポーネントが持っているDOMへの参照を保持する
 */
function domRefs<T>(refsObject:Refs<T>) {
  const context = getComponentContextToBeConnectedWithHook('domRef');
  const domRef = createDOMRefs(refsObject);

  registerRefs(context, domRef);

  context.onConnected.push(({el}) => {
    domRef.validate(el);
  });

  context.onDisconnected.push(() => {
    deleteRefs(context);
  });

  return {
    get() {
      return domRef.refs;
    },
    validate(callback: (refs:Refs<T>) => void) {
      const scope = domRef.currentScope;

      if(!scope) {
        // TODO: エラーメッセージ
        throw new Error('no scope found');
      }

      domRef.validate(scope);
      callback(domRef.refs);
    }
  }
}

export {
  domRefs,
  DefaultRefs,
  Refs,
  RefElement
}
