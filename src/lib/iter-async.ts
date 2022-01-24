import {comparator, asserts, asyncIdentity, isNotNullish} from './utils.js'


type IndexedPredicate<T> = (elem : T, index : number) => boolean | PromiseLike<boolean>
type IndexedTypePredicate<T, U extends T> = (elem: T, index: number) => elem is U
type IndexedMapping<T, U> = (elem : T, index : number) => U | PromiseLike<U>
type IndexedRunnable<T> = (elem : T, index : number) => void | PromiseLike<void>
type IndexedReducer<T, U> = (acc : U, item : T, index : number) => U | PromiseLike<U>

type ChunkingPredicate<T> = (elem : T, lastElem : T, firstElem : T) => boolean | PromiseLike<boolean>
type Comparator<T> = (elemA : T, elemB : T) => number


function prefetchGen<T> (iterable : AsyncIterable<T>) : AsyncIterable<T> {
  const it = iterable[Symbol.asyncIterator]()
  let prom = it.next()

  return {
    [Symbol.asyncIterator] () {
      return {
        next () {
          const oldProm = prom
          prom = it.next()
          return oldProm
        },
      }
    },
  }
}


async function * appendGen<T, U> (
  iterA : Iterable<T> | AsyncIterable<T>,
  iterB : Iterable<U> | AsyncIterable<U>,
) : AsyncIterable<T | U> {
  yield * iterA
  yield * iterB
}

async function * prependGen<T, U> (
  iterA : Iterable<T> | AsyncIterable<T>,
  iterB : Iterable<U> | AsyncIterable<U>,
) : AsyncIterable<T | U> {
  yield * iterB
  yield * iterA
}

async function * dropGen<T> (iter : AsyncIterable<T>, num : number) : AsyncIterable<T> {
  let rem = num
  for await (const elem of iter) {
    if (rem-- <= 0) {
      yield elem
    }
  }
}

async function * takeGen<T> (iter : AsyncIterable<T>, num : number) : AsyncIterable<T> {
  let rem = num
  for await (const elem of iter) {
    if (rem-- <= 0) {
      return
    }
    yield elem
  }
}

async function * dropLastGen<T> (iter : AsyncIterable<T>, num : number) : AsyncIterable<T> {
  const buf = Array(num)
  let pos = 0
  let size = 0
  for await (const elem of iter) {
    if (size >= num) {
      yield num ? buf[pos] : elem
    } else {
      size++
    }
    if (num) {
      buf[pos] = elem
      pos = ((pos + 1) % num)
    }
  }
}

async function * takeLastGen<T> (iter : AsyncIterable<T>, num : number) : AsyncIterable<T> {
  const buf = Array(num)
  let pos = 0
  let size = 0
  for await (const elem of iter) {
    size = size >= num ? num : size + 1
    if (num) {
      buf[pos] = elem
      pos = ((pos + 1) % num)
    }
  }
  pos = size >= num ? pos : 0
  for (let i = 0; i < size; i++) {
    yield buf[pos]
    pos = ((pos + 1) % num)
  }
}

async function * dropWhileGen<T> (iter : AsyncIterable<T>, func : IndexedPredicate<T>) : AsyncIterable<T> {
  let idx = 0
  let yielding = false
  for await (const elem of iter) {
    if (yielding || !(await func(elem, idx++))) {
      yielding = true
      yield elem
    }
  }
}

async function * takeWhileGen<T> (iter : AsyncIterable<T>, func : IndexedPredicate<T>) : AsyncIterable<T> {
  let idx = 0
  for await (const elem of iter) {
    if (!(await func(elem, idx++))) {
      return
    }
    yield elem
  }
}


async function * sliceNegPosGen<T> (iter : AsyncIterable<T>, start : number, end : number) : AsyncIterable<T> {
  const buf = Array(start)
  let pos = 0
  let size = 0
  let num = end
  for await (const elem of iter) {
    if (size >= start && end) {
      num--
    }
    size = size >= start ? start : size + 1
    if (start) {
      buf[pos] = elem
      pos = ((pos + 1) % start)
    }
  }
  pos = size >= start ? pos : 0
  for (let i = 0; i < Math.min(size, num); i++) {
    yield buf[pos]
    pos = ((pos + 1) % start)
  }
}

function sliceGen<T> (iter : AsyncIterable<T>, start : number, end : number) : AsyncIterable<T> {
  if (start >= 0 && end >= 0) {
    return takeGen(dropGen(iter, start), end - start)
  } else if (start < 0 && end >= 0) {
    return sliceNegPosGen(iter, -start, end)
  } else if (start >= 0) { // && end < 0
    return dropLastGen(dropGen(iter, start), -end)
  } else { // start < 0 && end < 0
    return dropLastGen(takeLastGen(iter, -start), -end)
  }
}

