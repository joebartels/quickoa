const requiring   = require('requiring').sync;

const Agent       = requiring('agent');
const Model       = requiring('model');
const Serializer  = requiring('serializer');
const Validator   = requiring('validator');

const Bluebird    = require('bluebird');
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
    let model = new Model({ name: 'dog', fields: {} });

    it('assigns correct instance properties', function() {
      let serializer = new Serializer({ model });
      let validator = new Validator({ model });
      let repo = {};

      let agent = new Agent({ serializer, validator, repo });

      assert.equal(agent.serializer, serializer, 'serializer added.');
      assert.equal(agent.validator, validator, 'validator added.');
      assert.equal(agent.repo, repo, 'repo added.');
    });

    /**
      Tests that `serialize`, `normalize`, `deserialize` methods get proxied 
      to the expected methods on the passed in `Serializer`. And that `validate`
      gets proxied to the `validate` method on the passed in `Validator`.

    */
    it('surfaces correct methods', function() {
      let serializer = new Serializer({ model });
      let validator = new Validator({ model });
      let repo = {};

      serializer.serialize = (val) => val;
      serializer.normalize = (val) => val;
      serializer.deserialize = (val) => val;

      validator.validate = (val) => val;

      let agent = new Agent({ serializer, validator, repo });

      assert.equal(agent.serialize(1), 1, 'serialize()');
      assert.equal(agent.normalize(2), 2, 'normalize()');
      assert.equal(agent.deserialize(3), 3, 'deserialize()');
      assert.equal(agent.validate(4), 4, 'validate()');

    });

    /**
      Nearly a full integration test with DB Query + Serialization
    */
    it('#db - success', function() {
      let name = 'goat';
      let fields = {
        id: { dataType: 'int' },
        color: { dataType: 'string' }
      };

      let model = new Model({ name, fields });
      let serializer = new Serializer({ model });
      let validator = new Validator({ model });

      let repo = {
        getGoat(id) { 
          if (id === 1) {
            return Bluebird.resolve({ id: 1, color: 'white', foo: 'bar' });
          }

          return Bluebird.reject('Annh');
        }
      };

      let expect = {
        goat: {
          id: 1,
          color: 'white'
        }
      };

      let agent = new Agent({ serializer, validator, repo });

      return agent.query('getGoat', 1)
      .then(result => assert.deepEqual(result, expect), `agent.query('doStuff')`);
    });

    /**
      Nearly a full integration test with DB Query + Serialization
    */
    it('#db - failure', function() {
      let name = 'goat';
      let fields = {};

      let model = new Model({ name, fields });
      let serializer = new Serializer({ model });
      let validator = new Validator({ model });

      let error = 'No database connection';
      let repo = {
        getGoat(id) { 
          if (id === 1) {
            return Bluebird.reject(error);
          }

          return Bluebird.resolve();
        }
      };

      let agent = new Agent({ serializer, validator, repo });

      return agent.query('getGoat', 1)
      .catch(result => {
        assert.equal(result, error, `query method reject`);
      });
    });

    /**
      Nearly a full integration test with DB Query + Serialization
    */
    it('#db - no method found failure', function() {
      let name = 'goat';
      let fields = {};

      let model = new Model({ name, fields });
      let serializer = new Serializer({ model });
      let validator = new Validator({ model });

      let error = new Error('No query found for getGoat.');
      let repo = {};

      let agent = new Agent({ serializer, validator, repo });

      return agent.query('getGoat', 1)
      .catch(result => {
        assert.ok(result instanceof Error, 'Error is caught.');
        assert.equal(result.message, error.message, 'correct error message');
      });
    });

    it('#raw - success', function() {
      let name = 'goat';
      let fields = {
        id: { dataType: 'int' },
        color: { dataType: 'string' }
      };

      let model = new Model({ name, fields });
      let serializer = new Serializer({ model });
      let validator = new Validator({ model });

      let repo = {
        getGoat(id) { 
          if (id === 1) {
            return Bluebird.resolve({ id: 1, color: 'white', foo: 'bar' });
          }

          return Bluebird.reject('annh');
        }
      };

      let expect = {
        goat: {
          id: 1,
          color: 'white'
        }
      };

      let agent = new Agent({ serializer, validator, repo });

      return agent.query('getGoat', 1)
      .then(result => {
        assert.deepEqual(result, expect, 'raw response is expected');
      });
    });

    it('#raw - no method found failure', function() {
      let name = 'goat';
      let fields = {};

      let model = new Model({ name, fields });
      let serializer = new Serializer({ model });
      let validator = new Validator({ model });

      let error = new Error('No query found for getGoat.');
      let repo = {};

      let agent = new Agent({ serializer, validator, repo });

      return agent.query('getGoat', 1)
      .catch(result => {
        assert.ok(result instanceof Error, 'Error is caught.');
        assert.equal(result.message, error.message, 'correct error message');
      });
    });

  });
});
