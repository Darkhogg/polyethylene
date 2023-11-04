/* eslint-disable no-unused-expressions */
import Poly from '../lib/main.js'

import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import {collectAsync} from './_utils.js'


chai.use(chaiAsPromised)

function delay (ms: number): Promise<void> {
  return new Promise((acc) => setTimeout(acc, ms))
}


describe('Async Iterable', () => {
  describe('#prefetch', () => {
    const VALUES = Object.freeze([0, 1, 1, 2, 3, 5, 8, 13, 21, 34])

    it('should yield the same elements', async () => {
      const iter = Poly.syncFrom(VALUES).async().prefetch()

      await expect(collectAsync(iter)).to.eventually.deep.equal(VALUES)
    })

    it('should retrieve (only) a second item if iterated only once', async () => {
      let calledTimes = 0
      const iter = Poly.syncFrom(VALUES).async().tap(() => {
        calledTimes += 1
      }).prefetch()

      const it = iter[Symbol.asyncIterator]()
      await it.next()
      await delay(10)

      expect(calledTimes).to.equal(2)
    })

    it('should retrieve the first element without iterating', async () => {
      let calledFirst = false
      Poly.syncFrom(VALUES).async().tap(() => {
        calledFirst = true
      }).prefetch()

      await delay(10)
      expect(calledFirst).to.be.true
    })

    it('should not retrieve more than the first element without iterating', async () => {
      let calledTimes = 0
      Poly.syncFrom(VALUES).async().tap(() => {
        calledTimes += 1
      }).prefetch()

      await delay(10)
      expect(calledTimes).to.be.lessThanOrEqual(1)
    })
  })


  const APPEND_METHODS = ['append', 'concat'] as const
  APPEND_METHODS.forEach((method) => {
    describe(`#${method}`, () => {
      it('should yield elements in appropriate order', async () => {
        async function * appendIter () {
          yield 4
          yield 5
          yield 6
        }
        const iter = Poly.syncFrom([1, 2, 3]).async()[method](appendIter())
        await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5, 6])
      })

      it('should work for arrays', async () => {
        const iter = Poly.syncFrom([1, 2, 3]).async()[method]([4, 5, 6])
        await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5, 6])
      })

      it('should work for other AsyncIterables', async () => {
        const iter = Poly.syncFrom([1, 2, 3]).async()[method](Poly.range(4, 7).async())
        await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5, 6])
      })

      it('should work for empty iterations', async () => {
        const iter = Poly.syncFrom([1, 2, 3]).async()[method]([])
        await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3])
      })

      it('should work when chained multiple times', async () => {
        const iter = Poly.syncFrom([1, 2]).async()[method]([3])[method]([])[method]([4, 5])
        await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5])
      })

      it('should throw if not passed an iterable', () => {
        expect(() => Poly.syncFrom([]).async()[method](1 as any)).to.throw()
      })
    })
  })


  describe('#prepend', () => {
    it('should yield elements in appropriate order', async () => {
      async function * prependIter () {
        yield 4
        yield 5
        yield 6
      }
      const iter = Poly.syncFrom([1, 2, 3]).async().prepend(prependIter())
      await expect(collectAsync(iter)).to.eventually.deep.equal([4, 5, 6, 1, 2, 3])
    })

    it('should work for arrays', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().prepend([4, 5, 6])
      await expect(collectAsync(iter)).to.eventually.deep.equal([4, 5, 6, 1, 2, 3])
    })

    it('should work for other AsyncIterables', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().prepend(Poly.range(4, 7).async())
      await expect(collectAsync(iter)).to.eventually.deep.equal([4, 5, 6, 1, 2, 3])
    })

    it('should work for empty iterations', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().prepend([])
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3])
    })

    it('should work when chained multiple times', async () => {
      const iter = Poly.syncFrom([1, 2]).async().prepend([3]).prepend([]).prepend([4, 5])
      await expect(collectAsync(iter)).to.eventually.deep.equal([4, 5, 3, 1, 2])
    })

    it('should throw if not passed an iterable', () => {
      expect(() => Poly.syncFrom([]).async().prepend(1 as any)).to.throw()
    })
  })


  describe('#drop', () => {
    it('should correctly drop the first few elements', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().drop(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([4, 5])
    })

    it('should correctly drop everything if not enough elements', async () => {
      const iter = Poly.syncFrom([1, 2]).async().drop(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should throw if not passed an integer', async () => {
      expect(() => Poly.syncFrom([]).async().drop('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', async () => {
      expect(() => Poly.syncFrom([]).async().drop(-1)).to.throw()
    })
  })


  describe('#dropLast', () => {
    it('should correctly drop the last few elements', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().dropLast(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2])
    })

    it('should correctly drop everything if not enough elements', async () => {
      const iter = Poly.syncFrom([1, 2]).async().dropLast(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should throw if not passed an integer', async () => {
      expect(() => Poly.syncFrom([]).async().dropLast('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', async () => {
      expect(() => Poly.syncFrom([]).async().dropLast(-1)).to.throw()
    })
  })


  describe('#take', () => {
    it('should correctly take the first few elements', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().take(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3])
    })

    it('should correctly take everything if not enough elements', async () => {
      const iter = Poly.syncFrom([1, 2]).async().take(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2])
    })

    it('should throw if not passed an integer', async () => {
      expect(() => Poly.syncFrom([]).async().take('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', async () => {
      expect(() => Poly.syncFrom([]).async().take(-1)).to.throw()
    })
  })


  describe('#takeLast', () => {
    it('should correctly take the last few elements', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().takeLast(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([3, 4, 5])
    })

    it('should correctly take everything if not enough elements', async () => {
      const iter = Poly.syncFrom([1, 2]).async().takeLast(3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2])
    })

    it('should throw if not passed an integer', async () => {
      expect(() => Poly.syncFrom([]).async().takeLast('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', async () => {
      expect(() => Poly.syncFrom([]).async().takeLast(-1)).to.throw()
    })
  })


  describe('#dropWhile', () => {
    it('should correctly drop as long as the passed function returns true', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().dropWhile(async (n) => n !== 3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([3, 4, 5])
    })

    it('should correctly stop calling the passed function after the first false', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().dropWhile(async (n) => {
        if (n > 1) {
          expect.fail('called after first')
        }
        return false
      })

      await collectAsync(iter)
    })

    it('should correctly yield nothing if the passed function never returns false', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().dropWhile(async (n) => true)
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.syncFrom([]).async().dropWhile('foo' as any)).to.throw()
    })
  })


  describe('#takeWhile', () => {
    it('should correctly take as long as the passed function returns true', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().takeWhile(async (n) => n !== 3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2])
    })

    it('should correctly stop calling the passed function after the first false', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().takeWhile(async (n) => {
        if (n > 1) {
          expect.fail('called after first')
        }
        return false
      })

      await collectAsync(iter)
    })

    it('should correctly yield everything if the passed function never returns false', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().takeWhile(async (n) => true)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3])
    })

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.syncFrom([]).async().takeWhile('foo' as any)).to.throw()
    })
  })


  describe('#slice', () => {
    async function testSlice (start: number, end?: number) {
      for (const n of [5, 7, 9, 12, 15, 20]) {
        const array = Array(n).fill(null).map((_, i) => i)

        const slicedArray = array.slice(start, end)
        const iter = Poly.syncFrom(array).async().slice(start, end)
        await expect(collectAsync(iter)).to.eventually.deep.equal(slicedArray)
      }
    }

    it('should work correctly when start >= 0 and end == undefined', () => {
      testSlice(0)
      testSlice(1)
      testSlice(3)
      testSlice(5)
    })

    it('should work correctly when start < 0 and end == undefined', () => {
      testSlice(-1)
      testSlice(-3)
      testSlice(-5)
      testSlice(-10)
    })

    it('should work correctly when start > 0 and end > 0', async () => {
      await testSlice(0, 1)
      await testSlice(1, 4)
      await testSlice(3, 10)
      await testSlice(5, 1)
    })

    it('should work correctly when start < 0 and end > 0', async () => {
      await testSlice(-1, 0)
      await testSlice(-10, 10)
      await testSlice(-5, 5)
      await testSlice(-8, 1)
      await testSlice(-6, 100)
    })

    it('should work correctly when start > 0 and end < 0', async () => {
      await testSlice(0, -1)
      await testSlice(0, -50)
      await testSlice(10, -5)
      await testSlice(3, -2)
      await testSlice(1, -5)
    })

    it('should work correctly when start < 0 and end < 0', async () => {
      await testSlice(-1, -1)
      await testSlice(-5, -1)
      await testSlice(-10, -5)
      await testSlice(-5, -10)
      await testSlice(-100, -1)
    })

    it('should throw if first argument is not an integer', () => {
      expect(() => Poly.syncFrom([]).slice(0.5, 0)).to.throw()
      expect(() => Poly.syncFrom([]).slice('foo' as any, 0)).to.throw()
      expect(() => Poly.syncFrom([]).slice(null as any, 0)).to.throw()
      expect(() => Poly.syncFrom([]).slice(undefined as any, 0)).to.throw()
    })

    it('should throw if second argument is not an integer', () => {
      expect(() => Poly.syncFrom([]).slice(0, 0.5)).to.throw()
      expect(() => Poly.syncFrom([]).slice(0, 'bar' as any)).to.throw()
    })
  })


  describe('#filter', () => {
    it('should only yield elements for which passed function returns true', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5, 6, 7]).async().filter(async (n: number) => n % 3 === 1)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 7])
    })

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.syncFrom([]).async().filter('foo' as any)).to.throw()
    })
  })


  describe('#filterNotNullish', () => {
    it('should only yield elements that aren\'t null or undefined', () => {
      const iter = Poly.syncFrom([0, 1, null, 2, undefined, 3]).async().filterNotNullish()
      expect(collectAsync(iter)).to.eventually.deep.equal([0, 1, 2, 3])
    })
  })


  describe('#map', () => {
    it('should yield elements correctly mapped', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().map(async (n) => n * n)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 9])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.asyncFrom([]).map('foo' as any)).to.throw()
    })
  })


  describe('#mapKeys', () => {
    it('should yield key-value pairs with correctly mapped key', () => {
      const iter = Poly.entries({a: 1, b: 2, c: 3}).async().mapKeys(([k, n]) => k.toUpperCase())
      expect(collectAsync(iter)).to.eventually.deep.equal([['A', 1], ['B', 2], ['C', 3]])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.asyncFrom([]).mapKeys('foo' as any)).to.throw()
    })
  })


  describe('#mapValues', () => {
    it('should yield key-value pairs with correctly mapped value', () => {
      const iter = Poly.entries({a: 1, b: 2, c: 3}).async().mapValues(([k, n]) => n * n)
      expect(collectAsync(iter)).to.eventually.deep.equal([['a', 1], ['b', 4], ['c', 9]])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.asyncFrom([]).mapValues('foo' as any)).to.throw()
    })
  })


  describe('#tap', () => {
    it('should yield elements of original iteration', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().tap(async (n) => {}) // eslint-disable-line no-void
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).async().tap('foo' as any)).to.throw()
    })
  })


  const FLAT_METHODS = ['flatten', 'flat'] as const
  FLAT_METHODS.forEach((name) => {
    describe(`#${name}`, () => {
      it('should correctly yield elements from iterable elements', async () => {
        const iter = Poly.syncFrom([
          Poly.range(1).async(),
          Poly.range(2).async(),
          Poly.range(3).async(),
        ]).async()[name]()
        await expect(collectAsync(iter)).to.eventually.deep.equal([0, 0, 1, 0, 1, 2])
      })

      it('should be rejected if an element is not iterable', async () => {
        const iter = (Poly.syncFrom([0]).async() as any)[name]()
        await expect(collectAsync(iter)).to.be.rejected
      })

      it('should throw if passed argument is not a function', async () => {
        expect(() => Poly.syncFrom([]).async().flatMap('foo' as any)).to.throw()
      })
    })
  })


  describe('#flatMap', () => {
    it('should yield elements correctly mapped', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async()
        .flatMap(async (n) => Array(n).fill(null).map((_, i) => (10 * n) + i))
      await expect(collectAsync(iter)).to.eventually.deep.equal([10, 20, 21, 30, 31, 32])
    })

    it('should throw if a mapped element is not iterable', async () => {
      const iter = Poly.syncFrom([0]).async().flatMap(async (n) => n as any)
      await expect(collectAsync(iter)).to.be.rejected
    })

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.syncFrom([]).async().flatMap('foo' as any)).to.throw()
    })
  })


  describe('#chunk', () => {
    it('should yield elements correctly chunked if amount is a divisor', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5, 6]).async().chunk(2)
      await expect(collectAsync(iter)).to.eventually.deep.equal([[1, 2], [3, 4], [5, 6]])
    })

    it('should yield last elements correctly chunked if amount is not a divisor', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().chunk(2)
      await expect(collectAsync(iter)).to.eventually.deep.equal([[1, 2], [3, 4], [5]])
    })

    it('should yield nothing if original iterable was empty', async () => {
      const iter = Poly.syncFrom([]).async().chunk(2)
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should throw if not passed an integer', () => {
      expect(() => Poly.syncFrom([]).async().chunk('foo' as any)).to.throw()
    })

    it('should throw if passed zero', () => {
      expect(() => Poly.syncFrom([]).async().chunk(0)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.syncFrom([]).async().chunk(-1)).to.throw()
    })
  })


  describe('#chunkWhile', () => {
    it('should yield elements correctly chunked', async () => {
      const iter = Poly.range(0, 10).async().chunkWhile(async (elem) => elem % 4 !== 0 && elem % 5 !== 0)
      await expect(collectAsync(iter)).to.eventually.deep.equal([[0, 1, 2, 3], [4], [5, 6, 7], [8, 9]])
    })

    it('should yield nothing if original iterable was empty', async () => {
      const iter = Poly.syncFrom([]).async().chunkWhile(async () => true)
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should throw if not passed a function', async () => {
      expect(() => Poly.syncFrom([]).async().chunkWhile('foo' as any)).to.throw()
    })
  })


  describe('#groupBy', () => {
    it('should work for empty iterations', async () => {
      const iter = Poly.asyncFrom([]).groupBy(() => 0)
      expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should yield correctly grouped elements', async () => {
      const elems = ['one', 'two', 'three', 'four', 'five']
      const groups = [[3, ['one', 'two']], [5, ['three']], [4, ['four', 'five']]]
      const iter = Poly.asyncFrom(elems).groupBy(async (str) => str.length)
      await expect(collectAsync(iter)).to.eventually.deep.equal(groups)
    })

    it('should throw if not passed a function', async () => {
      expect(() => Poly.asyncFrom([]).groupBy('foo' as any)).to.throw()
    })
  })


  describe('#unique', () => {
    it('should work for empty iterations', async () => {
      const iter = Poly.syncFrom([]).async().unique()
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should work for all different elements', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().unique()
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5])
    })

    it('should work for some same elements', async () => {
      const iter = Poly.syncFrom([1, 1, 2, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 4, 5]).async().unique()
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5])
    })

    it('should work when passed a function that is always different', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().unique(async (x) => x * 3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5])
    })

    it('should work when passed a function that is sometimes the same', async () => {
      const iter = Poly.syncFrom([0, 1, 2, 3, 4, 5]).async().unique(async (x) => Math.floor(x / 2))
      await expect(collectAsync(iter)).to.eventually.deep.equal([0, 2, 4])
    })

    it('should work when passed a function that is always the same', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().unique(async (x) => 0)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1])
    })

    it('should throw if not passed a function', () => {
      expect(() => Poly.syncFrom([]).async().unique('foo' as any)).to.throw()
    })
  })


  describe('#reverse', () => {
    it('should work for empty iterations', async () => {
      const iter = Poly.syncFrom([]).async().reverse()
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should work for small iterations', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().reverse()
      await expect(collectAsync(iter)).to.eventually.deep.equal([3, 2, 1])
    })

    it('should work for long iterations', async () => {
      const iter = Poly.range(1000).async().reverse()
      await expect(collectAsync(iter)).to.eventually.deep.equal(Poly.range(999, -1, -1).toArray())
    })
  })


  describe('#sort', () => {
    const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    function randStr (n = 16) {
      return Array(n).fill(null).map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
    }

    async function checkSort<T> (arr: Array<T>, func?: (a: T, b: T) => number) {
      const iter = Poly.syncFrom(arr).async().sort(func)
      await expect(collectAsync(iter)).to.eventually.deep.equal(arr.slice().sort(func))
    }

    it('should work for empty iterations', async () => {
      await checkSort([])
    })

    it('should work for small iterations', async () => {
      await checkSort(Array(10).fill(null).map(() => randStr))
    })

    it('should work for long iterations', async () => {
      await checkSort(Array(1000).fill(null).map(() => randStr))
    })

    it('should work when given a comparator function', async () => {
      await checkSort([5, 2, 8, 4], (a, b) => a < b ? +1 : (a > b) ? -1 : 0)
    })

    it('should throw if not passed a function', () => {
      expect(() => Poly.syncFrom([]).async().sort('foo' as any)).to.throw()
    })
  })


  describe('#toArray', () => {
    it('should return all elements as an array', async () => {
      const iter = Poly.range(3).async()
      await expect(iter.toArray()).to.eventually.deep.equal([0, 1, 2])
    })

    it('should return empty array if no elements', async () => {
      const iter = Poly.range(0).async()
      await expect(iter.toArray()).to.eventually.deep.equal([])
    })
  })


  describe('#toPartitionArrays', () => {
    it('should return empty arrays for an ampty iteration', async () => {
      const iter = Poly.empty().async()
      const [trues, falses] = await iter.toPartitionArrays((x) => !!x)

      expect(trues).to.deep.equal([])
      expect(falses).to.deep.equal([])
    })

    it('should return empty "trues" array if function always returns false', async () => {
      const iter = Poly.range(5).async()
      const [trues, falses] = await iter.toPartitionArrays(() => true)

      expect(trues).to.not.deep.equal([])
      expect(falses).to.deep.equal([])
    })

    it('should return empty "falses" array if function always returns true', async () => {
      const iter = Poly.range(5).async()
      const [trues, falses] = await iter.toPartitionArrays(() => false)

      expect(trues).to.deep.equal([])
      expect(falses).to.not.deep.equal([])
    })

    it('should correctly partition into "trues" and "falses"', async () => {
      const iter = Poly.range(10).async()
      const [trues, falses] = await iter.toPartitionArrays((n) => (n % 3 === 0) || (n % 5 === 0))

      expect(trues).to.deep.equal([0, 3, 5, 6, 9])
      expect(falses).to.deep.equal([1, 2, 4, 7, 8])
    })
  })


  describe('#toObject', () => {
    const asciiA = 'a'.charCodeAt(0)

    it('should return all elements as an object', async () => {
      const iter = Poly.range(3).map((n) => [String.fromCharCode(asciiA + n), n] as const).async()
      await expect(iter.toObject()).to.eventually.deep.equal({a: 0, b: 1, c: 2})
    })

    it('should return empty object if no elements', async () => {
      const iter = Poly.syncFrom([]).async()
      await expect(iter.toObject()).to.eventually.deep.equal({})
    })
  })


  describe('#toMap', () => {
    const asciiA = 'a'.charCodeAt(0)

    it('should return all elements a an Map', async () => {
      const iter = Poly.range(3).map((n) => [String.fromCharCode(asciiA + n), n] as const).async()
      await expect(iter.toMap().then((map) => Object.fromEntries(map.entries())))
        .to.eventually.deep.equal({a: 0, b: 1, c: 2})
    })

    it('should return empty Map if no elements', async () => {
      const iter = Poly.syncFrom([]).async()
      await expect(iter.toMap().then((map) => Object.fromEntries(map.entries())))
        .to.eventually.deep.equal({})
    })
  })


  describe('#find', () => {
    it('should correctly return first element for which passed function is true', async () => {
      const iter = Poly.range(15).async()
      await expect(iter.find(async (n) => n % 6 === 5)).to.eventually.equal(5)
    })

    it('should correctly return undefined if passed function never returns true', async () => {
      const iter = Poly.range(15).async()
      await expect(iter.find(async (n) => false)).to.eventually.not.exist
    })

    it('should work for infinite iterables for which the passed function returns true', async () => {
      const iter = Poly.asyncIterate((n) => n + 1, 0)
      await expect(iter.find(async (n) => n % 15 === 0)).to.eventually.equal(15)
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([]).async().find('foo' as any)).to.be.rejected
    })
  })


  describe('#findLast', () => {
    it('should correctly return last element for which passed function is true', async () => {
      const iter = Poly.range(15).async()
      await expect(iter.findLast(async (n) => n % 6 === 5)).to.eventually.equal(11)
    })

    it('should correctly return undefined if passed function never returns true', async () => {
      const iter = Poly.range(15).async()
      await expect(iter.findLast(async (n) => false)).to.eventually.not.exist
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([]).async().findLast('foo' as any)).to.be.rejected
    })
  })


  describe('#findIndex', () => {
    const numbers = [1, 4, 2, 3, 8, 7, 1, 5, 0, 11, 6] as const

    it('should correctly return the index of the first element for which passed function is true', () => {
      const iter = Poly.from(numbers).async()
      expect(iter.findIndex(async (n) => n % 6 === 5)).to.eventually.equal(7)
    })

    it('should correctly return -1 if passed function never returns true', () => {
      const iter = Poly.from(numbers).async()
      expect(iter.findIndex(async (n) => false)).to.eventually.equal(-1)
    })

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.syncIterate((n) => n + 1, 0).map((n) => n ** 2).async()
      expect(iter.findIndex(async (n) => n > 100)).to.eventually.equal(10)
    })

    it('should throw if passed argument is not a function', () => {
      expect(Poly.syncFrom([]).async().findIndex('foo' as any)).to.be.rejected
    })
  })


  describe('#findLastIndex', () => {
    const numbers = [1, 4, 2, 3, 8, 7, 1, 5, 0, 11, 6] as const

    it('should correctly return the index of the last element for which passed function is true', () => {
      const iter = Poly.from(numbers).async()
      expect(iter.findLastIndex(async (n) => n % 6 === 5)).to.eventually.equal(9)
    })

    it('should correctly return -1 if passed function never returns true', () => {
      const iter = Poly.from(numbers).async()
      expect(iter.findLastIndex(async (n) => false)).to.eventually.equal(-1)
    })

    it('should throw if passed argument is not a function', () => {
      expect(Poly.syncFrom([]).async().findLastIndex('foo' as any)).to.be.rejected
    })
  })


  describe('#includes', () => {
    it('should correctly return true if element is included', async () => {
      const iter = Poly.range(15).async()
      await expect(iter.includes(7)).to.eventually.be.ok
    })

    it('should correctly return true if 0 is included and asked for -0', async () => {
      const iter = Poly.range(1).async()
      await expect(iter.includes(-0)).to.eventually.be.ok
    })

    it('should correctly return false if element is not included', async () => {
      const iter = Poly.range(15).async()
      await expect(iter.includes(17)).to.eventually.not.be.ok
    })

    it('should work for infinite iterables that contain the element', async () => {
      const iter = Poly.asyncIterate((n) => n + 1, 0)
      await expect(iter.includes(42)).to.eventually.be.ok
    })
  })


  describe('#some', () => {
    it('should correctly return true if passed function returns true at any point', async () => {
      const iter = Poly.range(42).async()
      await expect(iter.some(async (n) => n === 13)).to.eventually.be.ok
    })

    it('should correctly return false if passed function always return false', async () => {
      const iter = Poly.range(42).async()
      await expect(iter.some(async (n) => false)).to.eventually.not.be.ok
    })

    it('should work for infinite iterables for which the passed function returns true', async () => {
      const iter = Poly.asyncIterate((n) => n + 1, 0)
      await expect(iter.some(async (n) => n === 42)).to.eventually.be.ok
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([]).async().some('foo' as any)).to.be.rejected
    })
  })


  describe('#every', () => {
    it('should correctly return true if passed function always returns true', async () => {
      const iter = Poly.range(42).async()
      await expect(iter.every(async (n) => true)).to.eventually.be.ok
    })

    it('should correctly return false if passed function return false at any point', async () => {
      const iter = Poly.range(42).async()
      await expect(iter.every(async (n) => n !== 13)).to.eventually.not.be.ok
    })

    it('should work for infinite iterables for which the passed function returns false', async () => {
      const iter = Poly.asyncIterate((n) => n + 1, 0)
      await expect(iter.every(async (n) => n !== 42)).to.eventually.not.be.ok
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([]).async().every('foo' as any)).to.be.rejected
    })
  })


  describe('#reduce', () => {
    it('should correctly accumulate the result of the given function', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4]).async()
      await expect(iter.reduce(async (a, b) => a + b, 0)).to.eventually.equal(10)
    })

    it('should use the given init value as starting accumulator', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4]).async()
      await expect(iter.reduce(async (a, _) => a, 'i')).to.eventually.equal('i')
    })

    it('should use the first element as accumulator if no init value given', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4]).async()
      await expect(iter.reduce(async (a, _) => a, undefined)).to.eventually.equal(1)
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([] as Array<unknown>).async().reduce('foo' as any, undefined)).to.be.rejected
    })
  })


  describe('#count', () => {
    it('should correctly count the length of an iterable', async () => {
      const iter = Poly.range(13).async()
      await expect(iter.count()).to.eventually.equal(13)
    })
  })


  describe('#forEach', () => {
    it('should call the passed function once per element', async () => {
      const called: Array<number> = []
      await Poly.syncFrom([1, 2, 3]).async().forEach((n) => {
        called.push(n)
      })

      expect(called).to.deep.equal([1, 2, 3])
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([]).async().forEach('foo' as any)).to.be.rejected
    })
  })


  describe('#join', () => {
    it('should correctly join the elements using the given glue', async () => {
      const iter = Poly.syncFrom([1, 2, null, 3]).async()
      await expect(iter.join('|')).to.eventually.equal('1|2||3')
    })

    it('should correctly join the elements using a comma if no glue given', async () => {
      const iter = Poly.syncFrom([1, 2, null, 3]).async()
      await expect(iter.join()).to.eventually.equal('1,2,,3')
    })
  })


  describe('#complete', () => {
    it('should complete the iterable', async () => {
      let called = false
      const iter = Poly.asyncFrom(async function * () {
        yield * Array(10).fill(0)
        called = true
      })

      await iter.complete()
      expect(called, 'iterable completeed').to.be.ok
    })
  })


  describe('#duplicate', () => {
    /* we use a generator function so that elements are really only generated once */
    const TIMES = 3
    const VALUES = [1, 2, 3]
    const EXPANDED = VALUES.flatMap((val) => Array(TIMES).fill(val))
    async function * iter (): AsyncIterable<(typeof VALUES)[number]> {
      yield * VALUES
    }

    it('should return a correctly sized tuple', () => {
      const dupes = Poly.asyncFrom([]).duplicate(3)
      expect(dupes).to.have.length(3)
    })


    it('should work if dupes are consumed sequentially', async () => {
      const dupes = Poly.asyncFrom(iter).duplicate(TIMES)

      for (const dupe of dupes) {
        await expect(collectAsync(dupe)).to.eventually.deep.equal(VALUES)
      }
    })

    it('should work if dupes are consumed one element at a time', async () => {
      const its = Poly.asyncFrom(iter).duplicate(TIMES).map((iter) => iter[Symbol.asyncIterator]())
      const result: typeof VALUES = []

      let cont = true
      while (cont) {
        cont = false

        for (const it of its) {
          const item = await it.next()
          if (!item.done) {
            cont = true
            result.push(item.value)
          }
        }
      }

      expect(result).to.deep.equal(EXPANDED)
    })

    it('should throw if passed something other than a number', () => {
      expect(() => Poly.asyncFrom([]).duplicate('foo' as any)).to.throw()
    })

    it('should throw if passed a non-integer number', () => {
      expect(() => Poly.asyncFrom([]).duplicate(0.5)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.asyncFrom([]).duplicate(-1)).to.throw()
    })
  })
})
