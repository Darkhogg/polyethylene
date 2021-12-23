import {comparator, asserts, asyncIdentity, isNotNullish} from './utils.js'


type IndexedPredicate<T> = (elem : T, index : number) => boolean | PromiseLike<boolean>
type IndexedNarrowingPredicate<T, U extends T> = (elem: T, index: number) => elem is U
type IndexedMapping<T, U> = (elem : T, index : number) => U | PromiseLike<U>
type IndexedRunnable<T> = (elem : T, index : number) => void | PromiseLike<void>
type IndexedReducer<T, U> = (acc : U, item : T, index : number) => U | PromiseLike<U>

type GroupingPredicate<T> = (elem : T, lastElem : T, firstElem : T) => boolean | PromiseLike<boolean>
type UniqueMapping<T> = (elem : T) => unknown
type Comparator<T> = (elemA : T, elemB : T) => number


export async function * prefetchGen<T> (iterable : AsyncIterable<T>) : AsyncIterable<T> {
  const it = iterable[Symbol.asyncIterator]()

  let cont = true
  let prom = it.next()
  while (cont) {
    const {value, done} = await prom

    prom = it.next()

    cont = !done
    if (cont) {
      yield value
    }
  }
}

export function preloadGen<T> (iterable : AsyncIterable<T>) : AsyncIterable<T> {
  const it = iterable[Symbol.asyncIterator]()

  const firstProm = it.next()
  let firstDone = false

  return {
    async * [Symbol.asyncIterator] () {
      let cont = true
      while (cont) {
        const {value, done} = await (firstDone ? it.next() : firstProm)
        firstDone = true

        cont = !done
        if (cont) {
          yield value
        }
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

function filterGen<T, U extends T> (iter : AsyncIterable<T>, func : IndexedNarrowingPredicate<T, U>) : AsyncIterable<U>
function filterGen<T> (iter : AsyncIterable<T>, func : IndexedPredicate<T>) : AsyncIterable<T>

async function * filterGen<T, U extends T> (
  iter : AsyncIterable<T>,
  func : IndexedPredicate<T> | IndexedNarrowingPredicate<T, U>,
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

async function * groupGen<T> (iter : AsyncIterable<T>, num : number) : AsyncIterable<Array<T>> {
  let group = []

  for await (const elem of iter) {
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

async function * groupWhileGen<T> (iter : AsyncIterable<T>, func : GroupingPredicate<T>) : AsyncIterable<Array<T>> {
  let group : Array<T> = []

  for await (const elem of iter) {
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

async function * uniqueGen<T> (iter : AsyncIterable<T>, func : UniqueMapping<T>) : AsyncIterable<T> {
  const seen = new Set()

  for await (const elem of iter) {
    const key = await func(elem)
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


export default class PolyAsyncIterable<T> implements AsyncIterable<T> {
  _iterable : AsyncIterable<T>

  constructor (iterable : AsyncIterable<T>) {
    this._iterable = iterable
  }

  async * [Symbol.asyncIterator] () {
    yield * this._iterable
  }

  preload () : PolyAsyncIterable<T> {
    return new PolyAsyncIterable(preloadGen(this._iterable))
  }

  prefetch () : PolyAsyncIterable<T> {
    return new PolyAsyncIterable(prefetchGen(this._iterable))
  }

  append<U> (iter : Iterable<U> | AsyncIterable<U>) : PolyAsyncIterable<T | U> {
    asserts.isAsyncIterable(iter)
    return new PolyAsyncIterable(appendGen(this._iterable, iter))
  }

  concat<U> (iter : Iterable<U> | AsyncIterable<U>) : PolyAsyncIterable<T | U> {
    return this.append(iter)
  }

  prepend<U> (iter : Iterable<U> | AsyncIterable<U>) : PolyAsyncIterable<T | U> {
    asserts.isAsyncIterable(iter)
    return new PolyAsyncIterable(prependGen(this._iterable, iter))
  }

  drop (num : number = 0) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(dropGen(this._iterable, num))
  }

  take (num : number = 0) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(takeGen(this._iterable, num))
  }

  dropLast (num : number = 0) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(dropLastGen(this._iterable, num))
  }

  takeLast (num : number = 0) : PolyAsyncIterable<T> {
    asserts.isNonNegativeInteger(num)
    return new PolyAsyncIterable(takeLastGen(this._iterable, num))
  }

  dropWhile (func : IndexedPredicate<T>) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(dropWhileGen(this._iterable, func))
  }

  takeWhile (func : IndexedPredicate<T>) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(takeWhileGen(this._iterable, func))
  }

  slice (start : number, end : number) : PolyAsyncIterable<T> {
    asserts.isInteger(start, 'start')
    asserts.isInteger(end, 'end')
    return new PolyAsyncIterable(sliceGen(this._iterable, start, end))
  }

  filter<U extends T> (func : IndexedNarrowingPredicate<T, U>) : PolyAsyncIterable<U>
  filter (func : IndexedPredicate<T>) : PolyAsyncIterable<T>

  filter<U extends T> (func : IndexedPredicate<T> | IndexedNarrowingPredicate<T, U>) : PolyAsyncIterable<T | U> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(filterGen(this._iterable, func))
  }

  filterNotNullish () : PolyAsyncIterable<Exclude<T, null | undefined>> {
    return this.filter(isNotNullish)
  }

  map<U> (func : IndexedMapping<T, U>) : PolyAsyncIterable<U> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(mapGen(this._iterable, func))
  }

  tap (func : IndexedRunnable<T>) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(tapGen(this._iterable, func))
  }

  flatten<U> (
    this : PolyAsyncIterable<Iterable<U> | AsyncIterable<U>>,
  ) : PolyAsyncIterable<U> {
    return new PolyAsyncIterable(flattenGen(this._iterable))
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

  group (num : number = 1) : PolyAsyncIterable<Array<T>> {
    asserts.isPositiveInteger(num)
    return new PolyAsyncIterable(groupGen(this._iterable, num))
  }

  groupWhile (func : GroupingPredicate<T>) : PolyAsyncIterable<Array<T>> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(groupWhileGen(this._iterable, func))
  }

  unique (func : UniqueMapping<T> = asyncIdentity) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(uniqueGen(this._iterable, func))
  }

  reverse () : PolyAsyncIterable<T> {
    return new PolyAsyncIterable(reverseGen(this._iterable))
  }

  sort (func : Comparator<T> = comparator) : PolyAsyncIterable<T> {
    asserts.isFunction(func)
    return new PolyAsyncIterable(sortGen(this._iterable, func))
  }

  async toArray () : Promise<Array<T>> {
    const array = []
    for await (const elem of this._iterable) {
      array.push(elem)
    }
    return array
  }

  async toObject<K extends string | number | symbol, V> (
    this : PolyAsyncIterable<readonly [K, V]>,
  ) : Promise<Record<K, V>> {
    const object = {} as Record<K, V>
    for await (const [key, value] of this._iterable) {
      object[key] = value
    }
    return object
  }

  async toMap<K, V> (this : PolyAsyncIterable<readonly [K, V]>) : Promise<Map<K, V>> {
    const map = new Map<K, V>()

    const iterable = this._iterable
    for await (const [key, value] of iterable) {
      map.set(key, value)
    }

    return map
  }

  async find (func : IndexedPredicate<T>) : Promise<T | undefined> {
    asserts.isFunction(func)

    let idx = 0
    for await (const elem of this._iterable) {
      if (await func(elem, idx++)) {
        return elem
      }
    }
    return undefined
  }

  async includes (obj: T) : Promise<boolean> {
    for await (const elem of this._iterable) {
      if (Object.is(obj, elem) || (obj === elem)) {
        return true
      }
    }

    return false
  }

  async some (func : IndexedPredicate<T>) : Promise<boolean> {
    asserts.isFunction(func)

    let idx = 0
    for await (const item of this._iterable) {
      if (await func(item, idx++)) {
        return true
      }
    }

    return false
  }

  async every (func : IndexedPredicate<T>) : Promise<boolean> {
    asserts.isFunction(func)

    let idx = 0
    for await (const item of this._iterable) {
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

    for await (const elem of this._iterable) {
      accumulated = isFirst ? (elem as unknown as U) : await reducer(accumulated as U, elem, idx++)
      isFirst = false
    }

    return accumulated as U
  }

  async forEach (func : IndexedRunnable<T>) : Promise<void> {
    asserts.isFunction(func)

    let idx = 0
    for await (const elem of this._iterable) {
      await func(elem, idx++)
    }
  }

  async join (glue : string = ',') : Promise<string> {
    let str = ''
    let first = true

    for await (const elem of this._iterable) {
      str += (first ? '' : glue) + (elem === null || elem === undefined ? '' : elem)
      first = false
    }

    return str
  }

  async drain () : Promise<void> {
    /* eslint-disable-next-line no-unused-vars */
    for await (const elem of this._iterable) {
      /* do nothing, just iterate */
    }
  }
}
