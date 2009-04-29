

Chart.Bar = Class.create(Chart.Base, {
  initialize: function($super, canvas, options) {
    $super(canvas);
    this.setOptions(options);
    this.R = Raphael(canvas, this.options.width, this.options.height);
  },
  
  draw: function() {
    if (!this._dataset) {
      throw new Krang.Error("No dataset!");
    }
    
    var opt = this.options, R = this.R, g = opt.gutter;
    
    var max;
    
    if (opt.grid.maxY === 'auto') {
      max = this._dataset.maxValuesSum();
    } else {
      max = opt.grid.maxY;
    }
    
    // Width of each bar.
    var xScale = (opt.width - (g.left + g.right)) / 
     (this._dataset.dataLength());
     
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
    R.rect(
      g.left,
      g.top,
      opt.width  - (g.left + g.right),
      opt.height - (g.top + g.bottom)
    ).attr({ stroke: opt.border.color });
    
    var barTotals = [];
    var label, value, x = 0, y, rect, startingY;
    
    var $color = opt.bar.color;
    if (opt.bar.color instanceof Krang.Colorset) {
      opt.bar.color.setLength(this._dataset.size());
    }
    
    function plotDataset(dataset, index) {
      var data = dataset.toArray();
      var color = $color.toString();
      

      for (var i = 0, l = data.length; i < l; i++) {
        label = data[i].label, value = data[i].value;
        
        y = Math.round((yScale * value));
        x = Math.round(g.left + (xScale * i));
        
        // Because the bars stack in the case of multiple datasets, we have to
        // keep track of the total height of each bar.
        if (Object.isUndefined(barTotals[i])) {
          startingY = 0;
          barTotals[i] = y;
        } else {
          startingY = barTotals[i];
          barTotals[i] += y;
        }
        
        barWidth = Math.round(xScale - opt.bar.gutter);
        
        var attrs = {
          fill:    color,
          opacity: opt.bar.opacity,
          stroke: 'none'
        };
        
        if (opt.bar.border.width > 0) {
          
          var borderColor = opt.bar.border.color;
          
          borderColor = (borderColor === 'auto') ?
            Krang.Color.fromString(color).darkerBy(0.05).toHexString() :
            Colorset.interpret(borderColor);
            
          Object.extend(attrs, {
            'stroke':       borderColor,
            'stroke-width': opt.bar.border.width
          });
        }
        
        var colorObj = Krang.Color.fromString(color);
        
        var gradient = {
          type: 'linear',
          dots: [
            { color: colorObj.lighterBy(0.05).toHexString() },
            { color: colorObj.darkerBy( 0.05).toHexString() }
          ],
          vector: [0, 0, '100%', 0]
        };
        
        
        // Draw the bar.
        R.rect(
          Math.round(x + (opt.bar.gutter / 2)),
          (g.top + yRange) - y - startingY,
          barWidth,
          y
        ).attr(attrs).attr({ gradient: gradient });
        
        // Only draw X-axis labels for the first set.
        if (!index) {
          var textStartY = g.top + yRange + Math.round(g.bottom / 2);

          var text = R.text(x, textStartY, label).attr({
            font: '#{0} #{1}'.interpolate([opt.text.fontSize, opt.text.fontFamily]),
            stroke: 'none',
            fill: opt.text.color          
          });

          var textWidth = text.getBBox().width;
          var textX = Math.round(barWidth / 2);
          
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
        font: '#{0} #{1}'.interpolate([opt.text.fontSize, opt.text.fontFamily]),
        stroke: 'none',
        fill: opt.text.color          
      });
      
      // fake right-alignment
      var textWidth = text.getBBox().width;
      var textX = g.left - 10 - textWidth;
      
      text.attr({ x: textX, 'text-anchor': 'start' });
    }
    
    
    if (this._dataset instanceof Dataset.Multiple) {
      this._dataset.each(plotDataset, this);
    } else {
      plotDataset(this._dataset);
    }    
  }
});


Object.extend(Chart.Bar, {
  DEFAULT_OPTIONS: {
    width:  800,
    height: 300,
    bar: {
      color: new Krang.Colorset({
        vary: 'l',
        hue: 0.25,
        saturation: 0.6
      }),
      border: {
        width: 0,
        color: 'auto'
      },
      gutter: 5,
      opacity: 1.0
    },
    
    fill: {
      color: '#039',
      opacity: 0.3
    },
    
    gutter: {
      top:    20,
      bottom: 30,
      left:   100,
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
      labelY: Prototype.K,
      
      maxY: 'auto'
    },
    
    border: {
      color: '#999'
    },
    
    text: {
      fontFamily: '"Lucida Grande"',
      fontSize:   '12px',
      color:      "#000"
    }
  }
});