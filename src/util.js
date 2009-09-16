

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

Raphael.fn.drawGrid = function(x, y, w, h, wv, hv, color) {
  color = color || "#000";
  var path = ["M", x, y, "L", x + w, y, x + w, y + h, x, y + h, x, y],
   rowHeight = h / hv,
   columnWidth = w / wv;
  for (var i = 1; i < hv; i++) {
    path = path.concat(["M", x, y + i * rowHeight, "L", x + w, y + i * rowHeight]);
  }
  for (var i = 1; i < wv; i++) {
    path = path.concat(["M", x + i * columnWidth, y, "L", x + i * columnWidth, y + h]);
  }
  return this.path(path.join(",")).attr({ stroke: color, "stroke-width": 1 });
};

// Redefine Raphael's `remove` function so that it doesn't cause
// spurious errors in Safari.
Raphael.el.remove = function() {
  var parentNode = this.node.parentNode;
  if (parentNode) parentNode.removeChild(this.node);
};