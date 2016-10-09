/**
  @class Transform.Date
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
    let date = Date.parse(value);

    return isNaN(date) ? null : new Date(date).toString();    
  },

  /**
    Client -> validate -> deserialize -> DB

    @method deserialize
    @param value The serialized value
    @param fieldOptions Hash of options defined on the Model (defaultValue, dataType, etc.)
    @return The deserialized value
  */
  deserialize(value, fieldOptions) {
    let type = typeof value;

    if (type === "string") {
      return new Date(parseDate(value));
    } else if (type === "number") {
      return new Date(value);
    } else if (value === null || value === undefined) {
      return value;
    } else {
      return null;
    }
  }
};
