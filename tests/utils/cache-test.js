const requiring = require('requiring').sync;

const CACHE = requiring('utils/cache');

const { assert } = require('chai');

describe('utils/cache.js', function() {
  beforeEach(function() {
    CACHE.clear();
  });

  describe('#constructor', function() {
    it('new CacheMap()', function() {
      assert.ok(CACHE instanceof Map, 'cache is instanceof Map');
    });
  });

  it('#has', function() {
    CACHE.set('foo', 'bar');
    assert.equal(CACHE.has('foo'), true, 'has a foo');
  });

  it('#get / #set', function() {
    assert.equal(CACHE.set('foo', 'bar'), 'bar', 'set returns the set value');
    assert.equal(CACHE.get('foo'), 'bar', 'returns value');
  });

});
