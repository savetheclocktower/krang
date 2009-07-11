/**
 *  class Krang.Colorset
 *  includes Krang.Mixin.Configurable
 *  
 *  A class for managing a family of colors for use in a graph.
**/

Krang.Colorset = Class.create(Krang.Mixin.Configurable, {
  /**
   *  new Krang.Colorset(options)
  **/
  initialize: function(options) {
    this.setOptions(options);
            
    this._length = 0;
    this._index  = 0;
    this._colors = [];
  },
  
  _getColors: function() {
    var opt = this.options;
    
    switch (opt.vary) {
      case 'h': 
        this._colors = this.constructor.varyHue(
         this._length, opt.saturation, opt.lightness);
        break;
      case 's':
        this._colors = this.constructor.varySaturation(
         this._length, opt.hue, opt.lightness);
        break;
      case 'l':
        this._colors = this.constructor.varyLightness(
         this._length, opt.hue, opt.saturation);
        break;
    }  
  },
  
  /**
   *  Krang.Colorset#next() -> String
  **/
  next: function() {
    if (this._index === this._colors.length)
      this._index = 0;
      
    var color = this._colors[this._index++];
    return color.toHexString();    
  },
  
  /**
   *  Krang.Colorset#toString() -> String
  **/
  toString: function() {
    return this.next();
  },
  
  /**
   *  Krang.Colorset#setLength(length) -> undefined
  **/
  setLength: function(length) {
    this._length = length;
    this._index = 0;
    this._getColors();
  }
});


Object.extend(Krang.Colorset, {
  DEFAULT_OPTIONS: {
    vary: 'h',
    
    hue:        0.81,
    saturation: 0.80,
    lightness:  0.70
  },
  
  /**
   *  Krang.Colorset.varyHue(size, saturation, lightness) -> [Krang.Color...]
  **/
  varyHue: function(size, saturation, lightness) {
    var hues = [];
    
    for (var i = 2; i <= (size + 2); i++) {
      hues.push((1 / (size + 2)) * i);
    }
    
    return hues.map( function(h, index) {
      return Krang.Color.fromHSL({ h: h, s: saturation, l: lightness });
    });
  },
  
  /**
   *  Krang.Colorset.varySaturation(size, hue, lightness) -> [Krang.Color...]
  **/
  varySaturation: function(size, hue, lightness) {
    var sats = [];
    
    for (var i = 2; i <= (size + 2); i++) {
      sats.push((1 / (size + 2)) * i);
    }
    
    return sats.map( function(s, index) {
      return Krang.Color.fromHSL({ h: hue, s: s, l: lightness });
    });
  },
  
  /**
   *  Krang.Colorset.varyLightness(size, hue, saturation) -> [Krang.Color...]
  **/
  varyLightness: function(size, hue, saturation) {
    var lums = [];
    
    for (var i = 2; i <= (size + 2); i++) {
      lums.push((1 / (size + 2)) * i);
    }
    
    return lums.map( function(l, index) {
      return Krang.Color.fromHSL({ h: hue, s: saturation, l: l });
    });
  },
  
  /**
   *  Krang.Colorset.interpret(value) -> Krang.Color | String
  **/
  interpret: function(value) {
    if (value && value.next) {
      return value.next();
    }
    
    return value;
  }
});