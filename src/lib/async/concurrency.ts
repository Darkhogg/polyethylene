import type {ConcurrencyOptions} from './poly-iterable.js'

export interface ConcurrentMapperItem<T, U> {
  original: T,
  mapped: U,
  index: number,
}

export type ConcurrentMapperFunction<T, U> = (item: T, index: number) => U | PromiseLike<U>

interface ConcurrentMapperBufferItem<T, U> {
  originalPromise: Promise<IteratorResult<T>>
  original?: IteratorResult<T>
  done?: boolean,
  mappedPromise: Promise<void | U>
  index: number
}


export class ConcurrentMapper<T, U> implements AsyncIterableIterator<ConcurrentMapperItem<T, U>> {
  readonly #iterator: AsyncIterator<T>
  #iteratorNextIndex = 0
  #iteratorDone = false

  readonly #mapper: ConcurrentMapperFunction<T, U>

  readonly #concurrency: number

  readonly #buffer: Array<ConcurrentMapperBufferItem<T, U>>
  #bufferCurrentIndex = 0
  #bufferActiveSize = 0
  #bufferUsedSize = 0


  constructor (
    iteratorOrIterable: AsyncIterable<T>,
    mapper: ConcurrentMapperFunction<T, U>,
    options: ConcurrencyOptions,
  ) {
    const concurrency = Math.floor(options.concurrency ?? 0)
    const bufferSize = Math.floor(options.bufferSize ?? Math.max(concurrency, 1))

    if (concurrency < 0) throw new TypeError('concurrency must be >= 0')
    if (bufferSize < concurrency) throw new TypeError('buffer size must be >= concurrency')

    this.#iterator = iteratorOrIterable[Symbol.asyncIterator]()
    this.#mapper = mapper
    this.#concurrency = concurrency
    this.#buffer = Array(bufferSize).fill(null)
  }

  async next (): Promise<IteratorResult<ConcurrentMapperItem<T, U>>> {
    if (this.#iteratorDone) {
      return {value: undefined, done: true}
    }

    this.#fillBuffer()

    const bufferItem = this.#buffer[this.#bufferCurrentIndex]
    this.#bufferCurrentIndex = (this.#bufferCurrentIndex + 1) % this.#buffer.length
    this.#bufferUsedSize--

    const result = await bufferItem.mappedPromise
    if (bufferItem.done) {
      this.#iteratorDone = true
      return {done: true, value: undefined}
    } else {
      const item: ConcurrentMapperItem<T, U> = {
        original: bufferItem.original!.value,
        mapped: result!,
        index: bufferItem.index,
      }
      return {done: false, value: item}
    }
  }

  #fillBuffer (): void {
    while (
      !this.#iteratorDone &&
      this.#bufferUsedSize < this.#buffer.length &&
      this.#bufferActiveSize < Math.max(this.#concurrency, 1)
    ) {
      const index = this.#iteratorNextIndex++
      const originalPromise = this.#iterator.next()

      const bufferItem: ConcurrentMapperBufferItem<T, U> = {
        index,
        originalPromise,
        mappedPromise: originalPromise.then((original) => { // eslint-disable-line consistent-return
          bufferItem.original = original
          bufferItem.done = original.done

          if (!original.done) {
            return this.#mapper(original.value, index)
          }
        }),
      }

      const bufferIndex = (this.#bufferCurrentIndex + this.#bufferUsedSize) % this.#buffer.length
      this.#buffer[bufferIndex] = bufferItem

      this.#bufferActiveSize++
      this.#bufferUsedSize++
      bufferItem.mappedPromise.then(() => {
        this.#bufferActiveSize--
        if (this.#concurrency > 0) {
          this.#fillBuffer()
        }
      })
    }
  }

  [Symbol.asyncIterator] (): AsyncIterableIterator<ConcurrentMapperItem<T, U>> {
    return this
  }
}
