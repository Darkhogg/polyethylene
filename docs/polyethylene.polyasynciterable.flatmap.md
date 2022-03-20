<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md) &gt; [flatMap](./polyethylene.polyasynciterable.flatmap.md)

## PolyAsyncIterable.flatMap() method

Return an iteration of elements of the sub-iterables that result from calling `func(element)` for every element in `this`<!-- -->.

<b>Signature:</b>

```typescript
flatMap<U>(func: AsyncIndexedMapping<T, Iterable<U> | AsyncIterable<U>>): PolyAsyncIterable<U>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  func | [AsyncIndexedMapping](./polyethylene.asyncindexedmapping.md)<!-- -->&lt;T, Iterable&lt;U&gt; \| AsyncIterable&lt;U&gt;&gt; | A function that takes an element of <code>this</code> and returns an iterable |

<b>Returns:</b>

PolyAsyncIterable&lt;U&gt;

A new [PolyAsyncIterable](./polyethylene.polyasynciterable.md) that yields the elements of the subiterables that results from calling `func(element)` for every element of `this`

## Remarks

This method is equivalent to calling  and then 
