// Utility functions for drawing text in boxes.

/**
 *  Krang.Text
 *  Contains utility functions for drawing and manipulating text.
**/

Krang.Text = Class.create(Krang.Mixin.Configurable, {
  initialize: function(text, options) {
    this.text = text;
    this.setOptions(options);
  },
  
  _hasBox: function() {
    var opt = this.options;
    return (opt.box.width !== null) &&
     (opt.box.height !== null);
  },
  
  clear: function() {
    if (!this._text) return;
    
    this._text.remove();
    this._text = null;
  },
  
  draw: function(context) {
    var R = context, opt = this.options,
     attrs = opt.attributes, box = opt.box;
     
    var hasBox = this._hasBox();
     
    this.clear();
     
    var f = opt.font;
    var fontAttrs = {
      font: '#{0} "#{1}"'.interpolate([f.size, f.family]),
      fill: f.color
    };
    
    var text = R.text(box.x, box.y, this.text).attr(fontAttrs).attr(attrs);
    
    // By default, there is no invisible positioning box. When `x` and `y`
    // are specified _without_ `width` and `height`, the _exact center_ of
    // the text string will lie on those coordinates.
    if (!this._hasBox()) return text;
    
    if (box.height === 'auto') {
      box.height = window.parseInt(f.size, 10);
    }
    
    // When a box is given, the `x` and `y` coordinates are treated as the
    // location of the upper-left corner of the box, much like drawing a
    // rectangle in Raphael.
    // 
    // When debugging, it's handy to see the usually-invisible boundaries
    // of the imaginary text boxes.
    if (Krang.$debug) {
      R.rect(box.x, box.y, box.width, box.height).attr({
        'stroke': '#ddd',
        'stroke-dasharray': '- '
      });
    }    
    
    // The text needs to fit inside this box, so we do some measuring and
    // adjusting.
    var bBox = text.getBBox(),
     newX = Math.round(box.width  / 2),
     newY = Math.round(box.height / 2);
     
    switch (opt.align) {
    case 'right':
      newX +=  Math.round((box.width - bBox.width) / 2);
      break;
    case 'left':
      newX += -Math.round((box.width - bBox.width) / 2);
      break;
    }
    
    // Adjust the text's alignment inside our imaginary box.
    text.attr({
      x: box.x + newX,
      y: box.y + newY
    });
    
    this._text = text;    
    return text;
  }
});

Object.extend(Krang.Text, {
  DEFAULT_OPTIONS: {
    box: {
      x: 0,
      y: 0,
      width:  null,
      height: 'auto'
    },
    
    align: 'center',
    
    font: {
      family: "Lucida Grande",
      size:   "10px"
    },
    
    // Any further attributes to pass to the Raphael drawing context.
    attributes: {}
  }
});