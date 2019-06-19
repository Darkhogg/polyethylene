exports.identity = (x) => x;

exports.parseOptions = ({pf, prefetch, pl, preload, ...opts}) => Object.freeze({
  ...opts,
  prefetch: !!(prefetch || pf),
  preload: !!(preload || pl),
});

exports.asserts = {
  isFunction (arg, name = 'argument') {
    if (typeof arg !== 'function') {
      throw new Error(`${name} should be a function`);
    }
  },

  isInteger (arg, name = 'argument') {
    if (!Number.isInteger(arg)) {
      throw new Error(`${name} should be an integer`);
    }
  },

  isPositiveInteger (arg, name = 'argument') {
    if (!Number.isInteger(arg) || arg <= 0) {
      throw new Error(`${name} should be a positive integer`);
    }
  },

  isNonNegativeInteger (arg, name = 'argument') {
    if (!Number.isInteger(arg) || arg < 0) {
      throw new Error(`${name} should be a non-negative integer`);
    }
  },

  isSyncIterable (arg, name = 'argument') {
    const iteratorMethod = arg[Symbol.iterator];
    if (typeof iteratorMethod !== 'function') {
      throw new Error(`${name} should be sync iterable`);
    }
  },

  isAsyncIterable (arg, name = 'argument') {
    const iteratorMethod = arg[Symbol.asyncIterator] || arg[Symbol.iterator];
    if (typeof iteratorMethod !== 'function') {
      throw new Error(`${name} should be async iterable`);
    }
  },
};

exports.prefetch = async function * (iterable) {
  const it = iterable[Symbol.asyncIterator]();

  let cont = true;
  let prom = it.next();
  while (cont) {
    const {value, done} = await prom;

    prom = it.next();

    cont = !done;
    if (cont) {
      yield value;
    }
  }
};

exports.preload = function (iterable) {
  const it = iterable[Symbol.asyncIterator]();
  let firstProm = it.next();

  return {
    async * [Symbol.asyncIterator] () {
      let cont = true;
      while (cont) {
        const {value, done} = await (firstProm || it.next());
        firstProm = null;

        cont = !done;
        if (cont) {
          yield value;
        }
      }
    },
  };
};
