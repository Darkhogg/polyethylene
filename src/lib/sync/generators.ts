import {
  ChunkingPredicate,
  Comparator,
  IndexedMapping,
  IndexedPredicate,
  IndexedRunnable,
  IndexedTypePredicate,
} from '../types.js'

export function * appendGen<T, U> (iterA: Iterable<T>, iterB: Iterable<U>): Iterable<T | U> {
  yield * iterA
  yield * iterB
}

export function * prependGen<T, U> (iterA: Iterable<T>, iterB: Iterable<U>): Iterable<T | U> {
  yield * iterB
  yield * iterA
}

export function * dropGen<T> (iter: Iterable<T>, num: number): Iterable<T> {
  let rem = num
  for (const elem of iter) {
    if (rem-- <= 0) {
      yield elem
    }
  }
}

export function * takeGen<T> (iter: Iterable<T>, num: number): Iterable<T> {
  let rem = num
  for (const elem of iter) {
    if (rem-- <= 0) {
      return
    }
    yield elem
  }
}

export function * dropLastGen<T> (iter: Iterable<T>, num: number): Iterable<T> {
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

export function * takeLastGen<T> (iter: Iterable<T>, num: number): Iterable<T> {
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

function * sliceNegPosGen<T> (iter: Iterable<T>, start: number, end: number): Iterable<T> {
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

export function sliceGen<T> (iter: Iterable<T>, start: number, end?: number): Iterable<T> {
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

export function * dropWhileGen<T> (iter: Iterable<T>, func: IndexedPredicate<T>): Iterable<T> {
  let idx = 0
  let yielding = false
  for (const elem of iter) {
    if (yielding || !func(elem, idx++)) {
      yielding = true
      yield elem
    }
  }
}

export function * takeWhileGen<T> (iter: Iterable<T>, func: IndexedPredicate<T>): Iterable<T> {
  let idx = 0
  for (const elem of iter) {
    if (!func(elem, idx++)) {
      return
    }
    yield elem
  }
}

export function filterGen<T, U extends T> (iter: Iterable<T>, func: IndexedTypePredicate<T, U>): Iterable<U>
export function filterGen<T> (iter: Iterable<T>, func: IndexedPredicate<T>): Iterable<T>

export function * filterGen<T, U extends T> (
  iter: Iterable<T>,
  func: IndexedPredicate<T> | IndexedTypePredicate<T, U>,
): Iterable<U> {
  let idx = 0
  for (const elem of iter) {
    if (func(elem, idx++)) {
      yield elem
    }
  }
}

export function * mapGen<T, U> (iter: Iterable<T>, func: IndexedMapping<T, U>): Iterable<U> {
  let idx = 0
  for (const elem of iter) {
    yield func(elem, idx++)
  }
}

export function * tapGen<T> (iter: Iterable<T>, func: IndexedRunnable<T>): Iterable<T> {
  let idx = 0
  for (const elem of iter) {
    func(elem, idx++)
    yield elem
  }
}

export function * flattenGen<T> (iter: Iterable<Iterable<T>>): Iterable<T> {
  for (const elem of iter) {
    yield * elem
  }
}

export function * chunkGen<T> (iter: Iterable<T>, num: number): Iterable<Array<T>> {
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

export function * chunkWhileGen<T> (iter: Iterable<T>, func: ChunkingPredicate<T>): Iterable<Array<T>> {
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

export function * groupByGen<K, T> (iter: Iterable<T>, func: IndexedMapping<T, K>): Iterable<[K, Array<T>]> {
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

export function * uniqueGen<T> (iter: Iterable<T>, func: IndexedMapping<T, unknown>): Iterable<T> {
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

export function * reverseGen<T> (iter: Iterable<T>): Iterable<T> {
  const buf = Array.from(iter)
  for (let i = buf.length - 1; i >= 0; i--) {
    yield buf[i]
  }
}

export function * sortGen<T> (iter: Iterable<T>, func: Comparator<T>): Iterable<T> {
  const buf = Array.from(iter)
  for (const elem of buf.sort(func)) {
    yield elem
  }
}
