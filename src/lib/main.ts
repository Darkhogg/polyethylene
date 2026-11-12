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

export type * from './async/poly-iterable.js'

export type * from './types.js'

/* top-level `this` is `module.exports` in CommonJS and always `undefined` in ES modules */
if (this !== undefined && typeof process !== 'undefined' && typeof process.emitWarning === 'function') {
  process.emitWarning(
    'CommonJS support for polyethylene is deprecated and will be removed in a future major version. ',
    {type: 'DeprecationWarning', code: 'POLYETHYLENE_COMMONJS'},
  )
}
