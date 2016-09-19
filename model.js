const Record = require('./record.js');

const { 
  pluralize,
  underscore,
  forIn
} = require('./services/basic');

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

    this.fields = fields;
    // this.validators = validators;
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

    let recordValues = forIn(this.fields, fn);

    return new Record(this, recordValues);
  }

  /**

    Validates values based on a Model's fields' validation rules.

    @method validate
    @param {Object} values Default {}
    @return {Array} An array of error objects.
  */
  validate(values) {
    if (values instanceof Record) {
      values = values.data;
    }

    values = values || {};

    let fields = this.fields;
    let fieldNames = Object.keys(fields);

    let errors = fieldNames.map(propertyName => {
      let propertyValue = values[propertyName]
      let fieldOptions = fields[propertyName];

      let detail = this.validateField(propertyValue, fieldOptions);

      if (detail) {
        return { detail, propertyName, propertyValue };
      }
    });

    return errors.filter(function(el) { return el; });
  }

  /**
    Validates `required` fields.
    Locates & uses the correct validator function on 
    the fieldValue based on `fieldOptions.dataType`.

    `null` return means validation passed.

    @method validateField 
    @param {String} fieldValue
    @param {Object} fieldOptions
    @return {null|String}
  */
  validateField(fieldValue, fieldOptions) {
    let {
      dataType,
      required
    } = fieldOptions;

    if (typeof fieldValue === 'undefined') {
      let error = required ? 
                  `Field is required with dataType ${dataType}.` :
                  null;

      return error;
    }

    let validator = this.validatorFor(dataType);

    // wrapped because is potentially user provided validation function.
    try {
      let validation = validator(fieldValue, fieldOptions);

      if (validation === true) {
        return null
      }

      if (typeof validation === 'string') {
        return validation;
      }

      return `${dataType} validation failed for ${fieldValue}`;
      
    } catch (err) {
      return (err instanceof Error) ? err.message : err + '';
    }
  }

  /**
    Returns the correct function for validation.
    Will throw an error if no validation exists.

    @method validateFor
    @param {String}
  */
  validatorFor(dataType) {
    switch (dataType) {
      case 'bigint':
        return validateBigInt;
      case 'smallint':
        return validateSmallInt;
      case 'int':
        return validateInt;
      case 'string':
        return validateString;
      case 'date':
        return validateDate;
      default:
        return function() { 
          return `No validator for ${dataType}`;
        }
    }
  }
}

/**
  TODO: implement minimum and maximum dates.
  TODO: consider Date.parse for validating.

  @method validateDate
  @param {Mixed} value
  @param {Object} options
*/
function validateDate(value, options) {
  // let isDate = value.constructor === Date;

  let date = Date.parse(value);

  return isNaN(date) === false;
}

function validateString(value, options) {
  let maxLength = (typeof options.max !== 'undefined') ? options.max : Infinity;
  let minLength = (typeof options.min !== 'undefined') ? options.min : 0;
  let isString = typeof value === 'string';

  return isString &&
          (value.length <= maxLength) &&
          (value.length >= minLength);
}

// actual min and max are: -9223372036854775808 & 9223372036854775807
function validateBigInt(value, options) {
  return checkMinMax(value, options, -9223372036854775000, 9223372036854775000);
}

function validateSmallInt(value, options) {
  return checkMinMax(value, options, -32768, 32767);
}

function validateInt(value, options) {
  return checkMinMax(value, options, -2147483648, 2147483647);
}

function checkMinMax(value, options, min, max) {
  max = (typeof options.max !== 'undefined') ? options.max : max;
  min = (typeof options.min !== 'undefined') ? options.min : min;

  return !isNaN(value) && 
          (value <= max) && 
          (value >= min);
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
