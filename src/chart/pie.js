Math.RAD = Math.PI / 180;

Math.sum = function() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++)
    total += arguments[i];
    
  return total;
};

/**
 *  class Chart.Pie < Chart.Base
 *  
 *  A class for drawing pie charts.
**/

Chart.Pie = Class.create(Chart.Base, {
  /**
   *  new Chart.Pie(canvas, options)
  **/
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);

    this.R = Raphael(this.canvas, this.options.width, this.options.height);
    
    this._center = {
      x: Math.round(this.options.width  / 2),
      y: Math.round(this.options.height / 2)
    };
    
    var distance = this.options.animation.distance;
    this._radius = Math.min(
      this._center.x - (distance * 2),
      this._center.y - (distance * 2)
    );
  },
  
  /**
   *  Chart.Pie#draw() -> undefined
  **/
  draw: function() {
    this.clear();
    
    if (this._datasets.length === 0) {
      throw new Krang.Error("No datasets!");
    }
    
    var opt = this.options, R = this.R, d = this._datasets.first();
    
    var $dataLayer = R.set();
    this._layerSet.set('data', $dataLayer);
    function sector(cx, cy, r, startAngle, endAngle, params) {
      var x1 = cx + r * Math.cos(-startAngle * Math.RAD),
          x2 = cx + r * Math.cos(-endAngle   * Math.RAD),
          y1 = cy + r * Math.sin(-startAngle * Math.RAD),
          y2 = cy + r * Math.sin(-endAngle   * Math.RAD);
          
      // Snap to pixel values.
      x1 = Math.ceil(x1);
      x2 = Math.ceil(x2); 
      y1 = Math.ceil(y1);
      y2 = Math.ceil(y2);
          
      // FIXME: Quick way to ensure that a pie chart with one datum will
      // draw the _entire circle_, not just a tiny sliver.
      if (x1 == x2 && y1 == y2) y1--;
      
      var isLarge = ((endAngle - startAngle) > 180);
      
      var wedgePath = new Krang.PathBuilder();      
      wedgePath.moveTo(cx, cy)
        .lineTo(x1, y1)
        .arcTo(r, r, (isLarge ? 1 : 0), 0, x2, y2)
        .lineTo(cx, cy);
        
      var wedge = R.path(wedgePath.toString()).attr(params);
        
      $dataLayer.push(wedge);
      return wedge;
    }
    
    var angle = 0, total = 0;
    
    var total = Math.sum.apply(Math, d.values);
    
    var $color = opt.wedge.color;
    if (opt.wedge.color instanceof Krang.Colorset) {
      opt.wedge.color.setLength(d.dataLength());
    }
            
    var label, value, wedge, wedgeSize, popAngle, color, colorObj, bgColor;
    for (var i = 0, l = d.labels.length; i < l; i++) {
      label = d.labels[i], value = d.values[i];
      
      wedgeSize = (360 * value) / total;
      popAngle = angle + (wedgeSize / 2);

      color = $color.toString();            
      colorObj = Krang.Color.fromString(color);
      
      var gradient = Object.clone(opt.wedge.gradient);
      
      gradient.dots = opt.wedge.gradient.dots(colorObj);
      
      wedge = sector(
        this._center.x,
        this._center.y,
        this._radius,
        angle,
        angle + wedgeSize,
        { fill: color, stroke: opt.wedge.stroke }
      );
      
      Krang.Data.store(wedge, { data: { label: label, value: value } });
      
      wedge.attr({ gradient: gradient });
      
      bgColor = Raphael.rgb2hsb(color);
      bgColor = Raphael.hsb2rgb(bgColor.h, bgColor.s, 1).hex;
      
      var canvas = this.canvas;
      (function(wedge) {        
        wedge.mouseover(function(event) {
          Event.extend(event);
          var data = Krang.Data.retrieve(wedge, 'data');
          Event.fire(canvas, 'krang:mouseover', {
            wedge: wedge,
            data:  data,
            relatedTarget: event.relatedTarget
          });
        });
        
        wedge.mouseout( function(event) {
          Event.extend(event);
          var data = Krang.Data.retrieve(wedge, 'data');
          Event.fire(canvas, 'krang:mouseout',  {
            wedge: wedge,
            data:  data,
            relatedTarget: event.relatedTarget
          });
        });
      })(wedge);
      
      angle += wedgeSize;
    }    

    
    this._drawn = true;
  }   
});

Object.extend(Chart.Pie, {
  DEFAULT_OPTIONS: {
    width:  400,
    height: 400,
    
    wedge: {
      stroke: '#000',
      color:  new Krang.Colorset({
        vary: 'h',
        hue: 0.2,
        saturation: 0.9,
        lightness: 0.4
      }),
      
      gradient: {
        type: 'linear',
        dots: function(colorObj) {
          return [
            { color: colorObj.lighterBy(0.05).toHexString() },
            { color: colorObj.darkerBy(0.05).toHexString()  }
          ];
        },
        vector: [0, 0, '100%', 0]
      }
    },
    
    animation: {
      distance: 15,
      duration: 0.2
    }
  }
});