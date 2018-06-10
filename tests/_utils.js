function collectSync (seq, max) {
  let num = 0;
  const arr = [];
  for (const elem of seq) {
    arr.push(elem);
    if (++num >= max) {
      break;
    }
  }
  return arr;
}

async function collectAsync (seq, max) {
  let num = 0;
  const arr = [];
  for await (const elem of seq) {
    arr.push(elem);
    if (++num >= max) {
      break;
    }
  }
  return arr;
}

exports.collectSync = collectSync;
exports.collectAsync = collectAsync;
