# Changelog

All changes to `polyethylene` starting on 2.0.0 are registered in this file.

This file is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## UNRELEASED

### Added:
  - Added `mapKey` method to both iterables
  - Added `mapValue` method to both iterables
  - Added `duplicate` method to both iterables

### Changed:
  - Improved types of `toObject` and `toMap` methods
  - Add an `options` argument to `PolyAsyncIterable#complete`
  - Add an `options` argument to `PolyAsyncIterable#join`


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
