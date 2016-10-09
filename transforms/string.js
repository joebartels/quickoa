/**
  @class Transform.String
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
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'undefined' || value === null) {
      return null;
    }

    return String(value);
  },

  /**
    Client -> validate -> deserialize -> DB

    @method deserialize
    @param value The serialized value
    @param fieldOptions Hash of options defined on the Model (defaultValue, dataType, etc.)
    @return The deserialized value
  */
  deserialize(value, fieldOptions) {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'undefined' || value === null) {
      return null;
    }

    return String(value);
  }
};
