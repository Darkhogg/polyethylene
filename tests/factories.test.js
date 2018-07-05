const Poly = require('..');

const {expect} = require('chai');

const {collectSync, collectAsync} = require('./_utils');

describe('Factory Methods', function () {
  describe('.from', function () {
    it('should return an iterable if given an iterable', () => {
      const obj = {[Symbol.iterator](){}};
      const iter = Poly.from(obj);

      expect(iter[Symbol.iterator]).to.exist;
    });

    it('should return an iterable that produces the correct values', () => {
      const values = [1, 3, 3, 7];
      const obj = {
        * [Symbol.iterator] () {yield * values;}
      };
      const iter = Poly.from(obj);

      expect(collectSync(iter)).to.deep.equal(values);
    });

    it('should return an async iterable if given an async iterable', () => {
      const obj = {[Symbol.asyncIterator](){}};
      const iter = Poly.from(obj);

      expect(iter[Symbol.asyncIterator]).to.exist;
    });

    it('should return an async iterable that produces the correct values', async () => {
      const values = [1, 3, 3, 7];
      const obj = {
        * [Symbol.asyncIterator] () {yield * values;}
      };
      const iter = Poly.from(obj);

      expect(await collectAsync(iter)).to.deep.equal(values);
    });

    it('should throw if not given an iterable', () => {
      expect(() => Poly.from(0)).to.throw();
    });

    it('should throw if given an object that is both iterable and async iterable', () => {
      const badObj = {
        [Symbol.iterator] () {},
        [Symbol.asyncIterator] () {},
      };
      expect(() => Poly.from(badObj)).to.throw();
    });

    it('should not add overhead if passed a known SyncIterable', () => {
      const origIter = Poly.from([]);
      const iter = Poly.from(origIter);

      expect(iter).to.equal(origIter);
    });

    it('should not add overhead if passed a known AsyncIterable', () => {
      const origIter = Poly.from([]).async();
      const iter = Poly.from(origIter);

      expect(iter).to.equal(origIter);
    });
  });

  /* we check all three functions at the same time by checing the work the same
   * as their Object counterparts */
  for (const funcName of ['keys', 'values', 'entries']) {
    describe(`.${funcName}`, () => {
      function checkFor (obj) {
        const expected = Object[funcName](obj);
        const actual = collectSync(Poly[funcName](obj));

        expect(actual).to.deep.equal(expected);
      }

      it('should work for simple objects', () => {
        checkFor({foo: 0, bar: 1});
      });

      it('should work for arrays', () => {
        checkFor([0, 1, 3]);
      });

      it('should work for objects with symbols', () => {
        checkFor({[Symbol('test')]: 0});
      });

      it('should work for objects with inherited properties', () => {
        const Child = function () {};
        Child.prototype = {foo: 1}

        checkFor(new Child());
      });
    });
  }



  describe('.range', () => {
    it('should work if only upper bound is specified', () => {
      const iter = Poly.range(3);
      expect(collectSync(iter)).to.deep.equal([0, 1, 2]);
    });

    it('should work if lower and upper bound are specified', () => {
      const iter = Poly.range(1, 5);
      expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4]);
    });

    it('should work ok with a positive step different than 1', () => {
      const iter = Poly.range(1, 9, 2);
      expect(collectSync(iter)).to.deep.equal([1, 3, 5, 7]);
    });

    it('should work ok with a step of -1', () => {
      const iter = Poly.range(5, 0, -1);
      expect(collectSync(iter)).to.deep.equal([5, 4, 3, 2, 1]);
    });

    it('should work ok with a negative step different than -1', () => {
      const iter = Poly.range(6, 0, -2);
      expect(collectSync(iter)).to.deep.equal([6, 4, 2]);
    });

    it('should throw if 0 as step', () => {
      expect(() => Poly.range(0, 0, 0)).to.throw();
    });
  });

  describe('.repeat', () => {
    it('should yield the given value multiple times', () => {
      const value = 42;

      const iter = Poly.repeat(value);
      const expected = Array(100).fill(value);

      expect(collectSync(iter, expected.length)).to.deep.equal(expected);
    });
  });

  describe('.iterate', () => {
    it('should sync yield the result of the passed function for sync functions', () => {
      const iter = Poly.iterate((last) => (last || 0) + 1);
      const expected = [1, 2, 3, 4, 5, 6, 7, 8]

      expect(collectSync(iter, expected.length)).to.deep.equal(expected);
    });

    it('should async yield the result of the passed function for async functions', async () => {
      const iter = Poly.iterate(async (last) => (last || 0) + 1);
      const expected = [1, 2, 3, 4, 5, 6, 7, 8]

      expect(await collectAsync(iter, expected.length)).to.deep.equal(expected);
    });
  });
});
