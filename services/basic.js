'use strict';

const Inflector = require('inflected');

const STRING_UNDERSCORE_REGEXP_1 = (/([a-z\d])([A-Z]+)/g);
const STRING_UNDERSCORE_REGEXP_2 = (/\-|\s+/g);

// TODO: cache underscored values for fast return;
function underscore(str = '') {
  return str.replace(STRING_UNDERSCORE_REGEXP_1, '$1_$2').
    replace(STRING_UNDERSCORE_REGEXP_2, '_').toLowerCase();
}

function getProperties(obj, ...names) {
  if (Array.isArray(names[0])) {
    names = names[0];
  }

  let ret = {};
  let i = names.length;

  while (i-- > 0) {
    ret[names[i]] = obj[names[i]]
  }
  return ret;
}

/**
  Returns a new objects, where keys and values are modified via the passed in function.
  Can be used to filter out / normalize keys and values;
  
  @param {Object} obj The Object to enumerate.
  @param {Function} fn Accepts params: key, value
                    Must return an array with the new key & value [ key, value ].
                    If an empty array is returned, that iteration will be 
                    excluded from the returned Object.
*/
function forIn(obj, fn) {
  let ret = {};

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

module.exports.forIn = forIn;
module.exports.underscore = underscore;
module.exports.getProperties = getProperties;
module.exports.pluralize = pluralize;
