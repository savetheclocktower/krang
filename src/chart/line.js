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
    
    this._graphShapes = {};
  },
  
  /**
   *  Chart.Line#draw() -> undefined
  **/
  draw: function() {
    var alreadyDrawn = (this._drawn && this.options.data.mode === "single");
    if (!alreadyDrawn) this.clear();

    if (this._datasets.length === 0) {
      throw new Krang.Error("No dataset!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter;
    
    this._currentDatasets = opt.data.mode === "single" ?
     [this.getActiveDataset()] : $A(this._datasets);    

    // If `maxY` is `auto`, look at the dataset(s) to determine a 
    // reasonable maximum for the chart.
    if (opt.grid.maxY === 'auto') {
      // The largest value in any single dataset will serve as the maximum.
      this._max = Math.max.apply(Math, this._datasets.invoke('maxValue'));
    } else {
      // If the user hard-codes a maximum.
      this._max = opt.grid.maxY;
    }

    this._dataLength = this._currentDatasets.first().dataLength();
    if (this._dataLength <= 1) {
      // Not enough for a line chart.
      throw new Krang.Error("Not enough data points!");
    }

    // We want the grid to be one column _shorter_ than usual because the
    // data points should intersect the vertical gridlines.
    // 
    // This means, though, that later on we'll have to create by hand the
    // invisible columns that correspond to data points.
    var grid = this._getGridSpec({ xSteps: this._dataLength - 1 });

    if (!alreadyDrawn) this._drawGrid();
    
    // So now we know how to get a Y coordinate from a raw dataset value. 
    this._valueToY = function(value) {
      return value * (grid.height / this._max);
    }.bind(this);
    
    // And how to get the dataset value of an arbitrary Y coordinate.
    this._yToValue = function(y) {
      return y / (grid.height / this._max);
    }.bind(this);
    
    this._drawUILayer();
    
    this._dataLayer = R.set();
    this._layerSet.set('data', this._dataLayer);
    
    this._textLayer = R.set();
    this._layerSet.set('text', this._textLayer);
    
    // Retrieve the color. If it's a colorset, it needs to know how many
    // distinct colors to generate.
    var lineColor = opt.line.color;
    if (lineColor instanceof Krang.Colorset) {
      lineColor.setLength(this._currentDatasets.length);
    }
    // Fill color, if left unspecified, will be the same as the line
    // color (with lower opacity).
    var fillColor = opt.fill.color;
    if (fillColor && fillColor instanceof Krang.Colorset) {
      fillColor.setLength(this._currentDatasets.length);
    }
    
    this._currentDatasets.each( function(dset) {
      dset._lineColor = lineColor.toString();
      dset._fillColor = fillColor ? fillColor.toString() : dset._lineColor;
    });
    
    if (!alreadyDrawn) {
      this._drawXAxisLabels(this._currentDatasets.first());
      this._drawYAxisLabels();
    }
    
    this._currentDatasets.each(this._drawDataset, this);

    var layerOrder = $w('ui text frame data grid background');
    if (!alreadyDrawn) {
      this._layerSet.setKeyOrder(layerOrder);
    }
    
    this._drawn = true;
  }, // #draw
  
  _drawDataset: function(dataset, index, animate) {
    var shapes, line, fill, dots;
    var opt = this.options,
     isSingle = (opt.data.mode === "single"),
     alreadyDrawn = (isSingle && this._drawn);
    var R = this.R;
    var grid = this._gridSpec;

    if (isSingle) {
      // If we're only ever showing one dataset at a time, we can reuse
      // the line, fill, and dots each time.
      shapes = this._graphShapes;
      line = shapes.line;
      fill = shapes.fill;
      dots = shapes.dots;
      if (!dots) {
        shapes.dots = [];
      }
    } else {
      shapes = this._graphShapes;
      if (!dots) {
        shapes.dots = [];
      }
    }

    var data = dataset.toArray();
    
    // Create a layer for each dataset.
    var datasetLayer = R.set();
    
    var lineColor = dataset._lineColor,
     fillColor = dataset._fillColor;
     
    // Mark the color on the dataset so we can read it later (e.g., for
    // building a graph legend).
    dataset.color = lineColor;
    
    // Create the path objects for the line and the fill.
    if (!line) {
      line = R.path("");
      if (isSingle) {
        shapes.line = line;
      }
    }
    var linePath = new Krang.PathBuilder();
    
    if (!alreadyDrawn) datasetLayer.push(line);

    if (!fill) {
      fill = R.path("");
      if (isSingle) {
        shapes.fill = fill;
      }
    }
    var fillPath = new Krang.PathBuilder();
    
    if (!alreadyDrawn) datasetLayer.push(fill);
    
    var origin = this._chartingPointToDrawingPoint({ x: 0, y: 0 });
    
    // Fill path starts at the graph origin.
    fillPath.moveTo(origin.x, origin.y);

    var x = 0, labelPointerX = 1, label, value, y, dot, rect;
    
    // Plot the values.
    var datum, chartingPoint, drawingPoint, text;
    for (var i = 0, l = data.length; i < l; i++) {
      datum = data[i];
      
      chartingPoint = {
        x: grid.xStepPixels * i,
        y: this._valueToY(datum.value)
      };

      // Draw the line segment.
      drawingPoint = this._chartingPointToDrawingPoint(chartingPoint);
      
      if (i == 0) {
        linePath.moveTo(drawingPoint.x, drawingPoint.y);
        fillPath.lineTo(drawingPoint.x, drawingPoint.y);
      } else {
        linePath.cplineTo(drawingPoint.x, drawingPoint.y, opt.line.curve);
        fillPath.cplineTo(drawingPoint.x, drawingPoint.y, opt.line.curve);
      }
      
      var dotExists = false, dot;
      if (isSingle) {
        dot = shapes.dots[i];
        if (dot) dotExists = true;
      }
      
      // If the dot exists, remember the values, and we'll animate later.
      if (dotExists) {
        dot._drawingPoint = drawingPoint;
      } else {
        // Draw the dot.
        dot = R.circle(drawingPoint.x, drawingPoint.y, opt.dot.radius);          
        datasetLayer.push(dot);
        shapes.dots.push(dot);
        dot.attr({
          fill:   opt.dot.color || lineColor,
          stroke: opt.dot.stroke
        });
      }
      
      // Either way, update its colors immediately.

    } // for
    
    // Now we've plotted all the points.
    
    // Since the fill path is drawing a shape, not just a line, we need
    // to close the path.
    fillPath.lineTo(origin.x + grid.width, origin.y).andClose();
    
    if (alreadyDrawn) {
      // The line, fill, and dots already exist, so we'll animate them
      // to their new values.
      var dPoint, dot;
      var _callback = function() {
        for (var j = 0; j < shapes.dots.length; j++)
          shapes.dots[j].show();
      };
      
      // Decide whether we're animating or just setting the new attributes.
      if (animate) {
        line.toFront().animate({
          path: linePath.toString()
        }, opt.animate.duration * 1000, opt.animate.easing);
        fill.toFront().animate({
          path: fillPath.toString()
        }, opt.animate.duration * 1000, opt.animate.easing, _callback);
      } else {
        line.attr({ path: linePath.toString() });
        fill.attr({ path: fillPath.toString() });
      }      
      
      for (var j = 0; j < shapes.dots.length; j++) {
        dot = shapes.dots[j];
        if (animate) {
          // If we're animating, hide the dots until the animation is done
          // (at which point they'll be shown again by the callback).
          dot.toFront().hide();
        }
        dPoint = dot._drawingPoint;
        dot.attr({
          cx: dPoint.x,
          cy: dPoint.y
        });
      }
    } else {
      // Now we've built path strings for both the fill and the line. Apply
      // them to the Raphael shapes.
      line.attr({
        path: linePath.toString(),
        'stroke':          lineColor,
        'stroke-width':    opt.line.width,
        'stroke-linejoin': 'round'
      });
      fill.attr({
        path: fillPath.toString(),
        fill:    fillColor,
        opacity: opt.fill.opacity,
        stroke:  'none'
      });
          
      // We want the fill to appear _behind_ the line, so that the bottom
      // half of the line isn't obscured.
      fill.insertBefore(line);
      this._dataLayer.push(datasetLayer);
    }
  },
  
  _drawXAxisLabels: function(dataset) {
    var data = dataset.toArray(), datum, label;    
    var opt  = this.options;
    var grid = this._gridSpec;  
    var textLayer = this._layerSet.get('text');
    
    var labelPointerX = 1, labelBoxHeight = 0, xAxisLabelBox, text;
    for (var i = 0; i < data.length; i++) {
      datum = data[i];
      label = opt.grid.labelX(datum.label);
      // Skip drawing the label if the options call for it.
      if (labelPointerX++ % opt.grid.labelXFrequency === 0) {
        labelBoxHeight = window.parseInt(opt.text.font.size, 10);
        xAxisLabelBox = this._chartingBoxToDrawingBox({
          x: (grid.xStepPixels * i) - grid.xStepPixels / 2,
          y: -5 - labelBoxHeight,
          height: labelBoxHeight,
          width:  grid.xStepPixels
        });
        
        text = new Krang.Text(datum.label, {
          box: xAxisLabelBox,
          align: 'center',
          font: {
            family: opt.text.font.family,
            size:   opt.text.font.size,
            color:  opt.text.color
          }
        }).draw(this.R);
        textLayer.push(text);
      }
    }
  },
  
  _drawUILayer: function() {
    // Create a set of invisible rectangles to serve as UI regions for the
    // grid columns.
    var R = this.R, grid = this._gridSpec;
    this._uiLayer = R.set();
    this._layerSet.set('ui', this._uiLayer);
    
    var grid = this._gridSpec;
    
    // Create the column regions for the UI layer.
    // REMEMBER that these columns are _centered_ on the gridlines, since
    // that's where the dots are, so the first and last columns will be
    // half their ordinary size.
    var columnCBox, columnDBox, columnRect;
    for (var i = 0; i < this._dataLength; i++) {
      // Create an invisible, roughly-square box that will serve as the
      // hover zone for this column.
      columnCBox = {
        x: (grid.xStepPixels * i) - (grid.xStepPixels / 2),
        y: 0,
        width:  grid.xStepPixels,
        height: grid.height
      };

      if (i === 0) {
        columnCBox.x += (grid.xStepPixels / 2);
      }

      // The first and last columns.
      if (i === 0 || i === (this._dataLength - 1)) {
        columnCBox.width = grid.xStepPixels / 2;
      }

      columnDBox = this._chartingBoxToDrawingBox(columnCBox);
      columnRect = R.rect(
        columnDBox.x,
        columnDBox.y,
        columnDBox.width,
        columnDBox.height
      ).attr({
        stroke: '#000',
        fill:   '#fff',
        opacity: 0
      });

      // Make the regions visible when we're debugging.
      if (Krang.$debug) {
        columnRect.attr({ opacity: 0.5 });
      }

      this._uiLayer.push(columnRect);

      columnRect.store('columnIndex', i);
      this._createObservers(columnRect);
    }
  }, // #drawUILayer
  
  _animateDataset: function(dataset) {
    this._activeDataset = dataset;
    this._drawDataset(dataset, 0, true);
  },
  
  _createObservers: function(node) {
    var canvas = this.canvas;
    
    var over = function() {
      canvas.fire('krang:mouseover', node.getStorage().toObject());
    };
    
    var out = function() {
      canvas.fire('krang:mouseout', node.getStorage().toObject());
    };
    
    var click = function() {
      canvas.fire('krang:click', node.getStorage().toObject());
    };
    
    node.mouseover(over);
    node.mouseout(out);
    node.click(out);
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