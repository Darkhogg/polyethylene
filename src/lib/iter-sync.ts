import {comparator, asserts, identity, isNotNullish} from './utils.js'
import PolyAsyncIterable from './iter-async.js'


type IndexedPredicate<T> = (elem : T, index : number) => boolean
type IndexedTypePredicate<T, U extends T> = (elem: T, index: number) => elem is U
type IndexedMapping<T, U> = (elem : T, index : number) => U
type IndexedRunnable<T> = (elem : T, index : number) => void
type IndexedReducer<T, U> = (acc : U, item : T, index : number) => U

type ChunkingPredicate<T> = (elem : T, lastElem : T, firstElem : T) => boolean
type Comparator<T> = (elemA : T, elemB : T) => number


function * appendGen<T, U> (iterA : Iterable<T>, iterB : Iterable<U>) : Iterable<T | U> {
  yield * iterA
  yield * iterB
}

function * prependGen<T, U> (iterA : Iterable<T>, iterB : Iterable<U>) : Iterable<T | U> {
  yield * iterB
  yield * iterA
}

function * dropGen<T> (iter : Iterable<T>, num : number) : Iterable<T> {
  let rem = num
  for (const elem of iter) {
    if (rem-- <= 0) {
      yield elem
    }
  }
}

function * takeGen<T> (iter : Iterable<T>, num : number) : Iterable<T> {
  let rem = num
  for (const elem of iter) {
    if (rem-- <= 0) {
      return
    }
    yield elem
  }
}

