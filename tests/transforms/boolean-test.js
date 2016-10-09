const requiring   = require('requiring').sync;

const boolean     = requiring('transforms/boolean');
const { assert }  = require('chai');

describe('#Transform.Boolean', function() {

  it('#serialize', function() {
    let serialize = boolean.serialize;

    assert.equal(serialize(), false, 'Serializes undefined to false');
    assert.equal(serialize(''), false, 'Serializes blank string to false');
    assert.equal(serialize(null), false, `Serializes null to false`);
    assert.equal(serialize(true), true, `Serializes true to true`);
    assert.equal(serialize(false), false, `Serializes false to false`);
    assert.equal(serialize('true'), true, `Serializes 'true' to true`);
    assert.equal(serialize('false'), false, `Serializes 'false' to false`);

  });

});
