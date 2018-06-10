const AsyncSequence = require('./sequence-async');

const ID = x => x;


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
  let yielding = false;
  for (const elem of iter) {
    if (yielding || !func(elem)) {
      yielding = true;
      yield elem;
    }
  }
}

function * takeWhileGen (iter, func) {
  for (const elem of iter) {
    if (!func(elem)) {
      return;
    }
    yield elem;
  }
}

function * filterGen (iter, func) {
  for (const elem of iter) {
    if (func(elem)) {
      yield elem;
    }
  }
}

function * mapGen (iter, func) {
  for (const elem of iter) {
    yield func(elem);
  }
}

function * flatMapGen (iter, func) {
  for (const elem of iter) {
    yield * func(elem);
  }
}


class SyncSequence {
  constructor (iterable) {
    this._iterable = iterable;
  }

  * [Symbol.iterator] () {
    yield * this._iterable;
  }

  async () {
    return new AsyncSequence(this._iterable);
  }

  drop (num = 0) {
    if (num < 0 || !Number.isInteger(num)) {
      throw new Error('argument should be a non-negative integer');
    }
    return new SyncSequence(dropGen(this._iterable, num));
  }

  take (num = 0) {
    if (num < 0 || !Number.isInteger(num)) {
      throw new Error('argument should be a non-negative integer');
    }
    return new SyncSequence(takeGen(this._iterable, num));
  }

  dropWhile (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncSequence(dropWhileGen(this._iterable, func));
  }

  takeWhile (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncSequence(takeWhileGen(this._iterable, func));
  }

  filter (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncSequence(filterGen(this._iterable, func));
  }

  map (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncSequence(mapGen(this._iterable, func));
  }

  flatMap (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    return new SyncSequence(flatMapGen(this._iterable, func));
  }

  toArray () {
    return Array.from(this._iterable);
  }

  find (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    for (const elem of this._iterable) {
      if (func(elem)) {
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

  some (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    for (const item of this._iterable) {
      if (func(item)) {
        return true;
      }
    }

    return false;
  }

  every (func = ID) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    for (const item of this._iterable) {
      if (!func(item)) {
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

    for (const elem of this._iterable) {
      accumulated = isFirst ? elem : reducer(accumulated, elem);
      isFirst = false;
    }

    return accumulated;
  }

  forEach (func) {
    if (typeof func !== 'function') {
      throw new Error('argument should be a function');
    }
    for (const elem of this._iterable) {
      func(elem);
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
};


module.exports = SyncSequence;
