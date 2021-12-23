import {comparator, asserts, identity, isNotNullish} from './utils.js'
import PolyAsyncIterable from './iter-async.js'


type IndexedPredicate<T> = (elem : T, index : number) => boolean
type IndexedNarrowingPredicate<T, U extends T> = (elem: T, index: number) => elem is U
type IndexedMapping<T, U> = (elem : T, index : number) => U
type IndexedRunnable<T> = (elem : T, index : number) => void
type IndexedReducer<T, U> = (acc : U, item : T, index : number) => U

type GroupingPredicate<T> = (elem : T, lastElem : T, firstElem : T) => boolean
type UniqueMapping<T> = (elem : T) => unknown
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

function filterGen<T, U extends T> (iter : Iterable<T>, func : IndexedNarrowingPredicate<T, U>) : Iterable<U>
function filterGen<T> (iter : Iterable<T>, func : IndexedPredicate<T>) : Iterable<T>

function * filterGen<T, U extends T> (
  iter : Iterable<T>,
  func : IndexedPredicate<T> | IndexedNarrowingPredicate<T, U>,
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

function * groupGen<T> (iter : Iterable<T>, num : number) : Iterable<Array<T>> {
  let group = []

  for (const elem of iter) {
    group.push(elem)
    if (group.length === num) {
      yield group
      group = []
    }
  }

  if (group.length) {
    yield group
  }
}

function * groupWhileGen<T> (iter : Iterable<T>, func : GroupingPredicate<T>) : Iterable<Array<T>> {
  let group: Array<T> = []

  for (const elem of iter) {
    if (group.length === 0 || func(elem, group[group.length - 1], group[0])) {
      group.push(elem)
    } else {
      yield group
      group = [elem]
    }
  }

  if (group.length) {
    yield group
  }
}

function * uniqueGen<T> (iter : Iterable<T>, func : UniqueMapping<T>) : Iterable<T> {
  const seen = new Set()

  for (const elem of iter) {
    const key = func(elem)
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


export default class PolySyncIterable<T> implements Iterable<T> {
  _iterable : Iterable<T>

  constructor (iterable : Iterable<T>) {
    this._iterable = iterable
  }

  * [Symbol.iterator] () : Generator<T, void, undefined> {
    yield * this._iterable
  }

  async () : PolyAsyncIterable<T> {
    const syncIterable = this._iterable
    const asyncIterable = {
      async * [Symbol.asyncIterator] () : AsyncIterator<T> {
        yield * syncIterable
      },
    }
    return new PolyAsyncIterable<T>(asyncIterable)
  }

  append<U> (iter : Iterable<U>) : PolySyncIterable<T | U> {
    asserts.isSyncIterable(iter)
    return new PolySyncIterable(appendGen(this._iterable, iter))
  }

  concat<U> (iter : Iterable<U>) : PolySyncIterable<T | U> {
    return this.append(iter)
  }

  prepend<U> (iter : Iterable<U>) : PolySyncIterable<T | U> {
    asserts.isSyncIterable(iter)
    return new PolySyncIterable(prependGen(this._iterable, iter))
  }

  drop (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(dropGen(this._iterable, num))
  }

  take (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(takeGen(this._iterable, num))
  }

  dropLast (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(dropLastGen(this._iterable, num))
  }

  takeLast (num : number = 0) : PolySyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolySyncIterable(takeLastGen(this._iterable, num))
  }

  slice (start : number, end : number) : PolySyncIterable<T> {
    asserts.isInteger(start, 'start')
    asserts.isInteger(end, 'end')
    return new PolySyncIterable(sliceGen(this._iterable, start, end))
  }

  dropWhile (func : IndexedPredicate<T>) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(dropWhileGen(this._iterable, func))
  }

  takeWhile (func : IndexedPredicate<T>) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(takeWhileGen(this._iterable, func))
  }


  filter<U extends T> (func : IndexedNarrowingPredicate<T, U>) : PolySyncIterable<U>
  filter (func : IndexedPredicate<T>) : PolySyncIterable<T>

  filter<U extends T> (func : IndexedPredicate<T> | IndexedNarrowingPredicate<T, U>) : PolySyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolySyncIterable(filterGen(this._iterable, func))
  }

  filterNotNullish () : PolySyncIterable<Exclude<T, null | undefined>> {
    return this.filter(isNotNullish)
  }

  map<U> (func : IndexedMapping<T, U>) : PolySyncIterable<U> {
    asserts.isFunction(func)
    return new PolySyncIterable(mapGen(this._iterable, func))
  }

  tap (func : IndexedRunnable<T>) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(tapGen(this._iterable, func))
  }

  flatten<U> (this : PolySyncIterable<Iterable<U>>) : PolySyncIterable<U> {
    return new PolySyncIterable(flattenGen(this._iterable))
  }

  flat<U> (this : PolySyncIterable<Iterable<U>>) : PolySyncIterable<U> {
    return this.flatten()
  }

  flatMap<U> (func : IndexedMapping<T, Iterable<U>>) : PolySyncIterable<U> {
    return this.map(func).flatten()
  }

  group (num : number = 1) : PolySyncIterable<Array<T>> {
    asserts.isPositiveInteger(num)
    return new PolySyncIterable(groupGen(this._iterable, num))
  }

  groupWhile (func : GroupingPredicate<T>): PolySyncIterable<Array<T>> {
    asserts.isFunction(func)
    return new PolySyncIterable(groupWhileGen(this._iterable, func))
  }

  unique (func : UniqueMapping<T> = identity) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(uniqueGen(this._iterable, func))
  }

  reverse () : PolySyncIterable<T> {
    return new PolySyncIterable(reverseGen(this._iterable))
  }

  sort (func : Comparator<T> = comparator) : PolySyncIterable<T> {
    asserts.isFunction(func)
    return new PolySyncIterable(sortGen(this._iterable, func))
  }

  toArray () : Array<T> {
    return Array.from(this._iterable)
  }

  toObject<K extends string | number | symbol, V> (this : PolySyncIterable<readonly [K, V]>) : Record<K, V> {
    const object = {} as Record<K, V>

    const iterable = this._iterable
    for (const [key, value] of iterable) {
      object[key] = value
    }

    return object
  }

  toMap<K, V> (this : PolySyncIterable<readonly [K, V]>) : Map<K, V> {
    const map = new Map<K, V>()

    const iterable = this._iterable
    for (const [key, value] of iterable) {
      map.set(key, value)
    }

    return map
  }

  find (func : IndexedPredicate<T>) : T | undefined {
    asserts.isFunction(func)
    let idx = 0
    for (const elem of this._iterable) {
      if (func(elem, idx++)) {
        return elem
      }
    }
    return undefined
  }

  includes (obj : T) : boolean {
    for (const elem of this._iterable) {
      if (Object.is(obj, elem) || obj === elem) {
        return true
      }
    }

    return false
  }

  some (func : IndexedPredicate<T>) : boolean {
    asserts.isFunction(func)

    let idx = 0
    for (const item of this._iterable) {
      if (func(item, idx++)) {
        return true
      }
    }

    return false
  }

  every (func : IndexedPredicate<T>) : boolean {
    asserts.isFunction(func)

    let idx = 0
    for (const item of this._iterable) {
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

    for (const elem of this._iterable) {
      accumulated = isFirst ? (elem as unknown as U) : reducer(accumulated as U, elem, idx++)
      isFirst = false
    }

    return accumulated as U
  }

  forEach (func : IndexedRunnable<T>) : void {
    asserts.isFunction(func)

    let idx = 0
    for (const elem of this._iterable) {
      func(elem, idx++)
    }
  }

  join (glue : string = ',') : string {
    let str = ''
    let first = true

    for (const elem of this._iterable) {
      str += (first ? '' : glue) + (elem == null ? '' : elem)
      first = false
    }

    return str
  }

  drain () : void {
    /* eslint-disable-next-line no-unused-vars */
    for (const elem of this._iterable) {
      /* do nothing, just iterate */
    }
  }
}
