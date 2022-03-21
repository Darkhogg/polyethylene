# Polyethylene

Polyethylene is a wrapping layer around iterators and async iterators that lets you chain
functional operators in a similar way you do with arrays but without the memory overhead or having
to wait for an asynchronous iteration to end.

[![Version](https://img.shields.io/npm/v/polyethylene.svg)](https://www.npmjs.com/package/polyethylene)
[![Tests](https://img.shields.io/github/workflow/status/Darkhogg/polyethylene/test.yaml?label=tests)](https://github.com/Darkhogg/polyethylene/actions/workflows/test.yaml?query=branch%3Amain)
<!--[![Test Coverage](https://img.shields.io/codeclimate/coverage/Darkhogg/polyethylene.svg)](https://codeclimate.com/github/Darkhogg/polyethylene)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/Darkhogg/polyethylene.svg)](https://codeclimate.com/github/Darkhogg/polyethylene)-->
[![](https://img.shields.io/github/license/Darkhogg/polyethylene)][License]


## 2.0 Changes

  - **Breaking Changes**
    - Move to ESModules and remove support for CommonJS
    - Split `Poly.from` into `Poly.syncFrom` and `Poly.asyncFrom`
    - Split `Poly.iterate` into `Poly.syncIterate` and `Poly.asyncIterate`
    - Remove `options` object altogether (replaced with `prefetch` method)
    - Remove default arguments for most methods that accept a function as a parameter (`unique` and `sort` preserve their defaults)
    - Rename `group` and `groupWhile` to `chunk` and `chunkWhile` respectively
    - Rename `drain` to `complete`
  - **New Features**
    - Port codebase to TypeScript, and add type definition files
    - Add `Poly.empty<T>` method to create (typed) empty iterables
    - Add `prefetch` method to async iterables
    - Add `filterNotNullish` as a shorthand for filtering out `null` and `undefined` from an iterable
    - Add `groupBy` to both sync and async iterables
    - Add `toMap` leaf method to both sync and async iterables
    - Add `toPartitionArray` leaf method to both sync and async iterables

## Example

```typescript
import Poly from 'polyethylene';
import {findUsers, findUserPosts} from 'some-api-lib'

// Print the first 10 posts of each user
await Poly.asyncFrom(findUsers())
  .map(user => Poly.from(findUserPosts(user)).take(10))
  .flat()
  .forEach(post => console.log(post));
```


## Documentation

See the [API Documentation](./docs/polyethylene.md).

## License

Polyethylene is released under the [MIT License][License]

  [License]: ./LICENSE
