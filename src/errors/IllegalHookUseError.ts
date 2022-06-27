class IllegalHookUseError extends Error {
  constructor(message?: string) {
    super(message);
  }
}

function throwIfHookUsedIllegally(hookName: string): never {
  throw new IllegalHookUseError(`${hookName} hook must be called in top-level of Functional Component`);
}

export { throwIfHookUsedIllegally }
export type { IllegalHookUseError }
