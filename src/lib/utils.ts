export function identity<T> (x: T): T {
  return x
}

export async function asyncIdentity<T> (x: T): Promise<T> {
  return x
}

export function comparator<T> (a: T, b: T): -1 | 0 | 1 {
  return (a < b) ? -1 : (a > b) ? +1 : 0
}

export function isNotNullish<T> (obj: T): obj is NonNullable<T> {
  return obj != null
}


export function isSyncIterable<T> (obj: unknown): obj is Iterable<T> {
  return obj != null && Symbol.iterator in Object(obj)
}

export function isAsyncIterable<T> (obj: unknown): obj is AsyncIterable<T> {
  return obj != null && Symbol.asyncIterator in Object(obj)
}

export const asserts = {
  isFunction (arg: any, name = 'argument'): arg is Function {
    if (typeof arg !== 'function') {
      throw new Error(`${name} should be a function`)
    }
    return true
  },

  isInteger (arg: any, name = 'argument'): arg is number {
    if (!Number.isInteger(arg)) {
      throw new Error(`${name} should be an integer`)
    }
    return true
  },

  isPositiveInteger (arg: any, name = 'argument'): arg is number {
    if (!Number.isInteger(arg) || arg as any <= 0) {
      throw new Error(`${name} should be a positive integer`)
    }
    return true
  },

  isNonNegativeInteger (arg: any, name = 'argument'): arg is number {
    if (!Number.isInteger(arg) || arg as any < 0) {
      throw new Error(`${name} should be a non-negative integer`)
    }
    return true
  },

  isSyncIterable (arg: any, name = 'argument'): arg is Iterable<any> {
    const iteratorMethod = (arg as any)[Symbol.iterator]
    if (typeof iteratorMethod !== 'function') {
      throw new Error(`${name} should be sync iterable`)
    }
    return true
  },

  isAsyncIterable (arg: any, name = 'argument'): arg is AsyncIterable<any> {
    const asyncIteratorMethod = arg[Symbol.asyncIterator]
    if (typeof asyncIteratorMethod !== 'function') {
      throw new Error(`${name} should be async iterable`)
    }
    return true
  },

  isSyncOrAsyncIterable (arg: any, name = 'argument'): arg is Iterable<any> | AsyncIterable<any> {
    const iteratorMethod = (arg as any)[Symbol.iterator]
    const asyncIteratorMethod = arg[Symbol.asyncIterator]
    if (typeof iteratorMethod !== 'function' && typeof asyncIteratorMethod !== 'function') {
      throw new Error(`${name} should be sync or async iterable`)
    }
    return true
  },
}
