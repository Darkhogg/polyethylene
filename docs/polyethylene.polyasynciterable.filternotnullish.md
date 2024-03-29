<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolyAsyncIterable](./polyethylene.polyasynciterable.md) &gt; [filterNotNullish](./polyethylene.polyasynciterable.filternotnullish.md)

## PolyAsyncIterable.filterNotNullish() method

Return an iteration of all the elements as `this` that aren't `null` or `undefined`<!-- -->.

**Signature:**

```typescript
filterNotNullish(): PolyAsyncIterable<NonNullable<T>>;
```
**Returns:**

[PolyAsyncIterable](./polyethylene.polyasynciterable.md)<!-- -->&lt;NonNullable&lt;T&gt;&gt;

A new [PolyAsyncIterable](./polyethylene.polyasynciterable.md) that yields the same elements as `this` except for `null` or `undefined` values

## Remarks

This function is a shortcut to calling  with a type predicate function that correctly filters out `null` and `undefined` values from the iteration. Note that other falsy values will remain in the iteration, and that the return value is correctly typed to exclude `null` and `undefined`<!-- -->.