function * dropLastGen<T> (iter : Iterable<T>, num : number) : Iterable<T> {
  const buf = Array(num)
  let pos = 0
  let size = 0
  for (const elem of iter) {
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

function * takeLastGen<T> (iter : Iterable<T>, num : number) : Iterable<T> {
  const buf = Array(num)
  let pos = 0
  let size = 0
  for (const elem of iter) {
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

function * sliceNegPosGen<T> (iter : Iterable<T>, start : number, end : number) : Iterable<T> {
  const buf = Array(start)
  let pos = 0
  let size = 0
  let num = end
  for (const elem of iter) {
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

function sliceGen<T> (iter : Iterable<T>, start : number, end : number) : Iterable<T> {
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

function * dropWhileGen<T> (iter : Iterable<T>, func : IndexedPredicate<T>) : Iterable<T> {
  let idx = 0
  let yielding = false
  for (const elem of iter) {
    if (yielding || !func(elem, idx++)) {
      yielding = true
      yield elem
    }
  }
}

function * takeWhileGen<T> (iter : Iterable<T>, func : IndexedPredicate<T>) : Iterable<T> {
  let idx = 0
  for (const elem of iter) {
    if (!func(elem, idx++)) {
      return
    }
    yield elem
  }
}

function filterGen<T, U extends T> (iter : Iterable<T>, func : IndexedTypePredicate<T, U>) : Iterable<U>
function filterGen<T> (iter : Iterable<T>, func : IndexedPredicate<T>) : Iterable<T>

function * filterGen<T, U extends T> (
  iter : Iterable<T>,
  func : IndexedPredicate<T> | IndexedTypePredicate<T, U>,
) : Iterable<U> {
  let idx = 0
  for (const elem of iter) {
    if (func(elem, idx++)) {
      yield elem
    }
  }
}

function * mapGen<T, U> (iter : Iterable<T>, func : IndexedMapping<T, U>) : Iterable<U> {
  let idx = 0
  for (const elem of iter) {
    yield func(elem, idx++)
  }
}

function * tapGen<T> (iter : Iterable<T>, func : IndexedRunnable<T>) : Iterable<T> {
  let idx = 0
  for (const elem of iter) {
    func(elem, idx++)
    yield elem
  }
}

function * flattenGen<T> (iter : Iterable<Iterable<T>>) : Iterable<T> {
  for (const elem of iter) {
    yield * elem
  }
}

function * chunkGen<T> (iter : Iterable<T>, num : number) : Iterable<Array<T>> {
  let chunk = []

  for (const elem of iter) {
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

function * chunkWhileGen<T> (iter : Iterable<T>, func : ChunkingPredicate<T>) : Iterable<Array<T>> {
  let chunk: Array<T> = []

  for (const elem of iter) {
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

function * groupByGen<K, T> (iter : Iterable<T>, func : IndexedMapping<T, K>) : Iterable<[K, Array<T>]> {
  const groups: Map<K, Array<T>> = new Map()

  let idx = 0
  for (const elem of iter) {
    const key = func(elem, idx++)

    const group = groups.get(key) ?? []
    group.push(elem)

    groups.set(key, group)
  }

  yield * groups.entries()
}

function * uniqueGen<T> (iter : Iterable<T>, func : IndexedMapping<T, unknown>) : Iterable<T> {
  const seen = new Set()

  let idx = 0
  for (const elem of iter) {
    const key = func(elem, idx++)
    if (!seen.has(key)) {
      yield elem
      seen.add(key)
    }
  }
}

function * reverseGen<T> (iter : Iterable<T>) : Iterable<T> {
  const buf = Array.from(iter)
  for (let i = buf.length - 1; i >= 0; i--) {
    yield buf[i]
  }
}

function * sortGen<T> (iter : Iterable<T>, func : Comparator<T>) : Iterable<T> {
  const buf = Array.from(iter)
  for (const elem of buf.sort(func)) {
    yield elem
  }
}


/**
 *
 *
 * @public
 */
export default class PolySyncIterable<T> implements Iterable<T> {
  #iterable : Iterable<T>

  /** @internal */
  constructor (iterable : Iterable<T>) {
    this.#iterable = iterable
  }

  * [Symbol.iterator] () : Generator<T, void, undefined> {
    yield * this.#iterable
  }

  async () : PolyAsyncIterable<T> {
    const syncIterable = this.#iterable
    const asyncIterable = {
      async * [Symbol.asyncIterator] () : AsyncIterator<T> {
        yield * syncIterable
      },
    }
    return new PolyAsyncIterable<T>(asyncIterable)
  }

  append<U> (iter : Iterable<U>) : PolySyncIterable<T | U> {
    asserts.isSyncIterable(iter)
    return new PolySyncIterable(appendGen(this.#iterable, iter))
  }

  concat<U> (iter : Iterable<U>) : PolySyncIterable<T | U> {
    return this.append(iter)
  }

  prepend<U> (iter : Iterable<U>) : PolySyncIterable<T | U> {
    asserts.isSyncIterable(iter)
    return new PolySyncIterable(prependGen(this.#iterable, iter))
  }

  drop (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(dropGen(this.#iterable, num))
  }

  take (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(takeGen(this.#iterable, num))
  }

  dropLast (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(dropLastGen(this.#iterable, num))
  }

  takeLast (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(takeLastGen(this.#iterable, num))
  }

  slice (start : number, end : number) : PolySyncIterable<T> {
    asserts.isInteger(start, 'start')
    asserts.isInteger(end, 'end')
    return new PolySyncIterable(sliceGen(this.#iterable, start, end))
  }

  dropWhile (func : IndexedPredicate<T>) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(dropWhileGen(this.#iterable, func))
  }

  takeWhile (func : IndexedPredicate<T>) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(takeWhileGen(this.#iterable, func))
  }


  filter<U extends T> (func : IndexedTypePredicate<T, U>) : PolySyncIterable<U>
  filter (func : IndexedPredicate<T>) : PolySyncIterable<T>

  filter<U extends T> (func : IndexedPredicate<T> | IndexedTypePredicate<T, U>) : PolySyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolySyncIterable(filterGen(this.#iterable, func))
  }

  filterNotNullish () : PolySyncIterable<Exclude<T, null | undefined>> {
    return this.filter(isNotNullish)
  }

  map<U> (func : IndexedMapping<T, U>) : PolySyncIterable<U> {
    asserts.isFunction(func)
    return new PolySyncIterable(mapGen(this.#iterable, func))
  }

  tap (func : IndexedRunnable<T>) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(tapGen(this.#iterable, func))
  }

  flatten<U> (this : PolySyncIterable<Iterable<U>>) : PolySyncIterable<U> {
    return new PolySyncIterable(flattenGen(this.#iterable))
  }

  flat<U> (this : PolySyncIterable<Iterable<U>>) : PolySyncIterable<U> {
    return this.flatten()
  }

  flatMap<U> (func : IndexedMapping<T, Iterable<U>>) : PolySyncIterable<U> {
    return this.map(func).flatten()
  }

  chunk (num : number = 1) : PolySyncIterable<Array<T>> {
    asserts.isPositiveInteger(num)
    return new PolySyncIterable(chunkGen(this.#iterable, num))
  }

  chunkWhile (func : ChunkingPredicate<T>): PolySyncIterable<Array<T>> {
    asserts.isFunction(func)
    return new PolySyncIterable(chunkWhileGen(this.#iterable, func))
  }

  groupBy<K extends PropertyKey> (func : IndexedMapping<T, K>) : PolySyncIterable<[K, Array<T>]> {
    asserts.isFunction(func)
    return new PolySyncIterable(groupByGen(this.#iterable, func))
  }

  unique (func : IndexedMapping<T, unknown> = identity) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(uniqueGen(this.#iterable, func))
  }

  reverse () : PolySyncIterable<T> {
    return new PolySyncIterable(reverseGen(this.#iterable))
  }

  sort (func : Comparator<T> = comparator) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(sortGen(this.#iterable, func))
  }

  toArray () : Array<T> {
    return Array.from(this.#iterable)
  }

  toPartitionArrays<U extends T> (func : IndexedTypePredicate<T, U>) : [Array<U>, Array<Exclude<T, U>>]
  toPartitionArrays (func : IndexedPredicate<T>) : [Array<T>, Array<T>]

  toPartitionArrays<U extends T> (
    func : IndexedPredicate<T> | IndexedTypePredicate<T, U>,
  ) : [Array<U | T>, Array<T | Exclude<T, U>>] {
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

  toObject<K extends PropertyKey, V> (this : PolySyncIterable<readonly [K, V]>) : Record<K, V> {
    const object = {} as Record<K, V>

    for (const [key, value] of this.#iterable) {
      object[key] = value
    }

    return object
  }

  toMap<K, V> (this : PolySyncIterable<readonly [K, V]>) : Map<K, V> {
    const map = new Map<K, V>()

    for (const [key, value] of this.#iterable) {
      map.set(key, value)
    }

    return map
  }


  find<U extends T> (func : IndexedTypePredicate<T, U>) : U | undefined
  find (func : IndexedPredicate<T>) : T | undefined

  find<U extends T> (func : IndexedPredicate<T> | IndexedTypePredicate<T, U>) : T | U | undefined {
    asserts.isFunction(func)
    let idx = 0
    for (const elem of this.#iterable) {
      if (func(elem, idx++)) {
        return elem
      }
    }
    return undefined
  }

  includes (obj : T) : boolean {
    for (const elem of this.#iterable) {
      if (Object.is(obj, elem) || obj === elem) {
        return true
      }
    }

    return false
  }

  some (func : IndexedPredicate<T>) : boolean {
    asserts.isFunction(func)

    let idx = 0
    for (const item of this.#iterable) {
      if (func(item, idx++)) {
        return true
      }
    }

    return false
  }

  every (func : IndexedPredicate<T>) : boolean {
    asserts.isFunction(func)

    let idx = 0
    for (const item of this.#iterable) {
      if (!func(item, idx++)) {
        return false
      }
    }

    return true
  }

  reduce<U> (reducer : IndexedReducer<T, U>, init : T extends U ? (U | undefined) : U) : U {
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

  forEach (func : IndexedRunnable<T>) : void {
    asserts.isFunction(func)

    let idx = 0
    for (const elem of this.#iterable) {
      func(elem, idx++)
    }
  }

  join (glue : string = ',') : string {
    let str = ''
    let first = true

    for (const elem of this.#iterable) {
      str += (first ? '' : glue) + (elem == null ? '' : elem)
      first = false
    }

    return str
  }

  drain () : void {
    /* eslint-disable-next-line no-unused-vars */
    for (const elem of this.#iterable) {
      /* do nothing, just iterate */
    }
  }
}
