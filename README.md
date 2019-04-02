# Polyethylene

Polyethylene is a wrapping layer around iterators and async iterators that lets you chain
functional operators in a similar way you do with arrays but without the memory overhead or having
to wait for an asynchronous iteration to end.

[![npm version](
https://img.shields.io/npm/v/polyethylene.svg
)](https://www.npmjs.com/package/polyethylene)
[![Build Status](
https://img.shields.io/travis/Darkhogg/polyethylene.svg
)](https://travis-ci.org/Darkhogg/polyethylene)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/Darkhogg/polyethylene.svg)](https://codeclimate.com/github/Darkhogg/polyethylene)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/Darkhogg/polyethylene.svg)](https://codeclimate.com/github/Darkhogg/polyethylene)

## Examples

```javascript
const Poly = require('polyethylene');

// Print the first 10 posts of each user
await Poly.from(findUsers())
  .map(user => Poly.from(findUserPosts(user)).take(10))
  .flat()
  .forEach(post => console.log(post));
```


## Usage

### Options

Most methods accept an `options` object as the end of the arguments.
Apart from any method-specific options, all async methods will accept the following options:

- `preload`, `pl`: If set to `true`, the first element will be requested immediately without waiting for the iteration to start.
  This will likely not be useful most of the time, as the time between first creating the iterable and iterating it is typically
  negligible, but can be useful on situations where the iterable can sit unused for a few milliseconds.
  Using this option means that the first element will *always* be requested even if the iteration never starts, so be mindful
  of using it if the action of obtaining the element has other side-effects.

- `prefetch`, `pf`: If set to `true`, elements are requested before yielding the previous one.
  By doing so, the next element is obtained while the following stages in the iterable pipeline are being executed.
  This options should be used on stages that are slow, such as network calls, 
  Using this option means that some elements are requested even if they are *never* iterated, and beware that multiple prefetches
  on the same pipeline can increase the amount of elements that go unused, so be mindful of using it if the action of obtaining
  the element has other side-effects.


### Factory Methods

All of these functions are in the `Poly` object top-level obtained by requiring `polyethylene`, and
will return an `Iterable` object.


#### `Poly.from(iterable|asyncIterable|generator|asyncGenerator[, options])`

Creates a new `Iterable` from the given argument, which might be:

  - an `iterable`, in which case a `SyncIterable` is returned.
  - an `asyncIterable`, in which case an `AsyncIterable` is returned.
  - a `function` that returns an `iterable` (e.g., a generator function) in which case a `SyncIterable` is returned.
  - a `function` that returns an `asyncIterable` (e.g., an async generator function) in which case a `SyncIterable` is returned.


#### `Poly.assemble(assemblerFunction[, options])`

Creates a new `AsyncIterable` by waiting for the user to call a series of callbacks passed to the `assemblerFunction`.

The passed `assemblerFunction` will receive an object with the following keys:

  - `value`: Call this function with any object to make the iterable yield it.
  - `error`: Call this function with any error to make the iterable throw it.
  - `done`: Call this function to make the iterable end.

Call order is respected and values are buffered if produced faster than consumed, so `error`s and
`done` are triggered after all previous `value`s have been yielded.  If you call any of the
functions after either `error` or `done` are called, it will be ignored.

This function is intended to be used in situations where creating an iterable via generators is
impossible, such as when the iteration comes from an `EventEmitter`, but using `from` is still
preferred otherwise.

As an example, here is how you would assemble an `Iterable` from a stream (note however that Node
streams are already async iterables, so this is not needed):

```
const Poly = require('polyethylene');

const iter = Poly.assemble(({value, error, done}) => {
  const stream = process.stdin; // or any other stream
  stream.on('data', value);
  stream.on('error', error);
  stream.on('end', done);
});
```


#### `Poly.range([from = 0,] to [, step = 1])`

Creates a new `SyncIterable` that will yield numbers `[from..to)` with a given `step`.
If `step` is negative, yields `(to..from]` instead, in reverse order.

```javascript
Poly.range(5); // yields 0, 1, 2, 3, 4
Poly.range(1, 5) // yields 1, 2, 3, 4
Poly.range(0, 5, 2) // yields 0, 2, 4
Poly.range(5, 0, -1) // yields 5, 4, 3, 2, 1
Poly.range(0, 1, 0.2) // yields 0, 0.2, 0.4, 0.6, 0.8 (with precission errors)
```

This is intended to work the same way as `range` works in Python; any deviation from it should be
reported as a bug.


#### `Poly.repeat(value)`

Creates a new `SyncIterable` that will infinitely yield the given `value`.


#### `Poly.iterate(function[, options = {}])`

Creates a new `Iterable` that yields the result of continuously calling the given `function`.
The resulting sequence will be a `SyncIterable` or an `AsyncIterable` depending on whether the function returns Promises or not:

  - If the first call to `function` returns a Promise, an `AsyncIterable` is returned.
    You may force this function to return an `AsyncIterable` by setting `options.async` to a truthy value.
  - If the first call to `function` returns anything but a Promise, a `SyncIterable` is returned.

The passed `function` will be called with the result of the last call and no bound `this`.


#### `Poly.values(object)`

Yields the same elements as `Object.values(object)` but without creating an array in the process.


#### `Poly.keys(object)`

Yields the same elements as `Object.keys(object)` but without creating an array in the process.


#### `Poly.entries(object)`

Yields the same elements as `Object.entries(object)` but without creating an array in the process.



### Transform Operators

These functions transform a sequence in some way, and they all return an `Iterable` object of the
same type as the original, unless stated otherwise.  For `AsyncIterables`, all the functions
received as an arguments can return promises, and will be awaited.


#### `#async()`

Returns an `AsyncIterable` that will yield the same elements as this one.
This has no effect on async sequences, it's intended as a way of converting a sync sequence created
by any of the factory methods to an async sequence so async functions are available in the pipeline.


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

- If `func` is not a function, an exception is thrown.


#### `#map(func = ID)`

Yields the results of applying `func(elem)` to each element.

- If `func` is not a function, an exception is thrown.


#### `#flat()` / `#flatten()`

Yields from each of the elements, that is, performs a `yield *` on each element.

- If `func` returns a value that is not iterable via `yield *`, an exception is thrown.


#### `#flatMap(func = ID)`

Yields from the results of applying `func(elem)` to all elements, that is, performs a `yield *` on
a call to `func` with each element.

- If `func` is not a function, an exception is thrown.
- If `func` returns a value that is not iterable via `yield *`, an exception is thrown.


#### `#group(num = 1)`

Collects the elements in arrays of size `num` and yields them.

- If the original iterable is empty, the resulting one also is.
- The last yielded group might have less than `num` elements.
- The resulting iterable will *never* include empty groups.
- If `num` is not a positive integer, an exception is thrown.


#### `#groupWhile(func = ID)`

Collects the elements in groups determined by the result of calling `func` on the elements.

`func` is called with three arguments:
- `elem`: the element to be selected for the current group
- `lastElem`: the last element included in the current group
- `firstElem`: the first element included in the current group

The return value of that call determines what to do with the element so that:
- if it returns `true`, the element is included in the current group
- if it returns `false`, the element is not included in the current group, and it becomes the first element of the next group

Note that the first element will always be the start of a group, and thus `func` will never be called for it.
Groups cannot be empty

- If the original iterable is empty, the resulting one also is.
- The resulting iterable will *never* include empty groups.
- If `num` is not a positive integer, an exception is thrown.



### Leaf Operators

These functions process the iterable in some way and return a single result.
`SyncIterable`s will return immediately, while `AsyncIterable`s will return a promise, but will act
equivalently otherwise.


#### `#toArray()`

Returns an array containing all elements of this iterable in the order they would have been yielded.


#### `#find(func)`

Returns the first element for which `func(elem)` is truthy.  If the function always returns falsy,
`undefined` will be returned.


#### `#includes(obj)`

Returns whether `obj` is found as an element of this iterable.


#### `#some(func = ID)`

Returns `true` if `func(elem)` is truthy at least for one element, `false` otherwise.
`func` will not be called after it returns truthy..


#### `#every(func = ID)`

Returns `false` if at least for one element, `func(elem)` is falsy, `true` otherwise.
`func` will not be called afterwards.


#### `#reduce(func[, init])`

Calls `func(accumulator, elem)` for every element (except the first one if `init` is not passed)
with the previous result of the call as `accumulator`.  `init` will be used as the first
`accumulator`; if not passed, the first element is used instead.


#### `#forEach(func)`

Calls `func(elem)` for every element `elem`.


#### `#join(glue = ',')`

Concatenates all elements in a string with `glue` between them.


#### `#drain()`

Iterates over all elements without doing anything.
This ensures any side effects of previous stages are executed and, in `AsyncIterables`, the full
iteration can be `await`ed.


## Planned Features

The following are a few planned features I intend to add in the future, in no particular order:

- A `tee`/`fork` method that, from a single iterator, returns N iterators that get the same
  elements or errors in the same order.
- The possibility of running processing functions in parallel as long as elements are coming
  fast enough.
