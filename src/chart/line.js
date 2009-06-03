

Chart.Line = Class.create(Chart.Base, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);    
    this.R = Raphael(canvas, this.options.width, this.options.height);
  },
  
  draw: function() {
    if (this._datasets.length === 0) {
      throw new Krang.Error("No dataset!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter, max;
    if (opt.grid.maxY === 'auto') {
      max = Math.max.apply(Math, this._datasets.invoke('maxValue'));
    } else {
      max = opt.grid.maxY;
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
    ).attr({ fill: opt.grid.color });
    
        
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
      var line = R.path({
        'stroke':          fillColor.toString(),
        'stroke-width':    opt.line.width,
        'stroke-linejoin': 'round'
      });
      
      var fill = R.path({
        fill:    lineColor,
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

        // Create an invisible rectangle that will receive hover events.
        rect = R.rect(
          g.left + (xScale * i),
          0,
          xScale,
          opt.height - g.bottom
        ).attr({
          stroke:  'none',
          fill:    '#fff',
          opacity: 0
        });
        
        Krang.Data.store(rect, {
          dot:  dot,
          data: data[i]
        });
        
        this._createObservers(rect);

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
  
  _createObservers: function(rect) {
    var over = function() {
      var dot = Krang.Data.retrieve(rect, 'dot'),
         data = Krang.Data.retrieve(rect, 'data');
         
      Event.fire(rect.node, 'krang:mouseover', { dot: dot, data: data });
    };
    
    var out = function() {
      var dot = Krang.Data.retrieve(rect, 'dot'),
         data = Krang.Data.retrieve(rect, 'data');
         
      Event.fire(rect.node, 'krang:mouseout', { dot: dot, data: data });
    };
    
    Event.observe(rect.node, 'mouseover', over);
    Event.observe(rect.node, 'click',     out );
    Event.observe(rect.node, 'mouseout',  out );    
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
      color: '#039',
      opacity: 0.3
    },
    
    gutter: {
      top:    20,
      bottom: 20,
      left:   30,
      right:  30
    },
    
    grid: {
      color: '#ddd',
      
      horizontal: {
        enabled: true,
        lines: 10
      },
      
      vertical: {
        enabled: false,
        lines: 0
      },
      
      labelX: Prototype.K,
      labelY: function(value) {
        return value.toFixed(1);
      },
      
      maxY: 'auto'
    },

    dot: {
      stroke: '#fff',
      radius: 4
    },
    
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