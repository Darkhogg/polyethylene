<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md)

## PolySyncIterable class

A `SyncIterable<T>` with a suite of methods for transforming the iteration into other iterations or to get a single result from it.

The methods of this class are intended to resemble those of `Array`<!-- -->, with added utilities where appropriate and made for any kind of iterable.

**Signature:**

```typescript
export default abstract class PolySyncIterable<T> implements Iterable<T> 
```
**Implements:** Iterable&lt;T&gt;

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [\[Symbol.iterator\]()](./polyethylene.polysynciterable._symbol.iterator_.md) | <code>abstract</code> | Allows this class to work as a regular <code>Iterable&lt;T&gt;</code> |
|  [append(other)](./polyethylene.polysynciterable.append.md) |  | Return a new iteration that will iterate over <code>this</code>, then over <code>other</code>. |
|  [async()](./polyethylene.polysynciterable.async.md) |  | Return an async version of this same iteration. |
|  [chunk(num)](./polyethylene.polysynciterable.chunk.md) |  | Return an iteration of arrays of size <code>num</code> (except possibly the last) containing groupings of elements of <code>this</code> iteration. |
|  [chunkWhile(func)](./polyethylene.polysynciterable.chunkwhile.md) |  | Return an iteration of arrays with elements of this separated based on the result of calling <code>func(elements)</code>. |
|  [complete()](./polyethylene.polysynciterable.complete.md) |  | Perform this iteration doing nothing. |
|  [concat(other)](./polyethylene.polysynciterable.concat.md) |  | Return a new iteration that will iterate over <code>this</code>, then over <code>other</code>. |
|  [count()](./polyethylene.polysynciterable.count.md) |  | Return the number of elements on this iteration. |
|  [drop(num)](./polyethylene.polysynciterable.drop.md) |  | Return a new iteration that skips the first <code>num</code> elements. If there were less than <code>num</code> elements in the iteration, no elements are yielded. |
|  [dropLast(num)](./polyethylene.polysynciterable.droplast.md) |  | Return a new iteration that skips the last <code>num</code> elements. If there were less than <code>num</code> elements in the iteration, no elements are yielded. |
|  [dropWhile(func)](./polyethylene.polysynciterable.dropwhile.md) |  | Return a new iteration that skips the first few elements for which <code>func(element)</code> returns <code>true</code>. |
|  [duplicate(num)](./polyethylene.polysynciterable.duplicate.md) |  | Returns a tuple containing <code>num</code> iterables that will yield independent copies of the elements yielded by <code>this</code>. |
|  [every(func)](./polyethylene.polysynciterable.every.md) |  | Returns <code>true</code> if calling <code>func(element)</code> returns <code>true</code> for every element, and <code>false</code> otherwise |
|  [filter(func)](./polyethylene.polysynciterable.filter.md) |  | Return an iteration of the elements of <code>this</code> for which <code>func(element)</code> returns <code>true</code>. |
|  [filter(func)](./polyethylene.polysynciterable.filter_1.md) |  | Return an iteration of the elements of <code>this</code> for which <code>func(element)</code> returns <code>true</code>. |
|  [filterNotNullish()](./polyethylene.polysynciterable.filternotnullish.md) |  | Return an iteration of all the elements as <code>this</code> that aren't <code>null</code> or <code>undefined</code>. |
|  [find(func)](./polyethylene.polysynciterable.find.md) |  | Returns the first element for which <code>func(element)</code> returns <code>true</code>, or <code>undefined</code> if it never does. |
|  [find(func)](./polyethylene.polysynciterable.find_1.md) |  | Returns the first element for which <code>func(element)</code> returns <code>true</code>, or <code>undefined</code> if it never does. |
|  [findIndex(func)](./polyethylene.polysynciterable.findindex.md) |  | Returns the index of the first element for which <code>func(element)</code> returns <code>true</code>, or <code>-1</code> if it never does. |
|  [findLast(func)](./polyethylene.polysynciterable.findlast.md) |  | Returns the last element for which <code>func(element)</code> returns <code>true</code>, or <code>undefined</code> if it never does. |
|  [findLast(func)](./polyethylene.polysynciterable.findlast_1.md) |  | Returns the last element for which <code>func(element)</code> returns <code>true</code>, or <code>undefined</code> if it never does. |
|  [findLastIndex(func)](./polyethylene.polysynciterable.findlastindex.md) |  | Returns the index of the last element for which <code>func(element)</code> returns <code>true</code>, or <code>-1</code> if it never does. |
|  [flat(this)](./polyethylene.polysynciterable.flat.md) |  | Return an iteration of the yielded elements of the sub-iterables. |
|  [flatMap(func)](./polyethylene.polysynciterable.flatmap.md) |  | Return an iteration of elements of the sub-iterables that result from calling <code>func(element)</code> for every element in <code>this</code>. |
|  [flatten(this)](./polyethylene.polysynciterable.flatten.md) |  | Return an iteration of the yielded elements of the sub-iterables. |
|  [forEach(func)](./polyethylene.polysynciterable.foreach.md) |  | Call a function for each element of <code>this</code> iteration. |
|  [groupBy(func)](./polyethylene.polysynciterable.groupby.md) |  | Return an iteration of group pairs, where the first element is a \_group key\_ and the second is an iterable of all the elements for which <code>func(element)</code> returned the key. |
|  [includes(obj)](./polyethylene.polysynciterable.includes.md) |  | Returns whether an element is present in this iteration. |
|  [join(glue)](./polyethylene.polysynciterable.join.md) |  | Return the result of joining the elements of <code>this</code> with the given <code>glue</code>, or <code>','</code> if no glue is given. |
|  [map(func)](./polyethylene.polysynciterable.map.md) |  | Return an iteration of the result of calling <code>func(element)</code> for every element in <code>this</code>. |
|  [mapKeys(this, func)](./polyethylene.polysynciterable.mapkeys.md) |  | Return an iteration of the pairs resulting of calling <code>func(element)</code> for every element in <code>this</code> and using it as the first element of the pair (the \*key\*) and preserving the second (the \*value\*). |
|  [mapValues(this, func)](./polyethylene.polysynciterable.mapvalues.md) |  | Return an iteration of the pairs resulting of calling <code>func(element)</code> for every element in <code>this</code> and using it as the second element of the pair (the \*value\*) and preserving the first (the \*key\*). |
|  [prepend(other)](./polyethylene.polysynciterable.prepend.md) |  | Return a new iteration that will iterate over <code>other</code>, then over <code>this</code>. |
|  [reduce(reducer, init)](./polyethylene.polysynciterable.reduce.md) |  | Returns the result of calling the passed <code>reducer</code> for all elements of the iteration and the result of the previous call to <code>reducer</code>, starting by passing <code>init</code> or, if not present, the first element of the iteration. |
|  [reduce(reducer, init)](./polyethylene.polysynciterable.reduce_1.md) |  | Returns the result of calling the passed <code>reducer</code> for all elements of the iteration and the result of the previous call to <code>reducer</code>, starting by passing <code>init</code>. |
|  [reverse()](./polyethylene.polysynciterable.reverse.md) |  | Return an iteration of the elements of <code>this</code> in reverse order. |
|  [slice(start, end)](./polyethylene.polysynciterable.slice.md) |  | Return a new iteration that starts from the <code>start</code>th element (included) and ends at the <code>end</code>th element (excluded) of <code>this</code>. |
|  [some(func)](./polyethylene.polysynciterable.some.md) |  | Returns <code>true</code> if calling <code>func(element)</code> returns <code>true</code> for at least one element, and <code>false</code> otherwise |
|  [sort(func)](./polyethylene.polysynciterable.sort.md) |  | Return an iteration of the elements of <code>this</code> sorted according to <code>func</code> |
|  [take(num)](./polyethylene.polysynciterable.take.md) |  | Return a new iteration that iterates only over the first <code>num</code> elements. If there were less than than <code>num</code> elements in the iteration, all elements are yielded with no additions. |
|  [takeLast(num)](./polyethylene.polysynciterable.takelast.md) |  | Return a new iteration that iterates only over the last <code>num</code> elements. If there were less than than <code>num</code> elements in the iteration, all elements are yielded with no additions. |
|  [takeWhile(func)](./polyethylene.polysynciterable.takewhile.md) |  | Return a new iteration that yields the first few elements for which <code>func(element)</code> returns <code>true</code>. |
|  [takeWhile(func)](./polyethylene.polysynciterable.takewhile_1.md) |  | Return a new iteration that yields the first few elements for which <code>func(element)</code> returns <code>true</code>. |
|  [tap(func)](./polyethylene.polysynciterable.tap.md) |  | Return an iteration of the same elements as <code>this</code> after calling <code>func(element)</code> for all elements. |
|  [toArray()](./polyethylene.polysynciterable.toarray.md) |  | Return an array of all elements of this iteration in the same order that were yielded. |
|  [toMap(this)](./polyethylene.polysynciterable.tomap.md) |  | Return a <code>Map</code> made from the entries of <code>this</code>. This method is roughly equivalent to calling <code>new Map(iter.toArray())</code>. |
|  [toObject(this)](./polyethylene.polysynciterable.toobject.md) |  | Return an object made from the entries of <code>this</code>. This method is roughly equivalent to calling <code>Object.fromEntires(iter.toArray())</code>. |
|  [toPartitionArrays(func)](./polyethylene.polysynciterable.topartitionarrays.md) |  | Splits this iteration into two arrays, one with elements for which <code>func(element)</code> returns <code>true</code> (the \_truthy elements\_) and one for which it returns <code>false</code> (the \_falsy elements\_). |
|  [toPartitionArrays(func)](./polyethylene.polysynciterable.topartitionarrays_1.md) |  | Splits this iteration into two arrays, one with elements for which <code>func(element)</code> returns <code>true</code> (the \_truthy elements\_) and one for which it returns <code>false</code> (the \_falsy elements\_). |
|  [unique(func)](./polyethylene.polysynciterable.unique.md) |  | Return an iteration of unique elements, where two elements are considered equal if the result of <code>func(element)</code> is the same for both elements. |

