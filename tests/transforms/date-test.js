const requiring   = require('requiring').sync;

const date        = requiring('transforms/date');
const { assert }  = require('chai');

describe('#Transform.Date', function() {

  it('#serialize', function() {
    let serialize = date.serialize;
    let newDate = new Date();
    let dateStr = newDate.toString();

    assert.equal(serialize(newDate), dateStr, 'Serializes date to a string');
    assert.equal(serialize(newDate + ''), dateStr, 'Serializes date string to date string');
    assert.equal(serialize(), null, 'Serializes undefined to null');
    assert.equal(serialize(''), null, 'Serializes blank string to null');
    assert.equal(serialize(null), null, `Serializes null to 'null'`);
    assert.equal(serialize(true), null, `Serializes true to null`);
    assert.equal(serialize(false), null, `Serializes false to null`);

  });

});
