/**
 * A function that receives an object (`elem`) and its `index` in the iteration and returns a `boolean` value.
 *
 * @typeParam T - The type of the `elem` argument
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns A `boolean` value
 *
 * @public
 */
export type IndexedPredicate<T> = (elem: T, index: number) => boolean

/**
 * A function that receives an object (`elem`) and its `index` in the iteration and returns a `boolean` value indicating
 * if `elem` is of the generic type `U`
 *
 * @typeParam T - The type of the `elem` argument
 * @typeParam U - The type asserted by this function
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns A `boolean` value indicating if `elem` is of type `U`
 *
 * @public
 */
export type IndexedTypePredicate<T, U extends T> = (elem: T, index: number) => elem is U

/**
 * A function that receives an object (`elem`) and its `index` in the iteration and returns a `boolean` value or a
 * `Promise` to a `boolean` value.
 *
 * @typeParam T - The type of the `elem` argument
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns A `boolean` value or a `Promise` to a `boolean` value
 *
 * @public
 */
export type AsyncIndexedPredicate<T> = (elem: T, index: number) => boolean | PromiseLike<boolean>

/**
 * A function that receives an object (`elem`) and its `index` in the iteration and returns a different object
 *
 * @typeParam T - The type of the `elem` argument
 * @typeParam U - The return type of the function
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns Some other value
 *
 * @public
 */
export type IndexedMapping<T, U> = (elem: T, index: number) => U

/**
 * A function that receives an object (`elem`) and its `index` in the iteration and returns a different object or a
 * `Promise` to a different object
 *
 * @typeParam T - The type of the `elem` argument
 * @typeParam U - The return type of the function
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns Some other value or a `Promise` to some other value
 *
 * @public
 */
export type AsyncIndexedMapping<T, U> = (elem: T, index: number) => U | PromiseLike<U>

/**
 * A function that receives an object (`elem`) and its `index` in the iteration and doesn't return anything
 *
 * @typeParam T - The type of the `elem` argument
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 *
 * @public
 */
export type IndexedRunnable<T> = (elem: T, index: number) => void

/**
 * A function that receives an object (`elem`) and its `index` in the iteration and either returns a `Promise` to
 * nothing or doesn't return anything
 *
 * @typeParam T - The type of the `elem` argument
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns a `Promise` to an ignored value or nothing
 *
 * @public
 */
export type AsyncIndexedRunnable<T> = (elem: T, index: number) => void | PromiseLike<void>

/**
 * A function that receives an accumulated result, an element of an iteration, and returns a new accumulated result
 * for the next call or as a final return value.
 *
 * @typeParam T - The type of the iteration elements
 * @typeParam U - The type of the accumulated result
 * @param acc - The previously accumulated value
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns The new accumulated result
 *
 * @public
 */
export type IndexedReducer<T, U> = (acc: U, item: T, index: number) => U

/**
 * A function that receives an accumulated result, an element of an iteration, and returns a new accumulated result or
 * a promise to a new accumulated result for the next call or as a final return value.
 *
 * @typeParam T - The type of the iteration elements
 * @typeParam U - The type of the accumulated result
 * @param acc - The previously accumulated value
 * @param elem - An element of the iteration
 * @param index - The index of `elem` in the iteration
 * @returns The new accumulated result or a promise to the new accumulated result
 *
 * @public
 */
export type AsyncIndexedReducer<T, U> = (acc: U, item: T, index: number) => U | PromiseLike<U>

/**
 * A function that receives an element (`elem`) of the iteration and the first and last element of a chunk, and returns
 * a boolean value representing whether `elem` should be added to the current chunk (if `true`) or be the start of a new
 * chunk (if `false`)
 *
 * @typeParam T - The type of the iteration elements
 * @param elem - An element of the iteration
 * @param lastElem - The last element of the current chunk
 * @param firstElem - The first element of the current chunk
 * @returns Whether `elem` should be added to the current chunk (`true`) or be the start of a new chunk (`false`)
 *
 * @public
 */
export type ChunkingPredicate<T> = (elem: T, lastElem: T, firstElem: T) => boolean

/**
 * A function that receives an element (`elem`) of the iteration and the first and last element of a chunk, and returns
 * a boolean value or a `Promise` to a boolean value representing whether `elem` should be added to the current chunk
 * (if `true`) or be the start of a new chunk (if `false`)
 *
 * @typeParam T - The type of the iteration elements
 * @param elem - An element of the iteration
 * @param lastElem - The last element of the current chunk
 * @param firstElem - The first element of the current chunk
 * @returns A boolean value or a `Promise` to a boolean value representing whether `elem` should be added to the
 * current chunk (`true`) or be the start of a new chunk (`false`)
 *
 * @public
 */
export type AsyncChunkingPredicate<T> = (elem: T, lastElem: T, firstElem: T) => boolean | PromiseLike<boolean>

/**
 * A function that receives two objects `elemA` and `elemB` and returns a number value that is negative if `elemA`
 * should be sorted before `elemB`, positive if `elemA` should be sorted after `elemB`, or `0` if they should be sorted
 * at the same position.
 *
 * @typeParam T - The type of the iteration elements
 * @param elemA - the first element
 * @param elemB - the second element
 * @returns A number representing the sorting of `elemA` and `elemB` with respect to each other, as defined above
 *
 * @public
 */
export type Comparator<T> = (elemA: T, elemB: T) => number
