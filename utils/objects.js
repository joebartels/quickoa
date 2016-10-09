module.exports.mapObj = mapObj;

/**
  Returns a new objects, where keys and values are modified via the passed in function.
  Can be used to filter out / normalize keys and values;
  
  @param {Object} obj The Object to enumerate.
  @param {Function} fn Accepts params: key, value
                    Must return an array with the new key & value [ key, value ].
                    If an empty array is returned, that iteration will be 
                    excluded from the returned Object.
*/
function mapObj(obj, fn, ret = {}) {
  for (let key in obj) {
    let [ k, v ] = fn(key, obj[key]);

    if (typeof k !== 'undefined') {
      ret[k] = v;
    }
  }
    
  return ret;
}
