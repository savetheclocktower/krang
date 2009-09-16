/**
 *  class Krang.PathBuilder
 *  includes Krang.Mixin.Configurable
 *  
 *  A class for building an SVG-compliant path string from a series of
 *  Raphael-like method calls.
**/

Krang.PathBuilder = Class.create(Krang.Mixin.Configurable, {
  initialize: function(options) {
    this.setOptions(options);
    this._pathString = "";
    this.last = { x: 0, y: 0, bx: 0, by: 0 };
  },
  
  absolutely: function() {
    this.options.absolute = true;
  },
  
  relatively: function() {
    this.options.absolute = false;
  },
  
  moveTo: function(x, y) {
    var abs = this.options.absolute;
    var d = abs ? "M" : "m";
    d += parseFloat(x).toFixed(3) + " " + parseFloat(y).toFixed(3) + " ";
    
    if (this._pathString === "M0,0") {
      this._pathString = "";
    }
    
    this.last.x = (abs ? 0 : this.last.x) + parseFloat(x);
    this.last.y = (abs ? 0 : this.last.y) + parseFloat(y);
    
    this._pathString += d;
    return this;
  },
  
  lineTo: function(x, y) {
    var abs = this.options.absolute;
    var d = abs ? "L" : "l";
    d += parseFloat(x).toFixed(3) + " " + parseFloat(y).toFixed(3) + " ";
    
    this.last.x = (abs ? 0 : this.last.x) + parseFloat(x);
    this.last.y = (abs ? 0 : this.last.y) + parseFloat(y);
    
    this._pathString += d;
    return this;
  },
  
  arcTo: function(rx, ry, largeArcFlag, sweepFlag, x, y) {
    var d = this.options.absolute ? "A" : "a";
    d += [
      parseFloat(rx).toFixed(3),
      parseFloat(ry).toFixed(3),
      0,
      largeArcFlag,
      sweepFlag,
      parseFloat(x).toFixed(3),
      parseFloat(y).toFixed(3)
    ].join(' ');

    this.last.x = parseFloat(x);
    this.last.y = parseFloat(y);
    
    this._pathString += d;
    return this;
  },
  
  cplineTo: function(x1, y1, w1) {
    if (!w1) {
      return this.lineTo(x1, y1);
    } 

    var abs = this.options.absolute;    
    var p = {}, x = parseFloat(x1), y = parseFloat(y1), w = parseFloat(w1),
     d = abs ? "C" : "c",
     attr = [+this.last.x + w, +this.last.y, x - w, y, x, y];
     
    for (var i = 0, l = attr.length; i < l; i++) {
      d += attr[i] + " ";
    }
    
    this.last.x = (abs ? 0 : this.last.x) + attr[4];
    this.last.y = (abs ? 0 : this.last.y) + attr[5];
    
    this.last.bx = attr[2];
    this.last.by = attr[3];
    
    this._pathString += d;
    return this;
  },
  
  curveTo: function() {
    var abs = this.options.absolute;
    var p = {}, d = [0, 1, 2, 3, "s", 5, "c"][arguments.length];
    if (abs) d = d.toUpperCase();
    
    for (var i = 0, l = arguments.length; i < l; i++) {
      d += parseFloat(arguments[i]).toFixed(3) + " ";
    }
    
    this.last.x = (abs ? 0 : this.last.x) + 
     parseFloat(arguments[arguments.length - 2]);
    this.last.y = (abs ? 0 : this.last.y) +
     parseFloat(arguments[arguments.length - 1]);
     
    this.last.bx = parseFloat(arguments[arguments.length - 4]);
    this.last.by = parseFloat(arguments[arguments.length - 3]);
    
    this._pathString += d;
    return this;
  },
  
  qCurveTo: function() {
    var abs = this.options.absolute;
    var p = {}, d = [0, 1, "t", 3, "q"][arguments.length];
    
    if (abs) d = d.toUpperCase();
    
    for (var i = 0, l = arguments.length; i < l; i++) {
      d += parseFloat(arguments[i]).toFixed(3) + " ";
    }
    
    this.last.x = (abs ? 0 : this.last.x) + 
     parseFloat(arguments[arguments.length - 2]);
    this.last.y = (abs ? 0 : this.last.y) +
     parseFloat(arguments[arguments.length - 1]);
     
    this.last.bx = parseFloat(arguments[arguments.length - 4]);
    this.last.by = parseFloat(arguments[arguments.length - 3]);
    
    this._pathString += d;
    return this;
  },
  
  addRoundedCorner: function() {
    // TODO: Christ. I'll implement this later if I ever need it.
    return this;
  },
  
  andClose: function() {
    this._pathString += "Z ";
    return this;
  },
  
  toString: function() {
    return this._pathString;
  }
});

Object.extend(Krang.PathBuilder, {
  DEFAULT_OPTIONS: {
    absolute: true    
  }
});