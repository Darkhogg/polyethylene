
const ID = x => x;

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

async function * flattenGen (iter) {
  for await (const elem of iter) {
    yield * elem;
  }
}

class AsyncIterable {
  constructor (iterable) {
    this._iterable = iterable;
  }

  async * [Symbol.asyncIterator] () {
    yield * this._iterable;
  }

  async () {
    return this;
  }

  drop (num = 0) {
    if (num < 0 || !Number.isInteger(num)) {
      throw new Error('argument should be a non-negative integer');
    }
    return new AsyncIterable(dropGen(this._iterable, num));
  }

  take (num = 0) {
    if (num < 0 || !Number.isInteger(num)) {
      throw new Error('argument should be a non-negative integer');
    }
    return new AsyncIterable(takeGen(this._iterable, num));
  }

  dropWhile (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new AsyncIterable(dropWhileGen(this._iterable, func));
  }

  takeWhile (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new AsyncIterable(takeWhileGen(this._iterable, func));
  }

  filter (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new AsyncIterable(filterGen(this._iterable, func));
  }

  map (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new AsyncIterable(mapGen(this._iterable, func));
  }

  flatten () {
    return new AsyncIterable(flattenGen(this._iterable));
  }

  async toArray () {
    const array = [];
    for await (const elem of this._iterable) {
      array.push(elem);
    }
    return array;
  }

  async find (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    let idx = 0;
    for await (const elem of this._iterable) {
      if (await func(elem, idx++)) {
        return elem;
      }
    }
  }

  async includes (obj) {
    for await (const elem of this._iterable) {
      if (Object.is(obj, elem) || (obj === 0 && elem === 0)) {
        return true;
      }
    }

    return false;
  }

  async some (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    let idx = 0;
    for await (const item of this._iterable) {
      if (await func(item, idx++)) {
        return true;
      }
    }

    return false;
  }

  async every (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    let idx = 0;
    for await (const item of this._iterable) {
      if (!(await func(item, idx++))) {
        return false;
      }
    }

    return true;
  }

  async reduce (reducer, init) {
    if (typeof reducer !== 'function') {
      throw new Error('reducer should be a function');
    }

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
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
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
    for await (const elem of this._iterable) {
      // do nothing
    }
  }
};


module.exports = AsyncIterable;
