exports.identity = (x) => x;

exports.parseOptions = ({pf, prefetch, pl, preload, ...opts}) => Object.freeze({
  ...opts,
  prefetch: !!(prefetch || pf),
  preload: !!(preload || pl),
});

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
