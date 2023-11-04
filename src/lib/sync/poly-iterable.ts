import {
  ChunkingPredicate,
  Comparator,
  IndexedMapping,
  IndexedPredicate,
  IndexedReducer,
  IndexedRunnable,
  IndexedTypePredicate,
  Tuple,
} from '../types.js'

import {
  appendGen,
  chunkGen,
  chunkWhileGen,
  dropGen,
  dropLastGen,
  dropWhileGen,
  filterGen,
  flattenGen,
  groupByGen,
  mapGen,
  prependGen,
  reverseGen,
  sliceGen,
  sortGen,
  takeGen,
  takeLastGen,
  takeWhileGen,
  tapGen,
  uniqueGen,
} from './generators.js'

import {comparator, asserts, identity, isNotNullish} from '../utils.js'
import PolyAsyncIterable from '../async/poly-iterable.js'

/**
 * A `SyncIterable<T>` with a suite of methods for transforming the iteration into other iterations or to get a single
 * result from it.
 *
 * The methods of this class are intended to resemble those of `Array`, with added utilities where appropriate and made
 * for any kind of iterable.
 *
 * @public
 */
export default class PolySyncIterable<T> implements Iterable<T> {
  #iterable: Iterable<T>

  /** @internal */
  constructor (iterable: Iterable<T>) {
    this.#iterable = iterable
  }


  /**
   * Allows this class to work as a regular `Iterable<T>`
   *
   * @returns an iterable that will yield the same elements as the iterable used to create this instance
   */
  * [Symbol.iterator] (): Iterator<T, void, undefined> {
    yield * this.#iterable
  }

