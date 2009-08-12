/**
 *  class Krang.LayerSet < Krang.OrderedHash
**/
Krang.LayerSet = Class.create(Krang.OrderedHash, {
  _rearrangeLayers: function() {
    var keys = this._keys.reverse();
    if (keys.length === 0) return;
    
    //var previousItem = this.get(keys[0]);
    for (var i = 0, key, item; key = keys[i]; i++) {
      item = this.get(key);
      item.toFront();
      // item.insertBefore(previousItem);
      // previousItem = item;
    }
  },
  
  initialize: function($super, R, object) {
    $super(object);
    this.R = R;
    this._rearrangeLayers();
  },
  
  set: function($super, key, value) {
    var ret = $super(key, value);
    this._rearrangeLayers();
    return ret;
  },
  
  setKeyOrder: function($super, keys) {
    var ret = $super(keys);
    this._rearrangeLayers();
    return ret;
  },
  
  insertBeforeKey: function($super, key, beforeKey) {
    var ret = $super(key, beforeKey);
    this._rearrangeLayers();
    return ret;
  },
  
  bringToFront: function(item) {
    var key = this.index(item);
    if (!key) return false;    
    this.insertBeforeKey(key, this._keys[0]);
    return this;
  }
});