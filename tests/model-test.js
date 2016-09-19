const Model = require ('../model');
const { assert } = require('chai');

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

  describe('#instance', function() {

    let catOptions = {
      name: 'cats',
      fields: {
        id: {
          primaryKey: true
        }
      }
    };

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

      it ('filters out undefined fields', function() {
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

    describe("#validate", function() {

      it('returns [error] when required field is missing', function() {
        let fields = Object.assign(
          {
            color: {
              required: true,
              dataType: 'string'
            }
          },
          catOptions.fields
        );

        let options = Object.assign({}, catOptions, { fields });
        let cat = new Model(options);

        let errors = cat.validate();
        let expect = [
          {
            detail: 'Field is required with dataType string.',
            propertyName: 'color',
            propertyValue: undefined
          }
        ];

        assert.deepEqual(errors, expect);
      });

      it('returns [error] when validation fails', function() {
        let fields = Object.assign(
          {
            age: {
              dataType: 'smallint'
            }
          },
          catOptions.fields
        );

        let options = Object.assign({}, catOptions, { fields });
        let cat = new Model(options);

        let errors = cat.validate({ age: 100000});
        let expect = [
          { 
            detail: 'smallint validation failed for 100000',
            propertyName: 'age',
            propertyValue: 100000
          }
        ];

        assert.deepEqual(errors, expect);
      });  

      it('returns [] when non-required field is missing', function() {
        let fields = Object.assign(
          {}, 
          catOptions.fields, 
          {
            color: {
              required: false,
              dataType: 'string'
            }
          }
        );

        let options = Object.assign({}, catOptions, { fields });
        let cat = new Model(options);

        let errors = cat.validate({});
        let expect = [];

        assert.deepEqual(errors, expect);
      });    

      it('returns [] when validation passes', function() {
        let fields = Object.assign(
          {
            age: {
              required: false,
              dataType: 'smallint'
            },
            color: {
              required: true,
              dataType: 'string'
            }
          },
          catOptions.fields
        );

        let options = Object.assign({}, catOptions, { fields });
        let cat = new Model(options);

        let errors = cat.validate({ age: 7, color: 'gray' });
        let expect = [];

        assert.deepEqual(errors, expect);
      });

    });

    describe('#validateFor', function() {

      it('#validateString', function() {
        let max = 7;
        let min = 5;

        let cat = new Model(catOptions);
        let validator = cat.validatorFor('string');

        assert.equal(validator('a string', {}), true, 'recognizes string');

        assert.equal(validator('12345678', { max }), false, 'validates max length');

        assert.equal(validator('123467', { min, max }), true, 'validates min/max length');

        assert.equal(validator('1234', { min }), false, 'validates min length');
      });

      // Can improve on Date validation. 
      // Need to make sure that the Date Format will be allowed in postgres
      it('#validateDate', function() {
        let date = new Date();
        let cat = new Model(catOptions);
        let validator = cat.validatorFor('date');

        assert.equal(validator(date, {}), true, 'recognizes date type');

        assert.equal(validator('Thu Sep 15 2016 22:26:54 GMT-0400 (EDT)', {}), true, 'recognizes date string');

        assert.equal(validator('i am not a date bro', {}), false, 'fails on non-date');
      });

      it('#validateBigInt', function() {
        let max = 9223372036854776000;
        let min = -9223372036854776000;

        let cat = new Model(catOptions);
        let validator = cat.validatorFor('bigint');

        assert.equal(validator(max + 1000, {}), false, 'too big');

        assert.equal(validator(min - 1000, {}), false, 'too small');

        assert.equal(validator(461168601800000, {}), true, 'fails on non-date');
      });

      it('#validateSmallInt', function() {
        let max = 32767;
        let min = -32768;

        let cat = new Model(catOptions);
        let validator = cat.validatorFor('smallint');

        assert.equal(validator(max + 1, {}), false, 'too big');

        assert.equal(validator(min - 1, {}), false, 'too small');

        assert.equal(validator(15000, {}), true, 'fails on non-date');
      });

      it('#validateInt', function() {
        let max = 2147483647;
        let min = -2147483648;

        let cat = new Model(catOptions);
        let validator = cat.validatorFor('int');

        assert.equal(validator(max + 1, {}), false, 'too big');

        assert.equal(validator(min - 1, {}), false, 'too small');

        assert.equal(validator(1073741823, {}), true, 'fails on non-date');
      });

      it('Returns error string when no validator is found', function() {
        let cat = new Model(catOptions);
        let validator = cat.validatorFor('magic');

        assert.equal(validator(), 'No validator for magic');
      });
    });

    describe('#validateField', function() {

      it('returns null on passed validation', function() {
        let cat = new Model(catOptions);
        let fieldOptions = {
          dataType: 'string'
        };

        let errors = cat.validateField('some string', fieldOptions)
        let expect = null

        assert.equal(errors, null, 'Returns null');
      });

      it('returns null on non-required undefined', function() {
        let cat = new Model(catOptions);
        let fieldOptions = {
          dataType: 'string'
        };

        let errors = cat.validateField(undefined, fieldOptions)
        let expect = null

        assert.equal(errors, null, 'Returns null');
      });

      it('returns error on required and undefined', function() {
        let cat = new Model(catOptions);
        let fieldOptions = {
          dataType: 'string',
          required: true
        };

        let errors = cat.validateField(undefined, fieldOptions)
        let expect = 'Field is required with dataType string.'

        assert.deepEqual(errors, expect, 'Returns expected error');
      });

      it('returns error on failed validation', function() {
        let cat = new Model(catOptions);
        let val = 'a string';
        let fieldOptions = {
          dataType: 'int'
        };

        let errors = cat.validateField(val, fieldOptions)
        let expect = `int validation failed for ${val}`;

        assert.equal(errors, expect, 'Returns expected error');
      });

      it('returns error on unknown validation', function() {
        let cat = new Model(catOptions);
        let val = 'a string';
        let fieldOptions = {
          dataType: 'magic'
        };

        let error = cat.validateField(val, fieldOptions)
        let expect = `No validator for ${fieldOptions.dataType}`;

        assert.equal(error, expect, 'Returns expected error');
      });

    });
  });
});
