
/**
  @class Record
*/
class Record {
  constructor(model, props) {
    props = props || {};

    if (typeof model !== 'object') {
      throw new TypeError(`model: ${model} is must be an object of Class::Model`);
    }

    if (typeof props !== 'object') {
      throw new TypeError(`props: ${props} must an object.`);
    }

    this.model = model;
    this.data = {};

    for (let key in props) {
      this.data[key] = props[key];
    }
  }
}

module.exports = Record;
