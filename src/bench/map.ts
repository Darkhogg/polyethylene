import Benchmark from 'benchmark'
import Poly, {PolySyncIterable} from '../lib/main.js'


const NAME_ARRAY = 'Array#map'
const NAME_POLY = 'PolySyncIterable#map'


interface Mapper {
  <M extends Array<number> | PolySyncIterable<number>>(mappable: M): M
}


const mapOnce: Mapper = (mappable) => (mappable.map((n) => n ** 2) as any)
const mapTwice: Mapper = (mappable) => (mappable.map((n) => n ** 2).map((n) => n % 17) as any)
const mapMany: Mapper = (mappable) => (mappable
  .map((n) => n ** 2)
  .map((n) => n % 17)
  .map((n) => n + 10)
  .map((n) => n / 2)
  .map((n) => Math.sqrt(n)) as any)


function arrayOf (n: number): Array<number> {
  return Array(n).fill(null).map((v, i) => i)
}

function benchFor (num: number, runMap: Mapper): void {
  const array = arrayOf(num)
  const suite = new Benchmark.Suite(`${num} elements - ${runMap.name}`)

  suite.add(NAME_ARRAY, () => runMap(array))
  suite.add(NAME_POLY, () => runMap(Poly.syncFrom(array)).toArray())


  suite.on('cycle', (event: Benchmark.Event) => {
    console.log('·', String(event.target))
  })
  suite.on('complete', () => {
    const array = (suite.filter((elem: Benchmark) => elem.name === NAME_ARRAY) as any)[0] as Benchmark
    const poly = (suite.filter((elem: Benchmark) => elem.name === NAME_POLY)as any)[0] as Benchmark

    const ratio = poly.hz / array.hz
    console.log('Ratio: %s%', (ratio * 100).toFixed(2))
  })

  console.log(suite.name)
  suite.run({})
  console.log()
}

const SIZES = [10, 1000, 100000]
for (const size of SIZES) {
  benchFor(size, mapOnce)
  benchFor(size, mapTwice)
  benchFor(size, mapMany)
}
