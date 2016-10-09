module.exports.mapCompact = mapCompact;

function mapCompact(arr, fn, filterOut) {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Must pass an Array to mapCompact. Not ${typeof arr}`);
  }

  let filterOutType = typeof filterOut;

  return arr.map(fn).filter(item => (typeof item !== filterOutType));
}
