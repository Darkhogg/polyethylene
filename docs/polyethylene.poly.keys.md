<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [Poly](./polyethylene.poly.md) &gt; [keys](./polyethylene.poly.keys.md)

## Poly.keys() function

Returns a [PolySyncIterable](./polyethylene.polysynciterable.md) that yields the same elements as `Object.keys` would.

<b>Signature:</b>

```typescript
function keys<K extends string | number | symbol>(obj: Record<K, unknown>): PolySyncIterable<K>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  obj | Record&lt;K, unknown&gt; |  |

<b>Returns:</b>

PolySyncIterable&lt;K&gt;

An iterable that yields the keys of the passed object
