<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [mapValues](./polyethylene.polysynciterable.mapvalues.md)

## PolySyncIterable.mapValues() method

Return an iteration of the pairs resulting of calling `func(element)` for every element in `this` and using it as the second element of the pair (the \*value\*) and preserving the first (the \*key\*).

**Signature:**

```typescript
mapValues<K, V1, V2>(this: PolySyncIterable<[K, V1]>, func: IndexedMapping<[K, V1], V2>): PolySyncIterable<[K, V2]>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  this | [PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;\[K, V1\]&gt; |  |
|  func | [IndexedMapping](./polyethylene.indexedmapping.md)<!-- -->&lt;\[K, V1\], V2&gt; | A function that takes an element of <code>this</code> and returns something else |

**Returns:**

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;\[K, V2\]&gt;

A new [PolySyncIterable](./polyethylene.polysynciterable.md) that yields the results of calling `func(element)` for every element of `this` and using it to replace the values

## Remarks

This method is only available for iterations of pairs.
