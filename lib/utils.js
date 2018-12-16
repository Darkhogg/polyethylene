exports.identity = (x) => x;

exports.parseOptions = ({pf, prefetch, pl, preload, ...opts}) => Object.freeze({
  ...opts,
  prefetch: !!(prefetch || pf),
  preload: !!(preload || pl),
});

exports.asserts = {
  isFunction (arg) {
    if (typeof arg !== 'function') {
      throw new Error('argument should be a function');
    }
  },

  isPositiveInteger (arg) {
    if (!Number.isInteger(arg) || arg <= 0) {
      throw new Error('argument should be a positive integer');
    }
  },

  isNonNegativeInteger (arg) {
    if (!Number.isInteger(arg) || arg < 0) {
      throw new Error('argument should be a non-negative integer');
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
