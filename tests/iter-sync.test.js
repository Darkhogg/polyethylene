const Poly = require('..');

const {expect} = require('chai');

const {collectSync, collectAsync} = require('./_utils');

describe('Sync Iterable', function () {
  describe('#async', function () {
    it('should return an async iterable', () => {
      const iter = Poly.from(function * () {}).async();

      expect(iter[Symbol.iterator]).to.not.exist;
      expect(iter[Symbol.asyncIterator]).to.exist;
    });

    it('should yield the same elements as the original', async () => {
      const gen = function * () { yield * [1, 2, 3]; };

      const origIter = Poly.from(gen);
      const asyncIter = Poly.from(gen).async();

      expect(await collectAsync(asyncIter)).to.deep.equal(await collectAsync(origIter));
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).async(opts);

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#drop', function () {
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

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#take', function () {
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

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#dropWhile', function () {
    it('should correctly drop as long as the passed function returns true', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).dropWhile(n => n != 3);
      expect(collectSync(iter)).to.deep.equal([3, 4, 5]);
    });

    it('should correctly stop calling the passed function after the first false', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).dropWhile(n => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      collectSync(iter);
    });

    it('should correctly yield nothing if the passed function never returns false', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).dropWhile(n => true);
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

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#takeWhile', function () {
    it('should correctly take as long as the passed function returns true', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).takeWhile(n => n != 3);
      expect(collectSync(iter)).to.deep.equal([1, 2]);
    });

    it('should correctly stop calling the passed function after the first false', () => {
      const iter = Poly.from([1, 2, 3, 4, 5]).takeWhile(n => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      collectSync(iter);
    });

    it('should correctly yield everything if the passed function never returns false', () => {
      const iter = Poly.from([1, 2, 3]).takeWhile(n => true);
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

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#filter', function () {
    it('should only yield elements for which passed function returns true', () => {
      const iter = Poly.from([1, 2, 3, 4, 5, 6, 7]).filter(n => n % 3 == 1);
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

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#map', function () {
    it('should yield elements correctly mapped', () => {
      const iter = Poly.from([1, 2, 3]).map(n => n * n);
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

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#flatten', function () {
    it('should correctly yield elements from iterable elements', () => {
      const iter = Poly.from([Poly.range(1), Poly.range(2), Poly.range(3)]).flatten();
      expect(collectSync(iter)).to.deep.equal([0, 0, 1, 0, 1, 2]);
    });

    it('should throw if an element is not iterable', () => {
      const iter = Poly.from([0]).flatten();
      expect(() => collectSync(iter)).to.throw();
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).flatMap('foo')).to.throw();
    });

    it('should preserve the options object', () => {
      const opts = {opt: 1};
      const iter = Poly.from([]).flatten(opts);

      expect(iter.options).to.deep.equal(opts);
    });
  });


  describe('#toArray', function () {
    it('should return all elements as an array', () => {
      const iter = Poly.range(3);
      expect(iter.toArray()).to.deep.equal([0, 1, 2]);
    });

    it('should return empty array if no elements', () => {
      const iter = Poly.range(0);
      expect(iter.toArray()).to.deep.equal([]);
    });
  });


  describe('#find', function () {
    it('should correctly return first element for which passed function is true', () => {
      const iter = Poly.range(15);
      expect(iter.find(n => n % 6 == 5)).to.equal(5);
    });

    it('should correctly return undefined if passed function never returns true', () => {
      const iter = Poly.range(15);
      expect(iter.find(n => false)).to.not.exist;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([0, null, '', false, 42]);
      expect(iter.find()).to.equal(42);
    });

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.iterate(n => (n || 0) + 1);
      expect(iter.find(n => n % 15 == 0)).to.equal(15);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).find('foo')).to.throw();
    });
  });


  describe('#includes', function () {
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
      const iter = Poly.iterate(n => (n || 0) + 1);
      expect(iter.includes(42)).to.be.ok;
    });
  });


  describe('#some', function () {
    it('should correctly return true if passed function returns true at any point', () => {
      const iter = Poly.range(42);
      expect(iter.some(n => n == 13)).to.be.ok;
    });

    it('should correctly return false if passed function always return false', () => {
      const iter = Poly.range(42);
      expect(iter.some(n => false)).to.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([0, null, '']);
      expect(iter.some()).to.not.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.iterate(n => (n || 0) + 1);
      expect(iter.some(n => n == 42)).to.be.ok;
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).some('foo')).to.throw();
    });
  });


  describe('#every', function () {
    it('should correctly return true if passed function always returns true', () => {
      const iter = Poly.range(42);
      expect(iter.every(n => true)).to.be.ok;
    });

    it('should correctly return false if passed function return false at any point', () => {
      const iter = Poly.range(42);
      expect(iter.every(n => n != 13)).to.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const iter = Poly.from([1, true, 'foo']);
      expect(iter.every()).to.be.ok;
    });

    it('should work for infinite iterables for which the passed function returns false', () => {
      const iter = Poly.iterate(n => (n || 0) + 1);
      expect(iter.every(n => n != 42)).to.not.be.ok;
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).every('foo')).to.throw();
    });
  });


  describe('#reduce', function () {
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


  describe('#forEach', function () {
    it('should call the passed function once per element', () => {
      const called = [];
      Poly.from([1, 2, 3]).forEach(n => called.push(n));

      expect(called).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.from([]).forEach('foo')).to.throw();
    });
  });


  describe('#join', function () {
    it('should correctly join the elements using the given glue', () => {
      const iter = Poly.from([1, 2, null, 3]);
      expect(iter.join('|')).to.equal('1|2||3');
    });

    it('should correctly join the elements using a comma if no glue given', () => {
      const iter = Poly.from([1, 2, null, 3]);
      expect(iter.join()).to.equal('1,2,,3');
    });
  });

  describe('#drain', function () {
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
