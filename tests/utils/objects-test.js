const requiring = require('requiring').sync;

const {
  camelize
} = requiring('utils/strings');

const {
  mapObj
} = requiring('utils/objects');

const { assert } = require('chai');

describe('utils/objects.js', function() {

  describe('#mapObj', function() {

    it('transforms keys', function() {
      let original = {
        cool_cat: 'larry',
        cool_dog: 'bishop'
      };

      let actual = mapObj(original, (key, value) => [ camelize(key), value ]);
      let expect = {
        coolCat: 'larry',
        coolDog: 'bishop'
      };

      assert.deepEqual(actual, expect, 'keys are camelized');
    });

    it('transforms values', function() {
      let original = {
        larry: 'cool_cat',
        bishop: 'cool_dog'
      };

      let actual = mapObj(original, (key, value) => [ key, camelize(value) ]);
      let expect = {
        larry: 'coolCat',
        bishop: 'coolDog'
      };

      assert.deepEqual(actual, expect, 'values are camelized');
    });

    it('removes undefined keys', function() {
      let original = {
        george: 'clooney',
        rebecca: 'black'
      };

      let actual = mapObj(original, (key, value) => {
        let newKey = (key === 'rebecca') ? undefined : key;
        return [ newKey, value ];
      });
      let expect = {
        george: 'clooney'
      };

      assert.deepEqual(actual, expect, 'undefined keys are not included in mapped Obj.');
    });    
  });
});
