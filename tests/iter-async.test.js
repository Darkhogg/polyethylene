const Poly = require('..');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const {expect} = chai;

const {collectAsync} = require('./_utils');

describe('Async Iterable', function () {
  describe('#async', function () {
    it('should return an async iterable', () => {
      const iter = Poly.from(async function * () {}).async();

      expect(iter[Symbol.iterator]).to.not.exist;
      expect(iter[Symbol.asyncIterator]).to.exist;
    });

    it('should yield the same elements as the original', async () => {
      const gen = async function * () { yield * [1, 2, 3]; };

      const origIter = Poly.from(gen);
      const asyncIter = Poly.from(gen).async();

      await expect(collectAsync(asyncIter)).to.eventually.deep.equal(await collectAsync(origIter));
    });
  });


  describe('#drop', function () {
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
  });


  describe('#take', function () {
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
  });


  describe('#dropWhile', function () {
    it('should correctly drop as long as the passed function returns true', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().dropWhile(async n => n != 3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([3, 4, 5]);
    });

    it('should correctly stop calling the passed function after the first false', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().dropWhile(async n => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      await collectAsync(iter);
    });

    it('should correctly yield nothing if the passed function never returns false', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().dropWhile(async n => true);
      await expect(collectAsync(iter)).to.eventually.deep.equal([]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, 2, 0, 4, 5]).async().dropWhile();
      await expect(collectAsync(iter)).to.eventually.deep.equal([0, 4, 5]);
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().dropWhile('foo')).to.throw();
    });
  });


  describe('#takeWhile', function () {
    it('should correctly take as long as the passed function returns true', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().takeWhile(async n => n != 3);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2]);
    });

    it('should correctly stop calling the passed function after the first false', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).async().takeWhile(async n => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      await collectAsync(iter);
    });

    it('should correctly yield everything if the passed function never returns false', async () => {
      const iter = Poly.from([1, 2, 3]).async().takeWhile(async n => true);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, 2, 0, 4, 5]).async().takeWhile();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2]);
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().takeWhile('foo')).to.throw();
    });
  });


  describe('#filter', function () {
    it('should only yield elements for which passed function returns true', async () => {
      const iter = Poly.from([1, 2, 3, 4, 5, 6, 7]).async().filter(n => n % 3 == 1);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 7]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, 0, 3, null, 5, false, 7, '']).async().filter();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 3, 5, 7]);
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().filter('foo')).to.throw();
    });
  });


  describe('#map', function () {
    it('should yield elements correctly transformed', async () => {
      const iter = Poly.from([1, 2, 3]).async().map(n => n * n);
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 9]);
    });

    it('should correctly use implicit identity function if function is not passed', async () => {
      const iter = Poly.from([1, 2, 3]).async().map();
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().map('foo')).to.throw();
    });
  });


  describe('#flatten', function () {

    it('should correctly yield elements from iterable elements', async () => {
      const iter = Poly.from([
        Poly.range(1).async(),
        Poly.range(2).async(),
        Poly.range(3).async(),
      ]).async().flatten();
      await expect(collectAsync(iter)).to.eventually.deep.equal([0, 0, 1, 0, 1, 2]);
    });

    it('should be rejected if an element is not iterable', async () => {
      const iter = Poly.from([0]).async().flatten();
      await expect(collectAsync(iter)).to.be.rejected;
    });

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.from([]).async().flatMap('foo')).to.throw();
    });
  });


  describe('#toArray', function () {
    it('should return all elements as an array', async () => {
      const iter = Poly.range(3).async();
      await expect(iter.toArray()).to.eventually.deep.equal([0, 1, 2]);
    });

    it('should return empty array if no elements', async () => {
      const iter = Poly.range(0).async();
      await expect(iter.toArray()).to.eventually.deep.equal([]);
    });
  });


  describe('#find', function () {
    it('should correctly return first element for which passed function is true', async () => {
      const iter = Poly.range(15).async();
      await expect(iter.find(async n => n % 6 == 5)).to.eventually.equal(5);
    });

    it('should correctly return undefined if passed function never returns true', async () => {
      const iter = Poly.range(15).async();
      await expect(iter.find(async n => false)).to.eventually.not.exist;
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([0, null, '', false, 42]).async();
      await expect(iter.find()).to.eventually.equal(42);
    });

    it('should work for infinite iterables for which the passed function returns true', async () => {
      const iter = Poly.iterate(n => (n || 0) + 1).async();
      await expect(iter.find(async n => n % 15 == 0)).to.eventually.equal(15);
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().find('foo')).to.be.rejected;
    });
  });


  describe('#includes', function () {
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
      const iter = Poly.iterate(n => (n || 0) + 1).async();
      await expect(iter.includes(42)).to.eventually.be.ok;
    });
  });


  describe('#some', function () {
    it('should correctly return true if passed function returns true at any point', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.some(n => n == 13)).to.eventually.be.ok;
    });

    it('should correctly return false if passed function always return false', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.some(n => false)).to.eventually.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([0, null, '']).async();
      await expect(iter.some()).to.eventually.not.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns true', async () => {
      const iter = Poly.iterate(n => (n || 0) + 1).async();
      await expect(iter.some(n => n == 42)).to.eventually.be.ok;
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().some('foo')).to.be.rejected;
    });
  });


  describe('#every', function () {
    it('should correctly return true if passed function always returns true', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.every(n => true)).to.eventually.be.ok;
    });

    it('should correctly return false if passed function return false at any point', async () => {
      const iter = Poly.range(42).async();
      await expect(iter.every(n => n != 13)).to.eventually.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', async () => {
      const iter = Poly.from([1, true, 'foo']).async();
      await expect(iter.every()).to.eventually.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns false', async () => {
      const iter = Poly.iterate(n => (n || 0) + 1).async();
      await expect(iter.every(n => n != 42)).to.eventually.not.be.ok;
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().every('foo')).to.be.rejected;
    });
  });


  describe('#reduce', function () {
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


  describe('#forEach', function () {
    it('should call the passed function once per element', async () => {
      const called = [];
      await Poly.from([1, 2, 3]).async().forEach(async n => called.push(n));

      expect(called).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.from([]).async().forEach('foo')).to.be.rejected;
    });
  });


  describe('#join', function () {
    it('should correctly join the elements using the given glue', async () => {
      const iter = Poly.from([1, 2, null, 3]).async();
      await expect(iter.join('|')).to.eventually.equal('1|2||3');
    });

    it('should correctly join the elements using a comma if no glue given', async () => {
      const iter = Poly.from([1, 2, null, 3]).async();
      await expect(iter.join()).to.eventually.equal('1,2,,3');
    });
  });


  describe('#drain', function () {
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
