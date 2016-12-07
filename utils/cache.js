/**
  Same as `Map` except `set` returns the passed in value.

  @class CacheMap
  @extends Map
*/
class CacheMap extends Map {
  /**
    @method set
  */
  set(key, val) {
    super.set(key, val);

    return val;
  }
}

module.exports = new CacheMap();
