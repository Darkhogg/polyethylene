const Seq = require('..');

const {expect} = require('chai');

const {collectSync, collectAsync} = require('./_utils');

describe('Sync Sequence', function () {
  describe('#async', function () {
    it('should return an async sequence', () => {
      const seq = Seq.from(function * () {}).async();

      expect(seq[Symbol.iterator]).to.not.exist;
      expect(seq[Symbol.asyncIterator]).to.exist;
    });

    it('should yield the same elements as the original', async () => {
      const gen = function * () { yield * [1, 2, 3]; };

      const origSeq = Seq.from(gen);
      const asyncSeq = Seq.from(gen).async();

      expect(await collectAsync(asyncSeq)).to.deep.equal(await collectAsync(origSeq));
    });
  });


  describe('#drop', function () {
    it('should correctly drop the first few elements', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).drop(3);
      expect(collectSync(seq)).to.deep.equal([4, 5]);
    });

    it('should correctly drop nothing if not passed anything', () => {
      const seq = Seq.from([1, 2]).drop();
      expect(collectSync(seq)).to.deep.equal([1, 2]);
    });

    it('should correctly drop everything if not enough elements', () => {
      const seq = Seq.from([1, 2]).drop(3);
      expect(collectSync(seq)).to.deep.equal([]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Seq.from([]).drop('foo')).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Seq.from([]).drop(-1)).to.throw();
    });
  });


  describe('#take', function () {
    it('should correctly take the first few elements', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).take(3);
      expect(collectSync(seq)).to.deep.equal([1, 2, 3]);
    });

    it('should correctly take nothing if not passed anything', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).take();
      expect(collectSync(seq)).to.deep.equal([]);
    });

    it('should correctly take everything if not enough elements', () => {
      const seq = Seq.from([1, 2]).take(3);
      expect(collectSync(seq)).to.deep.equal([1, 2]);
    });

    it('should throw if not passed an integer', () => {
      expect(() => Seq.from([]).take('foo')).to.throw();
    });

    it('should throw if passed a negative number', () => {
      expect(() => Seq.from([]).take(-1)).to.throw();
    });
  });


  describe('#dropWhile', function () {
    it('should correctly drop as long as the passed function returns true', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).dropWhile(n => n != 3);
      expect(collectSync(seq)).to.deep.equal([3, 4, 5]);
    });

    it('should correctly stop calling the passed function after the first false', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).dropWhile(n => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      collectSync(seq);
    });

    it('should correctly yield nothing if the passed function never returns false', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).dropWhile(n => true);
      expect(collectSync(seq)).to.deep.equal([]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const seq = Seq.from([1, 2, 0, 4, 5]).dropWhile();
      expect(collectSync(seq)).to.deep.equal([0, 4, 5]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).dropWhile('foo')).to.throw();
    });
  });


  describe('#takeWhile', function () {
    it('should correctly take as long as the passed function returns true', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).takeWhile(n => n != 3);
      expect(collectSync(seq)).to.deep.equal([1, 2]);
    });

    it('should correctly stop calling the passed function after the first false', () => {
      const seq = Seq.from([1, 2, 3, 4, 5]).takeWhile(n => {
        if (n > 1) {
          expect.fail('called after first');
        }
        return false;
      });

      collectSync(seq);
    });

    it('should correctly yield everything if the passed function never returns false', () => {
      const seq = Seq.from([1, 2, 3]).takeWhile(n => true);
      expect(collectSync(seq)).to.deep.equal([1, 2, 3]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const seq = Seq.from([1, 2, 0, 4, 5]).takeWhile();
      expect(collectSync(seq)).to.deep.equal([1, 2]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).takeWhile('foo')).to.throw();
    });
  });


  describe('#filter', function () {
    it('should only yield elements for which passed function returns true', () => {
      const seq = Seq.from([1, 2, 3, 4, 5, 6, 7]).filter(n => n % 3 == 1);
      expect(collectSync(seq)).to.deep.equal([1, 4, 7]);
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const seq = Seq.from([1, 0, 3, null, 5, false, 7, '']).filter();
      expect(collectSync(seq)).to.deep.equal([1, 3, 5, 7]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).filter('foo')).to.throw();
    });
  });


  describe('#map', function () {
    it('should yield elements correctly transformed', () => {
      const seq = Seq.from([1, 2, 3]).map(n => n * n);
      expect(collectSync(seq)).to.deep.equal([1, 4, 9]);
    });

    it('should correctly use implicit identity function if function is not passed', () => {
      const seq = Seq.from([1, 2, 3]).map();
      expect(collectSync(seq)).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).map('foo')).to.throw();
    });
  });


  describe('#flatMap', function () {
    it('should yield all elements from tranformed results', () => {
      const seq = Seq.from([1, 2, 3]).flatMap(n => Seq.range(n));
      expect(collectSync(seq)).to.deep.equal([0, 0, 1, 0, 1, 2]);
    });

    it('should correctly use implicit identity function if function is not passed', () => {
      const seq = Seq.from([Seq.range(1), Seq.range(2), Seq.range(3)]).flatMap();
      expect(collectSync(seq)).to.deep.equal([0, 0, 1, 0, 1, 2]);
    });

    it('should throw if passed function result is not iterable', () => {
      const seq = Seq.from([0]).flatMap();
      expect(() => collectSync(seq)).to.throw();
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).flatMap('foo')).to.throw();
    });
  });


  describe('#toArray', function () {
    it('should return all elements as an array', () => {
      const seq = Seq.range(3);
      expect(seq.toArray()).to.deep.equal([0, 1, 2]);
    });

    it('should return empty array if no elements', () => {
      const seq = Seq.range(0);
      expect(seq.toArray()).to.deep.equal([]);
    });
  });


  describe('#find', function () {
    it('should correctly return first element for which passed function is true', () => {
      const seq = Seq.range(15);
      expect(seq.find(n => n % 6 == 5)).to.equal(5);
    });

    it('should correctly return undefined if passed function never returns true', () => {
      const seq = Seq.range(15);
      expect(seq.find(n => false)).to.not.exist;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const seq = Seq.from([0, null, '', false, 42]);
      expect(seq.find()).to.equal(42);
    });

    it('should work for infinite sequences for which the passed function returns true', () => {
      const seq = Seq.iterate(n => (n || 0) + 1);
      expect(seq.find(n => n % 15 == 0)).to.equal(15);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).find('foo')).to.throw();
    });
  });


  describe('#includes', function () {
    it('should correctly return true if element is included', () => {
      const seq = Seq.range(15);
      expect(seq.includes(7)).to.be.ok;
    });

    it('should correctly return true if 0 is included and asked for -0', () => {
      const seq = Seq.range(1);
      expect(seq.includes(-0)).to.be.ok;
    });

    it('should correctly return false if element is not included', () => {
      const seq = Seq.range(15);
      expect(seq.includes(17)).to.not.be.ok;
    });

    it('should work for infinite sequences that contain the element', () => {
      const seq = Seq.iterate(n => (n || 0) + 1);
      expect(seq.includes(42)).to.be.ok;
    });
  });


  describe('#some', function () {
    it('should correctly return true if passed function returns true at any point', () => {
      const seq = Seq.range(42);
      expect(seq.some(n => n == 13)).to.be.ok;
    });

    it('should correctly return false if passed function always return false', () => {
      const seq = Seq.range(42);
      expect(seq.some(n => false)).to.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const seq = Seq.from([0, null, '']);
      expect(seq.some()).to.not.be.ok;
    });

    it('should work for infinite sequences for which the passed function returns true', () => {
      const seq = Seq.iterate(n => (n || 0) + 1);
      expect(seq.some(n => n == 42)).to.be.ok;
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).some('foo')).to.throw();
    });
  });


  describe('#every', function () {
    it('should correctly return true if passed function always returns true', () => {
      const seq = Seq.range(42);
      expect(seq.every(n => true)).to.be.ok;
    });

    it('should correctly return false if passed function return false at any point', () => {
      const seq = Seq.range(42);
      expect(seq.every(n => n != 13)).to.not.be.ok;
    });

    it('should correctly use implicit boolean conversion if function is not passed', () => {
      const seq = Seq.from([1, true, 'foo']);
      expect(seq.every()).to.be.ok;
    });

    it('should work for infinite sequences for which the passed function returns false', () => {
      const seq = Seq.iterate(n => (n || 0) + 1);
      expect(seq.every(n => n != 42)).to.not.be.ok;
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).every('foo')).to.throw();
    });
  });


  describe('#reduce', function () {
    it('should correctly accumulate the result of the given function', () => {
      const seq = Seq.from([1, 2, 3, 4]);
      expect(seq.reduce((a, b) => a + b)).to.equal(10);
    });

    it('should use the given init value as starting accumulator', () => {
      const seq = Seq.from([1, 2, 3, 4]);
      expect(seq.reduce((a, _) => a, 'i')).to.equal('i');
    });

    it('should use the first element as accumulator if no init value given', () => {
      const seq = Seq.from([1, 2, 3, 4]);
      expect(seq.reduce((a, _) => a)).to.equal(1);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).reduce('foo')).to.throw();
    });
  });


  describe('#forEach', function () {
    it('should call the passed function once per element', () => {
      const called = [];
      Seq.from([1, 2, 3]).forEach(n => called.push(n));

      expect(called).to.deep.equal([1, 2, 3]);
    });

    it('should throw if passed argument is not a function', () => {
      expect(() => Seq.from([]).forEach('foo')).to.throw();
    });
  });


  describe('#join', function () {
    it('should correctly join the elements using the given glue', () => {
      const seq = Seq.from([1, 2, null, 3]);
      expect(seq.join('|')).to.equal('1|2||3');
    });

    it('should correctly join the elements using a comma if no glue given', () => {
      const seq = Seq.from([1, 2, null, 3]);
      expect(seq.join()).to.equal('1,2,,3');
    });
  });
});
