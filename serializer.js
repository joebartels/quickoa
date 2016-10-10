const Model = require('./model');

const { pluralize }   = require('./utils/strings');
const { mapObj }      = require('./utils/objects');
const { mapCompact }  = require('./utils/arrays');

const boolean = require('./transforms/boolean');
const date    = require('./transforms/date');
const number  = require('./transforms/number');
const string  = require('./transforms/string');

// "array:int".match  -> ["array:int", "array:", "int"]
// "int".match        -> ["int", undefined, "int"]
const DATA_TYPE = /(^array\:)?(.+)/;

/**
  Creates a serializer based on a Quickoa/Model instance.
  A serializer exposes 2 main methods:

  __serialize:__
  API -> query DB -> serialize(data) -> Client

  __deserialize:__
  Client -> API -> normalize(rawData) -> validate(rawData) -> deserialize(rawData) -> insert DB

  @class Serializer
  @param {Object} options { model, rootKey, attrs }
*/
class Serializer {
  constructor(options) {
    if (typeof options !== 'object') {
      throw new TypeError('Must pass an options Object `{ rootKey, model, ... }` when invoking Serializer as constructor.');
    }

    let {
      model,
      rootKey,
      attrs
    } = options;

    if (!(model instanceof Model)) {
      throw new Error('`{ model }` must be instanceof quickoa/model.');
    }

    if (attrs && typeof attrs !== 'object') {
      throw new TypeError('{ attrs } must be an {Object}.');
    }

    this.model = model;
    this.rootKey = rootKey || model.name,
    this.rootKeyPlural = pluralize(this.rootKey);
  }

  /**
    Accepts data from db query. 
    An array of rows, or single row as an object.

    Calls `serializeOne` for each row.

    Returns an object formatted for client consumption.

    @method serialize
    @param {Object|Array} 
  */
  serialize(data) {
    let { fields } = this.model;
    let ret = {};
    let key, res;

    if (Array.isArray(data)) {
      key = this.rootKeyPlural;
      res = data.map(item => this.serializeOne(item, fields));
    } else if (data && typeof data === 'object') {
      key = this.rootKey;
      res = this.serializeOne(data, fields);
    } else {
      key = this.rootKey;
      res = {}
    }

    ret[key] = res;

    return ret;
  }

  /**
    Uses the model to determine how each attribute should be serialized.
    If an attr is _not_ defined on the model, it will _not_ be serialized.
    Natively supports serializing:
    `number`,
    `int`, 
    `smallint`,
    `bigint`,
    `date`,
    `string`,
    `boolean`,
    `array:int`,
    `array:smallint`,
    `array:bigint`,
    `array:date`,
    `array:string`,
    `array:boolean`

    @method serializeOne
    @param {Object} item
  */
  serializeOne(rowJSON, fields) {

    let fn = (key, fieldOptions) => {
      return this.serializeAttribute(key, rowJSON[key], fieldOptions, rowJSON);
    }

    return mapObj(fields, fn);
  }

  /**
    // TODO:
    // or if { attrs[field].serializer } exists for each field...
    //
    // let fn = (key, fieldOptions) => {
    //   let attr = this.attrs[key];
    //   let { serializer } = attr;
    //   let serializedValue = serializer.call(this, key, value, options);
    //   return [ key, serializedValue ];
    // }    

    @method serializeAttribute
    @return {Array} [ key, value ]
  */
  serializeAttribute(key, value, fieldOptions, rowJSON) {
      let { dataType } = fieldOptions;

      let serializer = this.serializerForType(dataType);
      let serializedValue = serializer(value, fieldOptions);

      return [ key, serializedValue ];
  }

  /**
    Returns the correct serializer function based
    on the `dataType` defined for the property on the the model's `fields` object
    e.g.,
    ```
    {
      fields: {
        user_place_ids: { dataType: 'array:bigint' }
      }
    }
    ```

    Iterates through a model's `fields` and returns a function for the correct
    serializer

    @method serializeForType
    @param {Object} model
  */

  serializerForType(dataType) {
    if (typeof dataType !== 'string') {
      throw new TypeError(`a dataType must be specified for every model field.`);
    }

    let typeMatch = dataType.match(DATA_TYPE);
    let valueType = typeMatch ? typeMatch[2] : 'unknown';
    let fn;

    switch (valueType) {
      case 'number': 
        fn = number.serialize
        break;
      case 'bigint':
        fn = number.serialize;
        break;
      case 'smallint':
        fn = number.serialize;
        break;
      case 'int':
        fn = number.serialize; 
        break;
      case 'string':
        fn = string.serialize;
        break;
      case 'date':
        fn = date.serialize;
        break;
      case 'boolean':
        fn = boolean.serialize;
        break;
      default:
        fn = (value) => value; 
    }

    if (typeMatch && typeMatch[1] === 'array:') {
      return (value => Array.isArray(value) ? mapCompact(value, fn) : []);
    }

    return fn;
  }

  /**
    Normalizes data from a client.
    Uses the `rootKey` to find the record(s)

    Returns the record(s) without a rootKey.
    For best results follow with validator.

    @method normalize
    @param {Object}
    @return {Object|Array}
  */
  normalize(rawJSON) {
    if (rawJSON && typeof rawJSON !== 'object') {
      return {};
    }

    let { rootKey, rootKeyPlural } = this;

    let soloRecord = rawJSON[rootKey];
    let manyRecord = rawJSON[rootKeyPlural];

    if (soloRecord && typeof soloRecord === 'object') {
      return soloRecord;
    } else if (manyRecord && Array.isArray(manyRecord)) {
      return manyRecord;
    }
  }

  /**
    *Relies on a validator to have run pre-deserialization.*

    Applies defaults for missing, required fields
    Applies null to missing, non-required fields
    coerce types on supplied fields

    @method deserialize
    @param {Object}
  */
  deserialize(rawJSON) {}
}

module.exports = Serializer;
