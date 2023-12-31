/**
 * A library for working with iterables and async iterables in a functional style, by transforming the iterations on
 * the fly and getting results from them.
 *
 * @remarks
 * The entry point for this library is the {@link Poly} namespace, and the main iterable classes are
 * {@link PolySyncIterable} and {@link PolyAsyncIterable}.
 *
 * @packageDocumentation
 */
import {Poly} from './poly.js'

import AsyncIterableBuilder from './builder.js'
import {PolySyncIterable} from './sync/main.js'
import PolyAsyncIterable from './async/poly-iterable.js'

export default Poly
export {Poly, PolySyncIterable, PolyAsyncIterable, AsyncIterableBuilder}

export type * from './sync/poly-sync-iterable.js'
export type * from './async/poly-iterable.js'

export type * from './types.js'
