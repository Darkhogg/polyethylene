<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [drop](./polyethylene.polysynciterable.drop.md)

## PolySyncIterable.drop() method

Return a new iteration that skips the first `num` elements. If there were less than `num` elements in the iteration, no elements are yielded.

**Signature:**

```typescript
drop(num?: number): PolySyncIterable<T>;
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

num


</td><td>

number


</td><td>

_(Optional)_ The number of elements to skip


</td></tr>
</tbody></table>
**Returns:**

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;T&gt;

a new [PolySyncIterable](./polyethylene.polysynciterable.md) that yields the same the elements of `this`<!-- -->, except for the first `num` elements

