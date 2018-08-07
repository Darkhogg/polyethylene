const AsyncIterable = require('./iter-async');
const SyncIterable = require('./iter-sync');


exports.from = function from (iterable, opts = {}) {
  if (typeof iterable === 'function') {
    return from(iterable(), opts);
  }
  if (iterable instanceof SyncIterable || iterable instanceof AsyncIterable) {
    return iterable;
  }

  const isSync = iterable[Symbol.iterator];
  const isAsync = iterable[Symbol.asyncIterator];

  if (isSync && isAsync) {
    throw new Error('iterable is both sync and async');

  } else if (isSync) {
    return new SyncIterable(iterable, opts);

  } else if (isAsync) {
    return new AsyncIterable(iterable, opts);

  } else {
    throw Error('argument is not iterable');
  }
};


exports.assemble = function assemble (assembler, opts = {}) {
  let currentPromise = null;

  let pendingValues = [];
  let pendingError = null;
  let pendingDone = false;

  /* function to yield a new value */
  const value = (obj) => {
    if (pendingDone) {
      return;
    }

    if (currentPromise) {
      currentPromise.accept({value: obj});
      currentPromise = null;
      return;
    }

    pendingValues.push(obj);
  };

  /* function to notify of an error */
  const error = (err) => {
    if (pendingDone) {
      return;
    }

    pendingDone = true;
    if (currentPromise) {
      currentPromise.reject(err);
      currentPromise = null;
      return;
    }

    pendingError = err;
  };

  /* function to end the iteration */
  const done = () => {
    if (pendingDone) {
      return;
    }

    if (currentPromise) {
      currentPromise.accept({done: true});
      currentPromise = null;
    }

    pendingDone = true;
  }

  return new AsyncIterable({
    [Symbol.asyncIterator] () {
      assembler({value, error, done});

      return {
        async next (/* ignore this */) {
          if (pendingValues.length) {
            return Promise.resolve({value: pendingValues.shift()});
          }
          if (pendingError) {
            pendingError = null;
            return Promise.reject(pendingError);
          }
          if (pendingDone) {
            return Promise.resolve({done: true});
          }

          return new Promise((accept, reject) => {
            currentPromise = {accept, reject};
          });
        },
      };
    },
  }, opts);
};


exports.entries = function entries (obj, opts) {
  return exports.from(function * () {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        yield [key, obj[key]];
      }
    }
  }, opts);
};


exports.keys = function keys (obj, opts) {
  return exports.from(function * () {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        yield key;
      }
    }
  }, opts);
};


exports.values = function values (obj, opts) {
  return exports.from(function * () {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        yield obj[key];
      }
    }
  }, opts);
};


exports.range = function range (fromOrTo, maybeTo, step = 1, opts) {
  const from = (maybeTo === undefined) ? 0 : fromOrTo;
  const to = (maybeTo === undefined) ? fromOrTo : maybeTo;

  if (step == 0) {
    throw new Error('"step" can\'t be 0')
  }

  return exports.from(function * () {
    for (let n = from; (step > 0 && n < to) || (step < 0 && n > to); n += step) {
      yield n;
    }
  }, opts);
}


exports.repeat = function repeat (value, opts) {
  return exports.from(function * () {
    while (true) {
      yield value;
    }
  }, opts);
};


function isThennable (obj) {
  return obj && typeof obj.then === 'function';
}


function iterateSync (firstValue, func, opts) {
  return exports.from(function * () {
    let nextValue = firstValue;
    while (true) {
      yield nextValue;
      nextValue = func(nextValue);
    }
  }, opts);
}


function iterateAsync (firstValue, func, opts) {
  return exports.from(async function * () {
    let nextValue = await firstValue;
    while (true) {
      yield nextValue;
      nextValue = await func(nextValue);
    }
  }, opts);
}


exports.iterate = function iterate (func, initValue, {async, ...options} = {}) {
  const firstResult = func(initValue);
  const isAsync = async || isThennable(firstResult);

  return isAsync ? iterateAsync(firstResult, func, options) : iterateSync(firstResult, func, options);
};
