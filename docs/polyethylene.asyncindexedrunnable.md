<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [AsyncIndexedRunnable](./polyethylene.asyncindexedrunnable.md)

## AsyncIndexedRunnable type

A function that receives an object (`elem`<!-- -->) and its `index` in the iteration and either returns a `Promise` to nothing or doesn't return anything

**Signature:**

```typescript
export type AsyncIndexedRunnable<T> = (elem: T, index: number) => void | PromiseLike<void>;
```
