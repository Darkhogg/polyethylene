<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [polyethylene](./polyethylene.md) &gt; [PolySyncIterable](./polyethylene.polysynciterable.md) &gt; [filterNotNullish](./polyethylene.polysynciterable.filternotnullish.md)

## PolySyncIterable.filterNotNullish() method

Return an iteration of all the elements as `this` that aren't `null` or `undefined`<!-- -->.

<b>Signature:</b>

```typescript
filterNotNullish(): PolySyncIterable<NonNullable<T>>;
```
<b>Returns:</b>

PolySyncIterable&lt;NonNullable&lt;T&gt;&gt;

A new [PolySyncIterable](./polyethylene.polysynciterable.md) that yields the same elements as `this` except for `null` or `undefined` values

## Remarks

This function is a shortcut to calling  with a type predicate function that correctly filters out `null` and `undefined` values from the iteration. Note that other falsy values will remain in the iteration, and that the return value is correctly typed to exclude `null` and `undefined`<!-- -->.
