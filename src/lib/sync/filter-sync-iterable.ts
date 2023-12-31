import {IndexedPredicate} from '../types.js'
import PolySyncIterable from './poly-sync-iterable.js'


class FilterSyncIterator<T> implements Iterator<T> {
  readonly #predicate: IndexedPredicate<T>
  readonly #iterator: Iterator<T>
  #index = 0

  constructor (iterator: Iterator<T>, predicate: IndexedPredicate<T>) {
    this.#iterator = iterator
    this.#predicate = predicate
  }

  next (): IteratorResult<T> {
    let elem: IteratorResult<T>
    do {
      elem = this.#iterator.next()
    } while (!elem.done && !this.#predicate(elem.value, this.#index++))
    return elem
  }
}


export default class FilterSyncIterable<T> extends PolySyncIterable<T> {
  readonly #iterable: Iterable<T>
  readonly #filter: IndexedPredicate<T>

  constructor (iterable: Iterable<T>, filter: IndexedPredicate<T>) {
    super()
    this.#iterable = iterable
    this.#filter = filter
  }

  static create<T> (iterable: Iterable<T>, filter: IndexedPredicate<T>): FilterSyncIterable<T> {
    return new FilterSyncIterable(iterable, filter)
  }

  [Symbol.iterator] (): Iterator<T> {
    return new FilterSyncIterator(this.#iterable[Symbol.iterator](), this.#filter)
  }
}
