Math.RAD = Math.PI / 180;

Math.sum = function() {
  var total = 0;
  for (var i = 0; i < arguments.length; i++)
    total += arguments[i];
    
  return total;
};

Chart.Pie = Class.create(Chart.Base, {
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
  
  draw: function() {
    var opt = this.options, R = this.R, d = this._dataset;
    
    function sector(cx, cy, r, startAngle, endAngle, params) {
      var x1 = cx + r * Math.cos(-startAngle * Math.RAD),
          x2 = cx + r * Math.cos(-endAngle   * Math.RAD),
          y1 = cy + r * Math.sin(-startAngle * Math.RAD),
          y2 = cy + r * Math.sin(-endAngle   * Math.RAD);
          
      return R.path(params)
        .moveTo(cx, cy)
        .lineTo(x1, y1)
        .arcTo(r, r, ((endAngle - startAngle > 180) ? 1 : 0), 0, x2, y2)
        .andClose();
    }
    
    var angle = 0, total = 0;
    
    var total = Math.sum.apply(Math, d.values);
    
    var label, value, wedge, wedgeSize, popAngle, color, bgColor;
    for (var i = 0, l = d.labels.length; i < l; i++) {
      label = d.labels[i], value = d.values[i];
      
      wedgeSize = (360 * value) / total;
      popAngle = angle + (wedgeSize / 2);
      color = Raphael.getColor(0.8);
      
      wedge = sector(
        this._center.x,
        this._center.y,
        this._radius,
        angle,
        angle + wedgeSize,
        { fill: color, stroke: opt.wedge.stroke }
      );
      
      bgColor = Raphael.rgb2hsb(color);
      bgColor = Raphael.hsb2rgb(bgColor.h, bgColor.s, 1).hex;
      
      console.log(wedge);
      
      (function(wedge, popAngle, bgColor, color) {
        
        wedge.mouseover(function() {
          var x1 = opt.animation.distance * Math.cos(-popAngle * Math.RAD);
          var y1 = opt.animation.distance * Math.sin(-popAngle * Math.RAD);

          wedge.animate({
            translation: "#{0} #{1}".interpolate([x1, y1]),
            fill: bgColor
          }, opt.animation.duration * 1000);
        });

        wedge.mouseout(function() {
          var tr = wedge.attr('translation');

          wedge.animate({
            translation: "#{0} #{1}".interpolate([-tr.x, -tr.y]),
            fill: color
          }, opt.animation.duration * 1000);
        });      
        
        
      })(wedge, popAngle, bgColor, color);
      
      
      angle += wedgeSize;
    }    
  }   
});

Object.extend(Chart.Pie, {
  DEFAULT_OPTIONS: {
    width:  400,
    height: 400,
    
    wedge: {
      stroke: '#000'
    },
    
    animation: {
      distance: 15,
      duration: 0.2
    }    
  }
});