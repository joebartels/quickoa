const requiring = require('requiring').sync;

const CACHE = requiring('utils/cache');

const {
  camelize,
  pluralize
} = requiring('utils/strings');

const {
  mapObj
} = requiring('utils/objects');

const { assert } = require('chai');

describe('utils/strings.js', function() {

  beforeEach(function() {
    CACHE.clear();
  });

  describe('#camelize', function() {

    it('works on dasherized and underscored strings', function() {
      assert.equal(camelize('cool-hand-luke'), 'coolHandLuke', 'cool-hand-luke');
      assert.equal(camelize('cool_hand_luke'), 'coolHandLuke', 'cool_hand_luke');
    });

    it(`cache doesn't break stuff`, function() {
      assert.equal(camelize('cool-hand-luke'), 'coolHandLuke', 'cool-hand-luke');
      assert.equal(camelize('cool-hand-luke'), 'coolHandLuke', 'cool-hand-luke');
      assert.equal(camelize('cool-hand-luke'), 'coolHandLuke', 'cool-hand-luke');
    });

    it(`cache works`, function() {
      let key = 'smokey_the_bear';
      let actual = camelize(key);
      let expect = 'smokeyTheBear';

      assert.equal(actual, expect, 'smokey_the_bear');
      assert.equal(CACHE.get(key), expect, `value cached`);
    });

  });

  describe('#pluralize', function() {

    it('works', function() {
      assert.equal(pluralize('person'), 'people', 'person -> people');
      assert.equal(pluralize('dog'), 'dogs', 'dog -> dogs');
    });

    it(`cache doesn't break stuff`, function() {
      assert.equal(pluralize('person'), 'people', 'person -> people');
      assert.equal(pluralize('dog'), 'dogs', 'dog -> dogs');
    });

    it(`cache works`, function() {
      let key = 'beer';
      let actual = pluralize(key);
      let expect = 'beers';
      
      assert.equal(actual, expect, 'beer');
      assert.equal(CACHE.get(key), expect, `value cached`);
    });

  });
});
