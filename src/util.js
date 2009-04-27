

(function() {
  var _uid = 0;
  
  var DATA = {};
  
  function _getHash(node) {
    if (Object.isUndefined(node._krangUID)) {
      node._krangUID = _uid++;
    }
    
    var hash = DATA[node._krangUID];
    if (!hash) hash = (DATA[node._krangUID] = $H());
    
    return hash;
  }

  window.Krang.Data = {
    store: function(node, key, value) {
      if (typeof key === 'object' && arguments.length === 2) {
        var object = key;
      }
    
      var hash = _getHash(node);
      
      if (object) {
        hash.update(object);
      } else {
        hash.set(key, value);
      }
    },
    
    retrieve: function(node, key, defaultValue) {
      var hash = _getHash(node), value = hash.get(key);
            
      if (Object.isUndefined(value)) {
        hash.set(key, defaultValue);
        return defaultValue;
      }
      
      return value;
    }
  };
})();
