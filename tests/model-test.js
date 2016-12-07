const requiring = require('requiring').sync;
const Model     = requiring('model');

const { assert } = require('chai');

const attr = Model.attr;

describe('model.js', function() {

  describe('#constructing', function() {

    it('errors when no options are provided', function() {
      assert.throws(() => new Model(), Error);
    });

    it('errors when options.name is not provided', function() {
      let options = {
        fields: {}
      };

      assert.throws(() => new Model(options), Error);
    });

    it('errors when options.fields is not provided', function() {
      let options = {
        name: 'dog'
      };

      assert.throws(() => new Model(options), Error);
    });
  });

  describe('class methods', function() {

    it('#attr', function() {
      let options = {
        name: 'shoe',
        fields: {
          id: attr('int', { primaryKey: true }),
          brand: attr('string'),
          size: attr('number', { defaultValue: 10, min: 3, max: 14 }),
        }
      };

      let expect = {
        id: {
          dataType: 'int',
          primaryKey: true
        },
        brand: {
          dataType: 'string'
        },
        size: {
          dataType: 'number',
          defaultValue: 10,
          min: 3,
          max: 14
        }
      };

      let model = new Model(options);

      assert.deepEqual(model.fields, expect, 'attr() generates ');
    });
  });

  describe('#instance', function() {

    let catOptions = {
      name: 'cat',
      fields: {
        id: {
          primaryKey: true
        }
      }
    };

    it('#name', function() {
      let options = Object.assign(
        {},
        catOptions, 
        { fields: { color: {}, weight: {}, age: {} } }
      );
      let cat = new Model(options);

      assert.equal(cat.name, 'cat', 'model.name is correct');
    });

    it('has a generated fieldsList', function() {
      let options = Object.assign(
        {}, 
        catOptions, 
        { fields: { color: {}, weight: {}, age: {} } }
      );
      let cat = new Model(options);

      assert.deepEqual(cat.fieldsList, ['color', 'weight', 'age']);
    });

    it('has a generated primaryKey', function() {
      let cat = new Model(catOptions);

      assert.deepEqual(cat.primaryKey, { name: 'id', opts: { primaryKey: true } });
    });

    describe('#createRecord', function() {

      it ('includes all defined fields', function() {
        let fields = Object.assign(
          { color: {}, weight: {}, age: {} },
          catOptions.fields
        );

        let options = Object.assign({}, catOptions, { fields });
        let cat = new Model(options);

        let record = cat.createRecord({
          id: 'abcdefg',
          color: 'blue',
          weight: 12,
          age: 7
        });

        let expect = {
          id: 'abcdefg',
          color: 'blue',
          weight: 12,
          age: 7
        };

        assert.deepEqual(record.data, expect);
      });

      it ('filters out non-defined fields', function() {
        let fields = {
          color: {}
        };

        let options = Object.assign({}, catOptions, { fields });
        let cat = new Model(options);

        let record = cat.createRecord({
          color: 'blue',
          favorite_toy: 'laser'
        });

        let expect = { color: 'blue' };

        assert.deepEqual(record.data, expect);
      });

      it ('applies defaultValue to undefined ones', function() {
        let fields = {
          color: {
            defaultValue: 'red'
          },
          age: {
            defaultValue() { return 5; }
          }
        };

        let options = Object.assign({}, catOptions, { fields });
        let cat = new Model(options);

        let record = cat.createRecord();

        let expect = { color: 'red', age: 5 };

        assert.deepEqual(record.data, expect);
      });

    });

  });
});
