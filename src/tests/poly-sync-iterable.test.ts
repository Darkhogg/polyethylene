/* eslint-disable no-unused-expressions */
import Poly from '../lib/main.js'

import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import {collectSync, collectAsync} from './_utils.js'

chai.use(chaiAsPromised)


describe('Sync Iterable', () => {
  describe('#async', () => {
    it('should return an async iterable', () => {
      const iter = Poly.syncFrom(function * () {}).async()

      expect(Symbol.iterator in iter).to.be.false
      expect(Symbol.asyncIterator in iter).to.be.true
    })

    it('should yield the same elements as the original', async () => {
      function * gen () {
        yield * [1, 2, 3]
      }

      const origIter = Poly.syncFrom(gen)
      const asyncIter = Poly.syncFrom(gen).async()

      expect(await collectAsync(asyncIter)).to.deep.equal(collectSync(origIter))
    })
  })


  const APPEND_METHODS = ['concat', 'append'] as const
  APPEND_METHODS.forEach((method) => {
    describe(`#${method}`, () => {
      it('should yield elements in appropriate order', () => {
        function * appendIter () {
          yield 4
          yield 5
          yield 6
        }
        const iter = Poly.syncFrom([1, 2, 3])[method](appendIter())
        expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5, 6])
      })

      it('should work for arrays', () => {
        const iter = Poly.syncFrom([1, 2, 3])[method]([4, 5, 6])
        expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5, 6])
      })

      it('should work for other SyncIterables', () => {
        const iter = Poly.syncFrom([1, 2, 3])[method](Poly.range(4, 7))
        expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5, 6])
      })

      it('should work for empty iterations', () => {
        const iter = Poly.syncFrom([1, 2, 3])[method]([])
        expect(collectSync(iter)).to.deep.equal([1, 2, 3])
      })

      it('should work when chained multiple times', () => {
        const iter = Poly.syncFrom([1, 2])[method]([3])[method]([])[method]([4, 5])
        expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5])
      })

      it('should throw if not passed an iterable', () => {
        expect(() => Poly.syncFrom([])[method](1 as any)).to.throw()
      })
    })
  })

  describe('#prepend', () => {
    it('should yield elements in appropriate order', () => {
      function * prependIter () {
        yield 4
        yield 5
        yield 6
      }
      const iter = Poly.syncFrom([1, 2, 3]).prepend(prependIter())
      expect(collectSync(iter)).to.deep.equal([4, 5, 6, 1, 2, 3])
    })

    it('should work for arrays', () => {
      const iter = Poly.syncFrom([1, 2, 3]).prepend([4, 5, 6])
      expect(collectSync(iter)).to.deep.equal([4, 5, 6, 1, 2, 3])
    })

    it('should work for other SyncIterables', () => {
      const iter = Poly.syncFrom([1, 2, 3]).prepend(Poly.range(4, 7))
      expect(collectSync(iter)).to.deep.equal([4, 5, 6, 1, 2, 3])
    })

    it('should work for empty iterations', () => {
      const iter = Poly.syncFrom([1, 2, 3]).prepend([])
      expect(collectSync(iter)).to.deep.equal([1, 2, 3])
    })

    it('should work when chained multiple times', () => {
      const iter = Poly.syncFrom([1, 2]).prepend([3]).prepend([]).prepend([4, 5])
      expect(collectSync(iter)).to.deep.equal([4, 5, 3, 1, 2])
    })

    it('should throw if not passed an iterable', () => {
      expect(() => Poly.syncFrom([]).prepend(1 as any)).to.throw()
    })
  })


  describe('#drop', () => {
    it('should correctly drop the first few elements', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).drop(3)
      expect(collectSync(iter)).to.deep.equal([4, 5])
    })

    it('should correctly drop nothing if not passed anything', () => {
      const iter = Poly.syncFrom([1, 2]).drop()
      expect(collectSync(iter)).to.deep.equal([1, 2])
    })

    it('should correctly drop everything if not enough elements', () => {
      const iter = Poly.syncFrom([1, 2]).drop(3)
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should throw if not passed an integer', () => {
      expect(() => Poly.syncFrom([]).drop('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.syncFrom([]).drop(-1)).to.throw()
    })
  })


  describe('#dropLast', () => {
    it('should correctly drop the last few elements', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).dropLast(3)
      expect(collectSync(iter)).to.deep.equal([1, 2])
    })

    it('should correctly drop nothing if not passed anything', () => {
      const iter = Poly.syncFrom([1, 2]).dropLast()
      expect(collectSync(iter)).to.deep.equal([1, 2])
    })

    it('should correctly drop everything if not enough elements', () => {
      const iter = Poly.syncFrom([1, 2]).dropLast(3)
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should throw if not passed an integer', () => {
      expect(() => Poly.syncFrom([]).dropLast('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.syncFrom([]).dropLast(-1)).to.throw()
    })
  })


  describe('#take', () => {
    it('should correctly take the first few elements', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).take(3)
      expect(collectSync(iter)).to.deep.equal([1, 2, 3])
    })

    it('should correctly take nothing if not passed anything', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).take()
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should correctly take everything if not enough elements', () => {
      const iter = Poly.syncFrom([1, 2]).take(3)
      expect(collectSync(iter)).to.deep.equal([1, 2])
    })

    it('should throw if not passed an integer', () => {
      expect(() => Poly.syncFrom([]).take('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.syncFrom([]).take(-1)).to.throw()
    })
  })


  describe('#takeLast', () => {
    it('should correctly take the last few elements', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).takeLast(3)
      expect(collectSync(iter)).to.deep.equal([3, 4, 5])
    })

    it('should correctly take nothing if not passed anything', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).takeLast()
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should correctly take everything if not enough elements', () => {
      const iter = Poly.syncFrom([1, 2]).takeLast(3)
      expect(collectSync(iter)).to.deep.equal([1, 2])
    })

    it('should throw if not passed an integer', () => {
      expect(() => Poly.syncFrom([]).takeLast('foo' as any)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.syncFrom([]).takeLast(-1)).to.throw()
    })
  })


  describe('#dropWhile', () => {
    it('should correctly drop as long as the passed function returns true', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).dropWhile((n) => n !== 3)
      expect(collectSync(iter)).to.deep.equal([3, 4, 5])
    })

    it('should correctly stop calling the passed function after the first false', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).dropWhile((n) => {
        if (n > 1) {
          expect.fail('called after first')
        }
        return false
      })

      collectSync(iter)
    })

    it('should correctly yield nothing if the passed function never returns false', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).dropWhile((n) => true)
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).dropWhile('foo' as any)).to.throw()
    })
  })


  describe('#takeWhile', () => {
    it('should correctly take as long as the passed function returns true', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).takeWhile((n) => n !== 3)
      expect(collectSync(iter)).to.deep.equal([1, 2])
    })

    it('should correctly stop calling the passed function after the first false', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).takeWhile((n) => {
        if (n > 1) {
          expect.fail('called after first')
        }
        return false
      })

      collectSync(iter)
    })

    it('should correctly yield everything if the passed function never returns false', () => {
      const iter = Poly.syncFrom([1, 2, 3]).takeWhile((n) => true)
      expect(collectSync(iter)).to.deep.equal([1, 2, 3])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).takeWhile('foo' as any)).to.throw()
    })
  })


  describe('#slice', () => {
    function testSlice (start: number, end?: number) {
      for (const n of [5, 7, 9, 12, 15, 20]) {
        const array = Array(n).fill(null).map((_, i) => i)

        const slicedArray = array.slice(start, end)
        const iter = Poly.syncFrom(array).slice(start, end)
        expect(collectSync(iter)).to.deep.equal(slicedArray)
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

    it('should work correctly when start >= 0 and end >= 0', () => {
      testSlice(0, 1)
      testSlice(1, 4)
      testSlice(3, 10)
      testSlice(5, 1)
    })

    it('should work correctly when start < 0 and end >= 0', () => {
      testSlice(-1, 0)
      testSlice(-10, 10)
      testSlice(-5, 5)
      testSlice(-8, 1)
      testSlice(-6, 100)
    })

    it('should work correctly when start >= 0 and end < 0', () => {
      testSlice(0, -1)
      testSlice(0, -50)
      testSlice(10, -5)
      testSlice(3, -2)
      testSlice(1, -5)
    })

    it('should work correctly when start < 0 and end < 0', () => {
      testSlice(-1, -1)
      testSlice(-5, -1)
      testSlice(-10, -5)
      testSlice(-5, -10)
      testSlice(-100, -1)
    })

    it('should throw if first argument is not an integer', () => {
      expect(() => Poly.syncFrom([]).slice(0.5, 0)).to.throw()
      expect(() => Poly.syncFrom([]).slice('foo' as any, 0)).to.throw()
      expect(() => Poly.syncFrom([]).slice(null as any, 0)).to.throw()
      expect(() => Poly.syncFrom([]).slice(undefined as any, undefined as any)).to.throw()
    })

    it('should throw if second argument is not an integer', () => {
      expect(() => Poly.syncFrom([]).slice(0, 0.5)).to.throw()
      expect(() => Poly.syncFrom([]).slice(0, 'bar' as any)).to.throw()
    })
  })


  describe('#filter', () => {
    it('should only yield elements for which passed function returns true', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5, 6, 7]).filter((n) => n % 3 === 1)
      expect(collectSync(iter)).to.deep.equal([1, 4, 7])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).filter('foo' as any)).to.throw()
    })
  })


  describe('#filterNotNullish', () => {
    it('should only yield elements that aren\'t null or undefined', () => {
      const iter = Poly.syncFrom([0, 1, null, 2, undefined, 3]).filterNotNullish()
      expect(collectSync(iter)).to.deep.equal([0, 1, 2, 3])
    })
  })


  describe('#map', () => {
    it('should yield elements correctly mapped', () => {
      const iter = Poly.syncFrom([1, 2, 3]).map((n) => n * n)
      expect(collectSync(iter)).to.deep.equal([1, 4, 9])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).map('foo' as any)).to.throw()
    })
  })


  describe('#tap', () => {
    it('should yield elements of original iteration', () => {
      const iter = Poly.syncFrom([1, 2, 3]).tap((n) => n * n)
      expect(collectSync(iter)).to.deep.equal([1, 2, 3])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).tap('foo' as any)).to.throw()
    })
  })


  const FLAT_METHODS = ['flatten', 'flat'] as const
  FLAT_METHODS.forEach((name) => {
    describe(`#${name}`, () => {
      it('should correctly yield elements from iterable elements', () => {
        const iter = Poly.syncFrom([Poly.range(1), Poly.range(2), Poly.range(3)])[name]()
        expect(collectSync(iter)).to.deep.equal([0, 0, 1, 0, 1, 2])
      })

      it('should throw if an element is not iterable', () => {
        const iter = (Poly.syncFrom([0]) as any)[name]()
        expect(() => collectSync(iter)).to.throw()
      })

      it('should throw if passed argument is not a function', () => {
        expect(() => Poly.syncFrom([]).flatMap('foo' as any)).to.throw()
      })
    })
  })


  describe('#flatMap', () => {
    it('should yield elements correctly mapped', () => {
      const iter = Poly.syncFrom([1, 2, 3]).flatMap((n) => Array(n).fill(null).map((_, i) => (10 * n) + i))
      expect(collectSync(iter)).to.deep.equal([10, 20, 21, 30, 31, 32])
    })

    it('should throw if a mapped element is not iterable', () => {
      const iter = Poly.syncFrom([0]).flatMap((x) => x as any)
      expect(() => collectSync(iter)).to.throw()
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).flatMap('foo' as any)).to.throw()
    })
  })


  describe('#chunk', () => {
    it('should yield elements correctly chunked if amount is a divisor', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5, 6]).chunk(2)
      expect(collectSync(iter)).to.deep.equal([[1, 2], [3, 4], [5, 6]])
    })

    it('should yield last elements correctly chunked if amount is not a divisor', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).chunk(2)
      expect(collectSync(iter)).to.deep.equal([[1, 2], [3, 4], [5]])
    })

    it('should yield nothing if original iterable was empty', () => {
      const iter = Poly.syncFrom([]).chunk(2)
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should throw if not passed an integer', () => {
      expect(() => Poly.syncFrom([]).chunk('foo' as any)).to.throw()
    })

    it('should throw if passed zero', () => {
      expect(() => Poly.syncFrom([]).chunk(0)).to.throw()
    })

    it('should throw if passed a negative number', () => {
      expect(() => Poly.syncFrom([]).chunk(-1)).to.throw()
    })
  })


  describe('#chunkWhile', () => {
    it('should yield elements correctly chunked', () => {
      const iter = Poly.range(0, 10).chunkWhile((elem) => elem % 4 !== 0 && elem % 5 !== 0)
      expect(collectSync(iter)).to.deep.equal([[0, 1, 2, 3], [4], [5, 6, 7], [8, 9]])
    })

    it('should yield nothing if original iterable was empty', () => {
      const iter = Poly.syncFrom([]).chunkWhile(() => true)
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should throw if not passed a function', () => {
      expect(() => Poly.syncFrom([]).chunkWhile('foo' as any)).to.throw()
    })
  })


  describe('#groupBy', () => {
    it('should work for empty iterations', () => {
      const iter = Poly.syncFrom([]).groupBy(() => 0)
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should yield correctly grouped elements', () => {
      const elems = ['one', 'two', 'three', 'four', 'five']
      const groups = [[3, ['one', 'two']], [5, ['three']], [4, ['four', 'five']]]
      const iter = Poly.syncFrom(elems).groupBy((str) => str.length)
      expect(collectSync(iter)).to.deep.equal(groups)
    })

    it('should throw if not passed a function', () => {
      expect(() => Poly.syncFrom([]).groupBy('foo' as any)).to.throw()
    })
  })


  describe('#unique', () => {
    it('should work for empty iterations', () => {
      const iter = Poly.syncFrom([]).unique()
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should work for all different elements', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).unique()
      expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5])
    })

    it('should work for some same elements', () => {
      const iter = Poly.syncFrom([1, 1, 2, 1, 2, 3, 1, 2, 3, 4, 1, 2, 3, 4, 5]).unique()
      expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5])
    })

    it('should work when passed a function that gives always different results', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).unique((x) => x * 3)
      expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4, 5])
    })

    it('should work when passed a function that gives sometimes the same results', () => {
      const iter = Poly.syncFrom([0, 1, 2, 3, 4, 5]).unique((x) => Math.floor(x / 2))
      expect(collectSync(iter)).to.deep.equal([0, 2, 4])
    })

    it('should work when passed a function that gives always the same result', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4, 5]).unique((x) => 0)
      expect(collectSync(iter)).to.deep.equal([1])
    })

    it('should throw if not passed a function', () => {
      expect(() => Poly.syncFrom([]).unique('foo' as any)).to.throw()
    })
  })


  describe('#reverse', () => {
    it('should work for empty iterations', () => {
      const iter = Poly.syncFrom([]).reverse()
      expect(collectSync(iter)).to.deep.equal([])
    })

    it('should work for small iterations', () => {
      const iter = Poly.syncFrom([1, 2, 3]).reverse()
      expect(collectSync(iter)).to.deep.equal([3, 2, 1])
    })

    it('should work for long iterations', () => {
      const iter = Poly.range(1000).reverse()
      expect(collectSync(iter)).to.deep.equal(Poly.range(999, -1, -1).toArray())
    })
  })


  describe('#sort', () => {
    const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    function randStr (n = 16) {
      return Array(n).fill(null).map(() => CHARS[Math.floor(Math.random() * CHARS.length)])
    }

    function checkSort<T> (arr: Array<T>, func?: (a: T, b: T) => number) {
      const iter = Poly.syncFrom(arr).sort(func)
      expect(collectSync(iter)).to.deep.equal(arr.slice().sort(func))
    }

    it('should work for empty iterations', () => {
      checkSort([])
    })

    it('should work for small iterations', () => {
      checkSort(Array(10).fill(null).map(() => randStr))
    })

    it('should work for long iterations', () => {
      checkSort(Array(1000).fill(null).map(() => randStr))
    })

    it('should work when given a comparator function', () => {
      checkSort([5, 2, 8, 4], (a, b) => a < b ? +1 : (a > b) ? -1 : 0)
    })

    it('should throw if not passed a function', () => {
      expect(() => Poly.syncFrom([]).sort('foo' as any)).to.throw()
    })
  })


  describe('#toArray', () => {
    it('should return all elements as an array', () => {
      const iter = Poly.range(3)
      expect(iter.toArray()).to.deep.equal([0, 1, 2])
    })

    it('should return empty array if no elements', () => {
      const iter = Poly.range(0)
      expect(iter.toArray()).to.deep.equal([])
    })
  })


  describe('#toPartitionArrays', () => {
    it('should return empty arrays for an ampty iteration', () => {
      const iter = Poly.empty()
      const [trues, falses] = iter.toPartitionArrays((x) => !!x)

      expect(trues).to.deep.equal([])
      expect(falses).to.deep.equal([])
    })

    it('should return empty "trues" array if function always returns false', () => {
      const iter = Poly.range(5)
      const [trues, falses] = iter.toPartitionArrays(() => true)

      expect(trues).to.not.deep.equal([])
      expect(falses).to.deep.equal([])
    })

    it('should return empty "falses" array if function always returns true', () => {
      const iter = Poly.range(5)
      const [trues, falses] = iter.toPartitionArrays(() => false)

      expect(trues).to.deep.equal([])
      expect(falses).to.not.deep.equal([])
    })

    it('should correctly partition into "trues" and "falses"', () => {
      const iter = Poly.range(10)
      const [trues, falses] = iter.toPartitionArrays((n) => (n % 3 === 0) || (n % 5 === 0))

      expect(trues).to.deep.equal([0, 3, 5, 6, 9])
      expect(falses).to.deep.equal([1, 2, 4, 7, 8])
    })
  })


  describe('#toObject', () => {
    const asciiA = 'a'.charCodeAt(0)

    it('should return all elements as an object', () => {
      const iter = Poly.range(3).map((n) => [String.fromCharCode(asciiA + n), n] as const)
      expect(iter.toObject()).to.deep.equal({a: 0, b: 1, c: 2})
    })

    it('should return empty object if no elements', () => {
      const iter = Poly.syncFrom([])
      expect(iter.toObject()).to.deep.equal({})
    })
  })


  describe('#toMap', () => {
    const asciiA = 'a'.charCodeAt(0)

    it('should return all elements as a Map', () => {
      const iter = Poly.range(3).map((n) => [String.fromCharCode(asciiA + n), n] as const)
      expect(Object.fromEntries(iter.toMap().entries())).to.deep.equal({a: 0, b: 1, c: 2})
    })

    it('should return empty Map if no elements', () => {
      const iter = Poly.syncFrom([])
      expect(Object.fromEntries(iter.toMap().entries())).to.deep.equal({})
    })
  })


  describe('#find', () => {
    it('should correctly return first element for which passed function is true', () => {
      const iter = Poly.range(15)
      expect(iter.find((n) => n % 6 === 5)).to.equal(5)
    })

    it('should correctly return undefined if passed function never returns true', () => {
      const iter = Poly.range(15)
      expect(iter.find((n) => false)).to.not.exist
    })

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.syncIterate((n) => n + 1, 0)
      expect(iter.find((n) => n % 15 === 0)).to.equal(15)
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).find('foo' as any)).to.throw()
    })
  })


  describe('#findLast', () => {
    it('should correctly return last element for which passed function is true', () => {
      const iter = Poly.range(15)
      expect(iter.findLast((n) => n % 6 === 5)).to.equal(11)
    })

    it('should correctly return undefined if passed function never returns true', () => {
      const iter = Poly.range(15)
      expect(iter.findLast((n) => false)).to.not.exist
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).findLast('foo' as any)).to.throw()
    })
  })


  describe('#findIndex', () => {
    const numbers = [1, 4, 2, 3, 8, 7, 1, 5, 0, 11, 6] as const

    it('should correctly return the index of the first element for which passed function is true', () => {
      const iter = Poly.from(numbers)
      expect(iter.findIndex((n) => n % 6 === 5)).to.equal(7)
    })

    it('should correctly return -1 if passed function never returns true', () => {
      const iter = Poly.from(numbers)
      expect(iter.findIndex((n) => false)).to.equal(-1)
    })

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.syncIterate((n) => n + 1, 0).map((n) => n ** 2)
      expect(iter.findIndex((n) => n > 100)).to.equal(10)
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).findIndex('foo' as any)).to.throw()
    })
  })


  describe('#findLastIndex', () => {
    const numbers = [1, 4, 2, 3, 8, 7, 1, 5, 0, 11, 6] as const

    it('should correctly return the index of the last element for which passed function is true', () => {
      const iter = Poly.from(numbers)
      expect(iter.findLastIndex((n) => n % 6 === 5)).to.equal(9)
    })

    it('should correctly return -1 if passed function never returns true', () => {
      const iter = Poly.from(numbers)
      expect(iter.findLastIndex((n) => false)).to.equal(-1)
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).findLastIndex('foo' as any)).to.throw()
    })
  })


  describe('#includes', () => {
    it('should correctly return true if element is included', () => {
      const iter = Poly.range(15)
      expect(iter.includes(7)).to.be.ok
    })

    it('should correctly return true if 0 is included and asked for -0', () => {
      const iter = Poly.range(1)
      expect(iter.includes(-0)).to.be.ok
    })

    it('should correctly return false if element is not included', () => {
      const iter = Poly.range(15)
      expect(iter.includes(17)).to.not.be.ok
    })

    it('should work for infinite iterables that contain the element', () => {
      const iter = Poly.syncIterate((n) => n + 1, 0)
      expect(iter.includes(42)).to.be.ok
    })
  })


  describe('#some', () => {
    it('should correctly return true if passed function returns true at any point', () => {
      const iter = Poly.range(42)
      expect(iter.some((n) => n === 13)).to.be.ok
    })

    it('should correctly return false if passed function always return false', () => {
      const iter = Poly.range(42)
      expect(iter.some((n) => false)).to.not.be.ok
    })

    it('should work for infinite iterables for which the passed function returns true', () => {
      const iter = Poly.syncIterate((n) => n + 1, 0)
      expect(iter.some((n) => n === 42)).to.be.ok
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).some('foo' as any)).to.throw()
    })
  })


  describe('#every', () => {
    it('should correctly return true if passed function always returns true', () => {
      const iter = Poly.range(42)
      expect(iter.every((n) => true)).to.be.ok
    })

    it('should correctly return false if passed function return false at any point', () => {
      const iter = Poly.range(42)
      expect(iter.every((n) => n !== 13)).to.not.be.ok
    })

    it('should work for infinite iterables for which the passed function returns false', () => {
      const iter = Poly.syncIterate((n) => n + 1, 0)
      expect(iter.every((n) => n !== 42)).to.not.be.ok
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).every('foo' as any)).to.throw()
    })
  })


  describe('#reduce', () => {
    it('should correctly accumulate the result of the given function', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4])
      expect(iter.reduce((a, b) => a + b, 0)).to.equal(10)
    })

    it('should use the given init value as starting accumulator', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4])
      expect(iter.reduce((a, _) => a, 'i')).to.equal('i')
    })

    it('should use the first element as accumulator if no init value given', () => {
      const iter = Poly.syncFrom([1, 2, 3, 4])
      expect(iter.reduce((a, _) => a, undefined)).to.equal(1)
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([] as Array<unknown>).reduce('foo' as any, undefined)).to.throw()
    })
  })


  describe('#count', () => {
    it('should correctly count the length of an iterable', async () => {
      const iter = Poly.range(13)
      await expect(iter.count()).to.equal(13)
    })
  })


  describe('#forEach', () => {
    it('should call the passed function once per element', () => {
      const called: Array<number> = []
      Poly.syncFrom([1, 2, 3]).forEach((n) => called.push(n))

      expect(called).to.deep.equal([1, 2, 3])
    })

    it('should throw if passed argument is not a function', () => {
      expect(() => Poly.syncFrom([]).forEach('foo' as any)).to.throw()
    })
  })


  describe('#join', () => {
    it('should correctly join the elements using the given glue', () => {
      const iter = Poly.syncFrom([1, 2, null, 3])
      expect(iter.join('|')).to.equal('1|2||3')
    })

    it('should correctly join the elements using a comma if no glue given', () => {
      const iter = Poly.syncFrom([1, 2, null, 3])
      expect(iter.join()).to.equal('1,2,,3')
    })
  })


  describe('#complete', () => {
    it('should complete the iterable', () => {
      let called = false
      const iter = Poly.syncFrom(function * () {
        yield * Array(10).fill(0)
        called = true
      })

      iter.complete()
      expect(called, 'iterable completeed').to.be.ok
    })
  })
})
