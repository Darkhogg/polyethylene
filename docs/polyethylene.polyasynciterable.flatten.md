<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md) &gt; [flatten](./polyethylene.polyasynciterable.flatten.md)

## PolyAsyncIterable.flatten() method

Return an iteration of the yielded elements of the sub-iterables.

**Signature:**

```typescript
flatten<U>(this: PolyAsyncIterable<Iterable<U> | AsyncIterable<U>>): PolyAsyncIterable<U>;
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

[PolyAsyncIterable](./polyethylene.polyasynciterable.md)<!-- -->&lt;Iterable&lt;U&gt; \| AsyncIterable&lt;U&gt;&gt;


</td><td>


</td></tr>
</tbody></table>
**Returns:**

[PolyAsyncIterable](./polyethylene.polyasynciterable.md)<!-- -->&lt;U&gt;

A new [PolyAsyncIterable](./polyethylene.polyasynciterable.md) that will yield the elements of all sub-iterables

