/**
 *  class Chart.Line < Chart.Base
 *  
 *  A class for drawing line graphs.
**/

Chart.Line = Class.create(Chart.Base, {
  /**
   *  new Chart.Line(canvas, options)
  **/
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);    
    this.R = Raphael(canvas, this.options.width, this.options.height);
  },
  
  /**
   *  Chart.Line#draw() -> undefined
  **/
  draw: function() {
    this.clear();

    if (this._datasets.length === 0) {
      throw new Krang.Error("No dataset!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter, max;
    if (opt.grid.maxY === 'auto') {
      max = Math.max.apply(Math, this._datasets.invoke('maxValue'));
    } else {
      max = opt.grid.maxY;
    }
    
    var dataLength = this._datasets.first().dataLength();
    if (dataLength <= 1) {
      // Not enough for a line chart.
      throw new Krang.Error("Not enough data points!")
    }
    
    // Horizontal space between each node.
    var xScale = (opt.width - (g.left + g.right)) /
     (this._datasets.first().dataLength() - 1);
     
    // Vertical scale 
    var yRange = opt.height - (g.top + g.bottom);
    var yScale = yRange / max;
    
    var columns = opt.grid.vertical.enabled   ? opt.grid.vertical.lines   : 0;
    var rows    = opt.grid.horizontal.enabled ? opt.grid.horizontal.lines : 0;
    
    // Do a separate background fill before creating the grid.
    R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({ fill: opt.grid.backgroundColor });
    
        
    // Create the background grid.
    R.drawGrid(
      g.left,                           /* X                 */
      g.top,                            /* Y                 */
      opt.width  - (g.left + g.right),  /* width             */
      opt.height - (g.top + g.bottom),  /* height            */
      columns,                          /* number of columns */
      rows,                             /* number of rows    */
      opt.grid.color                    /* color             */
    );
    
    R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({ stroke: opt.border.color });
    
    var $color = opt.line.color;
    if ($color instanceof Krang.Colorset) {
      $color.setLength(this._datasets.length);
    }
    
    var blanket = R.set();
    
    function plotDataset(dataset, index) {
      var data = dataset.toArray();
      
      // Create the path objects for the line and the fill.

      // Fill color, if left unspecified, will be the same as the line
      // color (with lower opacity).
      var fillColor = opt.fill.color || opt.line.color;
      if (opt.fill.color && opt.fill.color instanceof Krang.Colorset) {
        fillColor.setLength(this._datasets.length);
      }
      
      var lineColor = $color.toString();
      
      // Mark the color on the dataset so we can read it later (e.g., for
      // building a graph legend).
      dataset.color = lineColor;
      
      var line = R.path({
        'stroke':          lineColor,
        'stroke-width':    opt.line.width,
        'stroke-linejoin': 'round'
      });      
      
      var fillColor = opt.fill.color || lineColor;
      if (opt.fill.color && opt.fill.color instanceof Krang.Colorset) {
        fillColor.setLength(this._datasets.length);
      }

      var fill = R.path({
        fill:    fillColor.toString(),
        opacity: opt.fill.opacity,
        stroke:  'none'
      });

      fill.moveTo(g.left, opt.height - g.bottom);
      
      var label, value, x = 0, y, dot, rect;
      
      // Plot the values.
      for (var i = 0, l = data.length; i < l; i++) {
        label = data[i].label; value = data[i].value;

        y = Math.round(opt.height - g.bottom - (yScale * value));
        x = Math.round(g.left + (xScale * i));

        // Draw the line segment.
        if (i == 0) {
          line.moveTo(x, y, 10);
          fill.lineTo(x, y, 10);
        } else {
          line.cplineTo(x, y, opt.line.curve);
          fill.cplineTo(x, y, opt.line.curve);
        }

        // Draw the dot.
        dot = R.circle(x, y, opt.dot.radius).attr({ 
          fill:   opt.dot.color || lineColor,
          stroke: opt.dot.stroke
        });

        // Create an invisible, roughly-square box that will serve as the
        // hover zone for this point.
        rect = R.rect(
          g.left + (xScale * i) - (xScale / 16), /* x      */
          y - (xScale / 16),                     /* y      */
          xScale / 8,                               /* width  */
          xScale / 8                                /* height */
        ).attr({
          stroke:  '#000',
          fill:    '#fff',
          opacity: 0
        });
        
        Krang.Data.store(rect, {
          dot:  dot,
          data: data[i]
        });
        
        this._createObservers(rect, dot);

        blanket.push(rect);
        
        // Draw X labels.
        if (!index) {
          var textStartY = g.top + yRange + Math.round(g.bottom / 2);          
          label = opt.grid.labelX(label);
          var text = R.text(x, textStartY, label).attr({
            font: '#{0} "#{1}"'.interpolate([opt.text.fontSize, opt.text.fontFamily]),
            stroke: 'none',
            fill: opt.text.color
          });
        }        
      }

      // Since the fill path is drawing a shape, not just a line, we need to
      // close the path.
      fill.lineTo(x, opt.height - g.bottom).andClose();
      
    }
    
    this._datasets.each(plotDataset, this);
    
    // Draw Y labels.    
    var yStart = g.bottom, yEnd = opt.height - g.top;
    
    var value, yLabel, yPlot, text;
    for (var j = 0, yLabel; j <= rows; j++) {
      value  = (j / rows) * max;
      yLabel = opt.grid.labelY(value);
      yPlot  = yStart + ((j * yRange) / rows);
      
      text = R.text(Math.round(g.left / 2), (opt.height - yPlot), yLabel).attr({
        font: '#{0} "#{1}"'.interpolate([opt.text.fontSize, opt.text.fontFamily]),
        stroke: 'none',
        fill: opt.text.color          
      });
      
      // Fake right-alignment.
      var textWidth = text.getBBox().width;
      var textX = g.left - 15 - textWidth;
      
      text.attr({ x: textX, 'text-anchor': 'start' });
    }
    
    blanket.toFront();
  },
  
  _createObservers: function(rect, dot) {
    var position = {
      x: dot.attrs.cx,
      y: dot.attrs.cy  
    };
    
    var canvas = this.canvas;
    
    var over = function() {
      var dot = Krang.Data.retrieve(rect, 'dot'),
         data = Krang.Data.retrieve(rect, 'data');
         
      Event.fire(canvas, 'krang:mouseover',
       { dot: dot, data: data, position: position });
    };
    
    var out = function() {
      var dot = Krang.Data.retrieve(rect, 'dot'),
         data = Krang.Data.retrieve(rect, 'data');
         
      Event.fire(canvas, 'krang:mouseout',
        { dot: dot, data: data, position: position });
    };
    
    var click = function() {
      var dot = Krang.Data.retrieve(rect, 'dot'),
         data = Krang.Data.retrieve(rect, 'data');
         
      Event.fire(canvas, 'krang:click',
        { dot: dot, data: data, position: position });
    };
    
    rect.mouseover(over);
    rect.mouseout(out);
    rect.click(out);
  }
});


