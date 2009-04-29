

Krang.Colorset = Class.create(Krang.Mixin.Configurable, {
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
  
  next: function() {
    if (this._index === this._colors.length)
      this._index = 0;
      
    var color = this._colors[this._index++];
    return color.toHexString();    
  },
  
  toString: function() {
    return this.next();
  },
  
  setLength: function(length) {
    this._length = length;
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
  
  varyHue: function(size, saturation, lightness) {
    var hues = [];
    
    for (var i = 2; i <= (size + 2); i++) {
      hues.push((1 / (size + 2)) * i);
    }
    
    return hues.map( function(h, index) {
      return Krang.Color.fromHSL({ h: h, s: saturation, l: lightness });
    });
  },
  
  varySaturation: function(size, hue, lightness) {
    var sats = [];
    
    for (var i = 2; i <= (size + 2); i++) {
      sats.push((1 / (size + 2)) * i);
    }
    
    return sats.map( function(s, index) {
      return Krang.Color.fromHSL({ h: hue, s: s, l: lightness });
    });
  },
  
  varyLightness: function(size, hue, saturation) {
    var lums = [];
    
    for (var i = 2; i <= (size + 2); i++) {
      lums.push((1 / (size + 2)) * i);
    }
    
    return lums.map( function(l, index) {
      return Krang.Color.fromHSL({ h: hue, s: saturation, l: l });
    });
  }
});