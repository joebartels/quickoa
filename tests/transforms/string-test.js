const requiring   = require('requiring').sync;

const string      = requiring('transforms/string');
const { assert }  = require('chai');

describe('#Transform.String', function() {

  it('#serialize', function() {
    let serialize = string.serialize;

    assert.equal(serialize(123), '123', 'Serializes number to a string');
    assert.equal(serialize('foo'), 'foo', 'Serializes string to string');
    assert.equal(serialize(), null, 'Serializes undefined to null');
    assert.equal(serialize(''), '', 'Serializes blank string to blank string');
    assert.equal(serialize(null), null, `Serializes null to 'null'`);
    assert.equal(serialize(true), 'true', `Serializes true to 'true'`);
    assert.equal(serialize(false), 'false', `Serializes false to 'false'`);
  });

});
