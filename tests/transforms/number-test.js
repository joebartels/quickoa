const requiring   = require('requiring').sync;

const number      = requiring('transforms/number');
const { assert }  = require('chai');

describe('#Transform.Number', function() {

  it('#serialize', function() {
    let serialize = number.serialize;

    assert.equal(serialize('123'), 123, 'Serializes string to number');
    assert.equal(serialize(456), 456, 'Serializes number to number');
    assert.equal(serialize(), null, 'Serializes undefined to null');
    assert.equal(serialize('abc'), null, 'Serializes non-number to null');

    // arguable serializations...
    assert.equal(serialize(null), 0, 'Serializes null to 0');
    assert.equal(serialize(true), 1, 'Serializes true to 1');
    assert.equal(serialize(false), 0, 'Serializes false to 0');

  });

});
