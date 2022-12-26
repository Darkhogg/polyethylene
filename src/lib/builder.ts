import PolyAsyncIterable from './async/poly-iterable.js'

/**
 * A class that helps with building an
 * {@link https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Symbol/asyncIterator | AsyncIterable}
 * from a non-structured source.
 *
 * In order to create the iteration, you must call the {@link AsyncIterableBuilder.value | value},
 * {@link AsyncIterableBuilder.error | error} and {@link AsyncIterableBuilder.done | done} methods with
 * appropriate arguments.
 *
 * @public
 */
export default class AsyncIterableBuilder<T> implements AsyncIterable<T> {
  private _currentPromiseFuncs?: {
    resolve: (value: IteratorResult<T>) => void,
    reject: (err: Error) => void
  }

  private _pendingValues: Array<T> = []
  private _pendingError?: Error
  private _pendingDone: boolean = false

  /** @internal */
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- we need it for docs
  constructor () {}

  /**
   * Gives the underlying iterable a new value to be yielded.
   *
   * @remarks
   * Objects given for iteration will be buffered until they are requested, and are guaranteed to be yielded before
   * errors and before finishing the iteration.
   *
   * If this method is called after {@link AsyncIterableBuilder.error | error}
   * or {@link AsyncIterableBuilder.done | done},
   * the given object is ignored.
   *
   * @param obj - The object to be yielded by the underlying iterable
   */
  value (obj: T): void {
    if (this._pendingDone) {
      return
    }

    if (this._currentPromiseFuncs) {
      this._currentPromiseFuncs.resolve({value: obj})
      this._currentPromiseFuncs = undefined
      return
    }

    this._pendingValues.push(obj)
  }

  /**
   * Makes the underlying iterable throw the given `error` object.
   *
   * @remarks
   * Any values that were given with {@link AsyncIterableBuilder.value | value} will be yielded before the error is
   * thrown.
   *
   * Calling {@link AsyncIterableBuilder.value | value} or {@link AsyncIterableBuilder.done | done} after calling this
   * method or calling this method after calling {@link AsyncIterableBuilder.done | done} will act as a no-op.
   *
   * @param error - The error to be thrown by the underlying iterable
   */
  error (error: Error): void {
    if (this._pendingDone) {
      return
    }

    this._pendingDone = true
    if (this._currentPromiseFuncs) {
      this._currentPromiseFuncs.reject(error)
      this._currentPromiseFuncs = undefined
      return
    }

    this._pendingError = error
  }

  /**
   * Makes the underlying iterable finish the iteration.
   *
   * @remarks
   * Any values that were given with {@link AsyncIterableBuilder.value | value} will be yielded
   * before the iteration ends.
   *
   * Calling {@link AsyncIterableBuilder.value | value} or {@link AsyncIterableBuilder.error | error} after calling this
   * method or calling this method after calling {@link AsyncIterableBuilder.error | error} will act as a no-op.
   */
  done (): void {
    if (this._pendingDone) {
      return
    }

    if (this._currentPromiseFuncs) {
      this._currentPromiseFuncs.resolve({done: true, value: undefined})
      this._currentPromiseFuncs = undefined
    }

    this._pendingDone = true
  }

  /**
   * Get a {@link PolyAsyncIterable} that iterates the elements as determined by calls to `this` object's
   * {@link AsyncIterableBuilder.value | value}, {@link AsyncIterableBuilder.error | error} and
   * {@link AsyncIterableBuilder.done | done} methods.
   *
   * @returns A {@link PolyAsyncIterable} that yields elements as determined by the calls to `this`' methods
   */
  toPolyAsyncIterable (): PolyAsyncIterable<T> {
    return new PolyAsyncIterable(this)
  }

  /**
   * Allows this class to work as a regular `AsyncIterable<T>`
   *
   * @returns an async iterable that yields elements as determined by the calls to `this`' methods
   */
  [Symbol.asyncIterator] (): AsyncIterator<T> {
    const outerThis = this

    return {
      next (): Promise<IteratorResult<T>> {
        if (outerThis._pendingValues.length) {
          return Promise.resolve({done: false, value: outerThis._pendingValues.shift()!})
        }
        if (outerThis._pendingError) {
          outerThis._pendingError = undefined
          return Promise.reject(outerThis._pendingError)
        }
        if (outerThis._pendingDone) {
          return Promise.resolve({done: true, value: undefined})
        }

        return new Promise((accept, reject) => {
          outerThis._currentPromiseFuncs = {resolve: accept, reject}
        })
      },
    }
  }
}
