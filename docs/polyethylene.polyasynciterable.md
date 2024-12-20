<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md)

## PolyAsyncIterable class

An `AsyncIterable<T>` with a suite of methods for transforming the iteration into other iterations or to get a single result from it.

This class works as an async version of [PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->, but all methods accept async function where possible and will always return either `PolyAsyncIterables` or a `Promise` to a value.

\#\# Concurrency Many operations of this class accept as a final argument an [options object](./polyethylene.concurrencyoptions.md) than can specify some options for concurrent operations.

- The `concurrency` option will specify how many times whatever `func` you pass is called before waiting for its results. Effectively, this is the number of promises that can be pending at the same time. If not specified, it will default to 0, meaning no concurrency. Must be a non-negative integer. - The `bufferSize` option will specify the size of the internal buffer used to store the pending and completed promises. Effectively, this is how many results will be prefetched. If not specified, it will default to `concurrency`<!-- -->, meaning no extra intermediate results are stored. Must be a positive integer greater or equal to `concurrency`<!-- -->.

A concurrency value of 0 acts the same as a 1 concurrency-wise, but disables the concurrency completely, preventing any values to be requested before actually needed.

Specifying concurrency greater or equal to 1 will make more elements be requested of the previous iterator than actually requested of the current one, similarly to [PolyAsyncIterable.prefetch()](./polyethylene.polyasynciterable.prefetch.md)<!-- -->.

**Signature:**

```typescript
export default class PolyAsyncIterable<T> implements AsyncIterable<T> 
```
**Implements:** AsyncIterable&lt;T&gt;

## Remarks

The constructor for this class is marked as internal. Third-party code should not call the constructor directly or create subclasses that extend the `PolyAsyncIterable` class.

## Methods

<table><thead><tr><th>

Method


</th><th>

Modifiers


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

[\[Symbol.asyncIterator\]()](./polyethylene.polyasynciterable._symbol.asynciterator_.md)


</td><td>


</td><td>

Allows this class to work as a regular `AsyncIterable<T>`


</td></tr>
<tr><td>

[append(other)](./polyethylene.polyasynciterable.append.md)


</td><td>


</td><td>

Return a new iteration that will iterate over `this`<!-- -->, then over `other`<!-- -->.


</td></tr>
<tr><td>

[async()](./polyethylene.polyasynciterable.async.md)


</td><td>


</td><td>

Return `this`<!-- -->.


</td></tr>
<tr><td>

[chunk(num)](./polyethylene.polyasynciterable.chunk.md)


</td><td>


</td><td>

Return an iteration of arrays of size `num` (except possibly the last) containing groupings of elements of `this` iteration.


</td></tr>
<tr><td>

[chunkWhile(func)](./polyethylene.polyasynciterable.chunkwhile.md)


</td><td>


</td><td>

Return an iteration of arrays with elements of this separated based on the result of calling `func(elements)`<!-- -->.


</td></tr>
<tr><td>

[complete(options)](./polyethylene.polyasynciterable.complete.md)


</td><td>


</td><td>

Perform this iteration doing nothing.


</td></tr>
<tr><td>

[concat(other)](./polyethylene.polyasynciterable.concat.md)


</td><td>


</td><td>

Return a new iteration that will iterate over `this`<!-- -->, then over `other`<!-- -->.


</td></tr>
<tr><td>

[count()](./polyethylene.polyasynciterable.count.md)


</td><td>


</td><td>

Return the number of elements on this iteration.


</td></tr>
<tr><td>

[drop(num)](./polyethylene.polyasynciterable.drop.md)


</td><td>


</td><td>

Return a new iteration that skips the first `num` elements. If there were less than `num` elements in the iteration, no elements are yielded.


</td></tr>
<tr><td>

[dropLast(num)](./polyethylene.polyasynciterable.droplast.md)


</td><td>


</td><td>

Return a new iteration that skips the last `num` elements. If there were less than `num` elements in the iteration, no elements are yielded.


</td></tr>
<tr><td>

[dropWhile(func)](./polyethylene.polyasynciterable.dropwhile.md)


</td><td>


</td><td>

Return a new iteration that skips the first few elements for which `func(element)` returns `true`<!-- -->.


</td></tr>
<tr><td>

[duplicate(num)](./polyethylene.polyasynciterable.duplicate.md)


</td><td>


</td><td>

Returns a tuple containing `num` iterables that will yield independent copies of the elements yielded by `this`<!-- -->.


</td></tr>
<tr><td>

[every(func, options)](./polyethylene.polyasynciterable.every.md)


</td><td>


</td><td>

Returns `true` if calling `func(element)` returns `true` for every element, and `false` otherwise


</td></tr>
<tr><td>

[filter(func, options)](./polyethylene.polyasynciterable.filter.md)


</td><td>


</td><td>

Return an iteration of the elements of `this` for which `func(element)` returns `true`<!-- -->.


</td></tr>
<tr><td>

[filter(func, options)](./polyethylene.polyasynciterable.filter_1.md)


</td><td>


</td><td>

Return an iteration of the elements of `this` for which `func(element)` returns `true`<!-- -->.


</td></tr>
<tr><td>

[filterNotNullish()](./polyethylene.polyasynciterable.filternotnullish.md)


</td><td>


</td><td>

Return an iteration of all the elements as `this` that aren't `null` or `undefined`<!-- -->.


</td></tr>
<tr><td>

[find(func, options)](./polyethylene.polyasynciterable.find.md)


</td><td>


</td><td>

Returns the first element for which `func(element)` returns `true`<!-- -->, or `undefined` if it never does.


</td></tr>
<tr><td>

[find(func, options)](./polyethylene.polyasynciterable.find_1.md)


</td><td>


</td><td>

Returns the first element for which `func(element)` returns `true`<!-- -->, or `undefined` if it never does.


</td></tr>
<tr><td>

[findIndex(func, options)](./polyethylene.polyasynciterable.findindex.md)


</td><td>


</td><td>

Returns the index of the first element for which `func(element)` returns `true`<!-- -->, or `-1` if it never does.


</td></tr>
<tr><td>

[findLast(func, options)](./polyethylene.polyasynciterable.findlast.md)


</td><td>


</td><td>

Returns the last element for which `func(element)` returns `true`<!-- -->, or `undefined` if it never does.


</td></tr>
<tr><td>

[findLast(func, options)](./polyethylene.polyasynciterable.findlast_1.md)


</td><td>


</td><td>

Returns the last element for which `func(element)` returns `true`<!-- -->, or `undefined` if it never does.


</td></tr>
<tr><td>

[findLastIndex(func, options)](./polyethylene.polyasynciterable.findlastindex.md)


</td><td>


</td><td>

Returns the index of the last element for which `func(element)` returns `true`<!-- -->, or `-1` if it never does.


</td></tr>
<tr><td>

[flat(this)](./polyethylene.polyasynciterable.flat.md)


</td><td>


</td><td>

Return an iteration of the yielded elements of the sub-iterables.


</td></tr>
<tr><td>

[flatMap(func, options)](./polyethylene.polyasynciterable.flatmap.md)


</td><td>


</td><td>

Return an iteration of elements of the sub-iterables that result from calling `func(element)` for every element in `this`<!-- -->.


</td></tr>
<tr><td>

[flatten(this)](./polyethylene.polyasynciterable.flatten.md)


</td><td>


</td><td>

Return an iteration of the yielded elements of the sub-iterables.


</td></tr>
<tr><td>

[forEach(func, options)](./polyethylene.polyasynciterable.foreach.md)


</td><td>


</td><td>

Call a function for each element of `this` iteration.


</td></tr>
<tr><td>

[groupBy(func, options)](./polyethylene.polyasynciterable.groupby.md)


</td><td>


</td><td>

Return an iteration of group pairs, where the first element is a \_group key\_ and the second is an iterable of all the elements for which `func(element)` returned the key.


</td></tr>
<tr><td>

[includes(obj)](./polyethylene.polyasynciterable.includes.md)


</td><td>


</td><td>

Returns whether an element is present in this iteration.


</td></tr>
<tr><td>

[join(glue, options)](./polyethylene.polyasynciterable.join.md)


</td><td>


</td><td>

Return the result of joining the elements of `this` with the given `glue`<!-- -->, or `','` if no glue is given.


</td></tr>
<tr><td>

[map(func, options)](./polyethylene.polyasynciterable.map.md)


</td><td>


</td><td>

Return an iteration of the result of calling `func(element)` for every element in `this`<!-- -->.


</td></tr>
<tr><td>

[mapKeys(this, func, options)](./polyethylene.polyasynciterable.mapkeys.md)


</td><td>


</td><td>

Return an iteration of the pairs resulting of calling `func(element)` for every element in `this` and using it as the first element of the pair (the \*key\*) and preserving the second (the \*value\*).


</td></tr>
<tr><td>

[mapValues(this, func, options)](./polyethylene.polyasynciterable.mapvalues.md)


</td><td>


</td><td>

Return an iteration of the pairs resulting of calling `func(element)` for every element in `this` and using it as the second element of the pair (the \*value\*) and preserving the first (the \*key\*).


</td></tr>
<tr><td>

[prefetch()](./polyethylene.polyasynciterable.prefetch.md)


</td><td>


</td><td>

Return the same iteration, but with its elements requested with anticipation to allow for asynchronous operations to begin and reduce wait times.


</td></tr>
<tr><td>

[prepend(other)](./polyethylene.polyasynciterable.prepend.md)


</td><td>


</td><td>

Return a new iteration that will iterate over `other`<!-- -->, then over `this`<!-- -->.


</td></tr>
<tr><td>

[reduce(reducer, init)](./polyethylene.polyasynciterable.reduce.md)


</td><td>


</td><td>

Returns the result of calling the passed `reducer` for all elements of the iteration and the result of the previous call to `reducer`<!-- -->, starting by passing `init` or, if not present, the first element of the iteration.


</td></tr>
<tr><td>

[reduce(reducer, init)](./polyethylene.polyasynciterable.reduce_1.md)


</td><td>


</td><td>

Returns the result of calling the passed `reducer` for all elements of the iteration and the result of the previous call to `reducer`<!-- -->, starting by passing `init`<!-- -->.


</td></tr>
<tr><td>

[reverse()](./polyethylene.polyasynciterable.reverse.md)


</td><td>


</td><td>

Return an iteration of the elements of `this` in reverse order.


</td></tr>
<tr><td>

[slice(start, end)](./polyethylene.polyasynciterable.slice.md)


</td><td>


</td><td>

Return a new iteration that starts from the `start`<!-- -->th element (included) and ends at the `end`<!-- -->th element (excluded) of `this`<!-- -->.


</td></tr>
<tr><td>

[some(func, options)](./polyethylene.polyasynciterable.some.md)


</td><td>


</td><td>

Returns `true` if calling `func(element)` returns `true` for at least one element, and `false` otherwise


</td></tr>
<tr><td>

[sort(func)](./polyethylene.polyasynciterable.sort.md)


</td><td>


</td><td>

Return an iteration of the elements of `this` sorted according to `func`


</td></tr>
<tr><td>

[take(num)](./polyethylene.polyasynciterable.take.md)


</td><td>


</td><td>

Return a new iteration that iterates only over the first `num` elements. If there were less than than `num` elements in the iteration, all elements are yielded with no additions.


</td></tr>
<tr><td>

[takeLast(num)](./polyethylene.polyasynciterable.takelast.md)


</td><td>


</td><td>

Return a new iteration that iterates only over the last `num` elements. If there were less than than `num` elements in the iteration, all elements are yielded with no additions.


</td></tr>
<tr><td>

[takeWhile(func)](./polyethylene.polyasynciterable.takewhile.md)


</td><td>


</td><td>

Return a new iteration that yields the first few elements for which `func(element)` returns `true`<!-- -->.


</td></tr>
<tr><td>

[takeWhile(func)](./polyethylene.polyasynciterable.takewhile_1.md)


</td><td>


</td><td>

Return a new iteration that yields the first few elements for which `func(element)` returns `true`<!-- -->.


</td></tr>
<tr><td>

[tap(func, options)](./polyethylene.polyasynciterable.tap.md)


</td><td>


</td><td>

Return an iteration of the same elements as `this` after calling `func(element)` for all elements.


</td></tr>
<tr><td>

[toArray()](./polyethylene.polyasynciterable.toarray.md)


</td><td>


</td><td>

Return an array of all elements of this iteration in the same order that were yielded.


</td></tr>
<tr><td>

[toMap(this)](./polyethylene.polyasynciterable.tomap.md)


</td><td>


</td><td>

Return a `Map` made from the entries of `this`<!-- -->. This method is roughly equivalent to calling `new Map(iter.toArray())`<!-- -->.


</td></tr>
<tr><td>

[toObject(this)](./polyethylene.polyasynciterable.toobject.md)


</td><td>


</td><td>

Return an object made from the entries of `this`<!-- -->. This method is roughly equivalent to calling `Object.fromEntires(iter.toArray())`<!-- -->.


</td></tr>
<tr><td>

[toPartitionArrays(func, options)](./polyethylene.polyasynciterable.topartitionarrays.md)


</td><td>


</td><td>

Splits this iteration into two arrays, one with elements for which `func(element)` returns `true` (the \_truthy elements\_) and one for which it returns `false` (the \_falsy elements\_).


</td></tr>
<tr><td>

[toPartitionArrays(func, options)](./polyethylene.polyasynciterable.topartitionarrays_1.md)


</td><td>


</td><td>

Splits this iteration into two arrays, one with elements for which `func(element)` returns `true` (the \_truthy elements\_) and one for which it returns `false` (the \_falsy elements\_).


</td></tr>
<tr><td>

[unique(func, options)](./polyethylene.polyasynciterable.unique.md)


</td><td>


</td><td>

Return an iteration of unique elements, where two elements are considered equal if the result of `func(element)` is the same for both elements.


</td></tr>
</tbody></table>
