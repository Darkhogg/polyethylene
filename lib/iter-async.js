const {identity, parseOptions, prefetch, preload, asserts} = require('./utils');


async function * appendGen (iterA, iterB) {
  yield * iterA;
  yield * iterB;
}

async function * prependGen (iterA, iterB) {
  yield * iterB;
  yield * iterA;
}

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

async function * dropLastGen (iter, num) {
  const buf = Array(num);
  let pos = 0;
  let size = 0;
  for await (const elem of iter) {
    if (size >= num) {
      yield num ? buf[pos] : elem;
    } else {
      size++;
    }
    if (num) {
      buf[pos] = elem;
      pos = ((pos + 1) % num);
    }
  }
}

async function * takeLastGen (iter, num) {
  const buf = Array(num);
  let pos = 0;
  let size = 0;
  for await (const elem of iter) {
    size = size >= num ? num : size + 1;
    if (num) {
      buf[pos] = elem;
      pos = ((pos + 1) % num);
    }
  }
  pos = size >= num ? pos : 0;
  for (let i = 0; i < size; i++) {
    yield buf[pos];
    pos = ((pos + 1) % num);
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


async function * sliceNegPosGen (iter, start, end) {
  const buf = Array(start);
  let pos = 0;
  let size = 0;
  let num = end;
  for await (const elem of iter) {
    if (size >= start && end) {
      num--;
    }
    size = size >= start ? start : size + 1;
    if (start) {
      buf[pos] = elem;
      pos = ((pos + 1) % start);
    }
  }
  pos = size >= start ? pos : 0;
  for (let i = 0; i < Math.min(size, num); i++) {
    yield buf[pos];
    pos = ((pos + 1) % start);
  }
}

function sliceGen (iter, start, end) {
  if (start >= 0 && end >= 0) {
    return takeGen(dropGen(iter, start), end - start);
  } else if (start < 0 && end >= 0) {
    return sliceNegPosGen(iter, -start, end);
  } else if (start >= 0) { // && end < 0
    return dropLastGen(dropGen(iter, start), -end);
  } else { // start < 0 && end < 0
    return dropLastGen(takeLastGen(iter, -start), -end);
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

  append (iter, options = {}) {
    asserts.isAsyncIterable(iter);
    return new AsyncIterable(appendGen(this._iterable, iter), options);
  }

  concat (iter, options) {
    return this.append(iter, options);
  }

  prepend (iter, options = {}) {
    asserts.isAsyncIterable(iter);
    return new AsyncIterable(prependGen(this._iterable, iter), options);
  }

  drop (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new AsyncIterable(dropGen(this._iterable, num), options);
  }

  take (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new AsyncIterable(takeGen(this._iterable, num), options);
  }

  dropLast (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new AsyncIterable(dropLastGen(this._iterable, num), options);
  }

  takeLast (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new AsyncIterable(takeLastGen(this._iterable, num), options);
  }

  dropWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(dropWhileGen(this._iterable, func), options);
  }

  takeWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new AsyncIterable(takeWhileGen(this._iterable, func), options);
  }

  slice (start, end, options = {}) {
    asserts.isInteger(start, 'start');
    asserts.isInteger(end, 'end');
    return new AsyncIterable(sliceGen(this._iterable, start, end), options);
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
