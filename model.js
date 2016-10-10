const Record = require('./record.js');

const { mapObj } = require('./utils/objects');
const { pluralize, underscore } = require('./utils/strings');

class Model {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new Error('Must pass an options Object `{ name, fields }` when invoking Model as constructor.');
    }

    let {
      name,
      // validators,
      fields
    } = options;

    if (typeof name !== 'string') {
      throw new Error('Must provide a String for options.name');
    }

    if (typeof fields !== 'object') {
      throw new Error('Must provide an Object for options.fields');
    }

    this.name = name;
    this.fields = fields;
    this.fieldsList = generateFieldsList(fields);
    this.primaryKey = findPrimaryKey(fields);
  }

  /**
    Returns a `Record` object.
    Only applied values whose key is defined as a Model's field.
    Essentially this just filters out any fields that weren't defined on the model.

    @method createRecord
    @param {Object} values
    @return {Object}
  */

  createRecord(values) {
    values = values || {};

    let fn = (fieldName, fieldOptions) => {
      let providedValue = values[fieldName];
      let {
        defaultValue
      } = fieldOptions;

      if (typeof providedValue === 'undefined' &&
          typeof defaultValue !== 'undefined'
      ) {
        providedValue = typeof defaultValue === 'function' ?
                        defaultValue() :
                        defaultValue;
      }

      if (typeof providedValue !== 'undefined') {
        return [fieldName, providedValue];
      }

      return [];
    };

    let recordValues = mapObj(this.fields, fn);

    return new Record(this, recordValues);
  }
}

/**
  @method generateFieldsList
  @param {Object} fields

  Returns a list of fields, excluding the primaryKey
*/
function generateFieldsList(fields) {
  let ret = [];

  for (field in fields) {
    if (!fields[field].primaryKey) {
      ret.push(field);
    }
  }

  return ret;
}

/**
  @method findPrimaryKey
  @param {Object} fields
  @return {Object}

  returns an object { name, options }
*/
function findPrimaryKey(fields) {
  for (field in fields) {
    if (fields[field].primaryKey) {
      return {
        name: field,
        opts: fields[field]
      };
    }
  }  
}

module.exports = Model;
