# Polyethylene

Polyethylene is a wrapping layer around iterators and async iterators that lets you chain
functional operators in a similar way you do with arrays but without the memory overhead.


## Example

```javascript
// Print the first 10 tweets of each user
await Poly.from(findUsers())
  .map(user => Poly.from(findUserTweets(user)).take(10))
  .flatten()
  .forEach(tweet => console.log(tweet));
```

## Usage

### Factory Methods

All of these functions are in the `Poly` object top-level, and will return a `Iterable` object.

#### `.from(iterable|asyncIterable|generator|asyncGenerator)`

Creates a new `Iterable` from the given argument, which might be:

  - an `iterator`, in which case a `SyncIterable` is returned.
  - an `asyncIterator`, in which case an `AsyncIterable` is returned.
  - a `function` that returns an `iterator` (e.g., a generator) in which case a `SyncIterable` is returned.
  - a `function` that returns an `asyncIterator` (e.g., an async generator) in which case a `SyncIterable` is returned.


#### `.range([from = 0,] to [, step = 1])`

Creates a new `SyncIterable` that will yield numbers `[from..to)` with a given `step`.
If `step` is negative, yields `(to..from]` instead, in reverse order.

```javascript
Poly.range(5); // yields 0, 1, 2, 3, 4
Poly.range(1, 5) // yields 1, 2, 3, 4
Poly.range(0, 5, 2) // yields 0, 2, 4
Poly.range(5, 0, -1) // yields 5, 4, 3, 2, 1
Poly.range(0, 1, 0.2) // yields 0, 0.2, 0.4, 0.6, 0.8 (with precission errors)
```

This is intended to work the same way as `range` works in Python; any deviation from it should be reported as a bug.


#### `.repeat(value)`

Creates a new `SyncIterable` that will infinitely yield the given `value`.

#### `.iterate(function[, options = {}])`

Creates a new `Iterable` that yields the result of continuously calling the given `function`.
The resulting sequence will be a `SyncIterable` or an `AsyncIterable` depending on whether the function returns Promises or not:

  - If the first call to `function` returns a Promise, an `AsyncIterable` is returned.
    You may force this function to return an `AsyncIterable` by setting `options.async` to a truthy value.
  - If the first call to `function` returns anything but a Promise, a `SyncIterable` is returned.

The passed `function` will be called with the result of the last call and no bound `this`.


#### `.values(object)`

Yields the same elements as `Object.values(object)` but without creating an array in the process.

#### `.keys(object)`

Yields the same elements as `Object.keys(object)` but without creating an array in the process.

#### `.entries(object)`

Yields the same elements as `Object.entries(object)` but without creating an array in the process.



### Transform Operators

These functions transform a sequence in some way, and they all return a `Iterable` object of the same type as the original, unless stated otherwise.
For `AsyncIterables`, all the functions received as an argument can return promises, and will be awaited.


#### `#async()`

Returns an `AsyncIterable` that will yield the same elements as this one.
This has no effect on async sequences, and it's intended as a way of converting a sync sequence created by any of the
factory methods to an async sequence, so async functions are available in the pipeline.


#### `#drop(num = 0)`

Skips the first `num` elements of the sequence.

- If the sequence yields less than `num` elements, no elements are yielded.
- If `num` is 0 or missing, this is a no-op.
- If `num` is negative or not a number, an exception is thrown.


#### `#take(num = 0)`

Yield only the first `num` elements of the sequence.

- If the sequence yields less than `num` elements, all elements are yielded.
- If `num` is 0 or missing, the sequence will yield nothing.
- If `num` is negative or not a number, an exception is thrown.


#### `#dropWhile(func = ID)`

Skips elements until `func` returns a falsy value, not including the one for which it does.

- The function `func` will be called with each element as argument until it returns a falsy value.
- The function will not be called again after the first falsy value is returned.
- If `func` is not a function, an exception is thrown.


#### `#takeWhile(func = ID)`

Yields elements until `func` returns a falsy value, not including the one for which it does.

- The function `func` will be called with each element as argument until it returns a falsy value.
- The function will not be called again after the first falsy value is returned.
- If `func` is not a function, an exception is thrown.

#### `#filter(func = ID)`

Yields all elements for which `func(elem)` returns true.
If `func` is not a function, an exception is thrown.

#### `#map(func = ID)`

Yields the results of applying `func(elem)` to all elements.
If `func` is not a function, an exception is thrown.

#### `#flatMap(func = ID)`

Yields from the results of applying `func(elem)` to all elements, that is, performs a `yield *` on
If `func` is not a function, an exception is thrown.


### Leaf Operators

These functions process the sequence in some way and return a single result.
`SyncIterable`s will return immediately, while `AsyncIterable`s will return a promise, but act equivalently otherwise.


#### `#toArray()`

Returns an array containing all elements of this sequence in the order they would have been yielded.


#### `#find(func)`

Returns the first element for which `func(elem)` is truthy.  If the function always returns falsy,
`undefined` will be returned.


#### `#includes(obj)`

Returns whether `obj` is found as an element of this sequence.


#### `#some(func = ID)`

Returns `true` if at least for one element `func(elem)` is truthy, `false` otherwise.


#### `#every(func = ID)`

Returns `false` if at least for one element, `func(elem)` is falsy, `true` otherwise.


#### `#reduce(func[, init])`

Calls `func(accumulator, elem)` for every element (except the first if `init` is not passed) `elem` with the previous result of the call as `accumulator`.
`init` will be used as the first `accumulator`; if not passed, the first element is used instead.


#### `#forEach(func)`

Calls `func(elem)` for every element `elem`.


#### `#join(glue = ',')`

Concatenates all elements in a string with `glue` between them.


#### `#drain()`

Iterates over all elements without doing anything.
This ensures any side effects of previous stages are executed and, in `AsyncIterables`, the full iteration can be `await`ed.
