const requiring   = require('requiring').sync;
const Agent       = requiring('agent');
const Model       = requiring('model');
const Serializer  = requiring('serializer');
const Validator   = requiring('validator');

const { assert }  = require('chai');

describe('agent.js', function() {

  describe('constructing', function() {
    let model = new Model({ name: 'dog', fields: {} });
    let serializer = new Serializer({ model });
    let validator = new Validator({ model });
    let repo = {};

    it('errors when no options are provided', function() {
      assert.throws(() => new Agent(), TypeError);
    });

    it('errors when options.serializer is not provided', function() {
      assert.throws(() => new Agent({ validator, repo }), Error);
    });

    it('errors when options.validator is not provided', function() {
      assert.throws(() => new Agent({ serializer, repo }), Error);
    });

    it('errors when options.repo is not provided', function() {
      assert.throws(() => new Agent({ validator, serializer }), Error);
    });

    it('does not error when { serializer, validator, repo } are passed', function() {
      assert.doesNotThrow(() => new Agent({ serializer, validator, repo }));
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
    });
  });
});
