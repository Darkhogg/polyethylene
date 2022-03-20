/**
 * A library for working with iterables and async iterables in a functional style, by transforming the iterations on
 * the fly and getting results from them.
 *
 * @remarks
 * The entry point for this library is the {@link Poly} namespace, and the main iterable classes are
 * {@link PolySyncIterable} and {@link PolyAsyncIterable.}
 *
 * @packageDocumentation
 */
import {Poly} from './poly.js'

import AsyncIterableBuilder from './builder.js'
import PolySyncIterable from './sync/poly-iterable.js'
import PolyAsyncIterable from './async/poly-iterable.js'

export default Poly
export {Poly, PolySyncIterable, PolyAsyncIterable, AsyncIterableBuilder}
export * from './sync/poly-iterable.js'
export * from './async/poly-iterable.js'

export * from './types.js'
