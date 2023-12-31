<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md) &gt; [duplicate](./polyethylene.polyasynciterable.duplicate.md)

## PolyAsyncIterable.duplicate() method

Returns a tuple containing `num` iterables that will yield independent copies of the elements yielded by `this`<!-- -->.

**Signature:**

```typescript
duplicate<N extends number>(num: N): Tuple<PolyAsyncIterable<T>, N>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  num | N | the number of copies to be returned |

**Returns:**

[Tuple](./polyethylene.tuple.md)<!-- -->&lt;[PolyAsyncIterable](./polyethylene.polyasynciterable.md)<!-- -->&lt;T&gt;, N&gt;

An array of `num` elements containing independent copies of this iterable

## Remarks

Note that, as with every other method of this class, this instance is unusable after calling this method.

In order to provide a truly independent iteration for all returned iterables, a buffer is kept, which can grow as big as the whole iteration in certain circumstances. The buffer is filled as fast as the fastest iterable requests new items, and emptied as fast as the slowest iterable consumes those items.
