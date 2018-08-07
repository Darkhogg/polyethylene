const {identity, parseOptions} = require('./utils');
const AsyncIterator = require('./iter-async');


function * dropGen (iter, num) {
  let rem = num;
  for (const elem of iter) {
    if (rem-- <= 0) {
      yield elem;
    }
  }
}

function * takeGen (iter, num) {
  let rem = num;
  for (const elem of iter) {
    if (rem-- <= 0) {
      return;
    }
    yield elem;
  }
}

function * dropWhileGen (iter, func) {
  let idx = 0;
  let yielding = false;
  for (const elem of iter) {
    if (yielding || !func(elem, idx++)) {
      yielding = true;
      yield elem;
    }
  }
}

function * takeWhileGen (iter, func) {
  let idx = 0;
  for (const elem of iter) {
    if (!func(elem, idx++)) {
      return;
    }
    yield elem;
  }
}

function * filterGen (iter, func) {
  let idx = 0;
  for (const elem of iter) {
    if (func(elem, idx++)) {
      yield elem;
    }
  }
}

function * mapGen (iter, func) {
  let idx = 0;
  for (const elem of iter) {
    yield func(elem, idx++);
  }
}

function * flattenGen (iter) {
  for (const elem of iter) {
    yield * elem;
  }
}


class SyncIterable {
  constructor (iterable, options = {}) {
    this.options = parseOptions(options);
    this._iterable = iterable;
  }

  * [Symbol.iterator] () {
    yield * this._iterable;
  }

  async (options = {}) {
    return new AsyncIterator(this._iterable, options);
  }

  drop (num = 0, options = {}) {
    if (num < 0 || !Number.isInteger(num)) {
      throw new Error('argument should be a non-negative integer');
    }
    return new SyncIterable(dropGen(this._iterable, num), options);
  }

  take (num = 0, options = {}) {
    if (num < 0 || !Number.isInteger(num)) {
      throw new Error('argument should be a non-negative integer');
    }
    return new SyncIterable(takeGen(this._iterable, num), options);
  }

  dropWhile (func = identity, options = {}) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncIterable(dropWhileGen(this._iterable, func), options);
  }

  takeWhile (func = identity, options = {}) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncIterable(takeWhileGen(this._iterable, func), options);
  }

  filter (func = identity, options = {}) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncIterable(filterGen(this._iterable, func), options);
  }

  map (func = identity, options = {}) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncIterable(mapGen(this._iterable, func), options);
  }

  flatten (options = {}) {
    return new SyncIterable(flattenGen(this._iterable), options);
  }

  toArray () {
    return Array.from(this._iterable);
  }

  find (func = identity) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    let idx = 0;
    for (const elem of this._iterable) {
      if (func(elem, idx++)) {
        return elem;
      }
    }
  }

  includes (obj) {
    for (const elem of this._iterable) {
      if (Object.is(obj, elem) || (obj === 0 && elem === 0)) {
        return true;
      }
    }

    return false;
  }

  some (func = identity) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    let idx = 0;
    for (const item of this._iterable) {
      if (func(item, idx++)) {
        return true;
      }
    }

    return false;
  }

  every (func = identity) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    let idx = 0;
    for (const item of this._iterable) {
      if (!func(item, idx++)) {
        return false;
      }
    }

    return true;
  }

  reduce (reducer, init) {
    if (typeof reducer !== 'function') {
      throw new Error('reducer should be a function');
    }

    let accumulated = init;
    let isFirst = (accumulated === undefined);
    let idx = 0;

    for (const elem of this._iterable) {
      accumulated = isFirst ? elem : reducer(accumulated, elem, idx++);
      isFirst = false;
    }

    return accumulated;
  }

  forEach (func) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    let idx = 0;
    for (const elem of this._iterable) {
      func(elem, idx++);
    }
  }

  join (glue = ',') {
    let str = '';
    let first = true;

    for (const elem of this._iterable) {
      str += (first ? '' : glue) + (elem === null || elem === undefined ? '' : elem);
      first = false;
    }

    return str;
  }

  drain () {
    for (const elem of this._iterable) {
      // do nothing
    }
  }
};


module.exports = SyncIterable;
