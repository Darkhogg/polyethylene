<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [AsyncIterableBuilder](./polyethylene.asynciterablebuilder.md) &gt; [value](./polyethylene.asynciterablebuilder.value.md)

## AsyncIterableBuilder.value() method

Gives the underlying iterable a new value to be yielded.

**Signature:**

```typescript
value(obj: T): void;
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

obj


</td><td>

T


</td><td>

The object to be yielded by the underlying iterable


</td></tr>
</tbody></table>
**Returns:**

void

## Remarks

Objects given for iteration will be buffered until they are requested, and are guaranteed to be yielded before errors and before finishing the iteration.

If this method is called after [error](./polyethylene.asynciterablebuilder.error.md) or [done](./polyethylene.asynciterablebuilder.done.md)<!-- -->, the given object is ignored.

