const requiring   = require('requiring').sync;
const Model       = requiring('model');
const Serializer  = requiring('serializer');
const { assert }  = require('chai');

describe('serializer.js', function() {

  describe('#constructing', function() {

    it('errors when no options are provided', function() {
      assert.throws(() => new Serializer(), TypeError);
    });

    it('errors when options.model is not provided', function() {
      assert.throws(() => new Serializer({}), Error);
    });

    it('errors when options.attrs is not an object', function() {
      let options = {
        attrs: 'foo'
      };

      assert.throws(() => new Serializer(options), Error);
    });

    it('does not error when { model, attrs } are passed', function() {
      let options = {
        attrs: {},
        model: new Model({ name: 'person', fields: {} })
      };

      assert.doesNotThrow(() => new Serializer(options));
    });
  });

  describe('#instance', function() {
    let model = new Model({
      name: 'person',
      fields: {
        id: {
          primaryKey: true,
          dataType: 'bigint'
        },
        name: {
          dataType: 'string'
        },
        age: {
          dataType: 'smallint'
        },
        married: {
          dataType: 'boolean'
        },
        pet_ids: {
          dataType: 'array:int'
        },
        pet_names: {
          dataType: 'array:string'
        },
        born_on: {
          dataType: 'date'
        }
      }
    });

    /**
      - Converts number w/ Type String to Type Number
      - Array of numbers w/ Type Stirng to Type Number
      - Removes non-numbers from Array of expected numbers
      - Serializes a Date Object to proper Date String
      - Ignores properties that are not defined on the serializer
      - Returns blank Array of un-included property of type Array
      - Applies the correct rootKey to returned object
    */
    describe('#serialize', function() {

      it('#serialize - single row', function() {
        let rootKey = 'person';
        
        let serializer = new Serializer({ model, rootKey });

        let data = serializer.serialize({
          id: "100",
          name: "jamie",
          age: "43",
          pet_ids: ["1", "2", "3", "a"],
          born_on: new Date('Sun, 02 Oct 2016 22:01:59 GMT'),
          not: 'a property on the model'
        });

        let expected = { person:
          { id: 100,
            name: 'jamie',
            age: 43,
            married: false,
            pet_ids: [ 1, 2, 3, null ],
            pet_names: [],
            born_on: 'Sun Oct 02 2016 18:01:59 GMT-0400 (EDT)'
          } 
        };

        assert.deepEqual(data, expected, `serializes single row correctly`);
      });

      /**
        - Applies the correct rootKey for response with multiple rows
        - serializes Array of Strings correctly
        - serializes booleans correctly
        - 
      */
      it('#serialize - multiple rows', function() {
        let rootKey = 'person';

        let serializer = new Serializer({ model, rootKey });

        let rowOne = { 
          id: 1,
          name: 'Alice',
          married: true,
          age: '43',
          pet_names: ['max', 'olof']
        };
        let rowTwo = { 
          id: 2,
          name: 'Randy',
          married: false,
          age: '18',
          pet_names: ['']
        };

        let data = serializer.serialize([ rowOne, rowTwo ]);

        let expected = { 
          people: [
            { 
              id: 1, 
              born_on: null, 
              name: 'Alice', 
              age: 43,
              married: true, 
              pet_names: ['max', 'olof'], 
              pet_ids: []
            },
            { id: 2,
              born_on: null,
              name: 'Randy',
              age: 18,
              married: false,
              pet_names: [''],
              pet_ids: []
            }
          ]
        };

        assert.deepEqual(data, expected, `serializes single row correctly`);
      });
    });

    describe('#serializeAttribute', function() {
      // TODO: write apropriate test!
      // TODO: write apropriate test!
      // TODO: write apropriate test!
      // TODO: write apropriate test!
      // TODO: write apropriate test!
      // TODO: write apropriate test!
    });

    /**
      Testing that the correct serializer is returned based on fieldOptions dataType
    */
    describe('#serializerForType', function() {
      const boolean = requiring('transforms/boolean');
      const date    = requiring('transforms/date');
      const number  = requiring('transforms/number');
      const string  = requiring('transforms/string');

      const serializer = new Serializer({ 
        model: new Model({ name: 'car', fields: {} }), 
        rootKey: 'vehicle'
      });

      it('bigint', function() {
        let serialize = serializer.serializerForType('bigint');

        assert.equal(serialize, number.serialize, 'correct serializer for bigint');
      });

      it('smallint', function() {
        let serialize = serializer.serializerForType('smallint');

        assert.equal(serialize, number.serialize, 'correct serializer for smallint');
      });

      it('int', function() {
        let serialize = serializer.serializerForType('int');

        assert.equal(serialize, number.serialize, 'correct serializer for int');
      });

      it('string', function() {
        let serialize = serializer.serializerForType('string');

        assert.equal(serialize, string.serialize, 'correct serializer for string');
      });

      it('date', function() {
        let serialize = serializer.serializerForType('date');

        assert.equal(serialize, date.serialize, 'correct serializer for date');
      });

      it('boolean', function() {
        let serialize = serializer.serializerForType('boolean');

        assert.equal(serialize, boolean.serialize, 'correct serializer for boolean');
      });
    });

    describe('#serializerForType - arrays', function() {
      const boolean = requiring('transforms/boolean');
      const date    = requiring('transforms/date');
      const number  = requiring('transforms/number');
      const string  = requiring('transforms/string');

      const serializer = new Serializer({ 
        model: new Model({ name: 'car', fields: {} }), 
        rootKey: 'vehicle'
      });

      it('array:bigint', function() {
        let serialize = serializer.serializerForType('array:bigint');

        assert.deepEqual(serialize(
          ['1', 2, null,  undefined,  true, false, '0']),
          [1,   2, 0,     null,       1,    0,      0],
          `bigint: serializes array of values as expected`
        );
      });

      it('array:smallint', function() {
        let serialize = serializer.serializerForType('array:smallint');

        assert.deepEqual(serialize(
          ['1', 2, null,  undefined,  true, false, '0']),
          [1,   2, 0,     null,       1,    0,      0],
          `smallint: serializes array of values as expected`
        );
      });

      it('array:int', function() {
        let serialize = serializer.serializerForType('array:int');

        assert.deepEqual(serialize(
          ['1', 2, null,  undefined,  true, false, '0']),
          [1,   2, 0,     null,       1,    0,      0],
          `int: serializes array of values as expected`
        );
      });

      it('array:string', function() {
        let serialize = serializer.serializerForType('array:string');

        assert.deepEqual(serialize(
          [ 123,    'foo', undefined, '', null, true,   false ]),
          [ '123',  'foo', null,      '', null, 'true', 'false' ], 
          `string: serializes array of values as expected`
        );
      });

      it('array:date', function() {
        let serialize = serializer.serializerForType('array:date');
        let newDate = new Date();
        let dateStr = newDate.toString();

        assert.deepEqual(serialize(
          [ newDate, newDate + '',  undefined,  '',   null, true, false ]),
          [ dateStr, dateStr,       null,       null, null, null, null ],
          `date: serializes array of values as expected`
        );
      });

      it('array:boolean', function() {
        let serialize = serializer.serializerForType('array:boolean');

        assert.deepEqual(serialize(
          [ true, false, 'true', '1',   '0',    1,    0,      null,   undefined ]),
          [ true, false, true,    true, false,  true, false,  false,  false ],
          `boolean: serializes array of values as expected`
        );
      });    
    });
  });
});

