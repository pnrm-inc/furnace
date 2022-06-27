import { dict, isDict, Dict, val, isVal, Value, effect } from './reactive';
import { childHandle } from './component/childHandle';
import { onConnected, onDisconnected, onDestroyed } from './component/lifecycle';
import { domRefs, DefaultRefs, Refs, RefElement } from './component/domRefs';
import { rootRef } from './component/rootRef';
import { FunctionalComponent, ComponentProps } from './component/functionalComponent';

import { useComputed } from './composition/useComputed';
import { useDomRef } from './composition/useDomRef';
import { useEvent } from './composition/useEvent';
import { useIntersectionWatch } from './composition/useIntersectionWatch';
import { useTick } from './composition/useTick';
import { useWatch } from './composition/useWatch';

import { createContext } from './createContext';
import { withContext } from './withContext';

import * as furnace from './furnace';

export {
  onConnected,
  onDisconnected,
  onDestroyed,
  childHandle,
  domRefs,
  rootRef,
  dict,
  val,
  isVal,
  effect,
  isDict,
  useComputed,
  useDomRef,
  useEvent,
  useIntersectionWatch,
  useTick,
  useWatch,
  createContext,
  withContext
}

export default furnace;

export type {
  Dict,
  Value,
  FunctionalComponent,
  ComponentProps,
  DefaultRefs,
  Refs,
  RefElement,
}
