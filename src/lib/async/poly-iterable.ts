import {
  AsyncChunkingPredicate,
  AsyncIndexedMapping,
  AsyncIndexedPredicate,
  AsyncIndexedReducer,
  AsyncIndexedRunnable,
  Comparator,
  IndexedTypePredicate,
  Tuple,
} from '../types.js'

import {comparator, asserts, asyncIdentity, isNotNullish} from '../utils.js'
import {ConcurrentMapper} from './concurrency.js'
import {
  appendGen,
  chunkGen,
  chunkWhileGen,
  dropGen, dropLastGen,
  dropWhileGen, filterGen,
  flattenGen,
  groupByGen,
  mapGen,
  prefetchGen,
  prependGen, reverseGen,
  sliceGen, sortGen,
  takeGen,
  takeLastGen,
  takeWhileGen,
  tapGen,
  uniqueGen,
} from './generators.js'

// eslint-disable-next-line no-unused-vars -- here for documentation
import type PolySyncIterable from '../sync/poly-iterable.js'

/**
 * Options for concurrency.
 *
 * @public
 */
export interface ConcurrencyOptions {
  /** Maximum amount of promises to launch at the same time (defaults to 1) */
  concurrency?: number
  /** Maximum amount of intermediate results to store (defaults to twice the concurrency value) */
  bufferSize?: number
}


const NOOP = <T>(x: T): T => x


/**
 * An `AsyncIterable<T>` with a suite of methods for transforming the iteration into other iterations or to get a
 * single result from it.
 *
 * This class works as an async version of {@link PolySyncIterable}, but all methods accept async function where
 * possible and will always return either `PolyAsyncIterables` or a `Promise` to a value.
 *
 * ## Concurrency
 * Many operations of this class accept as a final argument an {@link ConcurrencyOptions | options object} than can
 * specify some options for concurrent operations.
 *
 * - The `concurrency` option will specify how many times whatever `func` you pass is called before waiting for its
 * results.  Effectively, this is the number of promises that can be pending at the same time.  If not specified, it
 * will default to 0, meaning no concurrency.  Must be a non-negative integer.
 * - The `bufferSize` option will specify the size of the internal buffer used to store the pending and completed
 * promises.  Effectively, this is how many results will be prefetched.  If not specified, it will default to
 * `concurrency`, meaning no extra intermediate results are stored.  Must be a positive integer greater or equal to
 * `concurrency`.
 *
 * A concurrency value of 0 acts the same as a 1 concurrency-wise, but disables the concurrency completely, preventing
 * any values to be requested before actually needed.
 *
 * Specifying concurrency greater or equal to 1 will make more elements be requested of the previous iterator than
 * actually requested of the current one, similarly to {@link PolyAsyncIterable.prefetch}.
 *
 * @public
 */
export default class PolyAsyncIterable<T> implements AsyncIterable<T> {
  #iterable: AsyncIterable<T>

  /** @internal */
  constructor (iterable: AsyncIterable<T>) {
    this.#iterable = iterable
  }

  /**
   * Allows this class to work as a regular `AsyncIterable<T>`
   *
   * @returns an async iterable that will yield the same elements as the iterable used to create this instance
   */
  [Symbol.asyncIterator] () {
    return this.#iterable[Symbol.asyncIterator]()
  }

  /**
   * Return `this`.
   *
   * @remarks
   * This method is present in this class for compatibility with {@link PolySyncIterable.async}, but it's never
   * necessary to call it for anything.
   *
   * @returns A {@link PolyAsyncIterable} that yields the same elements as `this`
   */
  async (): PolyAsyncIterable<T> {
    return this
  }

