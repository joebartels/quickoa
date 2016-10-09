const Model = require('./model');

const { pluralize }   = require('./utils/strings');
const { mapObj }      = require('./utils/objects');
const { mapCompact }  = require('./utils/arrays');

/**
  Validates an object based on a particular Model.
  A validated object is ready for deserialization

  Client -> API -> normalize(rawRequest) -> validate(rawData) -> deserialize(rawData) -> insert DB

  @class Validator
  @param {Object} options { model, attrs }
*/

class Validator {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new TypeError('Must pass an options Object ' +
                          '`{ model, attrs, ... }` ' +
                          'when invoking Validator as constructor.');
    }

    let {
      model,
      attrs
    } = options;

    if (!(model instanceof Model)) {
      throw new Error('`{ model }` must be instanceof quickoa/model.');
    }

    if (attrs && typeof attrs !== 'object') {
      throw new TypeError('{ attrs } must be an {Object}.');
    }

    this.model = model;
    this.fields = model.fields;
  }

  /**

    Validates values based on a Model's fields' validation rules.

    @method validate
    @param {Object} values Default {}
    @return {Array} An array of error objects.
  */
  validate(values) {
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

    return errors.filter(function(err) { return err; });
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

    let validator = this.validatorForType(dataType);

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
  validatorForType(dataType) {
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
        return (val) => `Cannot validate ${val}. No validator for ${dataType}`
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

module.exports = Validator;
