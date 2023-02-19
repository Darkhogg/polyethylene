# Polyethylene

Polyethylene is a wrapping layer around iterators and async iterators that lets you chain
functional operators in a similar way you do with arrays but without the memory overhead or having
to wait for an asynchronous iteration to end.

[![Version](https://img.shields.io/npm/v/polyethylene.svg)](https://www.npmjs.com/package/polyethylene)
[![Tests](https://img.shields.io/github/actions/workflow/status/darkhogg/polyethylene/test.yaml?branch=main)](https://github.com/Darkhogg/polyethylene/actions/workflows/test.yaml?query=branch%3Amain)
[![](https://img.shields.io/github/license/Darkhogg/polyethylene)][license]


## Basic Usage

The default export of `polyethylene` (named `Poly` throughout the documentation) is the main entry point.
You would typically create an "augmented" iterable object using `Poly.asyncFrom` or `Poly.syncFrom`, then you start
calling _transform methods_ like `.map`, `.filter`, etc. in the returned object, ending with a _leaf method_ like
`.reduce` or `.forEach`.

In this way, polyethylene objects behave very similarly to `Array`s, but they are fundamentally different because they
don't store their elements anywhere, instead processing them one by one.

The following is a very simple, fictitious example of using polyethylene:


```typescript
import Poly from 'polyethylene';
import {findUsers, findUserPosts} from 'some-api-lib'

// Print the first 10 posts of each user
await Poly.asyncFrom(findUsers())
  .flatMap(user => Poly.asyncFrom(findUserPosts(user)).take(10))
  .forEach(post => console.log(post));
```

### CommonJS

This package is designed as an ECMAScript Module from the get go, but since 2.1.0 a CommonJS version is provided.

All named exports are supported, but the default export must be accessed via the `default` or `Poly` exports:

```javascript
const Poly = require('polyethylene').default
```
```javascript
const {Poly} = require('polyethylene')
```


## Full Documentation

See the [API Documentation](./docs/polyethylene.md).

## License

Polyethylene is released under the [MIT License][license]

  [license]: ./LICENSE
