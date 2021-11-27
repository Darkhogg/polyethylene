import PolyAsyncIterable from './iter-async.js'
import PolySyncIterable from './iter-sync.js'


type IterableFactory<T> = () => Iterable<T>
type AsyncIterableFactory<T> = () => AsyncIterable<T>

type ValueCallback<T> = (value : T) => void
type ErrorCallback = (error : Error) => void
type DoneCallback = () => void

type Assembler<T> = (callbacks : {value : ValueCallback<T>, error : ErrorCallback, done : DoneCallback}) => void


function isSyncIterable<T> (obj : unknown) : obj is Iterable<T> {
  return typeof obj == 'object' && obj != null && Symbol.iterator in obj
}


export function syncFrom<T> (iterable : Iterable<T>) : PolySyncIterable<T>
export function syncFrom<T> (iterable : IterableFactory<T>) : PolySyncIterable<T>

export function syncFrom<T> (iterableOrFactory : Iterable<T> | IterableFactory<T>) : PolySyncIterable<T> {
  if (iterableOrFactory instanceof PolySyncIterable) {
    return iterableOrFactory
  }

  if (typeof iterableOrFactory === 'function') {
    return syncFrom(iterableOrFactory())
  }

  if (isSyncIterable<T>(iterableOrFactory)) {
    return new PolySyncIterable<T>(iterableOrFactory)
  }

  throw Error('argument is not iterable')
}


function isAsyncIterable<T> (obj : unknown) : obj is AsyncIterable<T> {
  return typeof obj == 'object' && obj != null && Symbol.asyncIterator in obj
}

export function asyncFrom<T> (iterable : AsyncIterable<T>) : PolyAsyncIterable<T>
export function asyncFrom<T> (iterable : AsyncIterableFactory<T>) : PolyAsyncIterable<T>

export function asyncFrom<T> (iterableOrFactory : AsyncIterable<T> | AsyncIterableFactory<T>) : PolyAsyncIterable<T> {
  if (iterableOrFactory instanceof PolyAsyncIterable) {
    return iterableOrFactory
  }

  if (typeof iterableOrFactory === 'function') {
    return asyncFrom(iterableOrFactory())
  }

  if (isAsyncIterable<T>(iterableOrFactory)) {
    return new PolyAsyncIterable<T>(iterableOrFactory)
  }

  throw Error('argument is not async iterable')
}


export function assemble<T> (assembler : Assembler<T>) : PolyAsyncIterable<T> {
  let currentPromise : {accept: ValueCallback<IteratorResult<T>>, reject: ErrorCallback} | null = null

  const pendingValues : Array<T> = []
  let pendingError : Error | null = null
  let pendingDone : boolean = false

  /* function to yield a new value */
  const value = (obj : T) : void => {
    if (pendingDone) {
      return
    }

    if (currentPromise) {
      currentPromise.accept({value: obj})
      currentPromise = null
      return
    }

    pendingValues.push(obj)
  }

  /* function to notify of an error */
  const error = (err : Error) : void => {
    if (pendingDone) {
      return
    }

    pendingDone = true
    if (currentPromise) {
      currentPromise.reject(err)
      currentPromise = null
      return
    }

    pendingError = err
  }

  /* function to end the iteration */
  const done = () : void => {
    if (pendingDone) {
      return
    }

    if (currentPromise) {
      currentPromise.accept({done: true, value: undefined})
      currentPromise = null
    }

    pendingDone = true
  }
  return new PolyAsyncIterable<T>({
    [Symbol.asyncIterator] () : AsyncIterator<T> {
      assembler({value, error, done})

      return {
        async next (/* ignore this */) : Promise<IteratorResult<T>> {
          if (pendingValues.length) {
            return Promise.resolve({done: false, value: pendingValues.shift() as T})
          }
          if (pendingError) {
            pendingError = null
            return Promise.reject(pendingError)
          }
          if (pendingDone) {
            return Promise.resolve({done: true, value: undefined})
          }

          return new Promise((accept, reject) => {
            currentPromise = {accept, reject}
          })
        },
      }
    },
  })
}


export function empty<T> () : PolySyncIterable<T> {
  return syncFrom<T>([])
}


export function entries<K extends string | number | symbol, V> (
  obj : Record<K, V>,
) : PolySyncIterable<[K, V]> {
  return syncFrom(function * () {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        yield [key, obj[key]]
      }
    }
  })
}

export function keys<K extends string | number | symbol> (
  obj : Record<K, unknown>,
) : PolySyncIterable<K> {
  return syncFrom(function * () {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        yield key
      }
    }
  })
}

export function values<V> (
  obj : Record<string | number | symbol, V>,
) : PolySyncIterable<V> {
  return syncFrom(function * () {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        yield obj[key]
      }
    }
  })
}


function * rangeUp (from : number, to : number, step : number) : Iterable<number> {
  for (let n = from; n < to; n += step) {
    yield n
  }
}

function * rangeDown (from : number, to : number, step : number) : Iterable<number> {
  for (let n = from; n > to; n -= step) {
    yield n
  }
}

export function range (
  fromOrTo : number,
  maybeTo? : number,
  step : number = 1,
) : PolySyncIterable<number> {
  const fromNum = (maybeTo === undefined) ? 0 : fromOrTo
  const toNum = (maybeTo === undefined) ? fromOrTo : maybeTo

  if (step === 0) {
    throw new Error('"step" can\'t be 0')
  }

  const rangeFunc = (step > 0 ? rangeUp : rangeDown)
  return syncFrom(rangeFunc(fromNum, toNum, Math.abs(step)))
}

export function repeat<T> (value : T) : PolySyncIterable<T> {
  return syncFrom(function * () {
    while (true) {
      yield value
    }
  })
}


export function syncIterate<T> (func : (lastValue : T | undefined) => T) : PolySyncIterable<T>
export function syncIterate<T> (func : (lastValue : T) => T, initValue : T) : PolySyncIterable<T>

export function syncIterate<T> (
  func : (lastValue : T | undefined) => T,
  initValue? : T,
) : PolySyncIterable<T> {
  return syncFrom(function * () {
    let nextValue = initValue
    while (true) {
      nextValue = func(nextValue)
      yield nextValue
    }
  })
}

export function asyncIterate<T> (func : (lastValue : T | undefined) => T | Promise<T>) : PolyAsyncIterable<T>
export function asyncIterate<T> (func : (lastValue : T) => T | Promise<T>, initValue : T) : PolyAsyncIterable<T>

export function asyncIterate<T> (
  func : (lastValue : T | undefined) => Promise<T>,
  initValue? : T,
) : PolyAsyncIterable<T> {
  return asyncFrom(async function * () {
    let nextValue = initValue
    while (true) {
      nextValue = await func(nextValue)
      yield nextValue
    }
  })
}
