# Changelog

All changes to `polyethylene` starting on 2.0.0 are registered in this file.

This file is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [2.5.4] - 2024-12-30

### Fixed:
  - Fixed `string`s not being recognized as iterables by `Poly.from`, `Poly.syncFrom` and `Poly.asyncFrom`.

## [2.5.3] - 2024-12-02

### Fixed:
  - Updated types for `Poly.values` to prevent type errors on certain configurations.

## [2.5.2] - 2023-12-31

### Fixed:
  - Reverted "Added `const` to return generic types of `map`, `mapKeys`, `mapValues`, `flatMap` and `reduce`." from
    previous version.  It was breaking in unpredicted ways that were way more impactful that I thought.


## [2.5.1] - 2023-12-31 [YANKED]

### Changed:
  - Fixed documentation for `mapKeys` and `mapValues`
  - Added `const` to return generic types of `map`, `mapKeys`, `mapValues`, `flatMap` and `reduce`.
    This should reduce the instances where `as const` is needed before calling method that restrict the `this` type to
    pairs of elements, such as `toMap` or `toObject`.  This *might* break the types of some existing code if they were
    relying in generalized inference of literals or arrays.


## [2.5.0] - 2023-12-31

### Added:
  - Added `duplicate` method to both iterables

### Changed:
  - Improved types of `toObject` and `toMap` methods
  - Improved performance of `PolySyncIterable#map` and `PolySyncIterable#filter`


## [2.4.0] - 2023-07-04

### Added:
  - Added `mapKeys` method to both iterables
  - Added `mapValues` method to both iterables

### Changed:
  - Added an `options` argument to `PolyAsyncIterable#complete`
  - Added an `options` argument to `PolyAsyncIterable#join`


## [2.3.0] - 2023-03-16

### Added:
  - Added a type predicate version of `takeWhile` to both iterables


## [2.2.0] - 2023-01-05

### Added:
  - Added `findLast` leaf method to both iterables
  - Added `findIndex` leaf method to both iterables
  - Added `findLastIndex` leaf method to both iterables
  - Added `concurrency` and `bufferSize` options to many of `PolyAsyncIterable` methods
  - Added `count` to both iterables

### Changed:
  - Fixed `chunkWhile` not working correctly
  - Fixed async iterable tests not actually covering the case of async functions


## [2.1.1] - 2022-05-05

### Changed:
  - Fixed a problem with type definitions reference


## [2.1.0] - 2022-05-05

### Changed:
  - Further reduced the size of the distributed package by excluding tests and GitHub stuff

### Added:
  - Added a CommonJS version of the package
  - Added a `.from` method with the combined functionality of `.syncFrom` and `.asyncFrom`



## [2.0.1] - 2022-03-26

### Changed:
  - Reduced the size of the distributed package by excluding docs


## [2.0.0] - 2022-03-25

### Changed:
  - Port codebase to TypeScript, and add type definition files
  - Move to ESModules and remove support for CommonJS
  - Split `Poly.from` into `Poly.syncFrom` and `Poly.asyncFrom`
  - Split `Poly.iterate` into `Poly.syncIterate` and `Poly.asyncIterate`
  - Remove `options` object altogether (functionality replaced with `prefetch` method)
  - Remove default arguments for most methods that accept a function as a parameter (`unique` and `sort` preserve their defaults)
  - Rename `group` and `groupWhile` to `chunk` and `chunkWhile` respectively
  - Rename `drain` to `complete`

### Added:
  - Add `Poly.empty<T>` method to create (typed) empty iterables
  - Add `prefetch` method to async iterables
  - Add `filterNotNullish` as a shorthand for filtering out `null` and `undefined` from an iterable
  - Add `groupBy` to both sync and async iterables
  - Add `toMap` leaf method to both sync and async iterables
  - Add `toPartitionArray` leaf method to both sync and async iterables