Object.extend(Chart.Line, {
  DEFAULT_OPTIONS: {
    width:  800,
    height: 250,
    line: {
      color: new Krang.Colorset({
        vary: 'h',
        saturation: 0.6,
        lightness: 0.4
      }),
      width: 4,
      curve: 10
    },
    
    fill: {
      opacity: 0.3
    },
    
    gutter: {
      top:    20,
      bottom: 20,
      left:   30,
      right:  30
    },
    
    /* The chart's grid. */
    grid: {               
      color: '#ddd',            /* Color of the gridlines. */
      backgroundColor: '#fff',  /* Color of the grid's background. */
      
      horizontal: {
        enabled: true,    /* Whether to draw horizontal gridlines. */
        lines: 10
      },
      
      vertical: {
        enabled: false,   /* Whether to draw vertical gridlines. */
        lines: 0
      },
      
      /* Callbacks that format the labels for display. */
      labelX: Prototype.K,  
      labelY: function(value) {
        return value.toFixed(1);
      }, 
      
      /* 
       * If set to 'auto', will determine a good max value based on the 
       * scale of the chart. Otherwise one can specify a max value to use.
       */ 
      maxY: 'auto'
    },

    dot: {
      stroke: '#fff',
      radius: 4
    },
    
    /* Border around the chart itself. */    
    border: {
      color: '#999'
    },
    
    text: {
      fontFamily: 'Lucida Grande',
      fontSize:   '12px',
      color:      "#000"
    }
  }
});