  /**
   * Return the same iteration, but with its elements requested with anticipation to allow for asynchronous operations
   * to begin and reduce wait times.
   *
   * @remarks
   * When yielding an element of this iterable, the next one will be also requested internally, so that any
   * asynchronous operations are started before their results are needed.
   *
   * Note that after calling this mehtod, more elements than strictly needed might be requested from the previous
   * iterable, triggering any potential side effects.
   *
   * @returns a new {@link PolyAsyncIterable} that prefetched the iterated elementsd
   */
  prefetch (): PolyAsyncIterable<T> {
    return new PolyAsyncIterable(prefetchGen(this.#iterable))
  }

  /**
   * Return a new iteration that will iterate over `this`, then over `other`.
   *
   * @remarks
   * The resulting iteration is of the combined generic type of `this` and `other`, allowing this method to merge the
   * types of two distinct iterables.
   *
   * @typeParam U - Type of the elements to be appended
   * @param other - Iterable to be appended
   * @returns a new {@link PolyAsyncIterable} that yields the elements of `this` and then the elements of `other`
   */
  append<U> (other: Iterable<U> | AsyncIterable<U>): PolyAsyncIterable<T | U> {
    asserts.isSyncOrAsyncIterable(other)
    return new PolyAsyncIterable(appendGen(this.#iterable, other))
  }

  /**
   * Return a new iteration that will iterate over `this`, then over `other`.
   *
   * @remarks
   * This method is an alias for {@link PolyAsyncIterable.append}.
   *
   * @typeParam U - Type of the elements to be appended
   * @param other - Iterable to be appended
   * @returns a new {@link PolySyncIterable} that yields the elements of `this` and then the elements of `other`
   */
  concat<U> (other: Iterable<U> | AsyncIterable<U>): PolyAsyncIterable<T | U> {
    return this.append(other)
  }

  /**
   * Return a new iteration that will iterate over `other`, then over `this`.
   *
   * @remarks
   * The resulting iteration is of the combined generic type of `this` and `other`, allowing this method to merge the
   * types of two distinct iterables.
   *
   * @typeParam U - Type of the elements to be prepended
   * @param other - Iterable to be prepended
   * @returns a new {@link PolyAsyncIterable} that yields the elements of `other` and then the elements of `this`
   */
  prepend<U> (other: Iterable<U> | AsyncIterable<U>): PolyAsyncIterable<T | U> {
    asserts.isSyncOrAsyncIterable(other)
    return new PolyAsyncIterable(prependGen(this.#iterable, other))
  }

  /**
   * Return a new iteration that skips the first `num` elements.  If there were less than `num` elements in the
   * iteration, no elements are yielded.
   *
   * @param num - The number of elements to skip
   * @returns a new {@link PolyAsyncIterable} that yields the same the elements of `this`, except for the first
   * `num` elements
   */
  drop (num: number): PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(dropGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that iterates only over the first `num` elements.  If there were less than than `num`
   * elements in the iteration, all elements are yielded with no additions.
   *
   * @param num - The number of elements to yield
   * @returns a new {@link PolyAsyncIterable} that yields the first `num` elements elements of `this`
   */
  take (num: number): PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(takeGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that skips the last `num` elements.  If there were less than `num` elements in the
   * iteration, no elements are yielded.
   *
   * @remarks
   * The returned iteration keeps a buffer of `num` elements internally in order to skip those if the iteration ends,
   * and so elements effectively get delayed by `num` elements.
   *
   * @param num - The number of elements to skip
   * @returns a new {@link PolyAsyncIterable} that yields the same the elements of `this`, except for the last
   * `num` elements
   */
  dropLast (num: number): PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(dropLastGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that iterates only over the last `num` elements.  If there were less than than `num`
   * elements in the iteration, all elements are yielded with no additions.
   *
   * @remarks
   * The returned iteration keeps a buffer of `num` elements internally in order to know which elements to keep.
   * and so elements effectively get delayed until the iteration ends.
   *
   * @param num - The number of elements to yield
   * @returns a new {@link PolyAsyncIterable} that yields the last `num` elements elements of `this`
   */
  takeLast (num: number): PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(takeLastGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that skips the first few elements for which `func(element)` returns `true`.
   *
   * @param func - The function to call on the elements
   * @returns a new {@link PolyAsyncIterable} that yields the same the elements of `this`, excepts the first few for
   * which`func(element)` returns `true`
   */
  dropWhile (func: AsyncIndexedPredicate<T>): PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(dropWhileGen(this.#iterable, func))
  }

  /**
   * Return a new iteration that yields the first few elements for which `func(element)` returns `true`.
   *
   * @remarks
   * Because the `func` argument is a type predicate, the result iteration will have the type asserted by `func`.
   *
   * @param func - The function to call on the elements
   * @returns a new {@link PolyAsyncIterable} that yields the same the elements of `this` as long as `func(element)`
   * returns `true`, correctly narrowed to the type asserted by `func`
   */
  takeWhile<U extends T> (func: IndexedTypePredicate<T, U>): PolyAsyncIterable<U>

  /**
   * Return a new iteration that yields the first few elements for which `func(element)` returns `true`.
   *
   * @param func - The function to call on the elements
   * @returns a new {@link PolyAsyncIterable} that yields the same the elements of `this` as long as `func(element)`
   * returns `true`
   */
  takeWhile (func: AsyncIndexedPredicate<T>): PolyAsyncIterable<T>

  takeWhile<U extends T> (func: AsyncIndexedPredicate<T> | IndexedTypePredicate<T, U>): PolyAsyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(takeWhileGen(this.#iterable, func))
  }

  /**
   * Return a new iteration that starts from the `start`th element (included)
   * and ends at the `end`th element (excluded) of `this`.
   *
   * @remarks
   * Both `start` and `end` allow for negative values, in which case they refer to the nth-to-last element,
   * with n being the absolute value of the argument.  `end` might also be `undefined`, in which case the iteration is
   * not shortened on the end side, yielding up to the end, including the last element.
   * This mimics the behaviour of {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/slice | Array.slice}.
   *
   * This function will likely need a buffer, effectively delaying the yielding of elements for a while.
   *
   * @param start - The index of the first element returned
   * @param end - The index of the first element *not* returned, inclusive
   * @returns a new {@link PolyAsyncIterable} that yields the elements going that starts from the `start`th element
   * (included) and ends at the `end`th element (excluded) of `this`
   */
  slice (start: number, end?: number): PolyAsyncIterable<T> {
    asserts.isInteger(start, 'start')
    asserts.isInteger(end ?? 0, 'end')
    return new PolyAsyncIterable(sliceGen(this.#iterable, start, end))
  }

  /**
   * Return an iteration of the elements of `this` for which `func(element)` returns `true`.
   *
   * @remarks
   * Because the `func` argument is a type predicate, the result iteration will have the type asserted by `func`.
   *
   * @typeParam U - The type asserted by `func`, if any
   * @param func - The function to be called on all elements
   * @param options - Options for concurrency of this operation
   * @returns A new {@link PolyAsyncIterable} with only elements for which `func(element)` returned true, correctly
   * narrowed to the type asserted by `func`
   *
   * {@label FILTER_TYPEPRED}
   */
  filter<U extends T> (func: IndexedTypePredicate<T, U>, options?: ConcurrencyOptions): PolyAsyncIterable<U>

  /**
   * Return an iteration of the elements of `this` for which `func(element)` returns `true`.
   *
   * @param func - The function to be called on all elements
   * @param options - Options for concurrency of this operation
   * @returns A new {@link PolyAsyncIterable} with only elements for which `func(element)` returned
   */
  filter (func: AsyncIndexedPredicate<T>, options?: ConcurrencyOptions): PolyAsyncIterable<T>

  filter<U extends T> (
    func: AsyncIndexedPredicate<T> | IndexedTypePredicate<T, U>,
    options: ConcurrencyOptions = {},
  ): PolyAsyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(filterGen(this.#iterable, func, options))
  }

  /**
   * Return an iteration of all the elements as `this` that aren't `null` or `undefined`.
   *
   * @remarks
   * This function is a shortcut to calling {@link PolyAsyncIterable.filter.(:FILTER_TYPEPRED) filter} with a type
   * predicate function that correctly filters out `null` and `undefined` values from the iteration.  Note that other
   * falsy values will remain in the iteration, and that the return value is correctly typed to exclude
   * `null` and `undefined`.
   *
   * @returns A new {@link PolyAsyncIterable} that yields the same elements as `this`
   * except for `null` or `undefined` values
   */
  filterNotNullish (): PolyAsyncIterable<NonNullable<T>> {
    return this.filter(isNotNullish)
  }

  /**
   * Return an iteration of the result of calling `func(element)` for every element in `this`.
   *
   * @typeParam U - The return type of `func` and the generic type of the resulting iterable
   * @param func - A function that takes an element of `this` and returns something else
   * @param options - Options for concurrency of this operation
   * @returns A new {@link PolyAsyncIterable} that yields the results of calling `func(element)`
   * for every element of `this`
   */
  map<U> (func: AsyncIndexedMapping<T, U>, options: ConcurrencyOptions = {}): PolyAsyncIterable<U> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(mapGen(this.#iterable, func, options))
  }

  /**
   * Return an iteration of the pairs resulting of calling `func(element)` for every element in `this` and using it as
   * the first element of the pair (the *key*) and preserving the second (the *value*).
   *
   * @remarks
   * This method is only available for iterations of pairs.
   *
   * @typeParam U - The return type of `func` and the generic type of the resulting iterable
   * @param func - A function that takes an element of `this` and returns something else
   * @returns A new {@link PolySyncIterable} that yields the results of calling `func(element)`
   * for every element of `this` and using it to replace the keys
   */
  mapKeys<K1, K2, V> (
    this: PolyAsyncIterable<[K1, V]>,
    func: AsyncIndexedMapping<[K1, V], K2>,
    options: ConcurrencyOptions = {},
  ): PolyAsyncIterable<[K2, V]> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(
      mapGen(this.#iterable, async ([k, v], index) => [await func([k, v], index), v], options),
    )
  }

  /**
   * Return an iteration of the pairs resulting of calling `func(element)` for every element in `this` and using it as
   * the second element of the pair (the *value*) and preserving the first (the *key*).
   *
   * @remarks
   * This method is only available for iterations of pairs.
   *
   * @typeParam U - The return type of `func` and the generic type of the resulting iterable
   * @param func - A function that takes an element of `this` and returns something else
   * @returns A new {@link PolySyncIterable} that yields the results of calling `func(element)`
   * for every element of `this` and using it to replace the values
   */
  mapValues<K, V1, V2> (
    this: PolyAsyncIterable<[K, V1]>,
    func: AsyncIndexedMapping<[K, V1], V2>,
    options: ConcurrencyOptions = {},
  ): PolyAsyncIterable<[K, V2]> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(
      mapGen(this.#iterable, async ([k, v], index) => [k, await func([k, v], index)], options),
    )
  }

  /**
   * Return an iteration of the same elements as `this` after calling `func(element)` for all elements.
   *
   * @typeParam U - The return type of `func`
   * @param func - A function called for all elements
   * @param options - Options for concurrency of this operation
   * @returns A new {@link PolyAsyncIterable} that yields the same elements as `this`
   */
  tap (func: AsyncIndexedRunnable<T>, options: ConcurrencyOptions = {}): PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(tapGen(this.#iterable, func, options))
  }

  /**
   * Return an iteration of the yielded elements of the sub-iterables.
   *
   * @typeParam U - The type of the sub-iterable elements
   * @returns A new {@link PolyAsyncIterable} that will yield the elements of all sub-iterables
   */
  flatten<U> (this: PolyAsyncIterable<Iterable<U> | AsyncIterable<U>>): PolyAsyncIterable<U> {
    return new PolyAsyncIterable(flattenGen(this.#iterable))
  }

  /**
   * Return an iteration of the yielded elements of the sub-iterables.
   *
   * @remarks
   * This method is an alias of {@link PolyAsyncIterable.flatten}.
   *
   * @typeParam U - The type of the sub-iterable elements
   * @returns A new {@link PolyAsyncIterable} that will yield the elements of all sub-iterables
   */
  flat<U> (
    this: PolyAsyncIterable<Iterable<U> | AsyncIterable<U>>,
  ): PolyAsyncIterable<U> {
    return this.flatten()
  }

  /**
   * Return an iteration of elements of the sub-iterables that result from calling `func(element)`
   * for every element in `this`.
   *
   * @remarks
   * This method is equivalent to calling {@link PolyAsyncIterable.map | map(func)}
   * and then {@link PolyAsyncIterable.flatten | flatten()}
   *
   * @typeParam U - The type of the sub-iterables returned by `func`
   * @param func - A function that takes an element of `this` and returns an iterable
   * @param options - Options for concurrency of this operation
   * @returns A new {@link PolyAsyncIterable} that yields the elements of the subiterables that results from
   * calling `func(element)` for every element of `this`
   */
  flatMap<U> (
    func: AsyncIndexedMapping<T, Iterable<U> | AsyncIterable<U>>,
    options?: ConcurrencyOptions,
  ): PolyAsyncIterable<U> {
    return this.map(func, options).flatten()
  }

  /**
   * Return an iteration of arrays of size `num` (except possibly the last) containing
   * groupings of elements of `this` iteration.
   *
   * @remarks
   * All chunks except possibly the last one will have exactly `num` elements.  The last chunk will have less elements
   * if the number of elements in the iteration is not divisible by `num`.  No chunk will ever be returned empty or
   * have more than `num` elements.
   *
   * @param num - Size of the chunks
   * @returns A new {@link PolyAsyncIterable} that yields arrays of size `num` (except possibly the last) containing
   * groupings of elements of `this`
   */
  chunk (num: number): PolyAsyncIterable<Array<T>> {
    asserts.isPositiveInteger(num)
    return new PolyAsyncIterable(chunkGen(this.#iterable, num))
  }

  /**
   * Return an iteration of arrays with elements of this separated based on the result of calling `func(elements)`.
   *
   * @remarks
   * The chunking process works by keeping an open _current chunk_ and calling `func` to decide whether the next
   * element of the iteration will be part of the _current chunk_ or if it will be part of a new chunk.
   *
   * To do this, `func` will be called for every element of the iteration except the first, which will automatically
   * become part of the first chunk.  If `func` returns `true`, the element will be part of the current chunk, and
   * if it returns `false`, the _current chunk_ is closed and the element becomes the first element if the new
   * _current chunk_.
   * The arguments passed to `func` will be, in order:
   *   - `elem` - The element being currently processed
   *   - `lastElem` - The last element that was added to the current chunk
   *   - `firstElem` - The first element of the current chunk (might be the same as `lastElem`)
   *
   * All elements will be part of a chunk, and no chunk will ever be empty.
   *
   * @param func - A function that decides if an element is part of the current chunk or initiates a new one
   * @returns A new {@link PolyAsyncIterable} that yields arrays with the elements of `this` as separated by `func`
   */
  chunkWhile (func: AsyncChunkingPredicate<T>): PolyAsyncIterable<Array<T>> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(chunkWhileGen(this.#iterable, func))
  }

  /**
   * Return an iteration of group pairs, where the first element is a _group key_ and the second is an iterable of all
   * the elements for which `func(element)` returned the key.
   *
   * @remarks
   * This method is intended to be combined with {@link PolyAsyncIterable.toObject | toObject}
   * or {@link PolyAsyncIterable.toMap | toMap}, thus behaving like
   * {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/groupBy | Array.groupBy} and
   * {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/groupByToMap | Array.groupByToMap}
   * respectively, but without losing the ablity to further process the iteration, such as by mapping, filtering, etc.
   *
   * @typeParam K - Type of the keys used to group elements
   * @param func - A function that returns the grouping key of each element
   * @param options - Options for concurrency of this operation
   * @returns A new {@link PolyAsyncIterable} of group pairs with the key and the group
   */
  groupBy<K> (func: AsyncIndexedMapping<T, K>, options: ConcurrencyOptions = {}): PolyAsyncIterable<[K, Array<T>]> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(groupByGen(this.#iterable, func, options))
  }

  /**
   * Return an iteration of unique elements, where two elements are considered equal if the result of `func(element)` is
   * the same for both elements.
   *
   * @remarks
   * Note that the first element seen with a specific key is always the one yielded, and every other element afterwards
   * is ignored.
   *
   * If no key-mapping function is given, the elements theselves are used as keys.
   * This is likely _not_ what you want in most situations unless elements are primitive types.
   *
   * @param func - A function that returns a _key_ used for uniqueness checks.
   * If not passed, an identitity function is used.
   * @param options - Options for concurrency of this operation
   * @returns A new {@link PolyAsyncIterable} only elements for which `func(element)` returns a value that hasn't
   * been seen before
   */
  unique (
    func: AsyncIndexedMapping<T, unknown> = asyncIdentity,
    options: ConcurrencyOptions = {},
  ): PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(uniqueGen(this.#iterable, func, options))
  }

  /**
   * Return an iteration of the elements of `this` in reverse order.
   *
   * @remarks
   * This method will buffer _all_ elements of the iteration, and yield them all at once at the end
   *
   * @returns A new {@link PolyAsyncIterable} that yields the elements of `this` in reverse order
   */
  reverse (): PolyAsyncIterable<T> {
    return new PolyAsyncIterable(reverseGen(this.#iterable))
  }

  /**
   * Return an iteration of the elements of `this` sorted according to `func`
   *
   * @remarks
   * The sort function `func` is used to call
   * {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | Array.sort}
   * on an array of all the elements.
   * However, the default comparator function will sort elements according to the `<` and `>` operators defined on
   * their own type, of always sorting lexicagraphically like
   * {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/sort | Array.sort}
   * does.
   *
   * This method will buffer _all_ elements of the iteration, and yield them all at once at the end
   *
   * @param func - A comparator function
   * @returns A new {@link PolyAsyncIterable} that yields the elements of `this` sorted according to `func`
   */
  sort (func: Comparator<T> = comparator): PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(sortGen(this.#iterable, func))
  }

  /**
   * Return an array of all elements of this iteration in the same order that were yielded.
   *
   * @returns A promise to an array that contains the same elements as this iteration, in the same order
   */
  async toArray (): Promise<Array<T>> {
    const array = []
    for await (const elem of this) {
      array.push(elem)
    }
    return array
  }

  /**
   * Splits this iteration into two arrays, one with elements for which `func(element)` returns `true` (the _truthy
   * elements_) and one for which it returns `false` (the _falsy elements_).
   *
   * @remarks
   * The array of _truthy elements_ has its element type narrowed to the type asserted by `func`.
   *
   * @typeParam U - The type asserted by `func`
   * @param func - A function that will be called for all elements to split them into the result arrays
   * @param options - Options for concurrency of this operation
   * @returns A promise to a tuple with the array of values for which `func` returned `true` as the first element, and
   * the array of values for which `func` returned `false` as the second element.
   */
  async toPartitionArrays<U extends T> (
    func: IndexedTypePredicate<T, U>,
    options?: ConcurrencyOptions,
  ): Promise<[Array<U>, Array<Exclude<T, U>>]>

  /**
   * Splits this iteration into two arrays, one with elements for which `func(element)` returns `true` (the _truthy
   * elements_) and one for which it returns `false` (the _falsy elements_).
   *
   * @param func - A function that will be called for all elements to split them into the result arrays
   * @param options - Options for concurrency of this operation
   * @returns A promise to a tuple with the array of values for which `func` returned `true` as the first element, and
   * the array of values for which `func` returned `false` as the second element.
   */
  async toPartitionArrays (func: AsyncIndexedPredicate<T>, options?: ConcurrencyOptions): Promise<[Array<T>, Array<T>]>

  async toPartitionArrays<U extends T> (
    func: AsyncIndexedPredicate<T> | IndexedTypePredicate<T, U>,
    options: ConcurrencyOptions = {},
  ): Promise<[Array<U | T>, Array<T | Exclude<T, U>>]> {
    const trues: Array<U | T> = []
    const falses: Array<T | Exclude<T, U>> = []

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const elem of concIter) {
      if (elem.mapped) {
        trues.push(elem.original)
      } else {
        falses.push(elem.original)
      }
    }

    return [trues, falses]
  }

  /**
   * Return an object made from the entries of `this`.
   * This method is roughly equivalent to calling `Object.fromEntires(iter.toArray())`.
   *
   * @remarks
   * This method is only available for iterations of pairs where the first component is a valid object key type.
   *
   * @returns A promise to an object composed of the entries yielded by this iterable.
   */
  async toObject<K extends PropertyKey, V> (
    this: PolyAsyncIterable<[K, V] | readonly [K, V]>,
  ): Promise<Record<K, V>> {
    const object = {} as Record<K, V>
    for await (const [key, value] of this.#iterable) {
      object[key] = value
    }
    return object
  }

  /**
   * Return a `Map` made from the entries of `this`.
   * This method is roughly equivalent to calling `new Map(iter.toArray())`.
   *
   * @remarks
   * This method is only available for iterations of pairs where the first component is a valid object key type.
   *
   * @returns A promise to a `Map` composed of the entries yielded by this iterable.
   */
  async toMap<K, V> (this: PolyAsyncIterable<[K, V] | readonly [K, V]>): Promise<Map<K, V>> {
    const map = new Map<K, V>()

    const iterable = this.#iterable
    for await (const [key, value] of iterable) {
      map.set(key, value)
    }

    return map
  }

  /**
   * Returns the first element for which `func(element)` returns `true`, or `undefined` if it never does.
   *
   * @remarks
   * `func` will be called on elements of this iteration until it returns `true`, and then not called again.
   *
   * The return type of this function is narrowed to the type asserted by `func`.
   *
   * @typeParam U - The type asserted by `func`
   * @param func - A type predicate called for elements of `this`
   * @param options - Options for concurrency of this operation
   * @returns A promise to the first element of the iteration for which `func` returned `true`
   */
  async find<U extends T> (func: IndexedTypePredicate<T, U>, options?: ConcurrencyOptions): Promise<U | undefined>

  /**
   * Returns the first element for which `func(element)` returns `true`, or `undefined` if it never does.
   *
   * @remarks
   * `func` will be called on elements of this iteration until it returns `true`, and then not called again.
   *
   * @param func - A boolean returning function called for elements of `this`
   * @param options - Options for concurrency of this operation
   * @returns A promise to the first element of the iteration for which `func` returned `true`
   */
  async find (func: AsyncIndexedPredicate<T>, options?: ConcurrencyOptions): Promise<T | undefined>

  async find<U extends T> (
    func: AsyncIndexedPredicate<T> | IndexedTypePredicate<T, U>,
    options: ConcurrencyOptions = {},
  ): Promise<T | U | undefined> {
    asserts.isFunction(func)

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const elem of concIter) {
      if (elem.mapped) {
        return elem.original
      }
    }

    return undefined
  }


  /**
   * Returns the last element for which `func(element)` returns `true`, or `undefined` if it never does.
   *
   * @remarks
   * `func` will be called on *all* of this iteration, and the result will not be returned until the iteration ends.
   *
   * The return type of this function is narrowed to the type asserted by `func`.
   *
   * @typeParam U - The type asserted by `func`
   * @param func - A type predicate called for elements of `this`
   * @param options - Options for concurrency of this operation
   * @returns A promise to the last element of the iteration for which `func` returned `true`
   */
  async findLast<U extends T> (func: IndexedTypePredicate<T, U>, options?: ConcurrencyOptions): Promise<U | undefined>

  /**
   * Returns the last element for which `func(element)` returns `true`, or `undefined` if it never does.
   *
   * @remarks
   * `func` will be called on *all* of this iteration, and the result will not be returned until the iteration ends.
   *
   * @param func - A boolean returning function called for elements of `this`
   * @param options - Options for concurrency of this operation
   * @returns A promise to the last element of the iteration for which `func` returned `true`
   */
  async findLast (func: AsyncIndexedPredicate<T>, options?: ConcurrencyOptions): Promise<T | undefined>

  async findLast<U extends T> (
    func: AsyncIndexedPredicate<T> | IndexedTypePredicate<T, U>,
    options: ConcurrencyOptions = {},
  ): Promise<T | U | undefined> {
    asserts.isFunction(func)

    let found: T | undefined

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const elem of concIter) {
      if (elem.mapped) {
        found = elem.original
      }
    }

    return found
  }

  /**
   * Returns the index of the first element for which `func(element)` returns `true`, or `-1` if it never does.
   *
   * @remarks
   * `func` will be called on elements of this iteration until it returns `true`, and then not called again.
   *
   * Note that this method is rather useless given that iterables are single-use and have no indexing capabilities,
   * but it's here for completion and consistency with `Array`.
   *
   * @param func - A boolean returning function called for elements of `this`
   * @param options - Options for concurrency of this operation
   * @returns A promise the index of the first element of the iteration for which `func` returned `true`
   */
  async findIndex (func: AsyncIndexedPredicate<T>, options: ConcurrencyOptions = {}): Promise<number> {
    asserts.isFunction(func)

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const elem of concIter) {
      if (elem.mapped) {
        return elem.index
      }
    }

    return -1
  }

  /**
   * Returns the index of the last element for which `func(element)` returns `true`, or `-1` if it never does.
   *
   * @remarks
   * `func` will be called on *all* of this iteration, and the result will not be returned until the iteration ends.
   *
   * Note that this method is rather useless given that iterables are single-use and have no indexing capabilities,
   * but it's here for completion and consistency with `Array`.
   *
   * @param func - A boolean returning function called for elements of `this`
   * @param options - Options for concurrency of this operation
   * @returns A promise the index of the last element of the iteration for which `func` returned `true`
   */
  async findLastIndex (func: AsyncIndexedPredicate<T>, options: ConcurrencyOptions = {}): Promise<number> {
    asserts.isFunction(func)
    let foundIndex = -1

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const elem of concIter) {
      if (elem.mapped) {
        foundIndex = elem.index
      }
    }

    return foundIndex
  }

  /**
   * Returns whether an element is present in this iteration.
   *
   * @remarks
   * If the element is found in the iteration, no more elements are iterated.
   *
   * @param obj - The element to search in the iteration
   * @returns A promise to whether `obj` is present in this iteration or not
   */
  async includes (obj: T): Promise<boolean> {
    for await (const elem of this.#iterable) {
      if (Object.is(obj, elem) || (obj === elem)) {
        return true
      }
    }

    return false
  }

  /**
   * Returns `true` if calling `func(element)` returns `true` for at least one element, and `false` otherwise
   *
   * @remarks
   * If a call to `func(element)` returns `true`, no more elements are iterated.
   *
   * @param func - A function to be called on the elements of the iteration
   * @param options - Options for concurrency of this operation
   * @returns A promise to whether calling `func` returned `true` on at least one element.
   */
  async some (func: AsyncIndexedPredicate<T>, options: ConcurrencyOptions = {}): Promise<boolean> {
    asserts.isFunction(func)

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const item of concIter) {
      if (item.mapped) {
        return true
      }
    }

    return false
  }

  /**
   * Returns `true` if calling `func(element)` returns `true` for every element, and `false` otherwise
   *
   * @remarks
   * If a call to `func(element)` returns `false`, no more elements are iterated.
   *
   * @param func - A function to be called on the elements of the iteration
   * @param options - Options for concurrency of this operation
   * @returns A promise to whether calling `func` returned `true` for all elements.
   */
  async every (func: AsyncIndexedPredicate<T>, options: ConcurrencyOptions = {}): Promise<boolean> {
    asserts.isFunction(func)

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const item of concIter) {
      if (!item.mapped) {
        return false
      }
    }

    return true
  }

  /**
   * Returns the result of calling the passed `reducer` for all elements of the iteration and the result of the
   * previous call to `reducer`, starting by passing `init` or, if not present, the first element of the iteration.
   *
   * @remarks
   * If the `init` argument is not present, at least one element must be present in the iteration, else an error will
   * be thrown
   *
   * `reducer` will be called with the accumulated result, the next element of the iteration, and the index of the
   * iteration.  The resolved return value will be the value passed to the next call as the first argument, or the
   * value returned if no more elements remain.
   *
   * @param reducer - A function to call for all elements with the result of a previous call
   * @param init - First element to be passed to the `reducer` function
   * @returns A promise the result to continually call `reducer` with all elements and the previous result
   */
  async reduce (reducer: AsyncIndexedReducer<T, T>, init?: T): Promise<T>

  /**
   * Returns the result of calling the passed `reducer` for all elements of the iteration and the result of the
   * previous call to `reducer`, starting by passing `init`.
   *
   * @remarks
   * `reducer` will be called with the accumulated result, the next element of the iteration, and the index of the
   * iteration.  The resolved return value will be the value passed to the next call as the first argument, or the
   * value returned if no more elements remain.
   *
   * @param reducer - A function to call for all elements with the result of a previous call
   * @param init - First element to be passed to the `reducer` function
   * @returns A promise the result to continually call `reducer` with all elements and the previous result
   */
  async reduce<U> (reducer: AsyncIndexedReducer<T, U>, init: U): Promise<U>

  async reduce<U> (reducer: AsyncIndexedReducer<T, U>, init?: U): Promise<U> {
    asserts.isFunction(reducer)

    let accumulated: U | undefined = init
    let isFirst = (accumulated === undefined)

    let idx = 0
    for await (const elem of this.#iterable) {
      accumulated = isFirst ? (elem as unknown as U) : await reducer(accumulated!, elem, idx)

      isFirst = false
      idx++
    }

    if (isFirst) {
      throw new TypeError('Reduce of empty iteration with no initial value')
    }

    return accumulated!
  }


  /**
   * Return the number of elements on this iteration.
   *
   * @returns A promise to the number of elements in this iteration
   */
  async count (): Promise<number> {
    let count = 0

    for await (const _ of this.#iterable) {
      count++
    }

    return count
  }


  /**
   * Call a function for each element of `this` iteration.
   *
   * @param func - A function to be called for every element of the iteration
   * @param options - Options for concurrency of this operation
   * @returns A promise that will resolve when all calls have resolved
   */
  async forEach (func: AsyncIndexedRunnable<T>, options: ConcurrencyOptions = {}): Promise<void> {
    asserts.isFunction(func)

    const concIter = new ConcurrentMapper(this.#iterable, func, options)
    for await (const _elem of concIter) {
      /* do nothing, func was called on mapper */
    }
  }

  /**
   * Return the result of joining the elements of `this` with the given `glue`, or `','` if no glue is given.
   *
   * @remarks
   * `null` or `undefined` elements are treated as empty strings.
   *
   * @param glue - The string to use for joining the elements
   * @param options - Options for concurrency of this operation
   * @returns A promise to a string concatenating all elements of `this` using the given `glue`
   */
  async join (glue: string = ',', options: ConcurrencyOptions = {}): Promise<string> {
    let str = ''
    let first = true

    const concIter = new ConcurrentMapper(this.#iterable, NOOP, options)
    for await (const elem of concIter) {
      str += (first ? '' : glue) + (elem.mapped ?? '')
      first = false
    }

    return str
  }

  /**
   * Perform this iteration doing nothing.
   *
   * @param options - Options for concurrency of this operation
   * @returns a promise that will resolve when the iteration is done
   */
  async complete (options: ConcurrencyOptions = {}): Promise<void> {
    /* eslint-disable-next-line no-unused-vars */
    const concIter = new ConcurrentMapper(this.#iterable, NOOP, options)
    for await (const _elem of concIter) {
      /* do nothing, just iterate */
    }
  }


  /**
   * Returns a tuple containing `num` iterables that will yield independent
   * copies of the elements yielded by `this`.
   *
   * @remarks
   * Note that, as with every other method of this class, this instance is unusable after calling this method.
   *
   * In order to provide a truly independent iteration for all returned iterables, a buffer is kept, which can grow as
   * big as the whole iteration in certain circumstances.  The buffer is filled as fast as the fastest iterable requests
   * new items, and emptied as fast as the slowest iterable consumes those items.
   *
   * @param num - the number of copies to be returned
   * @returns An array of `num` elements containing independent copies of this iterable
   */
  duplicate<N extends number> (num: N): Tuple<PolyAsyncIterable<T>, N> {
    asserts.isNonNegativeInteger(num)

    const it = this[Symbol.asyncIterator]()

    let offsIndex = 0 // index offset for when the buffer is shrunk
    const buffer: Array<{item: IteratorResult<T, never>, pending: number}> = []

    async function * generator (): AsyncIterable<T> {
      let currIndex = 0
      while (true) {
        const index = currIndex - offsIndex

        if (buffer[index] == null) {
          const item = await it.next() as IteratorResult<T, never>
          buffer[index] = {item, pending: num}
        }

        if (buffer[index].item.done) {
          return
        }

        currIndex += 1
        buffer[index].pending -= 1
        yield buffer[index].item.value

        while (buffer.length > 0 && buffer[0].pending <= 0 && !buffer[0].item.done) {
          buffer.shift()
          offsIndex += 1
        }
      }
    }

    return Array(num).fill(null).map(() => new PolyAsyncIterable(generator())) as Tuple<PolyAsyncIterable<T>, N>
  }
}
