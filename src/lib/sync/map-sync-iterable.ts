import {IndexedMapping} from '../types.js'
import PolySyncIterable from './poly-sync-iterable.js'


class MapSyncIterator<TOrig, TMapped> implements Iterator<TMapped> {
  readonly #mapper: IndexedMapping<TOrig, TMapped>
  readonly #iterator: Iterator<TOrig>
  #index = 0

  constructor (iterator: Iterator<TOrig>, mapper: IndexedMapping<TOrig, TMapped>) {
    this.#iterator = iterator
    this.#mapper = mapper
  }

  next (): IteratorResult<TMapped> {
    const elem = this.#iterator.next()
    return elem?.done ? elem : {value: this.#mapper(elem.value, this.#index++)}
  }
}


function combinedIndexedMapping<TOrig, TInter, TFinal> (
  funcA: IndexedMapping<TOrig, TInter>,
  funcB: IndexedMapping<TInter, TFinal>,
): IndexedMapping<TOrig, TFinal> {
  return (orig, idx) => funcB(funcA(orig, idx), idx)
}

export default class MapSyncIterable<TOrig, TMapped> extends PolySyncIterable<TMapped> {
  readonly #iterable: Iterable<TOrig>
  readonly #mapper: IndexedMapping<TOrig, TMapped>

  constructor (iterable: Iterable<TOrig>, mapper: IndexedMapping<TOrig, TMapped>) {
    super()
    this.#iterable = iterable
    this.#mapper = mapper
  }

  static create<T, U> (iterable: Iterable<T>, mapper: IndexedMapping<T, U>): MapSyncIterable<T, U> {
    return new MapSyncIterable(iterable, mapper)
  }

  [Symbol.iterator] (): Iterator<TMapped> {
    return new MapSyncIterator(this.#iterable[Symbol.iterator](), this.#mapper)
  }

  override map<U> (func: IndexedMapping<TMapped, U>): PolySyncIterable<U> {
    return new MapSyncIterable(this.#iterable, combinedIndexedMapping(this.#mapper, func))
  }
}
