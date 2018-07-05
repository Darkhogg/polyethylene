function collectSync (iter, max) {
  let num = 0;
  const arr = [];
  for (const elem of iter) {
    arr.push(elem);
    if (++num >= max) {
      break;
    }
  }
  return arr;
}

async function collectAsync (iter, max) {
  let num = 0;
  const arr = [];
  for await (const elem of iter) {
    arr.push(elem);
    if (++num >= max) {
      break;
    }
  }
  return arr;
}

exports.collectSync = collectSync;
exports.collectAsync = collectAsync;