function filterGen<T, U extends T> (iter : AsyncIterable<T>, func : IndexedTypePredicate<T, U>) : AsyncIterable<U>
function filterGen<T> (iter : AsyncIterable<T>, func : IndexedPredicate<T>) : AsyncIterable<T>

async function * filterGen<T, U extends T> (
  iter : AsyncIterable<T>,
  func : IndexedPredicate<T> | IndexedTypePredicate<T, U>,
) : AsyncIterable<T | U> {
  let idx = 0
  for await (const elem of iter) {
    if (await func(elem, idx++)) {
      yield elem
    }
  }
}

async function * mapGen<T, U> (iter : AsyncIterable<T>, func : IndexedMapping<T, U>) : AsyncIterable<U> {
  let idx = 0
  for await (const elem of iter) {
    yield await func(elem, idx++)
  }
}

async function * tapGen<T> (iter : AsyncIterable<T>, func : IndexedRunnable<T>) : AsyncIterable<T> {
  let idx = 0
  for await (const elem of iter) {
    await func(elem, idx++)
    yield elem
  }
}

async function * flattenGen<T> (iter : AsyncIterable<Iterable<T> | AsyncIterable<T>>) : AsyncIterable<T> {
  for await (const elem of iter) {
    yield * elem
  }
}

async function * chunkGen<T> (iter : AsyncIterable<T>, num : number) : AsyncIterable<Array<T>> {
  let chunk = []

  for await (const elem of iter) {
    chunk.push(elem)
    if (chunk.length === num) {
      yield chunk
      chunk = []
    }
  }

  if (chunk.length) {
    yield chunk
  }
}

async function * chunkWhileGen<T> (iter : AsyncIterable<T>, func : ChunkingPredicate<T>) : AsyncIterable<Array<T>> {
  let chunk : Array<T> = []

  for await (const elem of iter) {
    if (chunk.length === 0 || func(elem, chunk[chunk.length - 1], chunk[0])) {
      chunk.push(elem)
    } else {
      yield chunk
      chunk = [elem]
    }
  }

  if (chunk.length) {
    yield chunk
  }
}

async function * groupByGen<K, T> (
  iter : AsyncIterable<T>,
  func : IndexedMapping<T, K>,
) : AsyncIterable<[K, Array<T>]> {
  const groups: Map<K, Array<T>> = new Map()

  let idx = 0
  for await (const elem of iter) {
    const key = await func(elem, idx++)

    const group = groups.get(key) ?? []
    group.push(elem)

    groups.set(key, group)
  }

  yield * groups.entries()
}

async function * uniqueGen<T> (iter : AsyncIterable<T>, func : IndexedMapping<T, unknown>) : AsyncIterable<T> {
  const seen = new Set()

  let idx = 0
  for await (const elem of iter) {
    const key = await func(elem, idx++)
    if (!seen.has(key)) {
      yield elem
      seen.add(key)
    }
  }
}

async function * reverseGen<T> (iter : AsyncIterable<T>) : AsyncIterable<T> {
  const buf = []
  for await (const elem of iter) {
    buf.push(elem)
  }
  for (let i = buf.length - 1; i >= 0; i--) {
    yield buf[i]
  }
}

async function * sortGen<T> (iter : AsyncIterable<T>, func : Comparator<T>) : AsyncIterable<T> {
  const buf = []
  for await (const elem of iter) {
    buf.push(elem)
  }
  for await (const elem of buf.sort(func)) {
    yield elem
  }
}


/**
 *
 *
 * @public
 */
export default class PolyAsyncIterable<T> implements AsyncIterable<T> {
  #iterable : AsyncIterable<T>

  /** @internal */
  constructor (iterable : AsyncIterable<T>) {
    this.#iterable = iterable
  }

  /**
   * Allows this class to work as a regular `AsyncIterable<T>`
   *
   * @returns an async iterable that will yield the same elements as the iterable used to create this instance
   */
  async * [Symbol.asyncIterator] () {
    yield * this.#iterable
  }

