<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md) &gt; [map](./polyethylene.polyasynciterable.map.md)

## PolyAsyncIterable.map() method

Return an iteration of the result of calling `func(element)` for every element in `this`<!-- -->.

**Signature:**

```typescript
map<U>(func: AsyncIndexedMapping<T, U>, options?: ConcurrencyOptions): PolyAsyncIterable<U>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  func | [AsyncIndexedMapping](./polyethylene.asyncindexedmapping.md)<!-- -->&lt;T, U&gt; | A function that takes an element of <code>this</code> and returns something else |
|  options | [ConcurrencyOptions](./polyethylene.concurrencyoptions.md) | _(Optional)_ Options for concurrency of this operation |

**Returns:**

[PolyAsyncIterable](./polyethylene.polyasynciterable.md)<!-- -->&lt;U&gt;

A new [PolyAsyncIterable](./polyethylene.polyasynciterable.md) that yields the results of calling `func(element)` for every element of `this`

