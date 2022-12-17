import {
  AsyncChunkingPredicate,
  AsyncIndexedMapping,
  AsyncIndexedPredicate,
  AsyncIndexedRunnable,
  Comparator,
  IndexedTypePredicate,
} from '../types.js'
import {ConcurrentMapper} from './concurrency.js'
import {ConcurrencyOptions} from './poly-iterable.js'

export function prefetchGen<T> (iterable: AsyncIterable<T>): AsyncIterable<T> {
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


export async function * appendGen<T, U> (
  iterA: Iterable<T> | AsyncIterable<T>,
  iterB: Iterable<U> | AsyncIterable<U>,
): AsyncIterable<T | U> {
  yield * iterA
  yield * iterB
}

export async function * prependGen<T, U> (
  iterA: Iterable<T> | AsyncIterable<T>,
  iterB: Iterable<U> | AsyncIterable<U>,
): AsyncIterable<T | U> {
  yield * iterB
  yield * iterA
}

export async function * dropGen<T> (iter: AsyncIterable<T>, num: number): AsyncIterable<T> {
  let rem = num
  for await (const elem of iter) {
    if (rem-- <= 0) {
      yield elem
    }
  }
}

export async function * takeGen<T> (iter: AsyncIterable<T>, num: number): AsyncIterable<T> {
  let rem = num
  for await (const elem of iter) {
    if (rem-- <= 0) {
      return
    }
    yield elem
  }
}

export async function * dropLastGen<T> (iter: AsyncIterable<T>, num: number): AsyncIterable<T> {
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

export async function * takeLastGen<T> (iter: AsyncIterable<T>, num: number): AsyncIterable<T> {
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

export async function * dropWhileGen<T> (iter: AsyncIterable<T>, func: AsyncIndexedPredicate<T>): AsyncIterable<T> {
  let idx = 0
  let yielding = false
  for await (const elem of iter) {
    if (yielding || !(await func(elem, idx++))) {
      yielding = true
      yield elem
    }
  }
}

export async function * takeWhileGen<T> (iter: AsyncIterable<T>, func: AsyncIndexedPredicate<T>): AsyncIterable<T> {
  let idx = 0
  for await (const elem of iter) {
    if (!(await func(elem, idx++))) {
      return
    }
    yield elem
  }
}


async function * sliceNegPosGen<T> (iter: AsyncIterable<T>, start: number, end: number): AsyncIterable<T> {
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

export function sliceGen<T> (iter: AsyncIterable<T>, start: number, end?: number): AsyncIterable<T> {
  if (start >= 0 && end == null) {
    return dropGen(iter, start)
  } else if (end == null) { // && start < 0
    return takeLastGen(iter, -start)
  } else if (start >= 0 && end >= 0) {
    return takeGen(dropGen(iter, start), end - start)
  } else if (start < 0 && end >= 0) {
    return sliceNegPosGen(iter, -start, end)
  } else if (start >= 0) { // && end < 0
    return dropLastGen(dropGen(iter, start), -end)
  } else { // start < 0 && end < 0
    return dropLastGen(takeLastGen(iter, -start), -end)
  }
}


export function filterGen<T, U extends T> (
  iter: AsyncIterable<T>,
  func: IndexedTypePredicate<T, U>,
  options: ConcurrencyOptions,
): AsyncIterable<U>

export function filterGen<T> (
  iter: AsyncIterable<T>,
  func: AsyncIndexedPredicate<T>,
  options: ConcurrencyOptions,
): AsyncIterable<T>

export async function * filterGen<T, U extends T> (
  iter: AsyncIterable<T>,
  func: AsyncIndexedPredicate<T> | IndexedTypePredicate<T, U>,
  options: ConcurrencyOptions,
): AsyncIterable<T | U> {
  const concIter = new ConcurrentMapper(iter, func, options)
  for await (const elem of concIter) {
    if (elem.mapped) {
      yield elem.original
    }
  }
}


export async function * mapGen<T, U> (
  iter: AsyncIterable<T>,
  func: AsyncIndexedMapping<T, U>,
  options: ConcurrencyOptions,
): AsyncIterable<U> {
  const concIter = new ConcurrentMapper(iter, func, options)
  for await (const elem of concIter) {
    yield elem.mapped
  }
}

export async function * tapGen<T> (
  iter: AsyncIterable<T>,
  func: AsyncIndexedRunnable<T>,
  options: ConcurrencyOptions,
): AsyncIterable<T> {
  const concIter = new ConcurrentMapper(iter, func, options)
  for await (const elem of concIter) {
    yield elem.original
  }
}

export async function * flattenGen<T> (
  iter: AsyncIterable<Iterable<T> | AsyncIterable<T>>,
): AsyncIterable<T> {
  for await (const elem of iter) {
    yield * elem
  }
}

export async function * chunkGen<T> (iter: AsyncIterable<T>, num: number): AsyncIterable<Array<T>> {
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

export async function * chunkWhileGen<T> (
  iter: AsyncIterable<T>,
  func: AsyncChunkingPredicate<T>,
): AsyncIterable<Array<T>> {
  let chunk: Array<T> = []

  for await (const elem of iter) {
    if (chunk.length === 0 || await func(elem, chunk[chunk.length - 1], chunk[0])) {
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

export async function * groupByGen<K, T> (
  iter: AsyncIterable<T>,
  func: AsyncIndexedMapping<T, K>,
  options: ConcurrencyOptions,
): AsyncIterable<[K, Array<T>]> {
  const groups: Map<K, Array<T>> = new Map()

  const concIter = new ConcurrentMapper(iter, func, options)
  for await (const elem of concIter) {
    const key = elem.mapped

    const group = groups.get(key) ?? []
    group.push(elem.original)

    groups.set(key, group)
  }

  yield * groups.entries()
}

export async function * uniqueGen<T> (
  iter: AsyncIterable<T>,
  func: AsyncIndexedMapping<T, unknown>,
  options: ConcurrencyOptions,
): AsyncIterable<T> {
  const seen = new Set()

  const concIter = new ConcurrentMapper(iter, func, options)
  for await (const elem of concIter) {
    const key = elem.mapped
    if (!seen.has(key)) {
      yield elem.original
      seen.add(key)
    }
  }
}

export async function * reverseGen<T> (iter: AsyncIterable<T>): AsyncIterable<T> {
  const buf = []
  for await (const elem of iter) {
    buf.push(elem)
  }
  for (let i = buf.length - 1; i >= 0; i--) {
    yield buf[i]
  }
}

export async function * sortGen<T> (iter: AsyncIterable<T>, func: Comparator<T>): AsyncIterable<T> {
  const buf = []
  for await (const elem of iter) {
    buf.push(elem)
  }
  for await (const elem of buf.sort(func)) {
    yield elem
  }
}
