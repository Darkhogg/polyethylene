/* eslint-disable no-unused-expressions */
const Poly = require('..');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const {expect} = chai;

const {collectAsync} = require('./_utils');

describe('Async Iterable', () => {
  describe('#async', () => {
    it('should return an async iterable', () => {
      const iter = Poly.from(async function * () {}).async();

      expect(iter[Symbol.iterator]).to.not.exist;
      expect(iter[Symbol.asyncIterator]).to.exist;
    });

    it('should yield the same elements as the original', async () => {
      async function * gen () {
        yield * [1, 2, 3];
      }

      const origIter = Poly.from(gen);
      const asyncIter = Poly.from(gen).async();

      await expect(collectAsync(asyncIter)).to.eventually.deep.equal(await collectAsync(origIter));
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).async(opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#drop', () => {
    it('should correctly drop the first few elements', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().drop(3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([4, 5]);
    });

    it('should correctly drop nothing if not passed anything', async () => {
      const iter = Poly.from([1, 2]).async().drop();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2]);
    });

    it('should correctly drop everything if not enough elements', async () => {
      const iter = Poly.from([1, 2]).async().drop(3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([]);
    });

    it('should throw if not passed an integer', async () => {
      expect(() => Poly.from([]).async().drop('foo')).to.throw();
    });

    it('should throw if passed a negative number', async () => {
      expect(() => Poly.from([]).async().drop(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).drop(0, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#take', () => {
    it('should correctly take the first few elements', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().take(3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3]);
    });

    it('should correctly take nothing if not passed anything', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().take();
      await expect(collectAsync(iter)).to.eventually.deep.equal([]);
    });

    it('should correctly take everything if not enough elements', async () => {
      const iter = Poly.from([1, 2]).async().take(3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2]);
    });

    it('should throw if not passed an integer', async () => {
      expect(() => Poly.from([]).async().take('foo')).to.throw();
    });

    it('should throw if passed a negative number', async () => {
      expect(() => Poly.from([]).async().take(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).take(0, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#dropWhile', () => {
    it('should correctly drop as long as the passed function returns true', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().dropWhile(async (n) => n !== 3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([3, 4, 5]);
    });

    it('should correctly stop calling the passed function after the first false', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().dropWhile(async (n) => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      await collectAsync(iter);
    });

    it('should correctly yield nothing if the passed function never returns false', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().dropWhile(async (n) => true);
      await expect(collectAsync(iter)).to.eventually.deep.equal([]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, 2, 0, 4, 5]).async().dropWhile();
      await expect(collectAsync(iter)).to.eventually.deep.equal([0, 4, 5]);
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().dropWhile('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).dropWhile(() => false, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#takeWhile', () => {
    it('should correctly take as long as the passed function returns true', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().takeWhile(async (n) => n !== 3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2]);
    });

    it('should correctly stop calling the passed function after the first false', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().takeWhile(async (n) => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      await collectAsync(iter);
    });

    it('should correctly yield everything if the passed function never returns false', async () => {
      const iter = Poly.from([1, 2, 3]).async().takeWhile(async (n) => true);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, 2, 0, 4, 5]).async().takeWhile();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2]);
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().takeWhile('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).takeWhile(() => true, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#filter', () => {
    it('should only yield elements for which passed function returns true', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5, 6, 7]).async().filter((n) => n % 3 === 1);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 7]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, 0, 3, null, 5, false, 7, '']).async().filter();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 3, 5, 7]);
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().filter('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).filter(() => true, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#map', () => {
    it('should yield elements correctly mapped', async () => {
      const iter = Poly.from([1, 2, 3]).async().map((n) => n * n);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 9]);
    });

    it('should correctly use implicit identity function if function is not passed', async () => {
      const iter = Poly.from([1, 2, 3]).async().map();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).async().map('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).map(() => null, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#tap', () => {
    it('should yield elements of original iteration', async () => {
      const iter = Poly.from([1, 2, 3]).tap((n) => n * n);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3]);
    });

    it('should work and do nothing if no function is passed', async () => {
      const iter = Poly.from([1, 2, 3]).tap();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).async().tap('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from(async function * () {}).tap(() => null, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  const FLAT_METHODS = ['flatten', 'flat'];
  FLAT_METHODS.forEach((name) => {
    describe(`#${name}`, () => {
      it('should correctly yield elements from iterable elements', async () => {
        const iter = Poly.from([
          Poly.range(1).async(),
          Poly.range(2).async(),
          Poly.range(3).async(),
        ]).async()[name]();
        await expect(collectAsync(iter)).to.eventually.deep.equal([0, 0, 1, 0, 1, 2]);
      });

      it('should be rejected if an element is not iterable', async () => {
        const iter = Poly.from([0]).async()[name]();
        await expect(collectAsync(iter)).to.be.rejected;
      });

      it('should throw if passed argument is not a function', async () => {
        expect(() => Poly.from([]).async().flatMap('foo')).to.throw();
      });

      it('should preserve the options object', () => {
        const opts = {opt: 1};
        const iter = Poly.from(async function * () {})[name](opts);

        expect(iter.options.opt).to.equal(opts.opt);
      });
    });
  });


  describe('#flatMap', () => {
    it('should yield elements correctly mapped', async () => {
      const iter = Poly.from([1, 2, 3]).async().flatMap((n) => Array(n).fill().map((_, i) => (10 * n) + i));
      await expect(collectAsync(iter)).to.eventually.deep.equal([10, 20, 21, 30, 31, 32]);
    });

    it('should correctly use implicit identity function if function is not passed', async () => {
      const iter = Poly.from([[1, 2], [3, 4, 5]]).async().flatMap();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5]);
    });

    it('should throw if a mapped element is not iterable', async () => {
      const iter = Poly.from([0]).async().flatMap();
      await expect(collectAsync(iter)).to.be.rejected;
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().flatMap('foo')).to.throw();
    });

    it('should preserve the options object', async () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).async().flatMap(() => null, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#group', () => {
    it('should yield elements correctly grouped if amount is a divisor', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5, 6]).async().group(2);
      await expect(collectAsync(iter)).to.eventually.deep.equal([[1, 2], [3, 4], [5, 6]]);
    });

    it('should yield last elements correctly grouped if amount is not a divisor', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().group(2);
      await expect(collectAsync(iter)).to.eventually.deep.equal([[1, 2], [3, 4], [5]]);
    });

    it('should yield nothing if original iterable was empty', async () => {
      const iter = Poly.from([]).async().group(2);
      await expect(collectAsync(iter)).to.eventually.deep.equal([]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Poly.from([]).async().group('foo')).to.throw();
    });

    it('should throw if passed zero', () => {
      expect(() => Poly.from([]).async().group(0)).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Poly.from([]).async().group(-1)).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).async().group(1, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#groupWhile', () => {
    it('should yield elements correctly grouped', async () => {
      const iter = Poly.range(0, 10).async().groupWhile((elem) => elem % 4 !== 0 && elem % 5 !== 0);
      await expect(collectAsync(iter)).to.eventually.deep.equal([[0, 1, 2, 3], [4], [5, 6, 7], [8, 9]]);
    });

    it('should yield nothing if original iterable was empty', async () => {
      const iter = Poly.from([]).async().groupWhile();
      await expect(collectAsync(iter)).to.eventually.deep.equal([]);
    });

    it('should throw if not passed a function', async () => {
      expect(() => Poly.from([]).async().groupWhile('foo')).to.throw();
    });

    it('should preserve the options object', async () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).async().groupWhile(() => true, opts);

      expect(iter.options.opt).to.equal(opts.opt);
    });
  });


  describe('#toArray', () => {
    it('should return all elements as an array', async () => {
      const iter = Poly.range(3).async();
      await expect(iter.toArray()).to.eventually.deep.equal([0, 1, 2]);
    });

    it('should return empty array if no elements', async () => {
      const iter = Poly.range(0).async();
      await expect(iter.toArray()).to.eventually.deep.equal([]);
    });
  });


  describe('#find', () => {
    it('should correctly return first element for which passed function is true', async () => {
      const iter = Poly.range(15).async();
      await expect(iter.find(async (n) => n % 6 === 5)).to.eventually.equal(5);
    });

    it('should correctly return undefined if passed function never returns true', async () => {
      const iter = Poly.range(15).async();
      await expect(iter.find(async (n) => false)).to.eventually.not.exist;
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([0, null, '', false, 42]).async();
      await expect(iter.find()).to.eventually.equal(42);
    });

    it('should work for infinite iterables for which the passed function returns true', async () => {
      const iter = Poly.iterate((n) => (n || 0) + 1).async();
      await expect(iter.find(async (n) => n % 15 === 0)).to.eventually.equal(15);
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().find('foo')).to.be.rejected;
    });
  });


  describe('#includes', () => {
    it('should correctly return true if element is included', async () => {
      const iter = Poly.range(15).async();
      await expect(iter.includes(7)).to.eventually.be.ok;
    });

    it('should correctly return true if 0 is included and asked for -0', async () => {
      const iter = Poly.range(1).async();
      await expect(iter.includes(-0)).to.eventually.be.ok;
    });

    it('should correctly return false if element is not included', async () => {
      const iter = Poly.range(15).async();
      await expect(iter.includes(17)).to.eventually.not.be.ok;
    });

    it('should work for infinite iterables that contain the element', async () => {
      const iter = Poly.iterate((n) => (n || 0) + 1).async();
      await expect(iter.includes(42)).to.eventually.be.ok;
    });
  });


  describe('#some', () => {
    it('should correctly return true if passed function returns true at any point', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.some((n) => n === 13)).to.eventually.be.ok;
    });

    it('should correctly return false if passed function always return false', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.some((n) => false)).to.eventually.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([0, null, '']).async();
      await expect(iter.some()).to.eventually.not.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns true', async () => {
      const iter = Poly.iterate((n) => (n || 0) + 1).async();
      await expect(iter.some((n) => n === 42)).to.eventually.be.ok;
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().some('foo')).to.be.rejected;
    });
  });


  describe('#every', () => {
    it('should correctly return true if passed function always returns true', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.every((n) => true)).to.eventually.be.ok;
    });

    it('should correctly return false if passed function return false at any point', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.every((n) => n !== 13)).to.eventually.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, true, 'foo']).async();
      await expect(iter.every()).to.eventually.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns false', async () => {
      const iter = Poly.iterate((n) => (n || 0) + 1).async();
      await expect(iter.every((n) => n !== 42)).to.eventually.not.be.ok;
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().every('foo')).to.be.rejected;
    });
  });


  describe('#reduce', () => {
    it('should correctly accumulate the result of the given function', async () => {
      const iter = Poly.from([1, 2, 3, 4]).async();
      await expect(iter.reduce((a, b) => a + b)).to.eventually.equal(10);
    });

    it('should use the given init value as starting accumulator', async () => {
      const iter = Poly.from([1, 2, 3, 4]).async();
      await expect(iter.reduce((a, _) => a, 'i')).to.eventually.equal('i');
    });

    it('should use the first element as accumulator if no init value given', async () => {
      const iter = Poly.from([1, 2, 3, 4]).async();
      await expect(iter.reduce((a, _) => a)).to.eventually.equal(1);
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().reduce('foo')).to.be.rejected;
    });
  });


  describe('#forEach', () => {
    it('should call the passed function once per element', async () => {
      const called = [];
      await Poly.from([1, 2, 3]).async().forEach(async (n) => called.push(n));

      expect(called).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().forEach('foo')).to.be.rejected;
    });
  });


  describe('#join', () => {
    it('should correctly join the elements using the given glue', async () => {
      const iter = Poly.from([1, 2, null, 3]).async();
      await expect(iter.join('|')).to.eventually.equal('1|2||3');
    });

    it('should correctly join the elements using a comma if no glue given', async () => {
      const iter = Poly.from([1, 2, null, 3]).async();
      await expect(iter.join()).to.eventually.equal('1,2,,3');
    });
  });


  describe('#drain', () => {
    it('should drain the iterable', async () => {
      let called = false;
      const iter = Poly.from(async function * () {
        yield * Array(10).fill(0);
        called = true;
      });

      await iter.drain();
      expect(called, 'iterable drained').to.be.ok;
    });
  });
});
