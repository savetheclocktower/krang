/* 
 * Krang.Color is a port of MochiKit.Color.
 * Copyright 2005 Bob Ippolito; licensed under the MIT license.
 */

(function() {
  
  function clamp(v, scale) {
    v *= scale;
    
    if (v < 0)          return 0;
    else if (v > scale) return scale;
    else                return v;
  }
  
  function hslValue(n1, n2, hue) {
    if      (hue > 6.0) hue -= 6.0;
    else if (hue < 0.0) hue += 6.0;
    
    var val;
    if      (hue < 1.0) val = n1 + (n2 - n1) * hue;
    else if (hue < 3.0) val = n2;
    else if (hue < 4.0) val = n1 + (n2 - n1) * (4.0 - hue);
    else                val = n1;
    
    return val;
  }
  

  window.Krang.Color = Class.create({
    initialize: function(r, g, b, a) {
      a = Object.isUndefined(a) ? 1.0 : a;    
      this.rgb = { r: r, g: g, b: b, a: a };
    },

    toRGBString: function() {
      var c = this.rgb;
      var str = this._rgbString;
      
      if (!str) {
        var mid = [
          clamp(c.r, 255).toFixed(0),
          clamp(c.g, 255).toFixed(0),
          clamp(c.b, 255).toFixed(0)
        ].join(',');
        
        if (c.a !== 1) {
          str = "rgba(" + mid + "," + c.a + ")";
        } else {
          str = "rgb("  + mid + ")";
        }
        this._rgbString = str;
      }
      
      return str;
    },
    
    asRGB: function() {
      return Object.clone(this.rgb);
    },
    
    toHexString: function() {
      var c = this.rgb, str = this._hexString;
      
      if (!str) {
        str = "#" +
         Number(clamp(c.r, 255).toFixed(0)).toColorPart() +
         Number(clamp(c.g, 255).toFixed(0)).toColorPart() +
         Number(clamp(c.b, 255).toFixed(0)).toColorPart();
         
        this._hexString = str;
      }
      
      return str;
    },
    
    asHSV: function() {
      if (!this.hsv) {
        this.hsv = Krang.Color.rgbToHSV(this.rgb);
      }
      return Object.clone(this.hsv);
    },
    
    asHSL: function() {
      if (!this.hsl) {
        this.hsl = Krang.Color.rgbToHSL(this.rgb);
      }
      return Object.clone(this.hsl);
    },
    
    toString: function() {
      return this.toRGBString();
    },
    
    
    
    colorWithAlpha: function(alpha) {
      var rgb = this.rgb;
      return Krang.Color.fromRGB(rgb.r, rgb.g, rgb.b, alpha);
    },
    
    colorWithHue: function(hue) {
      var hsl = this.asHSL();
      hsl.h = hue;
      return Krang.Color.fromHSL(hsl);
    },
    
    colorWithSaturation: function(saturation) {
      var hsl = this.asHSL();
      hsl.s = saturation;
      return Krang.Color.fromHSL(hsl);
    },
    
    colorWithLightness: function(lightness) {
      var hsl = this.asHSL();
      hsl.l = lightness;
      return Krang.Color.fromHSL(hsl);
    },
    
    darkerBy: function(level) {
      var hsl = this.asHSL();
      hsl.l = Math.max(hsl.l - level, 0);
      return Krang.Color.fromHSL(hsl);
    },
    
    lighterBy: function(level) {
      var hsl = this.asHSL();
      hsl.l = Math.min(hsl.l + level, 1);
      return Krang.Color.fromHSL(hsl);
    },
    
    isLight: function() {
      return this.asHSL().b > 0.5;
    },
    
    isDark: function() {
      return !this.isLight();
    }
    
    
  });
  
  
  Object.extend(Krang.Color, {
    
    fromRGB: function(r, g, b, a) {
      if (arguments.length === 1) {
        var rgb = r;
        r = rgb.r, g = rgb.g, b = rgb.b, a = rgb.a;
      }
      
      return new Krang.Color(r, g, b, a);
    },
    
    fromHSL: function(h, s, l, a) {
      return this.fromRGB(this.hslToRGB.apply(this, arguments));
    },
    
    fromHSV: function(h, s, v, a) {
      return this.fromRGB(this.hsvToRGB.apply(this, arguments));
    },
    
    fromName: function(name) {
      
    },
    
    fromString: function(colorString) {
      if (colorString.startsWith('rgb')) {
        return this.fromRGBString(colorString);
      } else if (colorString.startsWith('hsl')) {
        return this.fromHSLString(colorString);
      } else if (colorString.startsWith('#')) {
        return this.fromHexString(colorString);
      }
      
      return this.fromName(colorString);
    },
    
    fromHexString: function(hexCode) {
      if (hexCode.startsWith('#')) {
        hexCode = hexCode.substring(1);
      }
      
      var components = [], i, hex;
      if (hexCode.length === 3) {
        for (i = 0; i < 3; i++) {
          hex = hexCode.substr(i, 1);
          components.push(window.parseInt(hex + hex, 16) / 255.0);
        }
      } else {
        for (i = 0; i < 6; i += 2) {
          hex = hexCode.substr(i, 2);
          components.push(window.parseInt(hex, 16) / 255.0);
        }
      }

      return this.fromRGB.apply(this, components);
    },
    
    _fromColorString: function(pre, method, scales, colorCode) {
      
    },
    
    hsvToRGB: function(h, s, v, a) {
      if (arguments.length === 1) {
        var hsv = h;
        h = hsv.h, s = hsv.s, v = hsv.v, a = hsv.a;
      }
      
      var red, green, blue;
      
      if (s === 0) {
        red = green = blue = a;
      } else {
        var i = Math.floor(h * 6);
        var f = (h * 6) - i;
        var p = v * (1 - s);
        var q = v * (1 - s * f);
        var t = v * (1 - (s * (1 - f)));
        
        switch (i) {
          case 1: red = q; green = v; blue = p; break;
          case 2: red = p; green = v; blue = t; break;
          case 3: red = p; green = q; blue = v; break;
          case 4: red = t; green = p; blue = v; break;
          case 5: red = v; green = p; blue = q; break;
          case 6: // fallthrough
          case 0: red = v; green = t; blue = p; break;          
        }
      }
      
      return { r: red, g: green, b: blue, a: a };
    },
    
    hslToRGB: function(h, s, l, a) {
      if (arguments.length === 1) {
        var hsl = h;
        h = hsl.h, s = hsl.s, l = hsl.l, a = hsl.a;
      }
      
      var red, green, blue;
      
      if (s === 0) {
        red = green = blue = l;
      } else {
        var m2 = (l <= 0.5) ? l * (1.0 + s) : l + s - (l * s);
        var m1 = (2.0 * l) - m2;
        
        var h6 = h * 6;
        
        red   = hslValue(m1, m2, h6 + 2);
        green = hslValue(m1, m2, h6);
        blue  = hslValue(m1, m2, h6 - 2);
      }
      
      return { r: red, g: green, b: blue, a: a };
    },
    
    rgbToHSV: function(r, g, b, a) {
      if (arguments.length === 1) {
        var rgb = r;
        r = rgb.r, g = rgb.g, b = rgb.b, a = rgb.a;
      }
      
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, v = max;
      
      if (min === max) {
        h = s = 0;
      } else {
        var delta = max - min;
        s = delta / max;
        
        if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + ((b - r) / delta);
        } else {
          h = 4 + ((r - g) / delta);
        }
        
        h /= 6;
        
        if (h < 0) h += 1;
        if (h > 1) h -= 1;
      }
      
      return { h: h, s: s, v: v, a: a };
    },
    
    rgbToHSL: function(r, g, b, a) {
      if (arguments.length === 1) {
        var rgb = r;
        r = rgb.r, g = rgb.g, b = rgb.b, a = rgb.a;
      }
      
      var max = Math.max(r, g, b), min = Math.min(r, g, b);
      var h, s, l = (max + min) / 2.0;
      
      var delta = max - min;
      
      if (delta === 0) {
        h = s = 0;
      } else {
        if (l <= 0.5) {
          s = delta / (max + min);
        } else {
          s = delta / (2 - max - min);
        }
        
        if (r === max) {
          h = (g - b) / delta;
        } else if (g === max) {
          h = 2 + ((b - r) / delta);
        } else {
          h = 4 + ((r - g) / delta);
        }
        
        h /= 6;
        if (h < 0) h += 1;
        if (h > 0) h -= 1;        
      }
      
      return { h: h, s: s, l: l, a: a };
    }
    
    
  });
  
})();


































