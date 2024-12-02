import AsyncIterableBuilder from './builder.js'
import PolyAsyncIterable from './async/poly-iterable.js'
import {PolySyncIterable, IterablePolySyncIterable} from './sync/main.js'
import {isAsyncIterable, isSyncIterable} from './utils.js'


function * rangeUp (from: number, to: number, step: number): Iterable<number> {
  for (let n = from; n < to; n += step) {
    yield n
  }
}

function * rangeDown (from: number, to: number, step: number): Iterable<number> {
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
  export function syncFrom<T> (iterableOrFactory: Iterable<T> | IterableFactory<T>): PolySyncIterable<T> {
    if (iterableOrFactory instanceof PolySyncIterable) {
      return iterableOrFactory
    }

    const iterable = (typeof iterableOrFactory === 'function') ? iterableOrFactory() : iterableOrFactory

    if (isSyncIterable<T>(iterable)) {
      return new IterablePolySyncIterable<T>(iterable)
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
    iterableOrFactory: Iterable<T> | IterableFactory<T> | AsyncIterable<T> | AsyncIterableFactory<T>,
  ): PolyAsyncIterable<T> {
    if (iterableOrFactory instanceof PolyAsyncIterable) {
      return iterableOrFactory
    }

    const iterable = (typeof iterableOrFactory === 'function') ? iterableOrFactory() : iterableOrFactory

    if (isAsyncIterable<T>(iterable)) {
      return new PolyAsyncIterable<T>(iterable)
    }

    if (isSyncIterable<T>(iterable)) {
      return new IterablePolySyncIterable<T>(iterable).async()
    }

    throw Error('argument is not sync or async iterable')
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
  export function from<T> (iterableOrFactory: AsyncIterable<T> | AsyncIterableFactory<T>): PolyAsyncIterable<T>

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
  export function from<T> (iterableOrFactory: Iterable<T> | IterableFactory<T>): PolySyncIterable<T>

  /**
   * Create a new {@link PolySyncIterable} or {@link PolyAsyncIterable} object from a sync or async iterable or a
   * function that returns sync or async iterables (such as a sync or async generator function).
   *
   * If the passed argument is a function, it will be called with no arguments and its return value will be used to
   * create the resulting {@link PolySyncIterable} or {@link PolyAsyncIterable}.
   *
   * Whether the resulting iterable is sync or async depends on the input being sync or async.
   *
   * @typeParam T - The type of the resulting iterable
   * @param iterableOrFactory - a sync or async iterable or iterable factory used to create the resulting iterable
   * @returns A {@link PolySyncIterable} or {@link PolyAsyncIterable} that iterates over the same elements as the
   * passed iterable
   *
   * @public
   */
  export function from<T> (
    iterableOrFactory: Iterable<T> | IterableFactory<T> | AsyncIterable<T> | AsyncIterableFactory<T>,
  ): PolySyncIterable<T> | PolyAsyncIterable<T>

  export function from<T> (
    iterableOrFactory: Iterable<T> | IterableFactory<T> | AsyncIterable<T> | AsyncIterableFactory<T>,
  ): PolySyncIterable<T> | PolyAsyncIterable<T> {
    if (iterableOrFactory instanceof PolySyncIterable || iterableOrFactory instanceof PolyAsyncIterable) {
      return iterableOrFactory
    }

    const iterable = (typeof iterableOrFactory === 'function') ? iterableOrFactory() : iterableOrFactory

    if (isAsyncIterable<T>(iterable)) {
      return new PolyAsyncIterable<T>(iterable)
    }

    if (isSyncIterable<T>(iterable)) {
      return new IterablePolySyncIterable<T>(iterable)
    }

    throw Error('argument is not sync or async iterable')
  }

  /**
   * Return a new {@link AsyncIterableBuilder}, an iterable object that can be constructed by calling its methods.
   *
   * @remarks
   * This method for creating iterables should only be used as last resort if other functions are not enough.
   * In particular, before using this method, see if {@link Poly.buildWith} works for you.
   *
   * @typeParam T - The type of the resulting builder
   *
   * @public
   */
  export function builder<T> (): AsyncIterableBuilder<T> {
    return new AsyncIterableBuilder<T>()
  }


  /**
   * Create a new {@link PolyAsyncIterable} by passing the `func` function an {@link AsyncIterableBuilder} object.
   *
   * @remarks
   * This method for creating iterables should only be used as a last resort if other functions are not enough.
   *
   * @typeParam T - The type of the resulting async iterable
   * @param func - A function that will receive an object containing the methods `value`, `error` and `done`.
   *
   * @public
   */
  export function buildWith<T> (func: (builder: AsyncIterableBuilder<T>) => void): PolyAsyncIterable<T> {
    const bld = builder<T>()
    func(bld)
    return Poly.asyncFrom(bld)
  }

  /**
   * Return a {@link PolySyncIterable} that yields no elements upon iteration.
   *
   * @typeParam T - Type of the resulting iterable
   * @returns An iterable that yields no elements
   *
   * @public
   */
  export function empty<T = never> (): PolySyncIterable<T> {
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
  export function entries<K extends PropertyKey, V> (
    obj: Record<K, V>,
  ): PolySyncIterable<[K, V]> {
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
  export function keys<K extends PropertyKey> (
    obj: Record<K, unknown>,
  ): PolySyncIterable<K> {
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
  export function values<V, K extends PropertyKey = PropertyKey> (
    obj: Record<K, V>,
  ): PolySyncIterable<V> {
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
    fromOrTo: number,
    maybeTo?: number,
    step: number = 1,
  ): PolySyncIterable<number> {
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
  export function repeat<T> (value: T): PolySyncIterable<T> {
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
  export function syncIterate<T> (func: (lastValue: T | undefined) => T): PolySyncIterable<T>

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
  export function syncIterate<T> (func: (lastValue: T) => T, initValue: T): PolySyncIterable<T>

  export function syncIterate<T> (
    func: (lastValue: T | undefined) => T,
    initValue?: T,
  ): PolySyncIterable<T> {
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
  export function asyncIterate<T> (func: (lastValue: T | undefined) => T | Promise<T>): PolyAsyncIterable<T>

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
  export function asyncIterate<T> (func: (lastValue: T) => T | Promise<T>, initValue: T): PolyAsyncIterable<T>

  export function asyncIterate<T> (
    func: (lastValue: T | undefined) => Promise<T>,
    initValue?: T,
  ): PolyAsyncIterable<T> {
    return asyncFrom(async function * () {
      let nextValue = initValue
      while (true) {
        nextValue = await func(nextValue)
        yield nextValue
      }
    })
  }
}


const obj: {[key: string]: number} = {}

const a = Poly.values(obj)
const b = Poly.keys(obj)
const c = Poly.entries(obj)
