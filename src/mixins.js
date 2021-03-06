/**
 *  Krang.deepExtend(destination, source) -> Object
 *  
 *  A "deep" version of `Object.extend`. Performs a recursive deep extension.
 *  
 *  Used within Krang to blend user-set options with the defaults.
**/

Krang.deepExtend = function(destination, source) {
  for (var property in source) {
    if (source[property] && source[property].constructor &&
     source[property].constructor === Object) {
      destination[property] = destination[property] || {};
      arguments.callee(destination[property], source[property]);
    } else {
      destination[property] = source[property];
    }
  }
  return destination;
};


/**
 *  Krang.Mixin
**/
Krang.Mixin = {};

/**
 *  mixin Krang.Mixin.Configurable
 *  
 *  A mixin for hassle-free blending of default options with user-defined
 *  options.
 *  
 *  Expects default options to be defined in a `DEFAULT_OPTIONS` property
 *  on the class itself.
**/
Krang.Mixin.Configurable = {
  /**
   *  Krang.Mixin.Configurable#setOptions(options) -> Object
   *  - options (Object): A set of user-defined options that should override
   *    the defaults.
   *  
   *  Sets options on the class.
  **/
  setOptions: function(options) {
    if (!this.options) {
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

      Krang.deepExtend(this.options, constructor.DEFAULT_OPTIONS || {});
    }
    return Krang.deepExtend(this.options, options || {});
  }
};