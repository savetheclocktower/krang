/**
 *  class Chart.Line < Chart.Area
 *  
 *  A class for drawing line graphs.
**/

Chart.Line = Class.create(Chart.Area, {
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
    
    var opt = this.options, R = this.R, g = opt.gutter;

    // If `maxY` is `auto`, look at the dataset(s) to determine a 
    // reasonable maximum for the chart.
    if (opt.grid.maxY === 'auto') {
      // The largest value in any single dataset will serve as the maximum.
      max = Math.max.apply(Math, this._datasets.invoke('maxValue'));
    } else {
      // If the user hard-codes a maximum.
      max = opt.grid.maxY;
    }

    var dataLength = this._datasets.first().dataLength();
    if (dataLength <= 1) {
      // Not enough for a line chart.
      throw new Krang.Error("Not enough data points!")
    }

    // We want the grid to be one column _shorter_ than usual because the
    // data points should intersect the vertical gridlines.
    // 
    // This means, though, that later on we'll have to create by hand the
    // invisible columns that correspond to data points.
    var grid = this._getGridSpec({ xSteps: dataLength - 1 });
    this._drawGrid();
    
    // So now we know how to get a Y coordinate from a raw dataset value. 
    var $valueToY = function(value) {
      return value * (grid.height / max);
    };
    
    // And how to get the dataset value of an arbitrary Y coordinate.
    var $yToValue = function(y) {
      return y / (grid.height / max);
    };
    
    // Retrieve the color. If it's a colorset, it needs to know how many
    // distinct colors to generate.
    var $color = opt.line.color;
    if ($color instanceof Krang.Colorset) {
      $color.setLength(this._datasets.length);
    }
    
    // Create a set of invisible rectangles to serve as UI regions for the
    // grid columns.
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
      
      var origin = this._chartingPointToDrawingPoint({ x: 0, y: 0 });
      
      // Fill path starts at the graph origin.
      fill.moveTo(origin.x, origin.y);

      var x = 0, labelPointerX = 1, label, value, y, dot, rect;
      
      // Plot the values.
      var datum, chartingPoint, drawingPoint, columnCBox, columnDBox;
      for (var i = 0, l = data.length; i < l; i++) {
        datum = data[i];
        
        console.log(g.left, grid.xStepPixels);
        
        chartingPoint = {
          x: grid.xStepPixels * i,
          y: $valueToY(datum.value)
        };

        // Draw the line segment.
        drawingPoint = this._chartingPointToDrawingPoint(chartingPoint);
        
        console.log("chartingPoint: ", chartingPoint);
        console.log("drawingPoint: ", drawingPoint);
        
        if (i == 0) {
          line.moveTo(drawingPoint.x, drawingPoint.y);
          fill.lineTo(drawingPoint.x, drawingPoint.y);
        } else {
          line.cplineTo(drawingPoint.x, drawingPoint.y, opt.line.curve);
          fill.cplineTo(drawingPoint.x, drawingPoint.y, opt.line.curve);
        }
        
        // Draw the dot.
        dot = R.circle(drawingPoint.x, drawingPoint.y, opt.dot.radius).attr({
          fill:   opt.dot.color || lineColor,
          stroke: opt.dot.stroke
        });

        // Create an invisible, roughly-square box that will serve as the
        // hover zone for this column.
        columnCBox = {
          x: grid.xStepPixels * i,
          y: grid.height,
          width: grid.xStepPixels,
          height: grid.height
        };
        
        columnDBox = this._chartingBoxToDrawingBox(columnCBox);
                
        rect = R.rect(
          columnDBox.x,
          columnDBox.y,
          columnDBox.width,
          columnDBox.height
        ).attr({
          stroke: '#000',
          fill:   '#fff',
          opacity: 0
        });
        
        // Run all the labels through the specified filter.
        datum.label = opt.grid.labelX(datum.label);
        
        Krang.Data.store(rect, {
          dot:  dot,
          data: data[i]
        });
        
        this._createObservers(rect, dot);
        blanket.push(rect);
        
        // Only draw X-axis labels for the first set.
        if (index === 0) {
          // Skip drawing the label if the options call for it.
          if (labelPointerX++ % opt.grid.labelXFrequency === 0) {
            xAxisLabelBox        = Object.clone(columnDBox);
            
            xAxisLabelBox.x     -= grid.xStepPixels / 2;
            xAxisLabelBox.y      = g.top + grid.height + 5;
            xAxisLabelBox.height = 'auto';
            xAxisLabelBox.width  = grid.xStepPixels;          

            new Krang.Text(datum.label, {
              box: xAxisLabelBox,            
              align: 'center',
              font: {
                family: opt.text.font.family,
                size:   opt.text.font.size,
                color:  opt.text.color
              }            
            }).draw(R);
          }
        } 
      } // for

      // Now we've plotted all the points.
      // Since the fill path is drawing a shape, not just a line, we need to
      // close the path.
      fill.lineTo(origin.x, origin.y).andClose();
      
      // We want the fill to appear _behind_ the line, so that the bottom
      // half of the line isn't obscured.
      fill.insertBefore(line);
    }
    
    this._datasets.each(plotDataset, this);
    
    // Draw Y labels.
    this._drawYAxisLabels(max);
    
    this._frame.toFront();
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
       * How often to draw labels. If set to `3`, for instance, only every
       * third label will be drawn.  
       */
      labelXFrequency: 1,
      labelYFrequency: 1,
      
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
      font: {
        family: 'Lucida Grande',
        size:   '12px'
      },
      color:      "#000"
    }
  }
});