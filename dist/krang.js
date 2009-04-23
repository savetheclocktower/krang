var Krang = {};

Krang.Error = Class.create({
  initialize: function(error) {
    this.error = error;
  },

  toString: function() {
    return "Krang error: " + error;
  }
});

if (!window.Raphael) {
  throw new Krang.Error("Raphaël must be loaded before Krang! (You can download Raphaël at http://raphaeljs.com/)");
}

Krang.deepExtend = function(destination, source) {
  for (var property in source) {
    var type = typeof source[property];
    if (type === 'object' && !Object.isElement(source[property])) {
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


var Dataset = {};

Dataset.Base = Class.create({
  initialize: function(labels, values) {
    this.labels = labels || [];
    this.values = values || [];
  },

  toArray: function() {
    var result = [];
    for (var i = 0; i < this.labels.length; i++) {
      result.push({ label: this.labels[i], value: this.values[i] });
    }

    return result;
  },

  dataLength: function() {
    return this.labels.length;
  },

  maxValue: function() {
    return Math.max.apply(Math, this.values);
  }
});

Dataset.Array = Class.create(Dataset.Base, {
  initialize: function($super, array) {
    $super();

    array.each( function(pair) {
      this.labels.push(pair[0]);
      this.values.push(pair[1]);
    }, this);
  }
});


Dataset.Multiple = Class.create(Dataset.Base, Enumerable, {
  initialize: function($super) {
    $super();

    var args = $A(arguments);
    args.shift();

    this._datasets = args;
  },

  _each: function(iterator) {
    return this._datasets._each(iterator);
  },

  dataLength: function() {
    var lengths = this.map( function(set) { return set.dataLength(); });
    return Math.min.apply(Math, lengths);
  },

  maxValue: function() {
    var maxes = this.map( function(set) { return set.maxValue(); });
    return Math.max.apply(Math, maxes);
  }
});

var Colorset = Class.create({
  initialize: function() {
    this._colors = $A(arguments);
    this._index  = 0;
  },

  next: function() {
    if (this._index === this._colors.length)
      this._index = 0;

    return this._colors[this._index++];
  }
});

Colorset.BLUES = new Colorset(
  "#003",
  "#03A",
  "#009",
  "#036",
  "#039",
  "#006"
);

Colorset.interpret = function(value) {
  return (typeof value === 'object') ? value.next() : value;
};


var Chart = {};

Chart.Base = Class.create(Krang.Mixin.Configurable, {
  initialize: function(canvas) {
    this.canvas = $(canvas);
  },

  addDataset: function(dataset) {
    if (dataset instanceof Dataset.Base) {
      this._dataset = dataset;
    } else {
      throw new Krang.Error("Dataset must inherit from class Dataset!");
    }
  },

  draw: function() {
    throw "Implement in subclass.";
  }
});



Chart.Line = Class.create(Chart.Base, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);
    this.R = Raphael(canvas, this.options.width, this.options.height);
  },

  draw: function() {
    if (!this._dataset) {
      throw new Krang.Error("No dataset!");
    }

    console.log("in Chart.Line#draw");

    var opt = this.options, R = this.R, g = opt.gutter;

    var max = this._dataset.maxValue();

    var xScale = (opt.width - (g.left + g.right)) / (this._dataset.dataLength() - 1);
    var yScale = (opt.height - (g.bottom + g.top)) / max;

    R.drawGrid(
      g.left,                           /* X                 */
      g.top,                            /* Y                 */
      opt.width  - (g.left + g.right),  /* width             */
      opt.height - (g.top + g.bottom),  /* height            */
      0,                                /* number of columns */
      10,                               /* number of rows    */
      opt.grid.color                    /* color             */
    );

    R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({ stroke: opt.border.color });



    var blanket = R.set();

    function plotDataset(dataset) {
      console.log(dataset);
      var data = dataset.toArray();

      console.log(Colorset.interpret(opt.line.color));

      var line = R.path({
        'stroke':          Colorset.interpret(opt.line.color),
        'stroke-width':    opt.line.width,
        'stroke-linejoin': 'round'
      });

      var fill = R.path({
        fill:    Colorset.interpret(opt.fill.color),
        opacity: opt.fill.opacity,
        stroke:  'none'
      });

      fill.moveTo(g.left, opt.height - g.bottom);

      var label, value, x = 0, y, dot, rect;

      for (var i = 0, l = data.length; i < l; i++) {
        label = data[i].label, value = data[i].value;


        y = Math.round(opt.height - g.bottom - (yScale * value));
        x = Math.round(g.left + (xScale * i));


        console.log("plotting", value, "at", [x, y]);

        if (i == 0) {
          line.moveTo(x, y, 10);
          fill.lineTo(x, y, 10);
        } else {
          line.cplineTo(x, y, opt.line.curve);
          fill.cplineTo(x, y, opt.line.curve);
        }

        dot = R.circle(x, y, opt.dot.radius).attr({
          fill:   opt.dot.color,
          stroke: opt.dot.stroke
        });

        rect = R.rect(
          g.left + (xScale * i),
          0,
          xScale,
          opt.height - g.bottom
        ).attr({
          stroke: 'none',
          fill: '#fff',
          opacity: 0
        });

        blanket.push(rect);
      }

      fill.lineTo(x, opt.height - g.bottom).andClose();

    }

    if (this._dataset instanceof Dataset.Multiple) {
      this._dataset.each(plotDataset, this);
    } else {
      plotDataset(this._dataset, this);
    }

    blanket.toFront();
  }
});


Object.extend(Chart.Line, {
  DEFAULT_OPTIONS: {
    width:  800,
    height: 250,
    line: {
      color: Colorset.BLUES,
      width: 4,
      curve: 10
    },

    fill: {
      color: '#039',
      opacity: 0.3
    },

    gutter: {
      top:    20,
      bottom: 20,
      left:   30,
      right:  30
    },

    dot: {
      color: '#039',
      stroke: '#fff',
      radius: 4
    },

    grid: {
      color: '#ddd'
    },

    border: {
      color: '#999'
    }
  }
});
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
