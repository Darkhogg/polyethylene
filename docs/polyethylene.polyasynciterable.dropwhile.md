<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md) &gt; [dropWhile](./polyethylene.polyasynciterable.dropwhile.md)

## PolyAsyncIterable.dropWhile() method

Return a new iteration that skips the first few elements for which `func(element)` returns `true`<!-- -->.

**Signature:**

```typescript
dropWhile(func: AsyncIndexedPredicate<T>): PolyAsyncIterable<T>;
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

[AsyncIndexedPredicate](./polyethylene.asyncindexedpredicate.md)<!-- -->&lt;T&gt;


</td><td>

The function to call on the elements


</td></tr>
</tbody></table>
**Returns:**

[PolyAsyncIterable](./polyethylene.polyasynciterable.md)<!-- -->&lt;T&gt;

a new [PolyAsyncIterable](./polyethylene.polyasynciterable.md) that yields the same the elements of `this`<!-- -->, excepts the first few for which`func(element)` returns `true`

