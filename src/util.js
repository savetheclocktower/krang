

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
    /**
     *  Krang.Data.store(node, key, value) -> undefined
     *  
     *  Store arbitrary data with a Raphael drawing node.
    **/
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
    
    /**
     *  Krang.Data.retrieve(node, key, defaultValue) -> ?
     *  
     *  Retrieve arbitrary data that has been associated with a Raphael
     *  drawing node.
    **/
    retrieve: function(node, key, defaultValue) {
      var hash = _getHash(node), value = hash.get(key);
            
      if (Object.isUndefined(value)) {
        hash.set(key, defaultValue);
        return defaultValue;
      }
      
      return value;
    },
    
    getStorage: function(node) {
      return _getHash(node);
    }
  };
  
  // Extend these methods onto Raphael elements.
  for (var methodName in Krang.Data) {
    Raphael.el[methodName] = Krang.Data[methodName].methodize();
  }
})();

// Redefine Raphael's `remove` function so that it doesn't cause
// spurious errors in Safari.
Raphael.el.remove = function() {
  var parentNode = this.node.parentNode;
  if (parentNode) parentNode.removeChild(this.node);
};