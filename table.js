const client  = require('../clients/postgres').client;

const { 
  pluralize,
  underscore,
  forIn
} = require('../services/basic');

class Table {
  constructor(options = {}) {
    let { 
      attributes,
      name,
      columns
    } = options;

    if (typeof name !== 'string') {
      throw new Error('Must include name when instatiating a Table');
    }

    if (typeof columns !== 'object') {
      throw new Error('Must include columns when instantiating a Table');
    }

    if (!Array.isArray(attributes)) {
      throw new Error('`attributes` must be an Array.');
    }

    this.pluralizedName = pluralize(name);

    for(let key in options) {
      this[key] = options[key];
    }
  }

  client() {
    return client();
  }

  /**
    TODO: should iterate over all this.columns, looking for matches
    instead of iterating over the passed in values first.

    Potentially a client could send a POST with thousands of properties,
    and now you're stuck iterating over a thousand properties!

    Returns a normalized record. 
    - Underscored keys. 
    - Filters out any keys that aren't included in the table's columns.
    - Passes each value through normalizeAttr.
    - Provides default values for any keys not passed in.

    @method createRecord
    @param {Object} values Default {}
  */
  createRecord(values) {
    // prefer this over default params cause `undefined` values could get passed
    values = values || {};

    let fn = (key, val) => {
      let normalizedKey = this.normalizeKey(key);

      if (typeof this.columns[normalizedKey] === 'undefined') {
        return [];
      }

      return [
          normalizedKey,
          this.normalizeAttr(normalizedKey, val)
        ];
    };

    let normalized = forIn(values, fn);

    return Object.assign({}, this.columns, normalized);
  }

  normalizeKey(key) {
    return underscore(key);
  }

  normalizeAttr(key, attr) {
    if (typeof attr === 'function') {
      return attr();
    }
    
    return attr;
  }

  /** 
    Accepts Array or Object contains the record(s)
    e.g.,
    ```
    {
      first_name: 'joe',
      last_name: 'bartels'
    }
    ``` 
    or
    ```
    [
      { first_name: 'joe' },
      { first_name: 'nat' }
    ]
    ```
    And returns an object with root key matching name of the table.

    @method serializer
  */
  serialize(data) {
    let isList = Array.isArray(data);
    let attrs = this.attributes;
    let hash = {};

    console.log(`SERIALIZING ${this.name}`);

    if (isList) {
      let idx = data.length;
      let list = [];

      while (idx-- > 0) {
        let item = data[idx];
        if (typeof item === 'object') {
          list.push(selectiveCopy(item, attrs));
        }
      }
      hash[this.pluralizedName] = list;

    } else if (typeof data === 'object') {
      hash[this.name] = selectiveCopy(data, attrs);
    }

    console.log(hash);

    return hash;
  }

  /** 
    Takes payload from request and extracts the record - only choosing
    values that were defined as attributes of the table.

    @method deserialize
  */
  deserialize(hash) {
    if (typeof hash !== 'object') {
      return {};
    };

    let data = hash[this.name];

    if (typeof data !== 'object') {
      return {};
    }

    let ret = selectiveCopy(data, this.attributes);

    console.log(`DESERIALIZING ${this.name}`);
    console.log(ret);

    return ret;
  }

}

function selectiveCopy(obj, attrs) {
  let idx = attrs.length;
  let ret = {};

  while (idx-- > 0) {
    let key = attrs[idx];
    let val = obj[key];

    if (typeof val !== 'undefined') {
      ret[key] = val;
    }
  }

  return ret;
}

module.exports = Table;
