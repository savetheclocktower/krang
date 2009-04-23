Krang.deepExtend = function(destination, source) {
  for (var property in source) {
    var type = typeof source[property], deep = true;
        
    if (type !== 'object' || Object.isElement(source[property]) ||
     (source[property].constructor && source[property].constructor !== Object)) {
       deep = false;
    }
    
    if (deep) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }    
  }
  return destination;
};

Krang.Mixin = {};

Krang.Mixin.Configurable = {
  setOptions: function(options) {
    this.options = {};
    var constructor = this.constructor;
    
    if (constructor.superclass) {
      // Build the inheritance chain.
      var chain = [], klass = constructor;
      while (klass = klass.superclass)
        chain.push(klass);
      chain = chain.reverse();
      
      for (var i = 0, l = chain.length; i < l; i++)
        Krang.deepExtend(this.options, chain[i].DEFAULT_OPTIONS || {});
    }
    
    Krang.deepExtend(this.options, constructor.DEFAULT_OPTIONS);
    return Krang.deepExtend(this.options, options || {});
  }
};