export function collectSync<T> (iter : Iterable<T>, max : number = Infinity) : Array<T> {
  let num = 0
  const arr = []
  for (const elem of iter) {
    arr.push(elem)
    if (++num >= max) {
      break
    }
  }
  return arr
}

export async function collectAsync<T> (iter : AsyncIterable<T>, max : number = Infinity) : Promise<Array<T>> {
  let num = 0
  const arr = []
  for await (const elem of iter) {
    arr.push(elem)
    if (++num >= max) {
      break
    }
  }
  return arr
}
