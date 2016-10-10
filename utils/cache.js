class CacheMap extends Map {
  set(key, val) {
    super.set(key, val);

    return val;
  }
}

module.exports = new CacheMap();
