const {identity, parseOptions, prefetch, preload, asserts} = require('./utils');

async function * dropGen (iter, num) {
  let rem = num;
  for await (const elem of iter) {
    if (rem-- <= 0) {
      yield elem;
    }
  }
}

async function * takeGen (iter, num) {
  let rem = num;
  for await (const elem of iter) {
    if (rem-- <= 0) {
      return;
    }
    yield elem;
  }
}

async function * dropWhileGen (iter, func) {
  let idx = 0;
  let yielding = false;
  for await (const elem of iter) {
    if (yielding || !(await func(elem, idx++))) {
      yielding = true;
      yield elem;
    }
  }
}

async function * takeWhileGen (iter, func) {
  let idx = 0;
  for await (const elem of iter) {
    if (!(await func(elem, idx++))) {
      return;
    }
    yield elem;
  }
}

async function * filterGen (iter, func) {
  let idx = 0;
  for await (const elem of iter) {
    if (await func(elem, idx++)) {
      yield elem;
    }
  }
}

async function * mapGen (iter, func) {
  let idx = 0;
  for await (const elem of iter) {
    yield await func(elem, idx++);
  }
}

async function * tapGen (iter, func) {
  let idx = 0;
  for await (const elem of iter) {
    await func(elem, idx++);
    yield elem;
  }
}

async function * flattenGen (iter) {
  for await (const elem of iter) {
    yield * elem;
  }
}

async function * groupGen (iter, num) {
  let group = [];

  for await (const elem of iter) {
    group.push(elem);
    if (group.length === num) {
      yield group;
      group = [];
    }
  }

  if (group.length) {
    yield group;
  }
}

async function * groupWhileGen (iter, func) {
  let group = [];

  for await (const elem of iter) {
    if (group.length === 0 || func(elem, group[group.length - 1], group[0])) {
      group.push(elem);
    } else {
      yield group;
      group = [elem];
    }
  }

  if (group.length) {
    yield group;
  }
}


class AsyncIterable {
  constructor (iterable, options = {}) {
    this.options = parseOptions(options);
    this._iterable = iterable;
    if (this.options.preload) {
      this._iterable = preload(this._iterable);
    }
    if (this.options.prefetch) {
      this._iterable = prefetch(this._iterable);
    }
  }

  async * [Symbol.asyncIterator] () {
    yield * this._iterable;
  }

  async (options) {
    return options ? new AsyncIterable(this._iterable, options) : this;
  }

  drop (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new AsyncIterable(dropGen(this._iterable, num), options);
  }

  take (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new AsyncIterable(takeGen(this._iterable, num), options);
  }

  dropWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(dropWhileGen(this._iterable, func), options);
  }

  takeWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(takeWhileGen(this._iterable, func), options);
  }

  filter (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(filterGen(this._iterable, func), options);
  }

  map (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(mapGen(this._iterable, func), options);
  }

  tap (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(tapGen(this._iterable, func), options);
  }

  flatten (options = {}) {
    return new AsyncIterable(flattenGen(this._iterable), options);
  }

  flat (options) {
    return this.flatten(options);
  }

  flatMap (func, options) {
    return this.map(func, options).flatten(options);
  }

  group (num = 1, options = {}) {
    asserts.isPositiveInteger(num);
    return new AsyncIterable(groupGen(this._iterable, num), options);
  }

  groupWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(groupWhileGen(this._iterable, func), options);
  }

  async toArray () {
    const array = [];
    for await (const elem of this._iterable) {
      array.push(elem);
    }
    return array;
  }

  async find (func = identity) {
    asserts.isFunction(func);

    let idx = 0;
    for await (const elem of this._iterable) {
      if (await func(elem, idx++)) {
        return elem;
      }
    }
    return undefined;
  }

  async includes (obj) {
    for await (const elem of this._iterable) {
      if (Object.is(obj, elem) || (obj === 0 && elem === 0)) {
        return true;
      }
    }

    return false;
  }

  async some (func = identity) {
    asserts.isFunction(func);

    let idx = 0;
    for await (const item of this._iterable) {
      if (await func(item, idx++)) {
        return true;
      }
    }

    return false;
  }

  async every (func = identity) {
    asserts.isFunction(func);

    let idx = 0;
    for await (const item of this._iterable) {
      if (!(await func(item, idx++))) {
        return false;
      }
    }

    return true;
  }

  async reduce (reducer, init) {
    asserts.isFunction(reducer);

    let accumulated = init;
    let isFirst = (accumulated === undefined);
    let idx = 0;

    for await (const elem of this._iterable) {
      accumulated = isFirst ? elem : await reducer(accumulated, elem, idx++);
      isFirst = false;
    }

    return accumulated;
  }

  async forEach (func) {
    asserts.isFunction(func);

    let idx = 0;
    for await (const elem of this._iterable) {
      await func(elem, idx++);
    }
  }

  async join (glue = ',') {
    let str = '';
    let first = true;

    for await (const elem of this._iterable) {
      str += (first ? '' : glue) + (elem === null || elem === undefined ? '' : elem);
      first = false;
    }

    return str;
  }

  async drain () {
    /* eslint-disable-next-line no-unused-vars */
    for await (const elem of this._iterable) {
      /* do nothing, just iterate */
    }
  }
}


module.exports = AsyncIterable;
