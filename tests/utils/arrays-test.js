const requiring = require('requiring').sync;

const {
  camelize
} = requiring('utils/arrays');

const {
  mapCompact
} = requiring('utils/arrays');

const { assert } = require('chai');

describe('utils/array.js', function() {

  describe('#mapCompact', function() {

    it('filters null values', function() {
      let numbers = [1, 2, 3, 4];
      let fn = (value) => {
        return (value === 2) ? null : value * 10;
      }

      let actual = mapCompact(numbers, fn, null);
      let expect = [10, 30, 40];

      assert.deepEqual(actual, expect, 'null values filtered out.');
    });
  });
});
