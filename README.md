# Polyethylene

Polyethylene is a wrapping layer around iterators and async iterators that lets you chain
functional operators in a similar way you do with arrays but without the memory overhead or having
to wait for an asynchronous iteration to end.

[![npm version](
https://img.shields.io/npm/v/polyethylene.svg
)](https://www.npmjs.com/package/polyethylene)
[![Build Status](
https://img.shields.io/travis/Darkhogg/polyethylene.svg
)](https://travis-ci.org/Darkhogg/polyethylene)
[![Test Coverage](https://img.shields.io/codeclimate/coverage/Darkhogg/polyethylene.svg)](https://codeclimate.com/github/Darkhogg/polyethylene)
[![Maintainability](https://img.shields.io/codeclimate/maintainability/Darkhogg/polyethylene.svg)](https://codeclimate.com/github/Darkhogg/polyethylene)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FDarkhogg%2Fpolyethylene.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FDarkhogg%2Fpolyethylene?ref=badge_shield)


## 2.0 Changes

  - **Breaking Changes**
    - Move to ESModules and remove support for CommonJS
    - Split `Poly.from` into `Poly.syncFrom` and `Poly.asyncFrom`
    - Split `Poly.iterate` into `Poly.syncIterate` and `Poly.asyncIterate`
    - Remove `options` object altogether (replaced with `preload` and `prefetch` methods)
    - Remove `async` from async iterators -- it is uneeded as there are no ambiguous methods anymore
    - Remove default arguments for most methods that accept a function as a parameter (`unique` and `sort` preserve their defaults)
    - Rename `group` and `groupWhile` to `chunk` and `chunkWhile` respectively
  - **New Features**
    - Port codebase to TypeScript, and add type definition files
    - Add `Poly.empty<T>` method to create (typed) empty iterables
    - Add `preload` and `prefetch` methods to async iterables
    - Add `groupBy` to both sync and async iterables
    - Add `toMap` leaf method to both sync and async iterables
    - Add `toPartitionArray` leaf method to both sync and async iterables

## Example

```javascript
import Poly from 'polyethylene';

// Print the first 10 posts of each user
await Poly.from(findUsers())
  .map(user => Poly.from(findUserPosts(user)).take(10))
  .flat()
  .forEach(post => console.log(post));
```


## Documentation

See the [API Documentation][docs].

  - [docs]: ./blob/master/README.md

## Planned Features

The following are a few planned features I intend to add in the future, in no particular order:

- A `tee`/`fork` method that, from a single iterator, returns N iterators that get the same
  elements or errors in the same order.
- The possibility of running processing functions in parallel as long as elements are coming
  fast enough.


## License
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FDarkhogg%2Fpolyethylene.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FDarkhogg%2Fpolyethylene?ref=badge_large)
