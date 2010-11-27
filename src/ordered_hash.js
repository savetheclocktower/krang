/**
 *  class Krang.OrderedHash
 *  
 *  A Hash with significant key order. Keys can also be moved into arbitrary
 *  order.
**/
Krang.OrderedHash = Class.create(Hash, {
  /**
   *  new Krang.OrderedHash(object)
   *  
   *  Create an ordered hash.
  **/
  initialize: function($super, object) {
    $super(object);    
    this._keys = [];
    for (var key in this._object) {
      this._keys.push(key);
    }
  },
  
  set: function($super, key, value) {
    if (!this._keys.include(key))
      this._keys.push(key);
    return $super(key, value);
  },
  
  unset: function($super, key) {
    this._keys = this._keys.without(key);
    return $super(key);
  },
  
  keys: function() {
    return this._keys;
  },
  
  toObject: function() {
    return this.inject({}, function(obj, pair) {
      obj[pair.key] = pair.value;
    });
  },
  
  // By redefining `_each`, we make it so that all `Enumerable` methods run
  // in an ordered fashion.
  _each: function(iterator) {
    for (var i = 0, key; key = this._keys[i]; i++) {
      var value = this._object[key], pair = [key, value];
      pair.key = key; pair.value = value;
      iterator(pair);
    }
  },
  
  inspect: function() {
    return '#<Krang.OrderedHash:{' + this.map(function(pair) {
      return pair.map(Object.inspect).join(': ');
    }).join(', ') + '}>';
  },
  
  /**
   *  Krang.OrderedHash#setKeyOrder(keys) -> undefined
   *  - keys (Array): An array containing each key name exactly once.
   *  
   *  Arrange the hash's existing keys in an explicit order.
   *  
   *  Will throw an error if keys do not match — e.g., if any key is omitted
   *  or repeated.
  **/
  setKeyOrder: function(keys) {
    // Ensure same number of keys.
    if (keys.length !== this._keys.length) {
      throw new Krang.Error("Key length mismatch.");
    }
    
    // Ensure all key names match up.
    for (var i = 0, key; key = this._keys[i]; i++) {
      if (!keys.include(key)) {
        throw new Krang.Error("Key mismatch.");
      }
    }
    
    this._keys = keys;
  },
  
  /**
   *  Krang.OrderedHash#insertBefore(key, beforeKey) -> undefined
   *  
   *  Inserts the key _before_ the specified key.
  **/
  insertBefore: function(key, beforeKey) {
    if (!this._keys.include(key) || !this._keys.include(beforeKey)) {
      throw new Krang.Error("One of those keys doesn't exist in this " +
       "hash. Add to the hash first, then rearrange keys.");
    }    

    this._keys.splice(this._keys.indexOf(key), 1);
    this._keys.splice(this._keys.indexOf(beforeKey), 0, key);
  },
  
  /**
   *  Krang.OrderedHash#insertBefore(key, beforeKey) -> undefined
   *  
   *  Inserts the key _after_ the specified key.
  **/
  insertAfter: function(key, afterKey) {
    if (!this._keys.include(key) || !this._keys.include(afterKey)) {
      throw new Krang.Error("One of those keys doesn't exist in this " +
       "hash. Add to the hash first, then rearrange keys.");
    }
    
    this._keys.splice(this._keys.indexOf(key), 1);
    this._keys.splice(this._keys.indexOf(afterKey), 1, afterKey, key);
  },

  /**
   *  Krang.OrderedHash#moveToFirst(key) -> undefined
   *  
   *  Makes the key first in the key order.
  **/  
  moveToFirst: function(key) {
    this.insertBefore(key, this._keys.first());
  },

  /**
   *  Krang.OrderedHash#moveToLast(key) -> undefined
   *  
   *  Makes the key last in the key order.
  **/  
  moveToLast: function(key) {
    this.insertBefore(key, this._keys.last());
  }
});