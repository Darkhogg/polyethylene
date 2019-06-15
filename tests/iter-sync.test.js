/* eslint-disable no-unused-expressions */
const Poly = require('..');

const {expect} = require('chai');

const {collectSync, collectAsync} = require('./_utils');

describe('Sync Iterable', () => {
  describe('#async', () => {
    it('should return an async iterable', () => {
      const iter = Poly.from(function * () {}).async();

      expect(iter[Symbol.iterator]).to.not.exist;
      expect(iter[Symbol.asyncIterator]).to.exist;
    });

    it('should yield the same elements as the original', async () => {
      function * gen () {
        yield * [1, 2, 3];
      }

      const origIter = Poly.from(gen);
      const asyncIter = Poly.from(gen).async();

      expect(await collectAsync(asyncIter)).to.deep.equal(await collectAsync(origIter));
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).async(opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#drop', () => {
    it('should correctly drop the first few elements', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).drop(3);
      expect(collectSync(iter)).to.deep.equal([4, 5]);
    });

    it('should correctly drop nothing if not passed anything', () => {
      const iter = Poly.from([1, 2]).drop();
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should correctly drop everything if not enough elements', () => {
      const iter = Poly.from([1, 2]).drop(3);
      expect(collectSync(iter)).to.deep.equal([]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Poly.from([]).drop('foo')).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Poly.from([]).drop(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).drop(0, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#dropLast', () => {
    it('should correctly drop the last few elements', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).dropLast(3);
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should correctly drop nothing if not passed anything', () => {
      const iter = Poly.from([1, 2]).dropLast();
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should correctly drop everything if not enough elements', () => {
      const iter = Poly.from([1, 2]).dropLast(3);
      expect(collectSync(iter)).to.deep.equal([]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Poly.from([]).dropLast('foo')).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Poly.from([]).dropLast(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).dropLast(0, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#take', () => {
    it('should correctly take the first few elements', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).take(3);
      expect(collectSync(iter)).to.deep.equal([1, 2, 3]);
    });

    it('should correctly take nothing if not passed anything', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).take();
      expect(collectSync(iter)).to.deep.equal([]);
    });

    it('should correctly take everything if not enough elements', () => {
      const iter = Poly.from([1, 2]).take(3);
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Poly.from([]).take('foo')).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Poly.from([]).take(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).take(0, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#takeLast', () => {
    it('should correctly take the last few elements', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).takeLast(3);
      expect(collectSync(iter)).to.deep.equal([3, 4, 5]);
    });

    it('should correctly take nothing if not passed anything', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).takeLast();
      expect(collectSync(iter)).to.deep.equal([]);
    });

    it('should correctly take everything if not enough elements', () => {
      const iter = Poly.from([1, 2]).takeLast(3);
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Poly.from([]).takeLast('foo')).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Poly.from([]).takeLast(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).takeLast(0, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#dropWhile', () => {
    it('should correctly drop as long as the passed function returns true', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).dropWhile((n) => n !== 3);
      expect(collectSync(iter)).to.deep.equal([3, 4, 5]);
    });

    it('should correctly stop calling the passed function after the first false', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).dropWhile((n) => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      collectSync(iter);
    });

    it('should correctly yield nothing if the passed function never returns false', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).dropWhile((n) => true);
      expect(collectSync(iter)).to.deep.equal([]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([1, 2, 0, 4, 5]).dropWhile();
      expect(collectSync(iter)).to.deep.equal([0, 4, 5]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).dropWhile('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).dropWhile(() => false, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#takeWhile', () => {
    it('should correctly take as long as the passed function returns true', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).takeWhile((n) => n !== 3);
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should correctly stop calling the passed function after the first false', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).takeWhile((n) => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      collectSync(iter);
    });

    it('should correctly yield everything if the passed function never returns false', () => {
      const iter = Poly.from([1, 2, 3]).takeWhile((n) => true);
      expect(collectSync(iter)).to.deep.equal([1, 2, 3]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([1, 2, 0, 4, 5]).takeWhile();
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).takeWhile('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).takeWhile(() => true, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#filter', () => {
    it('should only yield elements for which passed function returns true', () => {
      const iter = Poly.from([1, 2, 3, 4, 5, 6, 7]).filter((n) => n % 3 === 1);
      expect(collectSync(iter)).to.deep.equal([1, 4, 7]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([1, 0, 3, null, 5, false, 7, '']).filter();
      expect(collectSync(iter)).to.deep.equal([1, 3, 5, 7]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).filter('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).filter(() => false, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#map', () => {
    it('should yield elements correctly mapped', () => {
      const iter = Poly.from([1, 2, 3]).map((n) => n * n);
      expect(collectSync(iter)).to.deep.equal([1, 4, 9]);
    });

    it('should correctly use implicit identity function if function is not passed', () => {
      const iter = Poly.from([1, 2, 3]).map();
      expect(collectSync(iter)).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).map('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).map(() => null, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#tap', () => {
    it('should yield elements of original iteration', () => {
      const iter = Poly.from([1, 2, 3]).tap((n) => n * n);
      expect(collectSync(iter)).to.deep.equal([1, 2, 3]);
    });

    it('should work and do nothing if no function is passed', () => {
      const iter = Poly.from([1, 2, 3]).tap();
      expect(collectSync(iter)).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).tap('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).tap(() => null, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  const FLAT_METHODS = ['flatten', 'flat'];
  FLAT_METHODS.forEach((name) => {
    describe(`#${name}`, () => {
      it('should correctly yield elements from iterable elements', () => {
        const iter = Poly.from([Poly.range(1), Poly.range(2), Poly.range(3)])[name]();
        expect(collectSync(iter)).to.deep.equal([0, 0, 1, 0, 1, 2]);
      });

      it('should throw if an element is not iterable', () => {
        const iter = Poly.from([0])[name]();
        expect(() => collectSync(iter)).to.throw();
      });

      it('should throw if passed argument is not a function', () => {
        expect(() => Poly.from([]).flatMap('foo')).to.throw();
      });

      it('should preserve the options object', () => {
        const opts = {opt: 1};
        const iter = Poly.from([])[name](opts);

        expect(iter.options.opt).to.equal(opts.opt);
      });
    });
  });


  describe('#flatMap', () => {
    it('should yield elements correctly mapped', () => {
      const iter = Poly.from([1, 2, 3]).flatMap((n) => Array(n).fill().map((_, i) => (10 * n) + i));
      expect(collectSync(iter)).to.deep.equal([10, 20, 21, 30, 31, 32]);
    });

    it('should correctly use implicit identity function if function is not passed', () => {
      const iter = Poly.from([[1, 2], [3, 4, 5]]).flatMap();
      expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5]);
    });

    it('should throw if a mapped element is not iterable', () => {
      const iter = Poly.from([0]).flatMap();
      expect(() => collectSync(iter)).to.throw();
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).flatMap('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).flatMap(() => null, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#group', () => {
    it('should yield elements correctly grouped if amount is a divisor', () => {
      const iter = Poly.from([1, 2, 3, 4, 5, 6]).group(2);
      expect(collectSync(iter)).to.deep.equal([[1, 2], [3, 4], [5, 6]]);
    });

    it('should yield last elements correctly grouped if amount is not a divisor', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).group(2);
      expect(collectSync(iter)).to.deep.equal([[1, 2], [3, 4], [5]]);
    });

    it('should yield nothing if original iterable was empty', () => {
      const iter = Poly.from([]).group(2);
      expect(collectSync(iter)).to.deep.equal([]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Poly.from([]).group('foo')).to.throw();
    });

    it('should throw if passed zero', () => {
      expect(() => Poly.from([]).group(0)).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Poly.from([]).group(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).group(1, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#groupWhile', () => {
    it('should yield elements correctly grouped', () => {
      const iter = Poly.range(0, 10).groupWhile((elem) => elem % 4 !== 0 && elem % 5 !== 0);
      expect(collectSync(iter)).to.deep.equal([[0, 1, 2, 3], [4], [5, 6, 7], [8, 9]]);
    });

    it('should yield nothing if original iterable was empty', () => {
      const iter = Poly.from([]).groupWhile();
      expect(collectSync(iter)).to.deep.equal([]);
    });

    it('should throw if not passed a function', () => {
      expect(() => Poly.from([]).groupWhile('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).groupWhile(() => true, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#toArray', () => {
    it('should return all elements as an array', () => {
      const iter = Poly.range(3);
      expect(iter.toArray()).to.deep.equal([0, 1, 2]);
    });

    it('should return empty array if no elements', () => {
      const iter = Poly.range(0);
      expect(iter.toArray()).to.deep.equal([]);
    });
  });


  describe('#find', () => {
    it('should correctly return first element for which passed function is true', () => {
      const iter = Poly.range(15);
      expect(iter.find((n) => n % 6 === 5)).to.equal(5);
    });

    it('should correctly return undefined if passed function never returns true', () => {
      const iter = Poly.range(15);
      expect(iter.find((n) => false)).to.not.exist;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([0, null, '', false, 42]);
      expect(iter.find()).to.equal(42);
    });

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.iterate((n) => (n || 0) + 1);
      expect(iter.find((n) => n % 15 === 0)).to.equal(15);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).find('foo')).to.throw();
    });
  });


  describe('#includes', () => {
    it('should correctly return true if element is included', () => {
      const iter = Poly.range(15);
      expect(iter.includes(7)).to.be.ok;
    });

    it('should correctly return true if 0 is included and asked for -0', () => {
      const iter = Poly.range(1);
      expect(iter.includes(-0)).to.be.ok;
    });

    it('should correctly return false if element is not included', () => {
      const iter = Poly.range(15);
      expect(iter.includes(17)).to.not.be.ok;
    });

    it('should work for infinite iterables that contain the element', () => {
      const iter = Poly.iterate((n) => (n || 0) + 1);
      expect(iter.includes(42)).to.be.ok;
    });
  });


  describe('#some', () => {
    it('should correctly return true if passed function returns true at any point', () => {
      const iter = Poly.range(42);
      expect(iter.some((n) => n === 13)).to.be.ok;
    });

    it('should correctly return false if passed function always return false', () => {
      const iter = Poly.range(42);
      expect(iter.some((n) => false)).to.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([0, null, '']);
      expect(iter.some()).to.not.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.iterate((n) => (n || 0) + 1);
      expect(iter.some((n) => n === 42)).to.be.ok;
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).some('foo')).to.throw();
    });
  });


  describe('#every', () => {
    it('should correctly return true if passed function always returns true', () => {
      const iter = Poly.range(42);
      expect(iter.every((n) => true)).to.be.ok;
    });

    it('should correctly return false if passed function return false at any point', () => {
      const iter = Poly.range(42);
      expect(iter.every((n) => n !== 13)).to.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([1, true, 'foo']);
      expect(iter.every()).to.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns false', () => {
      const iter = Poly.iterate((n) => (n || 0) + 1);
      expect(iter.every((n) => n !== 42)).to.not.be.ok;
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).every('foo')).to.throw();
    });
  });


  describe('#reduce', () => {
    it('should correctly accumulate the result of the given function', () => {
      const iter = Poly.from([1, 2, 3, 4]);
      expect(iter.reduce((a, b) => a + b)).to.equal(10);
    });

    it('should use the given init value as starting accumulator', () => {
      const iter = Poly.from([1, 2, 3, 4]);
      expect(iter.reduce((a, _) => a, 'i')).to.equal('i');
    });

    it('should use the first element as accumulator if no init value given', () => {
      const iter = Poly.from([1, 2, 3, 4]);
      expect(iter.reduce((a, _) => a)).to.equal(1);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).reduce('foo')).to.throw();
    });
  });


  describe('#forEach', () => {
    it('should call the passed function once per element', () => {
      const called = [];
      Poly.from([1, 2, 3]).forEach((n) => called.push(n));

      expect(called).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).forEach('foo')).to.throw();
    });
  });


  describe('#join', () => {
    it('should correctly join the elements using the given glue', () => {
      const iter = Poly.from([1, 2, null, 3]);
      expect(iter.join('|')).to.equal('1|2||3');
    });

    it('should correctly join the elements using a comma if no glue given', () => {
      const iter = Poly.from([1, 2, null, 3]);
      expect(iter.join()).to.equal('1,2,,3');
    });
  });

  describe('#drain', () => {
    it('should drain the iterable', () => {
      let called = false;
      const iter = Poly.from(function * () {
        yield * Array(10).fill(0);
        called = true;
      });

      iter.drain();
      expect(called, 'iterable drained').to.be.ok;
    });
  });
});
