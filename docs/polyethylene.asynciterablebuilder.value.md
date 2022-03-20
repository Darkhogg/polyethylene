<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [AsyncIterableBuilder](./polyethylene.asynciterablebuilder.md) &gt; [value](./polyethylene.asynciterablebuilder.value.md)

## AsyncIterableBuilder.value() method

Gives the underlying iterable a new value to be yielded.

<b>Signature:</b>

```typescript
value(obj: T): void;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  obj | T | The object to be yielded by the underlying iterable |

<b>Returns:</b>

void

## Remarks

Objects given for iteration will be buffered until they are requested, and are guaranteed to be yielded before errors and before finishing the iteration.

If this method is called after  or , the given object is ignored.
