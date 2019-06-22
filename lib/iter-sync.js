const {identity, comparator, parseOptions, asserts} = require('./utils');
const AsyncIterator = require('./iter-async');


function * appendGen (iterA, iterB) {
  yield * iterA;
  yield * iterB;
}

function * prependGen (iterA, iterB) {
  yield * iterB;
  yield * iterA;
}

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

function * dropLastGen (iter, num) {
  const buf = Array(num);
  let pos = 0;
  let size = 0;
  for (const elem of iter) {
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

function * takeLastGen (iter, num) {
  const buf = Array(num);
  let pos = 0;
  let size = 0;
  for (const elem of iter) {
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

function * sliceNegPosGen (iter, start, end) {
  const buf = Array(start);
  let pos = 0;
  let size = 0;
  let num = end;
  for (const elem of iter) {
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

function * tapGen (iter, func) {
  let idx = 0;
  for (const elem of iter) {
    func(elem, idx++);
    yield elem;
  }
}

function * flattenGen (iter) {
  for (const elem of iter) {
    yield * elem;
  }
}

function * groupGen (iter, num) {
  let group = [];

  for (const elem of iter) {
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

function * groupWhileGen (iter, func) {
  let group = [];

  for (const elem of iter) {
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

function * uniqueGen (iter, func) {
  const seen = new Set();

  for (const elem of iter) {
    const key = func(elem);
    if (!seen.has(key)) {
      yield elem;
      seen.add(key);
    }
  }
}

function * reverseGen (iter, func) {
  const buf = Array.from(iter);
  for (let i = buf.length - 1; i >= 0; i--) {
    yield buf[i];
  }
}

function * sortGen (iter, func) {
  const buf = Array.from(iter);
  for (const elem of buf.sort(func)) {
    yield elem;
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

  append (iter, options = {}) {
    asserts.isSyncIterable(iter);
    return new SyncIterable(appendGen(this._iterable, iter), options);
  }

  concat (iter, options) {
    return this.append(iter, options);
  }

  prepend (iter, options = {}) {
    asserts.isSyncIterable(iter);
    return new SyncIterable(prependGen(this._iterable, iter), options);
  }

  drop (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new SyncIterable(dropGen(this._iterable, num), options);
  }

  take (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new SyncIterable(takeGen(this._iterable, num), options);
  }

  dropLast (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new SyncIterable(dropLastGen(this._iterable, num), options);
  }

  takeLast (num = 0, options = {}) {
    asserts.isNonNegativeInteger(num);
    return new SyncIterable(takeLastGen(this._iterable, num), options);
  }

  slice (start, end, options = {}) {
    asserts.isInteger(start, 'start');
    asserts.isInteger(end, 'end');
    return new SyncIterable(sliceGen(this._iterable, start, end), options);
  }

  dropWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(dropWhileGen(this._iterable, func), options);
  }

  takeWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(takeWhileGen(this._iterable, func), options);
  }

  filter (func = identity, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(filterGen(this._iterable, func), options);
  }

  map (func = identity, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(mapGen(this._iterable, func), options);
  }

  tap (func = identity, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(tapGen(this._iterable, func), options);
  }

  flatten (options = {}) {
    return new SyncIterable(flattenGen(this._iterable), options);
  }

  flat (options) {
    return this.flatten(options);
  }

  flatMap (func, options) {
    return this.map(func, options).flatten(options);
  }

  group (num = 1, options = {}) {
    asserts.isPositiveInteger(num);
    return new SyncIterable(groupGen(this._iterable, num), options);
  }

  groupWhile (func = identity, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(groupWhileGen(this._iterable, func), options);
  }

  unique (func = identity, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(uniqueGen(this._iterable, func), options);
  }

  reverse (options) {
    return new SyncIterable(reverseGen(this._iterable), options);
  }

  sort (func = comparator, options = {}) {
    asserts.isFunction(func);
    return new SyncIterable(sortGen(this._iterable, func), options);
  }

  toArray () {
    return Array.from(this._iterable);
  }

  find (func = identity) {
    asserts.isFunction(func);
    let idx = 0;
    for (const elem of this._iterable) {
      if (func(elem, idx++)) {
        return elem;
      }
    }
    return undefined;
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
    asserts.isFunction(func);

    let idx = 0;
    for (const item of this._iterable) {
      if (func(item, idx++)) {
        return true;
      }
    }

    return false;
  }

  every (func = identity) {
    asserts.isFunction(func);

    let idx = 0;
    for (const item of this._iterable) {
      if (!func(item, idx++)) {
        return false;
      }
    }

    return true;
  }

  reduce (reducer, init) {
    asserts.isFunction(reducer);

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
    asserts.isFunction(func);

    let idx = 0;
    for (const elem of this._iterable) {
      func(elem, idx++);
    }
  }

  join (glue = ',') {
    let str = '';
    let first = true;

    for (const elem of this._iterable) {
      str += (first ? '' : glue) + (elem == null ? '' : elem);
      first = false;
    }

    return str;
  }

  drain () {
    /* eslint-disable-next-line no-unused-vars */
    for (const elem of this._iterable) {
      /* do nothing, just iterate */
    }
  }
}


module.exports = SyncIterable;
