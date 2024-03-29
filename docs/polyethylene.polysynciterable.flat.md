<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [flat](./polyethylene.polysynciterable.flat.md)

## PolySyncIterable.flat() method

Return an iteration of the yielded elements of the sub-iterables.

**Signature:**

```typescript
flat<U>(this: PolySyncIterable<Iterable<U>>): PolySyncIterable<U>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  this | [PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;Iterable&lt;U&gt;&gt; |  |

**Returns:**

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;U&gt;

A new [PolySyncIterable](./polyethylene.polysynciterable.md) that will yield the elements of all sub-iterables

## Remarks

This method is an alias of [PolySyncIterable.flatten()](./polyethylene.polysynciterable.flatten.md)<!-- -->.

