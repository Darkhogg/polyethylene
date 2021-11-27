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

    it('should not retrieve elements without iterating', async () => {
      let calledTimes = 0
      Poly.syncFrom(VALUES).async().tap(() => {
        calledTimes += 1
      }).prefetch()

      await delay(10)
      expect(calledTimes).to.equal(0)
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
  })

  describe('#preload', () => {
    const VALUES = Object.freeze([0, 1, 1, 2, 3, 5, 8, 13, 21, 34])

    it('should yield the same elements', async () => {
      const iter = Poly.syncFrom(VALUES).async().preload()

      await expect(collectAsync(iter)).to.eventually.deep.equal(VALUES)
    })

    it('should retrieve the first element without iterating', async () => {
      let calledFirst = false
      Poly.syncFrom(VALUES).async().tap(() => {
        calledFirst = true
      }).preload()

      await delay(10)
      expect(calledFirst).to.be.true
    })

    it('should not retrieve more than the first element without iterating', async () => {
      let calledTimes = 0
      Poly.syncFrom(VALUES).async().tap(() => {
        calledTimes += 1
      }).preload()

      await delay(10)
      expect(calledTimes).to.equal(1)
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

    it('should correctly drop nothing if not passed anything', async () => {
      const iter = Poly.syncFrom([1, 2]).async().drop()
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2])
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

    it('should correctly drop nothing if not passed anything', async () => {
      const iter = Poly.syncFrom([1, 2]).async().dropLast()
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

    it('should correctly take nothing if not passed anything', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().take()
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
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

    it('should correctly take nothing if not passed anything', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().takeLast()
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
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
    async function testSlice (start : number, end : number) {
      for (const n of [5, 7, 9, 12, 15, 20]) {
        const array = Array(n).fill(null).map((_, i) => i)

        const slicedArray = array.slice(start, end)
        const iter = Poly.syncFrom(array).async().slice(start, end)
        await expect(collectAsync(iter)).to.eventually.deep.equal(slicedArray)
      }
    }

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
      expect(() => Poly.syncFrom([]).slice(0, null as any)).to.throw()
      expect(() => Poly.syncFrom([]).slice(0, undefined as any)).to.throw()
    })
  })


  describe('#filter', () => {
    it('should only yield elements for which passed function returns true', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5, 6, 7]).async().filter((n : number) => n % 3 === 1)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 7])
    })

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.syncFrom([]).async().filter('foo' as any)).to.throw()
    })
  })


  describe('#map', () => {
    it('should yield elements correctly mapped', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().map((n) => n * n)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 4, 9])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).async().map('foo' as any)).to.throw()
    })
  })


  describe('#tap', () => {
    it('should yield elements of original iteration', async () => {
      const iter = Poly.syncFrom([1, 2, 3]).async().tap(((n : number) => n) as (n : number) => void)
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
      const iter = Poly.syncFrom([1, 2, 3]).async().flatMap((n) => Array(n).fill(null).map((_, i) => (10 * n) + i))
      await expect(collectAsync(iter)).to.eventually.deep.equal([10, 20, 21, 30, 31, 32])
    })

    it('should throw if a mapped element is not iterable', async () => {
      const iter = Poly.syncFrom([0]).async().flatMap((n) => n as any)
      await expect(collectAsync(iter)).to.be.rejected
    })

    it('should throw if passed argument is not a function', async () => {
      expect(() => Poly.syncFrom([]).async().flatMap('foo' as any)).to.throw()
    })
  })


  describe('#group', () => {
    it('should yield elements correctly grouped if amount is a divisor', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5, 6]).async().group(2)
      await expect(collectAsync(iter)).to.eventually.deep.equal([[1, 2], [3, 4], [5, 6]])
    })

    it('should yield last elements correctly grouped if amount is not a divisor', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().group(2)
      await expect(collectAsync(iter)).to.eventually.deep.equal([[1, 2], [3, 4], [5]])
    })

    it('should yield nothing if original iterable was empty', async () => {
      const iter = Poly.syncFrom([]).async().group(2)
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should throw if not passed an integer', () => {
      expect(() => Poly.syncFrom([]).async().group('foo' as any)).to.throw()
    })

    it('should throw if passed zero', () => {
      expect(() => Poly.syncFrom([]).async().group(0)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.syncFrom([]).async().group(-1)).to.throw()
    })
  })


  describe('#groupWhile', () => {
    it('should yield elements correctly grouped', async () => {
      const iter = Poly.range(0, 10).async().groupWhile((elem) => elem % 4 !== 0 && elem % 5 !== 0)
      await expect(collectAsync(iter)).to.eventually.deep.equal([[0, 1, 2, 3], [4], [5, 6, 7], [8, 9]])
    })

    it('should yield nothing if original iterable was empty', async () => {
      const iter = Poly.syncFrom([]).async().groupWhile(() => true)
      await expect(collectAsync(iter)).to.eventually.deep.equal([])
    })

    it('should throw if not passed a function', async () => {
      expect(() => Poly.syncFrom([]).async().groupWhile('foo' as any)).to.throw()
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
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().unique((x) => x * 3)
      await expect(collectAsync(iter)).to.eventually.deep.equal([1, 2, 3, 4, 5])
    })

    it('should work when passed a function that is sometimes the same', async () => {
      const iter = Poly.syncFrom([0, 1, 2, 3, 4, 5]).async().unique((x) => Math.floor(x / 2))
      await expect(collectAsync(iter)).to.eventually.deep.equal([0, 2, 4])
    })

    it('should work when passed a function that is always the same', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).async().unique((x) => 0)
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

    async function checkSort<T> (arr : Array<T>, func?: (a : T, b : T) => number) {
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
      await expect(iter.some((n) => n === 13)).to.eventually.be.ok
    })

    it('should correctly return false if passed function always return false', async () => {
      const iter = Poly.range(42).async()
      await expect(iter.some((n) => false)).to.eventually.not.be.ok
    })

    it('should work for infinite iterables for which the passed function returns true', async () => {
      const iter = Poly.asyncIterate((n) => n + 1, 0)
      await expect(iter.some((n) => n === 42)).to.eventually.be.ok
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([]).async().some('foo' as any)).to.be.rejected
    })
  })


  describe('#every', () => {
    it('should correctly return true if passed function always returns true', async () => {
      const iter = Poly.range(42).async()
      await expect(iter.every((n) => true)).to.eventually.be.ok
    })

    it('should correctly return false if passed function return false at any point', async () => {
      const iter = Poly.range(42).async()
      await expect(iter.every((n) => n !== 13)).to.eventually.not.be.ok
    })

    it('should work for infinite iterables for which the passed function returns false', async () => {
      const iter = Poly.asyncIterate((n) => n + 1, 0)
      await expect(iter.every((n) => n !== 42)).to.eventually.not.be.ok
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([]).async().every('foo' as any)).to.be.rejected
    })
  })


  describe('#reduce', () => {
    it('should correctly accumulate the result of the given function', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4]).async()
      await expect(iter.reduce((a, b) => a + b, 0)).to.eventually.equal(10)
    })

    it('should use the given init value as starting accumulator', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4]).async()
      await expect(iter.reduce((a, _) => a, 'i')).to.eventually.equal('i')
    })

    it('should use the first element as accumulator if no init value given', async () => {
      const iter = Poly.syncFrom([1, 2, 3, 4]).async()
      await expect(iter.reduce((a, _) => a, undefined)).to.eventually.equal(1)
    })

    it('should throw if passed argument is not a function', async () => {
      await expect(Poly.syncFrom([] as Array<unknown>).async().reduce('foo' as any, undefined)).to.be.rejected
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


  describe('#drain', () => {
    it('should drain the iterable', async () => {
      let called = false
      const iter = Poly.asyncFrom(async function * () {
        yield * Array(10).fill(0)
        called = true
      })

      await iter.drain()
      expect(called, 'iterable drained').to.be.ok
    })
  })
})
