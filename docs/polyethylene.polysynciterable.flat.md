<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [flat](./polyethylene.polysynciterable.flat.md)

## PolySyncIterable.flat() method

Return an iteration of the yielded elements of the sub-iterables.

**Signature:**

```typescript
flat<U>(this: PolySyncIterable<Iterable<U>>): PolySyncIterable<U>;
```

## Parameters

<table><thead><tr><th>

Parameter


</th><th>

Type


</th><th>

Description


</th></tr></thead>
<tbody><tr><td>

this


</td><td>

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;Iterable&lt;U&gt;&gt;


</td><td>


</td></tr>
</tbody></table>
**Returns:**

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;U&gt;

A new [PolySyncIterable](./polyethylene.polysynciterable.md) that will yield the elements of all sub-iterables

## Remarks

This method is an alias of [PolySyncIterable.flatten()](./polyethylene.polysynciterable.flatten.md)<!-- -->.

