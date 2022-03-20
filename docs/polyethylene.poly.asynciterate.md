<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [Poly](./polyethylene.poly.md) &gt; [asyncIterate](./polyethylene.poly.asynciterate.md)

## Poly.asyncIterate() function

Returns a [PolyAsyncIterable](./polyethylene.polyasynciterable.md) that will yield the values returned from calling `func` with the value last returned, or `undefined` when called for the first time.

<b>Signature:</b>

```typescript
function asyncIterate<T>(func: (lastValue: T | undefined) => T | Promise<T>): PolyAsyncIterable<T>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  func | (lastValue: T \| undefined) =&gt; T \| Promise&lt;T&gt; | The function that will be called to generate new elements of the iteration |

<b>Returns:</b>

PolyAsyncIterable&lt;T&gt;

an infinite iterable that yields the return values from calling `func` repeatedly

## Remarks

`func` will be called initially with `undefined`<!-- -->. After that, each element returned by calling it will be yielded as part of the resulting iterable and then passed to next call to `func`<!-- -->.

Note that there is no way of yielding a different value to that passed to the next function call, and that the resulting iterable will not end. If this is undesired, either use some of the operators on the resulting iterable (such as [map](./polyethylene.polyasynciterable.map.md) or [take](./polyethylene.polyasynciterable.take.md) / [takeWhile](./polyethylene.polyasynciterable.take.md)<!-- -->) or use a different approach to create the iterable.
