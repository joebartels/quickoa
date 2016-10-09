const Inflector = require('inflected');

/**
  Returns a new objects, where keys and values are modified via the passed in function.
  Can be used to filter out / normalize keys and values;
  
  @param {Object} obj The Object to enumerate.
  @param {Function} fn Accepts params: key, value
                    Must return an array with the new key & value [ key, value ].
                    If an empty array is returned, that iteration will be 
                    excluded from the returned Object.
*/

module.exports.mapObj = mapObj;
module.exports.pluralize = pluralize;
module.exports.mapCompact = mapCompact;
module.exports.camelize = camelize;

function mapObj(obj, fn, ret = {}) {
  for (let key in obj) {
    let [ k, v ] = fn(key, obj[key]);

    if (typeof k !== 'undefined') {
      ret[k] = v;
    }
  }
    
  return ret;
}

function pluralize(str) {
  str = str || '';
  return Inflector.pluralize(str);
}

function camelize(str, ucaseFirst = false) {
  str = str || '';
  return Inflector.camelize(str, ucaseFirst);
}

function mapCompact(arr, fn, filterOut) {
  if (!Array.isArray(arr)) {
    throw new TypeError(`Must pass an Array to mapCompact. Not ${typeof arr}`);
  }

  let filterOutType = typeof filterOut;

  return arr.map(fn).filter(item => (typeof item !== filterOutType));
}
