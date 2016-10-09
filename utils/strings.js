const Inflector = require('inflected');

module.exports.pluralize = pluralize;
module.exports.camelize = camelize;

function pluralize(str) {
  str = str || '';
  return Inflector.pluralize(str);
}

function camelize(str, ucaseFirst = false) {
  str = str || '';
  return Inflector.camelize(str, ucaseFirst);
}
