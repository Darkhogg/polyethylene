<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [dropLast](./polyethylene.polysynciterable.droplast.md)

## PolySyncIterable.dropLast() method

Return a new iteration that skips the last `num` elements. If there were less than `num` elements in the iteration, no elements are yielded.

**Signature:**

```typescript
dropLast(num?: number): PolySyncIterable<T>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  num | number | _(Optional)_ The number of elements to skip |

**Returns:**

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;T&gt;

a new [PolySyncIterable](./polyethylene.polysynciterable.md) that yields the same the elements of `this`<!-- -->, except for the last `num` elements

## Remarks

The returned iteration keeps a buffer of `num` elements internally in order to skip those if the iteration ends, and so elements effectively get delayed by `num` elements.

