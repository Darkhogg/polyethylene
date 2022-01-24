import PolyAsyncIterable from './iter-async.js'
import PolySyncIterable from './iter-sync.js'


function isSyncIterable<T> (obj : unknown) : obj is Iterable<T> {
  return typeof obj == 'object' && obj != null && Symbol.iterator in obj
}


function isAsyncIterable<T> (obj : unknown) : obj is AsyncIterable<T> {
  return typeof obj == 'object' && obj != null && Symbol.asyncIterator in obj
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


/**
 * Main namespace for the creation of {@link PolySyncIterable} and {@link PolyAsyncIterable} objects.
 *
 * @public
 */
export namespace Poly {
  /**
   * A function with no arguments that returns an `Iterable`
   * @typeParam T - The generic type of the returned `Iterable`
   */
  export type IterableFactory<T> = () => Iterable<T>

  /**
   * A function with no arguments that returns an `AsyncIterable`
   * @typeParam T - The generic type of the returned `Iterable`
   */
  export type AsyncIterableFactory<T> = () => AsyncIterable<T>

  /**
   * A callback that receives a single value of type `T`
   * @typeParam T - The generic type of the accepted value
   */
  export type ValueCallback<T> = (value : T) => void

  /**
   * A callback that receives a single error value
   */
  export type ErrorCallback = (error : Error) => void

  /**
   * A callback that receives no values
   */
  export type DoneCallback = () => void

  /**
   * An object containing callback functions to generate an iteration
   * @typeParam T - The generic type of the accepted values
   *
   * @public
   */
  export interface AssemblerCallbacks<T> {
    /** A callback that accepts a single `value` and will produce an element in the iteration */
    value : ValueCallback<T>,
    /** A callback that accepts a single `error` and will produce an error in the iteration */
    error : ErrorCallback,
    /** A callback that accepts nothing and will end in the iteration */
    done : DoneCallback
  }

  /**
   * A function that receives an {@link Poly.AssemblerCallbacks} object to generate an iteration
   * @typeParam T - The generic type of the produced iteration
   */
  export type AssemblerFunction<T> = (callbacks : AssemblerCallbacks<T>) => void


  /**
   * Create a new {@link PolySyncIterable} object from an iterable or a function that returns iterables (such as a
   * generator function).
   *
   * If the passed argument is a function, it will be called with no arguments and its return value will be used to
   * create the resulting {@link PolySyncIterable}.
   *
   * @typeParam T - The type of the resulting iterable
   * @param iterableOrFactory - an iterable or iterable factory used to create the resulting iterable
   * @returns A {@link PolySyncIterable} that iterates over the same elements as the passed iterable
   *
   * @public
   */
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


  /**
   * Create a new {@link PolyAsyncIterable} object from an iterable, async iterable, or a function that returns
   * iterables (such as a generator function or an async generator function).
   *
   * If the passed argument is a function, it will be called with no arguments and its return value will be used to
   * create the resulting {@link PolyAsyncIterable}.
   *
   * @typeParam T - The type of the resulting async iterable
   * @param iterableOrFactory - an async iterable or async iterable factory used to create the resulting async iterable
   * @returns A {@link PolyAsyncIterable} that iterates over the same elements as the passed iterable
   *
   * @public
   */
  export function asyncFrom<T> (
    iterableOrFactory : Iterable<T> | IterableFactory<T> | AsyncIterable<T> | AsyncIterableFactory<T>,
  ) : PolyAsyncIterable<T> {
    if (iterableOrFactory instanceof PolyAsyncIterable) {
      return iterableOrFactory
    }

    if (typeof iterableOrFactory === 'function') {
      return asyncFrom(iterableOrFactory())
    }

    if (isAsyncIterable<T>(iterableOrFactory)) {
      return new PolyAsyncIterable<T>(iterableOrFactory)
    }

    if (isSyncIterable<T>(iterableOrFactory)) {
      return new PolySyncIterable<T>(iterableOrFactory).async()
    }

    throw Error('argument is not sync or async iterable')
  }


  /**
   * Create a new {@link PolyAsyncIterable} by manually emitting values, errors, or signalling the end of the iteration.
   *
   * @remarks
   * This method for creating iterables should only be used as a last resort, if converting an existing iterable or
   * defining a generator function proves impossible.
   *
   * @typeParam T - The type of the resulting async iterable
   * @param assembler - A function that will receive an object containing the methods `value`, `error` and `done`.
   *
   * @public
   */
  export function assemble<T> (assembler : AssemblerFunction<T>) : PolyAsyncIterable<T> {
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

  /**
   * Return a {@link PolySyncIterable} that yields no elements upon iteration.
   *
   * @typeParam T - Type of the resulting iterable
   * @returns An iterable that yields no elements
   *
   * @public
   */
  export function empty<T = never> () : PolySyncIterable<T> {
    return syncFrom<T>([])
  }


  /**
   * Returns a {@link PolySyncIterable} that yields the same elements as `Object.entries` would.
   *
   * @typeParam T - Type of the resulting iterable
   * @returns An iterable that yields the entries of the passed object
   *
   * @public
   */
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

  /**
   * Returns a {@link PolySyncIterable} that yields the same elements as `Object.keys` would.
   *
   * @typeParam T - Type of the resulting iterable
   * @returns An iterable that yields the keys of the passed object
   *
   * @public
   */
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

  /**
   * Returns a {@link PolySyncIterable} that yields the same elements as `Object.values` would.
   *
   * @typeParam T - Type of the resulting iterable
   * @returns An iterable that yields the values of the passed object
   *
   * @public
   */
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

  /**
   * Returns a {@link PolySyncIterable} that yields numbers from 0 up to, but not including, `to`, with a step of 1.
   *
   * @param to - Exclusive upper bound of the iteration
   * @returns - An iterable over the numbers from 0 to `to` with a step of 1
   *
   * @public
   */
  export function range(to: number): PolySyncIterable<number>

  /**
   * Returns a {@link PolySyncIterable} that yields numbers from `from` up to, but not including, `to`,
   * with a step of 1.
   *
   * @param from - Inclusive lower bound of the iteration
   * @param to - Exclusive upper bound of the iteration
   * @returns - An iterable over the numbers from `from` to `to` with a step of 1
   *
   * @public
   */
  export function range(from: number, to: number): PolySyncIterable<number>

  /**
   * Returns a {@link PolySyncIterable} that yields numbers from `from` up to, but not including, `to`, with a step of
   * `step`.
   *
   * @param from - Inclusive lower bound of the iteration
   * @param to - Exclusive upper bound of the iteration
   * @param step - Distance between the iterated numbers
   * @returns - An iterable over the numbers from `from` to `to` with a step of `step`
   *
   * @public
   */
  export function range(from: number, to: number, step?: number): PolySyncIterable<number>

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

  /**
   * Returns a {@link PolySyncIterable} that yields the passed argument forever, without ending.
   *
   * @typeParam T - The type of the interable
   * @param value - The reapeated element
   * @returns an infinite iterable over the same element
   *
   * @public
   */
  export function repeat<T> (value : T) : PolySyncIterable<T> {
    return syncFrom(function * () {
      while (true) {
        yield value
      }
    })
  }


  /**
   * Returns a {@link PolySyncIterable} that will yield the values returned from calling `func` with the value last
   * returned, or `undefined` when called for the first time.
   *
   * @remarks
   * `func` will be called initially with `undefined`.  After that, each element returned by calling it will be yielded
   * as part of the resulting iterable and then passed to next call to `func`.
   *
   * Note that there is no way of yielding a different value to that passed to the next function call, and that the
   * resulting iterable will not end.  If this is undesired, either use some of the operators on the resulting iterable
   * (such as {@link PolySyncIterable.map | map} or {@link PolySyncIterable.take | take}
   * / {@link PolySyncIterable.take | takeWhile}) or use a different approach to create the iterable.
   *
   * @typeParam T - The type of the interable and return type of `func`
   * @param func - The function that will be called to generate new elements of the iteration
   * @returns an infinite iterable that yields the return values from calling `func` repeatedly
   *
   * @public
   */
  export function syncIterate<T> (func : (lastValue : T | undefined) => T) : PolySyncIterable<T>

  /**
   * Returns a {@link PolySyncIterable} that will yield the values returned from calling `func` with the value last
   * returned, or `initValue` when called for the first time.
   *
   * @remarks
   * `func` will be called initially with `initValue`.  After that, each element returned by calling it will be yielded
   * as part of the resulting iterable and then passed to next call to `func`.  Note that `initValue` will not be
   * part of the iteration.
   *
   * Note that there is no way of yielding a different value to that passed to the next function call, and that the
   * resulting iterable will not end.  If this is undesired, either use some of the operators on the resulting iterable
   * (such as {@link PolySyncIterable.map | map} or {@link PolySyncIterable.take | take}
   * / {@link PolySyncIterable.take | takeWhile}) or use a different approach to create the iterable.
   *
   * @typeParam T - The type of the interable and return type of `func`
   * @param func - The function that will be called to generate new elements of the iteration
   * @returns an infinite iterable that yields the return values from calling `func` repeatedly
   *
   * @public
   */
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


  /**
   * Returns a {@link PolyAsyncIterable} that will yield the values returned from calling `func` with the value last
   * returned, or `undefined` when called for the first time.
   *
   * @remarks
   * `func` will be called initially with `undefined`.  After that, each element returned by calling it will be yielded
   * as part of the resulting iterable and then passed to next call to `func`.
   *
   * Note that there is no way of yielding a different value to that passed to the next function call, and that the
   * resulting iterable will not end.  If this is undesired, either use some of the operators on the resulting iterable
   * (such as {@link PolyAsyncIterable.map | map} or {@link PolyAsyncIterable.take | take}
   * / {@link PolyAsyncIterable.take | takeWhile}) or use a different approach to create the iterable.
   *
   * @typeParam T - The type of the interable and return type of `func`
   * @param func - The function that will be called to generate new elements of the iteration
   * @returns an infinite iterable that yields the return values from calling `func` repeatedly
   *
   * @public
   */
  export function asyncIterate<T> (func : (lastValue : T | undefined) => T | Promise<T>) : PolyAsyncIterable<T>

  /**
   * Returns a {@link PolyAsyncIterable} that will yield the values returned from calling `func` with the value last
   * returned, or `initValue` when called for the first time.
   *
   * @remarks
   * `func` will be called initially with `initValue`.  After that, each element returned by calling it will be yielded
   * as part of the resulting iterable and then passed to next call to `func`.  Note that `initValue` will not be
   * part of the iteration.
   *
   * Note that there is no way of yielding a different value to that passed to the next function call, and that the
   * resulting iterable will not end.  If this is undesired, either use some of the operators on the resulting iterable
   * (such as {@link PolyAsyncIterable.map | map} or {@link PolyAsyncIterable.take | take}
   * / {@link PolyAsyncIterable.take | takeWhile}) or use a different approach to create the iterable.
   *
   * @typeParam T - The type of the interable and return type of `func`
   * @param func - The function that will be called to generate new elements of the iteration
   * @returns an infinite iterable that yields the return values from calling `func` repeatedly
   *
   * @public
   */
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
}
