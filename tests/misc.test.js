/* eslint-disable no-unused-expressions */
const {preload, prefetch} = require('../lib/utils');

const {expect} = require('chai');

const {collectAsync} = require('./_utils');


function delay (ms) {
  return new Promise((acc) => setTimeout(acc, ms));
}

const VALUES = Object.freeze([0, 1, 1, 2, 3, 5, 8, 13, 21, 34]);


describe('Misc', () => {
  describe('Preload', () => {
    it('should yield the same elements', async () => {
      async function * gen () {
        yield * VALUES;
      }

      const iter = preload(gen());

      await expect(collectAsync(iter)).to.eventually.deep.equal(VALUES);
    });

    it('should retrieve the first element without iterating', async () => {
      let calledFirst = false;
      async function * gen () {
        calledFirst = true;
        yield * VALUES;
      }

      preload(gen());
      await delay(10);

      expect(calledFirst).to.be.ok;
    });

    it('should not retrieve more than the first element without iterating', async () => {
      let calledTwice = false;
      async function * gen () {
        for await (const value of VALUES) {
          yield value;
          calledTwice = true;
        }
      }

      preload(gen());
      await delay(10);

      expect(calledTwice).to.not.be.ok;
    });
  });


  describe('Prefetch', () => {
    it('should yield the same elements', async () => {
      async function * gen () {
        yield * VALUES;
      }

      const iter = prefetch(gen());

      await expect(collectAsync(iter)).to.eventually.deep.equal(VALUES);
    });

    it('should not retrieve elements without iterating', async () => {
      let calledTimes = 0;
      async function * gen () {
        for await (const value of VALUES) {
          calledTimes += 1;
          yield value;
        }
      }

      prefetch(gen());
      await delay(10);

      expect(calledTimes).to.equal(0);
    });

    it('should retrieve (only) a second item if iterated only once', async () => {
      let calledTimes = 0;
      async function * gen () {
        for await (const value of VALUES) {
          calledTimes += 1;
          yield value;
        }
      }

      const iter = prefetch(gen());

      const it = iter[Symbol.asyncIterator]();
      await it.next();
      await delay(10);

      expect(calledTimes).to.equal(2);
    });
  });
});
