/**
 *  class Krang.LayerSet < Krang.OrderedHash
 *  
 *  An ordered key/value collection where the keys are layer names and the
 *  values are Raphael element sets. Used to organize shapes into sets and
 *  determine the drawing order/z-depth of each group.
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
  
  /**
   *  new Krang.LayerSet(R[, object])
   *  - R (Raphael): A Raphael paper object.
   *  
   *  Instantiate a layer set.
  **/
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