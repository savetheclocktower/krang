/**
 *  class Chart.Area < Chart.Base
 *  
 *  An abstract class containing common logic for line and bar charts.
**/

Chart.Area = Class.create(Chart.Base, {
  _drawGrid: function() {
    var opt = this.options, R = this.R, g = opt.gutter;        
    var og = opt.grid, v = og.vertical, h = og.horizontal;
    
    var gridSpec = this._getGridSpec();
    
    // Do a separate background fill before creating the grid.
    var bg = R.rect(
      g.left,         // x
      g.top,          // y
      gridSpec.width, // width
      gridSpec.height // height
    ).attr({ fill: og.backgroundColor });
    
    this._layerSet.set('background', bg);

    // Now draw the grid. Thankfully, Raphael has a convenience method
    // for this.
    var grid = R.drawGrid(
      g.left,           // x
      g.top,            // y
      gridSpec.width,   // width
      gridSpec.height,  // height
      gridSpec.xSteps,  // columns
      gridSpec.ySteps,  // rows
      og.color          // color of gridlines
    );
    
    this._layerSet.set('grid', grid);
    
    // Outer frame.
    var frame = R.rect(
      g.left,           // x
      g.top,            // y
      gridSpec.width,   // width
      gridSpec.height   // height
    ).attr({
      'stroke':       opt.border.color,
      'stroke-width': opt.border.width
    });
    
    this._layerSet.set('frame', frame);
  },
  
  _chartingPointToDrawingPoint: function(point) {
    var drawPoint = Object.clone(point);
    var opt = this.options, g = opt.gutter;
    
    // X is easy. Just add the left gutter.
    drawPoint.x += g.left;
    
    // Y is harder because we have to invert the scale.
    var gridHeight = opt.height - (g.top + g.bottom);
    
    // Invert...
    drawPoint.y = gridHeight - point.y;
    
    // ...then factor in the top gutter.
    drawPoint.y += g.top;
    
    return drawPoint;
  },

  // Converts charting coordinates (with origin at bottom-left of graph)
  // to drawing coordinates (with origin at top-left of canvas).
  _chartingBoxToDrawingBox: function(box) {
    var drawBox = Object.clone(box);
    var opt = this.options, g = opt.gutter;
    
    // X is easy. Just add the left gutter.
    drawBox.x += g.left;
    
    // Y is harder because we have to invert the scale.
    var gridHeight = opt.height - (g.top + g.bottom);
    
    // Invert...
    drawBox.y = gridHeight - box.y;
    
    // ...then factor in the top gutter.
    drawBox.y += g.top;

    // Rectangles still start at top-left.
    drawBox.y -= box.height;
    
    return drawBox;
  },
  
  _getGridSpec: function(options) {
    if (this._gridSpec) return this._gridSpec;
    
    var opt = this.options, R = this.R, g = opt.gutter;        
    var og = opt.grid, v = og.vertical, h = og.horizontal;
       
    this._gridSpec = {
      // A graph has as many X steps as it has unique data points
      // (for the independent variable). But Y steps are somewhat
      // arbitrary.
      xSteps:  this._datasets.first().dataLength(),
      ySteps:  og.horizontal.enabled ? og.horizontal.lines : 0,
    
      // The pixel dimensions of the grid. This is the size of the graph's
      // plottable area.
      width:   opt.width  - (g.left + g.right ),
      height:  opt.height - (g.top  + g.bottom)
    };
    
    // Any of the values above can be overridden with the `options` argument.
    Object.extend(this._gridSpec, options);

    // Each X- and Y-step will, therefore, be a fixed size.
    Object.extend(this._gridSpec, {
      xStepPixels: this._gridSpec.width  / this._gridSpec.xSteps,
      yStepPixels: this._gridSpec.height / this._gridSpec.ySteps
    });    
    
    return this._gridSpec;
  },
  
  _drawYAxisLabels: function(max) {
    var grid = this._getGridSpec(), opt = this.options, g = opt.gutter;
    var R = this.R, textLayer = this._layerSet.get('text');
    
    // Draw Y-axis labels.
    var yAxisLabelValue, yAxisLabelText, yAxisLabelTextBox,
     yAxisLabelPixelHeight;    
    
    var $yToValue = function(y) {
      return y / (grid.height / max);
    };

    var labelPointerY = 1, text;
    // Draw one Y-axis label for each horizontal gridline.
    for (var j = 0; j <= grid.ySteps; j++) {
      // Skip drawing the label if the options call for it.
      if (labelPointerY++ % opt.grid.labelYFrequency !== 0)
        continue;
      
      yAxisLabelPixelHeight = grid.yStepPixels * j;      
      yAxisLabelValue       = $yToValue(yAxisLabelPixelHeight);
      yAxisLabelText        = opt.grid.labelY(yAxisLabelValue);      
      
      yAxisLabelTextBox = this._chartingBoxToDrawingBox({
        width:  g.left - 10,
        height: grid.yStepPixels,
        x:      5 - g.left,
        y:      yAxisLabelPixelHeight - (grid.yStepPixels / 2)
      });
      
      text = new Krang.Text(yAxisLabelText, {
        box: yAxisLabelTextBox,      
        align: 'right',        
        font: {
          family: opt.text.font.family,
          size:   opt.text.font.size,
          color:  opt.text.color
        }
      }).draw(R);
      textLayer.push(text);
    }
  }
});

Object.extend(Chart.Area, {
  DEFAULT_OPTIONS: {
    /* 
     *  How much space to leave around the chart itself. There are non-zero
     *  defaults here to leave room for axis labels.
     */ 
    gutter: {
      top:    20,
      bottom: 30,
      left:   100,
      right:  30
    },
    
    /* The chart's grid. */
    grid: {               
      color: '#eee',      /* Color of the gridlines. */
      backgroundColor: '#fff',
      
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
    
    /* Border around the chart itself. */    
    border: {           
      color: '#bbb',
      width: 1
    }    
  }
});
