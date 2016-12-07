/**
  @class Transform.Number
*/
module.exports = {
  /**
    Database -> serialize -> Client

    @method serialize
    @param deserialized The serialized value
    @param fieldOptions Hash of options defined on the Model (defaultValue, dataType, etc.)
    @return The serialized value
  */
  serialize(value, fieldOptions) {
    return isNumber(value) ? Number(value) : null;
  },

  /**
    Client -> validate -> deserialize -> DB

    @method deserialize
    @param value The serialized value
    @param fieldOptions Hash of options defined on the Model (defaultValue, dataType, etc.)
    @return The deserialized value
  */
  deserialize(value, fieldOptions) {
    return isNumber(value) ? Number(value) : null;
  }
};

function isNumber(value) {
  return value === value &&
          value !== null &&
          value !== Infinity &&
          value !== -Infinity && 
          !isNaN(value);
}
