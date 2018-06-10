const AsyncSequence = require('./sequence-async');
const SyncSequence = require('./sequence-sync');


exports.from = function from (iterable) {
  if (typeof iterable === 'function') {
    return from(iterable());
  }

  const isSync = iterable[Symbol.iterator];
  const isAsync = iterable[Symbol.asyncIterator];

  if (isSync && isAsync) {
    throw new Error('iterable is both sync and async');

  } else if (isSync) {
    return new SyncSequence(iterable);

  } else if (isAsync) {
    return new AsyncSequence(iterable);

  } else {
    throw Error('argument is not iterable');
  }
};


exports.entries = function entries (obj) {
  return exports.from(function * () {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        yield [key, obj[key]];
      }
    }
  });
};

exports.keys = function keys (obj) {
  return exports.from(function * () {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        yield key;
      }
    }
  });
};

exports.values = function values (obj) {
  return exports.from(function * () {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        yield obj[key];
      }
    }
  });
};

exports.range = function range (fromOrTo, maybeTo, step = 1) {
  const from = (maybeTo === undefined) ? 0 : fromOrTo;
  const to = (maybeTo === undefined) ? fromOrTo : maybeTo;

  if (step == 0) {
    throw new Error('"step" can\'t be 0')
  }

  return exports.from(function * () {
    for (let n = from; (step > 0 && n < to) || (step < 0 && n > to); n += step) {
      yield n;
    }
  });
}

exports.repeat = function repeat (value) {
  return exports.from(function * () {
    while (true) {
      yield value;
    }
  });
};


function isThennable (obj) {
  return obj && typeof obj.then === 'function';
}

function iterateSync (firstValue, func) {
  return exports.from(function * () {
    let nextValue = firstValue;
    while (true) {
      yield nextValue;
      nextValue = func(nextValue);
    }
  });
}

function iterateAsync (firstValue, func) {
  return exports.from(async function * () {
    let nextValue = await firstValue;
    while (true) {
      yield nextValue;
      nextValue = await func(nextValue);
    }
  });
}

exports.iterate = function iterate (func, options = {}) {
  const firstValue = func();
  const isAsync = options.async || isThennable(firstValue);

  return isAsync ? iterateAsync(firstValue, func) : iterateSync(firstValue, func);
};
