<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [reduce](./polyethylene.polysynciterable.reduce.md)

## PolySyncIterable.reduce() method

Returns the result of calling the passed `reducer` for all elements of the iteration and the result of the previous call to `reducer`<!-- -->, starting by passing `init` or, if not present, the first element of the iteration.

<b>Signature:</b>

```typescript
reduce(reducer: IndexedReducer<T, T>, init?: T): T;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  reducer | [IndexedReducer](./polyethylene.indexedreducer.md)<!-- -->&lt;T, T&gt; | A function to call for all elements with the result of a previous call |
|  init | T | First element to be passed to the <code>reducer</code> function |

<b>Returns:</b>

T

The result to continually call `reducer` with all elements and the previous result

## Remarks

If the `init` argument is not present, at least one element must be present in the iteration, else an error will be thrown

`reducer` will be called with the accumulated result, the next element of the iteration, and the index of the iteration. The resolved return value will be the value passed to the next call as the first argument, or the value returned if no more elements remain.
