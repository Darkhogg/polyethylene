<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [Poly](./polyethylene.poly.md) &gt; [syncIterate](./polyethylene.poly.synciterate_1.md)

## Poly.syncIterate() function

Returns a [PolySyncIterable](./polyethylene.polysynciterable.md) that will yield the values returned from calling `func` with the value last returned, or `initValue` when called for the first time.

**Signature:**

```typescript
function syncIterate<T>(func: (lastValue: T) => T, initValue: T): PolySyncIterable<T>;
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

(lastValue: T) =&gt; T


</td><td>

The function that will be called to generate new elements of the iteration


</td></tr>
<tr><td>

initValue


</td><td>

T


</td><td>


</td></tr>
</tbody></table>
**Returns:**

[PolySyncIterable](./polyethylene.polysynciterable.md)<!-- -->&lt;T&gt;

an infinite iterable that yields the return values from calling `func` repeatedly

## Remarks

`func` will be called initially with `initValue`<!-- -->. After that, each element returned by calling it will be yielded as part of the resulting iterable and then passed to next call to `func`<!-- -->. Note that `initValue` will not be part of the iteration.

Note that there is no way of yielding a different value to that passed to the next function call, and that the resulting iterable will not end. If this is undesired, either use some of the operators on the resulting iterable (such as [map](./polyethylene.polysynciterable.map.md) or [take](./polyethylene.polysynciterable.take.md) / [takeWhile](./polyethylene.polysynciterable.take.md)<!-- -->) or use a different approach to create the iterable.

