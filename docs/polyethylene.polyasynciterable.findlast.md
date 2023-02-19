<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md) &gt; [findLast](./polyethylene.polyasynciterable.findlast.md)

## PolyAsyncIterable.findLast() method

Returns the last element for which `func(element)` returns `true`<!-- -->, or `undefined` if it never does.

<b>Signature:</b>

```typescript
findLast<U extends T>(func: IndexedTypePredicate<T, U>, options?: ConcurrencyOptions): Promise<U | undefined>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  func | [IndexedTypePredicate](./polyethylene.indexedtypepredicate.md)<!-- -->&lt;T, U&gt; | A type predicate called for elements of <code>this</code> |
|  options | [ConcurrencyOptions](./polyethylene.concurrencyoptions.md) | <i>(Optional)</i> Options for concurrency of this operation |

<b>Returns:</b>

Promise&lt;U \| undefined&gt;

A promise to the last element of the iteration for which `func` returned `true`

## Remarks

`func` will be called on \*all\* of this iteration, and the result will not be returned until the iteration ends.

The return type of this function is narrowed to the type asserted by `func`<!-- -->.
