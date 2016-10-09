const TRUE = /^true$|^t$|^1$/i;

/**
  @class Transform.Boolean
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
    let type = typeof value;

    if (type === 'boolean') {
      return value;
    } else if (type === 'string') {
      return value.match(TRUE) !== null;
    } else if (type === 'number') {
      return value === 1;
    }

    return false;
  },

  /**
    Client -> validate -> deserialize -> DB

    @method deserialize
    @param value The serialized value
    @param fieldOptions Hash of options defined on the Model (defaultValue, dataType, etc.)
    @return The deserialized value
  */
  deserialize(value, fieldOptions) {
    return Boolean(value);
  }
};
