const requiring   = require('requiring').sync;
const Model       = requiring('model');
const Validator   = requiring('validator');
const { assert }  = require('chai');

describe('validator.js', function() {

  describe('constructing', function() {

    it('errors when no options are provided', function() {
      assert.throws(() => new Validator(), TypeError);
    });

    it('errors when options.model is not provided', function() {
      assert.throws(() => new Validator({}), Error);
    });

    it('errors when options.attrs is not an object', function() {
      let options = {
        attrs: 'foo'
      };

      assert.throws(() => new Validator(options), Error);
    });

    it('does not error when { model, attrs } are passed', function() {
      let options = {
        attrs: {},
        model: new Model({ name: 'person', fields: {} })
      };

      assert.doesNotThrow(() => new Validator(options));
    });
  });

  describe('instance', function() {
    let catOptions = {
      name: 'cats',
      fields: {
        id: {
          primaryKey: true
        }
      }
    };

    describe('#validate', function() {

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
        let model = new Model(options);
        let validator = new Validator({ model });

        let errors = validator.validate();
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
        let model = new Model(options);
        let validator = new Validator({ model });

        let errors = validator.validate({ age: 100000});
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
        let model = new Model(options);
        let validator = new Validator({ model });

        let errors = validator.validate({});
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
        let model = new Model(options);
        let validator = new Validator({ model });

        let errors = validator.validate({ age: 7, color: 'gray' });
        let expect = [];

        assert.deepEqual(errors, expect);
      });

    });

    describe('#validateForType', function() {

      it('#validateString', function() {
        let max = 7;
        let min = 5;

        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let typeValidator = validator.validatorForType('string');

        assert.equal(typeValidator('a string', {}), true, 'recognizes string');

        assert.equal(typeValidator('12345678', { max }), false, 'validates max length');

        assert.equal(typeValidator('123467', { min, max }), true, 'validates min/max length');

        assert.equal(typeValidator('1234', { min }), false, 'validates min length');
      });

      // Can improve on Date validation. 
      // Need to make sure that the Date Format will be allowed in postgres
      it('#validateDate', function() {
        let date = new Date();
        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let typeValidator = validator.validatorForType('date');

        assert.equal(typeValidator(date, {}), true, 'recognizes date type');

        assert.equal(typeValidator('Thu Sep 15 2016 22:26:54 GMT-0400 (EDT)', {}), true, 'recognizes date string');

        assert.equal(typeValidator('i am not a date bro', {}), false, 'fails on non-date');
      });

      it('#validateBigInt', function() {
        let max = 9223372036854776000;
        let min = -9223372036854776000;

        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let typeValidator = validator.validatorForType('bigint');

        assert.equal(typeValidator(max + 1000, {}), false, 'too big');

        assert.equal(typeValidator(min - 1000, {}), false, 'too small');

        assert.equal(typeValidator(461168601800000, {}), true, 'passes on OK value');
      });

      it('#validateSmallInt', function() {
        let max = 32767;
        let min = -32768;

        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let typeValidator = validator.validatorForType('smallint');

        assert.equal(typeValidator(max + 1, {}), false, 'too big');

        assert.equal(typeValidator(min - 1, {}), false, 'too small');

        assert.equal(typeValidator(15000, {}), true, 'passes on OK value');
      });

      it('#validateInt', function() {
        let max = 2147483647;
        let min = -2147483648;

        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let typeValidator = validator.validatorForType('int');

        assert.equal(typeValidator(max + 1, {}), false, 'too big');

        assert.equal(typeValidator(min - 1, {}), false, 'too small');

        assert.equal(typeValidator(1073741823, {}), true, 'passes on OK value');
      });

      it('Returns error string when no validator is found', function() {
        let model = new Model(catOptions);
        let validator = new Validator({ model });

        let typeValidator = validator.validatorForType('magic');

        assert.equal(typeValidator(), `Cannot validate undefined. No validator for magic`);
      });
    });

    describe('#validateField', function() {

      it('returns null on passed validation', function() {
        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let fieldOptions = {
          dataType: 'string'
        };

        let errors = validator.validateField('some string', fieldOptions)
        let expect = null

        assert.equal(errors, null, 'Returns null');
      });

      it('returns null on non-required undefined', function() {
        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let fieldOptions = {
          dataType: 'string'
        };

        let errors = validator.validateField(undefined, fieldOptions)
        let expect = null

        assert.equal(errors, null, 'Returns null');
      });

      it('returns error on required and undefined', function() {
        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let fieldOptions = {
          dataType: 'string',
          required: true
        };

        let errors = validator.validateField(undefined, fieldOptions)
        let expect = 'Field is required with dataType string.'

        assert.deepEqual(errors, expect, 'Returns expected error');
      });

      it('returns error on failed validation', function() {
        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let val = 'a string';
        let fieldOptions = {
          dataType: 'int'
        };

        let errors = validator.validateField(val, fieldOptions)
        let expect = `int validation failed for ${val}`;

        assert.equal(errors, expect, 'Returns expected error');
      });

      it('returns error on unknown validation', function() {
        let model = new Model(catOptions);
        let validator = new Validator({ model });
        let val = 'a string';
        let fieldOptions = {
          dataType: 'magic'
        };

        let error = validator.validateField(val, fieldOptions)
        let expect = `Cannot validate ${val}. No validator for ${fieldOptions.dataType}`

        assert.equal(error, expect, 'Returns expected error');
      });

    });
  });
});
