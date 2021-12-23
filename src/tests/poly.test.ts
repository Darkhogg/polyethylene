/* eslint-disable no-unused-expressions */
import Poly from '../lib/main.js'

import chai, {expect} from 'chai'
import chaiAsPromised from 'chai-as-promised'

import {collectSync, collectAsync} from './_utils.js'

chai.use(chaiAsPromised)


describe('Poly', () => {
  describe('.syncFrom', () => {
    it('should return an iterable if given an iterable', () => {
      const obj = {
        * [Symbol.iterator] (): Iterator<unknown> {},
      }

      const iter = Poly.syncFrom(obj)
      expect(iter[Symbol.iterator]).to.exist
    })

    it('should return an iterable if given an iterable factory', () => {
      function * gen () {}

      const iter = Poly.syncFrom(gen)
      expect(iter[Symbol.iterator]).to.exist
    })

    it('should return an iterable that produces the correct values', () => {
      const values = [1, 3, 3, 7]

      const iter = Poly.syncFrom(values)
      expect(collectSync(iter)).to.deep.equal(values)
    })

    it('should not add overhead if passed a known SyncIterable', () => {
      const origIter = Poly.empty()
      const iter = Poly.syncFrom(origIter)

      expect(iter).to.equal(origIter)
    })
  })

  describe('.asyncFrom', () => {
    it('should return an async iterable if given an async iterable', () => {
      const obj = {
        async * [Symbol.asyncIterator] (): AsyncIterator<unknown> {},
      }

      const iter = Poly.asyncFrom(obj)
      expect(iter[Symbol.asyncIterator]).to.exist
    })

    it('should return an async iterable if given an async iterable factory', () => {
      async function * gen () {}

      const iter = Poly.asyncFrom(gen)
      expect(iter[Symbol.asyncIterator]).to.exist
    })

    it('should return an async iterable if given a sync iterable', () => {
      const obj = {
        * [Symbol.iterator] (): Iterator<unknown> {},
      }

      const iter = Poly.asyncFrom(obj)
      expect(iter[Symbol.asyncIterator]).to.exist
    })

    it('should return an async iterable if given a sync iterable factory', () => {
      function * gen () {}

      const iter = Poly.asyncFrom(gen)
      expect(iter[Symbol.asyncIterator]).to.exist
    })

    it('should return an async iterable that produces the correct values if given an async iterable', async () => {
      const values = [1, 3, 3, 7]
      const obj = {
        async * [Symbol.asyncIterator] (): AsyncIterator<number> {
          yield * values
        },
      }

      const iter = Poly.asyncFrom(obj)
      await expect(collectAsync(iter)).to.eventually.deep.equal(values)
    })

    it('should return an async iterable that produces the correct values if given a sync iterable', async () => {
      const values = [1, 3, 3, 7]
      const obj = {
        * [Symbol.iterator] (): Iterator<number> {
          yield * values
        },
      }

      const iter = Poly.asyncFrom(obj)
      await expect(collectAsync(iter)).to.eventually.deep.equal(values)
    })

    it('should throw if not given an iterable', () => {
      expect(() => Poly.asyncFrom(0 as any)).to.throw()
    })

    it('should not add overhead if passed a known AsyncIterable', () => {
      const origIter = Poly.empty().async()
      const iter = Poly.asyncFrom(origIter)

      expect(iter).to.equal(origIter)
    })
  })

  /*
   * we check all three functions at the same time by checing they work the same
   * as their Object counterparts
   */
  for (const funcName of ['keys', 'values', 'entries'] as const) {
    describe(`.${funcName}`, () => {
      function checkFor (obj : object) {
        const expected = Object[funcName](obj)
        const actual = collectSync((Poly[funcName] as any)(obj))

        expect(actual).to.deep.equal(expected)
      }

      it('should work for simple objects', () => {
        checkFor({foo: 0, bar: 1})
      })

      it('should work for arrays', () => {
        checkFor([0, 1, 3])
      })

      it('should work for objects with symbols', () => {
        checkFor({[Symbol('test')]: 0, 'test': 1})
      })

      it('should work for objects with inherited properties', () => {
        class Parent {
          foo = 1
        }
        class Child extends Parent {}

        checkFor(new Child())
      })

      it('should work with non-enumerable properties', () => {
        const obj = {'one': 1}
        Object.defineProperty(obj, 'two', {value: 2, enumerable: true})
        Object.defineProperty(obj, 'three', {value: 3, enumerable: false})

        checkFor(obj)
      })
    })
  }


  describe('.range', () => {
    it('should work if only upper bound is specified', () => {
      const iter = Poly.range(3)
      expect(collectSync(iter)).to.deep.equal([0, 1, 2])
    })

    it('should work if lower and upper bound are specified', () => {
      const iter = Poly.range(1, 5)
      expect(collectSync(iter)).to.deep.equal([1, 2, 3, 4])
    })

    it('should work ok with a positive step different than 1', () => {
      const iter = Poly.range(1, 9, 2)
      expect(collectSync(iter)).to.deep.equal([1, 3, 5, 7])
    })

    it('should work ok with a step of -1', () => {
      const iter = Poly.range(5, 0, -1)
      expect(collectSync(iter)).to.deep.equal([5, 4, 3, 2, 1])
    })

    it('should work ok with a negative step different than -1', () => {
      const iter = Poly.range(6, 0, -2)
      expect(collectSync(iter)).to.deep.equal([6, 4, 2])
    })

    it('should throw if 0 as step', () => {
      expect(() => Poly.range(0, 0, 0)).to.throw()
    })
  })

  describe('.repeat', () => {
    it('should yield the given value multiple times', () => {
      const value = 42

      const iter = Poly.repeat(value)
      const expected = Array(100).fill(value)

      expect(collectSync(iter, expected.length)).to.deep.equal(expected)
    })
  })

  describe('.syncIterate', () => {
    it('should sync yield the result of the passed function for sync functions', () => {
      const iter = Poly.syncIterate((last) => last + 1, 0)
      const expected = [1, 2, 3, 4, 5, 6, 7, 8]

      expect(collectSync(iter, expected.length)).to.deep.equal(expected)
    })
  })

  describe('.asyncIterate', () => {
    it('should async yield the result of the passed function for async functions', async () => {
      const iter = Poly.asyncIterate(async (last) => last + 1, 0)
      const expected = [1, 2, 3, 4, 5, 6, 7, 8]

      expect(collectAsync(iter, expected.length)).to.eventually.deep.equal(expected)
    })
  })

  describe('.assemble', () => {
    function fromTimeouts (spec: Array<[string | undefined | Error, number]>) {
      return Poly.assemble(({value, error, done}) => {
        for (const [obj, ms] of spec) {
          const func = (obj === undefined) ? done
            : (obj instanceof Error) ? error.bind(null, obj)
              : value.bind(null, obj)

          if (ms > 0) {
            setTimeout(func, ms)
          } else {
            func()
          }
        }
      })
    }

    it('should work for fully sync iterations', async () => {
      const iter = fromTimeouts([
        ['a', 0],
        ['b', 0],
        [undefined, 0],
        ['X', 0],
      ])

      const expected = ['a', 'b']
      await expect(collectAsync(iter, expected.length)).to.eventually.deep.equal(expected)
    })

    it('should work for fully sync iteration errors', async () => {
      const iter = fromTimeouts([
        [new Error(), 0],
        ['X', 0],
      ])

      await expect(collectAsync(iter, 8)).to.be.rejected
    })

    it('should work for sync empty iterations', async () => {
      const iter = fromTimeouts([
        [undefined, 0],
        ['X', 0],
        [new Error(), 0],
      ])

      const expected: Array<unknown> = []
      await expect(collectAsync(iter, expected.length)).to.eventually.deep.equal(expected)
    })

    it('should work for semi-async iterations', async () => {
      const iter = fromTimeouts([
        ['a', 0],
        ['b', 0],
        ['c', 10],
        ['d', 10],
        ['e', 20],
        ['f', 20],
        [undefined, 30],
        ['X', 35],
      ])

      const expected = ['a', 'b', 'c', 'd', 'e', 'f']
      await expect(collectAsync(iter, expected.length)).to.eventually.deep.equal(expected)
    })

    it('should work for semi-async iteration errors', async () => {
      const iter = fromTimeouts([
        ['a', 0],
        ['b', 0],
        [new Error(), 10],
        [undefined, 20],
        ['X', 30],
      ])

      await expect(collectAsync(iter, 8)).to.be.rejected
    })

    it('should work for async iterations', async () => {
      const iter = fromTimeouts([
        ['a', 0],
        ['b', 5],
        ['c', 10],
        ['d', 15],
        ['e', 20],
        ['f', 25],
        [undefined, 30],
        ['X', 35],
      ])

      const expected = ['a', 'b', 'c', 'd', 'e', 'f']
      await expect(collectAsync(iter, expected.length)).to.eventually.deep.equal(expected)
    })

    it('should work for async iteration errors', async () => {
      const iter = fromTimeouts([
        ['a', 0],
        ['b', 5],
        [new Error(), 10],
        [undefined, 20],
        ['X', 30],
      ])

      await expect(collectAsync(iter, 8)).to.be.rejected
    })

    it('should work for async empty iterations', async () => {
      const iter = fromTimeouts([
        [undefined, 5],
        ['X', 10],
        [new Error(), 15],
      ])

      const expected: Array<unknown> = []
      await expect(collectAsync(iter, expected.length)).to.eventually.deep.equal(expected)
    })
  })
})