  /**
   * Return an async version of this same iteration.
   *
   * @returns A {@link PolyAsyncIterable} that yields the same elements as `this`
   */
  async (): PolyAsyncIterable<T> {
    const syncIterable = this.#iterable
    const asyncIterable = {
      async * [Symbol.asyncIterator] (): AsyncIterator<T> {
        yield * syncIterable
      },
    }
    return new PolyAsyncIterable<T>(asyncIterable)
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
   * @returns a new {@link PolySyncIterable} that yields the elements of `this` and then the elements of `other`
   */
  append<U> (other: Iterable<U>): PolySyncIterable<T | U> {
    asserts.isSyncIterable(other)
    return new PolySyncIterable(appendGen(this.#iterable, other))
  }

  /**
   * Return a new iteration that will iterate over `this`, then over `other`.
   *
   * @remarks
   * This method is an alias for {@link PolySyncIterable.append}.
   *
   * @typeParam U - Type of the elements to be appended
   * @param other - Iterable to be appended
   * @returns a new {@link PolySyncIterable} that yields the elements of `this` and then the elements of `other`
   */
  concat<U> (other: Iterable<U>): PolySyncIterable<T | U> {
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
   * @returns a new {@link PolySyncIterable} that yields the elements of `other` and then the elements of `this`
   */
  prepend<U> (other: Iterable<U>): PolySyncIterable<T | U> {
    asserts.isSyncIterable(other)
    return new PolySyncIterable(prependGen(this.#iterable, other))
  }


  /**
   * Return a new iteration that skips the first `num` elements.  If there were less than `num` elements in the
   * iteration, no elements are yielded.
   *
   * @param num - The number of elements to skip
   * @returns a new {@link PolySyncIterable} that yields the same the elements of `this`, except for the first
   * `num` elements
   */
  drop (num: number = 0): PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(dropGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that iterates only over the first `num` elements.  If there were less than than `num`
   * elements in the iteration, all elements are yielded with no additions.
   *
   * @param num - The number of elements to yield
   * @returns a new {@link PolySyncIterable} that yields the first `num` elements elements of `this`
   */
  take (num: number = 0): PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(takeGen(this.#iterable, num))
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
   * @returns a new {@link PolySyncIterable} that yields the same the elements of `this`, except for the last
   * `num` elements
   */
  dropLast (num: number = 0): PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(dropLastGen(this.#iterable, num))
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
   * @returns a new {@link PolySyncIterable} that yields the last `num` elements elements of `this`
   */
  takeLast (num: number = 0): PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(takeLastGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that skips the first few elements for which `func(element)` returns `true`.
   *
   * @param func - The function to call on the elements
   * @returns a new {@link PolySyncIterable} that yields the same the elements of `this`, excepts the first few for
   * which`func(element)` returns `true`
   */
  dropWhile (func: IndexedPredicate<T>): PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(dropWhileGen(this.#iterable, func))
  }

  /**
   * Return a new iteration that yields the first few elements for which `func(element)` returns `true`.
   *
   * @remarks
   * Because the `func` argument is a type predicate, the result iteration will have the type asserted by `func`.
   *
   * @param func - The function to call on the elements
   * @returns a new {@link PolySyncIterable} that yields the same the elements of `this` as long as `func(element)`
   * returns `true`, correctly narrowed to the type asserted by `func`
   */
  takeWhile<U extends T> (func: IndexedTypePredicate<T, U>): PolySyncIterable<U>

  /**
   * Return a new iteration that yields the first few elements for which `func(element)` returns `true`.
   *
   * @param func - The function to call on the elements
   * @returns a new {@link PolySyncIterable} that yields the same the elements of `this` as long as `func(element)`
   * returns `true`
   */
  takeWhile (func: IndexedPredicate<T>): PolySyncIterable<T>

  takeWhile<U extends T> (func: IndexedPredicate<T> | IndexedTypePredicate<T, U>): PolySyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolySyncIterable(takeWhileGen(this.#iterable, func))
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
   * @returns a new {@link PolySyncIterable} that yields the elements going that starts from the `start`th element
   * (included) and ends at the `end`th element (excluded) of `this`
   */
  slice (start: number, end?: number): PolySyncIterable<T> {
    asserts.isInteger(start, 'start')
    asserts.isInteger(end ?? 0, 'end')
    return new PolySyncIterable(sliceGen(this.#iterable, start, end))
  }

  /**
   * Return an iteration of the elements of `this` for which `func(element)` returns `true`.
   *
   * @remarks
   * Because the `func` argument is a type predicate, the result iteration will have the type asserted by `func`.
   *
   * @typeParam U - The type asserted by `func`, if any
   * @param func - The function to be called on all elements
   * @returns A new {@link PolySyncIterable} with only elements for which `func(element)` returned true, correctly
   * narrowed to the type asserted by `func`
   *
   * {@label FILTER_TYPEPRED}
   */
  filter<U extends T> (func: IndexedTypePredicate<T, U>): PolySyncIterable<U>

  /**
   * Return an iteration of the elements of `this` for which `func(element)` returns `true`.
   *
   * @param func - The function to be called on all elements
   * @returns A new {@link PolySyncIterable} with only elements for which `func(element)` returned true
   */
  filter (func: IndexedPredicate<T>): PolySyncIterable<T>

  filter<U extends T> (func: IndexedPredicate<T> | IndexedTypePredicate<T, U>): PolySyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolySyncIterable(filterGen(this.#iterable, func))
  }


  /**
   * Return an iteration of all the elements as `this` that aren't `null` or `undefined`.
   *
   * @remarks
   * This function is a shortcut to calling {@link PolySyncIterable.filter.(:FILTER_TYPEPRED)} with a type predicate
   * function that correctly filters out `null` and `undefined` values from the iteration.  Note that other falsy values
   * will remain in the iteration, and that the return value is correctly typed to exclude `null` and `undefined`.
   *
   * @returns A new {@link PolySyncIterable} that yields the same elements as `this`
   * except for `null` or `undefined` values
   */
  filterNotNullish (): PolySyncIterable<NonNullable<T>> {
    return this.filter(isNotNullish)
  }


  /**
   * Return an iteration of the result of calling `func(element)` for every element in `this`.
   *
   * @typeParam U - The return type of `func` and the generic type of the resulting iterable
   * @param func - A function that takes an element of `this` and returns something else
   * @returns A new {@link PolySyncIterable} that yields the results of calling `func(element)`
   * for every element of `this`
   */
  map<U> (func: IndexedMapping<T, U>): PolySyncIterable<U> {
    asserts.isFunction(func)
    return new PolySyncIterable(mapGen(this.#iterable, func))
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
  mapKeys<K1, K2, V> (this: PolySyncIterable<[K1, V]>, func: IndexedMapping<[K1, V], K2>): PolySyncIterable<[K2, V]> {
    asserts.isFunction(func)
    return new PolySyncIterable(mapGen(this.#iterable, ([k, v], index) => [func([k, v], index), v]))
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
  mapValues<K, V1, V2> (this: PolySyncIterable<[K, V1]>, func: IndexedMapping<[K, V1], V2>): PolySyncIterable<[K, V2]> {
    asserts.isFunction(func)
    return new PolySyncIterable(mapGen(this.#iterable, ([k, v], index) => [k, func([k, v], index)]))
  }

  /**
   * Return an iteration of the same elements as `this` after calling `func(element)` for all elements.
   *
   * @typeParam U - The return type of `func`
   * @param func - A function called for all elements
   * @returns A new {@link PolySyncIterable} that yields the same elements as `this`
   */
  tap (func: IndexedRunnable<T>): PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(tapGen(this.#iterable, func))
  }

  /**
   * Return an iteration of the yielded elements of the sub-iterables.
   *
   * @typeParam U - The type of the sub-iterable elements
   * @returns A new {@link PolySyncIterable} that will yield the elements of all sub-iterables
   */
  flatten<U> (this: PolySyncIterable<Iterable<U>>): PolySyncIterable<U> {
    return new PolySyncIterable(flattenGen(this.#iterable))
  }

  /**
   * Return an iteration of the yielded elements of the sub-iterables.
   *
   * @remarks
   * This method is an alias of {@link PolySyncIterable.flatten}.
   *
   * @typeParam U - The type of the sub-iterable elements
   * @returns A new {@link PolySyncIterable} that will yield the elements of all sub-iterables
   */
  flat<U> (this: PolySyncIterable<Iterable<U>>): PolySyncIterable<U> {
    return this.flatten()
  }

  /**
   * Return an iteration of elements of the sub-iterables that result from calling `func(element)`
   * for every element in `this`.
   *
   * @remarks
   * This method is equivalent to calling {@link PolySyncIterable.map | map(func)}
   * and then {@link PolySyncIterable.flatten | flatten()}
   *
   * @typeParam U - The type of the sub-iterables returned by `func`
   * @param func - A function that takes an element of `this` and returns an iterable
   * @returns A new {@link PolySyncIterable} that yields the elements of the subiterables that results from
   * calling `func(element)` for every element of `this`
   */
  flatMap<U> (func: IndexedMapping<T, Iterable<U>>): PolySyncIterable<U> {
    return this.map(func).flatten()
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
   * @returns A new {@link PolySyncIterable} that yields arrays of size `num` (except possibly the last) containing
   * groupings of elements of `this`
   */
  chunk (num: number = 1): PolySyncIterable<Array<T>> {
    asserts.isPositiveInteger(num)
    return new PolySyncIterable(chunkGen(this.#iterable, num))
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
   * @returns A new {@link PolySyncIterable} that yields arrays with the elements of `this` as separated by `func`
   */
  chunkWhile (func: ChunkingPredicate<T>): PolySyncIterable<Array<T>> {
    asserts.isFunction(func)
    return new PolySyncIterable(chunkWhileGen(this.#iterable, func))
  }

  /**
   * Return an iteration of group pairs, where the first element is a _group key_ and the second is an iterable of all
   * the elements for which `func(element)` returned the key.
   *
   * @remarks
   * This method is intended to be combined with {@link PolySyncIterable.toObject | toObject}
   * or {@link PolySyncIterable.toMap | toMap}, thus behaving like
   * {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/groupBy | Array.groupBy} and
   * {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Array/groupByToMap | Array.groupByToMap}
   * respectively, but without losing the ablity to further process the iteration, such as by mapping, filtering, etc.
   *
   * @typeParam K - Type of the keys used to group elements
   * @param func - A function that returns the grouping key of each element
   * @returns A new {@link PolySyncIterable} of group pairs with the key and the group
   */
  groupBy<K> (func: IndexedMapping<T, K>): PolySyncIterable<[K, Array<T>]> {
    asserts.isFunction(func)
    return new PolySyncIterable(groupByGen(this.#iterable, func))
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
   * @returns A new {@link PolySyncIterable} only elements for which `func(element)` returns a value that hasn't
   * been seen before
   */
  unique (func: IndexedMapping<T, unknown> = identity): PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(uniqueGen(this.#iterable, func))
  }

  /**
   * Return an iteration of the elements of `this` in reverse order.
   *
   * @remarks
   * This method will buffer _all_ elements of the iteration, and yield them all at once at the end
   *
   * @returns A new {@link PolySyncIterable} that yields the elements of `this` in reverse order
   */
  reverse (): PolySyncIterable<T> {
    return new PolySyncIterable(reverseGen(this.#iterable))
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
   * @returns A new {@link PolySyncIterable} that yields the elements of `this` sorted according to `func`
   */
  sort (func: Comparator<T> = comparator): PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(sortGen(this.#iterable, func))
  }

  /**
   * Return an array of all elements of this iteration in the same order that were yielded.
   *
   * @returns An array that contains the same elements as this iteration, in the same order
   */
  toArray (): Array<T> {
    return Array.from(this)
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
   * @returns A tuple with the array of values for which `func` returned `true` as the first element, and the array of
   * values for which `func` returned `false` as the second element.
   */
  toPartitionArrays<U extends T> (func: IndexedTypePredicate<T, U>): [Array<U>, Array<Exclude<T, U>>]

  /**
   * Splits this iteration into two arrays, one with elements for which `func(element)` returns `true` (the _truthy
   * elements_) and one for which it returns `false` (the _falsy elements_).
   *
   * @param func - A function that will be called for all elements to split them into the result arrays
   * @returns A tuple with the array of values for which `func` returned `true` as the first element, and the array of
   * values for which `func` returned `false` as the second element.
   */
  toPartitionArrays (func: IndexedPredicate<T>): [Array<T>, Array<T>]

  toPartitionArrays<U extends T> (
    func: IndexedPredicate<T> | IndexedTypePredicate<T, U>,
  ): [Array<U | T>, Array<T | Exclude<T, U>>] {
    const trues: Array<U | T> = []
    const falses: Array<T | Exclude<T, U>> = []

    let idx = 0
    for (const elem of this.#iterable) {
      if (func(elem, idx++)) {
        trues.push(elem)
      } else {
        falses.push(elem)
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
   * @returns An object composed of the entries yielded by this iterable.
   */
  toObject<K extends PropertyKey, V> (this: PolySyncIterable<[K, V] | readonly [K, V]>): Record<K, V> {
    const object = {} as Record<K, V>

    for (const [key, value] of this.#iterable) {
      object[key] = value
    }

    return object
  }

  /**
   * Return a `Map` made from the entries of `this`.
   * This method is roughly equivalent to calling `new Map(iter.toArray())`.
   *
   * @remarks
   * This method is only available for iterations of pairs.
   *
   * @returns A `Map` composed of the entries yielded by this iterable.
   */
  toMap<K, V> (this: PolySyncIterable<[K, V] | readonly [K, V]>): Map<K, V> {
    const map = new Map<K, V>()

    for (const [key, value] of this.#iterable) {
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
   * @returns The first element of the iteration for which `func` returned `true`
   */
  find<U extends T> (func: IndexedTypePredicate<T, U>): U | undefined

  /**
   * Returns the first element for which `func(element)` returns `true`, or `undefined` if it never does.
   *
   * @remarks
   * `func` will be called on elements of this iteration until it returns `true`, and then not called again.
   *
   * @param func - A boolean returning function called for elements of `this`
   * @returns The first element of the iteration for which `func` returned `true`
   */
  find (func: IndexedPredicate<T>): T | undefined

  find<U extends T> (func: IndexedPredicate<T> | IndexedTypePredicate<T, U>): T | U | undefined {
    asserts.isFunction(func)
    let idx = 0
    for (const elem of this.#iterable) {
      if (func(elem, idx++)) {
        return elem
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
   * @returns The last element of the iteration for which `func` returned `true`
   */
  findLast<U extends T> (func: IndexedTypePredicate<T, U>): U | undefined

  /**
   * Returns the last element for which `func(element)` returns `true`, or `undefined` if it never does.
   *
   * @remarks
   * `func` will be called on *all* of this iteration, and the result will not be returned until the iteration ends.
   *
   * @param func - A boolean returning function called for elements of `this`
   * @returns The last element of the iteration for which `func` returned `true`
   */
  findLast (func: IndexedPredicate<T>): T | undefined

  findLast<U extends T> (func: IndexedPredicate<T> | IndexedTypePredicate<T, U>): T | U | undefined {
    asserts.isFunction(func)
    let found
    let idx = 0
    for (const elem of this.#iterable) {
      if (func(elem, idx++)) {
        found = elem
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
   * @returns The index of the first element of the iteration for which `func` returned `true`
   */
  findIndex (func: IndexedPredicate<T>): number {
    asserts.isFunction(func)
    let idx = 0
    for (const elem of this.#iterable) {
      if (func(elem, idx)) {
        return idx
      }
      idx++
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
   * @returns The index of the last element of the iteration for which `func` returned `true`
   */
  findLastIndex (func: IndexedPredicate<T>): number {
    asserts.isFunction(func)
    let foundIndex = -1
    let idx = 0
    for (const elem of this.#iterable) {
      if (func(elem, idx)) {
        foundIndex = idx
      }
      idx++
    }
    return foundIndex
  }

  indexOf (func: IndexedPredicate<T>): number {
    return Number.NaN
  }

  lastIndexOf (func: IndexedPredicate<T>): number {
    return Number.NaN
  }

  /**
   * Returns whether an element is present in this iteration.
   *
   * @remarks
   * If the element is found in the iteration, no more elements are iterated.
   *
   * @param obj - The element to search in the iteration
   * @returns Whether `obj` is present in this iteration or not
   */
  includes (obj: T): boolean {
    for (const elem of this.#iterable) {
      if (Object.is(obj, elem) || obj === elem) {
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
   * @returns Whether calling `func` returned `true` on at least one element.
   */
  some (func: IndexedPredicate<T>): boolean {
    asserts.isFunction(func)

    let idx = 0
    for (const item of this.#iterable) {
      if (func(item, idx++)) {
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
   * @returns Whether calling `func` returned `true` for all elements.
   */
  every (func: IndexedPredicate<T>): boolean {
    asserts.isFunction(func)

    let idx = 0
    for (const item of this.#iterable) {
      if (!func(item, idx++)) {
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
   * @returns The result to continually call `reducer` with all elements and the previous result
   */
  reduce (reducer: IndexedReducer<T, T>, init?: T): T

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
   * @returns The result to continually call `reducer` with all elements and the previous result
   */
  reduce<U> (reducer: IndexedReducer<T, U>, init: U): U

  reduce<U> (reducer: IndexedReducer<T, U>, init: T extends U ? (U | undefined) : U): U {
    asserts.isFunction(reducer)

    let accumulated: U | undefined = init
    let isFirst = (accumulated === undefined)
    let idx = 0

    for (const elem of this.#iterable) {
      accumulated = isFirst ? (elem as unknown as U) : reducer(accumulated as U, elem, idx++)
      isFirst = false
    }

    return accumulated as U
  }

  /**
   * Return the number of elements on this iteration.
   *
   * @returns The number of elements in this iteration
   */
  count (): number {
    let count = 0

    for (const _ of this.#iterable) {
      count++
    }

    return count
  }

  /**
   * Call a function for each element of `this` iteration.
   *
   * @param func - A function to be called for every element of the iteration
   */
  forEach (func: IndexedRunnable<T>): void {
    asserts.isFunction(func)

    let idx = 0
    for (const elem of this.#iterable) {
      func(elem, idx++)
    }
  }

  /**
   * Return the result of joining the elements of `this` with the given `glue`, or `','` if no glue is given.
   *
   * @remarks
   * `null` or `undefined` elements are treated as empty strings.
   *
   * @param glue - The string to use for joining the elements
   * @returns A string concatenating all elements of `this` using the given `glue`
   */
  join (glue: string = ','): string {
    let str = ''
    let first = true

    for (const elem of this.#iterable) {
      str += (first ? '' : glue) + (elem == null ? '' : elem)
      first = false
    }

    return str
  }

  /**
   * Perform this iteration doing nothing.
   */
  complete (): void {
    /* eslint-disable-next-line no-unused-vars */
    for (const elem of this.#iterable) {
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
   * new items, and emptied as fast as the slowest iterable requests new items.
   *
   * Note that for synchronous iterations, it's common to end up with a full buffer if the returned duplicated elements
   * are used in sequence.  In this situation, it might be more useful to simply convert the iteration to an array and
   * pass it around, rather than pay the overhead of this method.
   *
   * @param num - the number of copies to be returned
   * @returns An array of `num` elements containing independent copies of this iterable
   */
  duplicate<N extends number> (num: N): Tuple<PolySyncIterable<T>, N> {
    asserts.isNonNegativeInteger(num)

    const it = this[Symbol.iterator]()

    let offsIndex = 0 // index offset for when the buffer is shrunk
    const buffer: Array<{item: IteratorResult<T, never>, pending: number}> = []

    function * generator (): Iterable<T> {
      let currIndex = 0

      while (true) {
        const index = currIndex - offsIndex

        if (buffer[index] == null) {
          const item = it.next() as IteratorResult<T, never>
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

    return Array(num).fill(null).map(() => new PolySyncIterable(generator())) as Tuple<PolySyncIterable<T>, N>
  }
}