  /**
   * Return the same iteration, but with its elements requested with anticipation to allow for asynchronous operations
   * to begin and reduce wait times.
   *
   * @remarks
   * Return a new {@link PolyAsyncIterable} that yields the same elements as `this`.  When yielding an element of
   * this iterable, the next one will be also requested internally, so that any asynchronous operations are started
   * before their results are needed.
   *
   * Note that after calling this mehtod, more elements than strictly needed might be requested from the previous
   * iterable, triggering any potential side effects.
   *
   * @returns a new {@link PolyAsyncIterable} that prefetched the iterated elementsd
   */
  prefetch () : PolyAsyncIterable<T> {
    return new PolyAsyncIterable(prefetchGen(this.#iterable))
  }

  /**
   * Return a new iteration that will iterate over `this`, then over `other`.
   *
   * @remarks
   * Return a new {@link PolyAsyncIterable} that yields the same elements as `this`, then the same elements as `other`.
   * The resulting iteration is of the combined generic type of `this` and `other`, allowing this method to merge the
   * types of two distinct iterables.
   *
   * @typeParam U - Type of the elements to be appended
   * @param other - Iterable to be appended
   * @returns a new {@link PolyAsyncIterable} that yields the elements of `this` and then the elements of `other`
   */
  append<U> (other : Iterable<U> | AsyncIterable<U>) : PolyAsyncIterable<T | U> {
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
   * @returns a new {@link PolyAsyncIterable} that yields the elements of `this` and then the elements of `other`
   */
  concat<U> (other : Iterable<U> | AsyncIterable<U>) : PolyAsyncIterable<T | U> {
    return this.append(other)
  }

  /**
   * Return a new iteration that will iterate over `other`, then over `this`.
   *
   * @remarks
   * Return a new {@link PolyAsyncIterable} that yields the same elements as `other`, then the same elements as `this`.
   * The resulting iteration is of the combined generic type of `this` and `other`, allowing this method to merge the
   * types of two distinct iterables.
   *
   * @typeParam U - Type of the elements to be prepended
   * @param other - Iterable to be prepended
   * @returns a new {@link PolyAsyncIterable} that yields the elements of `other` and then the elements of `this`
   */
  prepend<U> (other : Iterable<U> | AsyncIterable<U>) : PolyAsyncIterable<T | U> {
    asserts.isSyncOrAsyncIterable(other)
    return new PolyAsyncIterable(prependGen(this.#iterable, other))
  }

  /**
   * Return a new iteration that skips the first `num` elements.
   */
  drop (num : number) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(dropGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that iterates only over the first `num` elements.
   */
  take (num : number) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(takeGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that skips the last `num` elements.
   */
  dropLast (num : number) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(dropLastGen(this.#iterable, num))
  }

  /**
   * Return a new iteration that iterates only over the last `num` elements.
   */
  takeLast (num : number) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(takeLastGen(this.#iterable, num))
  }

  dropWhile (func : IndexedPredicate<T>) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(dropWhileGen(this.#iterable, func))
  }

  takeWhile (func : IndexedPredicate<T>) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(takeWhileGen(this.#iterable, func))
  }

  slice (start : number, end : number) : PolyAsyncIterable<T> {
    asserts.isInteger(start, 'start')
    asserts.isInteger(end, 'end')
    return new PolyAsyncIterable(sliceGen(this.#iterable, start, end))
  }

  filter<U extends T> (func : IndexedTypePredicate<T, U>) : PolyAsyncIterable<U>
  filter (func : IndexedPredicate<T>) : PolyAsyncIterable<T>

  filter<U extends T> (func : IndexedPredicate<T> | IndexedTypePredicate<T, U>) : PolyAsyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(filterGen(this.#iterable, func))
  }

  filterNotNullish () : PolyAsyncIterable<Exclude<T, null | undefined>> {
    return this.filter(isNotNullish)
  }

  map<U> (func : IndexedMapping<T, U>) : PolyAsyncIterable<U> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(mapGen(this.#iterable, func))
  }

  tap (func : IndexedRunnable<T>) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(tapGen(this.#iterable, func))
  }

  flatten<U> (
    this : PolyAsyncIterable<Iterable<U> | AsyncIterable<U>>,
  ) : PolyAsyncIterable<U> {
    return new PolyAsyncIterable(flattenGen(this.#iterable))
  }

  flat<U> (
    this : PolyAsyncIterable<Iterable<U> | AsyncIterable<U>>,
  ) : PolyAsyncIterable<U> {
    return this.flatten()
  }

  flatMap<U> (
    func : IndexedMapping<T, Iterable<U> | AsyncIterable<U>>,
  ) : PolyAsyncIterable<U> {
    return this.map(func).flatten()
  }

  chunk (num : number = 1) : PolyAsyncIterable<Array<T>> {
    asserts.isPositiveInteger(num)
    return new PolyAsyncIterable(chunkGen(this.#iterable, num))
  }

  chunkWhile (func : ChunkingPredicate<T>) : PolyAsyncIterable<Array<T>> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(chunkWhileGen(this.#iterable, func))
  }

  groupBy<K extends PropertyKey> (func : IndexedMapping<T, K>) : PolyAsyncIterable<[K, Array<T>]> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(groupByGen(this.#iterable, func))
  }

  unique (func : IndexedMapping<T, unknown> = asyncIdentity) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(uniqueGen(this.#iterable, func))
  }

  reverse () : PolyAsyncIterable<T> {
    return new PolyAsyncIterable(reverseGen(this.#iterable))
  }

  sort (func : Comparator<T> = comparator) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(sortGen(this.#iterable, func))
  }

  async toArray () : Promise<Array<T>> {
    const array = []
    for await (const elem of this.#iterable) {
      array.push(elem)
    }
    return array
  }

  // eslint-disable-next-line max-len
  async toPartitionArrays<U extends T> (func : IndexedTypePredicate<T, U>) : Promise<[Array<U>, Array<Exclude<T, U>>]>
  async toPartitionArrays (func : IndexedPredicate<T>) : Promise<[Array<T>, Array<T>]>

  async toPartitionArrays<U extends T> (
    func : IndexedPredicate<T> | IndexedTypePredicate<T, U>,
  ) : Promise<[Array<U | T>, Array<T | Exclude<T, U>>]> {
    const trues: Array<U | T> = []
    const falses: Array<T | Exclude<T, U>> = []

    let idx = 0
    for await (const elem of this.#iterable) {
      if (await func(elem, idx++)) {
        trues.push(elem)
      } else {
        falses.push(elem)
      }
    }

    return [trues, falses]
  }

  async toObject<K extends PropertyKey, V> (
    this : PolyAsyncIterable<readonly [K, V]>,
  ) : Promise<Record<K, V>> {
    const object = {} as Record<K, V>
    for await (const [key, value] of this.#iterable) {
      object[key] = value
    }
    return object
  }

  async toMap<K, V> (this : PolyAsyncIterable<readonly [K, V]>) : Promise<Map<K, V>> {
    const map = new Map<K, V>()

    const iterable = this.#iterable
    for await (const [key, value] of iterable) {
      map.set(key, value)
    }

    return map
  }

  async find<U extends T> (func : IndexedTypePredicate<T, U>) : Promise<U | undefined>
  async find (func : IndexedPredicate<T>) : Promise<T | undefined>

  async find<U extends T> (func : IndexedPredicate<T> | IndexedTypePredicate<T, U>) : Promise<T | U | undefined> {
    asserts.isFunction(func)

    let idx = 0
    for await (const elem of this.#iterable) {
      if (await func(elem, idx++)) {
        return elem
      }
    }
    return undefined
  }

  async includes (obj: T) : Promise<boolean> {
    for await (const elem of this.#iterable) {
      if (Object.is(obj, elem) || (obj === elem)) {
        return true
      }
    }

    return false
  }

  async some (func : IndexedPredicate<T>) : Promise<boolean> {
    asserts.isFunction(func)

    let idx = 0
    for await (const item of this.#iterable) {
      if (await func(item, idx++)) {
        return true
      }
    }

    return false
  }

  async every (func : IndexedPredicate<T>) : Promise<boolean> {
    asserts.isFunction(func)

    let idx = 0
    for await (const item of this.#iterable) {
      if (!(await func(item, idx++))) {
        return false
      }
    }

    return true
  }

  async reduce<U> (reducer : IndexedReducer<T, U>, init : T extends U ? (U | undefined) : U) : Promise<U> {
    asserts.isFunction(reducer)

    let accumulated: U | undefined = init
    let isFirst = (accumulated === undefined)
    let idx = 0

    for await (const elem of this.#iterable) {
      accumulated = isFirst ? (elem as unknown as U) : await reducer(accumulated as U, elem, idx++)
      isFirst = false
    }

    return accumulated as U
  }

  async forEach (func : IndexedRunnable<T>) : Promise<void> {
    asserts.isFunction(func)

    let idx = 0
    for await (const elem of this.#iterable) {
      await func(elem, idx++)
    }
  }

  async join (glue : string = ',') : Promise<string> {
    let str = ''
    let first = true

    for await (const elem of this.#iterable) {
      str += (first ? '' : glue) + (elem === null || elem === undefined ? '' : elem)
      first = false
    }

    return str
  }

  /**
   * Perform this iteration doing nothing.
   *
   * @returns a promise that will resolve when the iteration is done
   */
  async drain () : Promise<void> {
    /* eslint-disable-next-line no-unused-vars */
    for await (const elem of this.#iterable) {
      /* do nothing, just iterate */
    }
  }
}
