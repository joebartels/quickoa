const Inflector = require('inflected');
const CACHE = require('./cache');

module.exports.pluralize = pluralize;
module.exports.camelize = camelize;

function pluralize(str) {
  str = str || '';
  
  if (CACHE.has(str)) {
    return CACHE.get(str);
  }
  let plural = Inflector.pluralize(str);

  return CACHE.set(str, plural);
}

function camelize(str, ucaseFirst = false) {
  str = (str || '').replace(/-/g, '_');

  if (CACHE.has(str)) {
    return CACHE.get(str);
  }

  let camel = Inflector.camelize(str, ucaseFirst);

  return CACHE.set(str, camel);
}
