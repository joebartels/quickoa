const Record = require ('../record.js');
const { assert } = require('chai');

describe('record.js', function() {

  describe('#constructing', function() {

    it('errors when no model is passed', function() {
      assert.throws(() => new Record(), TypeError);
    });

    it('errors when no props are passed', function() {
      let model = {};

      assert.throws(() => new Record(model, 'some string'), TypeError);
    });

    it('assigns model to the record', function() {
      let model = {};
      let record = new Record(model);

      assert.equal(record.model, model);
    });    

    it('assigns props to the record', function() {
      let model = {};
      let props = {
        year: 2016,
        make: 'Subaru'
      };

      let record = new Record(model, props);
      let {
        year,
        make
      } = record.data;

      assert.equal(record.model, model);
      assert.equal(year, props.year);
      assert.equal(make, props.make);
    });    

  });

});
