
/**
 *  class Chart.Bar < Chart.Base
 *  
 *  A class for drawing bar charts.
**/
Chart.Bar = Class.create(Chart.Base, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);
    this.canvas = canvas;
    this.R = Raphael(this.canvas, this.options.width, this.options.height);
  },
  
  /**
   *  Chart.Bar#draw() -> undefined
   *  
   *  Draws the chart.
  **/
  draw: function() {
    this.clear();
    
    if (this._datasets.length === 0) {
      throw new Krang.Error("No datasets!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter;
    
    var max;
    
    if (opt.grid.maxY === 'auto') {
      if (opt.stack) {
        max = Math.sum.apply(Math, this._datasets.invoke('maxValue'));
      } else {
        max = Math.max.apply(Math, this._datasets.invoke('maxValue'));
      }
    } else {
      max = opt.grid.maxY;
    }
    
    // Width of each bar.
    var xScale = (opt.width - (g.left + g.right)) / 
     (this._datasets.first().dataLength());
     
    // Vertical scale of chart.
    var yRange = opt.height - (g.top + g.bottom);    
    var yScale = yRange / max;
    
    var columns = opt.grid.vertical.enabled   ? opt.grid.vertical.lines   : 0;
    var rows    = opt.grid.horizontal.enabled ? opt.grid.horizontal.lines : 0;
    
    // Draw the background grid.
    R.drawGrid(
      g.left,                           /* X                 */
      g.top,                            /* Y                 */
      opt.width  - (g.left + g.right),  /* width             */
      opt.height - (g.top + g.bottom),  /* height            */
      columns,                          /* number of columns */
      rows,                             /* number of rows    */
      opt.grid.color                    /* color             */
    );
    
    // Draw the outer frame.
    var frame = R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({
      'stroke':       opt.border.color,
      'stroke-width': opt.border.width
    });
    
    var barTotals = [];
    var label, value, x = 0, y, rect, startingY, barX, barY;
    
    var $color = opt.bar.color;
    if (opt.bar.color instanceof Krang.Colorset) {
      opt.bar.color.setLength(this._datasets.length);
    }
    
    function plotDataset(dataset, index) {
      var data = dataset.toArray();
      var color = $color.toString();
      

      for (var i = 0, l = data.length; i < l; i++) {
        label = data[i].label, value = data[i].value;
        
        y = Math.round((yScale * value) - (opt.bar.border.width));
        x = Math.round(g.left + (xScale * i));
        
        // Because the bars may stack in the case of multiple datasets, we
        // have to keep track of the total height of each bar.
        if (Object.isUndefined(barTotals[i])) {
          startingY = 0;
          barTotals[i] = y;
        } else {
          startingY = barTotals[i];
          barTotals[i] += y;
        }
        
        
        textBoxWidth = Math.round(xScale - opt.bar.gutter);
        if (opt.stack) {
          barWidth = textBoxWidth;
        } else {
          barWidth = Math.round(
           (xScale - opt.bar.gutter) / this._datasets.length);
        }
        
        var attrs = {
          fill:    color,
          opacity: opt.bar.opacity,
          stroke: 'none'
        };
        
        if (opt.bar.border.width > 0) {
          var borderColor = opt.bar.border.color;
          
          borderColor = (borderColor === 'auto') ?
            Krang.Color.fromString(color).darkerBy(0.05).toHexString() :
            Krang.Colorset.interpret(borderColor);
            
          Object.extend(attrs, {
            'stroke':       borderColor,
            'stroke-width': opt.bar.border.width
          });
        }
        
        var colorObj = Krang.Color.fromString(color);
        
        var gradient = Object.clone(opt.bar.gradient);
        gradient.dots = opt.bar.gradient.dots(colorObj);
                
        barY = opt.stack ? startingY : 0;
        barX = opt.stack ? (x + (opt.bar.gutter / 2)) : 
          x + (opt.bar.gutter / 2) + (barWidth * index);
        
        
        // Draw the bar.
        R.rect(
          barX,
          (g.top + yRange) - y - barY - (opt.bar.border.width / 2),
          barWidth,
          y
        ).attr(attrs).attr({ gradient: gradient });
        
        if (opt.bar.label.enabled) {
          var topOfBar    = (g.top + yRange) - y - barY;
          var bottomOfBar = g.top + yRange;
          var positions = {
            above:  topOfBar - 15,
            top:    topOfBar + 10,
            bottom: bottomOfBar - 10,
            below:  bottomOfBar + 15
          };
          
          var textStartY = positions[opt.bar.label.position] || position.above;
          
          var text = R.text(x, textStartY, opt.bar.label.filter(value)).attr({
            font: '#{0} "#{1}"'.interpolate(
             [opt.bar.label.fontSize, opt.bar.label.fontFamily]),
             stroke: 'none',
             fill: opt.bar.label.color
          });
          
          var textWidth = text.getBBox().width;
          
          // TODO: Figure out a way to render bar labels correctly
          // on stacked bar charts.
          var textX;
          if (opt.stack) {
            textX = Math.round(barWidth / 2);
          } else {
            textX = (index * barWidth) + Math.round(barWidth / 2);
          }
          
          text.attr({ x: Math.round(x + textX + (opt.bar.gutter / 2)) });          
        }
        
        
        // Only draw X-axis labels for the first set.
        if (!index) {
          textStartY = g.top + yRange + Math.round(g.bottom / 2);

          text = R.text(x, textStartY, label).attr({
            font: '#{0} #{1}'.interpolate([opt.text.fontSize, opt.text.fontFamily]),
            stroke: 'none',
            fill: opt.text.color          
          });

          textWidth = text.getBBox().width;
          textX     = Math.round(textBoxWidth / 2);
          
          text.attr({ x: Math.round(x + textX + (opt.bar.gutter / 2)) });
        }
      }
    }
    
    // Draw Y-axis labels.
    var yStart = g.bottom, yEnd = opt.height - g.top;
    
    
    var value, yLabel, yPlot, text;
    for (var j = 0, yLabel; j <= rows; j++) {
      value = (j / rows) * max;
      yLabel = opt.grid.labelY(value);
      yPlot = yStart + ((j * yRange) / rows);
      
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
        
    this._datasets.each(plotDataset, this);
    
    frame.toFront();
  }
});


Object.extend(Chart.Bar, {
  DEFAULT_OPTIONS: {
    width:  800,
    height: 300,
    bar: {
      /*  
       *  Color of the bar. Can be a string or a `Colorset`; if the latter,
       *  a new color will be retrieved from the set for each dataset in the
       *  chart.
       */ 
      color: new Krang.Colorset({
        vary: 'l',
        hue: 0.25,
        saturation: 0.6
      }),

      /*
       *  Border of the bar. If `color` is set to `auto`, the border will be a
       *  slightly-darker shade of the bar's fill color.
       */ 
      border: {
        width: 0,
        color: 'auto'
      },
      
      /*
       *  How much space to leave on either side of a bar (or bar group).
       */ 
      gutter: 5,
      opacity: 1.0,
      
      /*
       *  If enabled, will place a text label on a bar that shows the bar's
       *  value. The `position` can be one of `above`, `below`, `top`, or 
       *  `bottom`. The `filter` callback can alter the value for display.
       */       
      label: {
        enabled:    false,
        position:   'above',
        fontFamily: 'Lucida Grande',
        fontSize:   '12px',
        color:      "#000",
        filter:     Prototype.K
      },
      
      /*
       *  A gradient to apply to the bar.
       */       
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
    
    /* Border around the chart itself. */    
    border: {           
      color: '#bbb',
      width: 1
    },
    
    text: {
      fontFamily: 'Lucida Grande',
      fontSize:   '12px',
      color:      "#000"
    },
    
    stack: false
  }
});