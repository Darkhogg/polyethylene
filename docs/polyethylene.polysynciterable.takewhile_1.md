<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [takeWhile](./polyethylene.polysynciterable.takewhile_1.md)

## PolySyncIterable.takeWhile() method

Return a new iteration that yields the first few elements for which `func(element)` returns `true`<!-- -->.

**Signature:**

```typescript
takeWhile(func: IndexedPredicate<T>): PolySyncIterable<T>;
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

func


</td><td>

[IndexedPredicate](./polyethylene.indexedpredicate.md)<!-- -->&lt;T&gt;


</td><td>

The function to call on the elements


</td></tr>
</tbody></table>
**Returns:**

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;T&gt;

a new [PolySyncIterable](./polyethylene.polysynciterable.md) that yields the same the elements of `this` as long as `func(element)` returns `true`

